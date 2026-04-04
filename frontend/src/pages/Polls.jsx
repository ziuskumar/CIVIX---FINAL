import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { 
  Plus, 
  BarChart3, 
  Clock, 
  User, 
  CheckCircle2, 
  MapPin, 
  Trash2, 
  Lock, 
  AlertCircle,
  TrendingUp,
  Filter
} from "lucide-react";
import CreatePoll from "./CreatePoll";

const socket = io("https://civix-backend-e7m5.onrender.com");

const Polls = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user._id || user.id;

  const [polls, setPolls] = useState([]);
  const [type, setType] = useState("active");
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
    socket.on("pollUpdated", fetchPolls);
    return () => socket.off("pollUpdated");
  }, []);

  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("https://civix-backend-e7m5.onrender.com/api/polls", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolls(res.data);
    } catch (err) {
      console.log("Fetch Poll Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const vote = async (id, index) => {
    try {
      await axios.put(
        `https://civix-backend-e7m5.onrender.com/api/polls/vote/${id}`,
        { optionIndex: index },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to vote");
    }
  };

  const deletePoll = async (id) => {
    if (!window.confirm("Delete this poll?")) return;
    try {
      await axios.delete(`https://civix-backend-e7m5.onrender.com/api/polls/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPolls();
    } catch (err) {
      console.log("Delete Error:", err);
    }
  };

  const closePoll = async (id) => {
    if (!window.confirm("Close this poll?")) return;
    try {
      await axios.put(`https://civix-backend-e7m5.onrender.com/api/polls/close/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPolls();
    } catch (err) {
      console.log("Close Error:", err);
    }
  };

  if (showCreate) {
    return (
      <CreatePoll
        onBack={() => {
          setShowCreate(false);
          fetchPolls();
        }}
      />
    );
  }

  const filtered = polls.filter((p) => {
    if (type === "active") return p.status === "open";
    if (type === "closed") return p.status === "closed";
    if (type === "my") return p.createdBy === userId || p.createdBy?._id === userId;
    if (type === "voted") return p.voters?.includes(userId);
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-secondary-500" />
            Community Polls
          </h1>
          <p className="text-slate-500 text-sm font-medium">Voice your opinion on local decisions.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 px-6 py-3"
        >
          <Plus className="w-4 h-4" />
          <span className="font-black uppercase tracking-widest text-xs">Create Poll</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner">
        {["active", "closed", "my", "voted"].map((tab) => (
          <button
            key={tab}
            onClick={() => setType(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all capitalize tracking-widest ${
              type === tab 
              ? "bg-white text-secondary-600 shadow-md" 
              : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Poll Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full card p-20 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">No polls found</h3>
            <p className="text-slate-500 font-medium">Be the first to start a conversation in this category!</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((poll, index) => {
              const hasVoted = poll.voters?.includes(userId);
              const isCreator = poll.createdBy === userId || poll.createdBy?._id === userId;
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05 }}
                  key={poll._id}
                  className="card group hover:border-primary-200 transition-all shadow-sm flex flex-col h-full"
                >
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            poll.status === 'open' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {poll.status}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-slate-100 shadow-sm">
                            <MapPin className="w-3 h-3" /> {poll.location}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary-700 transition-colors">{poll.question}</h3>
                      </div>
                      <div className="flex gap-1">
                        {isCreator && poll.status === 'open' && (
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => closePoll(poll._id)} 
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            title="Close Poll"
                          >
                            <Lock className="w-4 h-4" />
                          </motion.button>
                        )}
                        {isCreator && (
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deletePoll(poll._id)} 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Poll"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-8 line-clamp-2 font-medium leading-relaxed opacity-80">{poll.description}</p>

                    <div className="flex-1 space-y-4 mb-8">
                      {poll.options.map((opt, i) => {
                        const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        return (
                          <div key={i} className="relative group/opt">
                            <motion.button
                              whileHover={!hasVoted && poll.status === 'open' ? { scale: 1.01, x: 2 } : {}}
                              whileTap={!hasVoted && poll.status === 'open' ? { scale: 0.99 } : {}}
                              onClick={() => vote(poll._id, i)}
                              disabled={hasVoted || poll.status === 'closed'}
                              className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative z-10 overflow-hidden ${
                                hasVoted 
                                ? 'bg-slate-50 border-transparent cursor-default' 
                                : 'bg-white border-slate-100 hover:border-primary-200 hover:bg-primary-50'
                              }`}
                            >
                              <div className="flex justify-between items-center relative z-10">
                                <span className={`text-sm font-black uppercase tracking-tight ${hasVoted ? 'text-slate-800' : 'text-slate-600'}`}>
                                  {opt.text}
                                </span>
                                {hasVoted && (
                                  <motion.span 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm font-black text-primary-600 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-primary-100"
                                  >
                                    {percentage}%
                                  </motion.span>
                                )}
                              </div>
                              {hasVoted && (
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="absolute inset-y-0 left-0 bg-primary-100/60 z-0"
                                />
                              )}
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">
                          <CheckCircle2 className="w-4 h-4 text-primary-500" />
                          {totalVotes} Total Votes
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">
                          <TrendingUp className="w-4 h-4 text-secondary-500" />
                          Active Engagement
                        </div>
                      </div>
                      {hasVoted && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[10px] font-black text-primary-700 uppercase tracking-[0.2em] bg-primary-100 px-3 py-1.5 rounded-xl shadow-sm"
                        >
                          Voted
                        </motion.span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Polls;
