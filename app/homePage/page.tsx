"use client";
import React, { useState, useEffect } from "react";
import { logout } from "../login/login";

const NotesApp = () => {
  const noteColors = ["#ff9f7f", "#ffcc7f", "#d8b4fe", "#80deea", "#e6ee9c"];
  const [username, setUsername] = useState("Huy Tín"); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        const user = await res.json();
        console.log(user);
        if (user?.email) setUsername(user.email);
      } catch (err) {
        console.error("Không lấy được thông tin người dùng", err);
      }
    };

    fetchUser();
  }, []);

  // Initialize with a blank note as the first item
  const [notes, setNotes] = useState([
    {
      id: 0,
      content: "",
      color: "#ffffff",
      date: "",
      isNew: true,
      isStarred: false,
    }, // Blank note
    {
      id: 1,
      content: "This is Docket note.",
      color: "#ff9f7f",
      date: "May 20, 2023",
      isStarred: true,
    },
    {
      id: 2,
      content:
        "The beginning of screenless design: UI jobs to be taken over by Solution Architect",
      color: "#ffcc7f",
      date: "May 21, 2020",
      isStarred: false,
    },
    {
      id: 3,
      content:
        "13 Things You Should Give Up If You Want To Be a Successful UX Designer",
      color: "#ff9f7f",
      date: "May 25, 2020",
      isStarred: true,
    },
    {
      id: 4,
      content: "10 UI & UX Lessons from Designing My Own Product",
      color: "#d8b4fe",
      date: "Jun 3, 2020",
      isStarred: false,
    },
    {
      id: 5,
      content: "52 Research Terms you need to know as a UX Designer",
      color: "#e6ee9c",
      date: "Jun 10, 2020",
      isStarred: false,
    },
    {
      id: 6,
      content: "Text fields & Form design — UI components series",
      color: "#80deea",
      date: "Jun 15, 2020",
      isStarred: false,
    },
  ]);

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 6; // 2 rows x 3 columns

  // State for editing
  const [editingNoteId, setEditingNoteId] = useState(-1);
  const [editContent, setEditContent] = useState("");

  // Filter notes based on search term, starred status, and always include the new note
  const filteredNotes = notes.filter(
    (note) =>
      (note.isNew ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showStarredOnly || note.isNew || note.isStarred)
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
  const saveNote = (id: number, content: string) => {
    if (content.trim() === "") return;

    if (id === 0) {
      // This is the blank note - create a new one with random color
      const today = new Date();
      const options = {
        month: "short" as const,
        day: "numeric" as const,
        year: "numeric" as const,
      };
      const formattedDate = today
        .toLocaleDateString("en-US", options)
        .replace(",", "");

      // Update the blank note with content and a random color
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === 0
            ? {
                ...note,
                content,
                color: getRandomColor(),
                date: formattedDate,
                isNew: false,
              }
            : note
        )
      );

      // Add a new blank note
      const newId = Math.max(...notes.map((note) => note.id)) + 1;
      setNotes((prevNotes) => [
        {
          id: 0,
          content: "",
          color: "#ffffff",
          date: "",
          isNew: true,
          isStarred: false,
        },
        ...prevNotes.filter((note) => note.id !== 0),
      ]);

      // Reset editing state
      setEditingNoteId(-1);
      setEditContent("");
    } else {
      // Update an existing note
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === id ? { ...note, content } : note))
      );

      // Reset editing state
      setEditingNoteId(-1);
      setEditContent("");
    }
  };

  // Start editing a note
  const startEditing = (id: number, content: string) => {
    setEditingNoteId(id);
    setEditContent(content);
  };

  // Delete note
  const deleteNote = (id: number) => {
    // Don't delete the blank note
    if (id === 0) return;

    setNotes(notes.filter((note) => note.id !== id));
    if (currentNotes.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Toggle star status
  const toggleStar = (id: number) => {
    if (id === 0) return; // Don't star the blank note

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, isStarred: !note.isStarred } : note
      )
    );
  };

  // Change page
  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle logout
  const handleLogout = () => {
    alert("Đã đăng xuất");
    logout();
    // Implement logout logic here
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

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentNotes.map((note) => (
              <div
                key={note.id}
                className={`rounded-lg shadow-sm min-h-40 p-5 relative group flex flex-col ${
                  note.isNew ? "border-2 border-dashed border-gray-300" : ""
                }`}
                style={{ backgroundColor: note.color }}
              >
                {editingNoteId === note.id ? (
                  // Editing mode
                  <>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-full min-h-32 bg-transparent resize-none border-none focus:outline-none text-gray-800 font-medium"
                      autoFocus
                      placeholder="Type your note here..."
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        onClick={() => setEditingNoteId(-1)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveNote(note.id, editContent)}
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
                      onClick={() => startEditing(note.id, note.content)}
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
                    {!note.isNew && (
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
                    )}

                    {/* Delete button */}
                    {!note.isNew && (
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute left-3 top-3 bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                    )}

                    {note.isNew ? (
                      <div
                        className="flex items-center justify-center h-full cursor-pointer"
                        onClick={() => startEditing(note.id, note.content)}
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
                    ) : (
                      <>
                        <p
                          className="text-gray-800 font-medium flex-1 cursor-pointer"
                          onClick={() => startEditing(note.id, note.content)}
                        >
                          {note.content}
                        </p>

                        {/* Date at bottom */}
                        <p className="text-gray-700 text-sm mt-4">
                          {note.date}
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default NotesApp;
