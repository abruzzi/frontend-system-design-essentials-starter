import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";

import users from "./mocks/users.json";
import board from "./mocks/board.json";
import { MockEventEmitter } from "./MockEventEmitter";

// ---------------- Types ----------------

type User = {
  id: number;
  name: string;
  description: string;
  avatar_url: string;
};

type UserLite = { id: number; name: string; avatar_url: string };
type Card = { id: string; title: string; assignee?: UserLite };
type Column = { id: string; title: string; cards: Card[] };
type BoardPayload = { columns: Column[] };

// ---------------- Helpers ----------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function findCardById(boardData: BoardPayload, id: string) {
  for (const col of boardData.columns) {
    const card = col.cards.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (card) return { card, column: { id: col.id, title: col.title } };
  }
  return null;
}

// ---------------- Realtime State ----------------

const mockEventEmitter = new MockEventEmitter();

// WebSocket connections per board
const wsConnections = new Map<string, Set<WebSocket>>();

// SSE connections per board
const sseConnections = new Map<string, Set<express.Response>>();

// ---------------- Express Setup ----------------

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- REST APIs ----------------

// GET /api/users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// GET /api/users/:id
app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => String(u.id) === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// PATCH /api/users/:id
app.patch("/api/users/:id", (req, res) => {
  const index = users.findIndex((u) => String(u.id) === req.params.id);
  if (index === -1) return res.status(404).json({ error: "User not found" });

  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});

// GET /api/board/:id
app.get("/api/board/:id", async (_req, res) => {
  await delay(300);
  res.json(board);
});

// GET /api/cards/:id
app.get("/api/cards/:id", (req, res) => {
  const match = findCardById(board as BoardPayload, req.params.id);
  if (!match) return res.status(404).json({ error: "Card not found" });
  res.json(match);
});

// POST /api/cards
app.post("/api/cards", async (req, res) => {
  const { title, columnId } = req.body;
  if (!title || !columnId) {
    return res.status(400).json({ error: "title and columnId required" });
  }

  const boardData = board as BoardPayload;
  const column = boardData.columns.find((c) => c.id === columnId);
  if (!column) {
    return res.status(404).json({ error: "Column not found" });
  }

  const total = boardData.columns.reduce(
    (sum, col) => sum + col.cards.length,
    0,
  );

  const newCard: Card = {
    id: `TICKET-${total + 1}`,
    title: title.trim(),
  };

  column.cards.push(newCard);

  // Emit ONCE
  mockEventEmitter.emit("card-created", {
    boardId: "1",
    card: newCard,
    columnId,
  });

  await delay(200);
  res.status(201).json(newCard);
});

// ---------------- SSE ----------------

app.get("/api/board/:id/events", (req, res) => {
  const boardId = req.params.id;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  if (!sseConnections.has(boardId)) {
    sseConnections.set(boardId, new Set());
  }

  sseConnections.get(boardId)!.add(res);

  res.write(`event: connected\ndata: ${JSON.stringify({ boardId })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(`: keep-alive\n\n`);
  }, 15_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseConnections.get(boardId)?.delete(res);
    if (sseConnections.get(boardId)?.size === 0) {
      sseConnections.delete(boardId);
    }
    res.end();
  });
});

// ---------------- Server & WebSocket ----------------

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const boardId = url.pathname.split("/").pop();

  if (!boardId) {
    ws.close(1008, "Board ID required");
    return;
  }

  if (!wsConnections.has(boardId)) {
    wsConnections.set(boardId, new Set());
  }

  wsConnections.get(boardId)!.add(ws);

  console.log(`WS connected: board ${boardId}`);

  ws.send(JSON.stringify({ type: "connected", boardId }));

  ws.on("close", () => {
    wsConnections.get(boardId)?.delete(ws);
    if (wsConnections.get(boardId)?.size === 0) {
      wsConnections.delete(boardId);
    }
    console.log(`WS disconnected: board ${boardId}`);
  });
});

// ---------------- GLOBAL REALTIME FAN-OUT ----------------

mockEventEmitter.on(
  "card-created",
  (data: { boardId: string; card: Card; columnId: string }) => {
    const message = JSON.stringify({
      type: "card-created",
      data: {
        card: data.card,
        columnId: data.columnId,
      },
    });

    // WebSocket broadcast
    const wsSet = wsConnections.get(data.boardId);
    if (wsSet) {
      for (const ws of wsSet) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      }
    }

    // SSE broadcast
    const sseSet = sseConnections.get(data.boardId);
    if (sseSet) {
      for (const res of sseSet) {
        res.write(
          `event: card-created\ndata: ${JSON.stringify({
            card: data.card,
            columnId: data.columnId,
          })}\n\n`,
        );
      }
    }
  },
);
