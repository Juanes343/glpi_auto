import Card from '../components/Card';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Bienvenido al Portal GLPI</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Crear caso</h2>
          <p className="text-sm text-slate-500">
            Registra una nueva incidencia o solicitud en GLPI seleccionando entidad,
            solicitante, tipo y descripción del caso.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Casos nuevos</h2>
          <p className="text-sm text-slate-500">
            Visualiza y exporta todos los tickets que se encuentran en estado
            <strong className="text-amber-600"> Nuevo</strong> en GLPI.
          </p>
        </Card>
      </div>
    </div>
  );
}
