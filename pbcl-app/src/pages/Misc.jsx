import { useState, useEffect } from "react";
import { api } from "../api/base44";
import { Table, Button, Modal, Input, Badge, PageHeader, Loader, Card, useToast, ToastContainer } from "../components/ui";
import { formatDate, labelMap, today } from "../utils/helpers";

// ─── Calendar ─────────────────────────────────────────────────────────────────
const DAY_TYPE_OPTS = ["work_day","no_process","holiday","special_holiday","rest_day"].map(v => ({ value: v, label: labelMap(v) }));
const dayColors = { work_day: "#22c55e", no_process: "#6b7280", holiday: "#ef4444", special_holiday: "#f59e0b", rest_day: "#3b82f6" };

export function CalendarPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toasts, success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try { const data = await api.CalendarDay.list({ sort_by: "-date", limit: 500 }); setRecords(data); }
    catch { error("Load failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ date: today(), day_type: "work_day" }); setModal("create"); };
  const openEdit = (r) => { setSelected(r); setForm({ ...r }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "create") { await api.CalendarDay.create(form); success("Calendar day saved!"); }
      else { await api.CalendarDay.update(selected.id, form); success("Updated!"); }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const del = async (r) => {
    if (!confirm("Delete?")) return;
    try { await api.CalendarDay.delete(r.id); success("Deleted."); load(); }
    catch { error("Delete failed"); }
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "date", label: "Date", render: v => <span style={{ fontWeight: 700 }}>{formatDate(v)}</span> },
    { key: "day_type", label: "Type", render: v => <Badge value={v} color={dayColors[v]} /> },
    { key: "label", label: "Label", render: v => v || "—" },
    { key: "notes", label: "Notes", render: v => <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v || "—"}</span> },
    { key: "actions", label: "", render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); del(r); }}>Del</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Calendar" subtitle="Work days, holidays, and rest days"
        action={<Button onClick={openCreate}>+ Add Day</Button>} />
      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={records} />}
      </Card>
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Add Calendar Day" : "Edit Day"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Date" value={form.date} onChange={f("date")} type="date" required />
            <Input label="Day Type" value={form.day_type} onChange={f("day_type")} options={DAY_TYPE_OPTS} required />
            <Input label="Label (e.g. Christmas Day)" value={form.label} onChange={f("label")} style={{ gridColumn: "1 / -1" }} />
            <Input label="Notes" value={form.notes} onChange={f("notes")} type="textarea" style={{ gridColumn: "1 / -1" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </Modal>
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

// ─── Notifications ─────────────────────────────────────────────────────────────
const NOTIF_TYPE_OPTS = ["system_update","regularization_recommendation","general"].map(v => ({ value: v, label: labelMap(v) }));

export function NotificationsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toasts, success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try { const data = await api.Notification.list({ sort_by: "-created_date", limit: 100 }); setRecords(data); }
    catch { error("Load failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ type: "general", is_read: false, is_dismissed: false }); setModal("create"); };
  const markRead = async (r) => {
    try { await api.Notification.update(r.id, { is_read: true }); load(); }
    catch { error("Failed"); }
  };
  const dismiss = async (r) => {
    try { await api.Notification.update(r.id, { is_dismissed: true }); load(); }
    catch { error("Failed"); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.Notification.create({ ...form, is_read: false, is_dismissed: false });
      success("Notification sent!"); setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "type", label: "Type", render: v => <Badge value={v} /> },
    { key: "title", label: "Title", render: (v, r) => <span style={{ fontWeight: r.is_read ? 400 : 700 }}>{v}</span> },
    { key: "message", label: "Message", render: v => <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v?.slice(0, 60)}{v?.length > 60 ? "…" : ""}</span> },
    { key: "employee_name", label: "Employee", render: v => v || "—" },
    { key: "is_read", label: "Read", render: v => <Badge value={v ? "read" : "unread"} color={v ? "#22c55e" : "#f59e0b"} /> },
    { key: "is_dismissed", label: "Dismissed", render: v => v ? "Yes" : "No" },
    { key: "actions", label: "", render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        {!r.is_read && <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); markRead(r); }}>Mark Read</Button>}
        {!r.is_dismissed && <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); dismiss(r); }}>Dismiss</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Notifications" subtitle={`${records.filter(n => !n.is_read).length} unread`}
        action={<Button onClick={openCreate}>+ New Notification</Button>} />
      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={records} />}
      </Card>
      {modal === "create" && (
        <Modal title="Send Notification" onClose={() => setModal(null)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Type" value={form.type} onChange={f("type")} options={NOTIF_TYPE_OPTS} />
            <Input label="Title" value={form.title} onChange={f("title")} required />
            <Input label="Message" value={form.message} onChange={f("message")} type="textarea" required />
            <Input label="Related Employee ID (optional)" value={form.employee_id} onChange={f("employee_id")} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Sending…" : "Send"}</Button>
          </div>
        </Modal>
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

// ─── Users ─────────────────────────────────────────────────────────────────────
const ROLE_OPTS = [{ value: "admin", label: "Admin" }, { value: "user", label: "User" }];

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toasts, success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try { const data = await api.User.list({ limit: 200 }); setUsers(data); }
    catch { error("Load failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ role: "user" }); setModal("create"); };
  const openEdit = (u) => { setSelected(u); setForm({ ...u }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "create") { await api.User.create(form); success("User created!"); }
      else { await api.User.update(selected.id, form); success("Updated!"); }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "full_name", label: "Name", render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: v => <Badge value={v} color={v === "admin" ? "#7c3aed" : "#3b82f6"} /> },
    { key: "created_date", label: "Created", render: v => formatDate(v) },
    { key: "actions", label: "", render: (_, u) => (
      <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); openEdit(u); }}>Edit Role</Button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="App user access management"
        action={<Button onClick={openCreate}>+ Add User</Button>} />
      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={users} />}
      </Card>
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Add User" : "Edit User"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Full Name" value={form.full_name} onChange={f("full_name")} required />
            <Input label="Email" value={form.email} onChange={f("email")} type="email" required />
            <Input label="Role" value={form.role} onChange={f("role")} options={ROLE_OPTS} required />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </Modal>
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
