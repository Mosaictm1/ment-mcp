# 🚀 Ment MCP Platform

> AI-Powered n8n Workflow Automation - Connect your AI to n8n and let it build, deploy, and debug workflows for you.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://ment-sigma.vercel.app)
[![API](https://img.shields.io/badge/API-Online-blue)](https://ment-mcp-api.onrender.com/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live URLs

| Component | URL |
|-----------|-----|
| **Frontend** | https://ment-sigma.vercel.app |
| **Backend API** | https://ment-mcp-api.onrender.com |

---

## 🎯 Overview

**Ment MCP Platform** connects AI assistants directly to n8n, enabling them to:
- ✅ Build automated workflows
- ✅ Deploy directly to your n8n instance
- ✅ Debug and fix issues
- ✅ Access 543+ nodes & 2,700+ templates

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Workflow Assistant** | Built-in Claude AI to build and fix workflows via chat |
| 🔧 **543 Node Coverage** | Complete coverage of all n8n nodes |
| 📚 **2,700+ Templates** | Ready-to-use workflow templates |
| 📊 **Workflow Management** | View, run, and manage workflows |
| 🔑 **API Keys** | Secure authentication for MCP tools |
| 📡 **Real-Time Monitoring** | Live execution tracking |
| 📝 **Plan Approval** | Review AI-generated changes before applying |
| 🔄 **Version History** | Automatic backups of workflow changes |

---

## 🤖 AI Workflow Assistant

The AI Workflow Assistant allows you to:
- **Build workflows** - Describe what you want in natural language
- **Fix workflows** - AI diagnoses and repairs broken nodes
- **Optimize workflows** - Get suggestions for improvements
- **Plan-Approve-Execute** - Review all changes before they're applied

### How it Works
1. Select your n8n instance
2. Optionally select an existing workflow to modify
3. Chat with AI to describe what you want
4. Review the generated plan with before/after diffs
5. Approve to apply changes (automatic backup created)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend** | Fastify, Prisma, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Anthropic Claude 3.5 Sonnet |
| **Auth** | JWT |
| **Hosting** | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

```
ment-mcp/
├── frontend/           # Next.js Frontend
│   ├── src/app/        # Pages (dashboard, login, signup, ai-workflows)
│   ├── src/components/ # UI components (incl. ai/ for chat interface)
│   └── src/lib/        # API client, auth context
│
├── backend/            # Fastify Backend
│   ├── src/routes/     # API routes (incl. ai.routes.ts)
│   ├── src/services/   # Business logic (incl. AI services)
│   └── prisma/         # Database schema
│
└── docs/               # Documentation
```

---

## 🚀 Quick Start

### Local Development

```bash
# Clone
git clone https://github.com/Mosaictm1/ment-mcp.git
cd ment-mcp

# Backend
cd backend
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
npm install
npm run dev  # http://localhost:3001

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev  # http://localhost:3000
```

### Required Environment Variables

**Backend (.env)**
```
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ENCRYPTION_KEY=
ANTHROPIC_API_KEY=    # Required for AI features
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📖 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/v1/auth/signup` | POST | Register |
| `/v1/auth/login` | POST | Login |
| `/v1/users/profile` | GET | Get profile |
| `/v1/users/api-keys` | GET/POST/DELETE | API Keys |
| `/v1/n8n/workflows` | GET | List workflows |
| `/v1/n8n/workflows/:id/execute` | POST | Run workflow |
| `/v1/ai/conversations` | POST | Start AI conversation |
| `/v1/ai/conversations/:id/messages` | POST | Send message to AI |
| `/v1/ai/plans/:id/approve` | POST | Approve workflow plan |
| `/v1/ai/plans/:id/reject` | POST | Reject workflow plan |

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/forever | 100 MCP calls/day, 10 AI messages/month |
| **Supporter** | €19/month | Unlimited MCP calls, Unlimited AI assistant |

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 📞 Links

- **Live App**: [ment-sigma.vercel.app](https://ment-sigma.vercel.app)
- **API**: [ment-mcp-api.onrender.com](https://ment-mcp-api.onrender.com/health)
- **GitHub**: [github.com/Mosaictm1/ment-mcp](https://github.com/Mosaictm1/ment-mcp)
