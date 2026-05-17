# Streeling University Library System (IMS)

A secure, role-based Inventory Management System designed for university library operations. This system handles book circulation, procurement tracking, and administrative auditing with strictly enforced access controls.

## Core Features

- **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for Students, Librarians, and Administrators.
- **Inventory Management**: Real-time tracking of book availability, categories, and stock levels.
- **Procurement System**: Integrated tracking for ordering and receiving new stock from external vendors.
- **Circulation Desk**: Tools for librarians to manage loan approvals, denials, and book returns.
- **Audit Logging**: Comprehensive internal logging of all sensitive administrative actions.
- **Security First**: 
    - Content Security Policy (CSP) headers to prevent XSS.
    - Rate-limiting on authentication endpoints to prevent brute-force attacks.
    - Secure password hashing and JWT-based session management.

## How to Run the Project

This project consists of two parts: a Python Backend (FastAPI) and a React Frontend (Vite). You need to run **both** in separate terminals.

### 1. Start the Backend

1.  Open a terminal and navigate to the `backend` folder.
2.  Activate the virtual environment:
    ```bash
    .\venv\Scripts\Activate
    ```
3.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    *Local URL: `http://127.0.0.1:8000`*

### 2. Start the Frontend

1.  Open a **second** terminal and navigate to the `frontend` folder.
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Open the app in your browser (usually `http://localhost:5173`).

---

## Security Header Fix

The Vite frontend development server has been configured to return browser security headers during local testing. This addresses two OWASP ZAP passive findings on the frontend:

- **Content Security Policy (CSP) Header Not Set**
- **Missing Anti-clickjacking Header**

The change is in:

```text
frontend/vite.config.js
```

### What Was Changed

The frontend server now returns the following headers on Vite-served pages:

```text
Content-Security-Policy: default-src 'self'; ...; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

The anti-clickjacking fix is provided by two controls:

```text
X-Frame-Options: DENY
```

and:

```text
Content-Security-Policy: frame-ancestors 'none'
```

`X-Frame-Options: DENY` tells browsers that the IMS frontend must not be embedded inside a frame, iframe, or object on another page. This protects against clickjacking attacks, where an attacker loads the real application inside an invisible or misleading frame and tricks a user into clicking sensitive buttons.

The CSP `frame-ancestors 'none'` directive provides the same protection using the modern Content Security Policy mechanism. It explicitly prevents any parent page from framing the application. Including both headers improves browser compatibility and satisfies OWASP ZAP's anti-clickjacking passive scan rule.

The broader CSP also restricts where frontend resources can load from. It permits only the local frontend/backend, Vite websocket traffic, Google Fonts, local/data images, and the UI avatar image provider used by the app. This reduces the risk of browser-side injection by limiting approved script, style, image, font, and connection sources.

### Why This Fix Matters

Without an anti-clickjacking header, the application can be embedded in another website. A malicious site could visually hide or overlay the IMS page and trick a logged-in user into performing unintended actions. In an inventory management system, this could affect workflows such as approving loans, changing user details, or interacting with administrative pages.

By setting `X-Frame-Options: DENY` and `frame-ancestors 'none'`, the frontend now refuses to be framed by any other page. This closes the control gap identified by ZAP under **Missing Anti-clickjacking Header**.

### Verify the Fix

Start both servers, then run:

```powershell
curl.exe -I http://127.0.0.1:5173/
```

Expected frontend result:

```text
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

To verify the exact URL reported by ZAP for the anti-clickjacking issue, run:

```powershell
curl.exe -I http://127.0.0.1:5173/sitemap.xml
```

Expected result:

```text
Content-Security-Policy: ... frame-ancestors 'none'
X-Frame-Options: DENY
```

If ZAP still shows the old alert after this change, start a fresh ZAP session or clear the old alert tree before rescanning. Existing ZAP alerts can remain visible even after the application response headers have been fixed.

The backend can be checked with:

```powershell
curl.exe http://127.0.0.1:8000/
```

Expected backend result:

```json
{"message":"IMS Backend Service - Modularized"}
```

Note: `curl.exe -I http://127.0.0.1:8000/` may return `405 Method Not Allowed` because `-I` sends a `HEAD` request, while the backend root route is defined for `GET`.

---

## Default Test Credentials

Role        | Username                         | Password
------------|----------------------------------|----------
Admin       | admin@streeling.ac.uk            | admin123
Librarian   | librarian1@streeling.ac.uk       | librarian1
Librarian   | librarian2@streeling.ac.uk       | librarian2
Student     | student1@streeling.ac.uk         | student1
Student     | student2@streeling.ac.uk         | student2
Student     | student3@streeling.ac.uk         | student3
