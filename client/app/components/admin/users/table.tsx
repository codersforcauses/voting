import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from ".";
import {
  useMutation,
  useQueryClient,
  type UseMutateAsyncFunction,
} from "@tanstack/react-query";
import { useToken } from "@/lib/user";
import { BASE_URL } from "@/lib/utils";

interface UserTableProps {
  data: User[];
  refetch: () => void;
  isRefetching: boolean;
}

type UpdateRole = {
  id: string;
  role: "user" | "admin";
};

const columns = (
  updateRole: UseMutateAsyncFunction<any, Error, UpdateRole, unknown>
): ColumnDef<User>[] => [
  {
    accessorKey: "preferred_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Preferred name
          <span className="material-symbols-sharp text-base!">swap_vert</span>
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("preferred_name")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <span className="material-symbols-sharp text-base!">swap_vert</span>
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <span className="material-symbols-sharp text-base!">swap_vert</span>
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "student_num",
    enableSorting: false,
    header: "Student number",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("student_num")}</div>
    ),
  },
  {
    accessorKey: "role",
    enableSorting: false,
    enableGlobalFilter: false,
    header: "Role",
    cell: ({ row }) => (
      <div className="lowercase text-center">{row.getValue("role")}</div>
    ),
  },
  {
    accessorKey: "code",
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    header: () => <div className="text-right">Code</div>,
    cell: ({ row }) => (
      <div className="font-medium text-right">{row.getValue("code")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <span className="material-symbols-sharp text-base!">
                more_horiz
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-muted-foreground">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                updateRole({
                  id,
                  role: "user",
                })
              }
            >
              Make user
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive-foreground"
              onClick={() =>
                updateRole({
                  id,
                  role: "admin",
                })
              }
            >
              Make admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const UserTable = ({ data, refetch, isRefetching }: UserTableProps) => {
  const token = useToken();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async ({ id, role }: UpdateRole) => {
      const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const table = useReactTable({
    data,
    columns: columns(mutateAsync),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      globalFilter,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-2 pb-4 md:flex-row">
        <Input
          placeholder="Filter by email, name or preferred name"
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="order-2 max-w-sm md:order-1"
        />
        <div className="order-1 space-x-2 ml-auto md:order-2">
          <Button variant="outline" disabled={isRefetching} onClick={refetch}>
            {isRefetching && (
              <span className="material-symbols-sharp !text-base animate-spin">
                sync
              </span>
            )}
            Refetch
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns{" "}
                <span className="material-symbols-sharp">
                  keyboard_arrow_down
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border">
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
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end py-4 space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
