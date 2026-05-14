# System Test Cases - Streeling University Library IMS

This document outlines the functional and security test cases for the Streeling University Library Integrated Management System (IMS), categorized by user roles.

## 1. System-Wide / Security (All Roles & Unauthenticated)

| Test Case | Test Type | Input | Expected Outcome | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-SEC-01**: SQL Injection Prevention | Security | `admin' OR '1'='1` in Login Username field | System rejects the input; login fails; no unauthorized access granted. | [ ] |
| **TC-SEC-02**: Cross-Site Scripting (XSS) Mitigation | Security | `<script>alert('XSS')</script>` in Book Description field | Script is treated as literal text; no execution occurs on the frontend. | [ ] |
| **TC-SEC-03**: Secure Password Enforcement | Functional/Security | `password123` (Weak password during registration) | Registration fails with validation error (Requires 10+ chars, uppercase, number, special char). | [ ] |
| **TC-SEC-04**: Account Locking Mechanism | Security | 5 consecutive incorrect password attempts for a student user | Account is locked (`is_locked = True`); subsequent logins fail even with correct password until unlocked. | [ ] |
| **TC-SEC-05**: Unauthorized Endpoint Access | Security | Direct API call to `/audit-logs` by a Student user (with valid Student JWT) | API returns `403 Forbidden`; access denied. | [ ] |
| **TC-SEC-06**: Session Token Expiry | Security | Attempt to use a JWT token that has expired (> 30 mins, based on system config) | API returns `401 Unauthorized`; user is redirected to login page. | [ ] |

## 2. Administrator Role

| Test Case | Test Type | Input | Expected Outcome | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-01**: User Management (Creation) | Functional | New user details (Admin, Librarian, or Student) | User is successfully created in DB; success message displayed. | [ ] |
| **TC-ADM-02**: Audit Log Visibility | Functional/Security | Navigate to "Audit Logs" page | Table displays recent system actions (e.g., login, user creation) with timestamps and status. | [ ] |
| **TC-ADM-03**: Account Unlocking | Functional | Locate a locked user and click "Unlock" | User's `is_locked` status becomes `False`; user can log in again. | [ ] |
| **TC-ADM-04**: System Stats Overview | Functional | View Admin Dashboard | Stats for "Failed Logins", "Locked Accounts", and "Total Users" are accurately displayed. | [ ] |
| **TC-ADM-05**: Role-Based User Filtering | Functional | Filter user list by "Librarian" | List updates to only show users with the "Librarian" role. | [ ] |

## 3. Librarian Role

| Test Case | Test Type | Input | Expected Outcome | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-LIB-01**: Inventory Addition | Functional | Book Name, Author, Category, Copies | Book is added to the inventory; available on Student search. | [ ] |
| **TC-LIB-02**: Loan Approval | Functional | Navigate to "Loans" -> Click "Approve" on a pending request | Loan status changes to "Active"; Book `available_copies` decreases by 1. | [ ] |
| **TC-LIB-03**: Loan Denial with Reason | Functional/Security | Click "Deny" -> Enter "Overdue books existing" | Loan status changes to "Denied"; reason is recorded and visible to Student. | [ ] |
| **TC-LIB-04**: Procurement Request | Functional | Select Supplier -> Select Book -> Enter Quantity | Stock order is created with status "Ordered"; visible in procurement list. | [ ] |
| **TC-LIB-05**: Inventory Search (Search Bar) | Functional | Type "Clean Code" in Inventory search | Specifically filters the list to show matching books only. | [ ] |

## 4. Student Role

| Test Case | Test Type | Input | Expected Outcome | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-STU-01**: Profile Update | Functional | Edit Full Name and Phone Number | Local profile state and database record update successfully. | [ ] |
| **TC-STU-02**: Avatar Upload Validation | Security/Functional | Upload a 6MB Image file (Limit: 5MB) | Upload rejected with "File too large" error. | [ ] |
| **TC-STU-03**: Avatar Upload Format | Security | Upload a `.exe` or `.txt` file disguised as avatar | Upload rejected; only image formats (JPG, PNG, GIF) allowed. | [ ] |
| **TC-STU-04**: Book Request Submission | Functional | Click "Request" on an "Available" book | Loan request is created with "Pending" status for Librarian review. | [ ] |
| **TC-STU-05**: Book Availability Check | Functional | Attempt to request a book with 0 `available_copies` | "Request" button is disabled or error Alert "Out of Stock" is shown. | [ ] |

## 5. Guest / Unauthenticated User

| Test Case | Test Type | Input | Expected Outcome | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-GST-01**: Restricted Page Access | Security | Navigate to `/admin/dashboard` via URL | User is automatically redirected to `/login`; no data exposed. | [ ] |
| **TC-GST-02**: API Data Exposure | Security | `GET /books` without Authorization header | API returns `401 Unauthorized`. | [ ] |
| **TC-GST-03**: Information Leakage | Security | Enter non-existent username in Login | Error message is generic ("Invalid Username or Password") to prevent username enumeration. | [ ] |
