/**
 * ============================================================
 * ADMIN — SPONSORSHIP GALLERY MANAGEMENT PAGE
 * ============================================================
 * Purpose: Allows admins to fully manage the Human Claw Machine
 * photo gallery displayed on the public Sponsorship page.
 *
 * Features:
 *  - View all gallery images in a responsive grid
 *  - Add new images (URL or base64 file upload)
 *  - Edit image URL and description
 *  - Set any image as the main hero image
 *  - Delete images
 *  - Reorder images via sort_order field
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Trash2, Edit, X, Star, Image as ImageIcon,
  Camera, MoveUp, MoveDown, Eye
} from 'lucide-react';
import { API_BASE_URL as API } from '../../config';

// =============================
// SUB-COMPONENTS
// =============================

/**
 * GALLERY CARD
 * ------------
 * Displays a single gallery image with action buttons.
 */
const GalleryCard = ({ img, onDelete, onEdit, onSetMain }) => (
  <div className="premium-card group overflow-hidden">
    {/* Image preview */}
    <div className="relative h-48 bg-slate-100 overflow-hidden">
      {img.image_url ? (
        <img
          src={img.image_url}
          alt={img.description || 'Gallery image'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-300">
          <ImageIcon className="w-12 h-12" />
        </div>
      )}

      {/* Main image badge */}
      {img.is_main === 1 && (
        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-3 h-3" fill="currentColor" />
          Main
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        {/* Set as main */}
        <button
          onClick={() => onSetMain(img.id)}
          title={img.is_main ? 'Already main image' : 'Set as main image'}
          className={`p-1.5 backdrop-blur shadow-xl rounded-lg transition-colors ${
            img.is_main
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-white/90 text-slate-400 hover:text-yellow-500'
          }`}
        >
          <Star className="w-3.5 h-3.5" fill={img.is_main ? 'currentColor' : 'none'} />
        </button>
        {/* Edit */}
        <button
          onClick={() => onEdit(img)}
          className="p-1.5 bg-white/90 backdrop-blur shadow-xl rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        {/* Delete */}
        <button
          onClick={() => onDelete(img.id)}
          className="p-1.5 bg-white/90 backdrop-blur shadow-xl rounded-lg text-slate-600 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Description */}
    <div className="p-4">
      <p className="text-sm text-slate-600 leading-snug line-clamp-2 min-h-[2.5rem]">
        {img.description || (
          <span className="text-slate-300 italic">No description</span>
        )}
      </p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Order: {img.sort_order}
        </span>
        <a
          href={img.image_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors"
        >
          <Eye className="w-3 h-3" /> Preview
        </a>
      </div>
    </div>
  </div>
);

// =============================
// MAIN COMPONENT
// =============================

const SponsorshipGallery = () => {
  // ── STATE ──
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImg, setEditingImg] = useState(null);
  const [saving, setSaving] = useState(false);

  /** Form fields */
  const [form, setForm] = useState({
    image_url: '',
    description: '',
    sort_order: 0,
    is_main: false,
  });

  // ── DATA FETCHING ──
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = () => {
    setLoading(true);
    axios
      .get(`${API}/sponsorship/gallery`)
      .then((res) => {
        setImages(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        setImages([]);
        setLoading(false);
      });
  };

  // ── FILE UPLOAD (base64) ──
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ── FORM SUBMIT (Add / Edit) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image_url.trim()) {
      alert('Please provide an image URL or upload a file.');
      return;
    }
    setSaving(true);
    try {
      if (editingImg) {
        await axios.put(`${API}/sponsorship/gallery/${editingImg.id}`, form);
      } else {
        await axios.post(`${API}/sponsorship/gallery`, form);
      }
      fetchImages();
      resetForm();
    } catch (err) {
      alert('Error saving image: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image from the gallery?')) return;
    try {
      await axios.delete(`${API}/sponsorship/gallery/${id}`);
      fetchImages();
    } catch (err) {
      alert('Error deleting image');
    }
  };

  // ── SET MAIN ──
  const handleSetMain = async (id) => {
    try {
      await axios.put(`${API}/sponsorship/gallery/${id}/main`);
      fetchImages();
    } catch (err) {
      alert('Error setting main image');
    }
  };

  // ── EDIT ──
  const handleEdit = (img) => {
    setEditingImg(img);
    setForm({
      image_url: img.image_url || '',
      description: img.description || '',
      sort_order: img.sort_order || 0,
      is_main: img.is_main === 1,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── RESET FORM ──
  const resetForm = () => {
    setShowForm(false);
    setEditingImg(null);
    setForm({ image_url: '', description: '', sort_order: 0, is_main: false });
  };

  // ── RENDER ──
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0f172a] tracking-tighter uppercase leading-none">
            Sponsorship Gallery
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Managing {images.length} image{images.length !== 1 ? 's' : ''} in the Human Claw Machine gallery.
            <span className="ml-2 text-yellow-600 font-bold">★ = Main hero image</span>
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-navy group flex items-center gap-3"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add Image
        </button>
      </div>

      {/* ── ADD / EDIT FORM ── */}
      {showForm && (
        <div className="premium-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {editingImg ? 'Edit Gallery Image' : 'Add New Gallery Image'}
            </h3>
            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Image URL */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
                  Image URL
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="https://example.com/image.jpg"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>

              {/* File upload (alternative) */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Camera className="w-3 h-3" /> Or Upload File
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
                  />
                  {form.image_url && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
                      <img
                        src={form.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  className="premium-input resize-none"
                  rows={3}
                  placeholder="Describe what's happening in this photo..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Sort order */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
                  Sort Order (lower = shown first)
                </label>
                <input
                  type="number"
                  min="0"
                  className="premium-input"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Is main toggle */}
              <div className="space-y-2 flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      form.is_main ? 'bg-yellow-400' : 'bg-slate-200'
                    }`}
                    onClick={() => setForm({ ...form, is_main: !form.is_main })}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        form.is_main ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-black text-slate-600 uppercase tracking-widest">
                    Set as Main Hero Image
                  </span>
                </label>
                <p className="text-xs text-slate-400 ml-1">
                  The main image appears large at the top of the gallery section.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="btn-navy w-full flex items-center justify-center gap-3"
            >
              {saving ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {editingImg ? 'Update Image' : 'Add to Gallery'}
            </button>
          </form>
        </div>
      )}

      {/* ── GALLERY GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="premium-card overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="premium-card p-16 text-center">
          <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
            No gallery images yet. Add your first image above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <GalleryCard
              key={img.id}
              img={img}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onSetMain={handleSetMain}
            />
          ))}
        </div>
      )}

      {/* ── USAGE HINT ── */}
      <div className="premium-card p-6 bg-blue-50 border-blue-100">
        <h4 className="text-sm font-black text-blue-800 uppercase tracking-widest mb-2">
          How the Gallery Works
        </h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>The image marked with ★ appears as the large hero image on the Sponsorship page.</li>
          <li>All other images appear as clickable thumbnails below the main image.</li>
          <li>Use Sort Order to control the display sequence (0 = first).</li>
          <li>Visitors can click any image to open a full-screen lightbox viewer.</li>
          <li>Each image has its own description shown in the lightbox and on hover.</li>
        </ul>
      </div>
    </div>
  );
};

export default SponsorshipGallery;
