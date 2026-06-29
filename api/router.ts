import { authRouter } from "./auth-router";
import { taskRouter } from "./task-router";
import { ticketRouter } from "./ticket-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  task: taskRouter,
  ticket: ticketRouter,
});

export type AppRouter = typeof appRouter;
