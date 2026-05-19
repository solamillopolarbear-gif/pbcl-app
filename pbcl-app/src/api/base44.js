const APP_ID = "69fd933c4f54c69e74300a3f";
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities`;

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken || localStorage.getItem("base44_token");
}

async function request(method, path, body = null, params = {}) {
  const token = getAuthToken();
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, typeof v === "object" ? JSON.stringify(v) : v);
  });

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function entity(name) {
  return {
    list: (params = {}) => request("GET", `/${name}`, null, params),
    get: (id) => request("GET", `/${name}/${id}`),
    create: (data) => request("POST", `/${name}`, data),
    update: (id, data) => request("PUT", `/${name}/${id}`, data),
    delete: (id) => request("DELETE", `/${name}/${id}`),
  };
}

export const api = {
  Employee: entity("Employee"),
  TimeRecord: entity("TimeRecord"),
  ProductionSchedule: entity("ProductionSchedule"),
  ShiftSchedule: entity("ShiftSchedule"),
  Notification: entity("Notification"),
  ViolationRule: entity("ViolationRule"),
  ViolationRecord: entity("ViolationRecord"),
  LeaveRecord: entity("LeaveRecord"),
  CalendarDay: entity("CalendarDay"),
  User: entity("User"),
};
