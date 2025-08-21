export type CardType = { id: string; title: string, assignee?: User };

export type User = { id: number; name: string; avatar_url: string };
export type Card = { id: string; title: string; assignee?: User };
export type Column = { id: string; title: string; cards: Card[] };
export type BoardPayload = { columns: Column[] };