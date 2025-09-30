# API Documentation

## Overview

This is a Node.js/Express backend service that provides REST API endpoints for managing notifications, user registrations, subscriptions, broadcasts, and feedback. The service uses Firebase Realtime Database for data storage and Web Push for sending push notifications.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Utilities](#utilities)
- [Error Handling](#error-handling)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: Firebase Realtime Database
- **Push Notifications**: web-push v3.6.7
- **Additional Libraries**:
  - cors v2.8.5
  - body-parser v2.2.0
  - firebase-admin v13.4.0

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Project Structure

```
.
├── api/
│   ├── broadcast.js
│   ├── checkemail.js
│   ├── feedback.js
│   ├── notification.js
│   ├── subscription.js
│   └── user/
│       ├── activity.js
│       └── register.js
├── firebase/
│   └── firebase-admin.js
├── utils/
│   ├── generateKey.js
│   └── handleCors.js
├── package.json
└── server.js
```

## Environment Variables

Create a `.env` file or set the following environment variable:

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_CONFIG` | Firebase service account JSON (stringified) | Yes |

### Firebase Configuration Example

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

## API Endpoints

### 1. Feedback API

**Endpoint**: `POST /api/feedback`

**Description**: Save user feedback to Firebase database

**Request Body**:
```json
{
  "name": "John Doe",
  "message": "Great service!",
  "rating": 5
}
```

**Response**:
```json
{
  "message": "success save feedback"
}
```

**Database Structure**:
```
feedback/
  └── {name}/
      └── {timestamp}/
          └── {feedback_data}
```

---

### 2. Broadcast API

**Endpoint**: `POST /api/broadcast`

**Description**: Create and save a broadcast message

**Request Body**:
```json
{
  "title": "Important Announcement",
  "message": "System maintenance tonight",
  "timestamp": "2025-09-30T10:00:00Z"
}
```

**Response**:
```json
{
  "message": "broadcast berhasil disimpan!"
}
```

**Database Structure**:
```
broadcast/
  └── {timestamp_key}/
      └── {broadcast_data}
```

---

### 3. Check Email API

**Endpoint**: `POST /api/checkemail`

**Description**: Check if an email address is already registered

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "available": true
}
```

or

```json
{
  "available": false
}
```

---

### 4. User Registration API

**Endpoint**: `POST /api/user/register`

**Description**: Register a new user with default profile data

**Request Body**:
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "createdAt": "2025-09-30T10:00:00Z",
  "lastLoginAt": "2025-09-30T10:00:00Z"
}
```

**Response**:
```json
{
  "message": "success register user"
}
```

**Database Structure**:
```
users/
  └── {uid}/
      ├── profile/
      │   ├── fullname: "-"
      │   ├── nickname: "-"
      │   ├── dob: "-"
      │   ├── bio: "-"
      │   ├── createAt: "-"
      │   ├── role: "-"
      │   └── phone: "-"
      └── account/
          ├── email: "user@example.com"
          ├── createAt: "..."
          └── lastLoginAt: "..."
```

---

### 5. User Activity API

**Endpoint**: `POST /api/user/activity`

**Description**: Log user activity

**Request Body**:
```json
{
  "uid": "user123",
  "dataActivity": {
    "action": "login",
    "page": "/dashboard",
    "device": "mobile"
  }
}
```

**Response**:
```json
{
  "message": "success updates activity"
}
```

**Database Structure**:
```
users/
  └── {uid}/
      └── activity/
          └── {date_key}/
              ├── action: "login"
              ├── page: "/dashboard"
              ├── device: "mobile"
              └── createdAt: "2025-09-30T10:00:00Z"
```

---

### 6. Subscription API

**Endpoint**: `POST /api/subscription`

**Description**: Save push notification subscription

**Request Body**:
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

**Response**:
```json
{
  "subscription": {...},
  "message": "Subscription berhasil disimpan!"
}
```

**Database Structure**:
```
subscriptions/
  └── {auto_generated_key}/
      ├── subscription: {...}
      └── subscribeAt: "2025-09-30T10:00:00Z"
```

---

### 7. Push Notification API

**Endpoint**: `POST /api/notification`

**Description**: Send push notifications to all subscribed users

**Request Body**:
```json
{
  "title": "New Message",
  "body": "You have a new notification",
  "icon": "https://example.com/icon.png",
  "badge": "https://example.com/badge.png"
}
```

**Response**:
```json
{
  "message": "Push Notification selesai dikirim.",
  "success": 10,
  "failed": 0,
  "datas": {...}
}
```

**VAPID Configuration**:
- **Public Key**: `BG36Zp6Qg1pM7czK5qVSBOmccF87woXofKRBhI9gPM3C0rMPwlrpvaCLcovgmAGmxJXXKwEpCKWAC9IlDZQXnRg`
- **Contact**: `mailto:faridfathonin@email.com`

---

## Utilities

### generateKey(withTime)

Generates a unique key based on the current date and time.

**Parameters**:
- `withTime` (boolean): If `true`, includes hours, minutes, and seconds

**Returns**:
- Without time: `"20250930"`
- With time: `"20250930-103045"`

**Usage**:
```javascript
import { generateKey } from './utils/generateKey.js';

const dateKey = generateKey(false); // "20250930"
const timestampKey = generateKey(true); // "20250930-103045"
```

---

### handleCors(req, res)

Handles CORS (Cross-Origin Resource Sharing) for API requests.

**Allowed Origins**:
- `http://localhost:5173`
- `https://localhost:5173`
- `https://cdn-icons-png.flaticon.com`
- `https://portofolio-fridfn.vercel.app`
- `https://pwa-notification-phi.vercel.app`

**Returns**:
- `true`: If request is OPTIONS (preflight)
- `false`: For other methods

**Usage**:
```javascript
import { handleCors } from './utils/handleCors.js';

export default async function Handler(req, res) {
  if (handleCors(req, res)) return;
  // ... rest of the handler
}
```

---

## Error Handling

All endpoints follow a consistent error handling pattern:

### Common Error Responses

**Method Not Allowed** (405):
```json
{
  "error": "Method not allowed"
}
```

**Bad Request** (400):
```json
{
  "error": "Subscription kosong"
}
```

**Not Found** (404):
```json
{
  "error": "Tidak ada subscription ditemukan."
}
```

**Server Error** (500):
```json
{
  "error": "Gagal menyimpan"
}
```

### Error Logging

All errors are logged to the console with descriptive messages:
```javascript
console.error('Error simpan subscription:', err);
```

---

## Security Considerations

1. **CORS Protection**: Only allowed origins can access the API
2. **Method Validation**: All endpoints validate HTTP methods
3. **Firebase Security**: Uses Firebase Admin SDK with service account credentials
4. **VAPID Keys**: Web Push uses VAPID protocol for secure push notifications

---

## Firebase Database Schema

```
{
  "broadcast": {
    "{timestamp_key}": {
      "title": "string",
      "message": "string"
    }
  },
  "feedback": {
    "{user_name}": {
      "{timestamp_key}": {
        "name": "string",
        "message": "string"
      }
    }
  },
  "subscriptions": {
    "{auto_key}": {
      "subscription": {
        "endpoint": "string",
        "keys": {
          "p256dh": "string",
          "auth": "string"
        }
      },
      "subscribeAt": "ISO_timestamp"
    }
  },
  "users": {
    "{uid}": {
      "profile": {
        "fullname": "string",
        "nickname": "string",
        "dob": "string",
        "bio": "string",
        "createAt": "string",
        "role": "string",
        "phone": "string"
      },
      "account": {
        "email": "string",
        "createAt": "ISO_timestamp",
        "lastLoginAt": "ISO_timestamp"
      },
      "activity": {
        "{date_key}": {
          "action": "string",
          "createdAt": "ISO_timestamp"
        }
      }
    }
  }
}
```

---

## Author

Farid Fathonin

**Contact**: faridfathonin@email.com