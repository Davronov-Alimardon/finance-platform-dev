import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { accounts, insertAccountSchema } from "@/db/schema";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      c.json({ status: 401, message: "Unauthorized", success: false }, 401);
    }

    // data
    const data = await db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      // @ts-ignore
      .where(eq(accounts.userId, auth.userId));

    return c.json({ data });
  })
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return c.json({ data });
    }
  );

export default app;
