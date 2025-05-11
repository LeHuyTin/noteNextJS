"use client";
import React, { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Import components
import Sidebar from "@/components/notes/Sidebar";
import SearchBar from "@/components/notes/SearchBar";
import NewNoteCard from "@/components/notes/NewNoteCard";
import NoteCard from "@/components/notes/NoteCard";
import Pagination from "@/components/notes/Pagination";

const NotesApp = () => {
  const noteColors = ["#ff9f7f", "#ffcc7f", "#d8b4fe", "#80deea", "#e6ee9c"];
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  const [notes, setNotes] = useState<any[]>([]);
  const [isNewNoteBlank, setIsNewNoteBlank] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 6;

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showStarredOnly]);

  useEffect(() => {
    
    if (status === "loading") return;
    if (status === "unauthenticated" || !session) {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      setUsername(session.user.name || session.user.email || "User");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/notes?userId=${session.user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        const data = await response.json();
        setNotes(data);
        toast.success("Notes loaded successfully");
      } catch (err: any) {
        console.error("Error fetching notes:", err);
        setError(err.message || "An error occurred while fetching notes");
        toast.error("Failed to load notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-700">Đang xác thực...</p>
      </div>
    );
  }

  const convertNoteForUI = (note: Note) => {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      color: note.content.includes("color:")
        ? note.content.split("color:")[1].split(";")[0].trim()
        : getRandomColor(),
      date: new Date(note.created_at)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .replace(",", ""),
      isStarred: note.content.includes("starred:true"),
      user_id: note.user_id,
    };
  };

  const filteredNotes = notes
    .map(convertNoteForUI)
    .filter(
      (note) =>
        (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!showStarredOnly || note.isStarred)
    );

  // Calculate current notes to display
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  // Generate a random color
  const getRandomColor = () => {
    return noteColors[Math.floor(Math.random() * noteColors.length)];
  };

  const saveNote = async (
    id: string | null,
    title: string,
    content: string
  ) => {
    if (title.trim() === "" && content.trim() === "") 
    {
      setIsNewNoteBlank(true);
      toast.error("Please enter a title or content");
      return;
    }
      
    if (!session?.user?.id) {
      toast.error("You must be logged in to save notes");
      router.replace("/login");
      return;
    }

    try {
      const color = getRandomColor();
      const contentWithMetadata = `${content}; color:${color}`;

      if (id === null) {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || "Untitled Note",
            content: contentWithMetadata,
            user_id: session.user.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create note");
        }

        const newNote = await response.json();
        setNotes((prevNotes) => [...prevNotes, newNote]);
        toast.success("Note created successfully!");
      } else {
        // Update existing note
        const existingNote = notes.find((note) => note.id === id);
        if (!existingNote) return;

        // Preserve metadata like color and starred status
        let updatedContent = content;
        if (existingNote.content.includes("color:")) {
          const colorMatch = existingNote.content.match(/color:([^;]+)/);
          if (colorMatch) {
            updatedContent = `${content}; color:${colorMatch[1]}`;
          }
        }

        // Check if note is starred
        const isStarred = existingNote.content.includes("starred:true");
        if (isStarred) {
          updatedContent = `${updatedContent}; starred:true`;
        }

        const response = await fetch(`/api/notes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || existingNote.title,
            content: updatedContent,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update note");
        }

        const updatedNote = await response.json();
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === id ? updatedNote : note))
        );
        toast.info("Note updated!");
      }

      setEditingNoteId(null);
      setEditTitle("");
      setEditContent("");
      setIsNewNoteBlank(true);
    } catch (err: any) {
      console.error("Error saving note:", err);
      setError(err.message || "An error occurred while saving the note");
      toast.error("Failed to save note");
    }
  };

  // Start editing a note
  const startEditing = (id: string | null, title: string, content: string) => {
    if (id === null) {
      setIsNewNoteBlank(false);
    }

    setEditingNoteId(id);
    setEditTitle(title);

    // Remove metadata from content
    let cleanContent = content;
    if (content.includes(";")) {
      cleanContent = content.split(";")[0].trim();
    }
    setEditContent(cleanContent);
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes(notes.filter((note) => note.id !== id));
      toast.success("Note deleted successfully!");

      if (currentNotes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      console.error("Error deleting note:", err);
      setError(err.message || "An error occurred while deleting the note");
      toast.error("Failed to delete note");
    }
  };

  const toggleStar = async (id: string) => {
    try {
      const note = notes.find((n) => n.id === id);
      if (!note) return;

      const isCurrentlyStarred = note.content.includes("starred:true");

      // Update content with new starred status
      let updatedContent = note.content;
      if (isCurrentlyStarred) {
        updatedContent = updatedContent.replace(
          "starred:true",
          "starred:false"
        );
      } else {
        updatedContent = `${updatedContent}; starred:true`;
      }

      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: updatedContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      const updatedNote = await response.json();
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === id ? updatedNote : note))
      );

      toast.info(
        isCurrentlyStarred ? "Note unmarked" : "Note marked with star"
      );
    } catch (err: any) {
      console.error("Error toggling star:", err);
      setError(err.message || "An error occurred while updating the note");
      toast.error("Failed to update note");
    }
  };

  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <Sidebar
        username={username}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showStarredOnly={showStarredOnly}
        setShowStarredOnly={setShowStarredOnly}
      />

      {/* Main content */}
      <div className="flex-1 p-8 ml-0">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8 mt-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Notes</h1>

            {/* Search bar component */}
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
              <button
                className="text-red-600 underline mt-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Note Card Component */}
                <NewNoteCard
                  isNewNoteBlank={isNewNoteBlank}
                  editingNoteId={editingNoteId}
                  editTitle={editTitle}
                  editContent={editContent}
                  setEditTitle={setEditTitle}
                  setEditContent={setEditContent}
                  setIsNewNoteBlank={setIsNewNoteBlank}
                  startEditing={startEditing}
                  saveNote={saveNote}
                />

                {/* Notes Cards Components */}
                {currentNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    editingNoteId={editingNoteId}
                    editTitle={editTitle}
                    editContent={editContent}
                    setEditTitle={setEditTitle}
                    setEditContent={setEditContent}
                    setEditingNoteId={setEditingNoteId}
                    startEditing={startEditing}
                    saveNote={saveNote}
                    deleteNote={deleteNote}
                    toggleStar={toggleStar}
                  />
                ))}
              </div>

              {currentNotes.length === 0 && !loading && (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">No notes found</p>
                  {searchTerm && (
                    <p className="text-gray-500">
                      No results for "{searchTerm}". Try a different search
                      term.
                    </p>
                  )}
                  {showStarredOnly && (
                    <button
                      onClick={() => setShowStarredOnly(false)}
                      className="mt-4 text-gray-700 underline"
                    >
                      Show all notes
                    </button>
                  )}
                </div>
              )}

              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                changePage={changePage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesApp;
