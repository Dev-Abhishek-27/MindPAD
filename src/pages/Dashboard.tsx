import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  FileText, 
  Star, 
  Clock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Sparkles,
  Music,
  File as FileIcon,
  ArrowRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { getSignedUrl, deleteFile } from '../lib/storage';

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [notes, setNotes] = useState<(Note & { 
    signedImageUrl?: string | null,
    signedPdfUrl?: string | null,
    signedAudioUrl?: string | null
  })[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const path = location.pathname;
  const isNotesPage = path === '/notes';

  useEffect(() => {
    fetchNotes();
    if (user) {
      fetchProfile();
    }
  }, [path, user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setUserName(data.full_name);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch signed URLs for notes with images, pdfs, and audios
      const notesWithUrls = await Promise.all((data || []).map(async (note) => {
        const result: any = { ...note };
        
        if (note.image_url) {
          try {
            result.signedImageUrl = await getSignedUrl('app-files', note.image_url);
          } catch (e) {
            console.error('Error fetching signed image URL:', e);
          }
        }

        if (note.pdf_url) {
          try {
            result.signedPdfUrl = await getSignedUrl('app-files', note.pdf_url);
          } catch (e) {
            console.error('Error fetching signed pdf URL:', e);
          }
        }

        if (note.audio_url) {
          try {
            result.signedAudioUrl = await getSignedUrl('app-files', note.audio_url);
          } catch (e) {
            console.error('Error fetching signed audio URL:', e);
          }
        }
        
        return result;
      }));

      setNotes(notesWithUrls);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const noteToDelete = notes.find(n => n.id === id);
      
      // Delete files from storage if they exist
      if (noteToDelete) {
        if (noteToDelete.image_url) await deleteFile('app-files', noteToDelete.image_url);
        if (noteToDelete.pdf_url) await deleteFile('app-files', noteToDelete.pdf_url);
        if (noteToDelete.audio_url) await deleteFile('app-files', noteToDelete.audio_url);
      }

      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      setNotes(notes.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete note');
    }
  };

  const stats = [
    { icon: FileText, label: 'Total Notes', count: notes.length, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Clock, label: 'Recent Notes', count: notes.filter(n => {
      const diff = Date.now() - new Date(n.created_at).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }).length, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Welcome, {userName || user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">
            Your personal workspace to capture ideas, organize notes, and think clearly. 
            Start by creating your first note or explore your existing ones.
          </p>
          <Link 
            to="/create"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Create New Note
          </Link>
        </div>
        <div className="w-64 h-64 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <FileText className="w-32 h-32 text-emerald-200" />
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {isNotesPage ? 'All Notes' : 'Recent Notes'}
          </h2>
          {!isNotesPage && (
            <Link to="/notes" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No notes yet</h3>
            <p className="text-slate-500 mb-6">Capture your first thought and see it appear here.</p>
            <Link to="/create" className="text-emerald-600 font-bold hover:underline">Create your first note</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(path === '/' ? notes.slice(0, 6) : notes).map((note, i) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/edit/${note.id}`} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {note.signedImageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-slate-50 border border-slate-100">
                    <img 
                      src={note.signedImageUrl} 
                      alt={note.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{note.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4">{note.content}</p>
                
                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                  {note.signedPdfUrl && (
                    <a 
                      href={note.signedPdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-50 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="View PDF"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileIcon className="w-4 h-4" />
                    </a>
                  )}
                  {note.signedAudioUrl && (
                    <button 
                      className="p-2 bg-slate-50 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="Play Audio"
                      onClick={(e) => {
                        e.stopPropagation();
                        const audio = new Audio(note.signedAudioUrl!);
                        audio.play();
                      }}
                    >
                      <Music className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
