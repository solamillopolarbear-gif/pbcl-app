import { useState, useEffect } from "react";
import { api } from "../api/base44";
import { Table, Button, Modal, Input, Badge, PageHeader, Loader, Card, useToast, ToastContainer } from "../components/ui";
import { formatDate, labelMap, today } from "../utils/helpers";

const CAT_OPTS = ["attendance","conduct","safety","performance","other"].map(v => ({ value: v, label: labelMap(v) }));
const SEV_OPTS = ["minor","moderate","serious","grave"].map(v => ({ value: v, label: labelMap(v) }));

export default function Violations() {
  const [tab, setTab] = useState("records");
  const [records, setRecords] = useState([]);
  const [rules, setRules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { toasts, success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [recs, rul, emps] = await Promise.all([
        api.ViolationRecord.list({ sort_by: "-date", limit: 500 }),
        api.ViolationRule.list({ sort_by: "code", limit: 500 }),
        api.Employee.list({ q: JSON.stringify({ status: "active" }), limit: 500, sort_by: "last_name" }),
      ]);
      setRecords(recs);
      setRules(rul);
      setEmployees(emps);
    } catch { error("Load failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const empOptions = employees.map(e => ({ value: e.employee_id, label: `${e.last_name}, ${e.first_name}` }));
  const ruleOptions = rules.map(r => ({ value: r.id, label: `[${r.code}] ${r.description}` }));

  // --- RULES ---
  const openCreateRule = () => { setForm({ category: "conduct", severity: "minor", max_offenses: 3 }); setModal("rule_create"); };
  const openEditRule = (r) => { setSelected(r); setForm({ ...r }); setModal("rule_edit"); };

  const saveRule = async () => {
    setSaving(true);
    try {
      const payload = { ...form, max_offenses: Number(form.max_offenses) || 0 };
      if (modal === "rule_create") { await api.ViolationRule.create(payload); success("Rule created!"); }
      else { await api.ViolationRule.update(selected.id, payload); success("Updated!"); }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  // --- RECORDS ---
  const openCreateRecord = () => { setForm({ date: today(), offense_number: 1 }); setModal("rec_create"); };
  const openEditRecord = (r) => { setSelected(r); setForm({ ...r }); setModal("rec_edit"); };

  const saveRecord = async () => {
    setSaving(true);
    try {
      const emp = employees.find(e => e.employee_id === form.employee_id);
      const rule = rules.find(r => r.id === form.rule_id);
      const payload = {
        ...form,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : form.employee_name,
        rule_code: rule?.code || form.rule_code,
        rule_description: rule?.description || form.rule_description,
        offense_number: Number(form.offense_number) || 1,
        is_voided: form.is_voided || false,
      };
      if (modal === "rec_create") { await api.ViolationRecord.create(payload); success("Violation recorded!"); }
      else { await api.ViolationRecord.update(selected.id, payload); success("Updated!"); }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const del = async (entity, r) => {
    if (!confirm("Delete this record?")) return;
    try {
      if (entity === "rule") await api.ViolationRule.delete(r.id);
      else await api.ViolationRecord.delete(r.id);
      success("Deleted."); load();
    } catch { error("Delete failed"); }
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const ruleColumns = [
    { key: "code", label: "Code", render: v => <span style={{ fontWeight: 800, fontFamily: "monospace" }}>{v}</span> },
    { key: "description", label: "Description" },
    { key: "category", label: "Category", render: v => <Badge value={v} /> },
    { key: "severity", label: "Severity", render: v => <Badge value={v} /> },
    { key: "max_offenses", label: "Max Offenses", render: v => v === 0 ? "Immediate" : v },
    { key: "actions", label: "", render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); openEditRule(r); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); del("rule", r); }}>Del</Button>
      </div>
    )},
  ];

  const recColumns = [
    { key: "date", label: "Date", render: v => formatDate(v) },
    { key: "employee_name", label: "Employee", render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { key: "rule_code", label: "Rule", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{v}</span> },
    { key: "offense_number", label: "Offense #", render: v => `#${v}` },
    { key: "penalty", label: "Penalty", render: v => v || "—" },
    { key: "memo_ref", label: "Memo Ref", render: v => v || "—" },
    { key: "is_voided", label: "Status", render: v => <Badge value={v ? "voided" : "active"} color={v ? "#6b7280" : "#ef4444"} /> },
    { key: "actions", label: "", render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); openEditRecord(r); }}>Edit</Button>
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); del("rec", r); }}>Del</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Violations" subtitle="Violation rules and records"
        action={tab === "rules"
          ? <Button onClick={openCreateRule}>+ Add Rule</Button>
          : <Button onClick={openCreateRecord}>+ Add Violation</Button>} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--card2)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[["records","📋 Violation Records"],["rules","⚖️ Rules"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: "8px 20px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, fontFamily: "inherit",
            background: tab === v ? "var(--accent)" : "transparent", color: tab === v ? "#fff" : "var(--text-muted)", cursor: "pointer",
          }}>{l}</button>
        ))}
      </div>

      <Card>
        {loading ? <Loader /> : tab === "rules"
          ? <Table columns={ruleColumns} data={rules} />
          : <Table columns={recColumns} data={records} />}
      </Card>

      {/* Rule modals */}
      {(modal === "rule_create" || modal === "rule_edit") && (
        <Modal title={modal === "rule_create" ? "Add Violation Rule" : "Edit Rule"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Code" value={form.code} onChange={f("code")} required />
            <Input label="Max Offenses (0 = immediate)" value={form.max_offenses} onChange={f("max_offenses")} type="number" />
            <Input label="Description" value={form.description} onChange={f("description")} required style={{ gridColumn: "1 / -1" }} />
            <Input label="Category" value={form.category} onChange={f("category")} options={CAT_OPTS} />
            <Input label="Severity" value={form.severity} onChange={f("severity")} options={SEV_OPTS} />
            <Input label="Notes / Penalties per offense" value={form.notes} onChange={f("notes")} type="textarea" style={{ gridColumn: "1 / -1" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={saveRule} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </Modal>
      )}

      {/* Record modals */}
      {(modal === "rec_create" || modal === "rec_edit") && (
        <Modal title={modal === "rec_create" ? "Record Violation" : "Edit Violation"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Employee" value={form.employee_id} onChange={f("employee_id")} options={empOptions} required style={{ gridColumn: "1 / -1" }} />
            <Input label="Violation Rule" value={form.rule_id} onChange={f("rule_id")} options={ruleOptions} required style={{ gridColumn: "1 / -1" }} />
            <Input label="Date" value={form.date} onChange={f("date")} type="date" required />
            <Input label="Offense #" value={form.offense_number} onChange={f("offense_number")} type="number" />
            <Input label="Memo/NTE Ref" value={form.memo_ref} onChange={f("memo_ref")} />
            <Input label="Penalty" value={form.penalty} onChange={f("penalty")} />
            <Input label="Voided?" value={form.is_voided ? "true" : "false"} onChange={v => f("is_voided")(v === "true")}
              options={[{ value: "false", label: "Active" }, { value: "true", label: "Voided" }]} />
            {form.is_voided === true || form.is_voided === "true" ? <Input label="Void Reason" value={form.voided_reason} onChange={f("voided_reason")} /> : null}
            <Input label="Notes" value={form.notes} onChange={f("notes")} type="textarea" style={{ gridColumn: "1 / -1" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={saveRecord} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </Modal>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
