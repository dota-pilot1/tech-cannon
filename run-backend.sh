#!/bin/bash

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Run Spring Boot application
cd parantier-api
./gradlew bootRun
