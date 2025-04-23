"use client";
import React, { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 6; // 2 rows x 3 columns

  // State for editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user) {
      // Cập nhật username khi đã có session
      setUsername(session.user.name || session.user.email || "User");
    }
  }, [status, session, router]);

  // Fetch notes from API
  useEffect(() => {
    // Chỉ tải dữ liệu khi đã xác thực
    if (status !== "authenticated" || !session?.user?.id) return;

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/notes?userId=${session.user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        const data = await response.json();
        setNotes(data);
        toast.success('Notes loaded successfully');
      } catch (err: any) {
        console.error('Error fetching notes:', err);
        setError(err.message || 'An error occurred while fetching notes');
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [status, session]);

  // Convert API note to UI format
  const convertNoteForUI = (note: Note) => {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      color: note.content.includes('color:') 
        ? note.content.split('color:')[1].split(';')[0].trim()
        : getRandomColor(),
      date: new Date(note.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).replace(",", ""),
      isStarred: note.content.includes('starred:true'),
      user_id: note.user_id
    };
  };

  // Filter notes based on search term, starred status
  const filteredNotes = notes.map(convertNoteForUI).filter(
    (note) => (
      (note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       note.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showStarredOnly || note.isStarred)
    )
  );

  // Calculate current notes to display
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showStarredOnly]);

  // Generate a random color
  const getRandomColor = () => {
    return noteColors[Math.floor(Math.random() * noteColors.length)];
  };

  // Save note function
  const saveNote = async (id: string | null, title: string, content: string) => {
    if (title.trim() === "" && content.trim() === "") return;
    
    // Đảm bảo người dùng đã đăng nhập
    if (!session?.user?.id) {
      toast.error('You must be logged in to save notes');
      return;
    }
    
    try {
      const color = getRandomColor();
      const contentWithMetadata = `${content}; color:${color}`;

      if (id === null) {
        // Create new note
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || 'Untitled Note',
            content: contentWithMetadata,
            user_id: session.user.id
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create note');
        }
        
        const newNote = await response.json();
        setNotes(prevNotes => [...prevNotes, newNote]);
        toast.success('Note created successfully!');
      } else {
        // Update existing note
        const existingNote = notes.find(note => note.id === id);
        if (!existingNote) return;

        // Preserve metadata like color and starred status
        let updatedContent = content;
        if (existingNote.content.includes('color:')) {
          const colorMatch = existingNote.content.match(/color:([^;]+)/);
          if (colorMatch) {
            updatedContent = `${content}; color:${colorMatch[1]}`;
          }
        }
        
        // Check if note is starred
        const isStarred = existingNote.content.includes('starred:true');
        if (isStarred) {
          updatedContent = `${updatedContent}; starred:true`;
        }

        const response = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || existingNote.title,
            content: updatedContent
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update note');
        }
        
        const updatedNote = await response.json();
        setNotes(prevNotes => 
          prevNotes.map(note => note.id === id ? updatedNote : note)
        );
        toast.info('Note updated!');
      }

      // Reset editing state
      setEditingNoteId(null);
      setEditTitle("");
      setEditContent("");
      setIsNewNoteBlank(true);
    } catch (err: any) {
      console.error('Error saving note:', err);
      setError(err.message || 'An error occurred while saving the note');
      toast.error('Failed to save note');
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
    if (content.includes(';')) {
      cleanContent = content.split(';')[0].trim();
    }
    setEditContent(cleanContent);
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      
      setNotes(notes.filter(note => note.id !== id));
      toast.success('Note deleted successfully!');
      
      if (currentNotes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(err.message || 'An error occurred while deleting the note');
      toast.error('Failed to delete note');
    }
  };

  // Toggle star status
  const toggleStar = async (id: string) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      
      const isCurrentlyStarred = note.content.includes('starred:true');
      
      // Update content with new starred status
      let updatedContent = note.content;
      if (isCurrentlyStarred) {
        updatedContent = updatedContent.replace('starred:true', 'starred:false');
      } else {
        updatedContent = `${updatedContent}; starred:true`;
      }
      
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: updatedContent
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
      
      const updatedNote = await response.json();
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      
      toast.info(isCurrentlyStarred ? 'Note unmarked' : 'Note marked with star');
    } catch (err: any) {
      console.error('Error toggling star:', err);
      setError(err.message || 'An error occurred while updating the note');
      toast.error('Failed to update note');
    }
  };

  // Change page
  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle logout
  const handleLogout = () => {
    // Implement logout logic here using NextAuth
    router.push("/api/auth/signout");
    toast.info('Đã đăng xuất');
  };

  // Add a new blank note
  const addNewBlankNote = () => {
    setIsNewNoteBlank(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* User sidebar toggle */}
      <div
        className="fixed top-10 left-10 z-10 "
        onMouseEnter={() => setSidebarOpen(true)}
      >
        <button className="bg-gray-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M12 12a4 4 0 100-8 4 4 0 000 8z"
            />
          </svg>
        </button>
      </div>

      {/* Slidable sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-20 transition-all duration-300 ${
          sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0"
        }`}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="p-6">
          <div className="mb-8 pt-8">
            <h2 className="text-xl text-black font-semibold">Xin chào</h2>
            <p className="text-gray-700 font-medium">{username}</p>
          </div>

          <hr className="my-6" />

          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`flex cursor-pointer items-center w-full px-3 py-2 rounded-md ${
                  showStarredOnly
                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    : "text-gray-700 hover:bg-gray-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={showStarredOnly ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {showStarredOnly ? "Hiện tất cả" : "Có gắn dấu sao"}
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center cursor-pointer w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-300"
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
                  className="mr-3"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 ml-0">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8 mt-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Notes</h1>

            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 px-4 rounded-md border border-gray-300 shadow-sm focus:shadow-md focus:none focus:outline-none text-black"
              />
              <svg
                className="absolute right-3 top-2.5 text-gray-800 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
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
                {/* Add New Note Card */}
                <div
                  className="rounded-lg shadow-sm min-h-40 p-5 relative group flex flex-col border-2 border-dashed border-gray-300 bg-white"
                >
                  {(!isNewNoteBlank && editingNoteId === null) ? (
                    // Editing mode for new note
                    <>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 mb-2 focus:outline-none text-gray-800 font-medium"
                        placeholder="Title"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-full min-h-32 bg-transparent resize-none border-none focus:outline-none text-gray-800 font-medium"
                        autoFocus
                        placeholder="Type your note here..."
                      />
                      <div className="flex justify-end mt-4 gap-2">
                        <button
                          onClick={() => {
                            setIsNewNoteBlank(true);
                            setEditTitle("");
                            setEditContent("");
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveNote(null, editTitle, editContent)}
                          className="px-3 py-1 bg-gray-900 text-white rounded"
                        >
                          Save
                        </button>
                      </div>
                    </>
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

                {/* Notes from API */}
                {currentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg shadow-sm min-h-40 p-5 relative group flex flex-col"
                    style={{ backgroundColor: note.color }}
                  >
                    {editingNoteId === note.id ? (
                      // Editing mode
                      <>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-transparent border-b border-gray-300 mb-2 focus:outline-none text-gray-800 font-medium"
                          placeholder="Title"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-full min-h-32 bg-transparent resize-none border-none focus:outline-none text-gray-800 font-medium"
                          autoFocus
                          placeholder="Type your note here..."
                        />
                        <div className="flex justify-end mt-4 gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveNote(note.id, editTitle, editContent)}
                            className="px-3 py-1 bg-gray-900 text-white rounded"
                          >
                            Save
                          </button>
                        </div>
                      </>
                    ) : (
                      // Display mode
                      <>
                        {/* Edit button (pencil icon) */}
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

                        {/* Delete button - Moving from top-left to top-right next to the star button */}
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
                          {note.content.includes(';') ? 
                            note.content.split(';')[0].trim() : 
                            note.content}
                        </p>

                        {/* Date at bottom */}
                        <p className="text-gray-700 text-sm mt-4">
                          {note.date}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Show message when no notes */}
              {currentNotes.length === 0 && !loading && (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">No notes found</p>
                  {searchTerm && (
                    <p className="text-gray-500">
                      No results for "{searchTerm}". Try a different search term.
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => changePage(number)}
                        className={`mx-1 px-3 py-1 rounded ${
                          currentPage === number
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesApp;
