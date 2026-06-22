"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, Heart, Navigation, Users, ArrowUpRight, TrendingDown, RefreshCw } from "lucide-react";

interface KPI {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface ChartPoint {
  label: string;
  value: number;
}

interface DashboardTab {
  id: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  kpis: KPI[];
  chartData: ChartPoint[];
  yAxisMax: number;
  yAxisPrefix?: string;
  yAxisSuffix?: string;
  note: string;
}

const dashboardTabs: DashboardTab[] = [
  {
    id: "surveillance",
    title: "Surveillance Coverage",
    icon: <Eye className="w-5 h-5" />,
    subtitle: "Third Eye CCTV Node Installations",
    kpis: [
      { label: "Active Nodes", value: "120,450", change: "+15.2% vs last year", isPositive: true },
      { label: "Smart Cam Coverage", value: "87%", change: "Focus on safety zones", isPositive: true },
      { label: "Integrated Feeds", value: "270+", change: "Junctions monitored", isPositive: true },
    ],
    chartData: [
      { label: "2021", value: 45000 },
      { label: "2022", value: 65000 },
      { label: "2023", value: 85000 },
      { label: "2024", value: 102000 },
      { label: "2025", value: 112000 },
      { label: "2026", value: 120450 },
    ],
    yAxisMax: 150000,
    note: "Data represents CCTV coverage across Chennai, Tambaram, and neighboring command loops.",
  },
  {
    id: "rescues",
    title: "Kaaval Karangal",
    icon: <Heart className="w-5 h-5" />,
    subtitle: "Abandoned & Vulnerable Persons Rehabilitated",
    kpis: [
      { label: "Total Rescued", value: "10,163", change: "Last 5 years record", isPositive: true },
      { label: "NGO Collaborators", value: "40+", change: "Shelters and Hospitals", isPositive: true },
      { label: "Family Reunions", value: "4,229", change: "Reunited with families", isPositive: true },
    ],
    chartData: [
      { label: "2021", value: 1200 },
      { label: "2022", value: 2900 },
      { label: "2023", value: 4800 },
      { label: "2024", value: 6400 },
      { label: "2025", value: 7600 },
      { label: "2026", value: 10163 },
    ],
    yAxisMax: 12000,
    note: "Values represent verified rescues, medical assistances, and family reunifications.",
  },
  {
    id: "traffic",
    title: "Traffic Safety",
    icon: <Navigation className="w-5 h-5" />,
    subtitle: "Road Fatality Reduction (CERS & IIT-M Partnership)",
    kpis: [
      { label: "Fatality Drop", value: "-22%", change: "Over last 24 months", isPositive: true },
      { label: "Volunteers Engaged", value: "1,500+", change: "School Zones protected", isPositive: true },
      { label: "RCAM Inspections", value: "100%", change: "All major crash sites", isPositive: true },
    ],
    chartData: [
      { label: "2021", value: 1180 },
      { label: "2022", value: 1090 },
      { label: "2023", value: 980 },
      { label: "2024", value: 850 },
      { label: "2025", value: 740 },
      { label: "2026", value: 620 },
    ],
    yAxisMax: 1500,
    note: "Displays the continuous reduction of fatal road accidents in the metropolitan area.",
  },
  {
    id: "cyber",
    title: "Cyber Outreach",
    icon: <Users className="w-5 h-5" />,
    subtitle: "Awareness & Community Seminars Conducted",
    kpis: [
      { label: "Seminars Held", value: "450+", change: "Colleges and Schools", isPositive: true },
      { label: "1930 Helpline Reach", value: "92%", change: "Public awareness level", isPositive: true },
      { label: "Cyber Volunteers", value: "3,200", change: "Enrolled in portal", isPositive: true },
    ],
    chartData: [
      { label: "2021", value: 80 },
      { label: "2022", value: 180 },
      { label: "2023", value: 270 },
      { label: "2024", value: 340 },
      { label: "2025", value: 410 },
      { label: "2026", value: 450 },
    ],
    yAxisMax: 500,
    note: "Factual representation of training sessions, public workshops, and voluntary safety advocates.",
  },
];

export default function Dashboard() {
  const [activeTabId, setActiveTabId] = useState("surveillance");

  const activeTab = dashboardTabs.find((tab) => tab.id === activeTabId) || dashboardTabs[0];

  // SVG dimensions for our custom graph
  const width = 600;
  const height = 250;
  const padding = 40;

  // Calculate plotting coordinates
  const points = activeTab.chartData.map((pt, index) => {
    const x = padding + (index * (width - 2 * padding)) / (activeTab.chartData.length - 1);
    const y = height - padding - (pt.value / activeTab.yAxisMax) * (height - 2 * padding);
    return { x, y, label: pt.label, value: pt.value };
  });

  // Construct SVG Path string
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <section id="dashboard" className="py-24 relative overflow-hidden bg-slate-900 text-white">
      {/* Background Matrix details */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-sky-400">
            Command & Control Interface
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight">
            Chennai Safety Dashboard
          </h2>
          <div className="h-1 w-12 bg-sky-500 mx-auto rounded-full" />
          <p className="text-slate-400 text-sm sm:text-base font-light">
            An executive dashboard presenting factual indicators, growth trends, and real-world safety efforts in public surveillance, rescue missions, and traffic safety.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
          {/* Dashboard Header - Command Menu */}
          <div className="border-b border-slate-800/80 p-4 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs uppercase tracking-widest font-bold text-slate-400">
                GCP Metric Center - Live Status
              </span>
            </div>
            
            {/* Interactive Toggle Buttons */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {dashboardTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold transition ${
                    activeTabId === tab.id
                      ? "bg-sky-500 text-slate-950"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {tab.icon}
                  {tab.title}
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard Panel Content */}
          <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Data KPIs (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">Metric Highlight</span>
                <h3 className="text-2xl font-display font-black tracking-tight">{activeTab.subtitle}</h3>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {activeTab.kpis.map((kpi, index) => (
                  <div key={index} className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/60 transition">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{kpi.label}</span>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-2xl font-display font-bold text-slate-50">{kpi.value}</span>
                      {kpi.isPositive ? (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" /> {kpi.change}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" /> {kpi.change}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Custom SVG Chart (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center items-center">
              <div className="relative w-full aspect-[12/5] sm:aspect-[12/5] max-w-2xl bg-slate-950/50 rounded-2xl p-4 border border-slate-800/60 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 cyber-grid opacity-10" />
                
                {/* SVG Graph Drawing */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.svg
                      key={activeTabId}
                      viewBox={`0 0 ${width} ${height}`}
                      className="w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Grid Lines */}
                      {[0, 1, 2, 3].map((val) => {
                        const y = padding + (val * (height - 2 * padding)) / 3;
                        return (
                          <line
                            key={val}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="rgba(255, 255, 255, 0.05)"
                            strokeWidth={1}
                          />
                        );
                      })}

                      {/* Area Gradient fill */}
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-sky-500)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="var(--color-sky-500)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <motion.path
                        d={areaPath}
                        fill="url(#chartGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />

                      {/* Line Path */}
                      <motion.path
                        d={linePath}
                        fill="none"
                        stroke="var(--color-sky-500)"
                        strokeWidth={3.5}
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />

                      {/* Data Dots & Tooltips */}
                      {points.map((p, i) => (
                        <g key={i} className="group/dot cursor-pointer">
                          {/* Pulsing outer dot */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={7}
                            fill="var(--color-sky-500)"
                            opacity={0.3}
                            className="hover:scale-150 transition"
                          />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={3.5}
                            fill="#ffffff"
                            stroke="var(--color-sky-700)"
                            strokeWidth={1.5}
                          />
                          
                          {/* Label values above dot */}
                          <text
                            x={p.x}
                            y={p.y - 12}
                            textAnchor="middle"
                            fill="#cbd5e1"
                            fontSize={10}
                            fontWeight="bold"
                            className="opacity-0 group-hover/dot:opacity-100 transition duration-200"
                          >
                            {p.value.toLocaleString()}
                          </text>

                          {/* X-axis labels */}
                          <text
                            x={p.x}
                            y={height - 12}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize={10}
                            fontWeight="500"
                          >
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </motion.svg>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-2 z-10 border-t border-slate-900 pt-2">
                  <span>* {activeTab.note}</span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} /> Verified GCP Statistics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
