import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tasks } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const taskRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, input.id));
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "done"]).default("todo"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .insert(tasks)
        .values({
          title: input.title,
          description: input.description ?? null,
          status: input.status,
          priority: input.priority,
          userId: input.userId ?? null,
        })
        .returning();
      return result[0];
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;

      const result = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();
      return result[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});
