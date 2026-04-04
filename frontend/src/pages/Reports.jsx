import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  PieChart as PieChartIcon,
  FileText,
  BarChart3,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const COLORS = {
  active: "#22c55e",
  under_review: "#f59e0b",
  closed: "#3b82f6",
  open: "#10b981",
  closedPoll: "#64748b",
};

export default function Reports() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
      } catch (err) {
        console.error("Error fetching reports", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) return null;

  const petitionStatusData = [
    { name: "Active", value: report.active || 0, color: COLORS.active },
    {
      name: "Under Review",
      value: report.under_review || 0,
      color: COLORS.under_review,
    },
    { name: "Closed", value: report.closed || 0, color: COLORS.closed },
  ];

  const pollStatusData = [
    { name: "Open", value: report.openPolls || 0, color: COLORS.open },
    {
      name: "Closed",
      value: report.closedPolls || 0,
      color: COLORS.closedPoll,
    },
  ];

  const successRate =
    report.totalPetitions > 0
      ? Math.round((report.closed / report.totalPetitions) * 100)
      : 0;

  const stats = [
    {
      label: "Total Petitions",
      value: report.totalPetitions || 0,
      icon: FileText,
      color: "text-secondary-600",
      bg: "bg-secondary-50",
    },
    {
      label: "Total Polls",
      value: report.totalPolls || 0,
      icon: BarChart3,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Total Signatures",
      value: report.totalSignatures || 0,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Now",
      value: (report.active || 0) + (report.openPolls || 0),
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const tooltipStyle = {
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    fontSize: "12px",
    fontWeight: "700",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <PieChartIcon className="w-8 h-8 text-secondary-500" />
            Reports & Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Live data from your civic engagement platform.
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              window.open(`${API}/api/reports/export/csv`)
            }
            className="btn-outline flex items-center gap-2 py-3 px-5 shadow-sm text-xs font-black uppercase tracking-widest"
          >
            <Download className="w-4 h-4" /> CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              window.open(`${API}/api/reports/export/pdf`)
            }
            className="btn-secondary flex items-center gap-2 py-3 px-5 shadow-sm text-xs font-black uppercase tracking-widest"
          >
            <Download className="w-4 h-4" /> PDF
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-6 group hover:border-secondary-200 transition-all shadow-sm"
          >
            <div
              className={`p-3 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-4 group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner">
        {["overview", "trends", "categories"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all capitalize tracking-widest ${
              activeTab === tab
                ? "bg-white text-secondary-600 shadow-md"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Petition Pie */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-8 shadow-sm flex flex-col h-[420px]"
          >
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900">
                Petition Status
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                Live breakdown
              </p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={petitionStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {petitionStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val, name) => [val, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(v) => (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {v}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Poll Pie */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-8 shadow-sm flex flex-col h-[420px]"
          >
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900">Poll Status</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                Live breakdown
              </p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pollStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {pollStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(v) => (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {v}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── TRENDS TAB ── */}
      {activeTab === "trends" && (
        <div className="space-y-8">
          {/* Monthly Petitions Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 shadow-sm h-[380px] flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900">
                Monthly Petition Activity
              </h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                Last 6 months
              </p>
            </div>
            <div className="flex-1">
              {report.trendData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={report.trendData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: "#64748b" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: "#64748b" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                        fontWeight: "800",
                        padding: "12px 16px",
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(4px)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(v) => (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mx-2">
                          {v}
                        </span>
                      )}
                    />
                    <Line
                      type="linear"
                      dataKey="petitions"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#2563eb",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                      name="Petitions"
                    />
                    <Line
                      type="linear"
                      dataKey="signatures"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#22c55e",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                      name="Signatures"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <BarChart3 className="w-12 h-12 mb-3" />
                  <p className="font-bold text-sm">No trend data yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Monthly Signatures Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-8 shadow-sm h-[380px] flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900">
                Signatures per Month
              </h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                Community support over time
              </p>
            </div>
            <div className="flex-1">
              {report.trendData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.trendData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: "#64748b" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: "#64748b" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                        fontWeight: "800",
                        padding: "12px 16px",
                      }}
                    />
                    <Bar
                      dataKey="signatures"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      name="Signatures"
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <BarChart3 className="w-12 h-12 mb-3" />
                  <p className="font-bold text-sm">No data yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── CATEGORIES TAB ── */}
      {activeTab === "categories" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 shadow-sm h-[420px] flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-900">
              Petitions by Category
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Top 6 categories
            </p>
          </div>
          <div className="flex-1">
            {report.categoryBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={report.categoryBreakdown}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fontWeight: 700 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 700 }}
                    width={100}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="count"
                    fill="#2563eb"
                    radius={[0, 6, 6, 0]}
                    name="Petitions"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <FileText className="w-12 h-12 mb-3" />
                <p className="font-bold text-sm">No category data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Insights — fully dynamic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-10 bg-secondary-900 text-white relative overflow-hidden shadow-xl"
      >
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-primary-400" />
            Engagement Insights
          </h2>
          <p className="text-secondary-100 mb-8 leading-relaxed font-medium text-lg opacity-90">
            Your platform currently has{" "}
            <span className="text-white font-black">
              {report.totalPetitions}
            </span>{" "}
            petitions and{" "}
            <span className="text-white font-black">{report.totalPolls}</span>{" "}
            polls.
            {report.topCategory && report.topCategory !== "N/A" && (
              <>
                {" "}
                The most active category is{" "}
                <span className="text-white font-black underline decoration-primary-500 decoration-2 underline-offset-4">
                  "{report.topCategory}"
                </span>
                .
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-secondary-800/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-secondary-700/50">
              <div className="text-[10px] text-primary-400 font-black uppercase tracking-widest mb-1">
                Top Category
              </div>
              <div className="font-black text-xl">
                {report.topCategory || "N/A"}
              </div>
            </div>
            <div className="bg-secondary-800/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-secondary-700/50">
              <div className="text-[10px] text-primary-400 font-black uppercase tracking-widest mb-1">
                Total Signatures
              </div>
              <div className="font-black text-xl">
                {report.totalSignatures || 0}
              </div>
            </div>
            <div className="bg-secondary-800/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-secondary-700/50">
              <div className="text-[10px] text-primary-400 font-black uppercase tracking-widest mb-1">
                Resolution Rate
              </div>
              <div className="font-black text-xl">{successRate}%</div>
            </div>
            <div className="bg-secondary-800/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-secondary-700/50">
              <div className="text-[10px] text-primary-400 font-black uppercase tracking-widest mb-1">
                Under Review
              </div>
              <div className="font-black text-xl">
                {report.under_review || 0}
              </div>
            </div>
          </div>
        </div>
        <BarChart3 className="absolute -right-12 -bottom-12 w-80 h-80 text-secondary-800 opacity-40" />
      </motion.div>
    </div>
  );
}
