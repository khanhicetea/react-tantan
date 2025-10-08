import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { count } from "drizzle-orm";
import * as z from "zod";

export const $paginateUsers = createServerFn({method: "POST"})
  .inputValidator(z.object({
    page: z.number().int().positive().catch(1),
  }))
  .handler(async ({ data }) => {
    const page = data.page;
    const limit = 1;
    const offset = (page - 1) * limit;

    const [users, totalCountResult] = await Promise.all([
      db.query.user.findMany({
        limit,
        offset,
      }),
      db.select({ count: count() }).from(user),
    ]);

    return {
      users,
      pageSize: limit,
      totalCount: totalCountResult[0]?.count ?? 0,
      pageCount: Math.ceil((totalCountResult[0]?.count ?? 0) / limit),
    };
  });
