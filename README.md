# 🏥 My Family Medical Records

> **By My Friend Insurancewala** — A production-ready health record management web application for families to securely store medical documents, insurance policies, and claim records.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Demo Credentials](#demo-credentials)
- [Quick Start — Docker](#quick-start--docker)
- [Local Development](#local-development)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Test Results](#test-results)

---

## Overview

**My Family Medical Records** helps you and your family:
- Store prescriptions, lab reports, X-rays, hospital bills, and vaccination records
- Track health insurance policies with renewal reminders
- Manage insurance claim dossiers with document checklists
- Generate printable emergency health summaries for hospital visits
- Provide advisor-access (opt-in) so your insurance advisor can assist with claims

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Spring Boot 3.3.1 · Java 17 · Spring Security · JWT (jjwt 0.12.6) |
| **Database** | H2 (dev/file-based) · PostgreSQL (prod profile) |
| **File Storage** | Local filesystem (configurable to cloud storage) |
| **Frontend** | React 19 · React Router 7 · Axios · Vite 8 |
| **Deployment** | Docker · Docker Compose · Nginx |
| **Tests** | JUnit 5 · **26 tests · BUILD SUCCESS ✅** |

---

## Features

| Module | Features |
|--------|---------|
| 🔐 **Auth** | JWT login/register · BCrypt passwords · Multi-tenant isolation |
| 👨‍👩‍👧‍👦 **Family** | Add/edit family member profiles · Blood group · Allergies · ABHA Address |
| 📋 **Medical Records** | 7 document categories · File upload (PDF/JPG/PNG ≤25MB) · Download |
| 🛡️ **Insurance** | Policy tracking · Expiry alerts · Cashless portal links · Document upload |
| 📄 **Claims** | Claim dossier per policy · Document checklist (12 items) · Status tracking |
| 🔔 **Reminders** | Medicine · Appointment · Renewal reminders · Daily/Weekly/Monthly recurrence |
| 🚨 **Emergency** | Printable emergency health card · Active policies · Medications · Allergies |
| 📊 **Dashboard** | Stats · Expiry alerts · Quick actions |
| 🔍 **Advisor Access** | Client consent-gated · Read-only view for insurance advisor |
| 📝 **Audit Logs** | Every data access logged for compliance |

---

## Demo Credentials

```
Mobile:   9876543210
Password: Password@123
```

> Demo account includes: Rajesh Sharma family (4 members), 2 insurance policies, 1 claim, 6 medical records, and 4 reminders pre-loaded.

---

## Quick Start — Docker

### Prerequisites
- Docker Desktop installed and running

### Run with Docker Compose

```bash
# From project root
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8080/api
# Health:   http://localhost:8080/api/health
```

### Stop

```bash
docker-compose down
```

---

## Local Development

### Backend

**Requirements:** JDK 17, Maven 3.8+

```bash
cd backend

# Run (H2 database, auto-creates demo data on first start)
mvn spring-boot:run

# Run all 26 tests
mvn clean test

# Package JAR for deployment
mvn package
# Output: target/medical-records-backend-1.0.0.jar

# Run the JAR directly
java -jar target/medical-records-backend-1.0.0.jar

# API available at http://localhost:8080/api
```

### Frontend

**Requirements:** Node.js 18+

```bash
# From project root
npm install
npm run dev     # Dev server at http://localhost:3000 (proxied to backend at :8080)
npm run build   # Production build in dist/
```

---

## API Reference

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT token |
| PUT | `/api/auth/consent` | Update advisor consent |

### Family Members (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/family` | List all family members |
| POST | `/api/family` | Add family member |
| PUT | `/api/family/{id}` | Update family member |
| DELETE | `/api/family/{id}` | Delete family member |

### Medical Records (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records` | List records (filterable by member/category) |
| POST | `/api/records` | Add record with file upload (multipart) |
| PUT | `/api/records/{id}` | Update record |
| DELETE | `/api/records/{id}` | Delete record |
| GET | `/api/records/{id}/download` | Download attached file |

### Insurance Policies (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/policies` | List all policies (with days-until-expiry) |
| POST | `/api/policies` | Add policy with optional document upload |
| PUT | `/api/policies/{id}` | Update policy |
| DELETE | `/api/policies/{id}` | Delete policy |

### Claims (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/claims` | List all claims |
| POST | `/api/claims` | Create claim dossier |
| PUT | `/api/claims/{id}` | Update claim & status |
| DELETE | `/api/claims/{id}` | Delete claim |

### Reminders (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | List reminders |
| POST | `/api/reminders` | Create reminder |
| PUT | `/api/reminders/{id}` | Update/toggle reminder |
| DELETE | `/api/reminders/{id}` | Delete reminder |

### Emergency Summary (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emergency/{memberId}` | Generate emergency health card |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check (public) |

---

## Project Structure

```
final-assessment-project/
├── backend/                              # Spring Boot backend
│   ├── src/main/java/com/myfriendinsurancewala/
│   │   ├── config/                       # JWT, Security, DataInitializer
│   │   ├── controller/                   # 8 REST controllers
│   │   ├── dto/                          # Request/Response DTOs
│   │   ├── exception/                    # GlobalExceptionHandler
│   │   ├── model/                        # JPA entities + enums
│   │   ├── repository/                   # Spring Data JPA
│   │   └── service/                      # Business logic services
│   ├── src/main/resources/application.yml
│   ├── src/test/                         # 26 unit tests ✅
│   ├── pom.xml                           # Spring Boot 3.3.1, Java 17
│   └── Dockerfile                        # Multi-stage build
│
├── src/                                  # React 19 frontend
│   ├── components/
│   │   ├── auth/LoginPage.jsx            # Login + Register + Consent
│   │   ├── layout/Layout|Sidebar|Topbar  # App shell
│   │   ├── dashboard/Dashboard.jsx       # Stats + quick actions
│   │   ├── family/FamilyMembersPage.jsx  # Family profiles
│   │   ├── records/MedicalRecordsPage.jsx# Records + file upload
│   │   ├── policies/InsurancePoliciesPage.jsx
│   │   ├── claims/ClaimsPage.jsx         # Claim dossier + checklist
│   │   ├── reminders/RemindersPage.jsx   # Reminders with toggle
│   │   ├── emergency/EmergencySummaryPage.jsx
│   │   └── common/Toast.jsx · UI.jsx     # Shared components
│   ├── services/api.js · authService.js  # API layer
│   ├── App.jsx                           # Routes + PrivateRoute
│   └── index.css                         # Brand theme (teal/green)
│
├── Dockerfile                            # Frontend Nginx image
├── docker-compose.yml                    # Full-stack deployment
├── nginx.conf                            # SPA config + API proxy
├── vite.config.js                        # Vite + dev proxy
└── README.md
```

---

## Test Results

```
[INFO] Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS — Total time: 38.165 s
```

| Test Class | Tests | Coverage |
|------------|-------|----------|
| `AuthControllerTest` | 8 | Auth DTOs, mobile validation, JWT response |
| `HealthControllerTest` | 5 | Health endpoint, status, brand, version |
| `InsurancePolicyAndSummaryTest` | 7 | Policy DTO, Emergency summary, ClaimStatus, ReminderType |
| `MedicalRecordServiceTest` | 6 | Record DTO, RecordCategory enum, file fields |

---

## Security

- Every user sees **only their own** data (multi-tenant enforcement in all services)
- Advisor access requires explicit `allowAdvisorAccess = true` opt-in by client
- Passwords hashed with **BCrypt** (strength 12)
- All endpoints except `/api/auth/**` and `/api/health` require **JWT Bearer token**
- Uploaded files stored with **UUID-based filenames**
- File uploads limited to **25 MB**, only PDF/JPG/PNG accepted
- All data access is **audit-logged**

---

## Production Deployment

Use the `prod` Spring profile with PostgreSQL:

```bash
docker-compose up --build -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/medicalrecords \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=your_secure_password \
  -e APP_JWT_SECRET=your-very-long-256-bit-secret-key-here
```

---

> ⚠️ **Disclaimer:** This app helps organize medical and insurance documents. It does not replace a doctor's advice or guarantee insurance claim approval. Ensure compliance with Indian data protection laws (DPDPA 2023) before deploying with real patient data.

---

*Built with ❤️ for My Friend Insurancewala clients*
