import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, BookOpen, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Book, PaginationMeta } from '../types';
import { api } from '../api/client';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GENRES = [
  'All',
  'Technology',
  'Software Engineering',
  'Database & Systems',
  'Classic Fiction',
  'History',
  'Science',
  'Philosophy',
];

export const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);

  // Add Book Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    ISBN: '',
    genre: 'Technology',
    totalCopies: 3,
    availableCopies: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getBooks({
        page,
        limit: 8,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        search: search.trim() || undefined,
      });

      if (response.success) {
        setBooks(response.data);
        setPagination(response.pagination);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to fetch book catalog.';
      setError(msg);
      showToast(msg, 'error', 'Error Loading Books');
    } finally {
      setLoading(false);
    }
  }, [page, selectedGenre, search, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.addBook(newBook);
      if (res.success) {
        showToast(`" ${res.data.title} " successfully added!`, 'success', 'Book Created');
        setIsModalOpen(false);
        setNewBook({
          title: '',
          author: '',
          ISBN: '',
          genre: 'Technology',
          totalCopies: 3,
          availableCopies: 3,
        });
        fetchBooks();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to add book.';
      showToast(msg, 'error', 'Failed to Add Book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Book>[] = [
    {
      key: 'title',
      header: 'Book Title',
      render: (book) => (
        <div className="book-title-cell">
          <span className="font-semibold text-white">{book.title}</span>
          <span className="text-xs text-muted block">ISBN: {book.ISBN}</span>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      render: (book) => <span className="text-gray-300">{book.author}</span>,
    },
    {
      key: 'genre',
      header: 'Genre',
      render: (book) => <span className="badge badge-genre">{book.genre}</span>,
    },
    {
      key: 'copies',
      header: 'Availability',
      align: 'center',
      render: (book) => {
        const isAvailable = book.availableCopies > 0;
        return (
          <div className="copies-pill-wrapper">
            <span
              className={`badge ${
                isAvailable ? 'badge-success' : 'badge-danger'
              }`}
            >
              {book.availableCopies} / {book.totalCopies} Copies
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (book) => (
        <button
          disabled={book.availableCopies === 0}
          onClick={() => navigate(`/issue?bookId=${book._id}`)}
          className="btn btn-sm btn-primary"
        >
          {book.availableCopies > 0 ? 'Issue Book' : 'Out of Stock'}
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header flex-between mb-6">
        <div>
          <h1 className="page-title">Library Book Catalog</h1>
          <p className="page-subtitle">Browse, search, and manage books in the ShelfLife repository</p>
        </div>
        <div className="header-actions">
          {isAuthenticated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary shadow-glow flex-center gap-2"
            >
              <Plus size={18} /> Add New Book
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar glass-panel p-4 mb-6 flex-wrap gap-4 flex-between">
        <div className="search-input-wrapper flex-grow max-w-md">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="form-input pl-10"
          />
        </div>

        <div className="filter-group flex-center gap-2">
          <Filter size={18} className="text-muted" />
          <span className="text-sm text-muted">Genre:</span>
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setPage(1);
            }}
            className="form-select w-auto"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <button onClick={fetchBooks} className="btn btn-icon" title="Refresh list">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="alert-box alert-error mb-6 flex-between">
          <div className="flex-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={fetchBooks} className="btn btn-sm btn-outline">
            Retry
          </button>
        </div>
      )}

      {/* Generic DataTable Component */}
      <DataTable<Book>
        data={books}
        columns={columns}
        keyExtractor={(book) => book._id}
        isLoading={loading}
        emptyMessage="No books found matching your search criteria."
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Add Book Modal */}
      {isModalOpen && (
        <div className="modal-backdrop flex-center">
          <div className="modal-card glass-panel shadow-2xl fade-in">
            <div className="modal-header flex-between">
              <h3 className="modal-title flex-center gap-2">
                <BookOpen size={20} /> Add New Book
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-close">
                &times;
              </button>
            </div>
            <form onSubmit={handleAddBookSubmit} className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Book Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="e.g. Introduction to Algorithms"
                />
              </div>

              <div className="grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="e.g. Thomas H. Cormen"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ISBN *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newBook.ISBN}
                    onChange={(e) => setNewBook({ ...newBook, ISBN: e.target.value })}
                    placeholder="e.g. 9780262033848"
                  />
                </div>
              </div>

              <div className="grid-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Genre *</label>
                  <select
                    className="form-select"
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                  >
                    {GENRES.filter((g) => g !== 'All').map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Copies *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={newBook.totalCopies}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setNewBook({ ...newBook, totalCopies: val, availableCopies: val });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    max={newBook.totalCopies}
                    className="form-input"
                    value={newBook.availableCopies}
                    onChange={(e) => setNewBook({ ...newBook, availableCopies: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="modal-footer flex-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? <span className="spinner-inline"></span> : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
