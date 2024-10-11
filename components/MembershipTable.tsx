"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { cn } from "@/lib/utils";
import { MatchedRow } from "@/lib/merging";

type Props<
  T extends MatchedRow<DataFields, ForeignId>,
  DataFields extends string,
  ForeignId extends string
> = {
  columns: ColumnDef<T>[];
  rows: T[];
  className?: string;
  pageSize?: number;
};

export default function MembershipTable<
  T extends MatchedRow<DataField, ForeignId>,
  DataField extends string,
  ForeignId extends string
>({ rows, columns, pageSize = 50, className }: Props<T, DataField, ForeignId>) {
  const table = useReactTable<T>({
    data: rows,
    getRowId: (row) => row.id,
    columns: columns.map((colDef) => ({
      ...colDef,
      header: (context) => (
        <DataTableColumnHeader
          column={context.column}
          label={
            typeof colDef.header === "string"
              ? colDef.header
              : colDef.header?.(context)
          }
        />
      ),
    })) as typeof columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={cn("border rounded-sm", className)}>
      <Table className="table-auto md:table-fixed">
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
