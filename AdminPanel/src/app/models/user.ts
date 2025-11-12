export interface User {
  id: number;
  login: string;
  email: string;
  email_verified: boolean;
  isadmin: boolean;
  isprivate: boolean;
  created_at: string;
}

export interface UsersResponse {
  status: boolean;
  message: string;
  limit: number;
  currentPage: number;
  totalUsers: number;
  totalPages: number;
  users: User[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}