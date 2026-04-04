import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Building2,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("citizen");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    governmentId: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[@$!%*?&]/.test(form.password),
  };

  const isStrongPassword = () => {
    return Object.values(passwordChecks).every(Boolean);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isStrongPassword()) {
      alert("Please create a stronger password meeting all requirements.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("https://civix-backend-e7m5.onrender.com/api/auth/register", {
        ...form,
        role,
        governmentId: role === "official" ? form.governmentId : null,
      });

      alert("Registered successfully ✅");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Error registering");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100">
        {/* LEFT PANEL */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full md:w-1/2 bg-secondary-900 p-10 md:p-16 text-white flex flex-col justify-between relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary-500/20 italic">
                C
              </div>
              <span className="text-3xl font-black tracking-tighter">
                Civix
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Join the <span className="text-primary-400">Movement</span>
            </h1>
            <p className="text-secondary-100 text-lg mb-12 font-medium opacity-80 leading-relaxed">
              Create an account to start impacting your community today.
            </p>

            <div className="space-y-5">
              {[
                "Start public petitions for change",
                "Participate in local civic polls",
                "Connect with verified officials",
                "Receive updates on community issues",
              ].map((feature, i) => (
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  key={i}
                  className="flex items-center gap-4 text-secondary-50"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="text-sm font-bold tracking-wide">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-secondary-800 relative z-10">
            <p className="text-secondary-300 text-sm italic font-medium opacity-80 leading-relaxed">
              "Civix has transformed how we interact with our local government.
              It's never been easier to be heard."
            </p>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full md:w-1/2 p-10 md:p-16 bg-white overflow-y-auto max-h-[90vh]"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-500 font-medium">
              Join thousands of citizens making a difference
            </p>
          </div>

          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10 border border-slate-200">
            <Link
              to="/"
              className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 text-center transition-colors"
            >
              Login
            </Link>
            <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-secondary-700 bg-white rounded-xl shadow-md transition-all">
              Register
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="input-field pl-12 pr-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 px-1">
                {Object.entries({
                  "8+ chars": passwordChecks.length,
                  Uppercase: passwordChecks.uppercase,
                  Lowercase: passwordChecks.lowercase,
                  Number: passwordChecks.number,
                  Special: passwordChecks.special,
                }).map(([label, met]) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full shadow-sm transition-colors ${met ? "bg-primary-500" : "bg-slate-200"}`}
                    />
                    <span
                      className={`text-[10px] uppercase tracking-widest font-black ${met ? "text-primary-700" : "text-slate-400"}`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">
                Location
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
                <input
                  type="text"
                  name="location"
                  placeholder="City, State"
                  className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("citizen")}
                  className={`flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                    role === "citizen"
                      ? "bg-primary-50 border-primary-500 text-primary-700 shadow-lg shadow-primary-500/10"
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole("official")}
                  className={`flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                    role === "official"
                      ? "bg-secondary-50 border-secondary-500 text-secondary-700 shadow-lg shadow-secondary-500/10"
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  Official
                </button>
              </div>
            </div>

            {role === "official" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">
                  Government ID
                </label>
                <input
                  type="text"
                  name="governmentId"
                  placeholder="Official ID Number"
                  className="input-field py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500"
                  onChange={handleChange}
                  required
                />
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-3 py-4 mt-6 shadow-xl shadow-primary-600/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-black uppercase tracking-[0.2em]">
                    Create Account
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-secondary-600 font-black hover:text-secondary-700 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
