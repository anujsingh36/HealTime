import { Inbox } from 'lucide-react';
export function Empty({ icon: Icon = Inbox, title, hint }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-ink-100 grid place-items-center mb-4">
        <Icon className="w-7 h-7 text-ink-900/60" />
      </div>
      <h3 className="font-semibold text-ink-950">{title}</h3>
      {hint && <p className="text-sm text-ink-900/60 mt-1 max-w-sm mx-auto">{hint}</p>}
    </div>
  );
}
