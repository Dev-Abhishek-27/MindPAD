export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  image_url: string | null;
  pdf_url: string | null;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  updated_at: string;
}

export type NoteInsert = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type NoteUpdate = Partial<NoteInsert>;
