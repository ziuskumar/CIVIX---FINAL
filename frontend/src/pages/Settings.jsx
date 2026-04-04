import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Lock, 
  Bell, 
  Camera, 
  Trash2, 
  Save, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Smartphone,
  CheckCircle2,
  X
} from "lucide-react";

export default function Settings() {
  const rawToken = localStorage.getItem("token");
  if (!rawToken) {
    window.location.href = "/";
  }
  const token = `Bearer ${rawToken}`;

  const [profile, setProfile] = useState({});
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    fetch("https://civix-backend-e7m5.onrender.com/api/settings/profile", {
      headers: { Authorization: token }
    })
    .then(res => res.json())
    .then(data => {
      setProfile(data);
      localStorage.setItem("user", JSON.stringify(data));
      setIsLoading(false);
    })
    .catch(() => {
      alert("Failed to load profile");
      setIsLoading(false);
    });
  }, []);

  const updateProfile = async () => {
    try {
      const res = await fetch("https://civix-backend-e7m5.onrender.com/api/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        localStorage.setItem("user", JSON.stringify(data));
        alert("Profile updated successfully");
      } else {
        alert("Profile update failed");
      }
    } catch (err) {
      alert("Error updating profile");
    }
  };

  const changePassword = async () => {
    if (!password.currentPassword || !password.newPassword) {
      alert("Please fill in both password fields");
      return;
    }
    try {
      const res = await fetch("https://civix-backend-e7m5.onrender.com/api/settings/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify(password)
      });

      if (res.ok) {
        alert("Password updated successfully");
        setPassword({ currentPassword: "", newPassword: "" });
      } else {
        alert("Password update failed");
      }
    } catch (err) {
      alert("Error changing password");
    }
  };

  const toggleNotifications = async () => {
    const updated = !profile.notifications;
    try {
      const res = await fetch("https://civix-backend-e7m5.onrender.com/api/settings/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ notifications: updated })
      });

      if (res.ok) {
        const updatedProfile = { ...profile, notifications: updated };
        setProfile(updatedProfile);
        localStorage.setItem("user", JSON.stringify(updatedProfile));
      }
    } catch (err) {
      alert("Error toggling notifications");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    const form = new FormData();
    form.append("photo", photo);

    try {
      const res = await fetch("https://civix-backend-e7m5.onrender.com/api/settings/photo", {
        method: "POST",
        headers: { Authorization: token },
        body: form
      });
      const data = await res.json();
      if (res.ok) {
        const updatedProfile = { ...profile, profilePhoto: data.photo };
        setProfile(updatedProfile);
        localStorage.setItem("user", JSON.stringify(updatedProfile));
        setPreview(null);
        setPhoto(null);
        alert("Photo uploaded successfully");
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Error uploading photo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500">Manage your profile information and account security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 space-y-1">
          {[
            { id: "profile", label: "Profile Info", icon: User },
            { id: "security", label: "Security", icon: ShieldCheck },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Settings Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Profile Photo Section */}
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Profile Picture</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border-2 border-dashed border-slate-200">
                        {preview ? (
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : profile.profilePhoto ? (
                          <img src={`https://civix-backend-e7m5.onrender.com/uploads/${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10" />
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 p-2 bg-primary-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-primary-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                      </label>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Upload a new photo</p>
                      <p className="text-xs text-slate-500">JPG, PNG or GIF. Max size 2MB.</p>
                      {preview && (
                        <div className="flex gap-2">
                          <button onClick={uploadPhoto} className="btn-primary py-1.5 px-3 text-xs">Save Photo</button>
                          <button onClick={() => {setPreview(null); setPhoto(null);}} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Info Form */}
                <div className="card p-6 space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          className="input-field pl-10"
                          value={profile.name || ""}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          className="input-field pl-10 bg-slate-50 cursor-not-allowed"
                          value={profile.email || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          className="input-field pl-10"
                          value={profile.location || ""}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Account Type</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          className="input-field pl-10 bg-slate-50 cursor-not-allowed capitalize"
                          value={profile.role || ""}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button onClick={updateProfile} className="btn-primary flex items-center gap-2 px-8">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="card p-6 space-y-6"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">Security Settings</h3>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        className="input-field pl-10"
                        placeholder="••••••••"
                        value={password.currentPassword}
                        onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        className="input-field pl-10"
                        placeholder="••••••••"
                        value={password.newPassword}
                        onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <button onClick={changePassword} className="btn-primary w-full py-3">Update Password</button>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-500 mb-4">Add an extra layer of security to your account.</p>
                  <button className="btn-secondary text-sm">Enable 2FA</button>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="card p-6"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex gap-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <Bell className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Email Notifications</p>
                        <p className="text-xs text-slate-500">Receive updates about your petitions and polls.</p>
                      </div>
                    </div>
                    <button 
                      onClick={toggleNotifications}
                      className={`relative w-12 h-6 rounded-full transition-colors ${profile.notifications ? 'bg-primary-600' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: profile.notifications ? 26 : 2 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-50 grayscale">
                    <div className="flex gap-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <Smartphone className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Push Notifications</p>
                        <p className="text-xs text-slate-500">Coming soon to mobile devices.</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-slate-200"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
