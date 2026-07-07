import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle, XCircle, AlertTriangle, FileText, X } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CSVRow {
  Date: string;
  "Student ID": string;
  "Student Name": string;
  Course: string;
  Batch: string;
  Mentor: string;
  "Attendance Status": string;
  "Check In": string;
  "Check Out": string;
  Remarks: string;
}

interface ValidationError {
  row: number;
  message: string;
}

interface ImportSummary {
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  duplicateRecords: number;
}

export function CSVImportTab() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file.");
      return;
    }
    setFile(selectedFile);
    setPreviewData([]);
    setValidationErrors([]);
    setImportSummary(null);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setImportSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadSample = () => {
    const csvContent = "Date,Student ID,Student Name,Course,Batch,Mentor,Attendance Status,Check In,Check Out,Remarks\n2026-07-05,CDT001,Arun Kumar,Full Stack,A1,Karthik,Present,09:05,05:15,On Time";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "attendance_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateAndPreview = async () => {
    if (!file) return;
    setIsValidating(true);
    setValidationErrors([]);
    setImportSummary(null);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        const errors: ValidationError[] = [];
        
        // 1. Basic Column Check
        const requiredColumns = ["Date", "Student ID", "Attendance Status"];
        const headers = results.meta.fields || [];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          toast.error(`Missing required columns: ${missingColumns.join(", ")}`);
          setIsValidating(false);
          return;
        }

        // 2. Fetch valid students for validation
        const { data: students } = await supabase.from("students").select("id");
        const validStudentIds = new Set((students || []).map((s: any) => s.id));

        // 3. Row-by-row validation
        rows.forEach((row, index) => {
          const rowNum = index + 2; // +1 for 0-index, +1 for header
          
          if (!row["Student ID"]) {
            errors.push({ row: rowNum, message: "Missing Student ID" });
          } else if (!validStudentIds.has(row["Student ID"])) {
            errors.push({ row: rowNum, message: `Student ID '${row["Student ID"]}' not found` });
          }

          if (!row.Date || isNaN(Date.parse(row.Date))) {
            errors.push({ row: rowNum, message: "Invalid Date format (use YYYY-MM-DD)" });
          }

          const validStatuses = ["Present", "Absent", "Late", "Leave"];
          if (!validStatuses.includes(row["Attendance Status"])) {
            errors.push({ row: rowNum, message: `Invalid status '${row["Attendance Status"]}'. Must be Present, Absent, Late, or Leave` });
          }
        });

        setPreviewData(rows);
        setValidationErrors(errors);
        setIsValidating(false);
      },
      error: (error: any) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
        setIsValidating(false);
      }
    });
  };

  const importData = async () => {
    if (previewData.length === 0 || validationErrors.length > 0) return;
    setIsImporting(true);

    try {
      const recordsToInsert = previewData.map(row => ({
        student_id: row["Student ID"],
        student_name: row["Student Name"] || "",
        date: row.Date,
        course: row.Course || "",
        batch: row.Batch || "",
        mentor: row.Mentor || "",
        check_in: row["Check In"] || null,
        check_out: row["Check Out"] || null,
        status: row["Attendance Status"],
        remarks: row.Remarks || "",
      }));
      
      const { data, error } = await supabase
        .from("student_attendance")
        .upsert(recordsToInsert, { onConflict: "student_id,date", ignoreDuplicates: false })
        .select();

      if (error) {
        if (error.code === '23505') { // Postgres unique violation (if onConflict wasn't exact)
          throw new Error("Duplicate attendance records found for the same student on the same date.");
        }
        throw error;
      }

      setImportSummary({
        totalRows: previewData.length,
        imported: recordsToInsert.length,
        updated: 0,
        skipped: 0,
        failed: 0,
        duplicateRecords: 0
      });
      
      toast.success("Attendance imported successfully!");
      setPreviewData([]);
      setFile(null);
      
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-lg font-bold text-slate-900">Import Daily Attendance</h3>
          <button onClick={downloadSample} className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Download Sample CSV
          </button>
        </div>

        {!file ? (
          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".csv" className="hidden" />
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-slate-700 font-medium text-lg mb-2">Drag & Drop your CSV file here</h4>
            <p className="text-slate-500 text-sm">or click to browse from your computer</p>
          </div>
        ) : (
          <div className="border border-teal-200 bg-teal-50 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-teal-100 p-3 rounded-lg text-teal-600">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">{file.name}</h4>
                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {previewData.length === 0 && (
                <button 
                  onClick={validateAndPreview}
                  disabled={isValidating}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isValidating ? "Validating..." : "Preview & Validate"}
                </button>
              )}
              <button 
                onClick={clearFile}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold">Validation Errors Found ({validationErrors.length})</h3>
          </div>
          <p className="text-sm text-red-700 mb-4">Please fix these errors in your CSV file and upload again.</p>
          <div className="max-h-48 overflow-y-auto">
            <ul className="space-y-2">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-sm text-red-700 bg-white/50 p-2 rounded px-3">
                  <span className="font-semibold w-20 inline-block">Row {err.row}:</span> {err.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {previewData.length > 0 && validationErrors.length === 0 && !importSummary && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">Data Preview</h3>
              <p className="text-sm text-slate-500">{previewData.length} valid rows ready for import</p>
            </div>
            <button 
              onClick={importData}
              disabled={isImporting}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {isImporting ? "Importing..." : "Import Attendance"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Check In/Out</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-4">{row.Date}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{row["Student Name"]}</div>
                      <div className="text-xs text-slate-500">{row["Student ID"]}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        row["Attendance Status"] === "Present" ? "bg-emerald-100 text-emerald-700" :
                        row["Attendance Status"] === "Absent" ? "bg-rose-100 text-rose-700" :
                        row["Attendance Status"] === "Late" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {row["Attendance Status"]}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {row["Check In"] || "-"} / {row["Check Out"] || "-"}
                    </td>
                    <td className="p-4 text-slate-500 truncate max-w-[200px]">{row.Remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div className="p-4 text-center text-sm text-slate-500 bg-slate-50/50">
                Showing first 10 rows of {previewData.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Summary */}
      {importSummary && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Import Successful</h2>
          <p className="text-slate-500 mb-8">The attendance data has been successfully imported and updated in real-time.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <div className="text-sm text-slate-500 mb-1">Total Rows</div>
              <div className="text-2xl font-bold text-slate-900">{importSummary.totalRows}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <div className="text-sm text-emerald-600 mb-1">Imported</div>
              <div className="text-2xl font-bold text-emerald-700">{importSummary.imported}</div>
            </div>
            <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
              <div className="text-sm text-rose-600 mb-1">Failed</div>
              <div className="text-2xl font-bold text-rose-700">{importSummary.failed}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="text-sm text-amber-600 mb-1">Duplicates</div>
              <div className="text-2xl font-bold text-amber-700">{importSummary.duplicateRecords}</div>
            </div>
          </div>
          
          <button 
            onClick={clearFile}
            className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Import Another File
          </button>
        </div>
      )}

    </div>
  );
}
