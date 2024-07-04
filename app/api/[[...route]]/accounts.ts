import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono().get("/", clerkMiddleware(), async (c) => {
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
});

export default app;
