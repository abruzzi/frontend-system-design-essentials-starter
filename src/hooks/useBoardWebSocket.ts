import { useEffect, useRef } from "react";

type WebSocketMessage =
  | { type: "connected"; boardId: string }
  | {
  type: "card-created";
  data: { card: { id: string; title: string }; columnId: string };
};

export function useBoardWebSocket(
  boardId: string,
  onCardCreated?: (data: {
    card: { id: string; title: string };
    columnId: string;
  }) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const onCardCreatedRef = useRef(onCardCreated);

  // Keep callback fresh without reconnecting
  useEffect(() => {
    onCardCreatedRef.current = onCardCreated;
  }, [onCardCreated]);

  useEffect(() => {
    if (!boardId) return;

    const ws = new WebSocket(`ws://localhost:4000/ws/board/${boardId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected:", boardId);
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);

      if (message.type === "card-created") {
        onCardCreatedRef.current?.(message.data);
      }
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };

    ws.onclose = () => {
      console.log("WS closed:", boardId);
    };

    return () => {
      ws.close(1000, "cleanup");
      wsRef.current = null;
    };
  }, [boardId]);
}
