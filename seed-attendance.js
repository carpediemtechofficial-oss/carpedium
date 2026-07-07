require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://cnorljcgkpqfovcmdzmj.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Cannot seed.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function seed() {
  console.log("[SEED] Initializing Attendance System Seeder...");

  // 1. Insert default settings
  const defaultSettings = {
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLScQZFfruiOEbnlNLQTB_bREj52i-vrx9au3fKS5Kxji_UIAAw/viewform",
    formId: "1FAIpQLScQZFfruiOEbnlNLQTB_bREj52i-vrx9au3fKS5Kxji_UIAAw",
    scriptUrl: "https://script.google.com/macros/s/AKfycbzelgxwYksAjyZMrw-WmDyfCA1FEsH6srBvE4anqXKFcCXtIL_EDnxBuCj9PPZFLmsBCA/exec",
    apiKey: "carpediem-attendance-sync-2026",
    enableAutoSync: false,
    syncInterval: 60,
    lastSynced: new Date().toISOString(),
    lastStatus: "Success",
  };

  const { error: settingsError } = await supabase
    .from("settings")
    .upsert({
      key: "attendance_settings",
      value: defaultSettings,
    }, { onConflict: "key" });

  if (settingsError) {
    console.error("[SEED] Failed to seed default settings:", settingsError.message);
  } else {
    console.log("[SEED] Successfully seeded attendance settings.");
  }

  // 2. Fetch all student profiles
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, full_name, course_name, batch");

  if (studentsError || !students || students.length === 0) {
    console.error("[SEED] No students found in the database. Please seed student profiles first.");
    process.exit(1);
  }

  console.log(`[SEED] Found ${students.length} students to generate attendance logs for.`);

  // 3. Generate 30 days of historical logs
  const statuses = ["Present", "Present", "Present", "Present", "Present", "Present", "Late", "Absent", "Leave"];
  const remarksList = {
    Present: ["On time", "Active participation", "Completed daily tasks", "Good work"],
    Late: ["Traffic delay", "Missed first 15 mins", "Late login", "Technical issues"],
    Absent: ["Medical reasons", "No notification", "Family emergency", "Power cut"],
    Leave: ["Approved personal leave", "Prior notification given", "Exam preparation"],
  };

  const attendanceRecords = [];
  const today = new Date();

  for (const student of students) {
    let attended = 0;
    let total = 0;

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      
      // Skip Sundays
      if (date.getDay() === 0) continue;

      const formattedDate = date.toISOString().split("T")[0];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      if (status === "Present" || status === "Late") {
        attended++;
      }
      total++;

      // Check-in and check-out times
      let checkIn = null;
      let checkOut = null;
      if (status === "Present") {
        checkIn = "09:00:00";
        checkOut = "17:30:00";
      } else if (status === "Late") {
        checkIn = `09:${Math.floor(Math.random() * 20) + 15}:00`;
        checkOut = "17:30:00";
      }

      const remarksOptions = remarksList[status];
      const remarks = remarksOptions[Math.floor(Math.random() * remarksOptions.length)];

      attendanceRecords.push({
        student_id: student.id,
        student_name: student.full_name,
        course: student.course_name || "Full-Stack Development",
        batch: student.batch || "Batch A",
        date: formattedDate,
        status,
        check_in: checkIn,
        check_out: checkOut,
        mentor: "Arun Kumar",
        remarks,
      });
    }

    // 4. Update student aggregate rates
    const percentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;
    const { error: updateError } = await supabase
      .from("students")
      .update({
        attendance_percentage: percentage,
        total_classes: total,
        classes_attended: attended,
      })
      .eq("id", student.id);

    if (updateError) {
      console.error(`[SEED] Failed to update aggregate stats for student ${student.full_name}:`, updateError.message);
    }
  }

  console.log(`[SEED] Inserting ${attendanceRecords.length} attendance records...`);

  // 5. Batch upsert attendance logs
  // Split into chunks of 100 to avoid Supabase batch limit caps
  const chunkSize = 100;
  for (let i = 0; i < attendanceRecords.length; i += chunkSize) {
    const chunk = attendanceRecords.slice(i, i + chunkSize);
    const { error: insertError } = await supabase
      .from("student_attendance")
      .upsert(chunk, { onConflict: "student_id,date" });

    if (insertError) {
      console.error("[SEED] Failed to upsert attendance chunk:", insertError.message);
    }
  }

  // 6. Log successful sync attempt
  const { error: logError } = await supabase
    .from("attendance_sync_logs")
    .insert({
      status: "Success",
      rows_synced: attendanceRecords.length,
      error_message: "Historical attendance data seeded successfully.",
    });

  if (logError) {
    console.error("[SEED] Failed to insert sync log:", logError.message);
  }

  console.log("[SEED] Attendance seeder execution complete!");
}

seed().catch(err => {
  console.error("[SEED] Fatal error in seeder:", err);
});
