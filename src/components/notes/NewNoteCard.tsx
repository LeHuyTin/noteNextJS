import React from "react";
import EditNoteForm from "./EditNoteForm";

interface NewNoteCardProps {
  isNewNoteBlank: boolean;
  editingNoteId: string | null;
  editTitle: string;
  editContent: string;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  setIsNewNoteBlank: (isBlank: boolean) => void;
  startEditing: (id: string | null, title: string, content: string) => void;
  saveNote: (id: string | null, title: string, content: string) => void;
}

const NewNoteCard: React.FC<NewNoteCardProps> = ({
  isNewNoteBlank,
  editingNoteId,
  editTitle,
  editContent,
  setEditTitle,
  setEditContent,
  setIsNewNoteBlank,
  startEditing,
  saveNote,
}) => {
  return (
    <div className="rounded-lg shadow-sm min-h-40 p-5 relative group flex flex-col border-2 border-dashed border-gray-300 bg-white">
      {!isNewNoteBlank && editingNoteId === null ? (
        // Edit form mode
        <EditNoteForm
          id={null}
          title={editTitle}
          content={editContent}
          setTitle={setEditTitle}
          setContent={setEditContent}
          onSave={() => saveNote(null, editTitle, editContent)}
          onCancel={() => {
            setIsNewNoteBlank(true);
            setEditTitle("");
            setEditContent("");
          }}
        />
      ) : (
        // Add new note button
        <div
          className="flex items-center justify-center h-full cursor-pointer"
          onClick={() => startEditing(null, "", "")}
        >
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-10 w-10 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p>Add New Note</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewNoteCard;