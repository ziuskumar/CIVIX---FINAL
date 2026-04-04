import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  X,
  FileText,
  AlignLeft,
  Tag,
  MapPin,
  Target,
  Plus,
  Save,
} from "lucide-react";

export default function CreatePetition({ editId, onBack, close }) {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    goal: 100,
  });

  useEffect(() => {
    if (editId) {
      axios
        .get(`https://civix-backend-e7m5.onrender.com/api/petitions/${editId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setForm({
            title: res.data.title,
            description: res.data.description,
            category: res.data.category,
            location: res.data.location,
            goal: res.data.goal,
          });
        });
    }
  }, [editId, token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editId) {
        await axios.put(`https://civix-backend-e7m5.onrender.com/api/petitions/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Petition Updated Successfully!");
      } else {
        await axios.post("https://civix-backend-e7m5.onrender.com/api/petitions", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Petition Created Successfully!");
      }

      if (close) close();
      if (onBack) onBack();
    } catch (err) {
      alert("Error saving petition");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (close) close();
    if (onBack) onBack();
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              {editId ? (
                <Save className="w-6 h-6 text-primary-600" />
              ) : (
                <Plus className="w-6 h-6 text-primary-600" />
              )}
            </div>
            {editId ? "Update Petition" : "Launch New Petition"}
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 ml-11">
            {editId
              ? "Refine your cause for better engagement"
              : "Start a movement in your community today"}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-red-500 relative z-10 border border-transparent hover:border-red-100"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Abstract Background Shapes */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 rounded-full blur-2xl opacity-50"></div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
            <FileText className="w-4 h-4 text-primary-500" />
            Petition Title
          </label>
          <input
            name="title"
            placeholder="e.g., Fix the potholes on Main Street"
            className="input-field py-4 bg-slate-50 border-transparent focus:bg-white focus:border-primary-500 shadow-inner font-bold"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
            <AlignLeft className="w-4 h-4 text-secondary-500" />
            Description
          </label>
          <textarea
            name="description"
            placeholder="Provide details about the issue and your proposed solution..."
            className="input-field min-h-[160px] resize-none py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500 shadow-inner font-medium leading-relaxed"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
              <Tag className="w-4 h-4 text-emerald-500" />
              Category
            </label>
            <div className="relative group">
              <select
                name="category"
                className="input-field appearance-none bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 shadow-inner font-bold py-4 pr-10"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Environment">Environment</option>
                <option value="Education">Education</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Healthcare">Healthcare</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Plus className="w-4 h-4 rotate-45" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
              <MapPin className="w-4 h-4 text-blue-500" />
              Location
            </label>
            <input
              name="location"
              placeholder="City, Neighborhood"
              className="input-field py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 shadow-inner font-bold"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
            <Target className="w-4 h-4 text-amber-500" />
            Signature Goal
          </label>
          <div className="relative">
            <input
              type="number"
              name="goal"
              placeholder="100"
              className="input-field py-4 bg-slate-50 border-transparent focus:bg-white focus:border-amber-500 shadow-inner font-black"
              value={form.goal}
              onChange={handleChange}
              min="10"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
              Signatures
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest px-1">
            Tip: Smaller goals are easier to reach and gain momentum
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
          >
            Discard
          </button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className="flex-[2] py-4 px-8 rounded-2xl bg-primary-600 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{editId ? "Update Changes" : "Launch Cause Now"}</span>
                <Plus className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
