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

## Default Test Credentials

Role        | Username                         | Password
------------|----------------------------------|----------
Admin       | admin@streeling.ac.uk            | admin123
Librarian   | librarian1@streeling.ac.uk       | librarian1
Librarian   | librarian2@streeling.ac.uk       | librarian2
Student     | student1@streeling.ac.uk         | student1
Student     | student2@streeling.ac.uk         | student2
Student     | student3@streeling.ac.uk         | student3
