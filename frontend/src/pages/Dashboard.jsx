import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  AlertCircle,
  Settings as SettingsIcon,
  HelpCircle,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Bell,
  ShieldCheck,
} from "lucide-react";

import Petitions from "./Petitions";
import CreatePetition from "./CreatePetition";
import Polls from "./Polls";
import Officials from "./Officials";
import Reports from "./Reports";
import HelpSupport from "./HelpSupport";
import Settings from "./Settings";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePetition, setShowCreatePetition] = useState(false);
  const [recentPetitions, setRecentPetitions] = useState([]);

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const [dashRes, petRes] = await Promise.all([
        axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/petitions", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 3 },
        }),
      ]);
      const localUser = JSON.parse(localStorage.getItem("user")) || {};
      setData({ ...localUser, ...dashRes.data });
      setRecentPetitions(petRes.data.petitions || []);
    } catch {
      localStorage.clear();
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();

    const socket = io("http://localhost:5000");
    socket.on("pollUpdated", fetchDashboard);

    return () => {
      socket.off("pollUpdated");
      socket.disconnect();
    };
  }, [fetchDashboard]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "petitions", label: "Petitions", icon: FileText },
    { id: "polls", label: "Polls", icon: BarChart3 },
    { id: "officials", label: "Officials", icon: Users },
    { id: "reports", label: "Reports", icon: AlertCircle },
    { id: "help", label: "Support", icon: HelpCircle },
    { id: "settings", label: "Settings", icon: SettingsIcon },
    ...(data.role === "admin"
      ? [{ id: "admin", label: "Admin Panel", icon: ShieldCheck }]
      : []),
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "petitions":
        return <Petitions />;
      case "polls":
        return <Polls />;
      case "officials":
        return <Officials />;
      case "reports":
        return <Reports />;
      case "help":
        return <HelpSupport />;
      case "settings":
        return <Settings />;
      case "admin":
        return <AdminDashboard />;
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="relative z-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  Welcome back,{" "}
                  <span className="text-primary-600">{data.name}</span>!
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg">
                  You have{" "}
                  <span className="text-secondary-600 font-bold">
                    {data.totalPetitions || 0}
                  </span>{" "}
                  active petitions in your area.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreatePetition(true)}
                className="btn-primary flex items-center gap-3 self-start md:self-auto shadow-2xl shadow-primary-500/40 py-4 px-8 rounded-2xl text-sm font-black uppercase tracking-widest"
              >
                <Plus className="w-5 h-5" />
                Start a Petition
              </motion.button>

              {/* Abstract Background Shapes */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Petitions",
                  value: data.totalPetitions || 0,
                  icon: FileText,
                  color: "from-secondary-600 to-secondary-500",
                  shadow: "shadow-secondary-500/20",
                },
                {
                  label: "Active Polls",
                  value: data.totalPolls || 0,
                  icon: BarChart3,
                  color: "from-primary-600 to-primary-500",
                  shadow: "shadow-primary-500/20",
                },
                {
                  label: "Your Signatures",
                  value: data.mySignatures || 0,
                  icon: CheckCircle2,
                  color: "from-emerald-600 to-emerald-500",
                  shadow: "shadow-emerald-500/20",
                },
                {
                  label: "Official Responses",
                  value: data.officialResponses || 0,
                  icon: Clock,
                  color: "from-blue-600 to-blue-500",
                  shadow: "shadow-blue-500/20",
                },
              ].map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  transition={{
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  key={stat.label}
                  className="card p-6 border-none bg-white relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}
                      >
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3" />
                        +12%
                      </div>
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">
                      {stat.label}
                    </div>
                  </div>

                  {/* Decorative background icon */}
                  <stat.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-secondary-500" />
                    Recent Petitions
                  </h2>
                  <button
                    onClick={() => setActiveMenu("petitions")}
                    className="text-sm font-bold text-secondary-600 hover:text-secondary-700 flex items-center gap-1 transition-colors"
                  >
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentPetitions.length === 0 ? (
                    <div className="col-span-full card p-8 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold">No petitions yet</p>
                    </div>
                  ) : (
                    recentPetitions.map((p) => {
                      const progress = Math.min(
                        ((p.signatures?.length || 0) / (p.goal || 100)) * 100,
                        100,
                      );
                      return (
                        <motion.div
                          key={p._id}
                          whileHover={{ y: -5 }}
                          onClick={() => setActiveMenu("petitions")}
                          className="card p-5 flex flex-col gap-4 hover:border-secondary-200 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center text-secondary-500 group-hover:bg-secondary-500 group-hover:text-white transition-all shrink-0 relative">
                              <FileText className="w-5 h-5" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 group-hover:text-secondary-700 transition-colors line-clamp-1 text-sm">
                                {p.title}
                              </h3>
                              <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {p.createdBy?.name || "Unknown"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-500">
                                {p.signatures?.length || 0} signatures
                              </span>
                              <span className="text-primary-600">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary-500 rounded-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>

              {/* Support Box - Long Format */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 rounded-3xl p-8 md:p-10 text-white overflow-hidden relative group shadow-2xl border border-secondary-700/50">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                          <HelpCircle className="w-6 h-6 text-primary-400" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">
                          Need technical assistance?
                        </h3>
                      </div>
                      <p className="text-secondary-100 text-lg opacity-90 leading-relaxed font-medium">
                        Our dedicated support team is here to help you navigate
                        the platform, report issues, or understand how to make
                        the most of Civix tools.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveMenu("help")}
                        className="bg-primary-500 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 border border-primary-400/20"
                      >
                        Contact Support
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveMenu("help")}
                        className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                      >
                        Documentation
                      </motion.button>
                    </div>
                  </div>

                  {/* Decorative background elements */}
                  <HelpCircle className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700" />
                  <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2"></div>
                </div>
              </motion.div>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-40">
        <div className="p-6 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-3 group mb-8">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              Civix
            </span>
          </Link>

          {/* Profile Section - Now under Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-2"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-secondary-600 flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden">
                  {data.profilePhoto ? (
                    <img
                      src={`http://localhost:5000/uploads/${data.profilePhoto}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    data.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {data.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {data.role} • {data.location}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  item.id === "admin"
                    ? activeMenu === "admin"
                      ? "bg-purple-600 text-white shadow-xl shadow-purple-600/20 scale-[1.02]"
                      : "text-purple-600 hover:bg-purple-50 border border-purple-100"
                    : activeMenu === item.id
                      ? "bg-primary-600 text-white shadow-xl shadow-primary-600/20 scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    item.id === "admin"
                      ? activeMenu === "admin"
                        ? "text-white"
                        : "text-purple-500"
                      : activeMenu === item.id
                        ? "text-white"
                        : "text-slate-400"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <main className="p-6 md:p-10 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Create Petition Modal */}
      <AnimatePresence>
        {showCreatePetition && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreatePetition(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <CreatePetition close={() => setShowCreatePetition(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
