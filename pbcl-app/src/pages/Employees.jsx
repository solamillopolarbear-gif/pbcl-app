import { useState, useEffect } from "react";
import { api } from "../api/base44";
import { Table, Button, Modal, Input, Badge, PageHeader, Loader, Card, useToast, ToastContainer } from "../components/ui";
import { formatDate, labelMap, deptColor } from "../utils/helpers";

const DEPT_OPTIONS = ["rkd","evis","offal","clean","waste_water","sanitation","ice","engineering","admin"].map(v => ({ value: v, label: labelMap(v) }));
const STATUS_OPTIONS = ["active","on_leave","terminated","resigned"].map(v => ({ value: v, label: labelMap(v) }));
const EMP_TYPE_OPTIONS = ["full_time","part_time","contract","intern"].map(v => ({ value: v, label: labelMap(v) }));
const EMP_CAT_OPTIONS = ["regular","probationary","on_call"].map(v => ({ value: v, label: labelMap(v) }));
const RATE_TYPE_OPTIONS = ["daily","hourly","monthly"].map(v => ({ value: v, label: labelMap(v) }));
const GENDER_OPTIONS = ["male","female","other","prefer_not_to_say"].map(v => ({ value: v, label: labelMap(v) }));
const MARITAL_OPTIONS = ["single","married","divorced","widowed"].map(v => ({ value: v, label: labelMap(v) }));

const emptyForm = {
  first_name: "", last_name: "", employee_id: "", email: "", phone: "",
  date_of_birth: "", gender: "", marital_status: "", address: "", city: "", state: "", zip_code: "",
  government_id: "", department: "", position: "", employment_type: "", employment_category: "regular",
  status: "active", hire_date: "", salary: "", rate_type: "daily", rate_amount: "", required_time_in: "08:00",
  emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relationship: "", notes: "", photo_url: "",
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [modal, setModal] = useState(null); // null | "create" | "edit" | "view"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toasts, success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const q = {};
      if (statusFilter) q.status = statusFilter;
      const data = await api.Employee.list({ q: JSON.stringify(q), limit: 500, sort_by: "last_name" });
      setEmployees(data);
    } catch (e) { error("Failed to load employees"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const filtered = employees.filter(e => {
    const name = `${e.first_name} ${e.last_name} ${e.employee_id} ${e.position || ""}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchDept = !deptFilter || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const openCreate = () => { setForm(emptyForm); setModal("create"); };
  const openEdit = (emp) => { setForm({ ...emptyForm, ...emp }); setSelected(emp); setModal("edit"); };
  const openView = (emp) => { setSelected(emp); setModal("view"); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "create") {
        await api.Employee.create({ ...form, salary: Number(form.salary) || undefined, rate_amount: Number(form.rate_amount) || undefined });
        success("Employee created!");
      } else {
        await api.Employee.update(selected.id, { ...form, salary: Number(form.salary) || undefined, rate_amount: Number(form.rate_amount) || undefined });
        success("Employee updated!");
      }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const del = async (emp) => {
    if (!confirm(`Delete ${emp.first_name} ${emp.last_name}?`)) return;
    try { await api.Employee.delete(emp.id); success("Deleted."); load(); }
    catch (e) { error("Delete failed"); }
  };

  const f = (k) => v => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "employee_id", label: "ID" },
    { key: "name", label: "Name", render: (_, r) => <span style={{ fontWeight: 700 }}>{r.first_name} {r.last_name}</span> },
    { key: "department", label: "Dept", render: v => v ? <Badge value={v} color={deptColor(v)} /> : "—" },
    { key: "position", label: "Position", render: v => v || "—" },
    { key: "employment_category", label: "Category", render: v => v ? <Badge value={v} /> : "—" },
    { key: "status", label: "Status", render: v => <Badge value={v} /> },
    { key: "hire_date", label: "Hired", render: v => formatDate(v) },
    { key: "actions", label: "", render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); del(r); }}>Del</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${filtered.length} records`}
        action={<Button onClick={openCreate}>+ Add Employee</Button>} />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input placeholder="Search name, ID, position…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }} />
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }}>
            <option value="">All Departments</option>
            {DEPT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={filtered} onRowClick={openView} />}
      </Card>

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Add Employee" : "Edit Employee"} onClose={() => setModal(null)} width={700}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="First Name" value={form.first_name} onChange={f("first_name")} required />
            <Input label="Last Name" value={form.last_name} onChange={f("last_name")} required />
            <Input label="Employee ID" value={form.employee_id} onChange={f("employee_id")} required />
            <Input label="Email" value={form.email} onChange={f("email")} type="email" />
            <Input label="Phone" value={form.phone} onChange={f("phone")} />
            <Input label="Date of Birth" value={form.date_of_birth} onChange={f("date_of_birth")} type="date" />
            <Input label="Gender" value={form.gender} onChange={f("gender")} options={GENDER_OPTIONS} />
            <Input label="Marital Status" value={form.marital_status} onChange={f("marital_status")} options={MARITAL_OPTIONS} />
            <Input label="Government ID" value={form.government_id} onChange={f("government_id")} />
            <Input label="Hire Date" value={form.hire_date} onChange={f("hire_date")} type="date" />
            <Input label="Department" value={form.department} onChange={f("department")} options={DEPT_OPTIONS} />
            <Input label="Position" value={form.position} onChange={f("position")} />
            <Input label="Employment Type" value={form.employment_type} onChange={f("employment_type")} options={EMP_TYPE_OPTIONS} />
            <Input label="Employment Category" value={form.employment_category} onChange={f("employment_category")} options={EMP_CAT_OPTIONS} />
            <Input label="Status" value={form.status} onChange={f("status")} options={STATUS_OPTIONS} />
            <Input label="Required Time In (HH:MM)" value={form.required_time_in} onChange={f("required_time_in")} placeholder="08:00" />
            <Input label="Rate Type" value={form.rate_type} onChange={f("rate_type")} options={RATE_TYPE_OPTIONS} />
            <Input label="Rate Amount" value={form.rate_amount} onChange={f("rate_amount")} type="number" />
            <Input label="Monthly Salary" value={form.salary} onChange={f("salary")} type="number" />
            <Input label="Address" value={form.address} onChange={f("address")} style={{ gridColumn: "1 / -1" }} />
            <Input label="City" value={form.city} onChange={f("city")} />
            <Input label="State/Province" value={form.state} onChange={f("state")} />
            <Input label="ZIP Code" value={form.zip_code} onChange={f("zip_code")} />
            <Input label="Photo URL" value={form.photo_url} onChange={f("photo_url")} />
            <Input label="Emergency Contact Name" value={form.emergency_contact_name} onChange={f("emergency_contact_name")} />
            <Input label="Emergency Contact Phone" value={form.emergency_contact_phone} onChange={f("emergency_contact_phone")} />
            <Input label="Emergency Relationship" value={form.emergency_contact_relationship} onChange={f("emergency_contact_relationship")} />
            <Input label="Notes" value={form.notes} onChange={f("notes")} type="textarea" style={{ gridColumn: "1 / -1" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Employee"}</Button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === "view" && selected && (
        <Modal title={`${selected.first_name} ${selected.last_name}`} onClose={() => setModal(null)} width={620}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              ["Employee ID", selected.employee_id],
              ["Department", selected.department ? labelMap(selected.department) : "—"],
              ["Position", selected.position || "—"],
              ["Status", selected.status ? labelMap(selected.status) : "—"],
              ["Employment Type", labelMap(selected.employment_type)],
              ["Employment Category", labelMap(selected.employment_category)],
              ["Hire Date", formatDate(selected.hire_date)],
              ["Rate Type", labelMap(selected.rate_type)],
              ["Rate Amount", selected.rate_amount ? `₱${selected.rate_amount.toLocaleString()}` : "—"],
              ["Monthly Salary", selected.salary ? `₱${selected.salary.toLocaleString()}` : "—"],
              ["Required Time In", selected.required_time_in || "—"],
              ["Email", selected.email || "—"],
              ["Phone", selected.phone || "—"],
              ["Government ID", selected.government_id || "—"],
              ["Emergency Contact", selected.emergency_contact_name || "—"],
              ["Emergency Phone", selected.emergency_contact_phone || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Close</Button>
            <Button onClick={() => openEdit(selected)}>Edit</Button>
          </div>
        </Modal>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
