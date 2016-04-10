#!/bin/bash

pgsql=`docker ps -a |grep bookkeeping-pgsql |awk '{ print $1 }'`
httpd=`docker ps -a |grep bookkeeping-httpd |awk '{ print $1 }'`

if [ -z "`docker ps |grep bookkeeping-pgsql |awk '{ print $1 }'`" ]
then
	if [ -z "$pgsql" ]
	then
	docker run -d -e DBNAME='db' -e DBUSER='root:password' -p 3041:5432 --name bookkeeping-pgsql -i -t pgsql-9.4
	else
	docker start $pgsql
	fi
fi

if [ -z "`docker ps |grep bookkeeping-httpd |awk '{ print $1 }'`" ]
then
	if [ -z "$httpd" ]
	then
	docker run -d -p 2041:80 --privileged -v `pwd`:/var/www/html --link bookkeeping-pgsql -i -t bookkeeping-httpd
	else
	docker start $httpd
	fi
fi
