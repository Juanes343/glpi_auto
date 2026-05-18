import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa — solo en móvil */}
        <button
          onClick={onMenuClick}
          className="text-slate-600 hover:text-slate-900 md:hidden p-1 rounded transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <span className="text-lg font-bold text-slate-800 hidden sm:block">Portal GLPI</span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-slate-600 truncate max-w-[200px]">
            {user.name || user.username}
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}
