import { clsx } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
export const cx = (...a) => clsx(...a);
export const fmtDate = (v) => v ? format(typeof v === 'string' ? parseISO(v) : v, 'MMM d, yyyy · h:mm a') : '';
export const fromNow = (v) => v ? formatDistanceToNow(typeof v === 'string' ? parseISO(v) : v, { addSuffix: true }) : '';
export const initials = (name='') => name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
