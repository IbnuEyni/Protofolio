"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Field, Input, Select, SaveButton } from "@/components/admin/FormFields";
import { createSkill, updateSkill, deleteSkill } from "@/lib/admin-api";
import type { Skill } from "@/lib/api";

const CATEGORIES = ["Language", "Framework", "AI/ML", "Database", "DevOps"];
const EMPTY = { name: "", category: "Language", proficiency: 3 };

export default function SkillsPage() {
  const [rows, setRows] = useState<Skill[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Skill | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/skills").then((r) => r.json()).then(setRows);
  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY); setError(""); setModal("add"); }
  function openEdit(row: Skill) {
    setSelected(row);
    setForm({ name: row.name, category: row.category, proficiency: row.proficiency });
    setError(""); setModal("edit");
  }

  async function handleDelete(row: Skill) {
    if (!confirm(`Delete "${row.name}"?`)) return;
    await deleteSkill(row.id); load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (modal === "edit" && selected) await updateSkill(selected.id, form);
      else await createSkill(form);
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
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} total</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors">
          + Add Skill
        </button>
      </div>

      <DataTable
        rows={rows}
        onEdit={openEdit}
        onDelete={handleDelete}
        columns={[
          { header: "Name", render: (r) => <span className="font-medium text-white">{r.name}</span> },
          { header: "Category", render: (r) => <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">{r.category}</span> },
          { header: "Proficiency", render: (r) => (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < r.proficiency ? "bg-indigo-500" : "bg-gray-700"}`} />
              ))}
            </div>
          )},
        ]}
      />

      {modal && (
        <Modal title={modal === "add" ? "Add Skill" : "Edit Skill"} onClose={() => setModal(null)}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Name"><Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label={`Proficiency: ${form.proficiency}/5`}>
              <input type="range" min={1} max={5} value={form.proficiency} onChange={(e) => set("proficiency", Number(e.target.value))} className="w-full accent-indigo-500" />
            </Field>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <SaveButton loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
