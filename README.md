# 🚀 n8n MCP Platform

> منصة احترافية تتيح لمساعدات AI بناء automated workflows في n8n بدقة عالية

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem & Solution](#problem--solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**n8n MCP Platform** هي منصة Model Context Protocol (MCP) متكاملة تحل مشكلة فشل AI assistants في بناء n8n workflows بسبب:
- JSON properties خاطئة
- Documentation قديمة
- عدم وجود validation

### The Solution

منصة توفر:
- ✅ ربط مباشر بين AI و n8n
- ✅ Documentation محدثة دائماً
- ✅ Validation ذكية
- ✅ Real-time monitoring
- ✅ Live workflow access

---

## 🎯 Problem & Solution

| المشكلة | الحل |
|---------|------|
| Copy-Paste JSON | Direct Deployment |
| Screenshots | Live Workflow Access |
| Outdated Configs | Always Current |
| Blind Debugging | Smart Self-Correction |

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔧 **543 Node Coverage** | Complete coverage of all n8n nodes with 99% accuracy |
| 📚 **2,700+ Templates** | Ready-to-use workflow templates |
| 📊 **Diff-Based Updates** | 80-90% token savings |
| 📡 **Real-Time Monitoring** | Live execution tracking |
| 🔌 **Full n8n API Access** | Complete API integration |
| 📖 **Always Current Docs** | Auto-updated documentation |

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **ORM**: Prisma / Supabase Client
- **Auth**: Supabase Auth

### DevOps
- **Containers**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + DataDog

---

## 📁 Project Structure

```
n8n-mcp/
├── docs/                          # Documentation
│   ├── implementation_plan.md     # Implementation plan
│   ├── architecture.md            # Technical architecture
│   ├── api-specs.md               # API specifications
│   ├── database-schema.md         # Database design
│   ├── frontend-guide.md          # Frontend components
│   ├── deployment.md              # Deployment guide
│   └── development.md             # Development workflow
│
├── frontend/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/                   # App router pages
│   │   ├── components/            # React components
│   │   ├── lib/                   # Utilities
│   │   ├── hooks/                 # Custom hooks
│   │   └── styles/                # Global styles
│   ├── public/                    # Static assets
│   └── package.json
│
├── backend/                       # Node.js Backend
│   ├── src/
│   │   ├── api/                   # API routes
│   │   ├── services/              # Business logic
│   │   ├── models/                # Database models
│   │   ├── middleware/            # Express middleware
│   │   ├── utils/                 # Utilities
│   │   └── config/                # Configuration
│   ├── prisma/                    # Prisma schema
│   └── package.json
│
├── mcp-server/                    # MCP Server
│   ├── src/
│   │   ├── tools/                 # MCP tools
│   │   ├── resources/             # MCP resources
│   │   └── prompts/               # MCP prompts
│   └── package.json
│
├── docker/                        # Docker configurations
├── scripts/                       # Utility scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/n8n-mcp.git
cd n8n-mcp

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:migrate
npm run db:seed

# Start development
npm run dev
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Implementation Plan](docs/implementation_plan.md) | Development phases & milestones |
| [Architecture](docs/architecture.md) | System architecture & design |
| [API Specifications](docs/api-specs.md) | Complete API documentation |
| [Database Schema](docs/database-schema.md) | Database design & ERD |
| [Frontend Guide](docs/frontend-guide.md) | Components & styling |
| [Deployment](docs/deployment.md) | Production deployment |
| [Development](docs/development.md) | Development workflow |

---

## 💰 Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/forever | 100 MCP calls/day, All 543 nodes, 2,700+ templates |
| **Supporter** | €19/month | Unlimited calls, Priority support, Early access |

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **Website**: [n8n-mcp.com](https://n8n-mcp.com)
- **GitHub**: [github.com/your-org/n8n-mcp](https://github.com/your-org/n8n-mcp)
- **Email**: support@n8n-mcp.com
