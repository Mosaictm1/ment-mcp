# 🔌 MCP Server Specifications

## Overview

MCP (Model Context Protocol) Server يسمح لـ AI assistants بالتفاعل مع n8n بشكل مباشر.

---

## Tools

### get_node_info

Get detailed information about an n8n node.

```typescript
{
  name: "get_node_info",
  description: "Get detailed information about an n8n node",
  inputSchema: {
    type: "object",
    properties: {
      nodeName: { type: "string", description: "Node name (e.g., 'httpRequest')" }
    },
    required: ["nodeName"]
  }
}
```

### search_nodes

Search for nodes by keyword.

```typescript
{
  name: "search_nodes",
  description: "Search for n8n nodes",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" },
      category: { type: "string", optional: true }
    },
    required: ["query"]
  }
}
```

### validate_workflow

Validate a workflow JSON.

```typescript
{
  name: "validate_workflow",
  description: "Validate n8n workflow JSON",
  inputSchema: {
    type: "object",
    properties: {
      workflow: { type: "object", description: "Workflow JSON" }
    },
    required: ["workflow"]
  }
}
```

### create_workflow

Deploy a workflow to n8n.

```typescript
{
  name: "create_workflow",
  description: "Create and deploy workflow to n8n",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      workflow: { type: "object" },
      activate: { type: "boolean", default: false }
    },
    required: ["name", "workflow"]
  }
}
```

### update_workflow

Update existing workflow with diff.

```typescript
{
  name: "update_workflow",
  description: "Update workflow using diff-based approach",
  inputSchema: {
    type: "object",
    properties: {
      workflowId: { type: "string" },
      diff: { type: "array", items: { type: "object" } }
    },
    required: ["workflowId", "diff"]
  }
}
```

### get_workflow_executions

Get execution history.

```typescript
{
  name: "get_workflow_executions",
  description: "Get workflow execution history",
  inputSchema: {
    type: "object",
    properties: {
      workflowId: { type: "string" },
      limit: { type: "number", default: 10 }
    },
    required: ["workflowId"]
  }
}
```

---

## Resources

### Templates Resource

```typescript
{
  uri: "n8n://templates/{category}",
  name: "Workflow Templates",
  description: "Browse workflow templates by category",
  mimeType: "application/json"
}
```

### Nodes Resource

```typescript
{
  uri: "n8n://nodes",
  name: "All n8n Nodes",
  description: "Complete list of 543 n8n nodes",
  mimeType: "application/json"
}
```

---

## Configuration

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "node",
      "args": ["path/to/mcp-server/index.js"],
      "env": {
        "N8N_API_URL": "https://your-n8n.com/api/v1",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```
