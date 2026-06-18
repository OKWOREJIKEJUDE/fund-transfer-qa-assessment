# Security & Compliance Testing — Fund Transfer API

## 1. Introduction

This document describes the security and compliance testing approach for the Fund Transfer API. The API handles sensitive financial transactions between customer wallets, making security and regulatory compliance critical concerns. Implementation of fixes is not in scope here; this document focuses strictly on the testing approach and methodology.

---

## 2. Security Testing

### 2.1 Authentication

**Objective:** Verify that the API rejects all requests that do not present a valid authentication token.

**Approach:**

- Send a request with no Authorization header — expect a `401 Unauthorized` response
- Send a request with an expired token — expect a `401 Unauthorized` response
- Send a request with a malformed or random token value — expect a `401 Unauthorized` response
- Send a request with a valid token — expect a `200 OK` response
- Verify that the error response body does not expose internal system details or token validation logic

---

### 2.2 Authorization

**Objective:** Verify that authenticated users can only perform actions on their own wallets and cannot access or transfer from wallets belonging to other customers.

**Approach:**

- Authenticate as Customer A and attempt a transfer using Customer B's senderWalletId — expect a `403 Forbidden` response
- Authenticate as Customer A and attempt a transfer using Customer A's senderWalletId — expect a `200 OK` response
- Verify that the API enforces wallet ownership at the server side and does not rely solely on client-supplied wallet IDs

---

### 2.3 Sensitive Data Exposure

**Objective:** Verify that the API does not expose sensitive financial or personal data in responses, headers, or logs.

**Approach:**

- Inspect all API responses and confirm that wallet balances, card numbers, account credentials, and personally identifiable information (PII) are not returned unless explicitly required
- Verify that the Authorization token is not echoed back in any response body or header
- Confirm that error messages do not expose internal stack traces, database query details, or system architecture information
- Verify that all communication is encrypted over HTTPS and that the API rejects plain HTTP requests

---

### 2.4 Replay Attacks

**Objective:** Verify that a previously captured valid request cannot be resubmitted to trigger a duplicate transfer.

**Approach:**

- Submit a valid transfer request and capture the full request payload and headers
- Resubmit the identical request immediately — expect the API to reject it with an appropriate error (linked to business rule 7: duplicate transactions should be prevented)
- Resubmit the identical request after a time delay — expect the same rejection
- Verify that the API uses a mechanism such as a unique idempotency key or transaction fingerprint to detect and block replayed requests

---

### 2.5 Rate Limiting

**Objective:** Verify that the API enforces request rate limits to prevent abuse, brute force, and denial-of-service attacks.

**Approach:**

- Send a high volume of rapid requests from the same authenticated user and verify that the API returns a `429 Too Many Requests` response after the allowed threshold is exceeded
- Verify that the response includes a `Retry-After` header indicating when the client may retry
- Send requests from different authenticated users simultaneously and confirm that rate limiting is applied per user and not globally in a way that affects legitimate traffic

---

### 2.6 Input Validation

**Objective:** Verify that the API safely handles malicious, malformed, or unexpected input in all request fields.

**Approach:**

- Send SQL injection payloads in the senderWalletId and receiverWalletId fields — expect a `400 Bad Request` response and no database errors
- Send script injection payloads (XSS attempts) in string fields — expect a `400 Bad Request` response
- Send negative numbers, zero, and extremely large numbers in the amount field — expect appropriate validation errors
- Send unsupported special characters and excessively long strings in all fields — expect a `400 Bad Request` response
- Verify that all validation error responses return clear, safe error messages without exposing internal logic

---

### 2.7 OWASP Top 10 Considerations

**Objective:** Map the most relevant OWASP Top 10 risks to the Fund Transfer API and define testing approaches for each.

| OWASP Risk | Relevance to This API | Testing Approach |
|---|---|---|
| Broken Access Control | Users accessing other customers' wallets | Test wallet ownership enforcement (see 2.2) |
| Cryptographic Failures | Sensitive data transmitted or stored insecurely | Verify HTTPS enforcement, check response payloads for exposed data |
| Injection | Malicious input in wallet ID or amount fields | Send injection payloads in all input fields (see 2.6) |
| Broken Authentication | Weak or missing token validation | Test with invalid, expired, and missing tokens (see 2.1) |
| Security Misconfiguration | Verbose error messages, open endpoints | Inspect error responses for internal detail exposure |
| Excessive Data Exposure | API returning more data than needed | Review all response payloads for unnecessary fields |

---

## 3. Compliance Testing

### 3.1 PCI DSS Requirements

**Objective:** Verify that the API handles payment-related data in accordance with Payment Card Industry Data Security Standards.

**Approach:**

- Confirm that all data transmission occurs over TLS 1.2 or higher and that plain HTTP connections are refused
- Verify that no sensitive authentication data (full card numbers, CVV codes, PINs) is stored or returned in API responses
- Confirm that transaction data at rest is encrypted and that encryption keys are managed securely
- Verify that access to the API is restricted to authenticated and authorised users only, with no anonymous access permitted
- Confirm that all access attempts, successful or failed, are logged with sufficient detail for audit purposes

---

### 3.2 GDPR Considerations

**Objective:** Verify that the API handles personal data in compliance with the General Data Protection Regulation.

**Approach:**

- Confirm that only the minimum necessary personal data is collected and returned in API responses
- Verify that customer wallet IDs and transaction records are not shared with unauthorised third parties through the API response
- Confirm that test environments use synthetic or anonymised data and never use real customer data
- Verify that a data retention policy exists and that transaction records are not stored indefinitely beyond the legally required period
- Confirm that customers can request deletion of their data and that the system supports this without breaking transaction audit trails

---

### 3.3 Audit Logging

**Objective:** Verify that every successful fund transfer generates a complete and immutable audit record, as required by business rule 6.

**Approach:**

- Execute a successful transfer and query the audit log to confirm an entry was created
- Verify that the audit record contains the transactionId, senderWalletId, receiverWalletId, amount, currency, timestamp, and status
- Attempt to modify or delete an audit record and confirm the system prevents it
- Verify that failed transfer attempts are also logged with sufficient detail for investigation

---

### 3.4 Transaction Traceability

**Objective:** Verify that every transaction can be traced end-to-end from the initial API request through to the audit record.

**Approach:**

- Submit a transfer and record the transactionId returned in the response
- Query the audit log using the transactionId and confirm the record matches the original request details exactly
- Verify that the transactionId is unique for every transfer and cannot be predicted or manipulated by a client

---

### 3.5 Data Retention and Privacy

**Objective:** Verify that transaction data is retained for the legally required period and that privacy is maintained throughout.

**Approach:**

- Confirm that the API does not return transaction history beyond what is needed for the current request
- Verify that archived transaction records are encrypted and access-controlled
- Confirm that data older than the defined retention period is purged according to policy
- Ensure all test data used during testing is synthetic and is cleaned up after test execution