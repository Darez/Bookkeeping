#!/bin/bash

docker rm -f `docker ps -a |grep bookkeeping |awk '{ print $1 }'|tail -n+1`
