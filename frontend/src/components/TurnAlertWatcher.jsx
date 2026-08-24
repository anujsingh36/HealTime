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
 * since they could be anywhere in the app when either alert fires) and shows a full-screen
 * popup + sound the moment:
 *  - any appointment transitions into IN_PROGRESS ("it's your turn"), or
 *  - the backend marks an appointment's `leaveNotified` flag true ("time to leave" — this one
 *    matters even more, since the patient is likely away from the app/clinic when it fires).
 */
export function TurnAlertWatcher() {
  const [alert, setAlert] = useState(null); // { kind: 'turn' | 'leave', appt }
  const prevStatuses = useRef({});   // appointmentId -> last known status
  const prevLeaveFlags = useRef({}); // appointmentId -> last known leaveNotified

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const list = await Appointments.mine();
        if (cancelled) return;
        for (const a of list) {
          const prevStatus = prevStatuses.current[a.id];
          const prevLeave = prevLeaveFlags.current[a.id];

          if (prevStatus && prevStatus !== 'IN_PROGRESS' && a.status === 'IN_PROGRESS') {
            setAlert({ kind: 'turn', appt: a });
            playAlertSound();
            notifyBrowser("It's your turn!", `Dr. ${a.doctorName} is ready to see you now.`);
          } else if (prevLeave === false && a.leaveNotified === true) {
            setAlert({ kind: 'leave', appt: a });
            playAlertSound();
            notifyBrowser('Time to leave!', `Head out now to reach Dr. ${a.doctorName}'s clinic on time.`);
          }

          prevStatuses.current[a.id] = a.status;
          prevLeaveFlags.current[a.id] = a.leaveNotified;
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

  if (!alert) return null;
  const isLeave = alert.kind === 'leave';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl animate-[pulse_1.5s_ease-in-out_2]">
        <div className="text-5xl mb-3">{isLeave ? '🚗' : '🔔'}</div>
        <h2 className="text-xl font-extrabold">{isLeave ? 'Time to leave!' : "It's your turn!"}</h2>
        <p className="text-ink-900/60 mt-2">
          {isLeave
            ? `Head out now to reach Dr. ${alert.appt.doctorName}'s clinic on time.`
            : `Dr. ${alert.appt.doctorName} is ready to see you now. Please head over.`}
        </p>
        <button onClick={() => setAlert(null)} className="btn-primary mt-6 w-full">
          Got it
        </button>
      </div>
    </div>
  );
}

function notifyBrowser(title, body) {
  if (window.Notification && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}