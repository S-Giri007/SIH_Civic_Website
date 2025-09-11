#!/bin/bash

# CivicPortal API Test Script
# Usage: ./test-api.sh https://your-app-name.onrender.com

if [ -z "$1" ]; then
    echo "Usage: $0 <base-url>"
    echo "Example: $0 https://your-app-name.onrender.com"
    exit 1
fi

BASE_URL=$1
API_URL="$BASE_URL/api"

echo "🚀 Testing CivicPortal API at: $BASE_URL"
echo "================================================"

# Test 1: Health Check
echo "1. Testing Health Check..."
response=$(curl -s -w "%{http_code}" "$BASE_URL/health")
http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed (HTTP $http_code)"
fi
echo ""

# Test 2: Get Issues (should work even with empty database)
echo "2. Testing Get Issues..."
response=$(curl -s -w "%{http_code}" "$API_URL/issues")
http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ Get issues endpoint working"
else
    echo "❌ Get issues failed (HTTP $http_code)"
fi
echo ""

# Test 3: Create Issue
echo "3. Testing Create Issue..."
response=$(curl -s -w "%{http_code}" -X POST "$API_URL/issues" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Test Issue from Script",
        "description": "Automated test issue",
        "category": "road",
        "location": "Test Street",
        "locationCoordinates": {"lat": 40.7128, "lng": -74.0060},
        "citizenName": "Test User",
        "citizenContact": "test@example.com"
    }')
http_code="${response: -3}"
if [ "$http_code" = "201" ]; then
    echo "✅ Create issue successful"
else
    echo "❌ Create issue failed (HTTP $http_code)"
fi
echo ""

# Test 4: Register User
echo "4. Testing User Registration..."
response=$(curl -s -w "%{http_code}" -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser_'$(date +%s)'",
        "password": "testpass123",
        "name": "Test User",
        "email": "test'$(date +%s)'@example.com",
        "role": "citizen"
    }')
http_code="${response: -3}"
if [ "$http_code" = "201" ]; then
    echo "✅ User registration successful"
else
    echo "❌ User registration failed (HTTP $http_code)"
fi
echo ""

# Test 5: Get Statistics
echo "5. Testing Issue Statistics..."
response=$(curl -s -w "%{http_code}" "$API_URL/issues/stats/overview")
http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ Statistics endpoint working"
else
    echo "❌ Statistics failed (HTTP $http_code)"
fi
echo ""

echo "================================================"
echo "🏁 API testing completed!"
echo ""
echo "Next steps:"
echo "- Test the frontend at your Vercel URL"
echo "- Create some test data through the UI"
echo "- Test officer login functionality"