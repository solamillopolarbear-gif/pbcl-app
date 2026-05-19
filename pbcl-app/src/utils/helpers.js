export function formatDate(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export function formatTime(str) {
  if (!str) return "-";
  return new Date(str).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(str) {
  if (!str) return "-";
  return new Date(str).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function calcHours(timeIn, timeOut) {
  if (!timeIn || !timeOut) return null;
  const ms = new Date(timeOut) - new Date(timeIn);
  return Math.round((ms / 3600000) * 100) / 100;
}

export function today() {
  return new Date().toISOString().split("T")[0];
}

export function labelMap(key) {
  const map = {
    full_time: "Full Time", part_time: "Part Time", contract: "Contract", intern: "Intern",
    regular: "Regular", probationary: "Probationary", on_call: "On Call",
    active: "Active", on_leave: "On Leave", terminated: "Terminated", resigned: "Resigned",
    daily: "Daily", hourly: "Hourly", monthly: "Monthly",
    clocked_in: "Clocked In", clocked_out: "Clocked Out", absent: "Absent",
    sick_leave: "Sick Leave", vacation_leave: "Vacation Leave", maternity_leave: "Maternity Leave",
    paternity_leave: "Paternity Leave", emergency_leave: "Emergency Leave",
    solo_parent_leave: "Solo Parent Leave", marital_leave: "Marital Leave",
    bereavement_leave: "Bereavement Leave", suspension: "Suspension", other: "Other",
    rkd: "RKD", evis: "EVIS", offal: "Offal", clean: "Clean", waste_water: "Waste Water",
    sanitation: "Sanitation", ice: "Ice", engineering: "Engineering", admin: "Admin",
    minor: "Minor", moderate: "Moderate", serious: "Serious", grave: "Grave",
    attendance: "Attendance", conduct: "Conduct", safety: "Safety", performance: "Performance",
    work_day: "Work Day", no_process: "No Process", holiday: "Holiday",
    special_holiday: "Special Holiday", rest_day: "Rest Day",
    system_update: "System Update", regularization_recommendation: "Regularization Rec.", general: "General",
    male: "Male", female: "Female", prefer_not_to_say: "Prefer Not to Say",
    single: "Single", married: "Married", divorced: "Divorced", widowed: "Widowed",
  };
  return map[key] || key;
}

export function statusColor(status) {
  const map = {
    active: "#22c55e", on_leave: "#f59e0b", terminated: "#ef4444", resigned: "#6b7280",
    clocked_in: "#22c55e", clocked_out: "#3b82f6", absent: "#ef4444",
    minor: "#f59e0b", moderate: "#f97316", serious: "#ef4444", grave: "#7c3aed",
    approved: "#22c55e",
  };
  return map[status] || "#6b7280";
}

export function deptColor(dept) {
  const map = {
    rkd: "#3b82f6", evis: "#10b981", offal: "#f59e0b", clean: "#06b6d4",
    waste_water: "#8b5cf6", sanitation: "#ec4899", ice: "#0ea5e9",
    engineering: "#f97316", admin: "#6b7280",
  };
  return map[dept] || "#6b7280";
}
