"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

// Mapped courses dropdown
const COURSES = [
  "Full-Stack Development",
  "Generative AI",
  "Web Development",
  "App Development",
  "AI & ML",
  "Cybersecurity",
  "Cloud Computing",
  "UI/UX Design",
  "IoT",
  "Digital Marketing"
];



export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState(COURSES[0]);
  const [college, setCollege] = useState("");
  const [message, setMessage] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleValidate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = "Name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) tempErrors.email = "Valid email is required";
    if (!phone.trim() || phone.length < 10) tempErrors.phone = "Valid 10-digit phone number is required";
    if (!college.trim()) tempErrors.college = "College/Company name is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) return;

    // Send via WhatsApp if toggle checked
    if (sendWhatsApp) {
      const waText = `Hi Carpediem,\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCourse: ${course}\nCollege/Org: ${college}\nMessage: ${message}`;
      const waUrl = `https://wa.me/917339512373?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");
    }

    // Submit to Express backend & log to MongoDB
    fetch("/api/enquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phone, course, college, message }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Database submit error");
        return res.json();
      })
      .then((data) => {
        console.log("Admissions enquiry saved directly to MongoDB:", data);
        setSuccess(true);
        setTimeout(() => {
          setName("");
          setEmail("");
          setPhone("");
          setCollege("");
          setMessage("");
          setSuccess(false);
        }, 4000);
      })
      .catch((err) => {
        console.error("Failed to log enquiry:", err);
        // Fallback success visual so user experience remains smooth
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 4000);
      });
  };

  return (
    <section id="contact" className="relative px-6 py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionEyebrow>Contact</SectionEyebrow>
          <h2 className="font-display max-w-2xl text-3xl font-bold sm:text-4xl text-ink leading-tight">
            Ready to build something real? Talk to us.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 items-stretch">
          
          {/* Left Column: Direct Info & Google Map placeholder */}
          <Reveal>
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
                  Tell us which engineering cohort track you are looking to commit to — Full-Stack or Generative AI — and our admissions lead will reach out to organize your interview and batch timing.
                </p>

                <div className="mt-8 space-y-4 font-mono text-xs sm:text-sm">
                  <a
                    href="mailto:carpediemtechinnovations@gmail.com"
                    className="flex items-center gap-3 text-ink hover:text-primary transition-colors"
                  >
                    <span className="text-primary font-bold">Email</span>
                    carpediemtechinnovations@gmail.com
                  </a>
                  <a
                    href="tel:+917339512373"
                    className="flex items-center gap-3 text-ink hover:text-primary transition-colors"
                  >
                    <span className="text-primary font-bold">Phone</span>
                    +91 73395 12373
                  </a>
                  <div className="flex items-start gap-3 text-ink-dim">
                    <span className="text-primary font-bold font-mono">Location</span>
                    <div>
                      <p className="text-ink">Coimbatore Hub</p>
                      <p className="mt-0.5 text-xs text-ink-dim leading-tight">Gandhipuram Main Road, Coimbatore, Tamil Nadu, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Address Container */}
              <div className="rounded-2xl border border-teal/10 bg-slate-50/50 p-6 flex flex-col justify-between">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wide text-primary">
                    Visit Our Office
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-ink-dim leading-relaxed">
                    Carpediem Tech Innovations, 3rd Floor, Corporate Square, Cross Cut Road, Gandhipuram, Coimbatore - 641012.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Redesigned Enquiry Form */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-teal/15 bg-white p-6 sm:p-8 shadow-xl shadow-teal/5 flex flex-col h-full justify-center">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center text-center gap-4 py-16"
                  >
                    <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center text-primary-strong animate-bounce">
                      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink">Enquiry Submitted!</h3>
                    <p className="text-xs sm:text-sm text-ink-dim max-w-sm">
                      Thank you, <strong>{name}</strong>. Your enquiry has been locked. Our representative will contact you at <strong>{email}</strong> within 12 hours.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                  >
                    <h3 className="font-display text-lg font-bold text-ink leading-none mb-2">Admissions Enquiry</h3>

                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase tracking-wide text-ink-dim">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`rounded-xl border bg-slate-50/30 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10 ${
                          errors.name ? "border-error focus:ring-error/10" : "border-teal/15 focus:border-primary"
                        }`}
                      />
                      {errors.name && <span className="text-[9px] text-error font-mono">{errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase tracking-wide text-ink-dim">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`rounded-xl border bg-slate-50/30 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10 ${
                          errors.email ? "border-error focus:ring-error/10" : "border-teal/15 focus:border-primary"
                        }`}
                      />
                      {errors.email && <span className="text-[9px] text-error font-mono">{errors.email}</span>}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase tracking-wide text-ink-dim">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`rounded-xl border bg-slate-50/30 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10 ${
                          errors.phone ? "border-error focus:ring-error/10" : "border-teal/15 focus:border-primary"
                        }`}
                      />
                      {errors.phone && <span className="text-[9px] text-error font-mono">{errors.phone}</span>}
                    </div>

                    {/* Course */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase tracking-wide text-ink-dim">Select Program</label>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="rounded-xl border border-teal/15 bg-slate-50/30 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10"
                      >
                        {COURSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* College / Organization */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase tracking-wide text-ink-dim">College / Company Name</label>
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className={`rounded-xl border bg-slate-50/30 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10 ${
                          errors.college ? "border-error focus:ring-error/10" : "border-teal/15 focus:border-primary"
                        }`}
                      />
                      {errors.college && <span className="text-[9px] text-error font-mono">{errors.college}</span>}
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase tracking-wide text-ink-dim">Questions / Notes (Optional)</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        className="resize-none rounded-xl border border-teal/15 bg-slate-50/30 px-4 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>

                    {/* WhatsApp check */}
                    <div className="flex items-center gap-2.5 py-1">
                      <input
                        type="checkbox"
                        id="contact-whatsapp"
                        checked={sendWhatsApp}
                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                        className="h-4 w-4 rounded border-teal/20 text-primary focus:ring-primary/10 accent-primary"
                      />
                      <label htmlFor="contact-whatsapp" className="text-xs text-ink-dim select-none cursor-pointer font-medium">
                        Open submission in WhatsApp
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-primary-light hover:shadow-lg active:scale-[0.98]"
                    >
                      Submit Admissions Request
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
