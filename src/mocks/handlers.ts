import { http, HttpResponse } from "msw";
import users from "./users.json";
import board from "./board.json";

type User = {
  id: number;
  name: string;
  description: string;
  avatar_url: string;
};

type UserLite = { id: number; name: string; avatar_url: string };
type Card = { id: string; title: string; user?: UserLite };
type Column = { id: string; title: string; cards: Card[] };
type BoardPayload = { columns: Column[] };

function findCardById(boardData: BoardPayload, id: string) {
  for (const col of boardData.columns) {
    const card = col.cards.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (card) return { card, column: { id: col.id, title: col.title } };
  }
  return null;
}

function filterBoard(data: BoardPayload, q: string): BoardPayload {
  if (!q) return data;

  const needle = q.trim().toLowerCase();
  const filteredColumns: Column[] = data.columns.map((col) => ({
    ...col,
    cards: col.cards.filter((c) => {
      const inTitle = c.title.toLowerCase().includes(needle);
      const inId = c.id.toLowerCase().includes(needle);
      const inAssignee = c.user?.name?.toLowerCase().includes(needle) ?? false;
      return inTitle || inId || inAssignee;
    }),
  }));

  return { columns: filteredColumns };
}

export const handlers = [
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

  http.get("/api/board/:id", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const filtered = filterBoard(board as BoardPayload, q);
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
