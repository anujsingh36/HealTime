import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Notifications } from '../api/endpoints';
import { fromNow } from '../lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);

  const refresh = async () => {
    try {
      const c = await Notifications.unread();
      setCount(c.count || 0);
    } catch {}
  };
  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, []);

  const openPanel = async () => {
    setOpen(o => !o);
    if (!open) {
      try { setList(await Notifications.list()); } catch {}
    }
  };

  return (
    <div className="relative">
      <button onClick={openPanel} className="relative p-2 rounded-xl hover:bg-ink-100">
        <Bell className="w-5 h-5" />
        {count > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-coral-500"/>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl2 shadow-soft border border-ink-100 overflow-hidden z-30">
          <div className="px-4 py-3 border-b border-ink-100 font-semibold">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {list.length === 0 && <div className="p-6 text-sm text-ink-900/60 text-center">All caught up.</div>}
            {list.map(n => (
              <button key={n.id} onClick={async () => { await Notifications.markRead(n.id); refresh(); }}
                className="w-full text-left px-4 py-3 hover:bg-ink-50 border-b border-ink-100 last:border-0">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-ink-900/60">{n.body}</div>
                <div className="text-[11px] text-ink-900/50 mt-1">{fromNow(n.createdAt)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
