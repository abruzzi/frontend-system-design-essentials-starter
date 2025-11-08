export type User = {
  id: number;
  name: string;
  description: string;
  avatar_url: string;
};

type UserLite = { id: number; name: string; avatar_url: string };
export type Card = {
  id: string;
  title: string;
  description?: string;
  assignee?: UserLite;
};
export type Column = { id: string; title: string; cards: Card[] };
export type BoardPayload = { columns: Column[] };
