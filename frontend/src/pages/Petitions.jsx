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
  const [editId, setEditId] = useState(null);       // petition being edited
  const [showCreate, setShowCreate] = useState(false); // create modal

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user._id || user.id;
  const isAdmin = user?.role === "admin";

  const fetchPetitions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/petitions",
        {
          params: { page, limit: 5, category, location },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      fetchPetitions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to sign petition");
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm("Are you sure you want to close this petition?")) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/petitions/close/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
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
      await axios.delete(
        `http://localhost:5000/api/petitions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponseText(prev => ({ ...prev, [id]: "" }));
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPetitions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to disapprove");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary-500" />
            Active Petitions
          </h1>
          <p className="text-slate-500 text-sm font-medium">Browse and support causes in your community.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input-field pl-10 py-2.5 text-sm w-full md:w-48 bg-slate-50 border-transparent focus:bg-white"
              placeholder="All Categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input-field pl-10 py-2.5 text-sm w-full md:w-48 bg-slate-50 border-transparent focus:bg-white"
              placeholder="Search Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          {user?.role !== "official" && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 py-2.5 px-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"
            >
              <Plus className="w-4 h-4" /> New Petition
            </motion.button>
          )}
        </div>
      </div>

      {/* Petition List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : petitions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-16 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">No petitions found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your filters or search criteria.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {petitions.map((p, index) => {
              const isCreator = p.createdBy?._id === userId || p.createdBy === userId;
              const isOfficial = user?.role === "official";
              const alreadySigned = p.signatures?.includes(userId);
              const progress = Math.min((p.signatures?.length || 0) / (p.goal || 100) * 100, 100);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  key={p._id}
                  className="card group hover:border-secondary-200 transition-all shadow-sm"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start gap-6 mb-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            p.status === 'open' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.status}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-secondary-50 text-secondary-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                            <Tag className="w-3 h-3" /> {p.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-secondary-700 transition-colors">{p.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 font-medium opacity-80">{p.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCreator && (
                          <>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditId(p._id)}
                              className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                              title="Edit Petition"
                            >
                              <Pencil className="w-5 h-5" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleClose(p._id)}
                              className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                              title="Close Petition"
                            >
                              <XCircle className="w-5 h-5" />
                            </motion.button>
                          </>
                        )}
                        {(isCreator || isOfficial) && (
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(p._id)}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Petition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        )}
                        {isAdmin && (
                          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAdminApprove(p._id)}
                              disabled={p.status === "active"}
                              title="Approve Petition"
                              className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-xs font-black hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-green-500/20"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAdminDisapprove(p._id)}
                              disabled={p.status === "closed"}
                              title="Disapprove Petition"
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-red-500/20"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Disapprove
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-y border-slate-50 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Creator</div>
                          <div className="text-sm text-slate-900 font-bold truncate">{p.createdBy?.name || "Anonymous"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Location</div>
                          <div className="text-sm text-slate-900 font-bold truncate">{p.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Launch Date</div>
                          <div className="text-sm text-slate-900 font-bold">{new Date(p.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Supporters</div>
                          <div className="text-sm text-slate-900 font-bold">{p.signatures?.length || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-2.5">
                        <div className="space-y-1">
                          <div className="text-xs font-black text-slate-900 uppercase tracking-widest">Progress to goal</div>
                          <div className="text-2xl font-black text-primary-600">{p.signatures?.length || 0} <span className="text-sm text-slate-400 font-bold">/ {p.goal || 100}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-slate-900">{Math.round(progress)}%</div>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-primary-500 rounded-full shadow-lg shadow-primary-500/30"
                        />
                      </div>
                    </div>

                    {/* Interaction Area */}
                    <div className="flex flex-col md:flex-row gap-4">
                      {!isOfficial && !isAdmin && p.status === 'active' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSign(p._id)}
                          disabled={alreadySigned}
                          className={`btn-primary flex-1 flex items-center justify-center gap-3 py-4 shadow-xl ${
                            alreadySigned ? 'opacity-50 cursor-not-allowed bg-slate-400 shadow-none' : 'shadow-primary-600/20'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-black uppercase tracking-widest">{alreadySigned ? "Already Signed" : "Sign this Petition"}</span>
                        </motion.button>
                      )}

                      {isOfficial && p.status !== 'closed' && (
                        <div className="flex-1 flex flex-col gap-3">
                          <div className="flex gap-3">
                            <input
                              className="input-field flex-1 py-4 bg-slate-50 border-transparent focus:bg-white"
                              placeholder="Write official response..."
                              value={responseText[p._id] || ""}
                              onChange={(e) => setResponseText({ ...responseText, [p._id]: e.target.value })}
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRespond(p._id)}
                              className="btn-secondary whitespace-nowrap px-8 py-4 font-black uppercase tracking-widest shadow-xl shadow-secondary-600/20"
                            >
                              Respond
                            </motion.button>
                          </div>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleApprove(p._id)}
                              disabled={p.status === "active"}
                              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-black hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-green-500/20"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleClose(p._id)}
                              className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-700 rounded-xl text-sm font-black hover:bg-amber-200 transition-colors"
                            >
                              <XCircle className="w-4 h-4" /> Close
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDelete(p._id)}
                              className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl text-sm font-black hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Responses Section */}
                    {p.responses?.length > 0 && (
                      <div className="mt-8 space-y-4 pt-6 border-t-2 border-dashed border-slate-100">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-secondary-500" /> Official Responses
                        </h4>
                        {p.responses.map((resp, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i} 
                            className="bg-secondary-50/50 rounded-2xl p-5 border border-secondary-100"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                  {resp.officialId?.name || "Verified Official"}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(resp.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-700 font-medium italic leading-relaxed">"{resp.comment}"</p>
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
        <div className="flex justify-center items-center gap-6 py-12">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-3 rounded-2xl border-2 border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-white hover:text-secondary-600 hover:border-secondary-200 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Page</span>
            <span className="text-xl font-black text-slate-900">{page}</span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">of {totalPages}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-3 rounded-2xl border-2 border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-white hover:text-secondary-600 hover:border-secondary-200 transition-all shadow-sm"
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowCreate(false); setEditId(null); }}
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
                close={() => { setShowCreate(false); setEditId(null); fetchPetitions(); }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
