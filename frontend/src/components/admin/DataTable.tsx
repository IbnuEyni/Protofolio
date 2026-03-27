"use client";

export type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
};

export default function DataTable<T extends { id: number }>({
  columns,
  rows,
  onEdit,
  onDelete,
}: {
  columns: Column<T>[];
  rows: T[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}) {
  if (rows.length === 0)
    return <p className="text-gray-500 text-sm py-8 text-center">No records yet.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/60">
            {columns.map((c) => (
              <th key={c.header} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {c.header}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                i === rows.length - 1 ? "border-b-0" : ""
              }`}
            >
              {columns.map((c) => (
                <td key={c.header} className="px-4 py-3 text-gray-300">
                  {c.render(row)}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(row)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-red-900/40 hover:bg-red-900/70 text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
