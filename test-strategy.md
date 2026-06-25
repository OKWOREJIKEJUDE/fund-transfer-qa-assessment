# Test Strategy — Fund Transfer API
 # 1. Introduction
This document outlines the test strategy for the Fund Transfer API developed by a FinTech company providing digital wallet and money transfer services. The API allows customers to transfer money between wallets via the endpoint `POST /api/v1/transfers`.

The goal of this strategy is to validate the feature, identify risks, and ensure the API behaves correctly across all functional, negative, security, and boundary scenarios.

# 2. Scope

# In Scope
- Functional validation of the `POST /api/v1/transfers` endpoint
- Business rule enforcement (amount limits, supported currencies, balance checks, duplicate prevention, approval thresholds, audit record generation)
- Boundary value testing on the amount field
- Negative and error handling scenarios
- Security testing (authentication, authorisation, input validation)
- Regression testing on every code change via CI/CD pipeline

# Out of Scope
- UI or front-end testing
- Other API endpoints not related to fund transfers
- Third-party payment gateway or banking integrations
- Performance and load testing (recommended as a follow-up activity)
- Mobile application testing


# 3. Test Approach

# 3.1 Functional Testing
Validate that the API behaves as expected under normal operating conditions. This includes verifying that a valid transfer request returns a 200 status code with the correct transactionId, status, amount, and currency fields in the response.

# 3.2 API Testing
All tests will be executed directly against the API using Playwright (API request context). Each test will send HTTP requests with controlled payloads and assert on status codes, response body content, response schema, and business rule enforcement.

# 3.3 Negative Testing
Validate that the API correctly rejects invalid or malformed requests. Scenarios include:
- Amount equal to or less than zero
- Amount exceeding £10,000
- Unsupported currency codes
- Missing required fields in the request body
- Invalid or non-existent wallet IDs
- Insufficient sender wallet balance
- Duplicate transaction submissions

# 3.4 Security Testing
Validate that the API is protected against unauthorised access and common attack vectors. This includes testing with missing, expired, and invalid authentication tokens, as well as verifying protection against replay attacks, rate limiting enforcement, and injection attempts in input fields.

# 3.5 Regression Testing
The full test suite will be executed automatically on every pull request and push to the main branch via a GitHub Actions CI/CD pipeline. Any test failure will block the merge and notify the team.

# 4. Risk Assessment

# 4.1 High-Risk Areas
- Insufficient balance validation — if not enforced correctly, money could be debited from wallets with no funds
- Duplicate transaction prevention — failure here could result in double charges to customers
- Approval threshold logic — transfers above £5,000 must be flagged; bypassing this could lead to unauthorised large transfers

# 4.2 Potential Production Failures
- Missing or weak authentication checks allowing unauthorised API access
- No rate limiting leading to abuse or denial-of-service attacks
- Unhandled edge cases on boundary amounts causing unexpected behaviour

# 4.3 Fraud-Related Risks
- Replay attacks — an intercepted valid request being resubmitted to trigger duplicate transfers
- Wallet ID spoofing — a malicious actor attempting to use another customer's wallet ID
- Currency manipulation — sending unsupported or manipulated currency codes to exploit conversion logic

# 4.4 Data Integrity Concerns
- Race conditions on concurrent transfer requests leading to incorrect balance deductions
- Sensitive transaction data being exposed in API responses or server logs


# 5. Test Environment
- **Base URL:** `https://api.fintech-sandbox.com` (or as provided)
- **Authentication:** Bearer token passed in the Authorization header
- **Test Data:** Synthetic wallet IDs and balances managed in the `test-data/` directory
- **Framework:** Playwright with TypeScript
- **Reporting:** Playwright HTML Reporter


# 6. Entry and Exit Criteria

# Entry Criteria
- API endpoint is deployed and accessible in the test environment
- API documentation and business rules have been reviewed and confirmed
- Test data (wallet IDs and balances) has been provisioned

# Exit Criteria
- All mandatory test scenarios have been executed
- All critical and high-severity defects have been resolved
- Test coverage includes all business rules, boundary values, and negative scenarios
- CI/CD pipeline executes the full suite successfully