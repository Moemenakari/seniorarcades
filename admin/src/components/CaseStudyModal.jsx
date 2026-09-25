/**
 * ============================================================
 * CASE STUDY MODAL
 * ============================================================
 * Lets an admin turn an event into a public case study on the
 * website: the place name to show, how many people attended, and
 * which games were used.
 *
 * The event appears on the site only once all three are filled.
 * Nothing else about the event is published — not its name, the
 * client, the phone number or any money figure.
 * ============================================================
 */

import React, { useEffect, useState } from 'react';
import { X, Globe, Check } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../config';

export function CaseStudyModal({ event, onClose }) {
  const [place, setPlace] = useState('');
  const [attendance, setAttendance] = useState('');
  const [selected, setSelected] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      axios.get(`${API}/events/${event.id}/case-study`),
      axios.get(`${API}/products`),
    ])
      .then(([caseRes, gamesRes]) => {
        if (ignore) return;
        setPlace(caseRes.data.case_study_place || '');
        setAttendance(caseRes.data.attendance ?? '');
        setSelected(caseRes.data.product_ids || []);
        setGames(gamesRes.data || []);
      })
      .catch(() => { if (!ignore) setMessage({ type: 'error', text: 'Could not load this event.' }); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [event.id]);

  const toggleGame = (id) => {
    setSelected(current => current.includes(id) ? current.filter(g => g !== id) : [...current, id]);
  };

  const isComplete = place.trim() !== '' && Number(attendance) > 0 && selected.length > 0;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await axios.put(`${API}/events/${event.id}/case-study`, {
        case_study_place: place,
        attendance: attendance === '' ? '' : Number(attendance),
        product_ids: selected,
      });
      setMessage(res.data.public
        ? { type: 'success', text: 'Saved. It will show on the website after the next "Publish to Google".' }
        : { type: 'info', text: 'Saved, but not public yet: it needs a place, attendance and at least one game.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Could not save.' });
    } finally {
      setSaving(false);
    }
  };

  const messageColors = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" /> Case Study
            </h2>
            <p className="text-sm text-slate-500 mt-1">{event.event_name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="p-6 space-y-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              Shown on the website only when all three are filled. The event name, client,
              phone and money figures are never shown.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Place shown on the website</label>
              <input type="text" maxLength={80} className="premium-input" placeholder="e.g. Amioun, Koura"
                value={place} onChange={e => setPlace(e.target.value)} />
              <p className="text-xs text-slate-400">A town or area, not a client's name.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Attendance</label>
              <input type="number" min="1" step="1" className="premium-input" placeholder="e.g. 300"
                value={attendance} onChange={e => setAttendance(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Games used</label>
              <div className="grid grid-cols-2 gap-2">
                {games.map(game => {
                  const id = Number(game.id);
                  const on = selected.includes(id);
                  return (
                    <button key={id} type="button" onClick={() => toggleGame(id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold text-left transition ${on ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${on ? 'bg-indigo-500' : 'border border-slate-300'}`}>
                        {on && <Check className="w-3 h-3 text-white" />}
                      </span>
                      {game.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {message && (
              <div className={`text-sm font-bold px-4 py-3 rounded-xl border ${messageColors[message.type]}`}>{message.text}</div>
            )}

            <button onClick={handleSave} disabled={saving}
              className="btn-navy w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? 'Saving…' : isComplete ? 'Save and make public' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
