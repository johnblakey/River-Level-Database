#!/bin/bash -e

# Created by John Blakey 12-16-2017
# Description: run insert.js to insert new values into 
# sqlite database on the Raspberry Pi.

now="$(date +'%d/%m/%Y_%H-%M-%S')"

# insert river level values into sqlite db
# For debugging change the '>' to '>>' record all entries in the file
nodejs ~/Development/Production/River-Level-Database/nodejsInsert/insert.js > /home/jb/Logs/insert.log 

printf '%s\n' "--------------------------------------------------" >> /home/jb/Logs/insert.log
printf "Completed levels insertion at $now\n\n" >> /home/jb/Logs/insert.log
printf "========================================================\n" >> /home/jb/Logs/insert.log

