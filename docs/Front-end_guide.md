# 🚀 Frontend Developer Integration Guide — Blog App API

> **Base URL:** `http://localhost:3001`  
> **Interactive Swagger Docs:** `http://localhost:3001/api-docs`  
> **Content-Type:** `application/json`

This guide walks you through integrating every backend endpoint into the frontend application, including **ready-to-use API client setup (with automatic JWT refresh)**, **exact payload/response shapes**, **business rules**, and **UI implementation tips** to finish the project.

---

## 📑 Table of Contents

1. [Architecture & Core Concepts](#1-architecture--core-concepts)
2. [Step 1: API Client & Automatic Token Refresh Setup](#2-step-1-api-client--automatic-token-refresh-setup)
3. [Step 2: Authentication Module (`/auth`)](#3-step-2-authentication-module-auth)
4. [Step 3: Blog Feed, Search, Pagination & CRUD (`/blog`)](#4-step-3-blog-feed-search-pagination--crud-blog)
5. [Step 4: User Profiles, Search & Account Settings (`/user`)](#5-step-4-user-profiles-search--account-settings-user)
6. [Step 5: Error Handling & Form Validation Mapping](#6-step-5-error-handling--form-validation-mapping)
7. [Important Backend Gotchas to Watch Out For](#7-important-backend-gotchas-to-watch-out-for)
8. [Frontend Completion Checklist](#8-frontend-completion-checklist)

---

## 1. Architecture & Core Concepts

### Dual-Token JWT Authentication
The API uses a **Dual-Token** strategy:
- **`accessToken` (Expires in 15 minutes):** Sent in the `Authorization: Bearer <accessToken>` header for protected endpoints. Payload contains `{ id, email, role }`.
- **`refreshToken` (Expires in 7 days):** Sent to `POST /auth/refresh-token` to get a new `accessToken` when a `401 Unauthorized` occurs.

### Role-Based Access Control (RBAC)
Every user has a `role` field (`"user"` or `"admin"`):
- **`user`:** Can create blogs, edit/delete their **own** blogs (edit within 3 minutes), and update/soft-delete their **own** profile.
- **`admin`:** Can view all users (`GET /user/all`), delete any blog, and update/delete any user profile.

### Rate Limiting
- **General API Limiter:** **100 requests per 15 minutes** per IP across all routes.
- **Strict Auth Limiter:** **5 attempts per 15 minutes** per IP on `/auth/login` and `/auth/register`. Exceeding this returns HTTP `429`.

---

## 2. Step 1: API Client & Automatic Token Refresh Setup

Set up an Axios instance (or Fetch wrapper) that automatically attaches the `accessToken` and silently refreshes it when it expires after 15 minutes.

```javascript
// src/api/axiosClient.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

// 1. Attach Access Token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Automatically refresh expired Access Tokens on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops on login or refresh-token routes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            "http://localhost:3001/auth/refresh-token",
            { token: refreshToken }
          );

          // Save new access token and retry original request
          localStorage.setItem("accessToken", data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or invalid -> force logout
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 3. Step 2: Authentication Module (`/auth`)

### 3.1 Register User — `POST /auth/register`
- **Auth Required:** No
- **Rate Limit:** 5 requests / 15 min

**Validation Rules (Zod):**
| Field | Type | Constraints |
| :--- | :--- | :--- |
| `firstName` | `string` | Required, trimmed, `2–50` characters |
| `lastName` | `string` | Required, trimmed, `2–50` characters |
| `email` | `string` | Required, valid email format |
| `password` | `string` | Required, minimum `6` characters |
| `dob` | `string` | Required, strict `YYYY-MM-DD` format (e.g. `"2000-01-15"`) |

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

**Success Response (`201 Created`):**
```json
{
  "message": "User registered successfully",
  "success": true,
  "userId": 1
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed (see [Section 6](#6-step-5-error-handling--form-validation-mapping))
- `409 Conflict`: `{ "success": false, "message": "Email already exists" }`
- `429 Too Many Requests`: `{ "success": false, "message": "Too many attempts from this IP. Please try again after 15 minutes." }`

---

### 3.2 Login User — `POST /auth/login`
- **Auth Required:** No
- **Rate Limit:** 5 requests / 15 min
- **Special Behavior:** If a user previously soft-deleted their account (`DELETE /user/:id`), logging in **automatically reactivates** their account (`deleted = false`).

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "secret123"
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "login success",
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": 1,
    "firstName": "Ahmed",
    "lastName": "Nouh",
    "email": "ahmed@example.com",
    "role": "user"
  }
}
```

> **Frontend Action:** Save `accessToken`, `refreshToken`, and `data` (user object including `id` and `role`) to your auth state/storage.

**Error Responses:**
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: `{ "success": false, "message": "invalid credentials" }`
- `404 Not Found`: `{ "success": false, "message": "user not found" }`
- `429 Too Many Requests`: Rate limit reached

---

### 3.3 Refresh Access Token — `POST /auth/refresh-token`
- **Auth Required:** No (uses `refreshToken` in body)

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "Token refreshed successfully",
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `401 Unauthorized`: `{ "success": false, "message": "Invalid or expired refresh token. Please log in again." }`
- `404 Not Found`: `{ "success": false, "message": "User not found or account deactivated" }`

---

## 4. Step 3: Blog Feed, Search, Pagination & CRUD (`/blog`)

### 4.1 Get Paginated Blogs — `GET /blog`
- **Auth Required:** No (Public)

**Query Parameters (all optional):**
| Param | Default | Description |
| :--- | :--- | :--- |
| `page` | `1` | Page number (1-indexed) |
| `limit` | `10` | Items per page |
| `search` | `""` | Searches both `title` and `content` (`LIKE %search%`) |
| `sort` | `"newest"` | Pass `"oldest"` for `ASC` order; defaults to newest (`DESC`) |

**Example Call:**
```javascript
const res = await api.get("/blog", {
  params: { page: 1, limit: 10, search: "react", sort: "newest" }
});
```

**Success Response (`200 OK`):**
```json
{
  "message": "done",
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My First Blog Post",
      "content": "This is the complete content of the blog post.",
      "userId": 1,
      "created_at": "2026-10-29T00:00:00.000Z",
      "updated_at": "2026-10-29T00:00:00.000Z",
      "user": {
        "id": 1,
        "firstName": "Ahmed",
        "lastName": "Nouh",
        "email": "ahmed@example.com"
      }
    }
  ],
  "pagination": {
    "totalItems": 25,
    "totalPages": 3,
    "currentPage": 1,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

> **Frontend Tip:** Note that when no blogs match a search or the DB is empty, `GET /blog` returns `200 OK` with `data: []` and `totalItems: 0` (it does **not** throw a 404). Bind your Next/Prev buttons directly to `pagination.hasNextPage` and `pagination.hasPrevPage`.

---

### 4.2 Get Single Blog by ID — `GET /blog/:id`
- **Auth Required:** No (Public)

> ⚠️ **IMPORTANT GOTCHA:** `GET /blog/:id` returns `data` as a **single-element array** (`data: [blogObject]`), NOT a plain object! Access the blog on the frontend using `response.data.data[0]`.

**Success Response (`200 OK`):**
```json
{
  "message": "done",
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My First Blog Post",
      "content": "This is the complete content of the blog post.",
      "created_at": "2026-10-29T00:00:00.000Z",
      "updated_at": "2026-10-29T00:00:00.000Z",
      "userId": 1,
      "firstName": "Ahmed",
      "lastName": "Nouh",
      "email": "ahmed@example.com",
      "user": {
        "id": 1,
        "firstName": "Ahmed",
        "lastName": "Nouh",
        "email": "ahmed@example.com"
      }
    }
  ]
}
```

**Error Response:**
- `404 Not Found`: `{ "success": false, "message": "no blogs found" }`

---

### 4.3 Create Blog — `POST /blog`
- **Auth Required:** Yes (`Bearer <accessToken>`)
- **Note:** Do **not** send `userId` in the body. The backend extracts `userId` automatically from the JWT token (`req.user.id`).

**Validation Rules (Zod):**
| Field | Type | Constraints |
| :--- | :--- | :--- |
| `title` | `string` | Required, trimmed, `3–50` characters |
| `content` | `string` | Required, trimmed, minimum `5` characters |

**Request Body:**
```json
{
  "title": "My First Blog Post",
  "content": "This is the complete content of the blog post."
}
```

**Success Response (`201 Created`):**
```json
{
  "message": "blog created",
  "success": true,
  "data": {
    "insertId": 1
  }
}
```

---

### 4.4 Update Blog — `PUT /blog/:id`
- **Auth Required:** Yes (`Bearer <accessToken>`)
- **Permissions:** Only the **Author** (`blog.userId === currentUser.id`) or an **Admin** (`currentUser.role === "admin"`).
- **⏱️ 3-Minute Edit Window Business Rule:** A blog post can **only be edited within 3 minutes** of its `created_at` timestamp. After 3 minutes, the backend rejects updates with HTTP `400`.

**Validation Rules (Zod):**
- `title` (optional): string, trimmed, `3–50` characters
- `content` (optional): string, trimmed, min `5` characters

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated blog content here."
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "blog updated",
  "success": true,
  "data": {
    "blogId": "1",
    "affectedRows": 1
  }
}
```

**Error Responses:**
- `400 Bad Request` (> 3 mins elapsed):
  ```json
  {
    "success": false,
    "message": "Cannot update blog: more than 3 minutes have passed since creation"
  }
  ```
- `403 Forbidden` (not owner/admin):
  ```json
  {
    "success": false,
    "message": "You are not authorized to modify this blog"
  }
  ```
- `404 Not Found`: `{ "success": false, "message": "blog not found" }`

> **Frontend UI Helper for the 3-Minute Rule:**
> ```javascript
> const canEditBlog = (blog, currentUser) => {
>   if (!currentUser) return false;
>   const isOwnerOrAdmin = blog.userId === currentUser.id || currentUser.role === "admin";
>   const elapsedMinutes = (Date.now() - new Date(blog.created_at).getTime()) / (1000 * 60);
>   return isOwnerOrAdmin && elapsedMinutes <= 3;
> };
> ```

---

### 4.5 Delete Blog — `DELETE /blog/:id`
- **Auth Required:** Yes (`Bearer <accessToken>`)
- **Permissions:** Author (`blog.userId === currentUser.id`) or Admin (`currentUser.role === "admin"`). No time limit applies to deletion.

**Success Response (`200 OK`):**
```json
{
  "message": "blog deleted",
  "success": true,
  "data": {
    "deleteId": "1"
  }
}
```

**Error Responses:**
- `403 Forbidden`: `{ "success": false, "message": "You are not authorized to delete this blog" }`
- `404 Not Found`: `{ "success": false, "message": "blog not found" }`

---

## 5. Step 4: User Profiles, Search & Account Settings (`/user`)

### 5.1 Get User Public Profile — `GET /user/:id`
- **Auth Required:** No (Public)
- **Behavior:** Returns calculated `fullname` and `age` (in years) from `dob`. Soft-deleted users return `404`.

**Success Response (`200 OK`):**
```json
{
  "message": "success",
  "success": true,
  "data": {
    "email": "ahmed@example.com",
    "dob": "2000-01-15",
    "role": "user",
    "fullname": "Ahmed Nouh",
    "age": 26
  }
}
```

**Error Response:**
- `404 Not Found`: `{ "success": false, "message": "user not found" }`

---

### 5.2 Search Users by Name Prefix — `GET /user/search`
- **Auth Required:** No (Public)
- **Query Param:** `?name=Ah` (matches `firstName LIKE 'Ah%'` or `lastName LIKE 'Ah%'`)

**Success Response (`200 OK`):**
```json
{
  "message": "success",
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Ahmed",
      "lastName": "Nouh",
      "email": "ahmed@example.com",
      "dob": "2000-01-15",
      "status": "inactive",
      "deleted": false,
      "role": "user"
    }
  ]
}
```

---

### 5.3 Update User Profile — `PUT /user/:id`
- **Auth Required:** Yes (`Bearer <accessToken>`)
- **Permissions:** Self (`Number(id) === currentUser.id`) or Admin (`currentUser.role === "admin"`).

**Request Body (all fields optional):**
```json
{
  "firstName": "Ahmed",
  "lastName": "Nouh",
  "email": "newemail@example.com",
  "password": "newSecretPassword123",
  "dob": "2000-06-20"
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "user updated successfully",
  "success": true
}
```

**Error Responses:**
- `403 Forbidden`: `{ "success": false, "message": "Forbidden: Not your account" }`
- `404 Not Found`: `{ "success": false, "message": "user not found" }`

---

### 5.4 Soft-Delete User Account — `DELETE /user/:id`
- **Auth Required:** Yes (`Bearer <accessToken>`)
- **Permissions:** Self (`Number(id) === currentUser.id`) or Admin (`currentUser.role === "admin"`).
- **Behavior:** Marks `deleted = true` in DB. If the user logs in again via `POST /auth/login`, their account is automatically restored.

**Success Response (`200 OK`):**
```json
{
  "message": "user deleted successfully",
  "success": true
}
```

> **Frontend Action:** If a user deletes their own account, clear `localStorage` tokens and redirect them to `/login` or `/`.

---

### 5.5 List All Users (Admin Dashboard) — `GET /user/all`
- **Auth Required:** Yes (`Bearer <accessToken>`)
- **Permissions:** **Admin Only** (`currentUser.role === "admin"`). Regular users receive `403 Forbidden`.

**Success Response (`200 OK`):**
```json
{
  "message": "success",
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Ahmed",
      "lastName": "Nouh",
      "email": "ahmed@example.com",
      "dob": "2000-01-15",
      "status": "inactive",
      "deleted": false,
      "role": "user"
    }
  ]
}
```

**Error Response (`403 Forbidden`):**
```json
{
  "message": "You are not authorized to perform this action",
  "success": false
}
```

---

## 6. Step 5: Error Handling & Form Validation Mapping

The backend returns two distinct error shapes depending on whether the error is a **Zod schema validation error** or an **operational/application error**:

### Shape A: Zod Validation Error (`400 Bad Request`)
Returned on `/auth/register`, `/auth/login`, `/auth/refresh-token`, `POST /blog`, and `PUT /blog/:id`:
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ],
  "success": false
}
```

### Shape B: Standard Operational Error (`400`, `401`, `403`, `404`, `409`, `429`, `500`)
```json
{
  "success": false,
  "message": "Cannot update blog: more than 3 minutes have passed since creation"
}
```

### Universal Frontend Error Parser Helper
Use this utility in your frontend to handle both shapes cleanly:

```javascript
// src/utils/parseApiError.js
export function parseApiError(error) {
  const res = error.response?.data;

  if (!res) {
    return {
      generalMessage: "Network error. Please check if the backend server is running.",
      fieldErrors: {},
    };
  }

  // Handle Zod array of field errors
  const fieldErrors = {};
  if (Array.isArray(res.errors)) {
    res.errors.forEach((err) => {
      fieldErrors[err.field] = err.message;
    });
  }

  return {
    generalMessage: res.message || "Something went wrong",
    fieldErrors, // e.g., { email: "Please provide a valid email address" }
  };
}
```

---

## 7. Important Backend Gotchas to Watch Out For

1. **`GET /blog/:id` wraps the blog in an array:**
   - Unlike `GET /user/:id` (which returns `data: { ... }`), `GET /blog/:id` returns `data: [ { ... } ]`. Always read `res.data.data[0]`.
2. **`POST /blog` does NOT accept `userId` in the body:**
   - Older docs (`API_ENDPOINTS.md`) showed `userId` in the request body. The current backend reads `req.user.id` from the `Bearer` token. Only send `{ title, content }`.
3. **3-Minute Edit Lock on `PUT /blog/:id`:**
   - Both regular authors and admins will get a `400` error if they try to edit a blog post more than 3 minutes after `created_at`. Show a countdown or hide/disable the "Edit" button once 3 minutes have passed.
4. **Date of Birth (`dob`) format:**
   - Registration strictly enforces `YYYY-MM-DD` via regex (`^\d{4}-\d{2}-\d{2}$`). Using `<input type="date" />` in HTML natively produces this exact format.
5. **Backend `.env` Requirement:**
   - Ensure the backend `.env` file includes **both** `JWT_SECRET` and `REFRESH_SECRET` (note that `.env.example` only lists `JWT_SECRET`), otherwise `POST /auth/login` will fail when signing the refresh token.

---

## 8. Frontend Completion Checklist

- [ ] **API Interceptor:** Configured `Authorization: Bearer <accessToken>` header and automatic `401` retry via `POST /auth/refresh-token`.
- [ ] **Auth Pages:**
  - [ ] Register form sends `{ firstName, lastName, email, password, dob }` and maps Zod `errors[]` to inputs.
  - [ ] Login form saves `accessToken`, `refreshToken`, and `data` (`id`, `role`, `firstName`, `lastName`, `email`).
  - [ ] Rate limit (`429`) error banner shown after 5 failed login/register attempts.
- [ ] **Blog Feed (`/` or `/blogs`):**
  - [ ] Connects to `GET /blog?page=&limit=&search=&sort=`.
  - [ ] Debounced search bar updates `search` query param.
  - [ ] Sort dropdown toggles between `"newest"` and `"oldest"`.
  - [ ] Pagination bar uses `pagination.currentPage`, `pagination.totalPages`, `hasNextPage`, and `hasPrevPage`.
- [ ] **Blog Details & Actions (`/blog/:id`):**
  - [ ] Reads blog object from `res.data.data[0]`.
  - [ ] Displays author name (`firstName` + `lastName`) with a link to `/user/:userId`.
  - [ ] Shows **Delete** button only if `currentUser.id === blog.userId || currentUser.role === 'admin'`.
  - [ ] Shows **Edit** button only if owner/admin AND `created_at` is within the last 3 minutes.
- [ ] **User Profile (`/user/:id`):**
  - [ ] Displays public profile (`fullname`, `age`, `email`, `dob`, `role`) via `GET /user/:id`.
  - [ ] Shows "Edit Profile" (`PUT /user/:id`) and "Deactivate Account" (`DELETE /user/:id`) if viewing own profile or logged in as admin.
- [ ] **Admin Panel (`/admin/users`):**
  - [ ] Protected frontend route (`currentUser.role === 'admin'`).
  - [ ] Fetches all users via `GET /user/all` and user search via `GET /user/search?name=`.

