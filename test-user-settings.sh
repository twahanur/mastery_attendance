#!/bin/bash

# Phase 4 - User Management Settings Test Script
# Tests password policies, registration policies, lockout rules, and profile field configuration

echo "🚀 Testing Phase 4 - User Management Settings"
echo "============================================="

BASE_URL="http://localhost:3000/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    response_body=$(echo "$response" | grep -v "HTTP_STATUS:")
    
    if [ "$http_status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $http_status"
        ((TESTS_PASSED++))
        echo "Response: $(echo "$response_body" | jq -c .)"
    else
        echo -e "${RED}❌ FAIL${NC} - Expected: $expected_status, Got: $http_status"
        ((TESTS_FAILED++))
        echo "Response: $response_body"
    fi
}

# Get admin token (you may need to adjust this based on your auth setup)
echo "Getting admin authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@company.com","password":"admin123"}' "$BASE_URL/auth/login")
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get admin token. Make sure admin user exists and credentials are correct.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Admin token obtained${NC}"

echo -e "\n${BLUE}=== PASSWORD POLICY TESTS ===${NC}"

# Test 1: Get current password policy
run_test "Get Password Policy" "GET" "/admin/user-settings/password-policy" "" "200"

# Test 2: Update password policy
run_test "Update Password Policy" "PUT" "/admin/user-settings/password-policy" '{
    "minLength": 10,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSymbols": true,
    "preventCommonPasswords": true,
    "expirationDays": 90
}' "200"

# Test 3: Get password requirements
run_test "Get Password Requirements" "GET" "/admin/user-settings/password-policy/requirements" "" "200"

# Test 4: Validate password
run_test "Validate Strong Password" "POST" "/admin/user-settings/password-policy/validate" '{
    "password": "StrongPass123!",
    "userInfo": {"email": "test@example.com", "name": "Test User"}
}' "200"

# Test 5: Validate weak password
run_test "Validate Weak Password" "POST" "/admin/user-settings/password-policy/validate" '{
    "password": "weak",
    "userInfo": {"email": "test@example.com", "name": "Test User"}
}' "200"

echo -e "\n${BLUE}=== REGISTRATION POLICY TESTS ===${NC}"

# Test 6: Get registration policy
run_test "Get Registration Policy" "GET" "/admin/user-settings/registration-policy" "" "200"

# Test 7: Update registration policy
run_test "Update Registration Policy" "PUT" "/admin/user-settings/registration-policy" '{
    "allowSelfRegistration": false,
    "requireEmailVerification": true,
    "allowedEmailDomains": ["company.com", "example.org"],
    "defaultRole": "EMPLOYEE",
    "requireInvitation": true
}' "200"

# Test 8: Validate email domain
run_test "Validate Allowed Email" "POST" "/admin/user-settings/registration-policy/validate-email" '{
    "email": "user@company.com"
}' "200"

# Test 9: Validate blocked email domain
run_test "Validate Blocked Email" "POST" "/admin/user-settings/registration-policy/validate-email" '{
    "email": "user@blocked.com"
}' "200"

# Test 10: Check registration allowed
run_test "Check Registration Status" "GET" "/admin/user-settings/registration-policy/check?email=test@company.com" "" "200"

echo -e "\n${BLUE}=== LOCKOUT RULES TESTS ===${NC}"

# Test 11: Get lockout rules
run_test "Get Lockout Rules" "GET" "/admin/user-settings/lockout-rules" "" "200"

# Test 12: Update lockout rules
run_test "Update Lockout Rules" "PUT" "/admin/user-settings/lockout-rules" '{
    "enabled": true,
    "maxFailedAttempts": 5,
    "lockoutDurationMinutes": 30,
    "resetFailedAttemptsAfterMinutes": 60,
    "notifyAdminOnLockout": true,
    "progressiveDelay": true
}' "200"

echo -e "\n${BLUE}=== PROFILE FIELD TESTS ===${NC}"

# Test 13: Get profile fields
run_test "Get Profile Fields" "GET" "/admin/user-settings/profile-fields" "" "200"

# Test 14: Add new profile field
run_test "Add Profile Field" "POST" "/admin/user-settings/profile-fields" '{
    "fieldName": "skills",
    "required": false,
    "visible": true,
    "editable": true,
    "fieldType": "textarea",
    "validation": {"maxLength": 500}
}' "200"

# Test 15: Update all profile fields
run_test "Update Profile Fields" "PUT" "/admin/user-settings/profile-fields" '[
    {
        "fieldName": "firstName",
        "required": true,
        "visible": true,
        "editable": true,
        "fieldType": "text",
        "validation": {"minLength": 1, "maxLength": 50}
    },
    {
        "fieldName": "lastName",
        "required": true,
        "visible": true,
        "editable": true,
        "fieldType": "text",
        "validation": {"minLength": 1, "maxLength": 50}
    }
]' "200"

# Test 16: Remove profile field
run_test "Remove Profile Field" "DELETE" "/admin/user-settings/profile-fields/skills" "" "200"

echo -e "\n${BLUE}=== SESSION SETTINGS TESTS ===${NC}"

# Test 17: Get session settings
run_test "Get Session Settings" "GET" "/admin/user-settings/session-settings" "" "200"

# Test 18: Update session settings
run_test "Update Session Settings" "PUT" "/admin/user-settings/session-settings" '{
    "sessionTimeoutMinutes": 480,
    "allowMultipleSessions": true,
    "forceLogoutOnPasswordChange": true,
    "rememberMeDays": 30,
    "requireReauthForSensitive": true
}' "200"

echo -e "\n${BLUE}=== BULK OPERATIONS TESTS ===${NC}"

# Test 19: Get all user settings
run_test "Get All User Settings" "GET" "/admin/user-settings/all" "" "200"

echo -e "\n${BLUE}=== VALIDATION ERROR TESTS ===${NC}"

# Test 20: Invalid password policy update
run_test "Invalid Password Policy" "PUT" "/admin/user-settings/password-policy" '{
    "minLength": -1,
    "maxLength": 5
}' "400"

# Test 21: Invalid email validation
run_test "Invalid Email Format" "POST" "/admin/user-settings/registration-policy/validate-email" '{
    "email": "invalid-email"
}' "400"

# Test 22: Invalid profile field
run_test "Invalid Profile Field" "POST" "/admin/user-settings/profile-fields" '{
    "fieldName": "123invalid",
    "fieldType": "invalidtype"
}' "400"

echo -e "\n${BLUE}=== TEST SUMMARY ===${NC}"
echo "============================================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Phase 4 - User Management Settings is working correctly!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the implementation.${NC}"
    exit 1
fi