import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Tag,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  Pencil,
  Plus,
  ShieldCheck,
} from "lucide-react";
import CreatePetition from "./CreatePetition";

export default function Petitions() {
  const [petitions, setPetitions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [responseText, setResponseText] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [editId, setEditId] = useState(null); // petition being edited
  const [showCreate, setShowCreate] = useState(false); // create modal

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user._id || user.id;
  const isAdmin = user?.role === "admin";

  const fetchPetitions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/petitions", {
        params: { page, limit: 5, category, location },
        headers: { Authorization: `Bearer ${token}` },
      });
      setPetitions(res.data.petitions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching petitions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, [page, category, location]);

  const handleSign = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/petitions/sign/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(res.data.message);
      fetchPetitions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to sign petition");
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm("Are you sure you want to close this petition?"))
      return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/petitions/close/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(res.data.message);
      fetchPetitions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close petition");
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/petitions/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(res.data.message);
      fetchPetitions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve petition");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this petition? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/petitions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPetitions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete petition");
    }
  };

  const handleRespond = async (id) => {
    if (!responseText[id]) {
      alert("Response cannot be empty");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/petitions/respond/${id}`,
        { comment: responseText[id] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setResponseText((prev) => ({ ...prev, [id]: "" }));
      fetchPetitions();
    } catch (err) {
      alert("Failed to send response");
    }
  };

  const handleAdminApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/petitions/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchPetitions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleAdminDisapprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/petitions/${id}/reject`,
        { reason: "Disapproved by admin" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchPetitions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to disapprove");
    }
  };

  return (
    <div className="space-y-10">
      {/* Header & Stats Overview */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-sm group">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-2xl">
                <Tag className="w-8 h-8 text-primary-600" />
              </div>
              Public Petitions
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-xl">
              Support local causes, start a movement, and engage directly with
              community leaders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {user?.role !== "official" && (
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreate(true)}
                className="btn-primary flex items-center gap-3 shadow-2xl shadow-primary-500/40 py-4 px-8 rounded-2xl text-sm font-black uppercase tracking-widest"
              >
                <Plus className="w-5 h-5" />
                Launch Petition
              </motion.button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-10 flex flex-col md:flex-row items-center gap-4 pt-8 border-t border-slate-50 relative z-10">
          <div className="relative flex-1 group w-full">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-primary-500 shadow-inner w-full text-sm font-bold"
              placeholder="Search by category (e.g., Environment, Education...)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="relative flex-1 group w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
            <input
              className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500 shadow-inner w-full text-sm font-bold"
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setCategory("");
              setLocation("");
              setPage(1);
            }}
            className="p-4 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-2xl transition-all font-black text-xs uppercase tracking-widest whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
      </div>

      {/* Petition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : petitions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full card p-24 text-center bg-white border-2 border-dashed border-slate-200"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              No petitions found
            </h3>
            <p className="text-slate-500 font-medium text-lg">
              Try adjusting your filters or be the first to start a cause.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {petitions.map((p, index) => {
              const isCreator =
                p.createdBy?._id === userId || p.createdBy === userId;
              const isOfficial = user?.role === "official";
              const alreadySigned = p.signatures?.includes(userId);
              const progress = Math.min(
                ((p.signatures?.length || 0) / (p.goal || 100)) * 100,
                100,
              );

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  key={p._id}
                  className="card group hover:border-primary-200 transition-all shadow-sm hover:shadow-2xl hover:shadow-primary-500/5 bg-white flex flex-col h-full border-none"
                >
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-6 mb-8">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${
                              p.status === "active"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : p.status === "pending"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {p.status}
                          </span>
                          <span className="px-4 py-1.5 rounded-xl bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 border border-primary-100 shadow-sm">
                            <Tag className="w-3 h-3" /> {p.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                          {p.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCreator && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: -10 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditId(p._id)}
                              className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all border border-transparent hover:border-primary-100"
                              title="Edit Petition"
                            >
                              <Pencil className="w-5 h-5" />
                            </motion.button>
                          </>
                        )}
                        {(isCreator || isOfficial || isAdmin) && (
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(p._id)}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                            title="Delete Petition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-500 text-base leading-relaxed line-clamp-3 font-medium opacity-90 mb-8 flex-1">
                      {p.description}
                    </p>

                    {/* Progress Area */}
                    <div className="space-y-5 mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Current Support
                          </div>
                          <div className="text-3xl font-black text-primary-600">
                            {p.signatures?.length || 0}
                            <span className="text-sm text-slate-400 font-bold ml-2">
                              / {p.goal || 100}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-slate-900">
                            {Math.round(progress)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-sm border border-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-lg shadow-primary-500/30"
                        />
                      </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-50 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[8px] text-slate-400 uppercase font-black tracking-widest">
                            Creator
                          </div>
                          <div className="text-xs text-slate-900 font-black truncate">
                            {p.createdBy?.name || "Anonymous"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-50 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[8px] text-slate-400 uppercase font-black tracking-widest">
                            Location
                          </div>
                          <div className="text-xs text-slate-900 font-black truncate">
                            {p.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interaction Area */}
                    <div className="flex flex-col gap-4 mt-auto">
                      {!isOfficial && !isAdmin && p.status === "active" && (
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSign(p._id)}
                          disabled={alreadySigned}
                          className={`flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl ${
                            alreadySigned
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none opacity-80"
                              : "bg-secondary-900 text-white shadow-secondary-900/20 hover:bg-secondary-800"
                          }`}
                        >
                          {alreadySigned ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                          {alreadySigned
                            ? "Successfully Signed"
                            : "Sign this Petition"}
                        </motion.button>
                      )}

                      {isAdmin && (
                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAdminApprove(p._id)}
                            disabled={p.status === "active"}
                            className="flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-40 shadow-lg shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAdminDisapprove(p._id)}
                            disabled={p.status === "rejected"}
                            className="flex items-center justify-center gap-2 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-40 shadow-lg shadow-red-500/20"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </motion.button>
                        </div>
                      )}

                      {isOfficial && p.status !== "closed" && (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="relative group">
                            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
                            <input
                              className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white text-sm font-bold"
                              placeholder="Add an official response..."
                              value={responseText[p._id] || ""}
                              onChange={(e) =>
                                setResponseText({
                                  ...responseText,
                                  [p._id]: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRespond(p._id)}
                              className="btn-secondary py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary-600/20"
                            >
                              Send Response
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleClose(p._id)}
                              className="bg-amber-100 text-amber-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-all border border-amber-200"
                            >
                              Close Petition
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Responses Section */}
                    {p.responses?.length > 0 && (
                      <div className="mt-8 space-y-4 pt-8 border-t-2 border-dashed border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-4">
                          <ShieldCheck className="w-4 h-4 text-primary-500" />
                          Official Verifications
                        </h4>
                        {p.responses.map((resp, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i}
                            className="bg-primary-50/50 rounded-2xl p-5 border border-primary-100 relative group/resp"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                                  {resp.officialId?.name || "Verified Official"}
                                </span>
                              </div>
                              <span className="text-[8px] text-slate-400 font-bold uppercase">
                                {new Date(resp.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 font-bold italic leading-relaxed">
                              "{resp.comment}"
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-8 py-16">
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page
            </span>
            <span className="text-2xl font-black text-slate-900">{page}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              of {totalPages}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(showCreate || editId) && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreate(false);
                setEditId(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <CreatePetition
                editId={editId}
                close={() => {
                  setShowCreate(false);
                  setEditId(null);
                  fetchPetitions();
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
