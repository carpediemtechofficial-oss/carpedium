import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];

type StudentFormProps = {
  initialData?: StudentRow;
  onSuccess: () => void;
  onCancel: () => void;
};

const input =
  "w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 outline-none";
const label = "text-sm font-medium text-slate-700";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      <h3 className="font-bold font-display text-slate-900 border-b border-slate-100 pb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function StudentForm({ initialData, onSuccess, onCancel }: StudentFormProps) {
  const [f, setF] = useState<Record<string, any>>({
    full_name: initialData?.full_name ?? "",
    profile_photo: initialData?.profile_photo ?? "",
    gender: initialData?.gender ?? "",
    date_of_birth: initialData?.date_of_birth ?? "",
    email: initialData?.email ?? "",
    mobile: initialData?.mobile ?? "",
    alternate_number: initialData?.alternate_number ?? "",
    address: initialData?.address ?? "",
    city: initialData?.city ?? "",
    state: initialData?.state ?? "",
    country: initialData?.country ?? "India",
    course_id: initialData?.course_id ?? "",
    course_name: initialData?.course_name ?? "",
    batch: initialData?.batch ?? "",
    enrollment_date: initialData?.enrollment_date ?? "",
    expected_completion_date: initialData?.expected_completion_date ?? "",
    mentor_id: initialData?.mentor_id ?? "",
    mentor_name: initialData?.mentor_name ?? "",
    learning_mode: initialData?.learning_mode ?? "Online",
    attendance_percentage: initialData?.attendance_percentage ?? 0,
    total_classes: initialData?.total_classes ?? 0,
    classes_attended: initialData?.classes_attended ?? 0,
    project_title: initialData?.project_title ?? "",
    github_link: initialData?.github_link ?? "",
    drive_link: initialData?.drive_link ?? "",
    live_demo_link: initialData?.live_demo_link ?? "",
    project_status: initialData?.project_status ?? "Not Started",
    mentor_feedback: initialData?.mentor_feedback ?? "",
    certificate_issued: initialData?.certificate_issued ?? false,
    certificate_number: initialData?.certificate_number ?? "",
    certificate_verification_url: initialData?.certificate_verification_url ?? "",
    certificate_issue_date: initialData?.certificate_issue_date ?? "",
    resume_link: initialData?.resume_link ?? "",
    linkedin: initialData?.linkedin ?? "",
    portfolio: initialData?.portfolio ?? "",
    current_company: initialData?.current_company ?? "",
    job_role: initialData?.job_role ?? "",
    salary_package: initialData?.salary_package ?? "",
    placement_status: initialData?.placement_status ?? "Not Placed",
    doc_resume: initialData?.doc_resume ?? "",
    doc_id_proof: initialData?.doc_id_proof ?? "",
    doc_offer_letter: initialData?.doc_offer_letter ?? "",
    doc_internship_certificate: initialData?.doc_internship_certificate ?? "",
    doc_course_certificate: initialData?.doc_course_certificate ?? "",
    fees_total: initialData?.fees_total ?? 0,
    fees_paid: initialData?.fees_paid ?? 0,
    pending_fees: initialData?.pending_fees ?? 0,
    invoice_number: initialData?.invoice_number ?? "",
    lead_status: initialData?.lead_status ?? "Enrolled",
    counsellor_notes: initialData?.counsellor_notes ?? "",
    admin_notes: initialData?.admin_notes ?? "",
    mentor_notes: initialData?.mentor_notes ?? "",
    status: initialData?.status ?? "active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  const { data: courses } = useQuery({
    queryKey: ["form-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id, title").order("title");
      return data ?? [];
    },
  });
  const { data: mentors } = useQuery({
    queryKey: ["form-mentors"],
    queryFn: async () => {
      const { data } = await supabase.from("mentors").select("id, name").order("name");
      return data ?? [];
    },
  });

  const onCourse = (id: string) => {
    const c = courses?.find((x) => x.id === id);
    setF((p) => ({ ...p, course_id: id || null, course_name: c?.title ?? p.course_name }));
  };
  const onMentor = (id: string) => {
    const m = mentors?.find((x) => x.id === id);
    setF((p) => ({ ...p, mentor_id: id || null, mentor_name: m?.name ?? p.mentor_name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.full_name.trim()) {
      setError("Full name is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // normalise numeric + empty date/uuid fields
      const payload: Record<string, any> = {
        ...f,
        attendance_percentage: Number(f.attendance_percentage) || 0,
        total_classes: Number(f.total_classes) || 0,
        classes_attended: Number(f.classes_attended) || 0,
        fees_total: Number(f.fees_total) || 0,
        fees_paid: Number(f.fees_paid) || 0,
        pending_fees: Number(f.pending_fees) || 0,
        course_id: f.course_id || null,
        mentor_id: f.mentor_id || null,
        updated_at: new Date().toISOString(),
      };
      for (const key of [
        "date_of_birth", "enrollment_date", "expected_completion_date", "certificate_issue_date",
      ]) {
        if (!payload[key]) payload[key] = null;
      }

      if (initialData?.id) {
        const { error } = await supabase.from("students").update(payload).eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("students").insert(payload);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save student.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const G2 = "grid grid-cols-1 sm:grid-cols-2 gap-4";
  const G3 = "grid grid-cols-1 sm:grid-cols-3 gap-4";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold font-display text-slate-900">
          {initialData ? "Edit Student" : "Add Student"}
        </h3>
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-900 font-medium">
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Personal Information">
          <ImageUploadField label="Profile Photo" value={f.profile_photo} onChange={(u) => set("profile_photo", u)} />
          <div className={G2}>
            <div className="space-y-1"><label className={label}>Full Name *</label><input className={input} value={f.full_name} onChange={(e) => set("full_name", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Gender</label>
              <select className={`${input} bg-white`} value={f.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="space-y-1"><label className={label}>Date of Birth</label><input type="date" className={input} value={f.date_of_birth || ""} onChange={(e) => set("date_of_birth", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Email</label><input type="email" className={input} value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Mobile Number</label><input className={input} value={f.mobile} onChange={(e) => set("mobile", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Alternate Number</label><input className={input} value={f.alternate_number} onChange={(e) => set("alternate_number", e.target.value)} /></div>
          </div>
          <div className="space-y-1"><label className={label}>Address</label><textarea className={input} rows={2} value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className={G3}>
            <div className="space-y-1"><label className={label}>City</label><input className={input} value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>State</label><input className={input} value={f.state} onChange={(e) => set("state", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Country</label><input className={input} value={f.country} onChange={(e) => set("country", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="Course Information">
          <div className={G2}>
            <div className="space-y-1"><label className={label}>Course Name</label>
              <select className={`${input} bg-white`} value={f.course_id || ""} onChange={(e) => onCourse(e.target.value)}>
                <option value="">Select a course</option>
                {courses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-1"><label className={label}>Course ID</label><input className={`${input} bg-slate-50`} value={f.course_id || ""} readOnly placeholder="Auto from course" /></div>
            <div className="space-y-1"><label className={label}>Batch / Cohort</label><input className={input} value={f.batch} onChange={(e) => set("batch", e.target.value)} placeholder="e.g. FS-2026-Jan" /></div>
            <div className="space-y-1"><label className={label}>Mentor Assigned</label>
              <select className={`${input} bg-white`} value={f.mentor_id || ""} onChange={(e) => onMentor(e.target.value)}>
                <option value="">Select a mentor</option>
                {mentors?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1"><label className={label}>Enrollment Date</label><input type="date" className={input} value={f.enrollment_date || ""} onChange={(e) => set("enrollment_date", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Expected Completion Date</label><input type="date" className={input} value={f.expected_completion_date || ""} onChange={(e) => set("expected_completion_date", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Learning Mode</label>
              <select className={`${input} bg-white`} value={f.learning_mode} onChange={(e) => set("learning_mode", e.target.value)}>
                <option>Online</option><option>Offline</option><option>Hybrid</option>
              </select>
            </div>
            <div className="space-y-1"><label className={label}>Status</label>
              <select className={`${input} bg-white`} value={f.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Active</option><option value="completed">Completed</option><option value="dropped">Dropped</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Attendance">
          <div className={G3}>
            <div className="space-y-1"><label className={label}>Attendance %</label><input type="number" min="0" max="100" step="0.1" className={input} value={f.attendance_percentage} onChange={(e) => set("attendance_percentage", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Total Classes</label><input type="number" min="0" className={input} value={f.total_classes} onChange={(e) => set("total_classes", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Classes Attended</label><input type="number" min="0" className={input} value={f.classes_attended} onChange={(e) => set("classes_attended", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="Project">
          <div className={G2}>
            <div className="space-y-1"><label className={label}>Project Title</label><input className={input} value={f.project_title} onChange={(e) => set("project_title", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Project Status</label>
              <select className={`${input} bg-white`} value={f.project_status} onChange={(e) => set("project_status", e.target.value)}>
                <option>Not Started</option><option>In Progress</option><option>Completed</option>
              </select>
            </div>
            <div className="space-y-1"><label className={label}>GitHub Repository</label><input className={input} value={f.github_link} onChange={(e) => set("github_link", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Google Drive Link</label><input className={input} value={f.drive_link} onChange={(e) => set("drive_link", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Live Demo Link</label><input className={input} value={f.live_demo_link} onChange={(e) => set("live_demo_link", e.target.value)} /></div>
          </div>
          <div className="space-y-1"><label className={label}>Mentor Feedback</label><textarea className={input} rows={2} value={f.mentor_feedback} onChange={(e) => set("mentor_feedback", e.target.value)} /></div>
        </Section>

        <Section title="Certification">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked={f.certificate_issued} onChange={(e) => set("certificate_issued", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            Certificate Issued
          </label>
          <div className={G3}>
            <div className="space-y-1"><label className={label}>Certificate Number</label><input className={input} value={f.certificate_number} onChange={(e) => set("certificate_number", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Verification URL</label><input className={input} value={f.certificate_verification_url} onChange={(e) => set("certificate_verification_url", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Issue Date</label><input type="date" className={input} value={f.certificate_issue_date || ""} onChange={(e) => set("certificate_issue_date", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="Placement">
          <div className={G2}>
            <div className="space-y-1"><label className={label}>Placement Status</label>
              <select className={`${input} bg-white`} value={f.placement_status} onChange={(e) => set("placement_status", e.target.value)}>
                <option>Not Placed</option><option>In Process</option><option>Placed</option>
              </select>
            </div>
            <div className="space-y-1"><label className={label}>Current Company</label><input className={input} value={f.current_company} onChange={(e) => set("current_company", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Job Role</label><input className={input} value={f.job_role} onChange={(e) => set("job_role", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Salary Package</label><input className={input} value={f.salary_package} onChange={(e) => set("salary_package", e.target.value)} placeholder="e.g. ₹6 LPA" /></div>
            <div className="space-y-1"><label className={label}>Resume Link</label><input className={input} value={f.resume_link} onChange={(e) => set("resume_link", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>LinkedIn</label><input className={input} value={f.linkedin} onChange={(e) => set("linkedin", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Portfolio Website</label><input className={input} value={f.portfolio} onChange={(e) => set("portfolio", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="Documents">
          <div className={G2}>
            <ImageUploadField label="Resume" value={f.doc_resume} onChange={(u) => set("doc_resume", u)} accept="image/*,application/pdf" />
            <ImageUploadField label="Aadhaar / PAN (optional)" value={f.doc_id_proof} onChange={(u) => set("doc_id_proof", u)} accept="image/*,application/pdf" />
            <ImageUploadField label="Offer Letter" value={f.doc_offer_letter} onChange={(u) => set("doc_offer_letter", u)} accept="image/*,application/pdf" />
            <ImageUploadField label="Internship Certificate" value={f.doc_internship_certificate} onChange={(u) => set("doc_internship_certificate", u)} accept="image/*,application/pdf" />
            <ImageUploadField label="Course Certificate" value={f.doc_course_certificate} onChange={(u) => set("doc_course_certificate", u)} accept="image/*,application/pdf" />
          </div>
        </Section>

        <Section title="Fees (ERP)">
          <div className={G3}>
            <div className="space-y-1"><label className={label}>Total Fees</label><input type="number" min="0" className={input} value={f.fees_total} onChange={(e) => set("fees_total", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Fees Paid</label><input type="number" min="0" className={input} value={f.fees_paid} onChange={(e) => set("fees_paid", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Pending Fees</label><input type="number" min="0" className={input} value={f.pending_fees} onChange={(e) => set("pending_fees", e.target.value)} /></div>
            <div className="space-y-1"><label className={label}>Invoice Number</label><input className={input} value={f.invoice_number} onChange={(e) => set("invoice_number", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="Notes">
          <div className="space-y-1"><label className={label}>Admin Notes</label><textarea className={input} rows={2} value={f.admin_notes} onChange={(e) => set("admin_notes", e.target.value)} /></div>
          <div className="space-y-1"><label className={label}>Mentor Notes</label><textarea className={input} rows={2} value={f.mentor_notes} onChange={(e) => set("mentor_notes", e.target.value)} /></div>
        </Section>

        <div className="flex justify-end gap-3 sticky bottom-0 bg-slate-50 py-4 border-t border-slate-200">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-70">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Student
          </button>
        </div>
      </form>
    </div>
  );
}
