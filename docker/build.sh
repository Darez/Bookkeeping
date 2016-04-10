#!/bin/bash

docker build -t bookkeeping-httpd docker/httpd/.
docker build -t pgsql-9.4 github.com/Darez/Docker-Postgresql#9.4
