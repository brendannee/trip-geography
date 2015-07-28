var _ = require('underscore');
var debug = require('debug')('trip-geography');
var nconf = require('nconf');
var restify = require('restify');
var polyline = require('polyline');
var postgres = require('./postgres');
var util = require('util');


nconf.argv().file({file: './config.json'}).env();


var server = restify.createServer({
  name: 'trip-geography',
  version: '1.0.0',
  url: 'trip-geography.herokuapp.com'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.use(restify.fullResponse());


function encodedPathsToLineString(encodedPaths) {
  var decodedPaths = encodedPaths.map(function(encodedPath) {
    var decodedPath = polyline.decode(encodedPath);

    var sampledPath = _.reduce(decodedPath, function(memo, point, idx) {
      // only use every 10th point
      if (idx === 1 || idx % 10 === 0 || idx === (decodedPath.length - 1)) {
        memo.push(point);
      }
      return memo;
    }, []);

    return '(' + sampledPath.map(function(point) {
      return point[1] + ' ' + point[0];
    }).join(',') + ')';
  }).join(',');

  return 'SRID=4269;MULTILINESTRING(' + decodedPaths + ')';
}

server.get('/', function(req, res, next) {
  return next(new restify.MethodNotAllowedError('Use POST'));
});


server.post('/', function (req, res, next) {
  var encodedPaths = req.body;

  if (!encodedPaths || !encodedPaths.length) {
    return next(new restify.UnprocessableEntityError('Invalid array of paths'));
  }

  var multilinestring = encodedPathsToLineString(encodedPaths);

  postgres('counties', [multilinestring], function(e, results) {
    if (e) {
      debug(e);
      return next(new restify.InternalServerError(e));
    }

    if (results && results.rows) {
      res.send(results.rows);
      return next();
    } else {
      return next(new restify.InternalServerError());
    }
  });
});


server.on('uncaughtException', function (req, res, route, error) {
  debug(error);
  res.send(new restify.InternalServerError());
});


server.listen(process.env.PORT || 8000, function () {
  debug('%s listening at %s', server.name, server.url);
});
