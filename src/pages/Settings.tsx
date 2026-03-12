import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Camera, Save, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { uploadFile, getSignedUrl, deleteFile } from '../lib/storage';
import { Profile } from '../types';

export function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        if (data.avatar_url) {
          const signedUrl = await getSignedUrl('app-files', data.avatar_url);
          setAvatarUrl(signedUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const extension = file.name.split('.').pop();
      const uuid = crypto.randomUUID();
      const path = `${user.id}/profile/avatar/${uuid}.${extension}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        await deleteFile('app-files', profile.avatar_url);
      }

      const uploadedPath = await uploadFile('app-files', path, file);
      
      // Update profile with new avatar path
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: uploadedPath,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      const signedUrl = await getSignedUrl('app-files', uploadedPath);
      setAvatarUrl(signedUrl);
      setProfile(prev => prev ? { ...prev, avatar_url: uploadedPath } : null);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url || !user) return;

    try {
      await deleteFile('app-files', profile.avatar_url);
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      setAvatarUrl(null);
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      toast.success('Avatar removed');
    } catch (error) {
      toast.error('Failed to remove avatar');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your profile and account preferences.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center overflow-hidden shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-16 h-16 text-emerald-200" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30 cursor-pointer hover:bg-emerald-400 transition-all hover:scale-110">
                <Camera className="w-5 h-5" />
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
              </label>
            </div>
            {avatarUrl && (
              <button 
                onClick={handleRemoveAvatar}
                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Remove Photo
              </button>
            )}
          </div>

          <div className="h-[1px] bg-slate-100"></div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-500 font-medium cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 ml-1">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
