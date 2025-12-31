#!/bin/bash

# Company Settings API Test Script
# Make sure your server is running before executing this script

echo "🏢 Testing Company Settings API"
echo "==============================="

# Set your API base URL
API_BASE="http://localhost:5000/api/v1"

# First, login as admin to get auth token
echo "📋 Step 1: Getting admin authentication..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com", 
    "password": "admin123"
  }')

# Extract token (requires jq for JSON parsing)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token. Make sure admin credentials are correct."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Authentication successful"

# Test 1: Initialize company defaults
echo ""
echo "🏗️  Step 2: Initialize company default settings..."
curl -s -X POST "$API_BASE/settings/company/initialize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 2: Get company profile
echo ""
echo "🏢 Step 3: Get company profile..."
curl -s -X GET "$API_BASE/settings/company/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 3: Update company profile
echo ""
echo "📝 Step 4: Update company profile..."
curl -s -X PUT "$API_BASE/settings/company/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amazing Tech Solutions",
    "email": "contact@amazingtech.com",
    "phone": "+1-555-0123",
    "address": "123 Tech Street, Innovation City",
    "website": "https://amazingtech.com"
  }' | jq '.'

# Test 4: Get working hours
echo ""
echo "⏰ Step 5: Get working hours..."
curl -s -X GET "$API_BASE/settings/company/working-hours" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 5: Update working hours
echo ""
echo "🕘 Step 6: Update working hours..."
curl -s -X PUT "$API_BASE/settings/company/working-hours" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "09:30",
    "endTime": "17:30",
    "breakDuration": 45,
    "gracePeriod": 10
  }' | jq '.'

# Test 6: Get working days
echo ""
echo "📅 Step 7: Get working days..."
curl -s -X GET "$API_BASE/settings/company/working-days" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 7: Update working days
echo ""
echo "📋 Step 8: Update working days (add Saturday)..."
curl -s -X PUT "$API_BASE/settings/company/working-days" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }' | jq '.'

# Test 8: Add holidays
echo ""
echo "🎉 Step 9: Add company holidays..."
curl -s -X POST "$API_BASE/settings/company/holidays" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-01",
    "name": "New Year Day"
  }' | jq '.'

curl -s -X POST "$API_BASE/settings/company/holidays" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-25",
    "name": "Christmas Day"
  }' | jq '.'

# Test 9: Get holidays
echo ""
echo "🏖️  Step 10: Get all holidays..."
curl -s -X GET "$API_BASE/settings/company/holidays" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 10: Check working day
echo ""
echo "🔍 Step 11: Check if dates are working days..."
curl -s -X GET "$API_BASE/settings/company/check-working-day/2025-01-01" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

curl -s -X GET "$API_BASE/settings/company/check-working-day/2025-01-02" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 11: Get complete company schedule
echo ""
echo "📋 Step 12: Get complete company schedule..."
curl -s -X GET "$API_BASE/settings/company/schedule" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "🎉 Company settings test completed!"
echo "💡 Check your database to see the stored settings"
echo "🔧 These settings will now be used by the attendance system"