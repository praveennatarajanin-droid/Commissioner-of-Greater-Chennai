"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Download,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  Activity,
  Layers,
  Printer,
  X,
  Newspaper,
  Award,
  ShieldCheck,
  TrendingUp,
  Database
} from "lucide-react";
import {
  MonthlyReportPayload,
  getAvailableReportingMonths
} from "@/lib/monthlyReportTypes";

interface MonthlyReportManagementProps {
  user: { username: string; role: string };
}

export default function MonthlyReportManagement({ user }: MonthlyReportManagementProps) {
  const initialMonths = getAvailableReportingMonths(14);

  // Filter States
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(initialMonths[0]?.key || "");

  // Data States
  const [reportData, setReportData] = useState<MonthlyReportPayload | null>(null);
  const [availableMonths, setAvailableMonths] = useState<{ key: string; label: string; year: number; month: number }[]>(initialMonths);

  // UI & Loading States
  const [loading, setLoading] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Download PDF Dropdown State
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState<boolean>(false);
  const pdfDropdownRef = useRef<HTMLDivElement>(null);

  // Custom Date Modal States
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customModalMode, setCustomModalMode] = useState<"monthly" | "date">("monthly");
  const [customFromMonth, setCustomFromMonth] = useState<string>("");
  const [customToMonth, setCustomToMonth] = useState<string>("");
  const [customFromDate, setCustomFromDate] = useState<string>("");
  const [customToDate, setCustomToDate] = useState<string>("");
  const [customModalError, setCustomModalError] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(event.target as Node)) {
        setIsPdfDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-fetch report when selected month changes
  useEffect(() => {
    fetchReport({ month: selectedMonthKey, rangeType: "current" });
  }, [selectedMonthKey]);

  // Report Loader Helper for PDF generation
  const fetchReport = async (overrideParams?: {
    month?: string;
    department?: string;
    policeStation?: string;
    reportType?: string;
    rangeType?: string;
    fromMonth?: string;
    toMonth?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    setLoading(true);
    setErrorMessage(null);

    const m = overrideParams?.month !== undefined ? overrideParams.month : selectedMonthKey;
    const range = overrideParams?.rangeType || "current";

    const queryParams = new URLSearchParams();
    if (m) queryParams.set("month", m);
    queryParams.set("rangeType", range);

    if (overrideParams?.fromMonth) queryParams.set("fromMonth", overrideParams.fromMonth);
    if (overrideParams?.toMonth) queryParams.set("toMonth", overrideParams.toMonth);
    if (overrideParams?.fromDate) queryParams.set("fromDate", overrideParams.fromDate);
    if (overrideParams?.toDate) queryParams.set("toDate", overrideParams.toDate);

    try {
      const res = await fetch(`/api/admin/reports/monthly?${queryParams.toString()}`, {
        credentials: "include",
        cache: "no-store"
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Unable to generate the report. Please try again.");
        return null;
      }

      if (data.report) {
        setReportData(data.report);
      }
      if (data.availableMonths && data.availableMonths.length > 0) {
        setAvailableMonths(data.availableMonths);
        if (!selectedMonthKey && !m) {
          setSelectedMonthKey(data.availableMonths[0].key);
        }
      }
      return data.report as MonthlyReportPayload;
    } catch (err: any) {
      setErrorMessage(err?.message || "Network error: Unable to connect to the reporting service.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Helper to format numbers with commas
  const formatNumber = (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) return "0";
    return val.toLocaleString("en-IN");
  };

  // Generate and Print/Download High-Resolution PDF
  const triggerPdfGeneration = async (
    targetRangeType: "current" | "last3" | "custom-monthly" | "custom-date",
    customParams?: { fromMonth?: string; toMonth?: string; fromDate?: string; toDate?: string }
  ) => {
    setIsPdfDropdownOpen(false);
    setPdfGenerating(true);
    setErrorMessage(null);

    try {
      const targetPayload = await fetchReport({
        rangeType: targetRangeType,
        fromMonth: customParams?.fromMonth,
        toMonth: customParams?.toMonth,
        fromDate: customParams?.fromDate,
        toDate: customParams?.toDate
      });

      if (!targetPayload) {
        setPdfGenerating(false);
        return;
      }

      // Build printable official HTML document
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups for this site to export/print the Monthly Report PDF.");
        setPdfGenerating(false);
        return;
      }

      const formattedDate = new Date(targetPayload.generatedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      // 1. News Articles Directory Rows HTML (Without views column)
      const articlesRowsHtml = (targetPayload.articles || [])
        .map(
          (a, idx) => `
          <tr style="border-bottom: 1px solid #E2E8F0; font-size: 10px;">
            <td style="padding: 7px 8px; font-weight: bold; color: #475569; text-align: center; vertical-align: top;">${idx + 1}</td>
            <td style="padding: 7px 8px; font-weight: 700; color: #1E293B; white-space: nowrap; vertical-align: top;">${a.date}</td>
            <td style="padding: 7px 8px; font-weight: 800; color: #1E40AF; white-space: nowrap; vertical-align: top;">
              <span style="display: inline-block; background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 4px; padding: 2px 6px; font-size: 8.5px; text-transform: uppercase;">${a.category_en}</span>
            </td>
            <td style="padding: 7px 8px; color: #0F172A; vertical-align: top;">
              <div style="font-weight: 800; font-size: 10.5px; color: #0F172A; margin-bottom: 2px;">${a.title_en}</div>
              ${a.title_ta ? `<div style="font-size: 9.5px; color: #64748B; margin-bottom: 2px;">${a.title_ta}</div>` : ""}
              ${a.summary_en ? `<div style="font-size: 9px; color: #475569; line-height: 1.35;">${a.summary_en.slice(0, 180)}${a.summary_en.length > 180 ? "..." : ""}</div>` : ""}
            </td>
            <td style="padding: 7px 8px; font-size: 9.5px; color: #475569; white-space: nowrap; vertical-align: top;">${a.author_en}</td>
          </tr>
        `
        )
        .join("");

      // 2. Category & Topics Summary Rows HTML (With Topic Titles, Without Share and Views)
      const categoryRowsHtml = (targetPayload.categoryStats || [])
        .map(
          (c, idx) => `
          <tr style="border-bottom: 1px solid #E2E8F0; font-size: 10.5px;">
            <td style="padding: 8px 10px; font-weight: bold; color: #475569; text-align: center; vertical-align: top;">${idx + 1}</td>
            <td style="padding: 8px 10px; font-weight: 800; color: #1E40AF; vertical-align: top; white-space: nowrap;">${c.category}</td>
            <td style="padding: 8px 10px; text-align: right; font-weight: 800; color: #0F172A; vertical-align: top; white-space: nowrap;">${c.count} Articles</td>
            <td style="padding: 8px 10px; color: #334155; vertical-align: top;">
              <ul style="margin: 0; padding-left: 14px; font-size: 9.5px; line-height: 1.4;">
                ${(c.topics || []).map(t => `<li style="margin-bottom: 2px;">${t}</li>`).join("")}
              </ul>
            </td>
          </tr>
        `
        )
        .join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Greater Chennai Police - Official News Publications Report (${targetPayload.month})</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 12mm 14mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1E293B;
              background: #FFFFFF;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-table {
              width: 100%;
              border-bottom: 2.5px solid #1E40AF;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .meta-badge {
              display: inline-block;
              padding: 3px 8px;
              background-color: #EFF6FF;
              border: 1px solid #BFDBFE;
              border-radius: 6px;
              font-size: 10px;
              color: #1E40AF;
              font-weight: 700;
              margin-right: 6px;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 14px;
            }
            .kpi-box {
              border: 1px solid #CBD5E1;
              border-radius: 8px;
              padding: 9px;
              background-color: #F8FAFC;
              text-align: left;
            }
            .kpi-title {
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              color: #64748B;
              letter-spacing: 0.5px;
            }
            .kpi-val {
              font-size: 17px;
              font-weight: 900;
              color: #0F172A;
              margin-top: 2px;
            }
            .kpi-sub {
              font-size: 8.5px;
              font-weight: 700;
              margin-top: 2px;
              color: #059669;
            }
            .section-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #1E40AF;
              letter-spacing: 0.5px;
              border-left: 4px solid #D4AF37;
              padding-left: 8px;
              margin-top: 14px;
              margin-bottom: 8px;
            }
            table.report-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            table.report-table th {
              background-color: #1E40AF;
              color: #FFFFFF;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 6px 8px;
              letter-spacing: 0.5px;
            }
            .footer-info {
              margin-top: 16px;
              padding-top: 8px;
              border-top: 1px solid #E2E8F0;
              display: flex;
              justify-content: space-between;
              font-size: 8.5px;
              color: #64748B;
            }
            .btn-action {
              cursor: pointer;
              transition: all 0.15s ease-in-out;
              user-select: none;
            }
            .btn-action:hover {
              filter: brightness(1.1);
              transform: translateY(-1px);
            }
            .btn-action:active {
              transform: translateY(0);
            }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #1E293B; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; font-size: 13px;">Official GCP News & Press Releases Report PDF Preview</div>
            <div style="display: flex; gap: 8px;">
              <button id="print-btn" class="btn-action" type="button" onclick="window.focus(); window.print(); return false;" style="background: #D4AF37; color: #0F172A; border: none; padding: 8px 18px; font-weight: 800; font-size: 12px; border-radius: 6px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                Print / Save as PDF
              </button>
              <button id="close-btn" class="btn-action" type="button" onclick="window.close(); return false;" style="background: #475569; color: white; border: none; padding: 8px 16px; font-weight: 700; font-size: 12px; border-radius: 6px; cursor: pointer;">
                Close
              </button>
            </div>
          </div>

          <!-- Official GCP Header -->
          <table class="header-table">
            <tr>
              <td style="width: 65px; vertical-align: middle;">
                <img src="/images/gcp_logo.png" alt="GCP Logo" style="width: 52px; height: 52px; object-fit: contain;" />
              </td>
              <td style="vertical-align: middle;">
                <div style="font-size: 9px; font-weight: 900; color: #D4AF37; letter-spacing: 1.5px; text-transform: uppercase;">GOVERNMENT OF TAMIL NADU</div>
                <div style="font-size: 14.5px; font-weight: 900; color: #1E40AF; text-transform: uppercase; margin-top: 1px;">GREATER CHENNAI POLICE COMMISSIONERATE</div>
                <div style="font-size: 10px; font-weight: 700; color: #475569;">OFFICIAL PRESS RELEASES & NEWS PUBLICATION REPORT</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 8.5px; font-weight: 700; color: #64748B;">DOCUMENT REF:</div>
                <div style="font-size: 10px; font-weight: 800; color: #0F172A; font-family: monospace;">GCP-NEWS-${targetPayload.monthKey}</div>
                <div style="font-size: 8.5px; color: #64748B; margin-top: 2px;">Generated: ${formattedDate}</div>
              </td>
            </tr>
          </table>

          <!-- Filter / Scope Badges -->
          <div style="margin-bottom: 10px;">
            <span class="meta-badge"><strong>Period:</strong> ${targetPayload.month}</span>
            <span class="meta-badge"><strong>Published Articles:</strong> ${(targetPayload.articles || []).length} News Items</span>
            <span class="meta-badge"><strong>Source:</strong> Admin Posted News Portal</span>
          </div>

          <!-- KPI Summary Cards -->
          <div class="kpi-grid">
            <div class="kpi-box">
              <div class="kpi-title">Total Published News</div>
              <div class="kpi-val" style="color: #1E40AF;">${(targetPayload.articles || []).length}</div>
              <div class="kpi-sub">Admin Posted Articles</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-title">Categories Covered</div>
              <div class="kpi-val" style="color: #0284C7;">${(targetPayload.categoryStats || []).length}</div>
              <div class="kpi-sub" style="color: #0284C7;">Distinct Topics</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-title">Lead Category</div>
              <div class="kpi-val" style="font-size: 13px; color: #D97706; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${targetPayload.categoryStats && targetPayload.categoryStats[0] ? targetPayload.categoryStats[0].category : "General"}
              </div>
              <div class="kpi-sub" style="color: #D97706;">
                ${targetPayload.categoryStats && targetPayload.categoryStats[0] ? `${targetPayload.categoryStats[0].count} articles` : "Active"}
              </div>
            </div>
            <div class="kpi-box">
              <div class="kpi-title">Reporting Desk</div>
              <div class="kpi-val" style="font-size: 13px; color: #059669;">Media Cell</div>
              <div class="kpi-sub">Greater Chennai Police</div>
            </div>
          </div>

          <!-- Section 1: Category & Topics Breakdown -->
          <div class="section-title">1. News Categories & Published Topics Overview</div>
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th style="text-align: left; width: 140px;">News Category</th>
                <th style="text-align: right; width: 110px;">Articles Count</th>
                <th style="text-align: left;">News Topics / Headlines</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRowsHtml}
              <tr style="background-color: #F1F5F9; font-weight: 800; border-top: 2px solid #CBD5E1;">
                <td colspan="2" style="padding: 7px 10px; font-size: 10px; text-align: left; text-transform: uppercase;">Total Published News & Press Bulletins</td>
                <td style="padding: 7px 10px; text-align: right; font-size: 10px; color: #1E40AF;">${(targetPayload.articles || []).length} Articles</td>
                <td style="padding: 7px 10px; font-size: 9.5px; color: #475569;">Comprehensive News & Press Bulletins Coverage</td>
              </tr>
            </tbody>
          </table>

          <!-- Section 2: Complete Articles List -->
          <div class="section-title">2. Complete Published News Articles Directory (${(targetPayload.articles || []).length} Items)</div>
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">#</th>
                <th style="text-align: left; width: 85px;">Date</th>
                <th style="text-align: left; width: 110px;">Category</th>
                <th style="text-align: left;">Headline & Brief Summary</th>
                <th style="text-align: left; width: 120px;">Posted By</th>
              </tr>
            </thead>
            <tbody>
              ${articlesRowsHtml}
            </tbody>
          </table>

          <!-- Official Document Footer -->
          <div class="footer-info">
            <div>
              <strong>Generated by:</strong> GCP Control Panel (${targetPayload.generatedBy})<br/>
              <strong>Verification Authority:</strong> Office of the Commissioner of Police, Greater Chennai
            </div>
            <div style="text-align: right;">
              <strong>Security Classification:</strong> OFFICIAL MEDIA AUDIT<br/>
              Live Portal News Database Integration &middot; Verified Record
            </div>
          </div>

          <script>
            (function() {
              var pBtn = document.getElementById('print-btn');
              var cBtn = document.getElementById('close-btn');
              if (pBtn) {
                pBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  window.focus();
                  window.print();
                });
              }
              if (cBtn) {
                cBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  window.close();
                });
              }
              window.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                  window.close();
                }
              });
            })();
          </script>
        </body>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();

      // Additional fallback event listeners from parent context
      try {
        const pBtn = printWindow.document.getElementById("print-btn");
        const cBtn = printWindow.document.getElementById("close-btn");
        if (pBtn) {
          pBtn.addEventListener("click", () => {
            printWindow.focus();
            printWindow.print();
          });
        }
        if (cBtn) {
          cBtn.addEventListener("click", () => {
            printWindow.close();
          });
        }
      } catch {
        // Ignored if cross-origin or already bound
      }
      setSuccessMessage("PDF document preview generated. You can save or print directly.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      console.error("PDF generation error:", e);
      setErrorMessage("Error preparing PDF download.");
    } finally {
      setPdfGenerating(false);
    }
  };

  // Handle Custom Modal submission
  const handleCustomModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomModalError(null);

    if (customModalMode === "monthly") {
      if (!customFromMonth || !customToMonth) {
        setCustomModalError("Please select both 'From Month' and 'To Month'.");
        return;
      }
      if (customFromMonth > customToMonth) {
        setCustomModalError("'From Month' must be earlier than or equal to 'To Month'.");
        return;
      }
      setShowCustomModal(false);
      triggerPdfGeneration("custom-monthly", { fromMonth: customFromMonth, toMonth: customToMonth });
    } else {
      if (!customFromDate || !customToDate) {
        setCustomModalError("Please select both 'From Date' and 'To Date'.");
        return;
      }
      if (new Date(customFromDate).getTime() > new Date(customToDate).getTime()) {
        setCustomModalError("'From Date' cannot be after 'To Date'.");
        return;
      }
      setShowCustomModal(false);
      triggerPdfGeneration("custom-date", { fromDate: customFromDate, toDate: customToDate });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE HEADER: Breadcrumbs, Title, Subtitle, Download PDF     */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
            <span>Reports</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-[#1E40AF]">News Publication Report</span>
          </div>

          {/* Main Title with Icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 border border-[#1E40AF]/20 flex items-center justify-center text-[#1E40AF] shrink-0 shadow-sm">
              <FileText className="w-5 h-5 text-[#1E40AF]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1F2937] tracking-tight flex items-center gap-2.5">
                News Publication Report
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B45309] border border-[#D4AF37]/30">
                  Media Audit
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                Generate and download official PDF reports of news & press releases posted on the portal
              </p>
            </div>
          </div>
        </div>

        {/* Download PDF Menu */}
        <div className="relative shrink-0" ref={pdfDropdownRef}>
          <button
            type="button"
            onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
            disabled={pdfGenerating || loading}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {pdfGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Download className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
            )}
            <span>{pdfGenerating ? "Generating PDF..." : "Download PDF"}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${isPdfDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* PDF Options Dropdown */}
          {isPdfDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 max-w-[calc(100vw-32px)] bg-white border border-slate-200/95 rounded-2xl shadow-2xl p-2.5 z-50 animate-fadeIn text-left backdrop-blur-md">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100/90 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                  <Printer className="w-3.5 h-3.5 text-[#1E40AF]" />
                  Export Report PDF
                </span>
                <span className="text-[10px] font-bold text-[#1E40AF] bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                  Official Format
                </span>
              </div>

              <div className="space-y-1">
                {/* 1. Monthly News */}
                <button
                  type="button"
                  onClick={() => triggerPdfGeneration("current")}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-blue-50/70 rounded-xl border border-transparent hover:border-blue-100 transition-all duration-150 cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E40AF] shrink-0 group-hover:scale-105 transition-transform">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#1E40AF]">
                      Monthly News
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-blue-100/70 text-[#1E40AF] px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                    Active
                  </span>
                </button>

                {/* 2. Last 3 Months */}
                <button
                  type="button"
                  onClick={() => triggerPdfGeneration("last3")}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-amber-50/70 rounded-xl border border-transparent hover:border-amber-100 transition-all duration-150 cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-800">
                      Last 3 Months News
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-amber-100/70 text-amber-800 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                    Quarter
                  </span>
                </button>

                {/* 3. Custom — Monthly-wise */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPdfDropdownOpen(false);
                    setCustomModalMode("monthly");
                    setShowCustomModal(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-purple-50/70 rounded-xl border border-transparent hover:border-purple-100 transition-all duration-150 cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-purple-800">
                      Custom — Monthly-wise
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-purple-100/70 text-purple-800 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                    Range
                  </span>
                </button>

                {/* 4. Custom — Date-wise */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPdfDropdownOpen(false);
                    setCustomModalMode("date");
                    setShowCustomModal(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-emerald-50/70 rounded-xl border border-transparent hover:border-emerald-100 transition-all duration-150 cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                      Custom — Date-wise
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                    Exact
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTER CONTROLS BAR: Month Selector & Live Refresh           */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-[#1E40AF]" />
            Reporting Month:
          </label>
          <select
            value={selectedMonthKey}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            disabled={loading}
            className="bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E40AF] rounded-xl px-3.5 py-2 text-xs font-bold text-[#1E293B] outline-none cursor-pointer disabled:opacity-60 shadow-xs"
          >
            {availableMonths.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => fetchReport({ month: selectedMonthKey, rangeType: "current" })}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KPI METRIC SUMMARY CARDS                                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Published Articles */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/40 rounded-2xl border border-blue-100/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Published Articles
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#1E40AF] shrink-0">
              <Newspaper className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1E40AF] tracking-tight mb-3">
            {formatNumber(reportData?.totalArticles || 0)}
          </div>
          <div className="pt-2 border-t border-blue-100/60 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-100/60 text-[#1E40AF] font-bold text-[11px]">
              <Calendar className="w-3 h-3" />
              {reportData?.month || "Active Month"}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Total Count</span>
          </div>
        </div>

        {/* Card 2: News Categories */}
        <div className="bg-gradient-to-br from-white via-white to-sky-50/40 rounded-2xl border border-sky-100/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              News Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0284C7] tracking-tight mb-3">
            {formatNumber(reportData?.categoryStats?.length || 0)}
          </div>
          <div className="pt-2 border-t border-sky-100/60 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-100/60 text-sky-700 font-bold text-[11px]">
              <Activity className="w-3 h-3" />
              Covered Topics
            </span>
            <span className="text-[10px] font-bold text-slate-400">Classifications</span>
          </div>
        </div>

        {/* Card 3: Lead Category */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/40 rounded-2xl border border-amber-100/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Lead Category
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 truncate tracking-tight mb-3" title={reportData?.categoryStats?.[0]?.category || "General News"}>
            {reportData?.categoryStats?.[0]?.category || "General News"}
          </div>
          <div className="pt-2 border-t border-amber-100/60 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-100/60 text-amber-800 font-bold text-[11px]">
              <TrendingUp className="w-3 h-3" />
              {reportData?.categoryStats?.[0]?.count ? `${reportData.categoryStats[0].count} articles` : "No articles"}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Top Focus</span>
          </div>
        </div>

        {/* Card 4: Data Source */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-2xl border border-emerald-100/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Data Source
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 truncate tracking-tight mb-3">
            Live Portal Records
          </div>
          <div className="pt-2 border-t border-emerald-100/60 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-100/60 text-emerald-800 font-bold text-[11px]">
              <Database className="w-3 h-3" />
              Admin Verified
            </span>
            <span className="text-[10px] font-bold text-slate-400">Official</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: News Categories & Topics Summary Table             */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1E40AF]" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              1. Categories & Topics Overview
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {reportData?.categoryStats?.length || 0} Categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-48">Category</th>
                <th className="py-3 px-4 w-32 text-right">Articles Count</th>
                <th className="py-3 px-4">News Topics / Headlines</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(!reportData?.categoryStats || reportData.categoryStats.length === 0) ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                    No articles published in this selected reporting period.
                  </td>
                </tr>
              ) : (
                reportData.categoryStats.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-500 text-center">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#1E40AF] whitespace-nowrap">{c.category}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {c.count} Articles
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        {(c.topics || []).map((t, tIdx) => (
                          <li key={tIdx} className="leading-snug">{t}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: Complete Articles Directory Table                 */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1E40AF]" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              2. Published News Articles Directory ({reportData?.articles?.length || 0} Items)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#1E40AF] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            {reportData?.month || "Active Month"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-28">Date</th>
                <th className="py-3 px-4 w-40">Category</th>
                <th className="py-3 px-4">Headline & Summary</th>
                <th className="py-3 px-4 w-36">Posted By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(!reportData?.articles || reportData.articles.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                    No articles published in this selected reporting period.
                  </td>
                </tr>
              ) : (
                reportData.articles.map((a, idx) => (
                  <tr key={a.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400 text-center align-top">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap align-top">{a.date}</td>
                    <td className="py-3 px-4 align-top">
                      <span className="inline-block bg-blue-50 border border-blue-200 text-[#1E40AF] font-bold text-[10px] px-2 py-0.5 rounded-md uppercase whitespace-nowrap">
                        {a.category_en}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="font-extrabold text-slate-900 mb-1">{a.title_en}</div>
                      {a.title_ta && <div className="text-[11px] text-slate-500 mb-1">{a.title_ta}</div>}
                      {a.summary_en && <div className="text-[11px] text-slate-600 line-clamp-2">{a.summary_en}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap align-top">
                      {a.author_en}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-[#1E40AF]" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800">
                  {customModalMode === "monthly" ? "Custom Monthly Range PDF" : "Custom Date Range PDF"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCustomModalSubmit} className="p-5 sm:p-6 space-y-4">
              {customModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {customModalError}
                </div>
              )}

              {customModalMode === "monthly" ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      From Month
                    </label>
                    <select
                      value={customFromMonth}
                      onChange={(e) => setCustomFromMonth(e.target.value)}
                      required
                      className="w-full bg-[#F8FAFC] border border-[#E5E7EB] focus:border-[#1E40AF] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1F2937] outline-none"
                    >
                      <option value="">Select start month...</option>
                      {availableMonths.map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      To Month
                    </label>
                    <select
                      value={customToMonth}
                      onChange={(e) => setCustomToMonth(e.target.value)}
                      required
                      className="w-full bg-[#F8FAFC] border border-[#E5E7EB] focus:border-[#1E40AF] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1F2937] outline-none"
                    >
                      <option value="">Select ending month...</option>
                      {availableMonths.map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={customFromDate}
                      onChange={(e) => setCustomFromDate(e.target.value)}
                      required
                      className="w-full bg-[#F8FAFC] border border-[#E5E7EB] focus:border-[#1E40AF] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1F2937] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={customToDate}
                      onChange={(e) => setCustomToDate(e.target.value)}
                      required
                      className="w-full bg-[#F8FAFC] border border-[#E5E7EB] focus:border-[#1E40AF] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1F2937] outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ color: "#FFFFFF" }}
                  className="px-5 py-2.5 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white !text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition cursor-pointer"
                >
                  <span style={{ color: "#FFFFFF" }} className="text-white !text-white">
                    Generate & Export PDF
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
