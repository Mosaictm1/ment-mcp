# Changelog

All notable changes to the Ment MCP Platform will be documented in this file.

---

## [2024-12-28] - Radical UI Rebuild: Onboarding & Workflow Management

### Added
- **Onboarding Wizard** - New multi-step onboarding flow after registration:
  - Welcome screen with animations
  - n8n instance connection form (matching modern design)
  - Connection verification with loading state
  - Success screen with redirect to workflows

- **Enhanced Workflows Page**:
  - New `WorkflowCard` component with animations and hover effects
  - `ExecuteWorkflowModal` with advanced features:
    - **Dual-mode**: API Execute (self-hosted) or Webhook (n8n Cloud)
    - **Auto-detect Webhook URL** from workflow nodes
    - **Dynamic Input Fields** - auto-detects required inputs, shows as form fields instead of JSON
    - Toggle between **Form Mode** and **JSON Mode**
    - **Node Output Visualization** - collapsible view of execution results
  - Search and filter functionality
  - Stats bar showing total/active/inactive counts

### Changed
- **Signup Flow**: New users now redirect to `/onboarding` instead of `/dashboard`
- **Login Flow**: Returns users to `/dashboard/workflows` if they have n8n credentials, otherwise `/onboarding`
- **Dependencies**: Added `framer-motion` for smooth animations

### Files Added
- `frontend/src/components/onboarding/OnboardingWizard.tsx`
- `frontend/src/app/onboarding/page.tsx`
- `frontend/src/components/workflows/ExecuteWorkflowModal.tsx`
- `frontend/src/components/workflows/WorkflowCard.tsx`

### Files Modified
- `frontend/src/app/signup/page.tsx` - Changed redirect to onboarding
- `frontend/src/app/login/page.tsx` - Added credential check for smart redirect
- `frontend/src/app/dashboard/workflows/page.tsx` - Complete rebuild with new UI

---

## [2024-12-28] - Database Connection Pool & n8n API Fixes

### Fixed
- **Database Connection Pool Exhaustion**
  - **Root Cause**: Supabase Session mode has limited connections, Prisma was creating too many clients
  - **Solution**: Updated `prisma.ts` to:
    - Add `connection_limit=5` to prevent pool exhaustion
    - Use singleton pattern in ALL environments (not just dev)
    - Add graceful shutdown handler

- **n8n API 405 Method Not Allowed**
  - **Root Cause**: n8n Cloud doesn't support `/workflows/{id}/execute` endpoint
  - **Solution**: Added clear error message explaining that Webhook triggers are needed

### Files Modified
- `backend/src/lib/prisma.ts` - Connection pooling and singleton fixes
- `backend/src/services/n8n.service.ts` - Better error handling for 405/404

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
