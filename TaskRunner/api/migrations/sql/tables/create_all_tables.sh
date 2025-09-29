#!/bin/bash
set -e

DB_HOST=$1
DB_PORT=$2
DB_USER=$3
DB_PASSWORD=$4
DB_NAME=$5

export PGPASSWORD=$DB_PASSWORD

#psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(pwd)/sql/tables/create_users_table.sql"