# Deployment Guide

This repository contains both the frontend (React + Vite) and backend (Spring Boot) applications.

---

## 1. Cloud VM Deployment (Automatic Single-Command via Docker Compose)

Deploy both frontend (port 3000) and backend (port 8080) simultaneously on any cloud VM (AWS EC2, DigitalOcean, Google Compute Engine, Hetzner, etc.):

```bash
# 1. Clone repository
git clone <your-repo-url>
cd medical_records_app_antigravity

# 2. Build and launch both services
docker compose up -d --build
```

- **Frontend**: Available on port `3000` (serviced by Nginx, pre-configured with `/api/` proxy to the backend container).
- **Backend**: Available on port `8080` (Spring Boot).
- **Persistent storage**: H2 database and uploaded documents are automatically saved in Docker named volumes (`backend-data` and `backend-uploads`).

---

## 2. Vercel Deployment (Frontend) + Cloud Backend

When deploying the frontend to Vercel and hosting the Spring Boot backend on a cloud service (e.g., Render, Railway, Fly.io, AWS, or a VM):

1. **Deploy Frontend on Vercel**:
   - Import this GitHub repository into Vercel.
   - Root Directory: `./` (or leave default).
   - Vercel automatically detects `vercel.json` (Vite framework, `npm run build`, `dist` output, SPA route rewrites).

2. **Connect to Backend**:
   - In your Vercel Project Settings → **Environment Variables**, add:
     ```
     VITE_API_BASE_URL = https://your-backend-domain.com/api
     ```
   - Redeploy or trigger a build. The frontend will now call your remote backend directly.
   - The Spring Boot backend includes pre-configured CORS headers (`allowOriginPatterns: *`, credentials allowed) to support cross-domain requests out of the box.

---

## 3. Local Development

- **Backend**: Runs on port `8080` (`mvn spring-boot:run` or `java -jar backend/target/medical-records-backend-1.0.0.jar`)
- **Frontend**: Runs on port `3000` (`npm run dev`)
- Vite dev server automatically proxies all `/api` requests to `http://localhost:8080`.
