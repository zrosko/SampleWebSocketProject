# SampleWebSocketProject

A two-tier real-time application demonstrating WebSocket communication between a React.js frontend and a Spring Boot microservice.

## Architecture

```
frontend/   (React + Vite + TypeScript + Tailwind CSS)
backend/    (Spring Boot 3 + STOMP WebSocket)
```

## How It Works

1. The React UI connects to the Spring Boot server via a **STOMP over SockJS** WebSocket.
2. The user types a message in the input field and clicks **Send to Server**.
3. The message is published to `/app/receiveInput` on the backend.
4. The backend stores the last received message and, **every 5 seconds**, broadcasts it to all subscribers on `/topic/output` concatenated with the current server timestamp.
5. The React UI displays the latest broadcast in the read-only output field.

## Project Structure

```
SampleWebSocketProject/
├── backend/                          # Spring Boot microservice
│   ├── pom.xml
│   └── src/main/java/com/example/websocket/
│       ├── WebSocketApplication.java
│       ├── config/
│       │   └── WebSocketConfig.java  # STOMP broker + SockJS endpoint config
│       └── controller/
│           ├── WebSocketController.java  # /app/receiveInput handler
│           ├── BroadcastScheduler.java   # 5-second broadcast scheduler
│           └── InputStore.java           # In-memory last-input store
├── src/                              # React frontend (Vite root)
│   └── App.tsx
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |

## Running the Backend

```bash
cd backend
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

## Running the Frontend

```bash
# From project root
npm install
npm run dev
```

The UI is available at **http://localhost:5173**.

## Importing into IntelliJ IDEA

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/SampleWebSocketProject.git
   ```
2. Open IntelliJ IDEA → **File → Open** → select the `backend/` folder.
3. IntelliJ will detect the Maven project automatically and import it.
4. Run `WebSocketApplication` as the main class.
5. For the frontend, open a terminal in IntelliJ or a separate terminal at the project root and run `npm install && npm run dev`.

## API Reference

| Type | Destination | Direction | Description |
|------|-------------|-----------|-------------|
| STOMP | `/app/receiveInput` | Client → Server | Send text input |
| STOMP | `/topic/output` | Server → Client | Receive broadcasts (every 5s) |

## WebSocket Endpoint

```
ws://localhost:8080/ws  (via SockJS)
```
