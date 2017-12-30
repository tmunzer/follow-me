#!/bin/sh
cd /app/bin
if [ "$1" ]
then
    NODE_ENV="production" PORT=$1 node ./www
else
    PORT=51360 node ./www
fi
