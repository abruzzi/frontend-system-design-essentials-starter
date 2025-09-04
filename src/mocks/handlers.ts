import { delay, http, HttpResponse } from "msw";
import users from "./users.json";
import board from "./board.json";

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

export const handlers = [
  http.patch("/api/users/:id", async ({ params, request }) => {
    const id = String(params.id);
    const payload = (await request.json()) as Partial<User>;

    const index = users.findIndex((u) => String(u.id) === id);
    if (index === -1) {
      return HttpResponse.json(
        { error: `User ${id} not found` },
        { status: 404 },
      );
    }

    users[index] = { ...users[index], ...payload };
    return HttpResponse.json(users[index]);
  }),

  http.get("/api/users/:id", ({ params }) => {
    const id = String(params.id);

    const user = (users as User[]).find((u) => String(u.id) === id);
    if (!user) {
      return HttpResponse.json(
        { error: `User ${id} not found` },
        { status: 404 },
      );
    }

    return HttpResponse.json(user);
  }),

  http.get("/api/users", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("query")?.trim().toLowerCase() ?? "";

    const result: User[] = q
      ? (users as User[]).filter((u) => u.name.toLowerCase().includes(q))
      : (users as User[]);

    return HttpResponse.json(result);
  }),

  http.get("/api/board/:id", async ({ request }) => {
    const url = new URL(request.url);
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

    return HttpResponse.json(filtered);
  }),

  http.get("/api/cards/:id", ({ params }) => {
    const id = String(params.id);
    const match = findCardById(board as BoardPayload, id);
    if (!match) {
      return HttpResponse.json(
        { error: `Card ${id} not found` },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      ticket: match.card,
      column: match.column,
    });
  }),
];
