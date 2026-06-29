import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { ticketOrders } from "@db/schema";
import { desc } from "drizzle-orm";

const TICKET_PRICE = 2200;
const TOTAL_TICKETS = 73;
const ACCOUNT_NUMBER = "6256013013/0800";

function generateVariableSymbol(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export const ticketRouter = createRouter({
  info: publicQuery.query(async () => {
    const db = getDb();
    const orders = await db.select().from(ticketOrders);
    const soldCount = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    return {
      price: TICKET_PRICE,
      total: TOTAL_TICKETS,
      sold: soldCount,
      available: TOTAL_TICKETS - soldCount,
      accountNumber: ACCOUNT_NUMBER,
      eventName: "Beat For Love",
      description: "Jednodenní vstupenka",
    };
  }),

  createOrder: publicQuery
    .input(
      z.object({
        buyerName: z.string().min(1).max(255),
        buyerEmail: z.string().email().optional(),
        buyerPhone: z.string().max(50).optional(),
        quantity: z.number().int().min(1).max(TOTAL_TICKETS),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check availability
      const orders = await db.select().from(ticketOrders);
      const soldCount = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
      const available = TOTAL_TICKETS - soldCount;

      if (input.quantity > available) {
        throw new Error(`Zbývá pouze ${available} vstupenek`);
      }

      const totalPrice = input.quantity * TICKET_PRICE;
      const variableSymbol = generateVariableSymbol();

      const result = await db
        .insert(ticketOrders)
        .values({
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail ?? null,
          buyerPhone: input.buyerPhone ?? null,
          quantity: input.quantity,
          totalPrice: totalPrice,
          variableSymbol: variableSymbol,
          accountNumber: ACCOUNT_NUMBER,
          status: "pending",
        })
        .returning();

      return result[0];
    }),

  listOrders: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(ticketOrders).orderBy(desc(ticketOrders.createdAt));
  }),
});
