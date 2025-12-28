# Changelog

All notable changes to the Ment MCP Platform will be documented in this file.

---

## [2024-12-28] - Workflow Execution Fix

### Fixed
- **"Workflow executed! ID: N/A" - Workflows Not Actually Running**
  - **Root Cause**: The n8n API response format wasn't being parsed correctly
  - **Solution**: Updated `n8n.service.ts` executeWorkflow to:
    - Use `POST /executions` as the primary endpoint
    - Fall back to `POST /workflows/{id}/execute` for older n8n versions
    - Handle multiple response formats from different n8n versions
    - Properly extract execution ID from nested response data

### Files Modified
- `backend/src/services/n8n.service.ts`
  - Added robust response parsing for execution results
  - Added `executeWorkflowLegacy` fallback method

---

## [2024-12-28] - API Response Format Fix

### Fixed
- **Workflows Not Appearing After Instance Connection**
  - **Root Cause**: API response format mismatch between backend and frontend
  - **Details**: The n8n.routes.ts was returning workflow/execution arrays directly (`[...]`) while the frontend expected responses wrapped in a data object (`{ data: [...] }`)
  - **Solution**: Modified `n8n.routes.ts` to wrap responses:
    - `/v1/n8n/workflows` - now returns `{ data: workflows }`
    - `/v1/n8n/executions` - now returns `{ data: executions }`

### Files Modified
- `backend/src/routes/n8n.routes.ts`
  - Line 55: Changed `reply.send(workflows)` → `reply.send({ data: workflows })`
  - Line 262: Changed `reply.send(executions)` → `reply.send({ data: executions })`

---

## [2024-12-27] - AI Configuration & Pricing Update

### Changed
- Made `ANTHROPIC_API_KEY` optional for initial deployment
- Updated pricing model to reflect AI features
- AI Workflow Assistant now uses server-side API key

---

## [2024-12-26] - Initial Release

### Added
- 🎨 Modern landing page with glassmorphism design
- 🔐 User authentication (signup/login with JWT)
- 📊 Dashboard with workflow management
- 🤖 AI Workflow Assistant with Claude integration
- 🔑 API key management
- 📡 n8n instance connection and verification
- 📝 Plan approval workflow for AI changes
- 🔄 Version history for workflow modifications
