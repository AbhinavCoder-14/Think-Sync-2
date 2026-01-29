# 🧠 Think-Sync-2

> A real-time multiplayer quiz platform built with microservices architecture, featuring Socket.io for bidirectional communication, Redis for caching and state persistence, and NextAuth for authentication.

[![TypeScript](https://img.shields.io/badge/TypeScript-79.7%25-3178c6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-14.4%25-f7df1e?style=flat&logo=javascript&logoColor=black)](https://www.javascript.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🔄 Data Flow](#-data-flow)
- [🚀 Getting Started](#-getting-started)
- [📦 Project Structure](#-project-structure)
- [🔧 Tech Stack](#-tech-stack)
- [⚙️ Configuration](#️-configuration)
- [🛣️ Development Roadmap](#️-development-roadmap)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### ✅ Current Features
- 🎮 **Real-time Multiplayer Quiz** - Multiple players compete simultaneously
- 🔌 **Socket.io Communication** - Instant bidirectional event-driven updates
- 📊 **Live Leaderboard** - Real-time score tracking and rankings
- 👥 **Dynamic User Management** - Join/leave handling with live player count
- 🎯 **Admin Dashboard** - Create rooms, manage quizzes, and start games
- 💬 **Interactive UI** - Modern, responsive interface with Framer Motion animations
- 🔐 **NextAuth Authentication** - Secure admin/player role-based access
- 🐳 **Docker Compose Setup** - PostgreSQL and Redis containers ready

### 🚧 In Development
- 💾 **Redis Checkpointing** - Persist quiz state for disconnection recovery
- 🔄 **Session Recovery** - Resume quiz progress after connection loss
- 📈 **Analytics Dashboard** - Track performance metrics and statistics
- 🐳 **Full Dockerization** - Frontend & Backend Docker images (coming soon)

---

## 🏗️ System Architecture

Think-Sync-2 uses a microservices pattern with Socket.io for real-time communication:

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        NextJS["🖥️ Next.js App<br/>(Port 3000)<br/>React + Socket.io Client"]
    end

    subgraph "Backend Services"
        SocketIO["🔌 Socket.io Server<br/>(Port 4000)<br/>Event Manager"]
        UserMgr["👥 User Manager<br/>Join/Leave/Admin"]
        QuizMgr["📝 Quiz Manager<br/>Questions/Answers"]
        QuizLogic["🎯 Quiz Logic<br/>Scoring/State"]
    end

    subgraph "Data Persistence"
        RedisCache["💾 Redis<br/>(Port 6379)<br/>Session + Scores"]
        RedisCheck["📦 Redis Checkpoints<br/>🚧 State Recovery<br/>(In Development)"]
        PostgreSQL["🔐 PostgreSQL<br/>(Port 5432)<br/>NextAuth Only"]
    end

    subgraph "🚧 Future Docker Images"
        DockerFE["🐳 Frontend Image<br/>(Planned)"]
        DockerBE["🐳 Backend Image<br/>(Planned)"]
    end

    NextJS <-->|"Socket.io Events"| SocketIO
    NextJS <-->|"NextAuth API"| PostgreSQL
    
    SocketIO --> UserMgr
    SocketIO --> QuizMgr
    
    UserMgr --> QuizLogic
    QuizMgr --> QuizLogic
    
    QuizLogic <--> RedisCache
    QuizLogic -.->|"🚧 TODO"| RedisCheck
    
    UserMgr <--> RedisCache
    
    NextJS -.->|"Future"| DockerFE
    SocketIO -.->|"Future"| DockerBE

    style NextJS fill:#0ea5e9,stroke:#fff,stroke-width:2px,color:#fff
    style SocketIO fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style UserMgr fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff
    style QuizMgr fill:#f59e0b,stroke:#fff,stroke-width:2px,color:#fff
    style QuizLogic fill:#ec4899,stroke:#fff,stroke-width:2px,color:#fff
    style RedisCache fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style RedisCheck fill:#eab308,stroke:#fff,stroke-width:3px,stroke-dasharray: 5 5,color:#1f2937
    style PostgreSQL fill:#3b82f6,stroke:#fff,stroke-width:2px,color:#fff
    style DockerFE fill:#64748b,stroke:#fff,stroke-width:2px,stroke-dasharray: 5 5,color:#fff
    style DockerBE fill:#64748b,stroke:#fff,stroke-width:2px,stroke-dasharray: 5 5,color:#fff
```

### Key Architecture Points

- 🎯 **Frontend**: Next.js 16 with Socket.io client for real-time events
- 🔧 **Backend**: Node.js Express server with Socket.io server (Singleton pattern)
- 💾 **Redis**: Primary data store for quiz state, sessions, and live scores
- 🔐 **PostgreSQL**: Used **exclusively** for NextAuth authentication (no quiz data)
- 🐳 **Docker**: Currently runs PostgreSQL & Redis; full app containerization planned

---

## 🔄 Data Flow

### Simplified Quiz Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 🖥️ Frontend
    participant S as 🔌 Socket.io Server
    participant QM as 📝 Quiz Manager
    participant R as 💾 Redis

    Note over U,R: 1️⃣ User Joins Room
    U->>F: Enter name & room ID
    F->>S: emit("join", {name, roomId})
    S->>QM: addUser(name, roomId)
    QM->>R: Cache user in room
    S-->>F: emit("initialization", {userId, count})
    F-->>U: Show Waiting Room

    Note over U,R: 2️⃣ Admin Starts Quiz
    U->>F: Click "Start Quiz"
    F->>S: emit("next", {roomId})
    S->>QM: next(roomId)
    QM->>R: Update quiz state
    S-->>F: emit("currentStateQuiz", {problem})
    F-->>U: Display Question

    Note over U,R: 3️⃣ User Answers
    U->>F: Select answer
    F->>S: emit("submit", {userId, problemId, answer})
    S->>QM: submit(userId, problemId, answer)
    QM->>QM: Validate & calculate score
    QM->>R: Update score in Redis
    S-->>F: emit("currentStateQuiz", {leaderboard})
    F-->>U: Show Leaderboard

    Note over U,R: 🚧 4️⃣ Checkpoint (TODO)
    loop Every 30s (Planned)
        QM->>R: Save state snapshot
    end

    Note over U,R: 5️⃣ Quiz Ends
    S-->>F: emit("currentStateQuiz", {type: "QUIZ_ENDED"})
    F-->>U: Display Final Results
```

### Socket.io Event Architecture

```mermaid
graph TB
    subgraph "👤 Client Events (User Emit)"
        CE1["join<br/>{name, roomId}"]
        CE2["submit<br/>{userId, problemId,<br/>submission, roomId}"]
        CE3["disconnect"]
        CE4["message<br/>{message}"]
    end

    subgraph "👨‍💼 Client Events (Admin Emit)"
        CE5["join_admin<br/>{password}"]
        CE6["create_quiz<br/>{roomId}"]
        CE7["add_problems<br/>{roomId, problem}"]
        CE8["next<br/>{roomId}"]
    end

    subgraph "🔌 Server Events (Listen/On)"
        SE1["connection"]
        SE2["join"]
        SE3["submit"]
        SE4["disconnect"]
        SE5["message"]
        SE6["join_admin"]
        SE7["create_quiz"]
        SE8["add_problems"]
        SE9["next"]
    end

    subgraph "📤 Server Events (Emit to Client)"
        SE10["initialization<br/>{userId, state,<br/>count, allUser}"]
        SE11["user_count<br/>{count, allUsers}"]
        SE12["user_count_admin<br/>{count}"]
        SE13["currentStateQuiz<br/>{state, problem,<br/>getLeaderboard}"]
        SE14["message<br/>{msg, timeStamp}"]
        SE15["admin-message<br/>{msg, timeStamp}"]
    end

    %% User Flow
    CE1 -->|Socket Connection| SE1
    CE1 --> SE2
    CE2 --> SE3
    CE3 --> SE4
    CE4 --> SE5

    %% Admin Flow
    CE5 --> SE6
    CE6 --> SE7
    CE7 --> SE8
    CE8 --> SE9

    %% Server Responses
    SE2 --> SE10
    SE2 --> SE11
    SE7 --> SE12
    SE9 --> SE13
    SE5 --> SE14

    %% Styling
    style CE1 fill:#0ea5e9,stroke:#fff,stroke-width:2px,color:#fff
    style CE2 fill:#0ea5e9,stroke:#fff,stroke-width:2px,color:#fff
    style CE3 fill:#0ea5e9,stroke:#fff,stroke-width:2px,color:#fff
    style CE4 fill:#0ea5e9,stroke:#fff,stroke-width:2px,color:#fff
    
    style CE5 fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff
    style CE6 fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff
    style CE7 fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff
    style CE8 fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff
    
    style SE1 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style SE2 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style SE3 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style SE4 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style SE5 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style SE6 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style SE7 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style SE8 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style SE9 fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    
    style SE10 fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style SE11 fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style SE12 fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style SE13 fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style SE14 fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style SE15 fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff

```
---

## 🚀 Getting Started

### Prerequisites

- 📦 **Node.js** v18+ 
- 🐳 **Docker** & **Docker Compose**
- 💾 **Redis** v7 (via Docker)
- 🗄️ **PostgreSQL** v15 (via Docker)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/AbhinavCoder-14/Think-Sync-2.git
cd Think-Sync-2
```

2. **Start Docker services** (PostgreSQL + Redis)
```bash
docker-compose up -d
```

3. **Set up the Backend**
```bash
cd Backend
npm install

# Create .env file
cat > .env << EOF
PORT=4000
NODE_ENV=development
EOF

# Run backend server
npm run dev
```

4. **Set up the Frontend**
```bash
cd ../quizz-app
npm install

# Setup Prisma for NextAuth
npx prisma generate
npx prisma db push

# Create .env.local file
cat > .env.local << EOF
DATABASE_URL="postgresql://quiz-admin-2:mypassword-2@localhost:5432/quiz-admin-db-2"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
LOCAL_DEVELOPMENT=true
EOF

# Run frontend
npm run dev
```

5. **Access the application**
- 🖥️ Frontend: `http://localhost:3000`
- 🔌 Backend Socket.io: `http://localhost:4000`
- 💾 Redis: `localhost:6379`
- 🗄️ PostgreSQL: `localhost:5432`

### Quick Start (Admin Flow)

1. Visit `http://localhost:3000`
2. Click **"Sign In"** → Use credentials:
   - Username: `abhinav`
   - Password: `1234`
   - Role: `Admin`
3. Click **"Organise a Quiz"**
4. Click **"Create Room"** → Get a `roomId`
5. Share `roomId` with players
6. Click **"Start Quiz"** when ready

### Quick Start (Player Flow)

1. Visit `http://localhost:3000`
2. Click **"Join Quiz"**
3. Enter your name and the `roomId`
4. Wait in the lobby for admin to start

---

## 📦 Project Structure

```
Think-Sync-2/
├── 📁 Backend/                    # Socket.io backend server
│   ├── 📁 src/
│   │   ├── 📁 controllers/
│   │   │   ├── IoInit.ts         # Socket.io Singleton instance
│   │   │   ├── UserController.ts # User join/leave/admin logic
│   │   │   ├── Quizcontroller.ts # Quiz management
│   │   │   └── adminManager.ts   # Admin-specific logic
│   │   ├── 📁 redis/
│   │   │   └── client.ts         # Redis connection (ioredis)
│   │   ├── quiz.ts               # Quiz class & game logic
│   │   └── index.ts              # Express + Socket.io server entry
│   ├── 📁 dist/                  # Compiled JavaScript
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 quizz-app/                 # Next.js frontend application
│   ├── 📁 app/
│   │   ├── 📁 UserJoin/
│   │   │   └── page.tsx          # Player join interface
│   │   ├── 📁 admin/
│   │   │   └── create/
│   │   │       └── page.tsx      # Admin quiz creation
│   │   ├── 📁 api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/# NextAuth API routes
│   │   ├── 📁 context/
│   │   │   └── SocketContext.js  # Socket.io client context
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css
│   ├── 📁 components/
│   │   ├── WaitingRoom.tsx       # Lobby component
│   │   ├── quiz.tsx              # Quiz gameplay component
│   │   ├── Ended.tsx             # Results screen
│   │   ├── dashboard.tsx         # Admin dashboard
│   │   ├── PixelSnow.jsx         # Three.js background effect
│   │   └── 📁 ui/                # Shadcn UI components
│   ├── 📁 prisma/
│   │   ├── schema.prisma         # User schema for NextAuth
│   │   └── 📁 migrations/
│   ├── package.json
│   └── next.config.ts
│
├── 🐳 docker-compose.yml         # PostgreSQL + Redis containers
├── 📄 README.md
└── 📄 .gitignore
```

---

## 🔧 Tech Stack

### Frontend
- ⚛️ **Next.js 16** - React framework with App Router
- 🎨 **Tailwind CSS 4** - Utility-first styling
- 🔌 **Socket.io Client** - Real-time event communication
- 🎬 **Framer Motion** - Smooth animations
- 🔐 **NextAuth** - Authentication library
- 🎭 **Shadcn UI** - Component library
- 🎨 **Three.js** - 3D background effects (PixelSnow)

### Backend
- 🟢 **Node.js** + **Express 5** - Server framework
- 🔌 **Socket.io 4.8** - Real-time bidirectional communication
- 💾 **ioredis 5.9** - Redis client
- 🎯 **TypeScript 5.9** - Type safety
- 🔑 **crypto** - UUID generation
- 🐳 **Docker Compose** - Container orchestration

### Databases & Cache
- 💾 **Redis 7** - Session cache, quiz state, scores
- 🗄️ **PostgreSQL 15** - NextAuth user authentication only
- 📦 **Prisma** - Database ORM

### DevOps (Planned)
- 🐳 **Docker** - Frontend & Backend images (coming soon)
- 🚀 **Multi-stage builds** - Optimized production images

---

## ⚙️ Configuration

### Backend Environment Variables (`.env`)

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Redis Configuration (Docker)
REDIS_HOST=localhost
REDIS_PORT=6379

# 🚧 Redis Checkpoint Settings (In Development)
CHECKPOINT_INTERVAL=30000  # 30 seconds
CHECKPOINT_TTL=3600        # 1 hour

# Socket.io Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables (`.env.local`)

```env
# NextAuth Configuration
DATABASE_URL="postgresql://quiz-admin-2:mypassword-2@localhost:5432/quiz-admin-db-2"
NEXTAUTH_SECRET="your-secret-key-generate-new-one"
NEXTAUTH_URL="http://localhost:3000"

# Development Mode (Allows hardcoded admin login)
LOCAL_DEVELOPMENT=true

# Socket.io Backend URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Docker Compose Services

```yaml
# Current Configuration
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: quiz-admin-2
      POSTGRES_PASSWORD: mypassword-2
      POSTGRES_DB: quiz-admin-db-2

  redis:
    image: redis:7
    ports:
      - "6379:6379"

# 🚧 Future Services (Planned)
#  frontend:
#    build: ./quizz-app
#    ports:
#      - "3000:3000"
#
#  backend:
#    build: ./Backend
#    ports:
#      - "4000:4000"
```

---

## 🛣️ Development Roadmap

### Phase 1: Core Features ✅
- [x] Socket.io real-time communication
- [x] Basic quiz functionality
- [x] Player join/leave handling
- [x] Admin dashboard
- [x] Live user count broadcasting
- [x] NextAuth authentication
- [x] Docker Compose setup (PostgreSQL + Redis)

### Phase 2: State Management (🚧 Current)
- [ ] **Redis checkpoint implementation** ← Priority
- [ ] State recovery on reconnection
- [ ] Player progress persistence
- [ ] Session resumption after disconnect
- [ ] Checkpoint cleanup job

### Phase 3: Containerization
- [ ] Create Frontend Dockerfile
- [ ] Create Backend Dockerfile
- [ ] Update docker-compose.yml with app services
- [ ] Multi-stage production builds
- [ ] Environment-specific configurations

### Phase 4: Enhanced Features
- [ ] Multiple simultaneous quiz rooms
- [ ] Custom quiz creation interface
- [ ] Question bank management
- [ ] Quiz history and analytics
- [ ] Player statistics dashboard

### Phase 5: Production Ready
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment guides

---

## 🚧 Known Issues & TODO

### Redis Checkpointing Implementation (Priority)

The checkpoint feature is partially scaffolded but needs full implementation:

```typescript
// 📁 Backend/src/quiz.ts
// TODO: Implement periodic checkpoint saving
class Quiz {
  // Current: Basic Redis room status storage
  // Needed: Full state snapshots

  // TODO: Save complete checkpoint
  async saveCheckpoint(): Promise<void> {
    const checkpoint = {
      roomId: this.roomId,
      currentQuestion: this.activeProblem,
      users: this.users,
      problems: this.problems,
      timestamp: Date.now()
    };
    
    await redis.hset(`checkpoint:${this.roomId}`, {
      data: JSON.stringify(checkpoint),
      expires: Date.now() + CHECKPOINT_TTL
    });
  }

  // TODO: Load and restore from checkpoint
  async loadCheckpoint(): Promise<boolean> {
    const data = await redis.hget(`checkpoint:${this.roomId}`, 'data');
    if (!data) return false;
    
    const checkpoint = JSON.parse(data);
    this.activeProblem = checkpoint.currentQuestion;
    this.users = checkpoint.users;
    // ... restore full state
    return true;
  }
}
```

### Other TODOs

- 🔴 **High Priority**
  - Complete Redis checkpoint save/load logic
  - Implement reconnection recovery flow
  - Add checkpoint expiration cleanup

- 🟡 **Medium Priority**
  - Improve error handling in Socket.io events
  - Add input validation for quiz submissions
  - Implement rate limiting for Socket.io events
  - Add comprehensive logging

- 🟢 **Low Priority**
  - Add unit tests for Quiz and UserManager classes
  - Improve TypeScript strict mode compliance
  - Add API documentation
  - Create development environment guide

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

### Development Setup

1. Fork and clone the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes
4. Test locally (both frontend and backend)
5. Commit with clear messages
   ```bash
   git commit -m "feat: add checkpoint recovery logic"
   ```
6. Push and open a Pull Request
   ```bash
   git push origin feature/amazing-feature
   ```

### Coding Guidelines

- Follow existing TypeScript/JavaScript patterns
- Use Socket.io event naming conventions
- Add JSDoc comments for new functions
- Test Socket.io events thoroughly
- Update README for architectural changes

### Areas Needing Help

- 🔴 **Redis Checkpoint Implementation** - Core feature in development
- 🟡 **Dockerization** - Creating production-ready images
- 🟢 **Testing** - Unit and integration test coverage
- 🟢 **Documentation** - API documentation and guides

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Abhinav**
- GitHub: [@AbhinavCoder-14](https://github.com/AbhinavCoder-14)
- Project: [Think-Sync-2](https://github.com/AbhinavCoder-14/Think-Sync-2)

---

## 🙏 Acknowledgments

- Built with ❤️ using Socket.io, Next.js, and Redis
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Background effects powered by Three.js
- Inspired by real-time quiz platforms like Kahoot

---

## 📞 Support & Feedback

- 🐛 [Report Issues](https://github.com/AbhinavCoder-14/Think-Sync-2/issues)
- 💬 [Discussions](https://github.com/AbhinavCoder-14/Think-Sync-2/discussions)
- ⭐ Star this repo if you find it helpful!

---

<div align="center">

**⚡ Built with Socket.io for real-time magic ⚡**

Made with 💙 by the Think-Sync-2 Team

</div>
