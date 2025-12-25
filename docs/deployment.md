# 🚀 Deployment Guide

## Infrastructure Overview

```mermaid
graph TB
    subgraph "CDN Layer"
        A[CloudFlare]
    end
    
    subgraph "Compute"
        B[Frontend - Vercel]
        C[Backend - Railway/Render]
        D[MCP Server - Docker]
    end
    
    subgraph "Data"
        E[(PostgreSQL - Supabase)]
        F[(Redis - Upstash)]
    end
    
    A --> B
    A --> C
    C --> E
    C --> F
```

---

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.n8n-mcp.com
NEXT_PUBLIC_WS_URL=wss://api.n8n-mcp.com/ws
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxx
```

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://default:xxx@host:6379

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# n8n
N8N_API_URL=https://my-n8n.example.com/api/v1
N8N_API_KEY=n8n_api_xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Deployment Steps

### 1. Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### 2. Backend (Railway/Render)

```bash
# Using Docker
docker build -t n8n-mcp-api .
docker push registry/n8n-mcp-api

# Or deploy via Git integration
```

### 3. Database (Supabase)

```bash
# Run migrations
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

---

## Production Checklist

- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Redis connection verified
- [ ] SSL certificates configured
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry) setup
- [ ] Backup strategy in place
- [ ] Monitoring dashboards created
- [ ] Load testing completed

---

## Scaling Considerations

| Component | Scaling Strategy |
|-----------|-----------------|
| Frontend | Vercel auto-scales |
| Backend | Horizontal (pods) |
| Database | Read replicas |
| Redis | Cluster mode |

---

## Monitoring

### Key Metrics to Watch

- API response time (P95 < 200ms)
- Error rate (< 0.1%)
- Database connections
- Redis memory usage
- Request volume per minute
