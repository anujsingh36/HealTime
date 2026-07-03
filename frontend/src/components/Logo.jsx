export function Logo({ size = 32 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft" style={{width:size,height:size}}>
        <svg viewBox="0 0 24 24" width={size*0.6} height={size*0.6} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h2l1.5-3 3 6 1.5-3h2"/></svg>
      </div>
      <span className="font-display font-extrabold text-lg tracking-tight">HealTime</span>
    </div>
  );
}
