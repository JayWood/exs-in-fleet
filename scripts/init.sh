#!/bin/bash

# Directory containing CSV files
CSV_DIR="/tmp/csvFiles"

# MongoDB connection settings
MONGO_HOST="localhost"
MONGO_PORT="27017"
DATABASE_NAME="local"

# Ensure mongoimport is available
if ! command -v mongoimport &> /dev/null; then
    echo "Error: mongoimport is not installed. Please install mongodb-database-tools package."
    exit 1
fi

# Loop through all CSV files in the directory
for csv_file in "$CSV_DIR"/*.csv; do
    if [ -f "$csv_file" ]; then
        # Get filename without extension and directory path
        filename=$(basename "$csv_file" .csv)
        
        echo "Importing $filename..."
        
        # Import the CSV file into MongoDB
        mongoimport --host "$MONGO_HOST" --port "$MONGO_PORT" \
            --db "$DATABASE_NAME" \
            --collection "$filename" \
            --type csv \
            --headerline \
            --file "$csv_file" \
            --drop

        if [ $? -eq 0 ]; then
            echo "Successfully imported $filename"
        else
            echo "Failed to import $filename"
        fi
    fi
done

echo "Import process completed!"