"use client";

import { TrashIcon } from "@radix-ui/react-icons";
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
  StringOrTemplateHeader,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "./ui/card";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { MatchedRow } from "@/lib/joiner";
import { cn } from "@/lib/utils";

type Props<
  T extends MatchedRow<DataFields, Id>,
  DataFields extends string,
  Id extends string
> = {
  columns: ColumnDef<T>[];
  rows: T[];
  className?: string;
  pageSize?: number;
};

export default function MembershipTable<
  T extends MatchedRow<DataFields, Id>,
  DataFields extends string,
  Id extends string
>({ rows, columns, pageSize = 50, className }: Props<T, DataFields, Id>) {
  const table = useReactTable<T>({
    data: rows,
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
