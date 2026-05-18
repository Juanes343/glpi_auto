import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',              label: 'Inicio' },
  { to: '/crear-caso',    label: 'Crear caso' },
  { to: '/casos-nuevos',  label: 'Casos nuevos' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700">
        <p className="text-xs uppercase tracking-widest text-slate-400">Menú</p>
      </div>
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
