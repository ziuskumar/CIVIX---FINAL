import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  X, 
  BarChart3, 
  AlignLeft, 
  MapPin, 
  Plus, 
  Minus, 
  Save,
  HelpCircle
} from "lucide-react";

const CreatePoll = ({ onBack, editData }) => {
  const token = localStorage.getItem("token");

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setQuestion(editData.question);
      setDescription(editData.description);
      setLocation(editData.location);
      setOptions(editData.options.map(opt => opt.text));
    }
  }, [editData]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (options.some(opt => !opt.trim())) {
      alert("Please fill in all options");
      return;
    }

    try {
      setLoading(true);
      if (editData) {
        await axios.put(
          `http://localhost:5000/api/polls/update/${editData._id}`,
          { question, description, location, options },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Poll Updated Successfully! ✅");
      } else {
        await axios.post(
          "http://localhost:5000/api/polls",
          { question, description, location, options },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Poll Created Successfully! ✅");
      }
      onBack();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {editData ? <Save className="w-5 h-5 text-primary-600" /> : <BarChart3 className="w-5 h-5 text-primary-600" />}
            {editData ? "Edit Community Poll" : "Create New Community Poll"}
          </h2>
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Poll Question
            </label>
            <input
              placeholder="e.g., Should we implement a new bike lane on Main St?"
              className="input-field"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              Description
            </label>
            <textarea
              placeholder="Provide more context for the poll..."
              className="input-field min-h-[100px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Location
            </label>
            <input
              placeholder="City, Neighborhood"
              className="input-field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Poll Options</label>
              <button
                type="button"
                onClick={addOption}
                disabled={options.length >= 5}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-30 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Option
              </button>
            </div>
            
            <div className="space-y-3">
              {options.map((opt, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 w-4">
                      {index + 1}
                    </span>
                    <input
                      className="input-field pl-8"
                      placeholder={`Option ${index + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required
                    />
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onBack}
              className="btn-secondary flex-1 py-3"
            >
              Cancel
            </button>
            <button 
              disabled={loading}
              type="submit" 
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {editData ? "Update Poll" : "Launch Poll"}
                  <Plus className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
