import { useEffect, useRef, useState } from 'react';
import { Appointments } from '../api/endpoints';

/**
 * Plays a short, attention-grabbing beep using the Web Audio API — no audio file needed,
 * so this works everywhere without bundling/loading a static asset.
 */
function playAlertSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    // Two quick ascending beeps
    [0, 0.28].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === 0 ? 740 : 988;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.3);
    });
  } catch {
    // Web Audio unsupported/blocked — silently skip; the visual popup still shows.
  }
}

/**
 * Polls the current patient's appointments in the background (on every authenticated page,
 * since they could be anywhere in the app when it's their turn) and shows a full-screen
 * "it's your turn" alert with sound the moment any appointment transitions into IN_PROGRESS.
 */
export function TurnAlertWatcher() {
  const [alertAppt, setAlertAppt] = useState(null);
  const prevStatuses = useRef({}); // appointmentId -> last known status

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const list = await Appointments.mine();
        if (cancelled) return;
        for (const a of list) {
          const prev = prevStatuses.current[a.id];
          if (prev && prev !== 'IN_PROGRESS' && a.status === 'IN_PROGRESS') {
            setAlertAppt(a);
            playAlertSound();
            if (window.Notification && Notification.permission === 'granted') {
              new Notification("It's your turn!", {
                body: `Dr. ${a.doctorName} is ready to see you now.`
              });
            }
          }
          prevStatuses.current[a.id] = a.status;
        }
      } catch {
        // transient network/auth error — just try again on the next tick
      }
    };

    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    poll();
    const t = setInterval(poll, 15000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  if (!alertAppt) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl animate-[pulse_1.5s_ease-in-out_2]">
        <div className="text-5xl mb-3">🔔</div>
        <h2 className="text-xl font-extrabold">It's your turn!</h2>
        <p className="text-ink-900/60 mt-2">
          Dr. {alertAppt.doctorName} is ready to see you now. Please head over.
        </p>
        <button onClick={() => setAlertAppt(null)} className="btn-primary mt-6 w-full">
          Got it
        </button>
      </div>
    </div>
  );
}