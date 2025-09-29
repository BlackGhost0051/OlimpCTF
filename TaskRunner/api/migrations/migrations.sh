#!/bin/bash

DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin_password
DB_NAME=db

echo "Migrations menu:"


echo "1) Create all tables"
echo "2) Drop all tables"
echo "3) Create test data"
echo "4) Exit"

read -p "Enter your choice: " choice

if [[ ! $choice =~ ^[1-4]$ ]]; then
    echo "Invalid choice. Please enter a number between 1 and 4."
    exit 1
fi


if [ "$choice" -eq 1 ]; then
    echo "Creating all tables..."
    sudo "$(pwd)/sql/tables/create_all_tables.sh" "$DB_HOST" "$DB_PORT" "$DB_USER" "$DB_PASSWORD" "$DB_NAME"
elif [ "$choice" -eq 2 ]; then
    echo "Dropping all tables..."
    sudo "$(pwd)/sql/tables/drop_all_tables.sh" "$DB_HOST" "$DB_PORT" "$DB_USER" "$DB_PASSWORD" "$DB_NAME"
elif [ "$choice" -eq 3 ]; then
    echo "Creating test data..."
    sudo "$(pwd)/sql/data/create_test_data.sh" "$DB_HOST" "$DB_PORT" "$DB_USER" "$DB_PASSWORD" "$DB_NAME"
fi


if [ "$choice" -eq 4 ]; then
    echo "Exiting..."
    exit 0
fi