import { NextRequest, NextResponse } from 'next/server';
import { createNote, getNotes } from '@/utils/notesUtils';
import { NoteInput } from '@/types/note';

export async function GET(request: NextRequest) {
  try {
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const notes = await getNotes(userId);
    return NextResponse.json(notes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    
    if (!body.title || !body.content || !body.user_id) {
      return NextResponse.json(
        { error: 'Title, content, and user_id are required fields' },
        { status: 400 }
      );
    }

    const noteInput: NoteInput = {
      title: body.title,
      content: body.content,
      user_id: body.user_id
    };

    const newNote = await createNote(noteInput);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create note' },
      { status: 500 }
    );
  }
}