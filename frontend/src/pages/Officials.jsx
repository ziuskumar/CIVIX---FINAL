import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Search,
  MessageCircle,
  AlertCircle,
  TrendingUp,
  Award
} from "lucide-react";

export default function Officials() {
  const [officials, setOfficials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOfficials = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/officials", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOfficials(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOfficials();
  }, [token]);

  const filteredOfficials = officials.filter(off => 
    off.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    off.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Stats Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-secondary-500" />
            Verified Officials
          </h1>
          <p className="text-slate-500 font-medium mt-1">Directly connect with representatives serving your community.</p>
          
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{officials.length} Active Officials</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">100% Verified</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 w-full md:w-80">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
            <input
              className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500 shadow-inner"
              placeholder="Search by name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Decorative elements */}
        <Users className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-50 opacity-50" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredOfficials.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-20 text-center"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">No officials found</h3>
          <p className="text-slate-500 font-medium">Try broadening your search criteria.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredOfficials.map((off, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                transition={{ delay: i * 0.05 }}
                key={off._id}
                className="card group hover:border-secondary-200 transition-all flex flex-col shadow-sm hover:shadow-xl hover:shadow-secondary-500/5 overflow-visible"
              >
                <div className="p-8 flex-1 relative">
                  {/* Badge */}
                  <div className="absolute -top-3 -right-3">
                    <motion.div 
                      whileHover={{ rotate: 15 }}
                      className="bg-primary-500 text-white p-2.5 rounded-2xl shadow-lg shadow-primary-500/30"
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-3xl bg-secondary-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-secondary-600/20 overflow-hidden group-hover:scale-105 transition-transform duration-500 italic">
                        {off.profilePhoto ? (
                          <img src={`http://localhost:5000/uploads/${off.profilePhoto}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          off.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-secondary-700 transition-colors leading-tight">{off.name}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1 bg-primary-50 px-2 py-1 rounded-lg w-fit">
                        <Award className="w-3 h-3" />
                        Verified Official
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="truncate font-bold tracking-tight">{off.email}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-bold tracking-tight">{off.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="font-bold tracking-tight">Joined {new Date(off.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 mt-auto rounded-b-3xl">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-secondary flex items-center justify-center gap-3 py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-secondary-600/10"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Connect Directly
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
