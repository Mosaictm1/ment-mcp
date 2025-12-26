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
| 🔧 **543 Node Coverage** | Complete coverage of all n8n nodes |
| 📚 **2,700+ Templates** | Ready-to-use workflow templates |
| 📊 **Workflow Management** | View, run, and manage workflows |
| 🔑 **API Keys** | Secure authentication for MCP tools |
| 📡 **Real-Time Monitoring** | Live execution tracking |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 19, Tailwind CSS |
| **Backend** | Fastify, Prisma, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT |
| **Hosting** | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

```
ment-mcp/
├── frontend/           # Next.js Frontend
│   ├── src/app/        # Pages (dashboard, login, signup)
│   ├── src/components/ # UI components
│   └── src/lib/        # API client, auth context
│
├── backend/            # Fastify Backend
│   ├── src/routes/     # API routes
│   ├── src/services/   # Business logic
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
npm install
npm run dev  # http://localhost:3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # http://localhost:3000
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

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/forever | 100 MCP calls/day |
| **Supporter** | €19/month | Unlimited calls |

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 📞 Links

- **Live App**: [ment-sigma.vercel.app](https://ment-sigma.vercel.app)
- **API**: [ment-mcp-api.onrender.com](https://ment-mcp-api.onrender.com/health)
- **GitHub**: [github.com/Mosaictm1/ment-mcp](https://github.com/Mosaictm1/ment-mcp)
