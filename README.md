# TaskFlow — Multi-Tenant B2B Project Management SaaS

A Jira-like project management platform where each company gets a completely isolated environment. Built with Spring Boot and React.

## What makes this different

Every company that registers gets their own MySQL schema — Company A can never see Company B's data. Schema routing happens dynamically using Spring's `AbstractRoutingDataSource` with tenant ID extracted from JWT token on every request.

## Tech Stack

**Backend**
- Java 21, Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA + MySQL 8
- Flyway (dual migration paths — master + per tenant)
- AbstractRoutingDataSource (dynamic schema switching)

**Frontend**
- React 18 + Vite
- React Router v6
- Axios
- TailwindCSS

## Features

- Multi-tenant architecture with schema-level isolation
- Tenant registration with automatic schema provisioning
- Role-based access — OWNER, ADMIN, MEMBER
- Project management with FREE/PRO plan limits
- Task management with subtasks and activity tracking
- Member management with invite flow
- Audit logs for every action
- In-app notifications
- Super admin panel — suspend/reactivate tenants, platform stats

## Running Locally

**Prerequisites**
- Java 21
- MySQL 8
- Node.js 18+

**Backend**

1. Create the master database:
```sql
CREATE DATABASE taskflow_master;
```

2. Update `src/main/resources/application.properties`:
```properties
spring.datasource.master.jdbc-url=jdbc:mysql://localhost:3306/taskflow_master?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.master.username=your_mysql_username
spring.datasource.master.password=your_mysql_password
```

3. Run the backend:
```bash
./mvnw spring-boot:run
```

Backend starts at `http://localhost:8080`

Flyway automatically creates all tables in `taskflow_master` on first run.

**Frontend**

1. Create `.env.local` in the frontend root:
VITE_API_BASE_URL=http://localhost:8080


2. Install and run:
```bash
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

## First Time Setup

1. Register a company at `/register`
2. Login with your credentials and tenant slug
3. Create projects, invite members, manage tasks

**Super Admin**

Insert a super admin directly into the database:
```sql
-- First generate a bcrypt hash of your password by running the app
-- Then insert:
INSERT INTO taskflow_master.super_admins (email, password, created_at)
VALUES ('admin@taskflow.com', '<bcrypt_hash>', NOW());
```

Login at `/super-admin/login`

## API Base URL
http://localhost:8080


## Project Structure
backend/
├── config/          — DataSource, Security, Flyway config
├── master/          — Tenant registry, Super admin
├── tenant/          — Projects, Tasks, Members, Notifications
├── security/        — JWT filter and utility
├── exception/       — Global exception handling
├── dto/             — Request and response objects
├── util/            — Plan limit checker, Slug generator
└── scheduler/       — Due date notification scheduler

frontend/
├── pages/           — All page components
├── components/      — Reusable UI components
├── context/         — Auth context
├── api/             — Axios API calls
└── utils/           — Helper functions

