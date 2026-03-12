import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Save, 
  ArrowLeft, 
  Tag as TagIcon, 
  Sparkles, 
  X,
  Type,
  AlignLeft,
  Brain,
  FileText,
  Music,
  Plus,
  Image as ImageIcon,
  Trash2,
  File as FileIcon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Note } from '../types';
import { uploadFile, getSignedUrl, deleteFile } from '../lib/storage';

export function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setContent(data.content);
        if (data.image_url) {
          const signedUrl = await getSignedUrl('app-files', data.image_url);
          setImageUrl(signedUrl);
        }
        setImagePath(data.image_url);

        if (data.pdf_url) {
          const signedUrl = await getSignedUrl('app-files', data.pdf_url);
          setPdfUrl(signedUrl);
        }
        setPdfPath(data.pdf_url);

        if (data.audio_url) {
          const signedUrl = await getSignedUrl('app-files', data.audio_url);
          setAudioUrl(signedUrl);
        }
        setAudioPath(data.audio_url);
      }
    } catch (error) {
      toast.error('Failed to load note');
      navigate('/');
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const extension = file.name.split('.').pop();
      const uuid = crypto.randomUUID();
      const featureName = 'notes';
      const itemId = id || 'new';
      const path = `${user.id}/${featureName}/${itemId}/${uuid}.${extension}`;

      const uploadedPath = await uploadFile('app-files', path, file);
      setImagePath(uploadedPath);
      const signedUrl = await getSignedUrl('app-files', uploadedPath);
      setImageUrl(signedUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.message === 'Failed to fetch' 
        ? 'Connection failed. Please check your Supabase URL and Key in Settings.'
        : `Upload failed: ${error.message || 'Unknown error'}`;
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!imagePath) return;

    try {
      await deleteFile('app-files', imagePath);
      setImagePath(null);
      setImageUrl(null);
      toast.success('Image removed');
    } catch (error) {
      toast.error('Failed to remove image');
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const extension = file.name.split('.').pop();
      const uuid = crypto.randomUUID();
      const featureName = 'notes';
      const itemId = id || 'new';
      const path = `${user.id}/${featureName}/${itemId}/pdf_${uuid}.${extension}`;

      const uploadedPath = await uploadFile('app-files', path, file);
      setPdfPath(uploadedPath);
      const signedUrl = await getSignedUrl('app-files', uploadedPath);
      setPdfUrl(signedUrl);
      toast.success('PDF uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.message === 'Failed to fetch' 
        ? 'Connection failed. Please check your Supabase URL and Key in Settings.'
        : `Upload failed: ${error.message || 'Unknown error'}`;
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePdf = async () => {
    if (!pdfPath) return;
    try {
      await deleteFile('app-files', pdfPath);
      setPdfPath(null);
      setPdfUrl(null);
      toast.success('PDF removed');
    } catch (error) {
      toast.error('Failed to remove PDF');
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const extension = file.name.split('.').pop();
      const uuid = crypto.randomUUID();
      const featureName = 'notes';
      const itemId = id || 'new';
      const path = `${user.id}/${featureName}/${itemId}/audio_${uuid}.${extension}`;

      const uploadedPath = await uploadFile('app-files', path, file);
      setAudioPath(uploadedPath);
      const signedUrl = await getSignedUrl('app-files', uploadedPath);
      setAudioUrl(signedUrl);
      toast.success('Audio uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.message === 'Failed to fetch' 
        ? 'Connection failed. Please check your Supabase URL and Key in Settings.'
        : `Upload failed: ${error.message || 'Unknown error'}`;
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAudio = async () => {
    if (!audioPath) return;
    try {
      await deleteFile('app-files', audioPath);
      setAudioPath(null);
      setAudioUrl(null);
      toast.success('Audio removed');
    } catch (error) {
      toast.error('Failed to remove audio');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        title,
        content,
        image_url: imagePath,
        pdf_url: pdfPath,
        audio_url: audioPath,
        tags: [],
        is_favorite: false,
        user_id: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Note updated successfully');
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([noteData]);
        if (error) throw error;
        toast.success('Note created successfully');
      }
      navigate('/');
    } catch (error) {
      console.error('Save note error:', error);
      toast.error('Failed to save note. Please check if your database schema is updated.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>

      {/* Editor Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-8 space-y-6">
          {/* Cover Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <ImageIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Cover Image</span>
              </div>
              
              {imageUrl ? (
                <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                  <img 
                    src={imageUrl} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <label className="p-2 bg-white text-slate-900 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                    <button 
                      onClick={handleRemoveImage}
                      className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 mb-2" />
                    <p className="text-sm text-slate-500 group-hover:text-emerald-600 font-medium text-center px-2">
                      {uploading ? 'Uploading...' : 'Add Cover Image'}
                    </p>
                  </div>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <FileIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">PDF Document</span>
              </div>
              
              {pdfUrl ? (
                <div className="relative group rounded-2xl p-4 bg-slate-50 border border-slate-200 h-32 flex flex-col items-center justify-center">
                  <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-500 truncate w-full text-center">PDF Attached</p>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-2xl">
                    <a 
                      href={pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-white text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </a>
                    <button 
                      onClick={handleRemovePdf}
                      className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 mb-2" />
                    <p className="text-sm text-slate-500 group-hover:text-emerald-600 font-medium text-center px-2">
                      {uploading ? 'Uploading...' : 'Add PDF'}
                    </p>
                  </div>
                  <input type="file" className="hidden" onChange={handlePdfUpload} accept="application/pdf" />
                </label>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Music className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Audio File</span>
              </div>
              
              {audioUrl ? (
                <div className="relative group rounded-2xl p-4 bg-slate-50 border border-slate-200 h-32 flex flex-col items-center justify-center">
                  <Music className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-500 truncate w-full text-center">Audio Attached</p>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-2xl">
                    <audio src={audioUrl} className="hidden" />
                    <button 
                      onClick={() => {
                        const audio = new Audio(audioUrl);
                        audio.play();
                      }}
                      className="p-2 bg-white text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Music className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleRemoveAudio}
                      className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 mb-2" />
                    <p className="text-sm text-slate-500 group-hover:text-emerald-600 font-medium text-center px-2">
                      {uploading ? 'Uploading...' : 'Add Audio'}
                    </p>
                  </div>
                  <input type="file" className="hidden" onChange={handleAudioUpload} accept="audio/*" />
                </label>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Type className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Title</span>
            </div>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full text-3xl font-bold text-slate-900 placeholder:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="h-[1px] bg-slate-100"></div>

          {/* Content Area */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <AlignLeft className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Content</span>
            </div>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="w-full min-h-[400px] text-slate-700 leading-relaxed placeholder:text-slate-200 focus:outline-none resize-none"
            ></textarea>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
