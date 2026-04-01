import { motion } from "framer-motion";
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  Mail, 
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function HelpSupport() {
  const [activeFaq, setActiveFaq] = useState(null);

  const handleEmailClick = () => {
    window.location.href =
      "mailto:civix.noreply1@gmail.com?subject=Civix Support Request&body=Hello Civix Team,%0D%0A%0D%0AI need help regarding:";
  };

  const faqs = [
    {
      q: "How do I create a petition?",
      a: "Go to the Dashboard and click the 'New Petition' button. Fill in the title, description, category, and location to get started."
    },
    {
      q: "How do I support a petition?",
      a: "Browse the Petitions section, click on a petition that interests you, and then click the 'Sign Petition' button."
    },
    {
      q: "Can I edit my petition?",
      a: "Yes, you can edit your petition as long as it is still in the 'Active' status."
    },
    {
      q: "Who can close a petition?",
      a: "Petitions are closed by verified government officials after they have been reviewed and addressed."
    },
    {
      q: "Can I delete my petition?",
      a: "Creators can delete their own petitions at any time. Officials also have the authority to remove content that violates guidelines."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-block p-3 bg-primary-100 rounded-2xl text-primary-600 mb-2">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Help & Support Center</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Everything you need to know about using Civix to make a difference in your community.
        </p>
      </div>

      {/* Quick Stats/Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Guides", icon: BookOpen, desc: "Platform walkthroughs", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Guidelines", icon: ShieldCheck, desc: "Community rules", color: "text-green-600", bg: "bg-green-50" },
          { label: "Support", icon: MessageSquare, desc: "Get direct help", color: "text-purple-600", bg: "bg-purple-50" },
        ].map((item, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={item.label}
            className="card p-6 flex flex-col items-center text-center group cursor-pointer hover:border-primary-200 transition-all"
          >
            <div className={`p-3 rounded-xl ${item.bg} ${item.color} mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">{item.label}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Platform Overview */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary-600" />
            Platform Overview
          </h2>
          <div className="space-y-4">
            {[
              "Citizens create petitions for civic issues",
              "Supporters sign petitions to show demand",
              "Reached goals move to 'Under Review'",
              "Verified officials review and respond",
              "Impact is tracked via monthly reports"
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="card p-6 bg-slate-50 border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Community Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">• Post genuine civic issues only</li>
              <li className="flex items-center gap-2">• Avoid duplicate submissions</li>
              <li className="flex items-center gap-2">• Maintain respectful communication</li>
              <li className="flex items-center gap-2">• Verified IDs for all officials</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            Common Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-700">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: activeFaq === i ? 'auto' : 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-sm text-slate-500 border-t border-slate-50 leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Support CTA */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="card p-8 bg-primary-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold">Still need help?</h2>
          <p className="text-primary-100">Our support team is ready to assist you with any platform issues.</p>
        </div>
        <button
          onClick={handleEmailClick}
          className="relative z-10 btn-primary bg-white text-primary-900 hover:bg-primary-50 px-8 py-3 flex items-center gap-2 shadow-xl"
        >
          <Mail className="w-5 h-5" />
          Email Support
        </button>
        <AlertCircle className="absolute -left-8 -bottom-8 w-48 h-48 text-primary-800 opacity-30" />
      </motion.div>
    </div>
  );
}
