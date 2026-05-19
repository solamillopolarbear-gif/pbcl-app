import { useState, useEffect } from "react";
import { api } from "../api/base44";
import { Table, Button, Modal, Input, PageHeader, Loader, Card, useToast, ToastContainer } from "../components/ui";
import { formatDate, today } from "../utils/helpers";

const empty = { date: today(), heads: "", call_time: "", cut_off_post: "", target_start_hang: "", truck_arrival: "", receiving: "", actual_start_hang: "", notes: "" };

export default function Production() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const { toasts, success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.ProductionSchedule.list({ sort_by: "-date", limit: 100 });
      setRecords(data);
    } catch { error("Load failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ ...empty, date: today() }); setModal("create"); };
  const openEdit = (r) => { setSelected(r); setForm({ ...empty, ...r, heads: r.heads || "" }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, heads: form.heads ? Number(form.heads) : undefined };
      if (modal === "create") { await api.ProductionSchedule.create(payload); success("Created!"); }
      else { await api.ProductionSchedule.update(selected.id, payload); success("Updated!"); }
      setModal(null); load();
    } catch (e) { error(e.message || "Save failed"); }
    setSaving(false);
  };

  const del = async (r) => {
    if (!confirm("Delete this production schedule?")) return;
    try { await api.ProductionSchedule.delete(r.id); success("Deleted."); load(); }
    catch { error("Delete failed"); }
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "date", label: "Date", render: v => <span style={{ fontWeight: 700 }}>{formatDate(v)}</span> },
    { key: "heads", label: "Heads", render: v => v ? v.toLocaleString() : "—" },
    { key: "call_time", label: "Call Time" },
    { key: "cut_off_post", label: "Cut Off Post" },
    { key: "target_start_hang", label: "Target Hang" },
    { key: "truck_arrival", label: "Truck Arrival" },
    { key: "receiving", label: "Receiving" },
    { key: "actual_start_hang", label: "Actual Hang" },
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
      <PageHeader title="Production Schedule" subtitle="Daily slaughter schedules"
        action={<Button onClick={openCreate}>+ Add Schedule</Button>} />
      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={records} />}
      </Card>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Add Production Schedule" : "Edit Schedule"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Date" value={form.date} onChange={f("date")} type="date" required style={{ gridColumn: "1 / -1" }} />
            <Input label="Heads" value={form.heads} onChange={f("heads")} type="number" style={{ gridColumn: "1 / -1" }} />
            <Input label="Call Time (HH:MM)" value={form.call_time} onChange={f("call_time")} placeholder="06:00" />
            <Input label="Cut Off Post (HH:MM)" value={form.cut_off_post} onChange={f("cut_off_post")} placeholder="07:00" />
            <Input label="Target Start Hang (HH:MM)" value={form.target_start_hang} onChange={f("target_start_hang")} placeholder="07:30" />
            <Input label="Truck Arrival (HH:MM)" value={form.truck_arrival} onChange={f("truck_arrival")} placeholder="05:00" />
            <Input label="Receiving (HH:MM)" value={form.receiving} onChange={f("receiving")} placeholder="05:30" />
            <Input label="Actual Start Hang (HH:MM)" value={form.actual_start_hang} onChange={f("actual_start_hang")} placeholder="07:45" />
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
