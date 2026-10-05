import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BookUp, UserCheck, BookOpen, Calendar, CheckCircle2, UserPlus } from 'lucide-react';
import type { Book, Member } from '../types';
import { api } from '../api/client';
import { Select } from '../components/common/Select';
import type { SelectOption } from '../components/common/Select';
import { useToast } from '../components/common/Toast';

export const IssueBookPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedBookId = searchParams.get('bookId') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBookId);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  
  // Default due date: 14 days from today (formatted YYYY-MM-DD)
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);

  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', membershipId: '' });
  const [isRegisteringMember, setIsRegisteringMember] = useState<boolean>(false);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [booksRes, membersRes] = await Promise.all([
          api.getBooks({ limit: 100 }),
          api.getMembers(),
        ]);

        if (booksRes.success) setBooks(booksRes.data);
        if (membersRes.success) setMembers(membersRes.data);
      } catch (err: any) {
        showToast('Failed to load members or book inventory.', 'error', 'Initialization Error');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberId || !selectedBookId) {
      showToast('Please select both a member and a book.', 'error', 'Validation Error');
      return;
    }

    const selectedBook = books.find((b) => b._id === selectedBookId);
    if (selectedBook && selectedBook.availableCopies <= 0) {
      showToast('Selected book is out of available copies!', 'error', 'Unavailable');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.issueBook({
        bookId: selectedBookId,
        memberId: selectedMemberId,
        dueDate: new Date(dueDate).toISOString(),
      });

      if (response.success) {
        showToast(
          `Book successfully issued to member! Due date: ${new Date(dueDate).toLocaleDateString()}`,
          'success',
          'Book Issued'
        );
        // Reset selections
        setSelectedBookId('');
        setSelectedMemberId('');
        // Navigate to member history
        navigate(`/history?memberId=${selectedMemberId}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to issue book. Please try again.';
      showToast(msg, 'error', 'Issue Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegisteringMember(true);
    try {
      const res = await api.addMember(newMember);
      if (res.success) {
        showToast(`Member ${res.data.name} registered!`, 'success', 'Member Created');
        setMembers((prev) => [res.data, ...prev]);
        setSelectedMemberId(res.data._id);
        setIsMemberModalOpen(false);
        setNewMember({ name: '', email: '', membershipId: '' });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to register member.';
      showToast(msg, 'error', 'Registration Error');
    } finally {
      setIsRegisteringMember(false);
    }
  };

  const bookOptions: SelectOption<Book>[] = books.map((b) => ({
    value: b._id,
    label: `${b.title} — by ${b.author} (${b.availableCopies} available)`,
    disabled: b.availableCopies <= 0,
    data: b,
  }));

  const memberOptions: SelectOption<Member>[] = members.map((m) => ({
    value: m._id,
    label: `${m.name} (${m.membershipId} — ${m.email})`,
    data: m,
  }));

  const selectedBookDetails = books.find((b) => b._id === selectedBookId);
  const selectedMemberDetails = members.find((m) => m._id === selectedMemberId);

  return (
    <div className="page-container max-w-3xl mx-auto">
      <div className="page-header text-center mb-8">
        <h1 className="page-title flex-center gap-2">
          <BookUp className="text-accent" size={32} /> Issue Book to Member
        </h1>
        <p className="page-subtitle">Select a registered library member and assign an available book</p>
      </div>

      <div className="glass-panel p-8 shadow-2xl rounded-2xl border border-glass">
        {loadingData ? (
          <div className="py-12 text-center">
            <span className="spinner-inline spinner-lg mb-3"></span>
            <p className="text-muted">Loading library database...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="issue-book-form space-y-6">
            {/* Member Selection */}
            <div className="form-section">
              <div className="flex-between mb-2">
                <label className="form-label flex-center gap-2 mb-0">
                  <UserCheck size={18} className="text-primary" /> Select Library Member *
                </label>
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(true)}
                  className="btn btn-link text-xs flex-center gap-1"
                >
                  <UserPlus size={14} /> Register New Member
                </button>
              </div>
              <Select<Member>
                options={memberOptions}
                value={selectedMemberId}
                onChange={(val) => setSelectedMemberId(val)}
                placeholder="Search or choose member..."
                required
              />
              {selectedMemberDetails && (
                <div className="selection-preview mt-2 p-3 rounded-lg bg-surface flex-between text-xs">
                  <span>ID: <strong>{selectedMemberDetails.membershipId}</strong></span>
                  <span>Email: <strong>{selectedMemberDetails.email}</strong></span>
                </div>
              )}
            </div>

            {/* Book Selection */}
            <div className="form-section">
              <label className="form-label flex-center gap-2">
                <BookOpen size={18} className="text-primary" /> Select Book *
              </label>
              <Select<Book>
                options={bookOptions}
                value={selectedBookId}
                onChange={(val) => setSelectedBookId(val)}
                placeholder="Choose a book from inventory..."
                required
              />
              {selectedBookDetails && (
                <div className="selection-preview mt-2 p-3 rounded-lg bg-surface flex-between text-xs">
                  <span>Genre: <strong>{selectedBookDetails.genre}</strong></span>
                  <span>
                    Copies: <strong className={selectedBookDetails.availableCopies > 0 ? 'text-success' : 'text-danger'}>
                      {selectedBookDetails.availableCopies} available
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Due Date Picker */}
            <div className="form-section">
              <label className="form-label flex-center gap-2">
                <Calendar size={18} className="text-primary" /> Due Date *
              </label>
              <input
                type="date"
                required
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className="text-muted text-xs mt-1">Standard loan period is 14 days from date of issuance.</p>
            </div>

            {/* Form Submit Button */}
            <div className="form-actions pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !selectedBookId || !selectedMemberId}
                className="btn btn-primary btn-block py-3 text-lg font-semibold shadow-glow"
              >
                {isSubmitting ? (
                  <span className="flex-center gap-2">
                    <span className="spinner-inline"></span> Issuing Book...
                  </span>
                ) : (
                  <span className="flex-center gap-2">
                    <CheckCircle2 size={20} /> Issue Book Now
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* New Member Registration Modal */}
      {isMemberModalOpen && (
        <div className="modal-backdrop flex-center">
          <div className="modal-card glass-panel shadow-2xl fade-in">
            <div className="modal-header flex-between">
              <h3 className="modal-title flex-center gap-2">
                <UserPlus size={20} /> Register New Member
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="btn-close">
                &times;
              </button>
            </div>
            <form onSubmit={handleRegisterMember} className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Emma Watson"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="e.g. emma@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Membership ID *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newMember.membershipId}
                  onChange={(e) => setNewMember({ ...newMember, membershipId: e.target.value.toUpperCase() })}
                  placeholder="e.g. MEM-1006"
                />
              </div>

              <div className="modal-footer flex-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isRegisteringMember} className="btn btn-primary">
                  {isRegisteringMember ? <span className="spinner-inline"></span> : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
