export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <span className="text-lg font-bold text-slate-800">Portal GLPI</span>
      </div>
    </header>
  );
}
