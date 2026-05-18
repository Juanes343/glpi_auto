const typeMap = {
  success: 'bg-green-50 border border-green-300 text-green-800',
  error:   'bg-red-50 border border-red-300 text-red-800',
  info:    'bg-blue-50 border border-blue-300 text-blue-800',
};

export default function Alert({ type = 'info', message }) {
  if (!message) return null;

  return (
    <div className={`rounded-xl px-4 py-3 text-sm ${typeMap[type] ?? typeMap.info}`}>
      {message}
    </div>
  );
}
