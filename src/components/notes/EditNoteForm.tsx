import React from "react";

interface EditNoteFormProps {
  id: string | null;
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditNoteForm: React.FC<EditNoteFormProps> = ({
  id,
  title,
  content,
  setTitle,
  setContent,
  onSave,
  onCancel,
}) => {
  return (
    <>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-transparent border-b border-gray-300 mb-2 focus:outline-none text-gray-800 font-medium"
        placeholder="Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-full min-h-32 bg-transparent resize-none border-none focus:outline-none text-gray-800 font-medium"
        autoFocus
        placeholder="Type your note here..."
      />
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1 bg-gray-900 text-white rounded"
        >
          Save
        </button>
      </div>
    </>
  );
};

export default EditNoteForm;