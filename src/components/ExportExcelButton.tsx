"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useState } from "react";

interface ExportExcelButtonProps {
  data: any[];
  columns: { header: string; key: string; width?: number }[];
  filename?: string;
  sheetName?: string;
}

export function ExportExcelButton({ data, columns, filename = "export", sheetName = "Sheet 1" }: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName, { views: [{ rightToLeft: true }] });

      // Add Headers
      worksheet.columns = columns.map(col => ({
        header: col.header,
        key: col.key,
        width: col.width || 15
      }));

      // Style Headers
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF333333' }
      };

      // Add Data
      data.forEach(row => {
        worksheet.addRow(row);
      });

      // Generate Buffer and Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `${filename}.xlsx`);
    } catch (error) {
      console.error("Failed to export to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={exportToExcel} 
      disabled={isExporting || data.length === 0}
      className="bg-card/50 border-border hover:bg-card hover:border-white/20 transition-all"
    >
      {isExporting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
      ייצוא ל-Excel
    </Button>
  );
}
