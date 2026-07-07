"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { playTick } from "@/lib/sound";

type CourseOption = {
  id: string;
  title: string;
};

const COURSES_LIST: CourseOption[] = [
  { id: "c-fullstack", title: "Flagship Full-Stack Development" },
  { id: "c-genai", title: "Flagship Generative AI & Agents" },
  { id: "c-webdev", title: "Modern Web Development" },
  { id: "c-appdev", title: "Advanced Mobile App Development" },
  { id: "c-aiml", title: "Machine Learning & Python" },
  { id: "c-cyber", title: "Cybersecurity & Pentesting" },
  { id: "c-cloud", title: "Cloud Solutions Architect (AWS)" },
  { id: "c-iot", title: "Internet of Things (IoT) Systems" },
  { id: "c-uiux", title: "UI/UX Product Design" },
  { id: "c-marketing", title: "Digital Marketing Strategy" },
  { id: "c-dsa", title: "Data Structures & Algorithms" },
  { id: "c-devops", title: "DevOps & CI/CD Orchestration" },
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Pass-out"];
const GENDERS = ["Male", "Female", "Other"];

type EnrollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseId?: string;
  onSuccess: (regData: any) => void;
  backendUrl: string; // Google Apps Script URL
};

export default function EnrollModal({
  isOpen,
  onClose,
  selectedCourseId = "",
  onSuccess,
  backendUrl,
}: EnrollModalProps) {
  const defaultCourse = COURSES_LIST.find((c) => c.id === selectedCourseId)?.title || COURSES_LIST[0].title;

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    college: "",
    department: "",
    year: YEARS[0],
    courseName: defaultCourse,
    gender: GENDERS[0],
    city: "",
    state: "",
    resumeLink: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.college.trim()) newErrors.college = "College name is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    if (formData.resumeLink.trim()) {
      try {
        new URL(formData.resumeLink);
      } catch (_) {
        newErrors.resumeLink = "Enter a valid URL (e.g. Google Drive/Dropbox)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playTick();
    setSubmitError("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      // Post registration data to Google Apps Script Endpoint
      const response = await fetch(backendUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8", // text/plain handles CORS preflight in Apps Script
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess({
          ...formData,
          registrationId: result.registrationId,
          timestamp: result.timestamp,
        });
      } else {
        setSubmitError(result.error || "Submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to connect to registration server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-teal/10 my-8"
      >
        {/* Header banner */}
        <div className="bg-gradient-to-r from-primary to-primary-strong p-6 text-white relative">
          <button
            type="button"
            onClick={() => {
              playTick();
              onClose();
            }}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
          <h2 className="font-display text-xl font-bold uppercase tracking-wider">Course Enrollment</h2>
          <p className="text-white/80 text-xs mt-1 font-mono">Fill out details below to secure your seat</p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 max-h-[75vh] overflow-y-auto space-y-6">
          
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              ⚠️ {submitError}
            </div>
          )}

          {/* Section 1: Candidate Bio */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-primary-strong border-b border-teal/5 pb-1.5 mb-4">
              // 01. Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Adithya Raj"
                  className={`w-full text-sm border rounded-lg px-3.5 py-2 outline-none transition-all ${
                    errors.fullName ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-teal/15 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className={`w-full text-sm border rounded-lg px-3.5 py-2 outline-none transition-all ${
                    errors.mobile ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-teal/15 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {errors.mobile && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.mobile}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. adithya@example.com"
                  className={`w-full text-sm border rounded-lg px-3.5 py-2 outline-none transition-all ${
                    errors.email ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-teal/15 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Academic Details */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-primary-strong border-b border-teal/5 pb-1.5 mb-4">
              // 02. Academic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">College/University *</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. PSG College of Technology"
                  className={`w-full text-sm border rounded-lg px-3.5 py-2 outline-none transition-all ${
                    errors.college ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-teal/15 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {errors.college && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.college}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">Department / Branch *</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science Engineering"
                  className={`w-full text-sm border rounded-lg px-3.5 py-2 outline-none transition-all ${
                    errors.department ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-teal/15 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {errors.department && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">Year of Study *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full text-sm border border-teal/15 rounded-lg px-3 py-2 outline-none bg-white focus:border-primary"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Course selection & Demo preferences */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-primary-strong border-b border-teal/5 pb-1.5 mb-4">
              // 03. Course Selection & Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">Course Selected *</label>
                <select
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  className="w-full text-sm border border-teal/15 rounded-lg px-3 py-2 outline-none bg-white focus:border-primary"
                >
                  {COURSES_LIST.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full text-sm border border-teal/15 rounded-lg px-3 py-2 outline-none bg-white focus:border-primary"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Coimbatore"
                  className={`w-full text-sm border rounded-lg px-3.5 py-2 outline-none transition-all ${
                    errors.city ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-teal/15 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {errors.city && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Tamil Nadu"
                  className={`w-full text-sm border rounded-lg px-3.5 py-2 outline-none transition-all ${
                    errors.state ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-teal/15 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {errors.state && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-dim uppercase font-mono mb-1">Resume Link (Drive/Dropbox)</label>
                <input
                  type="url"
                  name="resumeLink"
                  value={formData.resumeLink}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className={`w-full text-sm border rounded-lg px-3.5 py-2 outline-none transition-all ${
                    errors.resumeLink ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-teal/15 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  }`}
                />
                {errors.resumeLink && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.resumeLink}</p>}
              </div>
            </div>
          </div>

          {/* Form Submit Footer */}
          <div className="pt-4 flex gap-4 border-t border-teal/5">
            <button
              type="button"
              onClick={() => {
                playTick();
                onClose();
              }}
              className="flex-1 rounded-lg border border-teal/15 py-3 text-xs font-bold uppercase tracking-wider text-ink hover:bg-slate-50 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] rounded-lg bg-primary hover:bg-primary-light text-white py-3 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Registration"
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
