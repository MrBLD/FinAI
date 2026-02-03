"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download } from "lucide-react";
import type { Transaction } from "@/lib/types";
import Papa from "papaparse";

export function DataManagement() {
  const transactions = useLiveQuery(() => db.transactions.toArray());
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

  const handleClearData = async () => {
    await db.transactions.clear();
    toast({
      title: "Data Cleared",
      description: "All transaction data has been removed.",
    });
    setIsAlertOpen(false);
  };

  const handleExportData = async () => {
    if (!transactions || transactions.length === 0) {
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "There is no data to export."
        });
        return;
    }
    try {
        const csv = Papa.unparse(transactions.map(t => ({
            ...t, 
            id: undefined // Don't export the internal ID
        })));
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'finance-flow-backup.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
            title: "Export Successful",
            description: "Your data has been exported as a CSV file."
        })
    } catch(error) {
        console.error("Failed to export data: ", error);
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "Could not export your data."
        })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your transaction data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">Download all your transactions as a CSV file.</p>
            </div>
            <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={!transactions || transactions.length === 0}
            >
                <Download className="mr-2 h-4 w-4" />
                Backup/Export
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
                <p className="font-medium">Clear All Data</p>
                <p className="text-sm text-muted-foreground">Permanently delete all imported transactions.</p>
            </div>
            <Button 
                variant="destructive" 
                onClick={() => setIsAlertOpen(true)}
                disabled={!transactions || transactions.length === 0}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your transaction data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-destructive hover:bg-destructive/90">
              Yes, delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
