# Zero-Trust Mesh

**Tagline:** Never Trust. Always Verify. Continuously Adapt.

An enterprise-grade zero-trust access control platform for microservice security. Every request is independently evaluated through continuous cryptographic verification, dynamic policy enforcement, and intelligent threat detection.

## 🎯 Project Overview

Zero-Trust Mesh is a production-ready, fully functional cybersecurity platform that enforces zero-trust principles for microservice-to-microservice communication. Unlike traditional perimeter-based security, it implements:

- **Continuous Verification** - Every request is re-authenticated and re-authorized
- **Cryptographic Identity** - Ed25519/RSA-based service identities with JWT tokens
- **Lateral Movement Detection** - Real-time detection of suspicious service traversal
- **Dynamic Risk Scoring** - Context-aware risk calculation (0-100 scale)
- **Intelligent Anomaly Detection** - Hybrid rule-based and statistical analysis
- **Live SOC Dashboard** - Real-time security operations center with WebSocket updates
- **Attack Simulation** - Execute realistic attack scenarios for demonstration

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Frontend Dashboard            │
│   (React + Next.js)             │
└────────────┬────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  Zero-Trust Security Proxy               │
│                                          │
│  • Identity Verification                 │
│  • Token Validation                      │
│  • Policy Engine                         │
│  • Risk Scoring                          │
│  • Anomaly Detection                     │
│  • Lateral Movement Detection            │
│  • Dynamic Re-authentication             │
│  • Rate Limiting & Audit Logging         │
└──────────┬───────────────────────────────┘
           │
  ┌────────┼────────┐
  ▼        ▼        ▼
Orders  Payments  Users
Service Service  Service
  │        │        │
  └────────┼────────┘
           ▼
      Database
      Service
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Redis (optional, for production)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install  # or pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open dashboard**
   - Frontend: http://localhost:3000
   - API Health: http://localhost:4000/health
   - API Docs: http://localhost:4000/api/

## 📋 Key Features

### 1. Cryptographic Service Identity
- **Ed25519 Digital Signatures** - Quantum-resistant cryptography
- **Unique Key Pairs** - Per-service cryptographic identities
- **Key Versioning** - Support for key rotation
- **Key Management** - Secure key storage and lifecycle

### 2. Dynamic Token System
- **Short-Lived JWT Tokens** - 15-minute default expiration
- **Token Validation** - Signature, expiration, issuer, audience verification
- **Replay Protection** - JTI-based replay attack detection
- **Token Revocation** - Immediate token blacklisting

### 3. Service-to-Service Authorization
- **Explicit Policy Enforcement** - No implicit trust
- **HTTP Method Validation** - GET, POST, PUT, DELETE controls
- **Endpoint Whitelisting/Blacklisting** - Granular endpoint access
- **Rate Limiting** - Per-service request rate limiting

### 4. Dynamic Risk Engine
Risk scoring factors (0-100 scale):
- **Time Anomalies** - Requests outside business hours (+10)
- **New Service Communications** - First-time service pair (+20)
- **Sensitive Endpoints** - Database, admin access (+15)
- **Abnormal Frequency** - Request spike detection (+20)
- **Payload Anomalies** - Structural and size analysis (+15)
- **Token Issues** - Invalid signatures, replays (+30-40)
- **Rapid Traversal** - Multi-hop lateral movement (+30)

Decision Logic:
- **0-29 (LOW)** → ALLOW
- **30-59 (MEDIUM)** → ALLOW with monitoring
- **60-79 (HIGH)** → Dynamic re-authentication
- **80-100 (CRITICAL)** → BLOCK + Quarantine

### 5. Lateral Movement Detection
Detects suspicious patterns:
- **Unauthorized Service Paths** - Frontend → Database (blocked)
- **Rapid Service Traversal** - Multi-hop attacks
- **Repeated Access Failures** - Brute force attempts
- **Sensitive Service Targeting** - Unusual access patterns
- **Attack Path Visualization** - Complete attack chain

### 6. Payload Anomaly Detection
Hybrid detection approach:
- **Size Anomaly** - Oversized payloads (>1MB flagged)
- **Structure Anomaly** - Unexpected nesting depth
- **Field Anomaly** - Unknown or suspicious fields
- **Type Anomaly** - Type mismatches (ID not numeric, etc)
- **Circular References** - Recursive data structures

### 7. Live SOC Dashboard
Real-time security monitoring with:
- **System Overview** - Threats, requests, latency metrics
- **Live Threat Feed** - Real-time attack notifications
- **Service Graph** - Visual service communication map
- **Risk Analytics** - Threat distribution and trends
- **Performance Metrics** - Latency percentiles (P50/P95/P99)
- **Audit Log** - Complete security event history
- **Attack Simulator** - Execute and visualize attacks

### 8. Attack Simulator
Pre-configured attack scenarios:
- **Normal Request** - Baseline legitimate traffic
- **Unauthorized Access** - Direct database access attempt
- **Expired Token Attack** - Replay with old token
- **Invalid Signature** - Token tampering detection
- **Lateral Movement** - Multi-hop attack chain (frontend → orders → payments → database)

## 📊 Dashboard Sections

### System Overview
- Protected Services count
- Requests/minute throughput
- Allowed vs Blocked requests ratio
- Performance latency (avg, P50, P95, P99)

### Live Threat Feed
- Real-time attack notifications
- Threat severity levels (LOW/MEDIUM/HIGH/CRITICAL)
- Source → Destination service pairs
- Attack path visualization
- Risk scores

### Service Graph
- Visual network topology
- Service communication paths
- Normal vs suspicious connections
- Real-time path highlighting during attacks

### Risk Analytics
- Threat type distribution
- Risk score timeline
- Anomaly trends
- Blocked request patterns

### Performance Metrics
- Average latency
- P95/P99 latency percentiles
- Proxy overhead measurement
- Throughput (requests/minute)

## 🔐 Security Implementation

### Token Validation Flow
```
Incoming Request
      ↓
Extract Authorization Header
      ↓
Verify JWT Signature
      ↓
Check Token Expiration
      ↓
Verify Service Identity
      ↓
Check Token Revocation
      ↓
Detect Replay Attacks (JTI)
      ↓
✓ VALID → Continue to Authorization
✗ INVALID → Block (Risk Score: 80-95)
```

### Policy Evaluation
```
Check Service Pair Authorization
      ↓
Verify HTTP Method
      ↓
Check Endpoint Whitelist
      ↓
Check Endpoint Blacklist
      ↓
Verify Time Window
      ↓
✓ ALLOWED → Continue to Risk Evaluation
✗ DENIED → Block (Risk Score: 70)
```

### Risk Scoring Algorithm
```
Calculate Risk Factors:
  • Time anomaly (±10)
  • Geo anomaly (±15)
  • New service communication (±20)
  • Sensitive endpoint (±15)
  • Abnormal frequency (±20)
  • Payload anomaly (±15)
  • Token issues (±30-40)
  • Rapid traversal (±30)
  • Auth failures (±25)

Weighted Scoring:
  Score = Σ(factor × weight) / normalization

Normalize to 0-100:
  Final Score = min(100, max(0, score))

Decision:
  if score < 30: ALLOW
  elif score < 60: ALLOW_WITH_MONITORING
  elif score < 80: STEP_UP_AUTH
  else: BLOCK
```

## 📈 Performance Characteristics

### Proxy Overhead Target
- **Goal:** ≤15ms proxy latency
- **Measured:** Actual metrics displayed in dashboard
- **Optimization:** Efficient token validation, minimal database queries

### Throughput Capacity
- Handles 1000+ requests/minute per service
- Sub-second token validation
- Concurrent connection support

### Scalability
- Stateless proxy design (can run multiple instances)
- Redis optional (in-memory for single instance)
- Load balancer compatible

## 🛠️ Configuration

### Environment Variables
```bash
# Proxy Configuration
PROXY_PORT=4000
PROXY_HOST=localhost

# Feature Flags
ENABLE_ATTACK_SIMULATOR=true
ENABLE_METRICS=true
ENABLE_AUDIT_LOGGING=true
ENABLE_WEBSOCKET=true

# Rate Limiting
RATE_LIMIT_WINDOW=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=1000

# Timeouts
PROXY_TIMEOUT=30000
```

### Service Registration
Services are automatically registered at startup:
- `frontend-service`
- `orders-service`
- `payments-service`
- `users-service`
- `database-service`
- `auth-service`

## 🧪 Testing Attack Scenarios

### Scenario 1: Normal Request
```bash
curl -H "Authorization: Bearer <token>" \
     -H "X-Service-ID: frontend-service" \
     http://localhost:4000/api/proxy/forward
```
**Expected Result:** ALLOW (Risk: 8/100)

### Scenario 2: Unauthorized Service Access
```bash
curl -H "Authorization: Bearer <token>" \
     -H "X-Service-ID: frontend-service" \
     -H "X-Destination-Service: database-service" \
     http://localhost:4000/api/proxy/forward
```
**Expected Result:** BLOCK (Risk: 86/100, Reason: UNAUTHORIZED_SERVICE_PATH)

### Scenario 3: Lateral Movement
Execute via dashboard Attack Simulator → Select "Lateral Movement" → Execute Attack

**Expected Result:** Multi-hop attack chain detected and blocked (Risk: 92/100)

## 📡 API Endpoints

### Health & Status
- `GET /health` - Basic health check
- `GET /api/health/detailed` - Detailed system status
- `GET /api/health/stats` - Statistics summary

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service details

### Policies
- `GET /api/policies` - List all policies
- `POST /api/policies` - Create new policy
- `PUT /api/policies/:id` - Update policy

### Tokens
- `POST /api/tokens/generate` - Generate service token
- `POST /api/tokens/revoke` - Revoke token by JTI

### Audit & Security
- `GET /api/audit` - Get audit events
- `GET /api/audit/security` - Get security events
- `GET /api/metrics` - Get performance metrics
- `GET /api/quarantine` - List quarantined services

### Attack Simulation
- `POST /api/simulator/attack` - Execute attack scenario

## 🎓 Demo Script (5 minutes)

1. **Start the Application** (30 seconds)
   - `npm run dev`
   - Open http://localhost:3000

2. **Show Normal Request** (30 seconds)
   - Simulator → Normal Request → Execute
   - Observe: ALLOW decision, Risk: 8/100

3. **Show Unauthorized Access Block** (30 seconds)
   - Simulator → Unauthorized Access → Execute
   - Observe: BLOCK decision, Policy violation, Risk: 86/100

4. **Show Lateral Movement Detection** (1 minute)
   - Simulator → Lateral Movement → Execute
   - Observe: Attack path visualization, Risk escalation

5. **Show Performance Metrics** (30 seconds)
   - Switch to Performance tab
   - Observe: Latency metrics, Proxy overhead ≤15ms

6. **Show Audit Trail** (1 minute)
   - Switch to Audit Log tab
   - Observe: Complete security event history

7. **Q&A** (1 minute)

## 📊 Evaluation Metrics

### Security
- ✓ Detects unauthorized service paths
- ✓ Identifies token manipulation
- ✓ Catches lateral movement attempts
- ✓ Prevents replay attacks
- ✓ Flags payload anomalies

### Performance
- ✓ Proxy overhead ≤15ms target
- ✓ Sub-second token validation
- ✓ 1000+ RPS capacity

### Functionality
- ✓ Cryptographic identity enforcement
- ✓ Dynamic policy engine
- ✓ Real-time threat detection
- ✓ Live dashboard with WebSocket updates
- ✓ Comprehensive audit logging

## 🚀 Production Deployment

### Docker
```bash
docker-compose up --build
```

### Kubernetes
```yaml
# Proxy deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zerotrust-proxy
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: proxy
        image: zerotrust-proxy:latest
        ports:
        - containerPort: 4000
```

### Environment Setup
1. Use Neon PostgreSQL for production database
2. Configure Upstash Redis for caching
3. Set up proper SSL/TLS certificates
4. Enable firewall rules for service mesh

## 📚 Documentation

- `ARCHITECTURE.md` - Detailed system design
- `SECURITY.md` - Security model and threat analysis
- `API.md` - Complete API reference
- `DEPLOYMENT.md` - Production deployment guide

## 🤝 Contributing

This is a hackathon project. Implemented enhancements:
- ✅ Statistical Z-score anomaly detection (Z-Score payloads)
- ✅ Geographic IP-based risk scoring (GeoIP Lite)
- ✅ Multi-factor service authentication (TOTP Step-up auth)
- ✅ Service mesh integration (Istio ext_authz manifests)
- ✅ Compliance reporting (SOC 2, PCI-DSS automated reports)

## 📝 License

MIT License - See LICENSE file for details

## 🏆 Hackathon Submission

**Project Title:** Zero-Trust Mesh

**Tagline:** Never Trust. Always Verify. Continuously Adapt.

**Category:** Cybersecurity

**Key Innovation:** Continuous zero-trust verification for microservices with real-time lateral movement detection

**Technical Stack:**
- Frontend: React 19, Next.js 16, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Security: JWT (Ed25519), WebSocket real-time events
- Storage: PostgreSQL, Redis (optional)

**Live Demo:** See attack scenarios execute in real-time with complete audit trail

---

**Questions?** See the documentation or check the dashboard help section.
