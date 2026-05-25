import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers.ts";

export const server = setupServer(...handlers);
