import { http, HttpResponse } from "msw";
import users from "./users.json";

type User = {
  id: number;
  name: string;
  description: string;
  avatar_url: string;
};

export const handlers = [
  http.get("/api/users", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("query")?.trim().toLowerCase() ?? "";

    const result: User[] = q
      ? (users as User[]).filter((u) => u.name.toLowerCase().includes(q))
      : (users as User[]);

    return HttpResponse.json(result);
  }),
];
