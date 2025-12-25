# 🏗️ Technical Architecture

## System Overview

```mermaid
graph TB
    subgraph "Clients"
        A[AI Assistants] --> B[MCP Protocol]
        C[Web Browser] --> D[HTTPS]
        E[Mobile App] --> D
    end
    
    subgraph "Load Balancer"
        F[Nginx / CloudFlare]
    end
    
    B --> F
    D --> F
    
    subgraph "Application Layer"
        G[Frontend - Next.js]
        H[Backend API - Fastify]
        I[MCP Server - Node.js]
    end
    
    F --> G
    F --> H
    F --> I
    
    subgraph "Supabase"
        J[(PostgreSQL)]
        K[Auth]
        L[Realtime]
        M[Edge Functions]
        N[Storage]
    end
    
    G --> J
    G --> K
    H --> J
    H --> L
    I --> J
    
    subgraph "External Services"
        O[n8n Cloud API]
        P[Stripe Payments]
        Q[Sentry Monitoring]
    end
    
    H --> O
    H --> P
    H --> Q
```

---

## Component Architecture

### Frontend Architecture

```mermaid
graph TB
    subgraph "Next.js App Router"
        A[Layout] --> B[Pages]
        B --> C[Landing Page]
        B --> D[Dashboard]
        B --> E[Auth Pages]
    end
    
    subgraph "Component Library"
        F[UI Components]
        G[Feature Components]
        H[Layout Components]
    end
    
    C --> F
    D --> F
    D --> G
    
    subgraph "State Management"
        I[TanStack Query]
        J[Zustand Store]
    end
    
    G --> I
    G --> J
```

### Backend Architecture

```mermaid
graph TB
    subgraph "API Gateway"
        A[Fastify Server]
        B[Rate Limiter]
        C[Auth Middleware]
    end
    
    A --> B --> C
    
    subgraph "Services"
        D[Auth Service]
        E[User Service]
        F[Workflow Service]
        G[n8n Service]
        H[Template Service]
    end
    
    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    
    subgraph "Data Access"
        I[Prisma ORM]
        J[Redis Client]
    end
    
    D & E & F & G & H --> I
    D & E & F & G & H --> J
```

---

## Technology Decisions

### Frontend Stack

| Technology | Purpose | Justification |
|------------|---------|---------------|
| Next.js 14+ | Framework | App Router, SSR, API routes |
| Tailwind CSS | Styling | Rapid development, consistent design |
| shadcn/ui | Components | Accessible, customizable |
| TanStack Query | Data fetching | Caching, mutations, real-time |
| Zustand | State | Simple, TypeScript-friendly |
| Framer Motion | Animations | Smooth, performant |

### Backend Stack

| Technology | Purpose | Justification |
|------------|---------|---------------|
| Node.js 20+ | Runtime | Modern features, performance |
| Fastify | Framework | Fast, TypeScript support |
| TypeScript | Language | Type safety, better DX |
| PostgreSQL | Database | Reliable, feature-rich |
| Prisma | ORM | Type-safe, migrations |
| Redis | Cache | Fast, pub/sub support |

---

## Security Architecture

```mermaid
graph LR
    A[Client] -->|HTTPS| B[CloudFlare WAF]
    B --> C[Load Balancer]
    C --> D[API Server]
    D -->|Encrypted| E[(Database)]
    D --> F[JWT Validation]
    F --> G[RBAC Check]
    G --> H[Business Logic]
```

### Security Measures

- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-Based Access Control (RBAC)
- **Encryption**: TLS 1.3, AES-256 at rest
- **API Security**: Rate limiting, CORS, CSRF protection
- **Secrets**: HashiCorp Vault / AWS Secrets Manager

---

## Scalability Strategy

### Horizontal Scaling

```
                    ┌─────────────┐
                    │   Nginx LB  │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  API Pod 1  │ │  API Pod 2  │ │  API Pod 3  │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
              ┌────────────┼────────────┐
       ┌──────▼──────┐          ┌──────▼──────┐
       │  PostgreSQL │          │    Redis    │
       │   Primary   │          │   Cluster   │
       └──────┬──────┘          └─────────────┘
              │
       ┌──────▼──────┐
       │  Read Replica│
       └─────────────┘
```

### Caching Strategy

| Layer | Technology | TTL | Use Case |
|-------|------------|-----|----------|
| CDN | CloudFlare | 24h | Static assets |
| API | Redis | 1h | Node data, templates |
| Database | Query cache | 5m | Frequent queries |

---

## Monitoring & Observability

### Metrics Stack

- **APM**: DataDog / New Relic
- **Logs**: Winston → CloudWatch / ELK
- **Errors**: Sentry
- **Uptime**: UptimeRobot
- **Alerts**: PagerDuty

### Key Metrics

- API response time (P95 < 200ms)
- Error rate (< 0.1%)
- Uptime (99.9%)
- User sessions
- API call volume
