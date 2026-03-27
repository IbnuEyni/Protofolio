"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Field, Input, SaveButton } from "@/components/admin/FormFields";
import { createCertification, updateCertification, deleteCertification } from "@/lib/admin-api";
import type { Certification } from "@/lib/api";

const EMPTY = { title: "", issuer: "", issued_date: "", url: "" };

export default function CertificationsPage() {
  const [rows, setRows] = useState<Certification[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Certification | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/certifications").then((r) => r.json()).then(setRows);
  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY); setError(""); setModal("add"); }
  function openEdit(row: Certification) {
    setSelected(row);
    setForm({ title: row.title, issuer: row.issuer ?? "", issued_date: row.issued_date ?? "", url: row.url ?? "" });
    setError(""); setModal("edit");
  }

  async function handleDelete(row: Certification) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    await deleteCertification(row.id); load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (modal === "edit" && selected) await updateCertification(selected.id, form);
      else await createCertification(form);
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
          <h1 className="text-2xl font-bold text-white">Certifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} total</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors">
          + Add Certification
        </button>
      </div>

      <DataTable
        rows={rows}
        onEdit={openEdit}
        onDelete={handleDelete}
        columns={[
          { header: "Title", render: (r) => <span className="font-medium text-white">{r.title}</span> },
          { header: "Issuer", render: (r) => <span className="text-indigo-400">{r.issuer}</span> },
          { header: "Date", render: (r) => <span className="text-gray-400 text-xs">{r.issued_date}</span> },
        ]}
      />

      {modal && (
        <Modal title={modal === "add" ? "Add Certification" : "Edit Certification"} onClose={() => setModal(null)}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Title"><Input required value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Issuer"><Input value={form.issuer} onChange={(e) => set("issuer", e.target.value)} /></Field>
            <Field label="Issued Date (YYYY-MM)"><Input placeholder="2023-11" value={form.issued_date} onChange={(e) => set("issued_date", e.target.value)} /></Field>
            <Field label="Certificate URL"><Input type="url" value={form.url} onChange={(e) => set("url", e.target.value)} /></Field>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <SaveButton loading={loading} />
          </form>
        </Modal>
      )}
    </div>
  );
}
