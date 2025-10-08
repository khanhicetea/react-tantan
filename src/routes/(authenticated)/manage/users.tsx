import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { count } from "drizzle-orm";
import { user } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";

const searchParamsSchema = z.object({
  page: z.number().int().positive().catch(1),
});

const pageSize = 1;

export const $loadUsers = createServerFn().inputValidator(z.object({
  page: z.number().int().positive().catch(1),
})).handler(async ({data}) => {
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
    return await $loadUsers({ data: deps });
  },
});

interface User {
  id: string;
  email: string;
  name: string;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}

const columns: ColumnDef<User>[] = [
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

  const getPageNumbers = () => {
    const pages: Array<{ type: "page" | "ellipsis"; value: number | string; key: string }> = [];
    const maxVisible = 7;
    
    if (pageCount <= maxVisible) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push({ type: "page", value: i, key: `page-${i}` });
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push({ type: "page", value: i, key: `page-${i}` });
        }
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-end" });
        pages.push({ type: "page", value: pageCount, key: `page-${pageCount}` });
      } else if (currentPage >= pageCount - 3) {
        pages.push({ type: "page", value: 1, key: "page-1" });
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-start" });
        for (let i = pageCount - 4; i <= pageCount; i++) {
          pages.push({ type: "page", value: i, key: `page-${i}` });
        }
      } else {
        pages.push({ type: "page", value: 1, key: "page-1" });
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-start" });
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push({ type: "page", value: i, key: `page-${i}` });
        }
        pages.push({ type: "ellipsis", value: "...", key: "ellipsis-end" });
        pages.push({ type: "page", value: pageCount, key: `page-${pageCount}` });
      }
    }
    
    return pages;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
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
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
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

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {users.length === 0 ? 0 : (currentPage - 1) * 15 + 1} to{" "}
            {Math.min(currentPage * 15, totalCount)} of {totalCount} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map((item) => {
                if (item.type === "ellipsis") {
                  return (
                    <span key={item.key} className="px-2">
                      {item.value}
                    </span>
                  );
                }
                
                return (
                  <Button
                    key={item.key}
                    variant={currentPage === item.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(item.value as number)}
                  >
                    {item.value}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
