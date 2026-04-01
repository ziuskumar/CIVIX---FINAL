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
  Save 
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
        .get(`http://localhost:5000/api/petitions/${editId}`, {
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
        await axios.put(
          `http://localhost:5000/api/petitions/${editId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Petition Updated Successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/api/petitions",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          {editId ? <Save className="w-5 h-5 text-primary-600" /> : <Plus className="w-5 h-5 text-primary-600" />}
          {editId ? "Edit Petition" : "Create New Petition"}
        </h2>
        <button 
          onClick={handleClose}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Petition Title
          </label>
          <input
            name="title"
            placeholder="e.g., Fix the potholes on Main Street"
            className="input-field"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            Description
          </label>
          <textarea
            name="description"
            placeholder="Provide details about the issue and your proposed solution..."
            className="input-field min-h-[120px] resize-none"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              Category
            </label>
            <select
              name="category"
              className="input-field appearance-none bg-white"
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Location
            </label>
            <input
              name="location"
              placeholder="City, Neighborhood"
              className="input-field"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            Signature Goal
          </label>
          <input
            type="number"
            name="goal"
            placeholder="100"
            className="input-field"
            value={form.goal}
            onChange={handleChange}
            min="10"
          />
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider px-1">Recommended minimum: 50 signatures</p>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={handleClose}
            className="btn-secondary flex-1 py-3"
          >
            Cancel
          </button>
          <button 
            disabled={isLoading}
            type="submit" 
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {editId ? "Update Petition" : "Launch Petition"}
                <Plus className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
