import { useEffect, useRef, useState } from "react";
import { Card } from "./Card.tsx";
import type { CardType } from "../../../types.ts";

// Dynamic imports for browser-only drag-and-drop (not available during SSR)
const loadDragAndDrop = async () => {
  if (typeof window === "undefined") {
    return null;
  }
  const [{ draggable, dropTargetForElements }, { attachClosestEdge, extractClosestEdge }] = await Promise.all([
    import("@atlaskit/pragmatic-drag-and-drop/element/adapter"),
    import("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"),
  ]);
  return { draggable, dropTargetForElements, attachClosestEdge, extractClosestEdge };
};

const DropIndicator = ({ edge }: { edge: "top" | "bottom" }) => {
  return (
    <div
      className={`absolute left-0 right-0 h-0.5 bg-blue-500 z-10 ${
        edge === "top" ? "top-0" : "bottom-0"
      }`}
      style={{
        boxShadow: "0 0 4px rgba(59, 130, 246, 0.5)",
      }}
    />
  );
};

type DraggableCardProps = CardType & {
  columnId: string;
  index: number;
  onMove: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
};

export const DraggableCard = (props: DraggableCardProps) => {
  const { id, columnId, index, onMove } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<"top" | "bottom" | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  // Make card draggable (client-side only)
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === "undefined") return;

    let cleanup: (() => void) | undefined;

    loadDragAndDrop().then((dnd) => {
      if (!dnd) return;
      cleanup = dnd.draggable({
        element,
        getInitialData: () => ({ cardId: id, columnId, index, type: "card" }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      });
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [id, columnId, index]);

  // Make card a drop target for reordering (client-side only)
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === "undefined") return;

    let cleanup: (() => void) | undefined;

    loadDragAndDrop().then((dnd) => {
      if (!dnd) return;
      cleanup = dnd.dropTargetForElements({
        element,
        getData: ({ input, element }) => {
          const data = { columnId, index, type: "card-target" };
          return dnd.attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["top", "bottom"],
          });
        },
        canDrop: ({ source }: { source: any }) =>
          source.data.type === "card" && source.data.cardId !== id,
        onDragEnter: ({ self }: { self: any }) => {
          const edge = dnd.extractClosestEdge(self.data);
          setClosestEdge(edge);
        },
        onDrag: ({ self }: { self: any }) => {
          const edge = dnd.extractClosestEdge(self.data);
          setClosestEdge(edge);
        },
        onDragLeave: () => setClosestEdge(null),
        onDrop: ({ source, self }: { source: any; self: any }) => {
          setClosestEdge(null);
          const sourceCardId = source.data.cardId as string;
          const sourceColumnId = source.data.columnId as string;
          const sourceIndex = source.data.index as number;
          const edge = dnd.extractClosestEdge(self.data);

          // Calculate the target index based on the edge
          const targetIndex = edge === "top" ? index : index + 1;

          // Call onMove callback
          onMove(
            sourceCardId,
            sourceColumnId,
            columnId,
            sourceIndex,
            targetIndex,
          );
        },
      });
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [id, columnId, index, onMove]);

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(1.05) rotate(2deg)" : "scale(1)",
        cursor: isDragging ? "grabbing" : "grab",
        boxShadow: isDragging
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
          : undefined,
        transition: "opacity 200ms, transform 200ms, box-shadow 200ms",
      }}
    >
      <Card {...props} />
      {closestEdge && <DropIndicator edge={closestEdge} />}
    </div>
  );
};
