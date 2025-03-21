"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NominationAdd from "./add";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";
import NominationEdit from "./edit";

interface Candidate {
  id: number;
  name: string;
  position_id: number;
  attend: boolean;
  club_benefit: string;
  initiative: string;
  join_reason: string;
  other_clubs: string;
  past_clubs: string;
  say_something: string;
  student_num: string | number;
  positions: number[];
}

export const columns = (
  editCandidate: (id: number) => void,
  deleteCandidate: (id: number) => void
): ColumnDef<Candidate>[] => [
  {
    accessorKey: "student_num",
    header: () => <div className="text-left">Student Number</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.getValue("student_num")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
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
            <DropdownMenuItem onClick={() => editCandidate(id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive-foreground"
              onClick={() => deleteCandidate(id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const CandidateTable = ({
  candidates,
  refetch,
  isRefetching,
}: {
  candidates: Candidate[];
  refetch: () => void;
  isRefetching: boolean;
}) => {
  const token = useToken();
  const queryClient = useQueryClient();
  const [createCandidateDialog, setCreateCandidateDialog] =
    React.useState(false);
  const [editCandidateID, setEditCandidateID] = React.useState<number>(-1);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return fetch(`${BASE_URL}/candidate/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominees", "all"] });
    },
  });

  const deleteCandidate = (id: number) => {
    deleteMutation.mutateAsync(id);
  };

  const editCandidate = (id: number) => {
    setEditCandidateID(id);
  };

  const closeEditDialog = React.useCallback(() => {
    setEditCandidateID(-1);
  }, []);

  const table = useReactTable({
    data: candidates,
    columns: columns(editCandidate, deleteCandidate),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-2 pb-4 md:flex-row">
        <Input
          placeholder="Filter by email, name or student number"
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="order-2 w-full sm:max-w-sm md:order-1"
        />
        <div className="order-1 flex items-center gap-2 ml-auto md:order-2">
          <Button variant="outline" disabled={isRefetching} onClick={refetch}>
            {isRefetching && (
              <span className="material-symbols-sharp !text-base animate-spin">
                sync
              </span>
            )}
            Refetch
          </Button>
          <Dialog
            open={createCandidateDialog}
            onOpenChange={setCreateCandidateDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <span className="material-symbols-sharp text-base!">add</span>
                Add candidate
              </Button>
            </DialogTrigger>
            <NominationAdd close={() => setCreateCandidateDialog(false)} />
          </Dialog>
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
      <div className="flex items-center justify-end space-x-2 py-4">
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
      <Dialog open={editCandidateID !== -1} onOpenChange={closeEditDialog}>
        <NominationEdit
          key={editCandidateID}
          id={editCandidateID}
          close={closeEditDialog}
        />
      </Dialog>
    </div>
  );
};

export default CandidateTable;
