import express from "express";
import cors from "cors";
import users from "./mocks/users.json";
import board from "./mocks/board.json";

import { MockEventEmitter } from "./MockEventEmitter.ts";

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

function variableDelay(q: string): number {
  const base = q.startsWith("inst") ? 150 : q.startsWith("ins") ? 650 : 300;
  const jitter = Math.floor(Math.random() * 120); // 0-119ms
  return base + jitter;
}

function findCardById(boardData: BoardPayload, id: string) {
  for (const col of boardData.columns) {
    const card = col.cards.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (card) return { card, column: { id: col.id, title: col.title } };
  }
  return null;
}

function filterBoard(
  data: BoardPayload,
  q: string,
  assigneeIds: number[] = [],
): BoardPayload {
  const filteredColumns: Column[] = data.columns.map((col) => ({
    ...col,
    cards: col.cards.filter((c) => {
      // Text search filter
      let matchesTextSearch = true;
      if (q) {
        const needle = q.trim().toLowerCase();
        const inTitle = c.title.toLowerCase().includes(needle);
        const inId = c.id.toLowerCase().includes(needle);
        const inAssignee =
          c.assignee?.name?.toLowerCase().includes(needle) ?? false;
        matchesTextSearch = inTitle || inId || inAssignee;
      }

      // Assignee filter
      let matchesAssigneeFilter = true;
      if (assigneeIds.length > 0) {
        matchesAssigneeFilter = c.assignee
          ? assigneeIds.includes(c.assignee.id)
          : false;
      }

      return matchesTextSearch && matchesAssigneeFilter;
    }),
  }));

  return { columns: filteredColumns };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockEventEmitter = new MockEventEmitter();

const app = express();
app.use(cors());
app.use(express.json());

// PATCH /api/users/:id
app.patch("/api/users/:id", async (req, res) => {
  const id = String(req.params.id);
  const payload = req.body as Partial<User>;

  const index = (users as User[]).findIndex((u) => String(u.id) === id);
  if (index === -1) {
    return res.status(404).json({ error: `User ${id} not found` });
  }

  (users as User[])[index] = { ...(users as User[])[index], ...payload };
  return res.json((users as User[])[index]);
});

// GET /api/users/:id
app.get("/api/users/:id", (req, res) => {
  const id = String(req.params.id);
  const user = (users as User[]).find((u) => String(u.id) === id);
  if (!user) {
    return res.status(404).json({ error: `User ${id} not found` });
  }
  return res.json(user);
});

// GET /api/users
app.get("/api/users", async (req, res) => {
  const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
  const q = (url.searchParams.get("query") || "").trim().toLowerCase();
  const page = Number(url.searchParams.get("page") ?? "0");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "5");

  const source: User[] = q
    ? (users as User[]).filter((u) => u.name.toLowerCase().includes(q))
: (users as User[]);

  const total = source.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const items = source.slice(start, end);

  return res.json({
    items,
    pageInfo: {
      total,
      page,
      pageSize,
      hasMore: end < total,
    },
  });
});

// GET /api/board/:id
app.get("/api/board/:id", async (req, res) => {
  const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
  const q = url.searchParams.get("q") ?? "";

  // Parse assigneeIds parameter - can be comma-separated list of user IDs
  const assigneeIdsParam = url.searchParams.get("assigneeIds");
  const assigneeIds: number[] = assigneeIdsParam
    ? assigneeIdsParam
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id))
    : [];

  const filtered = filterBoard(board as BoardPayload, q, assigneeIds);
  const ms = variableDelay(q);
  await delay(ms);

  return res.json(filtered);
});

// GET /api/cards/:id
app.get("/api/cards/:id", (req, res) => {
  const id = String(req.params.id);
  const match = findCardById(board as BoardPayload, id);
  if (!match) {
    return res.status(404).json({ error: `Card ${id} not found` });
  }
  return res.json({ ticket: match.card, column: match.column });
});

// DELETE /api/cards/:id
app.delete("/api/cards/:id", (req, res) => {
  const id = String(req.params.id);
  const data = board as BoardPayload;
  let removed = false;

  for (const col of data.columns) {
    const idx = col.cards.findIndex(
      (c) => c.id.toLowerCase() === id.toLowerCase(),
    );
    if (idx !== -1) {
      col.cards.splice(idx, 1);
      removed = true;
      break;
    }
  }

  if (!removed) {
    return res.status(404).json({ error: `Card ${id} not found` });
  }

  return res.status(204).end();
});

// POST /api/cards
app.post("/api/cards", async (req, res) => {
  const payload = req.body as { title: string; columnId: string };

  if (!payload.title || !payload.columnId) {
    return res.status(400).json({ error: "Title and columnId are required" });
  }

  // Find the column to add the card to
  const boardData = board as BoardPayload;
  const column = boardData.columns.find((col) => col.id === payload.columnId);

  if (!column) {
    return res
      .status(404)
      .json({ error: `Column ${payload.columnId} not found` });
  }

  const totalCards = boardData.columns.reduce(
    (sum, col) => sum + col.cards.length,
    0,
  );
  const newCardId = `TICKET-${totalCards + 1}`;

  // Create the new card
  const newCard: Card = {
    id: newCardId,
    title: payload.title.trim(),
  };

  // Add the card to the column
  column.cards.push(newCard);

  // Add delay for realism
  await delay(200);

  return res.status(201).json(newCard);
});

// PATCH /api/cards/:id
app.patch("/api/cards/:id", async (req, res) => {
  const id = String(req.params.id);
  const payload = req.body as Partial<Card>;
  const data = board as BoardPayload;

  // Add delay for realism
  await delay(1000);

  if (id === "TICKET-1") {
    return res.status(500).json({ error: "Internal server error" });
  }

  for (const col of data.columns) {
    const cardIndex = col.cards.findIndex(
      (c) => c.id.toLowerCase() === id.toLowerCase(),
    );

    if (cardIndex !== -1) {
      // Update the card with new data
      col.cards[cardIndex] = { ...col.cards[cardIndex], ...payload };

      // broadcast the change (unchanged event name)
      mockEventEmitter.emit("card-assigned", col.cards[cardIndex]);

      return res.json(col.cards[cardIndex]);
    }
  }

  return res.status(404).json({ error: `Card ${id} not found` });
});

// GET /api/board/:id/events  (SSE)
app.get("/api/board/:id/events", async (req, res) => {
  const boardId = req.params.id;

  // SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // helper to send one event
  const sendEvent = (eventType: string, data: any) => {
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // initial connection event
  sendEvent("connected", { boardId });

  // listeners (same event name as your emitter usage)
  const handleCardAssigned = (data: any) => {
    sendEvent("card-assigned", data);
  };

  mockEventEmitter.on("card-assigned", handleCardAssigned);

  // heartbeats (keeps proxies happy)
  const heartbeat = setInterval(() => res.write(`: keep-alive\n\n`), 15_000);

  // cleanup on disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    mockEventEmitter.off("card-assigned", handleCardAssigned);
    res.end();
  });
});

/** ---------------- Start server ---------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
