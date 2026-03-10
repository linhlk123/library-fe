import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { MOCK_BOOKS, MOCK_CATEGORIES } from '../../data/mockData';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import BookCard from './BookCard';

const CatalogView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredBooks = MOCK_BOOKS.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authors.some((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      selectedCategory === 'ALL' ||
      book.categories.some((c) => c.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <CategoryFilter
          categories={MOCK_CATEGORIES}
          selectedCategory={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
        {filteredBooks.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No books found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogView;
