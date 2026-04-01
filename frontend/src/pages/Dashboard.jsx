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
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/petitions", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 3 }
        })
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
    ...(data.role === "admin" ? [{ id: "admin", label: "Admin Panel", icon: ShieldCheck }] : []),
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
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Welcome back, {data.name}!
                </h1>
                <p className="text-slate-500">
                  Here's what's happening in your community today.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreatePetition(true)}
                className="btn-primary flex items-center gap-2 self-start md:self-auto shadow-lg shadow-primary-500/20"
              >
                <Plus className="w-4 h-4" />
                New Petition
              </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Petitions",
                  value: data.totalPetitions || 0,
                  icon: FileText,
                  color: "bg-secondary-500",
                },
                {
                  label: "Active Polls",
                  value: data.totalPolls || 0,
                  icon: BarChart3,
                  color: "bg-primary-500",
                },
                {
                  label: "Your Signatures",
                  value: data.mySignatures || 0,
                  icon: CheckCircle2,
                  color: "bg-secondary-600",
                },
                {
                  label: "Official Responses",
                  value: data.officialResponses || 0,
                  icon: Clock,
                  color: "bg-primary-600",
                },
              ].map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  transition={{
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 300,
                  }}
                  key={stat.label}
                  className="card p-6 border-l-4 border-l-primary-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${stat.color} bg-opacity-10 text-white shadow-sm`}
                    >
                      <stat.icon
                        className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <TrendingUp className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 space-y-6"
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
                <div className="space-y-4">
                  {recentPetitions.length === 0 ? (
                    <div className="card p-8 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold">No petitions yet</p>
                    </div>
                  ) : (
                    recentPetitions.map((p) => {
                      const progress = Math.min(
                        ((p.signatures?.length || 0) / (p.goal || 100)) * 100, 100
                      );
                      return (
                        <motion.div
                          key={p._id}
                          whileHover={{ x: 5 }}
                          onClick={() => setActiveMenu("petitions")}
                          className="card p-5 flex items-center gap-4 hover:border-secondary-200 transition-all cursor-pointer group"
                        >
                          <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center text-secondary-500 group-hover:bg-secondary-500 group-hover:text-white transition-all shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 group-hover:text-secondary-700 transition-colors line-clamp-1">
                              {p.title}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {p.createdBy?.name || "Unknown"} • {p.signatures?.length || 0} signatures
                            </p>
                          </div>
                          <div className="hidden sm:block text-right shrink-0">
                            <div className="text-sm font-bold text-slate-900">
                              {Math.round(progress)}% Signed
                            </div>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
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

              {/* Support Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-secondary-900 rounded-2xl p-8 text-white overflow-hidden relative group shadow-xl">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Need help?</h3>
                    <p className="text-secondary-100 text-sm mb-6 opacity-90 leading-relaxed">
                      Check our documentation or contact support for assistance
                      with any civic issues.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveMenu("help")}
                      className="bg-primary-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
                    >
                      Contact Support
                    </motion.button>
                  </div>
                  <HelpCircle className="absolute -right-4 -bottom-4 w-32 h-32 text-secondary-800 opacity-50 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
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
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <span className="text-2xl font-bold italic">C</span>
            </div>
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
                      ? activeMenu === "admin" ? "text-white" : "text-purple-500"
                      : activeMenu === item.id ? "text-white" : "text-slate-400"
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
        {/* Top bar for notifications/search */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              {/* Add search or other top bar info if needed */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2.5 bg-slate-50 text-slate-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-xl transition-all relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </motion.button>
          </div>
        </header>

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
