import { useState, useEffect } from "react";
import { api } from "../api/base44";
import { Table, Button, Modal, Input, Badge, PageHeader, Loader, Card, useToast, ToastContainer } from "../components/ui";
import { formatDate, formatTime, today, labelMap } from "../utils/helpers";

const STATUS_OPTS = ["clocked_in","clocked_out","absent","on_leave"].map(v => ({ value: v, label: labelMap(v) }));

export default function Timekeeping() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today());
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toasts, success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [recs, emps] = await Promise.all([
        api.TimeRecord.list({ q: JSON.stringify({ date }), limit: 500 }),
        api.Employee.list({ q: JSON.stringify({ status: "active" }), limit: 500, sort_by: "last_name" }),
      ]);
      setRecords(recs);
      setEmployees(emps);
    } catch { error("Load failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [date]);

  const empOptions = employees.map(e => ({ value: e.employee_id, label: `${e.last_name}, ${e.first_name} (${e.employee_id})` }));

  const openCreate = () => {
    setForm({ date, status: "clocked_in" });
    setModal("create");
  };

  const openEdit = (rec) => {
    setSelected(rec);
    setForm({ ...rec });
    setModal("edit");
  };

  const save = async () => {
    setSaving(true);
    try {
      const emp = employees.find(e => e.employee_id === form.employee_id);
      const payload = {
        ...form,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : form.employee_name,
        hours_worked: form.time_in && form.time_out
          ? Math.round(((new Date(form.time_out) - new Date(form.time_in)) / 3600000) * 100) / 100
          : undefined,
      };
      if (modal === "create") {
        await api.TimeRecord.create(payload);
        success("Record created!");
      } else {
        await api.TimeRecord.update(selected.id, payload);
        success("Record updated!");
      }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const del = async (rec) => {
    if (!confirm("Delete this time record?")) return;
    try { await api.TimeRecord.delete(rec.id); success("Deleted."); load(); }
    catch { error("Delete failed"); }
  };

  const clockOut = async (rec) => {
    try {
      const now = new Date().toISOString();
      const hours = Math.round(((new Date(now) - new Date(rec.time_in)) / 3600000) * 100) / 100;
      await api.TimeRecord.update(rec.id, { time_out: now, status: "clocked_out", hours_worked: hours });
      success("Clocked out!"); load();
    } catch { error("Failed to clock out"); }
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "employee_id", label: "Emp ID" },
    { key: "employee_name", label: "Name", render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { key: "time_in", label: "Time In", render: v => v ? formatTime(v) : "—" },
    { key: "time_out", label: "Time Out", render: v => v ? formatTime(v) : "—" },
    { key: "hours_worked", label: "Hours", render: v => v ? `${v}h` : "—" },
    { key: "status", label: "Status", render: v => <Badge value={v} /> },
    { key: "notes", label: "Notes", render: v => <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v || "—"}</span> },
    { key: "actions", label: "", render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        {r.status === "clocked_in" && <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); clockOut(r); }}>Clock Out</Button>}
        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); del(r); }}>Del</Button>
      </div>
    )},
  ];

  const summary = {
    clocked_in: records.filter(r => r.status === "clocked_in").length,
    clocked_out: records.filter(r => r.status === "clocked_out").length,
    absent: records.filter(r => r.status === "absent").length,
    on_leave: records.filter(r => r.status === "on_leave").length,
  };

  return (
    <div>
      <PageHeader title="Timekeeping" subtitle="Daily attendance records"
        action={<Button onClick={openCreate}>+ Add Record</Button>} />

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[["Clocked In","clocked_in","#22c55e"],["Clocked Out","clocked_out","#3b82f6"],["Absent","absent","#ef4444"],["On Leave","on_leave","#f59e0b"]].map(([label, key, color]) => (
          <Card key={key} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{summary[key]}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontFamily: "inherit", fontSize: 14 }} />
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{records.length} record(s)</span>
        </div>
      </Card>

      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={records} />}
      </Card>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Add Time Record" : "Edit Time Record"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Employee" value={form.employee_id} onChange={f("employee_id")} options={empOptions} required style={{ gridColumn: "1 / -1" }} />
            <Input label="Date" value={form.date} onChange={f("date")} type="date" required />
            <Input label="Status" value={form.status} onChange={f("status")} options={STATUS_OPTS} />
            <Input label="Time In" value={form.time_in ? form.time_in.slice(0,16) : ""} onChange={v => f("time_in")(v ? new Date(v).toISOString() : "")} type="datetime-local" style={{ gridColumn: "1 / -1" }} />
            <Input label="Time Out" value={form.time_out ? form.time_out.slice(0,16) : ""} onChange={v => f("time_out")(v ? new Date(v).toISOString() : "")} type="datetime-local" style={{ gridColumn: "1 / -1" }} />
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
