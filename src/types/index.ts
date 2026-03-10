export type Role = 'STUDENT' | 'LIBRARIAN' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface Author {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface BookCopy {
  id: string;
  bookId: string;
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE';
  condition: string;
}

export interface Book {
  id: string;
  title: string;
  coverUrl: string;
  authors: Author[];
  categories: Category[];
  status: 'AVAILABLE' | 'BORROWED';
  totalCopies: number;
  availableCopies: number;
}

export interface Loan {
  id: string;
  book: Book;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'OVERDUE' | 'RETURNED';
}

export interface Fine {
  id: string;
  amount: number;
  reason: 'LATE_RETURN' | 'DAMAGED_BOOK' | 'LOST_BOOK';
  status: 'UNPAID' | 'PAID';
  issuedDate: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'USER' | 'BOT';
  timestamp: Date;
}
