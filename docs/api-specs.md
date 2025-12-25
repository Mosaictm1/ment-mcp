# 📡 API Specifications

## Base URL

```
Production: https://api.n8n-mcp.com/v1
Development: http://localhost:3001/v1
```

## Authentication

All authenticated endpoints require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

Or API Key:

```
X-API-Key: <api_key>
```

---

## Endpoints

### 🔐 Authentication

#### POST /auth/signup

Create a new user account.

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

// Response 201
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "tokens": { "accessToken": "...", "refreshToken": "..." }
}
```

#### POST /auth/login

```json
// Request
{ "email": "user@example.com", "password": "..." }

// Response 200
{
  "user": { "id": "uuid", "email": "..." },
  "tokens": { "accessToken": "...", "refreshToken": "..." }
}
```

#### POST /auth/refresh-token

```json
// Request
{ "refreshToken": "..." }

// Response 200
{ "accessToken": "...", "refreshToken": "..." }
```

---

### 👤 User Management

#### GET /users/profile

```json
// Response 200
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "free",
  "apiCallsToday": 45,
  "apiCallsLimit": 100
}
```

#### POST /users/api-keys

Generate a new API key.

```json
// Request
{ "name": "My App Key" }

// Response 201
{
  "id": "uuid",
  "name": "My App Key",
  "key": "n8n_mcp_xxxx...",  // Only shown once
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### 🔧 n8n Integration

#### GET /n8n/nodes

List all available n8n nodes.

```json
// Query: ?search=http&category=core
// Response 200
{
  "nodes": [
    {
      "name": "n8n-nodes-base.httpRequest",
      "displayName": "HTTP Request",
      "category": "Core",
      "properties": [...],
      "version": 4.2
    }
  ],
  "total": 543
}
```

#### GET /n8n/nodes/:name

Get detailed node information.

```json
// Response 200
{
  "name": "n8n-nodes-base.httpRequest",
  "displayName": "HTTP Request",
  "description": "Makes HTTP requests...",
  "properties": [
    {
      "name": "method",
      "type": "options",
      "options": ["GET", "POST", "PUT", "DELETE"],
      "default": "GET"
    }
  ],
  "examples": [...],
  "documentation": "https://docs.n8n.io/..."
}
```

#### GET /n8n/templates

```json
// Query: ?category=automation&page=1&limit=20
// Response 200
{
  "templates": [
    {
      "id": "123",
      "name": "Gmail to Slack",
      "description": "...",
      "nodes": ["Gmail", "Slack"],
      "popularity": 4.8
    }
  ],
  "total": 2700,
  "page": 1
}
```

---

### 📋 Workflow Management

#### POST /workflows/create

```json
// Request
{
  "name": "My Workflow",
  "n8nInstanceUrl": "https://my-n8n.example.com",
  "workflow": { /* n8n workflow JSON */ }
}

// Response 201
{
  "id": "uuid",
  "n8nWorkflowId": "abc123",
  "status": "created",
  "deployedAt": "2024-01-01T00:00:00Z"
}
```

#### PUT /workflows/:id

Diff-based update for efficiency.

```json
// Request
{
  "diff": [
    { "op": "replace", "path": "/nodes/0/parameters/url", "value": "https://new-url.com" }
  ]
}

// Response 200
{ "id": "uuid", "version": 2, "updatedAt": "..." }
```

#### POST /workflows/:id/validate

```json
// Response 200
{
  "valid": true,
  "warnings": [
    { "node": "HTTP Request", "message": "Consider adding error handling" }
  ]
}
```

---

### 📊 Monitoring

#### GET /executions/history

```json
// Query: ?workflowId=xxx&status=error&limit=10
// Response 200
{
  "executions": [
    {
      "id": "exec123",
      "workflowId": "xxx",
      "status": "success",
      "startedAt": "...",
      "completedAt": "...",
      "duration": 1234
    }
  ]
}
```

#### WebSocket /ws/executions

Real-time execution monitoring.

```javascript
// Connect
const ws = new WebSocket('wss://api.n8n-mcp.com/ws/executions');

// Subscribe
ws.send(JSON.stringify({ action: 'subscribe', workflowId: 'xxx' }));

// Events
// { type: 'execution.started', executionId: '...', timestamp: '...' }
// { type: 'node.finished', nodeId: '...', data: {...} }
// { type: 'execution.completed', status: 'success', duration: 1234 }
```

---

### 📈 Quotas & Usage

#### GET /quotas/usage

```json
// Response 200
{
  "plan": "free",
  "apiCalls": {
    "used": 45,
    "limit": 100,
    "resetAt": "2024-01-02T00:00:00Z"
  },
  "workflows": {
    "created": 5,
    "limit": 10
  }
}
```

---

## Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid workflow JSON",
    "details": [
      { "field": "nodes[0].type", "message": "Unknown node type" }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing/invalid auth |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `QUOTA_EXCEEDED` | 402 | Plan limit reached |

---

## Rate Limits

| Plan | Limit | Window |
|------|-------|--------|
| Free | 100 calls | Per day |
| Supporter | Unlimited | - |

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 55
X-RateLimit-Reset: 1704153600
```
