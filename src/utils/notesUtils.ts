import { Note, NoteInput } from '@/types/note';
import supabase from '@/lib/supabase/client';

const NOTES_TABLE = 'notes';

export async function getNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return data || [];
}

export async function getNoteById(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching note with ID ${id}:`, error);
    throw error;
  }

  return data;
}

export async function createNote(note: NoteInput): Promise<Note> {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .insert(note)
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }

  return data;
}

export async function updateNote(id: string, note: Partial<NoteInput>): Promise<Note> {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .update(note)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating note with ID ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from(NOTES_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting note with ID ${id}:`, error);
    throw error;
  }
}