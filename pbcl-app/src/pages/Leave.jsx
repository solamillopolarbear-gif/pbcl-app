import { useState, useEffect } from "react";
import { api } from "../api/base44";
import { Table, Button, Modal, Input, Badge, PageHeader, Loader, Card, useToast, ToastContainer } from "../components/ui";
import { formatDate, labelMap, today } from "../utils/helpers";

const LEAVE_OPTS = ["sick_leave","vacation_leave","maternity_leave","paternity_leave","emergency_leave","solo_parent_leave","marital_leave","bereavement_leave","suspension","other"].map(v => ({ value: v, label: labelMap(v) }));

const empty = { employee_id: "", employee_name: "", leave_type: "sick_leave", start_date: today(), end_date: today(), days: "", reason: "", approved: true };

export default function Leave() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const { toasts, success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [recs, emps] = await Promise.all([
        api.LeaveRecord.list({ sort_by: "-start_date", limit: 500 }),
        api.Employee.list({ q: JSON.stringify({ status: "active" }), limit: 500, sort_by: "last_name" }),
      ]);
      setRecords(recs);
      setEmployees(emps);
    } catch { error("Load failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const empOptions = employees.map(e => ({ value: e.employee_id, label: `${e.last_name}, ${e.first_name} (${e.employee_id})` }));

  const filtered = records.filter(r => !filter || r.leave_type === filter);

  const openCreate = () => { setForm(empty); setModal("create"); };
  const openEdit = (r) => { setSelected(r); setForm({ ...empty, ...r, days: r.days || "" }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      const emp = employees.find(e => e.employee_id === form.employee_id);
      const days = form.days ? Number(form.days) : Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1;
      const payload = { ...form, employee_name: emp ? `${emp.first_name} ${emp.last_name}` : form.employee_name, days };
      if (modal === "create") { await api.LeaveRecord.create(payload); success("Leave record added!"); }
      else { await api.LeaveRecord.update(selected.id, payload); success("Updated!"); }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const del = async (r) => {
    if (!confirm("Delete this leave record?")) return;
    try { await api.LeaveRecord.delete(r.id); success("Deleted."); load(); }
    catch { error("Delete failed"); }
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "employee_name", label: "Employee", render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { key: "leave_type", label: "Type", render: v => <Badge value={v} /> },
    { key: "start_date", label: "From", render: v => formatDate(v) },
    { key: "end_date", label: "To", render: v => formatDate(v) },
    { key: "days", label: "Days", render: v => v || "—" },
    { key: "approved", label: "Status", render: v => <Badge value={v ? "approved" : "pending"} color={v ? "#22c55e" : "#f59e0b"} /> },
    { key: "reason", label: "Reason", render: v => <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v || "—"}</span> },
    { key: "actions", label: "", render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); del(r); }}>Del</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Leave Records" subtitle={`${filtered.length} records`}
        action={<Button onClick={openCreate}>+ Add Leave</Button>} />

      <Card style={{ marginBottom: 16 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontFamily: "inherit", fontSize: 14 }}>
          <option value="">All Leave Types</option>
          {LEAVE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Card>

      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={filtered} />}
      </Card>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Add Leave Record" : "Edit Leave"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Employee" value={form.employee_id} onChange={f("employee_id")} options={empOptions} required style={{ gridColumn: "1 / -1" }} />
            <Input label="Leave Type" value={form.leave_type} onChange={f("leave_type")} options={LEAVE_OPTS} required style={{ gridColumn: "1 / -1" }} />
            <Input label="Start Date" value={form.start_date} onChange={f("start_date")} type="date" required />
            <Input label="End Date" value={form.end_date} onChange={f("end_date")} type="date" required />
            <Input label="Days (auto-calc if blank)" value={form.days} onChange={f("days")} type="number" />
            <Input label="Approved" value={form.approved ? "true" : "false"} onChange={v => f("approved")(v === "true")}
              options={[{ value: "true", label: "Approved" }, { value: "false", label: "Pending" }]} />
            <Input label="Reason" value={form.reason} onChange={f("reason")} type="textarea" style={{ gridColumn: "1 / -1" }} />
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
