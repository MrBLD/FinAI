"use client"

import { ColumnDef, FilterFn, Row } from "@tanstack/react-table"
import { format } from "date-fns"
import type { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { DateRange } from "react-day-picker"

const dateFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: DateRange
) => {
  const date = new Date(row.getValue(columnId));
  if (!filterValue) return true;
  const { from, to } = filterValue;

  if (from && !to) {
    return date >= from;
  } else if (!from && to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    return date <= toDate;
  } else if (from && to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    return date >= from && date <= toDate;
  }
  return true;
};

const amountFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: [number | undefined, number | undefined]
) => {
  if (!filterValue || (filterValue[0] === undefined && filterValue[1] === undefined)) return true;

  const amount = row.getValue(columnId) as number;
  const [min, max] = filterValue;

  if (min !== undefined && max !== undefined) {
    return amount >= min && amount <= max;
  }
  if (min !== undefined) {
    return amount >= min;
  }
  if (max !== undefined) {
    return amount <= max;
  }
  return true;
};

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return <div className="text-left">{format(date, "dd-MM-yyyy")}</div>
    },
    filterFn: dateFilterFn,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return <Badge variant={type === "income" ? "secondary" : "outline"} className={type === "income" ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400" : ""}>{type}</Badge>
    },
  },
  {
    accessorKey: "account",
    header: "Account",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "subcategory",
    header: "Subcategory",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
    filterFn: amountFilterFn,
  },
  {
    accessorKey: "comment",
    header: "Comment",
  },
]
