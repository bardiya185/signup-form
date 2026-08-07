import { db, nextId } from '../db';
import { err404, err422 } from '../errors';
import { toTicketDto } from '../resources';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

export interface TicketCreateInput {
  department: D.TicketDepartment;
  subject: string;
  priority: D.TicketPriority;
  order_id?: number;
  message: string;
  attachments?: string[];
}

export function listUserTickets(user: D.User, status: D.TicketStatus | undefined, page: number, perPage: number) {
  let list = db.tickets.filter((t) => t.user_id === user.id);
  if (status) list = list.filter((t) => t.status === status);
  list = [...list].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
  return {
    items: list.slice((page - 1) * perPage, page * perPage).map((t) => toTicketDto(t)),
    total: list.length,
  };
}

export function createTicket(user: D.User, input: TicketCreateInput) {
  if (input.order_id != null) {
    const order = db.orders.find((o) => o.id === input.order_id && o.user_id === user.id);
    if (!order) throw err422({ order_id: ['سفارش انتخاب شده معتبر نیست'] });
  }
  const ticket: D.Ticket = {
    id: nextId(db.tickets), user_id: user.id, order_id: input.order_id ?? null,
    department: input.department, subject: input.subject,
    priority: input.priority, status: 'open',
    created_at: now(), updated_at: now(),
  };
  db.tickets.push(ticket);
  db.ticket_messages.push({
    id: nextId(db.ticket_messages), ticket_id: ticket.id, user_id: user.id,
    body: input.message, attachments: input.attachments ?? [], is_admin: false,
    created_at: now(), updated_at: now(),
  });
  return toTicketDto(ticket);
}

const findTicket = (user: D.User, id: number): D.Ticket => {
  const ticket = db.tickets.find((t) => t.id === id);
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  if (!ticket || (!isAdmin && ticket.user_id !== user.id)) throw err404('تیکت مورد نظر یافت نشد');
  return ticket;
};

export const getTicket = (user: D.User, id: number) => toTicketDto(findTicket(user, id));

export function replyToTicket(user: D.User, id: number, body: string, attachments: string[] = []) {
  const ticket = findTicket(user, id);
  if (ticket.status === 'closed') throw err422({ ticket: ['این تیکت بسته شده است'] });
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  db.ticket_messages.push({
    id: nextId(db.ticket_messages), ticket_id: ticket.id, user_id: user.id,
    body, attachments, is_admin: isAdmin, created_at: now(), updated_at: now(),
  });
  ticket.status = isAdmin ? 'answered' : 'open';
  ticket.updated_at = now();
  return toTicketDto(ticket);
}

export function closeTicket(user: D.User, id: number) {
  const ticket = findTicket(user, id);
  ticket.status = 'closed';
  ticket.updated_at = now();
  return toTicketDto(ticket);
}

// ─── ادمین ───
export function adminListTickets(filters: { status?: string; department?: string; page: number; perPage: number }) {
  let list = [...db.tickets];
  if (filters.status) list = list.filter((t) => t.status === filters.status);
  if (filters.department) list = list.filter((t) => t.department === filters.department);
  list = list.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
  return {
    items: list.slice((filters.page - 1) * filters.perPage, filters.page * filters.perPage).map((t) => toTicketDto(t)),
    total: list.length,
  };
}
