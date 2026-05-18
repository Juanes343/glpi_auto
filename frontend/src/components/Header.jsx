import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <span className="text-lg font-bold text-slate-800">Portal GLPI</span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user.name || user.username}
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}
