import { useState, useEffect } from "react";
import { api } from "../api/base44";
import { Table, Button, Modal, Input, Badge, PageHeader, Loader, Card, useToast, ToastContainer } from "../components/ui";
import { formatDate, today } from "../utils/helpers";

const SHIFT_OPTS = ["A","B","C","D"].map(v => ({ value: v, label: `Shift ${v}` }));

export default function Shifts() {
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
        api.ShiftSchedule.list({ q: JSON.stringify({ date }), limit: 500 }),
        api.Employee.list({ q: JSON.stringify({ status: "active" }), limit: 500, sort_by: "last_name" }),
      ]);
      setRecords(recs);
      setEmployees(emps);
    } catch { error("Load failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [date]);

  const empOptions = employees.map(e => ({ value: e.employee_id, label: `${e.last_name}, ${e.first_name} (${e.employee_id})` }));

  const openCreate = () => { setForm({ date, shift: "A" }); setModal("create"); };
  const openEdit = (r) => { setSelected(r); setForm({ ...r }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      const emp = employees.find(e => e.employee_id === form.employee_id);
      const payload = { ...form, employee_name: emp ? `${emp.first_name} ${emp.last_name}` : form.employee_name };
      if (modal === "create") { await api.ShiftSchedule.create(payload); success("Shift assigned!"); }
      else { await api.ShiftSchedule.update(selected.id, payload); success("Updated!"); }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const del = async (r) => {
    if (!confirm("Delete this shift?")) return;
    try { await api.ShiftSchedule.delete(r.id); success("Deleted."); load(); }
    catch { error("Delete failed"); }
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const shiftColors = { A: "#3b82f6", B: "#22c55e", C: "#f59e0b", D: "#8b5cf6" };

  const columns = [
    { key: "employee_id", label: "Emp ID" },
    { key: "employee_name", label: "Name", render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { key: "shift", label: "Shift", render: v => <Badge value={v} color={shiftColors[v]} /> },
    { key: "role", label: "Role/Post", render: v => v || "—" },
    { key: "notes", label: "Notes", render: v => <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v || "—"}</span> },
    { key: "actions", label: "", render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); del(r); }}>Del</Button>
      </div>
    )},
  ];

  // Group by shift
  const byShift = ["A","B","C","D"].map(s => ({ shift: s, count: records.filter(r => r.shift === s).length }));

  return (
    <div>
      <PageHeader title="Shift Schedule" subtitle="Assign employees to shifts"
        action={<Button onClick={openCreate}>+ Assign Shift</Button>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {byShift.map(({ shift, count }) => (
          <Card key={shift} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: shiftColors[shift] }}>{count}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Shift {shift}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontFamily: "inherit", fontSize: 14 }} />
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{records.length} assigned</span>
        </div>
      </Card>

      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={records} />}
      </Card>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Assign Shift" : "Edit Shift"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Employee" value={form.employee_id} onChange={f("employee_id")} options={empOptions} required style={{ gridColumn: "1 / -1" }} />
            <Input label="Date" value={form.date} onChange={f("date")} type="date" required />
            <Input label="Shift" value={form.shift} onChange={f("shift")} options={SHIFT_OPTS} required />
            <Input label="Role/Post" value={form.role} onChange={f("role")} style={{ gridColumn: "1 / -1" }} placeholder="e.g. Stunner, Hanger, Inspector…" />
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
