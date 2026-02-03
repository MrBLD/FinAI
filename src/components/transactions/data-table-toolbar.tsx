"use client"

import { Table } from "@tanstack/react-table"
import { Download, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import type { Transaction } from "@/lib/types"

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

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by comment..."
          value={(table.getColumn('comment')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('comment')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 hidden lg:flex"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        {numSelected > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8 hidden lg:flex"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({numSelected})
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
