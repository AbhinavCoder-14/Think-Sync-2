import 'dotenv/config'; // Load environment variables first
import express from 'express';
import cors from "cors";
import http from 'http';
import crypto from 'crypto';
import { pinoHttp } from 'pino-http';
import { collectDefaultMetrics, Gauge, Histogram, Registry } from 'prom-client';
import { IoManager } from './controllers/IoInit.js';
import { UserManager } from './controllers/UserController.js';
import { Socket } from 'socket.io';
import { redis } from "./redis/client.js";
import { logger } from './logger.js';
const app = express();
const port = process.env.PORT || 4000;
const instanceId = process.env.INSTANCE_ID || "backend-local";
const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry, prefix: "quiz_backend_" });
const httpRequestLatencyMs = new Histogram({
    name: "quiz_backend_http_request_duration_ms",
    help: "HTTP request latency in milliseconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [10, 25, 50, 100, 250, 500, 1000, 2000],
    registers: [metricsRegistry],
});
const activeRoomsGauge = new Gauge({
    name: "quiz_backend_active_rooms",
    help: "Number of active quiz rooms in this backend instance",
    registers: [metricsRegistry],
});
const usersPerInstanceGauge = new Gauge({
    name: "quiz_backend_users_per_instance",
    help: "Total users connected to quiz rooms on this backend instance",
    labelNames: ["instance_id"],
    registers: [metricsRegistry],
});
const socketsGauge = new Gauge({
    name: "quiz_backend_connected_sockets",
    help: "Current connected Socket.IO clients",
    labelNames: ["instance_id"],
    registers: [metricsRegistry],
});
const redis_test = async () => {
    await redis.set("value", "hello");
    const value = await redis.get("value");
    logger.info({ redisValue: value }, "redis connectivity test");
};
redis_test();
// Validate required environment variables
if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'production') {
    console.warn('WARNING: ADMIN_PASSWORD not set. Using default value.');
}
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        const route = req.route?.path || req.path || "unknown";
        httpRequestLatencyMs.labels(req.method, route, String(res.statusCode)).observe(durationMs);
    });
    next();
});
const server = http.createServer(app);
// Singleton instance is created for socket.io server
IoManager.getSocketInstance(server);
const userManager = new UserManager();
const io = IoManager.getSocketInstance().io;
io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "socket connected");
    socket.on("message", (message) => {
        message = socket.id + '-' + message.message;
        // this io emit use for broadcasting the message to all the users
        io.emit("message", {
            msg: message,
            timeStamp: new Date(),
        });
    });
    userManager.addAdminInit(socket);
    userManager.addUser(socket);
});
app.post("/api/get_instance", (req, res) => {
    const message = req.body.message;
    const io = IoManager.getSocketInstance().io;
    console.log(io.engine.clientsCount);
    io.emit("admin-message", {
        msg: "Admin-" + message,
        timeStamp: new Date(),
    });
    res.json({ status: "notification have been sent" });
});
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
app.get("/ready", async (_req, res) => {
    try {
        await redis.ping();
        res.json({ status: "ready", instanceId });
    }
    catch (error) {
        res.status(503).json({ status: "not-ready", instanceId });
    }
});
app.get("/metrics", (_req, res) => {
    activeRoomsGauge.set(userManager.getActiveRoomCount());
    usersPerInstanceGauge.labels(instanceId).set(userManager.getTotalUsersCount());
    socketsGauge.labels(instanceId).set(IoManager.getSocketInstance().io.engine.clientsCount);
    res.setHeader("Content-Type", metricsRegistry.contentType);
    metricsRegistry.metrics().then((body) => res.send(body));
});
app.get("/api/room-route/:roomId", async (req, res) => {
    const { roomId } = req.params;
    const route = await userManager.getRoomRoute(roomId);
    if (!route) {
        res.status(404).json({ error: "Room not found" });
        return;
    }
    res.json({
        roomId: route.roomId,
        instanceId: route.instanceId,
        socketPath: route.socketPath,
        gatewayUrl: process.env.PUBLIC_GATEWAY_URL || process.env.CORS_ORIGIN || "http://localhost:4000",
    });
});
app.post("/api/admin/allocate-room", async (req, res) => {
    const requestedRoomId = req.body?.roomId;
    const roomId = requestedRoomId || crypto.randomUUID();
    const route = await userManager.allocateRoomRoute(roomId);
    res.json({
        roomId: route.roomId,
        instanceId: route.instanceId,
        socketPath: route.socketPath,
        gatewayUrl: process.env.PUBLIC_GATEWAY_URL || process.env.CORS_ORIGIN || "http://localhost:4000",
    });
});
app.post("/api/create_room", (req, res) => {
    const { credentials } = req.body;
    const io = IoManager.getSocketInstance().io;
    let roomId = crypto.randomUUID();
    console.log(roomId);
    res.json({ "roomId": roomId });
});
server.listen(port, () => {
    logger.info({ port, instanceId }, "server started");
});
//# sourceMappingURL=index.js.map