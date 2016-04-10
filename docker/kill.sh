#!/bin/bash

docker kill `docker ps |grep bookkeeping |awk '{ print $1 }' |tail -n+1`
