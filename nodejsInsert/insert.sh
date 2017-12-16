#!/bin/bash -e

# Created by John Blakey 12-16-2017
# Description: run insert.js to insert new values into 
# sqlite database on the Raspberry Pi.

now="$(date +'%d/%m/%Y')"

printf "\n==============================\n" >> insert.log
printf "Start db levels insertion at $now\n" >> insert.log

# insert rivel level values into sqlite db
nodejs insert.js >> insert.log

printf "==============================\n" >> insert.log
