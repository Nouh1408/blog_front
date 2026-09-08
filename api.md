# 📡 Blog App — API Endpoints

> **Base URL:** `http://localhost:3000`

All requests and responses use **JSON** (`Content-Type: application/json`).

---

## Table of Contents

| #   | Method     | Endpoint       | Description              |
| --- | ---------- | -------------- | ------------------------ |
| 1   | `POST`     | /auth/register | Register a new user      |
| 2   | `POST`     | /auth/login    | Login an existing user   |
| 3   | `GET`      | /user/:id      | Get user profile         |
| 4   | `PUT`      | /user/:id      | Update user profile      |
| 5   | `DELETE`   | /user/:id      | Soft-delete a user       |

---

## Authentication

### 1. Register

`POST /auth/register`

Creates a new user account. Returns `409` if the email already exists.

**Request Body:**

```json
{
  "firstName": "Ahmed",
  "lastName": "Nouh",
  "email": "ahmed@example.com",
  "password": "secret123",
  "dob": "2000-01-15"
}
```

| Field       | Type     | Required | Description                |
| ----------- | -------- | -------- | -------------------------- |
| firstName   | `string` | ✅       | User's first name          |
| lastName    | `string` | ✅       | User's last name           |
| email       | `string` | ✅       | Must be unique             |
| password    | `string` | ✅       | Plain-text password        |
| dob         | `string` | ✅       | Date of birth (`YYYY-MM-DD`) |

**Responses:**

```jsonc
// ✅ 201 Created
{
  "message": "User registered successfully",
  "success": true,
  "userId": 1
}

// ❌ 400 Bad Request — missing fields
{
  "message": "Please provide all the required fields"
}

// ❌ 409 Conflict — email taken
{
  "message": "Email already exists",
  "success": false
}
```

---

### 2. Login

`POST /auth/login`

Authenticates a user by email and password. If the user was previously soft-deleted, their account is automatically **reactivated** upon successful login.

**Request Body:**

```json
{
  "email": "ahmed@example.com",
  "password": "secret123"
}
```

| Field    | Type     | Required | Description       |
| -------- | -------- | -------- | ----------------- |
| email    | `string` | ✅       | Registered email  |
| password | `string` | ✅       | Account password  |

**Responses:**

```jsonc
// ✅ 200 OK
{
  "message": "login success",
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Ahmed",
    "lastName": "Nouh",
    "email": "ahmed@example.com",
    "dob": "2000-01-15",
    "status": "inactive",
    "deleted": 0,
    "created_at": "2026-09-08T12:00:00.000Z",
    "updated_at": "2026-09-08T12:00:00.000Z"
  }
}

// ✅ 200 OK — reactivated account
{
  "message": "login success (account reactivated)",
  "success": true,
  "data": { ... }
}

// ❌ 400 Bad Request — missing fields
{
  "message": "please provide email and password",
  "success": false
}

// ❌ 401 Unauthorized — wrong email or password
{
  "message": "invalid credintials or  user not found",
  "success": false
}
```

> **Note:** The `password` field is stripped from the returned `data` object.

---

## User

### 3. Get Profile

`GET /user/:id`

Retrieves the public profile for a user. Only returns non-deleted users.

**URL Params:**

| Param | Type  | Description          |
| ----- | ----- | -------------------- |
| id    | `int` | The user's ID        |

**Responses:**

```jsonc
// ✅ 200 OK
{
  "message": "success",
  "success": true,
  "data": {
    "email": "ahmed@example.com",
    "dob": "2000-01-15",
    "fullname": "Ahmed Nouh",
    "age": 26
  }
}

// ❌ 404 Not Found
{
  "message": "user not found",
  "success": false
}
```

---

### 4. Update Profile

`PUT /user/:id`

Updates user information. All body fields are **optional** — any omitted field keeps its current value.

**URL Params:**

| Param | Type  | Description          |
| ----- | ----- | -------------------- |
| id    | `int` | The user's ID        |

**Request Body** (all fields optional):

```json
{
  "firstName": "Ahmed",
  "lastName": "Nouh",
  "email": "newemail@example.com",
  "password": "newpassword",
  "dob": "2000-06-20"
}
```

| Field       | Type     | Required | Description                  |
| ----------- | -------- | -------- | ---------------------------- |
| firstName   | `string` | ❌       | Updated first name           |
| lastName    | `string` | ❌       | Updated last name            |
| email       | `string` | ❌       | Updated email                |
| password    | `string` | ❌       | Updated password             |
| dob         | `string` | ❌       | Updated DOB (`YYYY-MM-DD`)   |

**Responses:**

```jsonc
// ✅ 200 OK
{
  "message": "user updated successfully",
  "success": true
}

// ❌ 404 Not Found
{
  "message": "user not found",
  "success": false
}
```

---

### 5. Delete User (Soft Delete)

`DELETE /user/:id`

Marks the user as deleted (`deleted = true`) without removing the record from the database. The user can be reactivated by logging in again.

**URL Params:**

| Param | Type  | Description          |
| ----- | ----- | -------------------- |
| id    | `int` | The user's ID        |

**Responses:**

```jsonc
// ✅ 200 OK
{
  "message": "user deleted successfully",
  "success": true
}

// ❌ 404 Not Found
{
  "message": "user not found",
  "success": false
}
```

---

## Database Schema Reference

The API operates on the `blog_app` MySQL database. Below are the tables:

### `users`

| Column      | Type                           | Notes                         |
| ----------- | ------------------------------ | ----------------------------- |
| id          | `INT` AUTO_INCREMENT           | Primary key                   |
| firstName   | `VARCHAR(50)`                  | Required                      |
| lastName    | `VARCHAR(50)`                  | Required                      |
| email       | `VARCHAR(100)` UNIQUE          | Required                      |
| password    | `VARCHAR(100)`                 | Required                      |
| dob         | `DATE`                         | Date of birth                 |
| status      | `ENUM('active','inactive')`    | Default: `inactive`           |
| deleted     | `BOOLEAN`                      | Default: `false` (soft delete)|
| created_at  | `TIMESTAMP`                    | Auto-set on insert            |
| updated_at  | `TIMESTAMP`                    | Auto-updated on change        |

### `blogs`

| Column      | Type                           | Notes                         |
| ----------- | ------------------------------ | ----------------------------- |
| id          | `INT` AUTO_INCREMENT           | Primary key                   |
| title       | `VARCHAR(50)`                  |                               |
| content     | `TEXT`                         |                               |
| userId      | `INT`                          | FK → `users.id` (CASCADE)    |
| created_at  | `TIMESTAMP`                    | Auto-set on insert            |
| updated_at  | `TIMESTAMP`                    | Auto-updated on change        |

### `addresses`

| Column      | Type                           | Notes                         |
| ----------- | ------------------------------ | ----------------------------- |
| id          | `INT` AUTO_INCREMENT           | Primary key                   |
| country     | `VARCHAR(20)`                  |                               |
| city        | `VARCHAR(20)`                  |                               |
| streetName  | `VARCHAR(20)`                  | Required                      |
| phone       | `VARCHAR(15)`                  |                               |
| userId      | `INT`                          | FK → `users.id` (CASCADE)    |
| created_at  | `TIMESTAMP`                    | Auto-set on insert            |
| updated_at  | `TIMESTAMP`                    | Auto-updated on change        |

---

## Common Error Response Shape

All error responses follow this structure:

```json
{
  "message": "description of the error",
  "success": false
}
```

## Status Codes Summary

| Code  | Meaning              |
| ----- | -------------------- |
| `200` | Success              |
| `201` | Created              |
| `400` | Bad Request          |
| `401` | Unauthorized         |
| `404` | Not Found            |
| `409` | Conflict (duplicate) |
| `500` | Internal Server Error|
