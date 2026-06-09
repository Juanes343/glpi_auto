import { useEffect, useState } from 'react';
import {
  getEntities,
  getCategories,
  getRequestersByEntity,
  createTicket,
} from '../services/glpiService';
import Alert from '../components/Alert';
import Card from '../components/Card';
import Loading from '../components/Loading';
import SearchableSelect from '../components/SearchableSelect';
import TextField from '../components/TextField';

const EMPTY_FORM = {
  entity_id:    '',
  requester_id: '',
  type:         '1',
  category_id:  '',
  title:        '',
  description:  '',
};

export default function CreateTicket() {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [entities, setEntities]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [requesters, setRequesters] = useState([]);

  const [loadingPage, setLoadingPage]       = useState(true);
  const [loadingReq, setLoadingReq]         = useState(false);
  const [submitting, setSubmitting]         = useState(false);

  const [alert, setAlert] = useState({ type: '', message: '' });

  // Carga inicial de entidades y categorías
  useEffect(() => {
    Promise.all([getEntities(), getCategories()])
      .then(([ents, cats]) => {
        setEntities(ents);
        setCategories(cats);
      })
      .catch(() =>
        setAlert({ type: 'error', message: 'Error cargando entidades o categorías.' })
      )
      .finally(() => setLoadingPage(false));
  }, []);

  // Carga de solicitantes al cambiar entidad
  useEffect(() => {
    if (!form.entity_id) {
      setRequesters([]);
      setForm((f) => ({ ...f, requester_id: '' }));
      return;
    }

    setLoadingReq(true);
    setForm((f) => ({ ...f, requester_id: '' }));

    getRequestersByEntity(form.entity_id)
      .then(setRequesters)
      .catch(() =>
        setAlert({ type: 'error', message: 'Error cargando solicitantes de la entidad.' })
      )
      .finally(() => setLoadingReq(false));
  }, [form.entity_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });
    setSubmitting(true);

    const requesterId = parseInt(form.requester_id, 10);
    if (!form.requester_id || isNaN(requesterId) || requesterId <= 0) {
      setAlert({ type: 'error', message: 'Selecciona un solicitante válido de la lista.' });
      setSubmitting(false);
      return;
    }

    try {
      const result = await createTicket({
        entity_id:    Number(form.entity_id),
        requester_id: requesterId,
        type:         Number(form.type),
        category_id:  form.category_id ? Number(form.category_id) : null,
        title:        form.title,
        description:  form.description,
      });

      setAlert({
        type:    'success',
        message: result.message ?? `Caso creado correctamente. ID: ${result.data?.id}`,
      });
      setForm(EMPTY_FORM);
      setRequesters([]);
    } catch (err) {
      const msg = err.response?.data?.error
        ?? err.response?.data?.message
        ?? 'Error creando el caso. Intente nuevamente.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) return <Loading text="Cargando formulario..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Crear caso en GLPI</h1>

      {alert.message && <Alert type={alert.type} message={alert.message} />}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchableSelect
            label="Entidad"
            name="entity_id"
            value={form.entity_id}
            onChange={handleChange}
            options={entities}
            placeholder="Escribe para buscar entidad..."
            required
          />

          {loadingReq && <Loading text="Cargando solicitantes..." />}

          <SearchableSelect
            label="Solicitante"
            name="requester_id"
            value={form.requester_id}
            onChange={handleChange}
            options={requesters.map((r) => ({
              id:   r.id,
              name: r.email ? `${r.name} — ${r.email}` : r.name,
            }))}
            placeholder={
              form.entity_id
                ? 'Escribe para buscar solicitante...'
                : 'Primero seleccione una entidad'
            }
            disabled={!form.entity_id || loadingReq}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SearchableSelect
              label="Tipo"
              name="type"
              value={form.type}
              onChange={handleChange}
              options={[
                { id: '1', name: 'Incidencia' },
                { id: '2', name: 'Solicitud' },
              ]}
              placeholder="Seleccione tipo..."
              required
            />

            <SearchableSelect
              label="Categoría"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              options={categories}
              placeholder="Sin categoría (opcional)"
            />
          </div>

          <TextField
            label="Título"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ejemplo: Usuario no puede acceder al sistema"
            required
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe el caso, usuario afectado, sede, equipo, error presentado, teléfono de contacto, etc."
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {submitting ? 'Creando caso...' : '+ Crear caso'}
          </button>
        </form>
      </Card>
    </div>
  );
}
