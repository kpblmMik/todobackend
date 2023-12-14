#!/bin/bash

echo "Resetting SQL DB:"
sudo mysql -u root -p < sql_scripts/99_cleanup_db.sql

echo "Recreating DB/Table and inserting sample data"
sudo mysql -u root -p < sql_scripts/01_setup_db.sql
sudo mysql -u root -p < sql_scripts/02_setup_table.sql
sudo mysql -u root -p < sql_scripts/03_insert_data.sql

