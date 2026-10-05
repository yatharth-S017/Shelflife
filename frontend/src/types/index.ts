export type Book = {
  _id: string;
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Member = {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BorrowStatus = 'issued' | 'returned' | 'overdue';

export type BorrowRecord = {
  _id: string;
  book: Book | string;
  member: Member | string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: BorrowStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  error?: {
    message: string;
    statusCode: number;
  };
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type MemberHistoryResponse = {
  member: Member;
  borrowHistory: BorrowRecord[];
};
