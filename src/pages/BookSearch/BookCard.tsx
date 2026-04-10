import React from 'react';
import { BookMarked } from 'lucide-react';
import type { Book } from '../../types';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-48 w-full bg-gray-200 relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {book.categories.map((cat) => (
            <span
              key={cat.id}
              className="bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-lg font-bold text-gray-900 line-clamp-1"
          title={book.title}
        >
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {book.authors.map((a) => a.name).join(', ')}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                book.status === 'AVAILABLE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {book.status}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {book.availableCopies} of {book.totalCopies} copies
            </p>
          </div>

          {book.status === 'AVAILABLE' ? (
            <button
              className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
              title="Borrow Book"
            >
              <BookMarked size={20} />
            </button>
          ) : (
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 hover:border-indigo-400 rounded-lg transition-colors">
              Reserve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
