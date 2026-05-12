import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { EyeOff, Trash2, Star } from 'lucide-react';
import { API_BASE_URL as API } from '../../config';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
};

const Ratings = () => {
  const [stats, setStats] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [platformRatings, setPlatformRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/ratings/admin/list`);
      setStats(res.data.stats || []);
      setRatings(res.data.ratings || []);
      setPlatformRatings(res.data.platformRatings || []);
    } catch (error) {
      alert('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const toggleHide = async (id) => {
    await axios.patch(`${API}/ratings/admin/${id}/hide`);
    fetchRatings();
  };

  const deleteRating = async (id) => {
    if (!window.confirm('Delete this rating permanently?')) return;
    await axios.delete(`${API}/ratings/admin/${id}`);
    fetchRatings();
  };

  if (loading) return <div className="text-slate-500 font-bold">Loading ratings...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Rating Management</h2>
        <p className="text-slate-500 mt-2">Track product ratings, website ratings, and who submitted each rating.</p>
      </div>

      <div className="premium-card p-6">
        <h3 className="text-lg font-black text-slate-800 mb-4">Product Rating Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-3">Product</th>
                <th className="pb-3">Ratings Count</th>
                <th className="pb-3">Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((item) => (
                <tr key={item.product_id} className="border-t border-slate-100">
                  <td className="py-3 font-bold text-slate-800">{item.product_name}</td>
                  <td className="py-3">{item.ratings_count || 0}</td>
                  <td className="py-3">{item.average_rating || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="premium-card p-6">
        <h3 className="text-lg font-black text-slate-800 mb-4">Product Ratings</h3>
        <div className="space-y-3">
          {ratings.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-black text-slate-800">{r.product_name}</p>
                <p className="text-sm text-slate-500">
                  By {r.user_name} ({r.user_phone || 'No phone'}) - {formatDate(r.created_at)}
                </p>
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" /> {r.rating}/5
                </p>
                {r.review ? <p className="text-sm text-slate-700 mt-2">{r.review}</p> : null}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleHide(r.id)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 flex items-center gap-2">
                  <EyeOff className="w-4 h-4" /> {r.is_hidden ? 'Unhide' : 'Hide'}
                </button>
                <button onClick={() => deleteRating(r.id)} className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
          {ratings.length === 0 ? <p className="text-slate-500">No ratings yet.</p> : null}
        </div>
      </div>

      <div className="premium-card p-6">
        <h3 className="text-lg font-black text-slate-800 mb-4">Website Ratings</h3>
        <div className="space-y-3">
          {platformRatings.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-100 p-4">
              <p className="font-bold text-slate-800">{r.user_name} ({r.user_phone || 'No phone'})</p>
              <p className="text-sm text-slate-500">{formatDate(r.created_at)} - {r.rating}/5</p>
              {r.review ? <p className="text-sm text-slate-700 mt-2">{r.review}</p> : null}
            </div>
          ))}
          {platformRatings.length === 0 ? <p className="text-slate-500">No website ratings yet.</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Ratings;
