import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, Edit, Loader2, Phone, MessageCircle, Mail, CalendarClock,
  GraduationCap, Briefcase, FolderGit2, Award, FileText, User, Wallet, Plus,
} from "lucide-react";
import type { Database } from "@/types/supabase";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];
type Interaction = Database["public"]["Tables"]["student_interactions"]["Row"];
type Payment = Database["public"]["Tables"]["student_payments"]["Row"];

type Props = {
  student: StudentRow;
  onBack: () => void;
  onEdit: (s: StudentRow) => void;
};

const money = (n: number | null | undefined) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-700"><Icon className="h-4 w-4" /></div>
        <h3 className="font-bold font-display text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50 last:border-0 text-sm">
      <span className="text-slate-500">{k}</span>
      <span className="text-slate-900 font-medium text-right break-all">{v || "—"}</span>
    </div>
  );
}

function Link({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <>—</>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:underline">{children}</a>;
}

const INTERACTION_ICON: Record<string, any> = { Call: Phone, WhatsApp: MessageCircle, Email: Mail, "Follow-up": CalendarClock, Note: FileText };

export default function StudentProfile({ student, onBack, onEdit }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "crm" | "erp" | "attendance">("overview");

  // realtime for interactions & payments of this student
  useEffect(() => {
    const ch = supabase
      .channel(`student-profile-${student.id}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "student_interactions", filter: `student_id=eq.${student.id}` }, () =>
        qc.invalidateQueries({ queryKey: ["interactions", student.id] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "student_payments", filter: `student_id=eq.${student.id}` }, () =>
        qc.invalidateQueries({ queryKey: ["payments", student.id] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc, student.id]);

  const { data: interactions } = useQuery({
    queryKey: ["interactions", student.id],
    queryFn: async () => {
      const { data } = await supabase.from("student_interactions").select("*").eq("student_id", student.id).order("created_at", { ascending: false });
      return (data ?? []) as Interaction[];
    },
  });
  const { data: payments } = useQuery({
    queryKey: ["payments", student.id],
    queryFn: async () => {
      const { data } = await supabase.from("student_payments").select("*").eq("student_id", student.id).order("payment_date", { ascending: false });
      return (data ?? []) as Payment[];
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button>
          {student.profile_photo ? (
            <img src={student.profile_photo} alt={student.full_name} className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-900/10" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xl font-bold">{student.full_name.charAt(0)}</div>
          )}
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900">{student.full_name}</h2>
            <p className="text-sm text-slate-500">{student.course_name || "—"} {student.batch ? `· ${student.batch}` : ""}</p>
          </div>
        </div>
        <button onClick={() => onEdit(student)} className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 self-start">
          <Edit className="h-4 w-4" /> Edit
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(["overview", "crm", "erp", "attendance"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${tab === t ? "border-slate-800 text-slate-950" : "border-transparent text-slate-500 hover:text-slate-850"}`}>
            {t === "crm" ? "CRM" : t === "erp" ? "Fees (ERP)" : t === "attendance" ? "Attendance" : "Overview"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Personal Details" icon={User}>
            <Row k="Gender" v={student.gender} />
            <Row k="Date of Birth" v={fmtDate(student.date_of_birth)} />
            <Row k="Email" v={student.email} />
            <Row k="Mobile" v={student.mobile} />
            <Row k="Alternate" v={student.alternate_number} />
            <Row k="Address" v={[student.address, student.city, student.state, student.country].filter(Boolean).join(", ")} />
          </Card>

          <Card title="Course Details" icon={GraduationCap}>
            <Row k="Course" v={student.course_name} />
            <Row k="Batch" v={student.batch} />
            <Row k="Mentor" v={student.mentor_name} />
            <Row k="Learning Mode" v={student.learning_mode} />
            <Row k="Enrolled" v={fmtDate(student.enrollment_date)} />
            <Row k="Expected Completion" v={fmtDate(student.expected_completion_date)} />
            <Row k="Status" v={<span className="capitalize">{student.status}</span>} />
          </Card>

          <Card title="Attendance" icon={CalendarClock}>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Attendance</span><span className="font-bold text-slate-900">{student.attendance_percentage ?? 0}%</span></div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-slate-800" style={{ width: `${Math.min(100, Number(student.attendance_percentage) || 0)}%` }} /></div>
            </div>
            <Row k="Total Classes" v={student.total_classes} />
            <Row k="Classes Attended" v={student.classes_attended} />
          </Card>

          <Card title="Project" icon={FolderGit2}>
            <Row k="Title" v={student.project_title} />
            <Row k="Status" v={student.project_status} />
            <Row k="GitHub" v={<Link href={student.github_link}>Repository</Link>} />
            <Row k="Drive" v={<Link href={student.drive_link}>Drive</Link>} />
            <Row k="Live Demo" v={<Link href={student.live_demo_link}>Demo</Link>} />
            <Row k="Feedback" v={student.mentor_feedback} />
          </Card>

          <Card title="Certificate" icon={Award}>
            <Row k="Issued" v={student.certificate_issued ? "Yes" : "No"} />
            <Row k="Number" v={student.certificate_number} />
            <Row k="Verify" v={<Link href={student.certificate_verification_url}>Verification</Link>} />
            <Row k="Issue Date" v={fmtDate(student.certificate_issue_date)} />
          </Card>

          <Card title="Placement" icon={Briefcase}>
            <Row k="Status" v={student.placement_status} />
            <Row k="Company" v={student.current_company} />
            <Row k="Role" v={student.job_role} />
            <Row k="Package" v={student.salary_package} />
            <Row k="Resume" v={<Link href={student.resume_link}>Resume</Link>} />
            <Row k="LinkedIn" v={<Link href={student.linkedin}>LinkedIn</Link>} />
            <Row k="Portfolio" v={<Link href={student.portfolio}>Portfolio</Link>} />
          </Card>

          <Card title="Documents" icon={FileText}>
            <Row k="Resume" v={<Link href={student.doc_resume}>View</Link>} />
            <Row k="ID Proof" v={<Link href={student.doc_id_proof}>View</Link>} />
            <Row k="Offer Letter" v={<Link href={student.doc_offer_letter}>View</Link>} />
            <Row k="Internship Certificate" v={<Link href={student.doc_internship_certificate}>View</Link>} />
            <Row k="Course Certificate" v={<Link href={student.doc_course_certificate}>View</Link>} />
          </Card>

          <TimelineCard student={student} interactions={interactions ?? []} />
        </div>
      )}

      {tab === "crm" && <CrmPanel studentId={student.id} interactions={interactions ?? []} />}
      {tab === "erp" && <ErpPanel student={student} payments={payments ?? []} />}
      {tab === "attendance" && <AttendancePanel studentId={student.id} />}
    </div>
  );
}

function TimelineCard({ student, interactions }: { student: StudentRow; interactions: Interaction[] }) {
  const events = [
    ...(student.enrollment_date ? [{ label: "Enrolled", date: student.enrollment_date }] : []),
    ...(student.certificate_issue_date ? [{ label: "Certificate Issued", date: student.certificate_issue_date }] : []),
    ...interactions.map((i) => ({ label: `${i.type}: ${i.notes ?? ""}`.slice(0, 60), date: i.created_at ?? "" })),
  ].filter((e) => e.date).sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Card title="Activity Timeline" icon={CalendarClock}>
      {events.length === 0 ? (
        <p className="text-sm text-slate-400">No activity yet.</p>
      ) : (
        <ol className="relative border-l border-slate-200 ml-2 space-y-4">
          {events.map((e, i) => (
            <li key={i} className="ml-4">
              <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-slate-800" />
              <p className="text-sm text-slate-900">{e.label}</p>
              <p className="text-xs text-slate-400">{fmtDate(e.date)}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function CrmPanel({ studentId, interactions }: { studentId: string; interactions: Interaction[] }) {
  const [type, setType] = useState("Call");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const input = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-800 outline-none";

  const add = async () => {
    if (!notes.trim() && !followUp) return;
    setSaving(true);
    const { error } = await supabase.from("student_interactions").insert({
      student_id: studentId, type, notes, follow_up_date: followUp || null, lead_status: leadStatus || null,
    });
    setSaving(false);
    if (error) alert(error.message);
    else { setNotes(""); setFollowUp(""); setLeadStatus(""); }
  };

  const del = async (id: string) => {
    if (confirm("Delete this interaction?")) await supabase.from("student_interactions").delete().eq("id", id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h3 className="font-bold font-display text-slate-900">Log Interaction</h3>
        <select className={`${input} bg-white`} value={type} onChange={(e) => setType(e.target.value)}>
          <option>Call</option><option>WhatsApp</option><option>Email</option><option>Follow-up</option><option>Note</option>
        </select>
        <textarea className={input} rows={3} placeholder="Counsellor notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div>
          <label className="text-xs font-medium text-slate-500">Follow-up Date</label>
          <input type="date" className={input} value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
        </div>
        <input className={input} placeholder="Lead status (e.g. Interested)" value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)} />
        <button onClick={add} disabled={saving} className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
        </button>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold font-display text-slate-900 mb-4">Interaction History</h3>
        {interactions.length === 0 ? (
          <p className="text-sm text-slate-400">No interactions logged.</p>
        ) : (
          <div className="space-y-3">
            {interactions.map((i) => {
              const Icon = INTERACTION_ICON[i.type ?? "Note"] ?? FileText;
              return (
                <div key={i.id} className="flex items-start gap-3 border border-slate-100 rounded-lg p-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-750"><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{i.type}</span>
                      <span className="text-xs text-slate-400">{fmtDate(i.created_at)}</span>
                    </div>
                    {i.notes && <p className="text-sm text-slate-600 mt-0.5">{i.notes}</p>}
                    <div className="flex gap-3 mt-1 text-xs text-slate-400">
                      {i.follow_up_date && <span>Follow-up: {fmtDate(i.follow_up_date)}</span>}
                      {i.lead_status && <span className="text-slate-900 font-medium">{i.lead_status}</span>}
                    </div>
                  </div>
                  <button onClick={() => del(i.id)} className="text-slate-300 hover:text-red-500 text-xs">✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ErpPanel({ student, payments }: { student: StudentRow; payments: Payment[] }) {
  const [amount, setAmount] = useState("");
  const [installment, setInstallment] = useState("");
  const [invoice, setInvoice] = useState("");
  const [method, setMethod] = useState("UPI");
  const [date, setDate] = useState("");
  const [receipt, setReceipt] = useState("");
  const [saving, setSaving] = useState(false);
  const input = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-800 outline-none";
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const add = async () => {
    if (!amount) return;
    setSaving(true);
    const { error } = await supabase.from("student_payments").insert({
      student_id: student.id, amount: Number(amount) || 0, installment_no: Number(installment) || null,
      invoice_number: invoice || null, method, payment_date: date || new Date().toISOString().slice(0, 10),
      receipt_url: receipt || null,
    });
    setSaving(false);
    if (error) alert(error.message);
    else { setAmount(""); setInstallment(""); setInvoice(""); setReceipt(""); setDate(""); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Fees", value: money(student.fees_total), color: "text-slate-900" },
          { label: "Paid (records)", value: money(totalPaid || student.fees_paid), color: "text-green-600" },
          { label: "Pending", value: money(student.pending_fees), color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">{s.label}</p>
            <h3 className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="font-bold font-display text-slate-900 flex items-center gap-2"><Wallet className="h-4 w-4 text-slate-900" /> Record Payment</h3>
          <input className={input} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input className={input} type="number" placeholder="Installment #" value={installment} onChange={(e) => setInstallment(e.target.value)} />
          <input className={input} placeholder="Invoice Number" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
          <select className={`${input} bg-white`} value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>UPI</option><option>Card</option><option>Net Banking</option><option>Cash</option><option>Bank Transfer</option>
          </select>
          <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className={input} placeholder="Receipt URL (optional)" value={receipt} onChange={(e) => setReceipt(e.target.value)} />
          <button onClick={add} disabled={saving} className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Payment
          </button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
          <h3 className="font-bold font-display text-slate-900 mb-4">Payment History</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-400">No payments recorded.</p>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Amount</th><th className="py-2 pr-4">Inst.</th>
                  <th className="py-2 pr-4">Invoice</th><th className="py-2 pr-4">Method</th><th className="py-2">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-4">{fmtDate(p.payment_date)}</td>
                    <td className="py-2 pr-4 font-semibold text-slate-900">{money(p.amount)}</td>
                    <td className="py-2 pr-4">{p.installment_no ?? "—"}</td>
                    <td className="py-2 pr-4">{p.invoice_number ?? "—"}</td>
                    <td className="py-2 pr-4">{p.method ?? "—"}</td>
                    <td className="py-2">{p.receipt_url ? <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-slate-900 hover:underline">Download</a> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendancePanel({ studentId }: { studentId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("student_attendance")
        .select("*")
        .eq("student_id", studentId)
        .order("date", { ascending: false });
      
      if (data) setLogs(data);
      setLoading(false);
    }
    load();
  }, [studentId]);

  const presentCount = logs.filter(l => l.status === "Present").length;
  const lateCount = logs.filter(l => l.status === "Late").length;
  const absentCount = logs.filter(l => l.status === "Absent").length;
  const leaveCount = logs.filter(l => l.status === "Leave").length;
  const total = logs.length;
  const rate = total > 0 ? ((presentCount + lateCount) / total * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Mini stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Attendance Rate", value: `${rate}%` },
          { label: "Present Days", value: presentCount },
          { label: "Late Count", value: lateCount },
          { label: "Absent Days", value: absentCount },
          { label: "Leave Count", value: leaveCount },
        ].map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{card.label}</span>
            <p className="text-xl font-bold text-slate-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold font-display text-slate-900 mb-4">Historical Attendance Calendar Logs</h3>
        {loading ? (
          <p className="text-sm font-mono text-slate-400">Loading calendar logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-400">No attendance logs synced for this student.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-500 font-mono text-[10px] uppercase border-b border-slate-100 pb-2">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Check-in / Out</th>
                  <th className="pb-2 pr-4">Mentor</th>
                  <th className="pb-2">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-600">{log.date}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.status === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        log.status === "Absent" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                        log.status === "Late" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">
                      {log.check_in || "--:--"} - {log.check_out || "--:--"}
                    </td>
                    <td className="py-2.5 pr-4 text-xs font-semibold text-slate-600">{log.mentor || "—"}</td>
                    <td className="py-2.5 text-xs text-slate-400 italic max-w-xs truncate" title={log.remarks || ""}>
                      {log.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

