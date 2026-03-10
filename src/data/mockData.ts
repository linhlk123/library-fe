import type { Category, Book, Loan, Fine } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Computer Science' },
  { id: 'c2', name: 'Economics' },
  { id: 'c3', name: 'Novel' },
];

export const MOCK_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    coverUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300&h=400',
    authors: [{ id: 'a1', name: 'Robert C. Martin' }],
    categories: [MOCK_CATEGORIES[0]],
    status: 'AVAILABLE',
    totalCopies: 5,
    availableCopies: 2,
  },
  {
    id: 'b2',
    title: 'Freakonomics',
    coverUrl:
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300&h=400',
    authors: [{ id: 'a2', name: 'Steven D. Levitt' }],
    categories: [MOCK_CATEGORIES[1]],
    status: 'BORROWED',
    totalCopies: 3,
    availableCopies: 0,
  },
  {
    id: 'b3',
    title: 'The Great Gatsby',
    coverUrl:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400',
    authors: [{ id: 'a3', name: 'F. Scott Fitzgerald' }],
    categories: [MOCK_CATEGORIES[2]],
    status: 'AVAILABLE',
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    id: 'b4',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    coverUrl:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300&h=400',
    authors: [{ id: 'a4', name: 'Erich Gamma' }],
    categories: [MOCK_CATEGORIES[0]],
    status: 'AVAILABLE',
    totalCopies: 2,
    availableCopies: 1,
  },
];

export const MOCK_LOANS: Loan[] = [
  {
    id: 'l1',
    book: MOCK_BOOKS[1],
    borrowDate: '2023-10-01',
    dueDate: '2023-10-15',
    status: 'ACTIVE',
  },
  {
    id: 'l2',
    book: MOCK_BOOKS[0],
    borrowDate: '2023-09-10',
    dueDate: '2023-09-24',
    status: 'OVERDUE',
  },
];

export const MOCK_FINES: Fine[] = [
  {
    id: 'f1',
    amount: 15.5,
    reason: 'LATE_RETURN',
    status: 'UNPAID',
    issuedDate: '2023-09-25',
  },
];
