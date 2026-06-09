import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',              label: 'Inicio' },
  { to: '/crear-caso',    label: 'Crear caso' },
  { to: '/casos-nuevos',  label: 'Casos nuevos' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30
        w-60 min-h-screen bg-slate-900 text-white flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-slate-400">Menú</p>
        {/* Botón cerrar — solo visible en móvil */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white md:hidden p-1 rounded transition-colors"
          aria-label="Cerrar menú"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-4 flex-1">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
