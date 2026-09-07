# ?? PATTA KELU — Enterprise Music Streaming Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Patta Kelu** ("Listen closely" / "Press Play") is a production-grade, full-stack music streaming platform architected as a clean modular monolith. It provides high-fidelity audio streaming with RFC 7233 HTTP byte-range seeking, robust dual-token security with rotating refresh tokens, comprehensive user library and playlist management, full-text catalog search, personalized recommendations, and a dedicated administration console.

---

## ??? High-Level System Architecture

```text
                    +-------------------------+
                    ¦  React 18 + TypeScript  ¦
                    ¦  Vite + Tailwind CSS    ¦
                    ¦  Zustand + HTML5 Audio  ¦
                    +-------------------------+
                                ¦ (HTTPS / REST API)
                                ?
                    +-------------------------+
                    ¦      Reverse Proxy      ¦
                    ¦     (Nginx / Gateway)   ¦
                    +-------------------------+
                                ¦
                                ?
                    +-------------------------+
                    ¦ Spring Boot Application ¦
                    ¦   (Java 17 Monolith)    ¦
                    +-------------------------¦
                    ¦ • Authentication & RBAC ¦
                    ¦ • Catalog & Metadata    ¦
                    ¦ • HTTP Range Streaming  ¦
                    ¦ • Playlists & Library   ¦
                    ¦ • Full-Text Search      ¦
                    ¦ • Recommendations Engine¦
                    ¦ • Admin & Audit Logging ¦
                    +-------------------------+
                          ¦      ¦      ¦
            +-------------+      ¦      +-------------+
            ?                    ?                    ?
   +-----------------+  +-----------------+  +-----------------+
   ¦  PostgreSQL 16  ¦  ¦  Redis 7 Cache  ¦  ¦ Object Storage  ¦
   ¦ Relational Data ¦  ¦ Rate Limiting & ¦  ¦ Audio Binaries  ¦
   ¦  & TSVector GIN ¦  ¦ Session Caching ¦  ¦  & Artworks     ¦
   +-----------------+  +-----------------+  +-----------------+
```

---

## ?? Key Features

### ?? Listener Experience
* **Persistent Audio Player**: Global HTML5 Audio player managed via a Zustand state machine (`IDLE`, `LOADING`, `PLAYING`, `PAUSED`, `BUFFERING`, `ENDED`, `ERROR`), completely decoupled from routing.
* **HTTP Byte-Range Audio Streaming**: Seamless seeking forward and backward within songs using RFC 7233 `206 Partial Content` delivery.
* **Smart Play Queue**: Add to queue, reorder, clear, play next, shuffle, and repeat (Off, All, One).
* **Search & Discovery**: Live debounced search across songs, artists, albums, and playlists, plus colorful genre browse tiles.
* **Playlists & Library**: Create public or private playlists, add/remove tracks, like songs with instant heart toggles, and follow artists.
* **Rich Artist & Album Views**: Complete discographies, monthly listener metrics, and track listings.

### ??? Security & Authentication
* **Dual-Token Architecture**: Short-lived (15m) JWT access tokens kept in React memory + rotating SHA-256 hashed refresh tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
* **Token Reuse Detection**: Immediate revocation of all user sessions if a compromised/revoked refresh token is re-presented.
* **Role-Based Access Control (RBAC)**: Enforced across endpoints and services (`ROLE_USER`, `ROLE_ARTIST`, `ROLE_ADMIN`).
* **IDOR Protection**: Private playlists are strictly inaccessible to non-owners at the database query level.

### ?? Administrator Console
* **Platform Metrics**: Live telemetry on users, songs, artists, albums, playlists, and global stream counts.
* **User Moderation**: View all users and activate or suspend accounts with a single click.
* **Direct Track Uploads**: Multipart form to upload audio binaries and cover artwork directly into storage.
* **Audit Trail**: Security and administration logs tracking IP addresses and user actions.

---

## ??? Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router v6, Zustand, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Security, Spring Data JPA, Hibernate, Bean Validation |
| **Database** | PostgreSQL 16 (production), H2 (in-memory test / zero-dependency dev fallback), Flyway |
| **Security** | JJWT (io.jsonwebtoken 0.12.5), BCrypt Work Factor 12, RFC 7807 Problem Details |
| **Code Gen & Docs** | MapStruct 1.5.5, Lombok, Springdoc OpenAPI / Swagger UI 2.5 |
| **DevOps & Containers**| Docker, Docker Compose, Multi-stage Dockerfiles, Nginx Alpine, GitHub Actions CI/CD |

---

## ?? Quick Start & Running Locally

### Prerequisites
- **Java 17+**
- **Node.js 20+ & npm**
- **Docker** (optional, for full containerized stack)

---

### Option 1: Running with Docker Compose (Recommended)

Run the entire platform (Postgres, Redis, Backend, Frontend) with one command:

```bash
docker compose up --build
```

- Frontend: [http://localhost](http://localhost)
- Backend API: [http://localhost:8081](http://localhost:8081)
- Swagger Documentation: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)

---

### Option 2: Running Directly on Your Machine

#### 1. Start the Backend:
```bash
cd backend
./mvnw.cmd spring-boot:run
```
*(On Linux/macOS, use `./mvnw spring-boot:run`)*

The backend will automatically start up on port `8081`, initialize the database schema, and seed default artists, albums, songs, and demo users.

#### 2. Start the Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ?? Default Demo Credentials

| Role | Username / Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@pattakelu.com` | `Admin@123` | Full admin panel, track uploads, moderation |
| **Standard Listener**| `user@pattakelu.com` | `User@123` | Stream, like songs, create playlists, follow |

*(Quick-fill buttons are provided on the Login page for convenience).*

---

## ?? Testing

### Running Backend Unit & Integration Tests:
```bash
cd backend
./mvnw.cmd test
```

### Running Frontend Build & Typechecks:
```bash
cd frontend
npm run build
```

---

## ?? API Endpoints Summary

Prefix: `/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new listener | No |
| `POST` | `/auth/login` | Login with email/username | No |
| `POST` | `/auth/refresh` | Rotate refresh token | Cookie |
| `POST` | `/auth/logout` | Revoke session | JWT |
| `GET`  | `/songs` | Paginated song catalog | No |
| `GET`  | `/songs/{id}` | Single song metadata | No |
| `GET`  | `/songs/{id}/stream` | RFC 7233 byte-range audio stream | No |
| `POST` | `/songs/{id}/play` | Record play history event | Optional |
| `GET`  | `/artists` | Top artists by monthly listeners | No |
| `GET`  | `/artists/{id}` | Artist profile and discography | No |
| `GET`  | `/albums/{id}` | Album tracklist | No |
| `GET`  | `/playlists/me` | Current user's playlists | Yes |
| `POST` | `/playlists` | Create new playlist | Yes |
| `GET`  | `/playlists/{id}` | Get playlist details (enforces privacy) | No / Owner |
| `POST` | `/library/likes/{songId}` | Like a song | Yes |
| `GET`  | `/library/likes` | Current user's liked songs | Yes |
| `GET`  | `/search?q={query}` | Multi-entity catalog search | No |
| `GET`  | `/discover/home` | Aggregated discovery feed | No |
| `GET`  | `/admin/stats` | Platform overview metrics | Admin |
| `PATCH`| `/admin/users/{id}/status` | Suspend or activate user | Admin |
| `POST` | `/admin/songs` | Upload and register track | Admin |
| `GET`  | `/admin/audit-logs` | Security audit trail | Admin |

---

## ?? License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
