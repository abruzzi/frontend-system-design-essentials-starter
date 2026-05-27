import { useStatsigClient } from "@statsig/react-bindings";
import { FG_BOARD_CARD_ID_BADGE } from "./gates.ts";

export function useBoardCardNewIdBadge(): boolean {
  const { client } = useStatsigClient();
  return client.checkGate(FG_BOARD_CARD_ID_BADGE);
}
