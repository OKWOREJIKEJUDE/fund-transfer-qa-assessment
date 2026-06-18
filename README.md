# Fund Transfer API — QA Assessment

## Overview

This repository contains the complete QA assessment submission for the Fund Transfer API. The API is built for a FinTech company that provides digital wallet and money transfer services. The assessment covers test strategy, security and compliance testing, API test automation, and CI/CD integration.

---

## Repository Structure

--------------------------------------------------------------

## Technology Stack

- **Language:** TypeScript
- **Test Framework:** Playwright (API Request Context)
- **Runtime:** Node.js 18
- **CI/CD:** GitHub Actions
- **Reporting:** Playwright HTML Reporter
- **Environment Management:** dotenv

---

## Framework Structure

The framework is organised into three layers:

**Test Layer** (`tests/transfer.spec.ts`)
Contains all test cases organised into two describe blocks — mandatory scenarios and boundary value analysis tests. Each test is independently structured with a clear test ID, description, and assertions.

**Utility Layer** (`utils/api-client.ts`)
Contains a reusable `TransferApiClient` class that wraps all API calls. This ensures no HTTP logic is repeated inside the test files and makes the framework easy to maintain and extend.

**Data Layer** (`fixtures/test-data.ts`)
Contains all test data as named exports. Keeping data separate from test logic makes it easy to update payloads without touching the test cases themselves.

---

## Setup Instructions

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js version 18 or higher
- npm version 8 or higher
- Git

### Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/fund-transfer-qa-assessment.git
cd fund-transfer-qa-assessment
```

### Install Dependencies

```bash
cd automation
npm install
```

### Install Playwright Browsers

```bash
npx playwright install --with-deps
```

### Configure Environment Variables

Create a `.env` file inside the `automation/` folder:

```bash
touch .env
```

Add the following values to the `.env` file:

BASE_URL=https://api.fintech-sandbox.com

AUTH_TOKEN=your-auth-token-here

Replace the values with the actual API base URL and authentication token for your environment.

---

## Execution Instructions

### Run All Tests

```bash
cd automation
npm test
```

### Run a Specific Test File

```bash
npx playwright test tests/transfer.spec.ts
```

### Run Tests with HTML Report

```bash
npm run test:report
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### View the Last Generated Report

```bash
npx playwright show-report ../reports
```

---

## Test Coverage

### Mandatory Scenarios

| Test ID | Scenario | Expected Status |
|---|---|---|
| TC001 | Successful transfer with valid payload | 200 OK |
| TC002 | Transfer fails when amount is zero | 400 Bad Request |
| TC003 | Transfer fails when amount is negative | 400 Bad Request |
| TC004 | Transfer fails with unsupported currency | 400 Bad Request |
| TC005 | Transfer fails with insufficient balance | 422 Unprocessable Entity |
| TC006 | Transfer fails when required field is missing | 400 Bad Request |
| TC007 | Transfer fails without authorization token | 401 Unauthorized |
| TC008 | Duplicate transfer submission is rejected | 409 Conflict |
| TC009 | Transfer above £5,000 returns pending approval | 202 Accepted |
| TC010 | Transfer above £10,000 maximum limit is rejected | 400 Bad Request |

### Boundary Value Analysis

| Test ID | Amount | Expected Outcome |
|---|---|---|
| BVA001 | £0 | Rejected — amount must be greater than 0 |
| BVA002 | £1 | Accepted — minimum valid amount |
| BVA003 | £4,999.99 | Accepted — no approval required |
| BVA004 | £5,000 | Accepted — no approval required |
| BVA005 | £5,000.01 | Accepted — approval required |
| BVA006 | £9,999.99 | Accepted — approval required |
| BVA007 | £10,000 | Accepted — at maximum limit |
| BVA008 | £10,000.01 | Rejected — exceeds maximum limit |

---

## CI/CD Integration

The repository includes a GitHub Actions workflow at `.github/workflows/run-tests.yml` that:

- Triggers automatically on every push and pull request to the `main` branch
- Sets up Node.js 18 and installs all dependencies
- Installs Playwright browsers
- Injects environment variables securely from GitHub Secrets
- Runs the full test suite
- Uploads the HTML test report as a downloadable artifact retained for 30 days
- Fails the pipeline and notifies the team if any test fails, acting as a quality gate

---

## Assumptions Made

1. The API base URL and authentication token will be provided as environment variables and GitHub Secrets for the test environment
2. The test wallet IDs (WALLET001, WALLET002, WALLET003) exist in the sandbox environment with appropriate balances pre-configured
3. WALLET003 is assumed to have an insufficient balance for testing that scenario
4. The API returns a `202 Accepted` status with a `PENDING_APPROVAL` status field for transfers above £5,000
5. The API returns a `409 Conflict` status when a duplicate transaction is submitted
5. The API returns a `422 Unprocessable Entity` status when the sender has insufficient balance
6. Duplicate transaction detection is based on matching senderWalletId, receiverWalletId, amount, and currency submitted within a short time window

---

## Design Decisions

1. **Playwright over Postman/Newman** — Playwright provides a modern, code-first approach to API testing with native TypeScript support, parallel execution, and built-in HTML reporting, making it better suited for a CI/CD pipeline than a collection-based tool
2. **Reusable API client** — All HTTP calls are abstracted into a single `TransferApiClient` class so that any changes to headers, base URL, or request structure only need to be updated in one place
3. **Separate test data file** — Keeping all payloads in `fixtures/test-data.ts` means test cases remain readable and data can be updated without touching test logic
4. **Environment variables via dotenv** — Sensitive values like the auth token and base URL are never hardcoded in the test files or committed to the repository
5. **HTML reporting** — The Playwright HTML reporter produces a detailed visual report showing passed, failed, and skipped tests with request and response details for every test case

