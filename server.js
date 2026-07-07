const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const Enquiry = require("./enquiry.model");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/carpediem";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 2000, // Fail fast in 2s if local DB is offline
  })
  .then(() => console.log("Successfully connected to MongoDB database."))
  .catch((err) => {
    console.log("\n========================================================");
    console.log("[STATUS] Local MongoDB database is offline/not started.");
    console.log("[STATUS] MERN server is running in offline simulation mode.");
    console.log("[STATUS] Enquiries will be logged directly to this console.");
    console.log("========================================================\n");
  });

// API endpoint to log enquiries
app.post("/api/enquiry", async (req, res) => {
  try {
    const { name, email, phone, course, college, message } = req.body;

    // Simple Server-side validation
    if (!name || !email || !phone || !course || !college) {
      return res.status(400).json({ error: "Missing required form fields" });
    }

    const mockData = {
      name,
      email,
      phone,
      course,
      college,
      message,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
    };

    // Check if database is connected (readyState === 1 means connected)
    if (mongoose.connection.readyState !== 1) {
      console.log("\n========================================================");
      console.log("[WARNING] MongoDB is not running or disconnected!");
      console.log("Saving enquiry in simulation mode (logged to console):");
      console.log(JSON.stringify(mockData, null, 2));
      console.log("========================================================\n");

      return res.status(201).json({
        success: true,
        message: "Enquiry logged successfully (Console Simulation Mode)",
        data: mockData,
      });
    }

    const newEnquiry = new Enquiry({
      name,
      email,
      phone,
      course,
      college,
      message,
    });

    const saved = await newEnquiry.save();
    console.log("Admissions enquiry saved to MongoDB:", saved);

    res.status(201).json({ success: true, message: "Enquiry logged successfully", data: saved });
  } catch (error) {
    console.error("Error saving enquiry:", error);
    res.status(500).json({ error: "Internal server error occurred while saving enquiry" });
  }
});

// Attendance API Endpoints
const { createClient } = require("@supabase/supabase-js");

const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://cnorljcgkpqfovcmdzmj.supabase.co";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

app.get("/api/attendance", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("student_attendance").select("*").order("date", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/attendance/today", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase.from("student_attendance").select("*").eq("date", today);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/attendance/student/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("student_attendance").select("*").eq("student_id", req.params.id).order("date", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/attendance/stats", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    // Fetch all logs
    const { data: logs, error: logsError } = await supabase.from("student_attendance").select("*");
    if (logsError) throw logsError;

    // Course-wise rates
    const courseStats = {};
    logs.forEach(l => {
      const course = l.course || "General";
      if (!courseStats[course]) {
        courseStats[course] = { total: 0, attended: 0 };
      }
      courseStats[course].total++;
      if (l.status === "Present" || l.status === "Late") {
        courseStats[course].attended++;
      }
    });

    const courses = Object.keys(courseStats).map(c => ({
      course: c,
      attendanceRate: Number(((courseStats[c].attended / courseStats[c].total) * 100).toFixed(1))
    }));

    // Status Share
    const statusShare = { Present: 0, Absent: 0, Late: 0, Leave: 0 };
    logs.forEach(l => {
      if (statusShare[l.status] !== undefined) {
        statusShare[l.status]++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalRecords: logs.length,
        courses,
        statusShare
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// Serve frontend static build files in production
app.use(express.static(path.join(__dirname, "dist")));

// Client-side fallback routing
app.get("*", (req, res) => {
  if (req.accepts("html") && !req.path.includes(".")) {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    res.status(404).json({ error: "Not Found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running in production mode on port ${PORT}`);
});
