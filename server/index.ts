import path from "node:path";
import { readFileSync } from "node:fs";

import express from "express";
import cors from "cors";
import users from "./mocks/users.json";
import board from "./mocks/board.json";
import boards from "./mocks/boards.json";

import { createHash } from "node:crypto";

import { MockEventEmitter } from "./mock-event-emitter.ts";
import { BoardPayload, Card, User } from "./types.ts";
import { filterBoard, findCardById, variableDelay } from "./utils.ts";
import { renderApp } from "../dist/server/entry-server.js";
import {
  endHTML,
  getClientAssets,
  serialize,
  startHTML,
} from "./html-helper.ts";
import { Writable } from "stream";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function resetMockData() {
  const boardPath = path.join(__dirname, "./mocks/board.json");
  const usersPath = path.join(__dirname, "./mocks/users.json");

  const freshBoard = JSON.parse(
    readFileSync(boardPath, "utf-8"),
  ) as BoardPayload;
  const freshUsers = JSON.parse(readFileSync(usersPath, "utf-8")) as User[];

  // Clear and repopulate the board object
  Object.keys(board).forEach(
    (key) => delete (board as Record<string, unknown>)[key],
  );
  Object.assign(board, freshBoard);

  // Clear and repopulate the users array
  (users as User[]).length = 0;
  (users as User[]).push(...freshUsers);
}

const mockEventEmitter = new MockEventEmitter();

const app = express();
app.use(cors());
app.use(express.json());

app.set("etag", false);

app.use(
  "/assets",
  express.static(path.join(__dirname, "../dist/assets"), {
    maxAge: "1d",
    immutable: true,
  }),
);

export const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Needed for CSS-in-JS
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.example.com",
  ].join("; "),
};

// Apply headers
app.use((req, res, next) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// Test reset endpoint - reloads mock data from JSON files
// Only intended for use in automated tests
app.post("/api/test/reset", (_req, res) => {
  try {
    resetMockData();
    res.status(200).json({ message: "Mock data reset successfully" });
  } catch (error) {
    console.error("Failed to reset mock data:", error);
    res.status(500).json({ error: "Failed to reset mock data" });
  }
});

// SSR route handler for all pages
app.get(["/", "/your-work", "/board/:id", "/settings"], async (req, res) => {
  try {
    const url = req.originalUrl;

    // the rendering process is triggered here
    const streamObj = await renderApp(url);

    res.status(streamObj.didError() ? 500 : 200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    const { head, bodyScript } = getClientAssets();

    res.write(startHTML(head));

    const responseWriter = new Writable({
      write(
        chunk: any,
        encoding: BufferEncoding,
        callback: (error?: Error | null) => void,
      ) {
        res.write(chunk);
        callback();
      },

      final(callback: (error?: Error | null) => void) {
        res.write(endHTML("", bodyScript));
        res.end();
        callback();
      },
    });

    streamObj.pipe(responseWriter);
  } catch (err) {
    console.error(err);
    res.status(500).send("SSR Error");
  }
});

// GET /api/boards - List all boards
app.get("/api/boards", async (req, res) => {
  await delay(300);
  return res.json(boards);
});


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

  await delay(2000);

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

  // Generate ETag from content
  const etag = `"${createHash("md5").update(JSON.stringify(filtered), "utf8").digest("hex")}"`;

  // Check if client has same version
  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end(); // Not Modified
  }

  res.set("ETag", etag);
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");

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
      const updatedCard = { ...col.cards[cardIndex], ...payload };
      col.cards[cardIndex] = updatedCard;

      // Emit update event for title or description changes
      if (payload.title || payload.description) {
        mockEventEmitter.emit("card-updated", updatedCard);
      } else {
        mockEventEmitter.emit("card-assigned", updatedCard);
      }

      return res.json(updatedCard);
    }
  }

  return res.status(404).json({ error: `Card ${id} not found` });
});

// PATCH /api/cards/:id/move
app.patch("/api/cards/:id/move", async (req, res) => {
  const id = String(req.params.id);
  const payload = req.body as {
    fromColumnId: string;
    toColumnId: string;
    fromIndex: number;
    toIndex: number;
  };
  const data = board as BoardPayload;

  await delay(500);

  const fromColumn = data.columns.find((col) => col.id === payload.fromColumnId);
  const toColumn = data.columns.find((col) => col.id === payload.toColumnId);

  if (!fromColumn || !toColumn) {
    return res.status(404).json({ error: "Column not found" });
  }

  // Find the card
  const cardToMove = fromColumn.cards[payload.fromIndex];
  if (!cardToMove || cardToMove.id !== id) {
    return res.status(404).json({ error: "Card not found" });
  }

  // Remove from source
  fromColumn.cards.splice(payload.fromIndex, 1);

  // Add to destination
  toColumn.cards.splice(payload.toIndex, 0, cardToMove);

  return res.json(cardToMove);
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

  const handleCardUpdated = (data: any) => {
    sendEvent("card-updated", data);
  };

  mockEventEmitter.on("card-assigned", handleCardAssigned);
  mockEventEmitter.on("card-updated", handleCardUpdated);

  // heartbeats (keeps proxies happy)
  const heartbeat = setInterval(() => res.write(`: keep-alive\n\n`), 15_000);

  // cleanup on disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    mockEventEmitter.off("card-assigned", handleCardAssigned);
    mockEventEmitter.off("card-updated", handleCardUpdated);
    res.end();
  });
});

/** ---------------- Start server ---------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
