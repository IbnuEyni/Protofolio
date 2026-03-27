"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Field, Input, Textarea, TagInput, SaveButton } from "@/components/admin/FormFields";
import { createProject, updateProject, deleteProject } from "@/lib/admin-api";
import type { Project } from "@/lib/api";

const EMPTY = { title: "", description: "", tech_stack: [] as string[], url: "", github_url: "", featured: false };

export default function ProjectsPage() {
  const [rows, setRows] = useState<Project[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/projects").then((r) => r.json()).then(setRows);
  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY); setError(""); setModal("add"); }
  function openEdit(row: Project) {
    setSelected(row);
    setForm({ title: row.title, description: row.description ?? "", tech_stack: row.tech_stack, url: row.url ?? "", github_url: row.github_url ?? "", featured: row.featured });
    setError("");
    setModal("edit");
  }

  async function handleDelete(row: Project) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    await deleteProject(row.id);
    load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (modal === "edit" && selected) await updateProject(selected.id, form);
      else await createProject(form);
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
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} total</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors">
          + Add Project
        </button>
      </div>

      <DataTable
        rows={rows}
        onEdit={openEdit}
        onDelete={handleDelete}
        columns={[
          { header: "Title", render: (r) => <span className="font-medium text-white">{r.title}</span> },
          { header: "Stack", render: (r) => <span className="text-gray-400 text-xs">{r.tech_stack.slice(0, 3).join(", ")}{r.tech_stack.length > 3 ? "…" : ""}</span> },
          { header: "Featured", render: (r) => <span className={`px-2 py-0.5 rounded-full text-xs ${r.featured ? "bg-indigo-900/50 text-indigo-300" : "bg-gray-800 text-gray-500"}`}>{r.featured ? "Yes" : "No"}</span> },
        ]}
      />

      {modal && (
        <Modal title={modal === "add" ? "Add Project" : "Edit Project"} onClose={() => setModal(null)}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Title"><Input required value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Tech Stack"><TagInput value={form.tech_stack} onChange={(v) => set("tech_stack", v)} /></Field>
            <Field label="Live URL"><Input type="url" value={form.url} onChange={(e) => set("url", e.target.value)} /></Field>
            <Field label="GitHub URL"><Input type="url" value={form.github_url} onChange={(e) => set("github_url", e.target.value)} /></Field>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-indigo-500 w-4 h-4" />
              Featured project
            </label>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <SaveButton loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
