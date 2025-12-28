# Changelog

All notable changes to the Ment MCP Platform will be documented in this file.

---

## [2024-12-28] - Workflow Execution Fix v2

### Fixed
- **"Workflow executed! ID: N/A" - Workflows Not Actually Running**
  - **Root Cause**: Wrong API endpoint and improper response parsing
  - **Solution**: Updated `n8n.service.ts` executeWorkflow to:
    - Use `POST /workflows/{id}/execute` (correct n8n API endpoint)
    - Send data directly, not wrapped in a nested object
    - Added comprehensive debug logging to help diagnose issues  
    - Better handling of various n8n response formats

### Files Modified
- `backend/src/services/n8n.service.ts`
  - Fixed endpoint from `/executions` to `/workflows/{id}/execute`
  - Added console logging for debugging

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
