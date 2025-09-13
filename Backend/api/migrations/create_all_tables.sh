#!/bin/bash
set -e

DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin_password
DB_NAME=db

export PGPASSWORD=$DB_PASSWORD

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./sql/tables/create_categories_table.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./sql/tables/create_tasks_table.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./sql/tables/create_users_table.sql