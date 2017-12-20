# River-Level-Database
Sqlite database to save water values from the USGS restful API. Cron job inserts values into the database. Nodejs server provides an API for access to the database values.

## Deployment
Master branch is the production environment. Other branches are experimental versions of the insertion backend.

## Hardware
Designed to be run on a Raspberry Pi 2 using a crontab entry.
