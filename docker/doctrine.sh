#!/bin/bash
command='cd /var/www/html && ./vendor/bin/doctrine '$@
docker exec -it `docker ps |grep bookkeeping-httpd |awk '{ print $1 }'|tail -n+1` sh -c "$command"
