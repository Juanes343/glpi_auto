import { useEffect, useState } from 'react';
import { getNewTickets, exportNewTicketsCsv } from '../services/glpiService';
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
  const [data, setData]         = useState({ total: 0, tickets: [] });
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [alert, setAlert]       = useState({ type: '', message: '' });

  const fetchTickets = () => {
    setLoading(true);
    setAlert({ type: '', message: '' });

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Casos nuevos</h1>
          {!loading && (
            <p className="text-sm text-slate-500 mt-0.5">
              {data.total} caso{data.total !== 1 ? 's' : ''} en estado Nuevo
            </p>
          )}
        </div>

        <div className="flex gap-2">
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
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tickets.map((ticket, i) => (
                  <tr key={ticket.id ?? i} className="hover:bg-slate-50 transition-colors">
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
    </div>
  );
}
