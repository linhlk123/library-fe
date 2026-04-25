import React from 'react';
import { Filter } from 'lucide-react';
import type { TheLoai } from '../../types';

interface CategoryFilterProps {
  categories: TheLoai[];
  selectedCategory: string;
  onChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2 w-full sm:w-auto">
      <Filter className="h-5 w-5 text-gray-400" />
      <select
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg bg-gray-50"
      >
        <option value="ALL">Tất cả thể loại</option>
        {categories.map((c) => (
          <option key={c.maTheLoai} value={String(c.maTheLoai)}>
            {c.tenTheLoai}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;