'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Search,
  Star,
  Eye,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  category: 'Campus Facilities' | 'Spiritual & Tahfeez' | 'Sports & Events' | 'Classrooms';
  image_url?: string;
  imageUrl?: string;
  caption: string;
  date_added?: string;
  dateAdded?: string;
  is_featured?: boolean;
  isFeatured?: boolean;
  file_size?: string;
  fileSize?: string;
}

export default function AdminCmsMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MediaItem['category']>('Campus Facilities');
  const [newCaption, setNewCaption] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newFeatured, setNewFeatured] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'mims/gallery');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setNewImageUrl(data.url);
        showToast('Image uploaded successfully to Cloudinary!');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Network error uploading file');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/media');
      const data = await res.json();
      if (data.media) {
        setMediaList(
          data.media.map((m: any) => ({
            ...m,
            imageUrl: m.image_url ?? m.imageUrl ?? '/images/hero-bg.jpg',
            dateAdded: m.date_added ?? m.dateAdded ?? 'Oct 2026',
            isFeatured: m.is_featured ?? m.isFeatured ?? false,
            fileSize: m.file_size ?? m.fileSize ?? '1.2 MB',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const openUploadModal = () => {
    setNewTitle('');
    setNewCaption('');
    setNewImageUrl('');
    setImagePreview(null);
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!newImageUrl) {
      alert('Please upload a photo asset first.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: newTitle,
        category: newCategory,
        image_url: newImageUrl,
        caption: newCaption || newTitle,
        date_added: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        is_featured: newFeatured,
        file_size: '1.2 MB',
      };

      const res = await fetch('/api/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`Media asset "${newTitle}" saved to live database!`);
        setIsUploadModalOpen(false);
        setNewTitle('');
        setNewCaption('');
        fetchMedia();
      } else {
        showToast('Failed to save media.');
      }
    } catch (err) {
      showToast('Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media asset from the campus gallery?')) return;

    try {
      const res = await fetch(`/api/cms/media?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
        showToast('Media asset removed from database.');
      } else {
        showToast('Failed to delete media asset.');
      }
    } catch (err) {
      showToast('Error communicating with database.');
    }
  };

  const filtered = mediaList.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.caption.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Visual Media CMS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Media & Campus Gallery Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload and update campus photography, laboratory suites, mosque facilities, and event galleries in the database.
          </p>
        </div>

        <button
          onClick={openUploadModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {/* Gallery Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Photos</span>
          <div className="text-2xl font-black text-white mt-1">{mediaList.length} Assets</div>
          <span className="text-[10px] text-emerald-400 mt-1 inline-block">Database Assets</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Facilities</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {mediaList.filter((m) => m.category === 'Campus Facilities').length}
          </div>
          <span className="text-[10px] text-blue-300/80 mt-1 inline-block">Labs, ICT & Library</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Spiritual</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {mediaList.filter((m) => m.category === 'Spiritual & Tahfeez').length}
          </div>
          <span className="text-[10px] text-emerald-300/80 mt-1 inline-block">Mosque & Walimah</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Featured on Home</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {mediaList.filter((m) => m.isFeatured).length}
          </div>
          <span className="text-[10px] text-amber-300/80 mt-1 inline-block">Virtual Tour Showcase</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gallery assets by title or caption..."
            className="w-full pl-10 pr-4 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0D1527] border border-[#213357] text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Campus Facilities">Campus Facilities</option>
            <option value="Spiritual & Tahfeez">Spiritual & Tahfeez</option>
            <option value="Sports & Events">Sports & Events</option>
            <option value="Classrooms">Classrooms & Academics</option>
          </select>
        </div>
      </div>

      {/* Loading & Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading media from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-[#111C33] border border-[#1E2E50] rounded-2xl p-8">
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h4 className="text-white font-bold text-sm">No Media Assets Uploaded</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are currently zero photos or facility banners in the database. Click the button above to upload campus imagery.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            <Upload className="w-4 h-4" /> Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#2C416E] transition group"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-video w-full bg-[#090E1A] overflow-hidden">
                <Image
                  src={item.imageUrl || '/images/hero-bg.jpg'}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white border border-white/20 backdrop-blur-sm">
                  {item.category}
                </span>

                {item.isFeatured && (
                  <span className="absolute top-3 right-3 p-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm" title="Featured">
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}
              </div>

              {/* Media Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug group-hover:text-emerald-400 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1E2E50] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{item.dateAdded}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMedia(item)}
                      title="View Photo"
                      className="p-1 rounded text-slate-400 hover:text-white transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete Asset"
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E50]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload Media Asset</h3>
                <p className="text-xs text-slate-400">
                  Publish campus photography and facility imagery to the database.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Asset Title & Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultra-Modern Physics Laboratory"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MediaItem['category'])}
                  className="w-full px-3 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Campus Facilities">Campus Facilities</option>
                  <option value="Spiritual & Tahfeez">Spiritual & Tahfeez</option>
                  <option value="Sports & Events">Sports & Events</option>
                  <option value="Classrooms">Classrooms & Academics</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Upload Media Photograph
                </label>

                {imagePreview || newImageUrl ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-[#0D1527] p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border border-[#213357] shrink-0">
                        <img
                          src={imagePreview || newImageUrl}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading to Cloudinary...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Photo Uploaded &amp; Ready</span>
                            </>
                          )}
                        </span>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[200px]">
                          {newImageUrl || 'Processing image file...'}
                        </p>
                      </div>
                    </div>

                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#182645] hover:bg-[#203259] text-slate-200 text-xs font-semibold border border-[#273B66] shrink-0">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#213357] hover:border-emerald-500/50 rounded-xl bg-[#0D1527]/60 hover:bg-[#0D1527] transition group">
                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-white mt-2">
                      {uploadingImage ? 'Uploading image...' : 'Click to Upload Campus Photo'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PNG, JPG, WebP up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Caption & Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe this facility or event..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newFeatured"
                  checked={newFeatured}
                  onChange={(e) => setNewFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-[#213357] bg-[#0D1527]"
                />
                <label htmlFor="newFeatured" className="text-xs font-medium text-slate-300">
                  Feature in Virtual Tour / Homepage Carousel
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Save Media</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 z-10 text-white bg-black/60 hover:bg-black/90 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-video w-full">
              <Image
                src={previewMedia.imageUrl || '/images/hero-bg.jpg'}
                alt={previewMedia.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {previewMedia.category}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{previewMedia.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{previewMedia.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
