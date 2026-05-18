import client from '../api/client';

export const getEntities = () =>
  client.get('/glpi/entities').then((r) => r.data.data ?? []);

export const getCategories = () =>
  client.get('/glpi/categories').then((r) => r.data.data ?? []);

export const getRequestersByEntity = (entityId) =>
  client.get('/glpi/requesters', { params: { entity_id: entityId } }).then((r) => r.data.data ?? []);

export const createTicket = (data) =>
  client.post('/glpi/tickets', data).then((r) => r.data);

export const getNewTickets = () =>
  client.get('/glpi/tickets/new').then((r) => r.data.data ?? { total: 0, tickets: [] });

export const exportNewTicketsCsv = () =>
  client.get('/glpi/tickets/new/export', { responseType: 'blob' }).then((r) => {
    const contentDisposition = r.headers['content-disposition'] ?? '';
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `tickets_nuevos_glpi_${Date.now()}.csv`;

    const url = window.URL.createObjectURL(new Blob([r.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });
