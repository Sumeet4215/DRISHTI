import React, { useState } from 'react';
import { ExternalLink, FileSpreadsheet, FileText } from 'lucide-react';
import { api } from '../services/api';
import type { DataQualityReport } from '../types';

interface DataUploadModuleProps {
  onDatasetUploaded: () => void;
}

export const DataUploadModule: React.FC<DataUploadModuleProps> = ({ onDatasetUploaded }) => {
  // CSV / Excel state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState<boolean>(false);
  
  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
  const [pdfMeta, setPdfMeta] = useState<any>(null);

  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setUploadingCsv(true);
    setMessage(null);
    setPdfMeta(null);
    try {
      const res = await api.uploadDataset(csvFile);
      setMessage(res.message);
      setReport(res.data_quality_report);
      setUploadingCsv(false);
      onDatasetUploaded();
    } catch (err: any) {
      setMessage(`Upload Error: ${err.response?.data?.detail || err.message}`);
      setUploadingCsv(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    setUploadingPdf(true);
    setMessage(null);
    try {
      const res = await api.uploadPdfReport(pdfFile);
      setMessage(res.message);
      setPdfMeta(res.pdf_metadata);
      setReport(res.data_quality_report);
      setUploadingPdf(false);
      onDatasetUploaded();
    } catch (err: any) {
      setMessage(`PDF Processing Error: ${err.response?.data?.detail || err.message}`);
      setUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-700" />
            <span>DRISHTI Multi-Format Data Ingestion & Validation Portal</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Support for structured CSV/Excel files as well as automated PDF Report extraction with OCR text/table parsing.
          </p>
        </div>

        {/* Dual Upload Cards: CSV/Excel & PDF+OCR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: CSV / Excel Upload */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                <span>Primary: Structured CSV / Excel Upload</span>
              </div>
              <p className="text-xs text-slate-500">
                Direct ingestion of Common Upload Form (CUF) project data in CSV or Excel format.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => e.target.files && setCsvFile(e.target.files[0])}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-700 file:text-white hover:file:bg-teal-800 cursor-pointer w-full"
              />

              <button
                disabled={!csvFile || uploadingCsv}
                onClick={handleCsvUpload}
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                {uploadingCsv ? 'Processing CSV/Excel...' : 'Upload & Process CSV/Excel'}
              </button>
            </div>
          </div>

          {/* Card 2: PAIMANA PDF + OCR Data Extraction */}
          <div className="border border-teal-200 rounded-xl p-5 bg-teal-50/40 flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>NEW: PAIMANA PDF + OCR Data Extraction</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold border border-teal-200">
                  OCR Active
                </span>
              </div>

              {/* Data Ingestion Workflow Label */}
              <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
                <div className="text-teal-800 font-bold">PAIMANA Report (April 2026)</div>
                <div className="text-[10px] text-slate-500">
                  PDF Upload ➔ OCR for Scanned PDFs ➔ Text/Table Parsing ➔ Parameter Extraction (Cost, Expenditure, Progress %, Dates, Delays, Milestones) ➔ Data Validation ➔ Risk Models
                </div>
              </div>

              {/* Required Small Label */}
              <p className="text-[11px] font-semibold text-teal-900 bg-teal-100/70 p-2 rounded border border-teal-200">
                “PDF-based data ingestion with OCR support when structured/API data is unavailable.”
              </p>

              {/* Source Link */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                <span>Source:</span>
                <a
                  href="https://paimana-proj.mospi.gov.in/ReportPage"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 hover:underline flex items-center gap-1 font-mono font-semibold"
                >
                  PAIMANA Project Monitoring Report – April 2026
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-700 file:text-white hover:file:bg-teal-800 cursor-pointer w-full"
              />

              <button
                disabled={!pdfFile || uploadingPdf}
                onClick={handlePdfUpload}
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                {uploadingPdf ? 'Running OCR & Parameter Extraction...' : 'Extract & Ingest PAIMANA PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800 font-semibold flex items-center justify-between">
            <span>{message}</span>
            {pdfMeta && (
              <span className="text-[11px] font-mono text-slate-600">
                Pages: {pdfMeta.pages_processed} | OCR: {pdfMeta.ocr_triggered ? 'Yes' : 'No'} | Extracted: {pdfMeta.extracted_projects_count} Projects
              </span>
            )}
          </div>
        )}
      </div>

      {/* Data Quality Report Display */}
      {report && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                DATA QUALITY REPORT
              </h3>
              <p className="text-xs text-slate-500">Evaluated on live uploaded dataset</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Overall Data Quality</span>
              <div className="text-2xl font-black text-teal-700">{report.overall_quality_pct}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Total Records</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{report.total_records}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Valid Records</span>
              <div className="text-lg font-bold text-teal-700 mt-0.5">{report.valid_records}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Missing Values</span>
              <div className="text-lg font-bold text-amber-700 mt-0.5">{report.records_with_missing_values}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Duplicate Projects</span>
              <div className="text-lg font-bold text-red-700 mt-0.5">{report.duplicate_records}</div>
            </div>
          </div>

          {report.anomalies.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800">Detected Data Quality Anomalies:</h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                {report.anomalies.map((anom, i) => (
                  <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{anom.issue_type}:</span>{' '}
                      <span className="text-slate-600">{anom.details}</span>
                    </div>
                    <span className="font-mono text-slate-500">Row {anom.row_index}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
