import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
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
              Empowering Civic{" "}
              <span className="text-primary-400">Engagement</span>
            </h1>
            <p className="text-secondary-100 text-lg mb-12 font-medium opacity-80 leading-relaxed">
              Join our platform to connect with local officials and make your
              voice heard in your community.
            </p>

            <div className="space-y-5">
              {[
                "Create and sign public petitions",
                "Participate in community polls",
                "Directly engage with local officials",
                "Track progress on civic issues",
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

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full md:w-1/2 p-10 md:p-16 bg-white"
        >
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 font-medium">
              Please enter your details to sign in
            </p>
          </div>

          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10 border border-slate-200">
            <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-secondary-700 bg-white rounded-xl shadow-md transition-all">
              Login
            </button>
            <Link
              to="/register"
              className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 text-center transition-colors"
            >
              Register
            </Link>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  size="sm"
                  className="text-[10px] text-secondary-600 hover:text-secondary-700 font-black uppercase tracking-widest"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-secondary-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-secondary-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="btn-secondary w-full flex items-center justify-center gap-3 py-4 shadow-xl shadow-secondary-600/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-black uppercase tracking-[0.2em]">
                    Sign In
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-12 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-600 font-black hover:text-primary-700 transition-colors"
            >
              Create one for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
