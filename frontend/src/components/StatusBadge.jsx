const MAP = {
  PENDING:    ['badge-amber', 'Pending'],
  CONFIRMED:  ['badge-green', 'Confirmed'],
  IN_PROGRESS:['badge-green', 'In Progress'],
  COMPLETED:  ['badge-slate', 'Completed'],
  CANCELLED:  ['badge-rose',  'Cancelled'],
  NO_SHOW:    ['badge-rose',  'No-show']
};
export function StatusBadge({ status }) {
  const [cls, label] = MAP[status] || ['badge-slate', status];
  return <span className={cls}>{label}</span>;
}
