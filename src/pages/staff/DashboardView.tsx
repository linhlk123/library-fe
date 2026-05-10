import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MoreVertical, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { booksApi } from '../../services/booksApi';
import { useAuthStore } from '../../stores';
import type { Sach, DauSach } from '../../types';

interface BookFilter {
  search: string;
  category: string;
  status: string;
}

interface BookDisplay extends Sach {
  tenDauSach?: string;
  nhaCungCap?: string;
  soLuongConLai?: number;
}

export default function DashboardView() {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<BookFilter>({
    search: '',
    category: '',
    status: '',
  });

  // Fetch Sach (book editions)
  const { data: sachData, isLoading: sachLoading } = useQuery({
    queryKey: ['sach', filters],
    queryFn: () => booksApi.sach.getAll({
      page: 1,
      pageSize: 999,
    }),
    enabled: !!token,
  });

  // Fetch all DauSach (book titles) for mapping
  const { data: dausachData } = useQuery({
    queryKey: ['dausach'],
    queryFn: () => booksApi.dausach.getAll({
      page: 1,
      pageSize: 999,
    }),
    enabled: !!token,
  });

  // Create a map of DauSach by maDauSach
  const dausachArray = Array.isArray(dausachData?.data?.result) 
    ? (dausachData.data.result as DauSach[]) 
    : [];
  const dausachMap = new Map(dausachArray.map(d => [d.maDauSach, d]));

  // Extract Sach array from paginated response or direct array
  let sachArray: Sach[] = [];
  if (sachData?.data?.result) {
    const result = sachData.data.result as Sach[] | { content?: Sach[] };
    // If it's a paginated response with content property
    if ('content' in result && Array.isArray(result.content)) {
      sachArray = result.content as Sach[];
    } 
    // If it's directly an array
    else if (Array.isArray(result)) {
      sachArray = result as Sach[];
    }
  }

  const books: BookDisplay[] = sachArray.map(sach => ({
    ...sach,
    tenDauSach: dausachMap.get(sach.maDauSach)?.tenDauSach,
    nhaCungCap: sach.nhaXuatBan,
    soLuongConLai: sach.soLuong,
  }));

  // Calculate statistics from API data
  const totalBooks = books.length;
  const availableBooks = books.reduce((sum: number, book: BookDisplay) => sum + (book.soLuongConLai || 0), 0);
  const outOfStockBooks = books.filter((book: BookDisplay) => !book.soLuongConLai || book.soLuongConLai === 0).length;
  const isLoading = sachLoading;

  const handleUpdateBook = (bookId: number) => {
    console.log('Update book:', bookId);
    // TODO: Implement update modal
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in stock':
      case 'available':
        return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300';
      case 'out of stock':
      case 'unavailable':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300';
      default:
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Books */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 group-hover:bg-white/50 transition-all duration-200"></div>
          <div className="relative p-6 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tổng Sách</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{isLoading ? '...' : totalBooks.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">{isLoading ? 'Đang tải...' : 'Từ danh mục thư viện'}</p>
          </div>
        </div>

        {/* Available Books */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 group-hover:bg-white/50 transition-all duration-200"></div>
          <div className="relative p-6 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Còn Lại</p>
                <p className="text-3xl font-bold text-teal-600 mt-2">{isLoading ? '...' : availableBooks.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                <TrendingUp size={24} strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">{isLoading ? 'Đang tải...' : `${totalBooks > 0 ? Math.round((availableBooks / totalBooks) * 100) : 0}% tỉ lệ có sẻ`}</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 group-hover:bg-white/50 transition-all duration-200"></div>
          <div className="relative p-6 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Hết Hàng</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{isLoading ? '...' : outOfStockBooks.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
                <AlertCircle size={24} strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">{isLoading ? 'Đang tải...' : `${totalBooks > 0 ? Math.round((outOfStockBooks / totalBooks) * 100) : 0}% cần nhập hàng`}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Search */}
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-xl border border-white/30 group-hover:bg-white/50 transition-all duration-200"></div>
          <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm sách theo tên, ISBN..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/40 backdrop-blur-xl border border-white/30 hover:bg-white/50 text-slate-700 text-sm font-medium transition-all duration-200 flex items-center gap-2">
            <Filter size={16} />
            Lọc
          </button>
          <button className="px-4 py-2 rounded-lg bg-white/40 backdrop-blur-xl border border-white/30 hover:bg-white/50 text-slate-700 text-sm font-medium transition-all duration-200">
            Sắp Xếp
          </button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="relative group rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/30"></div>
              <div className="relative h-96 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse"></div>
            </div>
          ))
        ) : books.length > 0 ? (
          books.map((book: BookDisplay) => (
            <div
              key={book.maSach}
              className="relative group rounded-2xl overflow-hidden h-full transition-all duration-300"
            >
              {/* Glass background */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/30 group-hover:bg-white/50 group-hover:border-white/50 transition-all duration-200"></div>

              <div className="relative flex flex-col h-full">
                {/* Book Cover Area */}
                <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="text-slate-400" size={48} strokeWidth={1} />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-4 space-y-3">
                  {/* Title */}
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-2 text-sm group-hover:text-emerald-600 transition-colors">
                      {book.tenDauSach || 'Untitled'}
                    </h3>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">Publisher:</p>
                      <p className="text-xs font-medium text-slate-700">
                        {book.nhaCungCap || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">Available:</p>
                      <p className="text-xs font-bold text-emerald-600">
                        {book.soLuongConLai || 0} copies
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      (book.soLuongConLai || 0) > 0
                        ? getStatusColor('in stock')
                        : getStatusColor('out of stock')
                    }`}>
                      {(book.soLuongConLai || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleUpdateBook(book.maSach)}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-200/30 hover:shadow-emerald-300/40 mt-2"
                  >
                    Update
                  </button>
                </div>

                {/* More Options */}
                <button className="absolute top-3 right-3 p-2 rounded-lg bg-white/40 backdrop-blur-xl border border-white/30 hover:bg-white/60 transition-all duration-200 opacity-0 group-hover:opacity-100">
                  <MoreVertical size={16} className="text-slate-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-sm">No books found</p>
          </div>
        )}
      </div>
    </div>
  );
}
