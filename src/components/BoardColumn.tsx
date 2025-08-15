import { Card } from "./Card.tsx";

type CardType = { id: string; title: string };

export const BoardColumn = ({ cards }: { cards: CardType[] }) => (
  <section className="rounded-xl bg-neutral-100 p-4 border border-neutral-200 min-h-[65vh]">
    <div className="flex flex-col gap-4">
      {cards.map((c, idx) => (
        <Card key={idx} id={c.id} title={c.title} />
      ))}
    </div>
  </section>
);
