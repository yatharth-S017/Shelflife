import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { History, AlertTriangle, CheckCircle, Clock, RotateCcw, User } from 'lucide-react';
import type { BorrowRecord, Member } from '../types';
import { api } from '../api/client';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import { Select } from '../components/common/Select';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const MemberHistoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMemberId = searchParams.get('memberId') || '';

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMemberId);
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [returningId, setReturningId] = useState<string | null>(null);

  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  // Load members list for selector
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.getMembers();
        if (res.success) {
          setMembers(res.data);
          if (!selectedMemberId && res.data.length > 0) {
            setSelectedMemberId(res.data[0]._id);
          }
        }
      } catch (err) {
        showToast('Failed to load library members.', 'error');
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, []);

  // Fetch borrowing history when selectedMemberId changes
  const fetchHistory = useCallback(async (memberId: string) => {
    if (!memberId) return;
    setLoadingHistory(true);
    try {
      const res = await api.getMemberHistory(memberId);
      if (res.success && res.data) {
        setSelectedMember(res.data.member);
        setHistory(res.data.borrowHistory);
      }
    } catch (err: any) {
      showToast('Failed to fetch borrowing history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedMemberId) {
      fetchHistory(selectedMemberId);
      setSearchParams({ memberId: selectedMemberId });
    }
  }, [selectedMemberId, fetchHistory, setSearchParams]);

  // Handle return book action
  const handleReturnBook = async (borrowId: string) => {
    setReturningId(borrowId);
    try {
      const res = await api.returnBook(borrowId);
      if (res.success) {
        showToast('Book successfully returned to inventory!', 'success', 'Book Returned');
        fetchHistory(selectedMemberId);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to return book.';
      showToast(msg, 'error');
    } finally {
      setReturningId(null);
    }
  };

  // Check if item is overdue
  const isOverdue = (record: BorrowRecord): boolean => {
    if (record.status === 'overdue') return true;
    if (record.status === 'issued') {
      const due = new Date(record.dueDate).getTime();
      const today = new Date().getTime();
      return due < today;
    }
    return false;
  };

  const columns: Column<BorrowRecord>[] = [
    {
      key: 'book',
      header: 'Book Details',
      render: (record) => {
        const book = typeof record.book === 'object' ? record.book : null;
        return (
          <div className="book-info-cell">
            <span className="font-semibold text-white">{book ? book.title : 'Book ID: ' + record.book}</span>
            {book && <span className="text-xs text-muted block">Author: {book.author} | ISBN: {book.ISBN}</span>}
          </div>
        );
      },
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (record) => (
        <span className="text-gray-300 text-sm">
          {new Date(record.issueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (record) => {
        const overdue = isOverdue(record);
        return (
          <span className={`text-sm ${overdue ? 'text-danger font-bold' : 'text-gray-300'}`}>
            {new Date(record.dueDate).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Borrow Status',
      align: 'center',
      render: (record) => {
        const overdue = isOverdue(record);
        if (record.status === 'returned') {
          return (
            <span className="badge badge-success flex-center gap-1">
              <CheckCircle size={14} /> Returned
            </span>
          );
        }
        if (overdue) {
          return (
            <span className="badge badge-overdue flex-center gap-1 animate-pulse">
              <AlertTriangle size={14} /> OVERDUE
            </span>
          );
        }
        return (
          <span className="badge badge-warning flex-center gap-1">
            <Clock size={14} /> Issued
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (record) => {
        if (record.status === 'returned') {
          return (
            <span className="text-xs text-muted italic">
              Returned on {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : 'N/A'}
            </span>
          );
        }
        return (
          <button
            disabled={!isAuthenticated || returningId === record._id}
            onClick={() => handleReturnBook(record._id)}
            className="btn btn-sm btn-outline flex-center gap-1"
          >
            {returningId === record._id ? (
              <span className="spinner-inline"></span>
            ) : (
              <>
                <RotateCcw size={14} /> Return Book
              </>
            )}
          </button>
        );
      },
    },
  ];

  const memberOptions = members.map((m) => ({
    value: m._id,
    label: `${m.name} (${m.membershipId})`,
  }));

  return (
    <div className="page-container">
      <div className="page-header flex-between mb-6">
        <div>
          <h1 className="page-title flex-center gap-2">
            <History className="text-accent" size={30} /> Member Borrowing History
          </h1>
          <p className="page-subtitle">Track issued books, active loans, and overdue returns</p>
        </div>
      </div>

      {/* Member Selector Card */}
      <div className="glass-panel p-6 mb-6">
        <div className="grid-1-2 gap-6 items-center">
          <div>
            <label className="form-label flex-center gap-2">
              <User size={18} className="text-primary" /> Select Member
            </label>
            <Select
              options={memberOptions}
              value={selectedMemberId}
              onChange={(val) => setSelectedMemberId(val)}
              placeholder="Choose a member..."
              disabled={loadingMembers}
            />
          </div>

          {selectedMember && (
            <div className="member-summary-card p-4 rounded-xl bg-surface border border-glass flex-between">
              <div>
                <h3 className="font-bold text-white text-lg">{selectedMember.name}</h3>
                <p className="text-xs text-muted">Email: {selectedMember.email}</p>
              </div>
              <div className="text-right">
                <span className="badge badge-info">ID: {selectedMember.membershipId}</span>
                <p className="text-xs text-muted mt-1">
                  Joined: {new Date(selectedMember.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Borrowing History DataTable */}
      <DataTable<BorrowRecord>
        data={history}
        columns={columns}
        keyExtractor={(record) => record._id}
        isLoading={loadingHistory}
        emptyMessage="No borrowing records found for this member."
      />
    </div>
  );
};
