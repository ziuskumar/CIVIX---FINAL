import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import BASE_URL from "../services/api";
import {
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  RefreshCw,
  AlertCircle,
  Ban,
  ShieldAlert,
  Edit3,
  CheckCircle,
  X,
  Settings,
  Bell,
  Activity,
  UserPlus,
  ShieldCheck as ShieldCheckIcon,
} from "lucide-react";

const API = `${BASE_URL}/api/admin`;

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [petitionFilter, setPetitionFilter] = useState("");
  const [actionLoading, setActionLoading] = useState({}); // per-item loading

  // Platform Settings State
  const [announcement, setAnnouncement] = useState("");
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  // Edit Petition Modal State
  const [editingPetition, setEditingPetition] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
  });

  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    if (tab === "users") fetchUsers();
  }, [tab, search, roleFilter]);
  useEffect(() => {
    if (tab === "petitions") fetchPetitions();
  }, [tab, petitionFilter]);
  useEffect(() => {
    if (tab === "polls") fetchPolls();
  }, [tab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/stats`, { headers });
      setStats(res.data);
    } catch {
      /* silent */
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/users`, {
        headers,
        params: { search, role: roleFilter },
      });
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetitions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/petitions`, {
        headers,
        params: { status: petitionFilter },
      });
      setPetitions(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/polls`, { headers });
      setPolls(res.data);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id, role) => {
    await axios.put(`${API}/users/${id}/role`, { role }, { headers });
    fetchUsers();
    fetchStats();
  };

  const toggleBan = async (id) => {
    setActionLoading((p) => ({ ...p, [id + "_ban"]: true }));
    try {
      await axios.put(`${API}/users/${id}/ban`, {}, { headers });
      fetchUsers();
      fetchStats();
    } finally {
      setActionLoading((p) => ({ ...p, [id + "_ban"]: false }));
    }
  };

  const toggleVerify = async (id) => {
    setActionLoading((p) => ({ ...p, [id + "_verify"]: true }));
    try {
      await axios.put(`${API}/users/${id}/verify`, {}, { headers });
      fetchUsers();
    } finally {
      setActionLoading((p) => ({ ...p, [id + "_verify"]: false }));
    }
  };

  const startEditing = (p) => {
    setEditingPetition(p);
    setEditForm({
      title: p.title,
      description: p.description,
      category: p.category,
      location: p.location,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${API}/petitions/${editingPetition._id}/edit`,
        editForm,
        {
          headers,
        },
      );
      setEditingPetition(null);
      fetchPetitions();
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await axios.delete(`${API}/users/${id}`, { headers });
    fetchUsers();
    fetchStats();
  };

  const approvePetition = async (id) => {
    setActionLoading((p) => ({ ...p, [id + "_approve"]: true }));
    await axios.put(`${API}/petitions/${id}/approve`, {}, { headers });
    setActionLoading((p) => ({ ...p, [id + "_approve"]: false }));
    fetchPetitions();
    fetchStats();
  };

  const updatePetitionStatus = async (id, status) => {
    setActionLoading((p) => ({ ...p, [id + "_status"]: true }));
    try {
      await axios.put(`${API}/petitions/${id}/status`, { status }, { headers });
      fetchPetitions();
      fetchStats();
    } finally {
      setActionLoading((p) => ({ ...p, [id + "_status"]: false }));
    }
  };

  const disapprovePetition = async (id) => {
    setActionLoading((p) => ({ ...p, [id + "_disapprove"]: true }));
    await axios.put(
      `${API}/petitions/${id}/reject`,
      { reason: "Disapproved by admin" },
      { headers },
    );
    setActionLoading((p) => ({ ...p, [id + "_disapprove"]: false }));
    fetchPetitions();
    fetchStats();
  };

  const deletePetition = async (id) => {
    if (!window.confirm("Delete this petition?")) return;
    await axios.delete(`${API}/petitions/${id}`, { headers });
    fetchPetitions();
    fetchStats();
  };

  const closePoll = async (id) => {
    setActionLoading((p) => ({ ...p, [id + "_close"]: true }));
    await axios.put(`${API}/polls/${id}/close`, {}, { headers });
    setActionLoading((p) => ({ ...p, [id + "_close"]: false }));
    fetchPolls();
  };

  const openPoll = async (id) => {
    setActionLoading((p) => ({ ...p, [id + "_open"]: true }));
    await axios.put(`${API}/polls/${id}/open`, {}, { headers });
    setActionLoading((p) => ({ ...p, [id + "_open"]: false }));
    fetchPolls();
  };

  const deletePoll = async (id) => {
    if (!window.confirm("Delete this poll?")) return;
    await axios.delete(`${API}/polls/${id}`, { headers });
    fetchPolls();
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "petitions", label: "Petitions", icon: FileText },
    { id: "users", label: "Users", icon: Users },
    { id: "polls", label: "Polls", icon: BarChart3 },
    { id: "settings", label: "Platform Settings", icon: Settings },
  ];

  const statusBadge = (status) => {
    const map = {
      active: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      under_review: "bg-amber-100 text-amber-700",
      closed: "bg-slate-100 text-slate-600",
      rejected: "bg-red-100 text-red-700",
      open: "bg-blue-100 text-blue-700",
    };
    return `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${map[status] || "bg-slate-100 text-slate-600"}`;
  };

  const roleBadge = (role) => {
    const map = {
      admin: "bg-purple-100 text-purple-700",
      official: "bg-blue-100 text-blue-700",
      citizen: "bg-slate-100 text-slate-600",
    };
    return `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${map[role] || "bg-slate-100 text-slate-600"}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Manage the entire platform from here.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all capitalize tracking-widest ${
                tab === t.id
                  ? "bg-white text-purple-600 shadow-md"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ── */}
        {tab === "overview" && stats && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Users",
                  value: stats.totalUsers,
                  icon: Users,
                  color: "bg-purple-500",
                },
                {
                  label: "Total Petitions",
                  value: stats.totalPetitions,
                  icon: FileText,
                  color: "bg-blue-500",
                },
                {
                  label: "Pending Review",
                  value: stats.pendingPetitions,
                  icon: AlertCircle,
                  color: "bg-amber-500",
                },
                {
                  label: "Total Polls",
                  value: stats.totalPolls,
                  icon: BarChart3,
                  color: "bg-green-500",
                },
                {
                  label: "Banned Users",
                  value: stats.bannedUsers || 0,
                  icon: ShieldAlert,
                  color: "bg-red-500",
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="card p-6 border-l-4 border-l-purple-400"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${s.color} bg-opacity-10`}>
                      <s.icon
                        className={`w-5 h-5 ${s.color.replace("bg-", "text-")}`}
                      />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {s.value}
                  </div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Role breakdown */}
            <div className="card p-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                User Role Breakdown
              </h3>
              <div className="flex flex-wrap gap-4">
                {stats.roleBreakdown.map((r) => (
                  <div
                    key={r._id}
                    className="flex items-center gap-3 bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100"
                  >
                    <span className={roleBadge(r._id)}>{r._id}</span>
                    <span className="text-2xl font-black text-slate-900">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PETITIONS ── */}
        {tab === "petitions" && (
          <motion.div
            key="petitions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={petitionFilter}
                onChange={(e) => setPetitionFilter(e.target.value)}
                className="input-field py-2.5 text-sm w-48"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={fetchPetitions}
                className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {petitions.map((p) => (
                  <motion.div
                    key={p._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={statusBadge(p.status)}>
                            {p.status.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {p.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900">
                          {p.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {p.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-bold pt-1">
                          <span>By: {p.createdBy?.name}</span>
                          <span>Location: {p.location}</span>
                          <span>
                            Signatures: {p.signatures?.length || 0} / {p.goal}
                          </span>
                          <span>
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Status Select */}
                        <div className="relative group">
                          <select
                            value={p.status}
                            onChange={(e) =>
                              updatePetitionStatus(p._id, e.target.value)
                            }
                            disabled={actionLoading[p._id + "_status"]}
                            className={`text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl px-4 py-2.5 bg-white cursor-pointer transition-all ${
                              actionLoading[p._id + "_status"]
                                ? "opacity-50"
                                : ""
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="under_review">Under Review</option>
                            <option value="closed">Closed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          {actionLoading[p._id + "_status"] && (
                            <RefreshCw className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-500 animate-spin" />
                          )}
                        </div>

                        <div className="h-8 w-px bg-slate-100 hidden md:block"></div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => approvePetition(p._id)}
                          disabled={
                            p.status === "active" ||
                            actionLoading[p._id + "_approve"]
                          }
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                        >
                          {actionLoading[p._id + "_approve"] ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => disapprovePetition(p._id)}
                          disabled={
                            p.status === "rejected" ||
                            p.status === "closed" ||
                            actionLoading[p._id + "_disapprove"]
                          }
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                        >
                          {actionLoading[p._id + "_disapprove"] ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Reject
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEditing(p)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
                          title="Edit Content"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deletePetition(p._id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {petitions.length === 0 && (
                  <div className="card p-16 text-center text-slate-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No petitions found</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-field pl-10 py-2.5 text-sm w-56"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field py-2.5 text-sm w-40"
              >
                <option value="">All Roles</option>
                <option value="citizen">Citizen</option>
                <option value="official">Official</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {[
                        "Name",
                        "Email",
                        "Role",
                        "Location",
                        "Joined",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className={`hover:bg-slate-50 transition-colors ${u.isBanned ? "bg-red-50/30" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 flex items-center gap-2">
                              {u.name}
                              {u.isVerified && (
                                <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                              )}
                              {u.isBanned && (
                                <Ban className="w-3.5 h-3.5 text-red-500" />
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              ID: {u._id.slice(-6)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => changeRole(u._id, e.target.value)}
                            className="text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-lg px-2 py-1 bg-white cursor-pointer"
                          >
                            <option value="citizen">Citizen</option>
                            <option value="official">Official</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {u.location || "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {u.role === "official" && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleVerify(u._id)}
                                disabled={actionLoading[u._id + "_verify"]}
                                className={`p-2 rounded-xl transition-all border ${
                                  u.isVerified
                                    ? "bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                    : "text-slate-400 hover:text-blue-500 hover:bg-blue-50 border-slate-200"
                                }`}
                                title={
                                  u.isVerified
                                    ? "Unverify Official"
                                    : "Verify Official"
                                }
                              >
                                {actionLoading[u._id + "_verify"] ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" />
                                )}
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleBan(u._id)}
                              disabled={
                                u.role === "admin" ||
                                actionLoading[u._id + "_ban"]
                              }
                              className={`p-2 rounded-xl transition-all border ${
                                u.isBanned
                                  ? "bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20"
                                  : "text-slate-400 hover:text-red-500 hover:bg-red-50 border-slate-200"
                              } ${u.role === "admin" ? "opacity-20 cursor-not-allowed" : ""}`}
                              title={u.isBanned ? "Unban User" : "Ban User"}
                            >
                              {actionLoading[u._id + "_ban"] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </motion.button>
                            <button
                              onClick={() => deleteUser(u._id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="p-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No users found</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── POLLS ── */}
        {tab === "polls" && (
          <motion.div
            key="polls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : (
              polls.map((poll) => {
                const totalVotes = poll.options.reduce(
                  (s, o) => s + o.votes,
                  0,
                );
                return (
                  <motion.div
                    key={poll._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2 items-center">
                          <span className={statusBadge(poll.status)}>
                            {poll.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {poll.location}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900">
                          {poll.question}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-1">
                          {poll.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-bold pt-1">
                          <span>By: {poll.createdBy?.name}</span>
                          <span>Total votes: {totalVotes}</span>
                          <span>
                            {new Date(poll.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openPoll(poll._id)}
                          disabled={
                            poll.status === "open" ||
                            actionLoading[poll._id + "_open"]
                          }
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-green-500 text-white rounded-xl text-xs font-black hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                        >
                          {actionLoading[poll._id + "_open"] ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => closePoll(poll._id)}
                          disabled={
                            poll.status === "closed" ||
                            actionLoading[poll._id + "_close"]
                          }
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                        >
                          {actionLoading[poll._id + "_close"] ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Disapprove
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deletePoll(poll._id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            {!loading && polls.length === 0 && (
              <div className="card p-16 text-center text-slate-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-bold">No polls found</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Global Announcements */}
            <div className="card p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Global Announcement
                </h3>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Broadcast a message to all users on their dashboard.
              </p>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Type your announcement here..."
                className="input-field min-h-[120px] resize-none py-4 text-sm font-medium"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsAnnouncing(true);
                  setTimeout(() => {
                    setIsAnnouncing(false);
                    setAnnouncement("");
                    alert("Announcement broadcasted successfully!");
                  }, 1500);
                }}
                disabled={!announcement || isAnnouncing}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20 disabled:opacity-50"
              >
                {isAnnouncing ? (
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Broadcast Message"
                )}
              </motion.button>
            </div>

            {/* Quick Actions */}
            <div className="card p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Quick Moderation
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">
                      Pending Official Verifications
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black">
                    {users.filter((u) => u.role === "official" && !u.isVerified)
                      .length || 0}
                  </span>
                </button>
                <button className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                    <span className="text-sm font-bold text-slate-700">
                      Reports Needing Attention
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black">
                    12
                  </span>
                </button>
                <button className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                    <span className="text-sm font-bold text-slate-700">
                      Recently Banned Users
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black">
                    {stats.bannedUsers || 0}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {editingPetition && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPetition(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Edit Petition Content
                </h2>
                <button
                  onClick={() => setEditingPetition(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Title
                  </label>
                  <input
                    className="input-field py-3 font-bold"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Description
                  </label>
                  <textarea
                    className="input-field py-3 min-h-[120px] resize-none"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Category
                    </label>
                    <input
                      className="input-field py-3"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Location
                    </label>
                    <input
                      className="input-field py-3"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPetition(null)}
                    className="flex-1 py-3 text-sm font-black text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
