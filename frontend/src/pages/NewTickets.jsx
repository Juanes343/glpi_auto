import { useEffect, useState } from 'react';
import { getNewTickets, exportNewTicketsCsv, bulkReplyTickets } from '../services/glpiService';
import Alert from '../components/Alert';
import Card from '../components/Card';
import Loading from '../components/Loading';

const COLUMNS = [
  { key: 'id',                   label: 'ID' },
  { key: 'title',                label: 'Título' },
  { key: 'entity',               label: 'Entidad' },
  { key: 'status',               label: 'Estado' },
  { key: 'opening_date',         label: 'Apertura' },
  { key: 'last_update',          label: 'Última act.' },
  { key: 'priority',             label: 'Prioridad' },
  { key: 'requester',            label: 'Solicitante' },
  { key: 'assigned_technician',  label: 'Técnico' },
  { key: 'category',             label: 'Categoría' },
];

export default function NewTickets() {
  const [data, setData]           = useState({ total: 0, tickets: [] });
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [alert, setAlert]         = useState({ type: '', message: '' });
  const [selected, setSelected]   = useState(new Set());
  const [modal, setModal]         = useState({
    open: false, content: '', submitting: false, result: null,
  });

  const fetchTickets = () => {
    setLoading(true);
    setAlert({ type: '', message: '' });
    setSelected(new Set());

    getNewTickets()
      .then(setData)
      .catch(() =>
        setAlert({ type: 'error', message: 'Error consultando los casos nuevos.' })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportNewTicketsCsv();
    } catch {
      setAlert({ type: 'error', message: 'Error exportando el CSV.' });
    } finally {
      setExporting(false);
    }
  };

  // ── Selección ──────────────────────────────────────────────────────────────
  const allIds      = data.tickets.map((t) => t.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(allIds));

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Modal ──────────────────────────────────────────────────────────────────
  const openModal  = () => setModal({ open: true, content: '', submitting: false, result: null });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modal.content.trim()) return;
    setModal((m) => ({ ...m, submitting: true, result: null }));
    try {
      const res = await bulkReplyTickets([...selected], modal.content.trim());
      setModal((m) => ({ ...m, submitting: false, result: res }));
    } catch {
      setModal((m) => ({
        ...m,
        submitting: false,
        result: { ok: false, message: 'Error de conexión al enviar las respuestas.' },
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Casos nuevos</h1>
          {!loading && (
            <p className="text-sm text-slate-500 mt-0.5">
              {data.total} caso{data.total !== 1 ? 's' : ''} en estado Nuevo
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {selected.size > 0 && (
            <button
              onClick={openModal}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              💬 Responder {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
            </button>
          )}

          <button
            onClick={fetchTickets}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {loading ? 'Cargando...' : '↻ Refrescar'}
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {exporting ? 'Exportando...' : '⬇ Exportar CSV'}
          </button>
        </div>
      </div>

      {alert.message && <Alert type={alert.type} message={alert.message} />}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Loading text="Consultando casos nuevos en GLPI..." />
          </div>
        ) : data.tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No hay casos en estado Nuevo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded cursor-pointer"
                      title="Seleccionar todos"
                    />
                  </th>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tickets.map((ticket, i) => (
                  <tr
                    key={ticket.id ?? i}
                    onClick={() => toggleOne(ticket.id)}
                    className={`cursor-pointer transition-colors ${
                      selected.has(ticket.id) ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(ticket.id)}
                        onChange={() => toggleOne(ticket.id)}
                        className="rounded cursor-pointer"
                      />
                    </td>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {ticket[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de respuesta masiva */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                Responder {selected.size} caso{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Se agregará un seguimiento sin cambiar el estado del caso en GLPI.
              </p>
            </div>

            {modal.result ? (
              <div className="p-6 space-y-4">
                <div className={`p-4 rounded-xl text-sm font-medium ${
                  modal.result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {modal.result.message ?? modal.result.error}
                </div>
                {modal.result.results && (
                  <ul className="max-h-48 overflow-y-auto text-xs text-slate-600 space-y-1 border border-slate-100 rounded-xl p-3">
                    {modal.result.results.map((r) => (
                      <li key={r.ticket_id} className={r.ok ? 'text-green-700' : 'text-red-600'}>
                        {r.ok ? '✓' : '✗'} Caso #{r.ticket_id}{r.message ? ` — ${r.message}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit}>
                <div className="p-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Respuesta general
                  </label>
                  <textarea
                    rows={6}
                    value={modal.content}
                    onChange={(e) => setModal((m) => ({ ...m, content: e.target.value }))}
                    placeholder="Escribe la respuesta que se enviará a todos los casos seleccionados..."
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                    required
                    disabled={modal.submitting}
                    autoFocus
                  />
                </div>
                <div className="px-6 pb-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={modal.submitting}
                    className="border border-slate-300 text-slate-700 text-sm font-semibold px-5 py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={modal.submitting || !modal.content.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
                  >
                    {modal.submitting
                      ? 'Enviando...'
                      : `Enviar a ${selected.size} caso${selected.size !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
