import React from "react";
import EditNoteForm from "./EditNoteForm";

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    color: string;
    date: string;
    isStarred: boolean;
  };
  editingNoteId: string | null;
  editTitle: string;
  editContent: string;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  setEditingNoteId: (id: string | null) => void;
  startEditing: (id: string, title: string, content: string) => void;
  saveNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  toggleStar: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  editingNoteId,
  editTitle,
  editContent,
  setEditTitle,
  setEditContent,
  setEditingNoteId,
  startEditing,
  saveNote,
  deleteNote,
  toggleStar,
}) => {
  return (
    <div
      className="rounded-lg shadow-sm min-h-40 p-5 relative group flex flex-col"
      style={{ backgroundColor: note.color }}
    >
      {editingNoteId === note.id ? (
        // Editing mode
        <EditNoteForm
          id={note.id}
          title={editTitle}
          content={editContent}
          setTitle={setEditTitle}
          setContent={setEditContent}
          onSave={() => saveNote(note.id, editTitle, editContent)}
          onCancel={() => setEditingNoteId(null)}
        />
      ) : (
        // Display mode
        <>
          <button
            onClick={() => startEditing(note.id, note.title, note.content)}
            className="absolute right-3 bottom-3 bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </button>

          {/* Star button */}
          <button
            onClick={() => toggleStar(note.id)}
            className={`absolute right-3 top-3 ${
              note.isStarred
                ? "text-yellow-400 bg-gray-800"
                : "text-white bg-gray-900"
            } rounded-full w-8 h-8 flex items-center justify-center ${
              note.isStarred
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } transition-opacity`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={note.isStarred ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>

          <button
            onClick={() => deleteNote(note.id)}
            className="absolute right-14 top-3 bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>

          <h3 className="font-bold text-gray-800 mb-2 mt-5">{note.title}</h3>
          <p
            className="text-gray-800 font-medium flex-1 cursor-pointer"
            onClick={() => startEditing(note.id, note.title, note.content)}
          >
            {note.content.includes(";")
              ? note.content.split(";")[0].trim()
              : note.content}
          </p>

          <p className="text-gray-700 text-sm mt-4">{note.date}</p>
        </>
      )}
    </div>
  );
};

export default NoteCard;