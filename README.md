# Trip Geography

This is a node.js api that accepts an array of [encoded polylines](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) and returns a list of US counties that they intersect.  The response also includes the US state for each county.

For example, you can turn this:

    cqepF~dgzUd@~BqDvA_C|@qCdAmBx@YLORg@sC[kB{Bz@yChAwEzAoC~@{@^m@P

into this:

    [
      {
        "county": "Washoe",
        "state": "Nevada",
        "id": "32031"
      }
    ]

This project uses [restify](https://github.com/restify/node-restify) and [postgis](http://postgis.net/).

## Setup

### Collect Data
Download [US Counties](https://www.census.gov/geo/maps-data/data/cbf/cbf_counties.html)

Download [US States](https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html)

### Setup database

Create a database called `trip_geography`

    CREATE DATABASE trip_geography;

Enable POSTGIS:

    CREATE EXTENSION postgis;

### Import Data

Using `shp2pgsql`.

County:

    shp2pgsql -W LATIN1 -d -s 4269 cb_2014_us_county_500k/cb_2014_us_county_500k counties | psql trip_geography

State:

    shp2pgsql -W LATIN1 -d -s 4269 cb_2014_us_state_500k/cb_2014_us_state_500k states | psql trip_geography

### Create Configuration File

Copy `config-sample.json` to `config.json`.  Add postgres credentials as `POSTGRES_URL`.

## Run server locally

    DEBUG=trip-geography npm start

## Example request

    curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '["cqepF~dgzUd@~BqDvA_C|@qCdAmBx@YLORg@sC[kB{Bz@yChAwEzAoC~@{@^m@P","qq`nFvv~yU@{FcGAyKAkF?sCABdDA|F@rAw@AeA?iDAkHAuXI}DBIKc@@{ALiBZuAZ{Bt@sAj@kB~@yKpFyIrEcI~DyIpEkCtAqAp@IEGmM@sByB@iE?{IG]|@?xF?vB@xG?pHDn@pHwDtAs@"]' http://localhost:8000

Response:

    [
      {
        "county": "Washoe",
        "state": "Nevada",
        "id": "32031"
      },
      {
        "county": "Carson City",
        "state": "Nevada",
        "id": "32510"
      }
    ]
