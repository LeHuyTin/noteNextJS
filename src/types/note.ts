export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type NoteInput = Omit<Note, 'id' | 'created_at' | 'updated_at'>;