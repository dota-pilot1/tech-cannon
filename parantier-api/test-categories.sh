#!/bin/bash
echo "Testing /api/categories endpoint..."
curl -s http://localhost:8080/api/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXJlY2FsQGRhdW0ubmV0Iiwicm9sZSI6IlJPTEVfQURNSU4iLCJpYXQiOjE3MTE5NjY4NjQsImV4cCI6MTcxMjA1MzI2NH0.xBxFpq7kZM0gqV5C7d0gYZo_pV5Rq5C5bN1NqJoYqGk" \
  -H "Content-Type: application/json" | jq '.'
