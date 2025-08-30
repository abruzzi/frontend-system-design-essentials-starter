export type User = { id: number; name: string; avatar_url: string };

export type CardType = { id: string; title: string, assignee?: User };

export type NormalizedCard = {
  id: string;
  title: string;
  assigneeId?: number;
};

export type NormalizedColumn = {
  id: string;
  title: string;
  cardIds: string[];
};

export type NormalizedBoard = {
  usersById: Record<number, User>;
  cardsById: Record<string, NormalizedCard>;
  columnsById: Record<string, NormalizedColumn>;
  columnOrder: string[];
};

type ServerCard = {
  id: string;
  title: string;
  assignee?: User;
};

type ServerColumn = {
  id: string;
  title: string;
  cards: ServerCard[];
};

export type BoardPayload = {
  columns: ServerColumn[];
};
