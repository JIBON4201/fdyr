// =====================================================
// REAL-TIME SERVICE
// WebSocket server for 1000+ concurrent users
// Handles: Balance updates, transactions, notifications
// Port: 3010
// =====================================================

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3010;

// Simple in-memory cache (no better-sqlite3 needed)
const userCache = new Map<string, { data: any; expiry: number }>();
const userSockets = new Map<string, Set<string>>();
const CACHE_TTL = 5000; // 5 seconds

// Rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 100;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(userId);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

// Create HTTP server
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
});

// Broadcast to specific user
function broadcastToUser(userId: string, event: string, data: any) {
  const socketIds = userSockets.get(userId);
  if (socketIds) {
    socketIds.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
}

// Broadcast to all users
function broadcastToAll(event: string, data: any) {
  io.emit(event, data);
}

// Connection handler
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  let currentUserId: string | null = null;

  // Authenticate user
  socket.on('auth', (userId: string) => {
    if (!userId) {
      socket.emit('error', { message: 'Invalid user ID' });
      return;
    }

    currentUserId = userId;

    // Add socket to user's socket set
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    // Join user's room
    socket.join(`user:${userId}`);

    console.log(`[WS] User ${userId} authenticated on socket ${socket.id}`);

    // Send connection confirmation
    socket.emit('connected', {
      userId,
      socketId: socket.id,
      timestamp: Date.now(),
    });
  });

  // Handle balance request
  socket.on('balance:get', () => {
    if (!currentUserId || !checkRateLimit(currentUserId)) {
      socket.emit('error', { message: 'Rate limit exceeded' });
      return;
    }

    // This will be fetched from main API
    socket.emit('balance:request', { userId: currentUserId });
  });

  // Handle ping for keepalive
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);

    if (currentUserId) {
      const socketIds = userSockets.get(currentUserId);
      if (socketIds) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          userSockets.delete(currentUserId);
        }
      }
    }
  });
});

// Admin namespace
io.of('/admin').on('connection', (socket) => {
  console.log(`[WS] Admin connected: ${socket.id}`);

  socket.on('broadcast', (data: { event: string; message: any; userIds?: string[] }) => {
    if (data.userIds && data.userIds.length > 0) {
      data.userIds.forEach(userId => {
        broadcastToUser(userId, data.event, data.message);
      });
    } else {
      broadcastToAll(data.event, data.message);
    }
  });

  socket.on('user:refresh', (userId: string) => {
    broadcastToUser(userId, 'refresh', { timestamp: Date.now() });
  });

  socket.on('user:balance', (userId: string, balance: number, vipLevel: number) => {
    broadcastToUser(userId, 'balance:update', { balance, vipLevel });
  });

  socket.on('stats', () => {
    socket.emit('stats', {
      connectedUsers: userSockets.size,
      totalConnections: io.sockets.sockets.size,
      timestamp: Date.now(),
    });
  });
});

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      connectedUsers: userSockets.size,
      totalConnections: io.sockets.sockets.size,
      uptime: process.uptime(),
    }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[WS] Real-time service running on port ${PORT}`);
  console.log(`[WS] WebSocket: ws://localhost:${PORT}`);
  console.log(`[WS] Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[WS] Shutting down gracefully...');
  io.close(() => {
    process.exit(0);
  });
});
