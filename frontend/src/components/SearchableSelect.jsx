import { useState, useEffect, useRef } from 'react';

/**
 * Select con búsqueda tipo buscador.
 * - Escribe para filtrar opciones.
 * - Obligatorio seleccionar de la lista; no acepta texto libre.
 * - Compatible con el handleChange existente ({target: {name, value}}).
 */
export default function SearchableSelect({
  label,
  name,
  value,
  onChange,
  options   = [],
  required  = false,
  disabled  = false,
  placeholder = 'Buscar...',
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const containerRef      = useRef(null);

  const selected = options.find((o) => String(o.id) === String(value));

  // Texto visible en el input
  const displayText = open ? query : (selected?.name ?? '');

  // Filtrar según lo que escribe
  const filtered = query.trim()
    ? options.filter((o) =>
        (o.name ?? o.label ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (option) => {
    onChange({ target: { name, value: String(option.id) } });
    setQuery('');
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    // Si borra todo el texto, limpia la selección
    if (!e.target.value) {
      onChange({ target: { name, value: '' } });
    }
  };

  const handleFocus = () => {
    setQuery('');
    setOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
    if (e.key === 'Enter' && filtered.length === 1) {
      e.preventDefault();
      handleSelect(filtered[0]);
    }
  };

  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      {/* Label */}
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={displayText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full border border-slate-300 rounded-xl px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none select-none text-xs">
          {open ? '▴' : '▾'}
        </span>
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-400 text-center">
              Sin resultados para &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((option) => (
              <li
                key={option.id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(option); }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  String(value) === String(option.id)
                    ? 'bg-amber-50 text-amber-700 font-medium'
                    : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                {option.name ?? option.label}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Input oculto para validación de formulario nativo */}
      {required && (
        <input
          type="text"
          className="opacity-0 absolute h-0 w-0 pointer-events-none"
          value={value}
          onChange={() => {}}
          required
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
