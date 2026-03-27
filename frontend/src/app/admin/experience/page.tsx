"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Field, Input, Textarea, TagInput, SaveButton } from "@/components/admin/FormFields";
import { createExperience, updateExperience, deleteExperience } from "@/lib/admin-api";
import type { Experience } from "@/lib/api";

const EMPTY = { role: "", company: "", start_date: "", end_date: "", description: "", tech_stack: [] as string[] };

export default function ExperiencePage() {
  const [rows, setRows] = useState<Experience[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/experience").then((r) => r.json()).then(setRows);
  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY); setError(""); setModal("add"); }
  function openEdit(row: Experience) {
    setSelected(row);
    setForm({ role: row.role, company: row.company, start_date: row.start_date, end_date: row.end_date ?? "", description: row.description ?? "", tech_stack: row.tech_stack });
    setError(""); setModal("edit");
  }

  async function handleDelete(row: Experience) {
    if (!confirm(`Delete "${row.role} at ${row.company}"?`)) return;
    await deleteExperience(row.id); load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (modal === "edit" && selected) await updateExperience(selected.id, form);
      else await createExperience(form);
      setModal(null); load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Experience</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} total</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors">
          + Add Experience
        </button>
      </div>

      <DataTable
        rows={rows}
        onEdit={openEdit}
        onDelete={handleDelete}
        columns={[
          { header: "Role", render: (r) => <span className="font-medium text-white">{r.role}</span> },
          { header: "Company", render: (r) => <span className="text-indigo-400">{r.company}</span> },
          { header: "Period", render: (r) => <span className="text-gray-400 text-xs">{r.start_date} — {r.end_date}</span> },
        ]}
      />

      {modal && (
        <Modal title={modal === "add" ? "Add Experience" : "Edit Experience"} onClose={() => setModal(null)}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Role"><Input required value={form.role} onChange={(e) => set("role", e.target.value)} /></Field>
            <Field label="Company"><Input required value={form.company} onChange={(e) => set("company", e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start (YYYY-MM)"><Input required placeholder="2023-06" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} /></Field>
              <Field label="End (blank = Present)"><Input placeholder="2024-01" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} /></Field>
            </div>
            <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Tech Stack"><TagInput value={form.tech_stack} onChange={(v) => set("tech_stack", v)} /></Field>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <SaveButton loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
