"use client";

import { motion } from "framer-motion";
import { playTick } from "@/lib/sound";

type SuccessPageProps = {
  regData: {
    fullName: string;
    mobile: string;
    email: string;
    college: string;
    department: string;
    year: string;
    courseName: string;
    gender: string;
    city: string;
    state: string;
    registrationId: string;
    timestamp?: string;
  };
  onBackHome: () => void;
};

export default function SuccessPage({ regData, onBackHome }: SuccessPageProps) {
  const downloadReceipt = () => {
    playTick();
    const dateStr = regData.timestamp
      ? new Date(regData.timestamp).toLocaleString()
      : new Date().toLocaleString();

    const receiptContent = `==================================================
            CARPEDIEM TECH INNOVATIONS
      Elite Coding & Generative AI Academy
==================================================
REGISTRATION RECEIPT
--------------------------------------------------
Registration ID : ${regData.registrationId}
Timestamp       : ${dateStr}
Candidate Name  : ${regData.fullName}
Email Address   : ${regData.email}
Mobile Number   : ${regData.mobile}
Course Enrolled : ${regData.courseName}
Institution     : ${regData.college}
Department      : ${regData.department}
Year of Study   : ${regData.year}
Location        : ${regData.city}, ${regData.state}
Payment Status  : Pending Review (Fees: to be verified)
Registration    : Pending Approval
--------------------------------------------------
Thank you for choosing Carpediem Tech Innovations.
Our academic advisor will get in touch with you
on your registered mobile number within 24 hours
to verify your credentials and secure your seat.

For queries:
Email : carpediemtechinnovations@gmail.com
Phone : +91 73395 12373
Coimbatore, Tamil Nadu, India
==================================================`;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Carpediem_Receipt_${regData.registrationId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50 py-16 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-teal/10 rounded-2xl shadow-xl p-8 text-center flex flex-col items-center"
      >
        {/* Success Check Badge */}
        <div className="h-16 w-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-3xl mb-6 shadow-inner animate-bounce">
          ✓
        </div>

        <h2 className="font-display text-2xl font-bold text-ink mb-1">Registration Successful</h2>
        <p className="font-mono text-xs text-primary-strong uppercase tracking-wider mb-6">
          Your seat is provisionally reserved
        </p>

        {/* Details Card */}
        <div className="w-full bg-slate-50 border border-teal/5 rounded-xl p-5 text-left mb-8 space-y-3">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-ink-dim font-mono">Enrolled Course</span>
            <span className="text-sm font-bold text-ink leading-tight block">{regData.courseName}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-teal/5">
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-ink-dim font-mono">Registration ID</span>
              <span className="text-xs font-mono font-bold text-primary-strong">{regData.registrationId}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-ink-dim font-mono">Candidate Name</span>
              <span className="text-xs font-bold text-ink block truncate">{regData.fullName}</span>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={downloadReceipt}
            className="w-full rounded-lg bg-primary hover:bg-primary-light text-white font-mono text-xs font-bold uppercase tracking-wider py-3 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            📥 Download Receipt
          </button>
          <button
            onClick={() => {
              playTick();
              onBackHome();
            }}
            className="w-full rounded-lg border border-teal/15 hover:bg-slate-50 text-ink font-mono text-xs font-bold uppercase tracking-wider py-3 transition-all cursor-pointer"
          >
            Back Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
