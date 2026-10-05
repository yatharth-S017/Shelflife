import axios from 'axios';
import type {
  ApiResponse,
  Book,
  Member,
  BorrowRecord,
  LoginResponse,
  MemberHistoryResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer token into headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shelflife_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Typed API methods
export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  // Books
  getBooks: async (params?: { page?: number; limit?: number; genre?: string; search?: string }): Promise<ApiResponse<Book[]>> => {
    const response = await apiClient.get<ApiResponse<Book[]>>('/books', { params });
    return response.data;
  },

  addBook: async (bookData: { title: string; author: string; ISBN: string; genre: string; totalCopies: number; availableCopies?: number }): Promise<ApiResponse<Book>> => {
    const response = await apiClient.post<ApiResponse<Book>>('/books', bookData);
    return response.data;
  },

  // Members
  getMembers: async (): Promise<ApiResponse<Member[]>> => {
    const response = await apiClient.get<ApiResponse<Member[]>>('/members');
    return response.data;
  },

  addMember: async (memberData: { name: string; email: string; membershipId: string }): Promise<ApiResponse<Member>> => {
    const response = await apiClient.post<ApiResponse<Member>>('/members', memberData);
    return response.data;
  },

  getMemberHistory: async (memberId: string): Promise<ApiResponse<MemberHistoryResponse>> => {
    const response = await apiClient.get<ApiResponse<MemberHistoryResponse>>(`/members/${memberId}/history`);
    return response.data;
  },

  // Borrow & Return
  issueBook: async (borrowData: { bookId: string; memberId: string; dueDate?: string }): Promise<ApiResponse<BorrowRecord>> => {
    const response = await apiClient.post<ApiResponse<BorrowRecord>>('/borrow', borrowData);
    return response.data;
  },

  returnBook: async (borrowId: string): Promise<ApiResponse<BorrowRecord>> => {
    const response = await apiClient.post<ApiResponse<BorrowRecord>>(`/return/${borrowId}`);
    return response.data;
  },
};
