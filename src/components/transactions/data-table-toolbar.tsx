"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Download, Trash2, X, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import type { Transaction } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"


interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onDelete: (rows: TData[]) => void
}

// Function to convert data to CSV
const convertToCSV = (data: Transaction[]) => {
  const header = 'Date,Type,Account,Category,Subcategory,Amount,Comment'
  const rows = data.map((transaction) => {
    const date = new Date(transaction.date)
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

    const values = [
      formattedDate,
      transaction.type,
      transaction.account,
      transaction.category,
      transaction.subcategory,
      transaction.amount,
      `"${transaction.comment.replace(/"/g, '""')}"`,
    ]
    return values.join(',')
  })
  return [header, ...rows].join('\n')
}

// Function to download CSV
const downloadCSV = (csvString: string, filename: string) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function DataTableToolbar<TData>({
  table,
  onDelete,
}: DataTableToolbarProps<TData>) {
  const numSelected = table.getFilteredSelectedRowModel().rows.length
  const isFiltered = table.getState().columnFilters.length > 0

  const handleExport = () => {
    const dataToExport = table
      .getFilteredRowModel()
      .rows.map((row) => row.original as Transaction)
    if (dataToExport.length === 0) {
      return
    }
    const csvData = convertToCSV(dataToExport)
    downloadCSV(csvData, 'transactions.csv')
  }

  const handleDelete = () => {
    const rowsToDelete = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original as TData)
    onDelete(rowsToDelete)
    table.resetRowSelection()
  }
  
  const types = React.useMemo(() => Array.from(table.getPreFilteredRowModel().flatRows.reduce((acc, row) => acc.add(row.getValue('type')), new Set<string>())).sort().filter(Boolean), [table]);
  const categories = React.useMemo(() => Array.from(table.getPreFilteredRowModel().flatRows.reduce((acc, row) => acc.add(row.getValue('category')), new Set<string>())).sort().filter(Boolean), [table]);
  
  const selectedCategory = table.getColumn('category')?.getFilterValue() as string;

  const subcategories = React.useMemo(() => {
    const subcategorySet = new Set<string>();
    table.getPreFilteredRowModel().flatRows.forEach(row => {
      if (selectedCategory && row.getValue('category') !== selectedCategory) {
        return;
      }
      const subcat = row.getValue('subcategory') as string;
      if (subcat) {
        subcategorySet.add(subcat);
      }
    });
    return Array.from(subcategorySet).sort().filter(Boolean);
  }, [table, selectedCategory]);

  React.useEffect(() => {
    table.getColumn('subcategory')?.setFilterValue(undefined);
  }, [selectedCategory, table]);

  const date = table.getColumn('date')?.getFilterValue() as DateRange | undefined;
  const [calendarMonth, setCalendarMonth] = React.useState<Date | undefined>(undefined);

  const handleCalendarOpen = (open: boolean) => {
    if (open) {
      setCalendarMonth(date?.from || new Date());
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filter by comment..."
            value={(table.getColumn('comment')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('comment')?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Popover onOpenChange={handleCalendarOpen}>
              <PopoverTrigger asChild>
                  <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                      "h-8 w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                  )}
                  >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                      date.to ? (
                      <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                      </>
                      ) : (
                      format(date.from, "LLL dd, y")
                      )
                  ) : (
                      <span>Filter by date...</span>
                  )}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                  initialFocus
                  mode="range"
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  selected={date}
                  onSelect={(range) => table.getColumn('date')?.setFilterValue(range)}
                  numberOfMonths={1}
                  />
              </PopoverContent>
          </Popover>
          <Select
            value={(table.getColumn('type')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) => table.getColumn('type')?.setFilterValue(value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="h-8 w-full sm:w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn('category')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) => table.getColumn('category')?.setFilterValue(value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="h-8 w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn('subcategory')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) => table.getColumn('subcategory')?.setFilterValue(value === 'all' ? undefined : value)}
            disabled={subcategories.length === 0}
          >
            <SelectTrigger className="h-8 w-full sm:w-[150px]">
              <SelectValue placeholder="Subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map(subcat => <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>)}
            </SelectContent>
          </Select>
           <Input
            placeholder="Min amount"
            type="number"
            value={(table.getColumn("amount")?.getFilterValue() as [number, number])?.[0] ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              const currentFilter = table.getColumn("amount")?.getFilterValue() as [number, number] | undefined;
              const newMin = value === "" ? undefined : Number(value);
              table.getColumn("amount")?.setFilterValue([newMin, currentFilter?.[1]]);
            }}
            className="h-8 w-[100px]"
          />
          <Input
            placeholder="Max amount"
            type="number"
            value={(table.getColumn("amount")?.getFilterValue() as [number, number])?.[1] ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              const currentFilter = table.getColumn("amount")?.getFilterValue() as [number, number] | undefined;
              const newMax = value === "" ? undefined : Number(value);
              table.getColumn("amount")?.setFilterValue([currentFilter?.[0], newMax]);
            }}
            className="h-8 w-[100px]"
          />
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={handleExport}
          disabled={table.getFilteredRowModel().rows.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        {numSelected > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({numSelected})
          </Button>
        )}
      </div>
    </div>
  )
}
