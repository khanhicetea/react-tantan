import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { DataTablePagination } from "@/components/common/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import type { UserSelect } from "@/lib/db/types";
import { createServerFn } from "@tanstack/react-start";
import { count } from "drizzle-orm";
import * as z from "zod";

const searchParamsSchema = z.object({
  page: z.number().int().positive().catch(1),
});

const pageSize = 1;

export const paginateUsers = createServerFn({method: "POST"})
  .inputValidator(z.object({
    page: z.number().int().positive().catch(1),
  }))
  .handler(async ({ data }) => {
    const page = data.page;
    const limit = pageSize;
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
      totalCount: totalCountResult[0]?.count ?? 0,
      pageCount: Math.ceil((totalCountResult[0]?.count ?? 0) / limit),
    };
  });

export const Route = createFileRoute("/(authenticated)/manage/users")({
  component: RouteComponent,
  validateSearch: searchParamsSchema,
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    return await paginateUsers({ data: deps });
  },
});

const columns: ColumnDef<UserSelect>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return <Badge>{row.original.role}</Badge>;
    },
  },
  {
    accessorKey: "banned",
    header: "Banned",
  },
  {
    accessorKey: "banExpires",
    header: "Ban Expires",
  },
  {
    accessorKey: "banReason",
    header: "Ban Reason",
  },
];

function RouteComponent() {
  const { users, totalCount, pageCount } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const currentPage = search.page;

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
  });

  const handlePageChange = (newPage: number) => {
    navigate({
      search: { page: newPage },
    });
  };

  const rows = table.getRowModel().rows;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Users</h1>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows?.length ? (
                rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          currentPage={currentPage}
          pageCount={pageCount}
          totalCount={totalCount}
          pageSize={pageSize}
          itemsCount={users.length}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
