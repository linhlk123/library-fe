import React, { useMemo, useState } from 'react';
import { BookOpen, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import BookCard from './BookCard';
import booksApi from '../../services/booksApi';
import type { BookForUI, CuonSach, DauSach, PageResponse, Sach, TheLoai } from '../../types';

const CatalogView: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());

  const dauSachQuery = useQuery({
    queryKey: ['dauSach'],
    queryFn: async () => {
      const res = await booksApi.dausach.getAll();
      return res.data.result ?? [];
    },
  });

  const sachQuery = useQuery({
    queryKey: ['sach', currentPage, pageSize],
    queryFn: async () => {
      const res = await booksApi.sach.getAllPaginated(currentPage, pageSize);
      return res.data.result;
    },
    placeholderData: keepPreviousData,
  });

  const cuonSachQuery = useQuery({
    queryKey: ['cuonSach'],
    queryFn: async () => {
      const res = await booksApi.cuonsach.getAll();
      return res.data.result ?? [];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['theLoai'],
    queryFn: async () => {
      const res = await booksApi.theloai.getAll();
      return res.data.result ?? [];
    },
  });

  const dauSachList: DauSach[] = useMemo(() => dauSachQuery.data ?? [], [dauSachQuery.data]);
  const cuonSachList: CuonSach[] = useMemo(() => cuonSachQuery.data ?? [], [cuonSachQuery.data]);
  const categories: TheLoai[] = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const sachPage: PageResponse<Sach> =
    sachQuery.data ?? {
      content: [],
      currentPage,
      totalPages: 0,
      totalElements: 0,
      pageSize,
    };

  const queryError = dauSachQuery.error || sachQuery.error || cuonSachQuery.error || categoriesQuery.error;
  const displayError = error || (queryError ? 'Không tải được dữ liệu. Vui lòng thử lại.' : null);

  const books: BookForUI[] = useMemo(() => {
    return sachPage.content.map((sach) => {
      const dauSach = dauSachList.find((ds) => ds.maDauSach === sach.maDauSach);
      const relatedCuonSach = cuonSachList.filter((cs) => cs.maSach === sach.maSach);
      const theLoai = categories.find((c) => c.maTheLoai === sach.maTheLoai);
      const availableCopies = relatedCuonSach.filter(
        (cs) => cs.tinhTrang === 'AVAILABLE'
      ).length;

      return {
        maDauSach: sach.maDauSach,
        tenDauSach: dauSach?.tenDauSach ?? `Đầu sách #${sach.maDauSach}`,
        tacGiaList: dauSach?.tacGiaList ?? [],
        maSach: sach.maSach,
        nhaXuatBan: sach.nhaXuatBan,
        namXuatBan: sach.namXuatBan,
        giaTien: sach.giaTien,
        soLuong: sach.soLuong,
        theLoai,
        totalCopies: relatedCuonSach.length,
        availableCopies,
        status: availableCopies > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
        anhBiaUrl: dauSach?.anhBiaUrl ?? undefined,
      };
    });
  }, [categories, cuonSachList, dauSachList, sachPage.content]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        book.tenDauSach.toLowerCase().includes(keyword) ||
        book.tacGiaList.some((a) => a.tenTacGia.toLowerCase().includes(keyword));

      const matchesCategory =
        selectedCategory === 'ALL' ||
        String(book.theLoai?.maTheLoai) === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, selectedCategory]);

  const handleToggleSelect = (maDauSach: number) => {
    setSelectedBooks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(maDauSach)) {
        newSet.delete(maDauSach);
      } else {
        newSet.add(maDauSach);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedBooks.size === filteredBooks.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(filteredBooks.map((b) => b.maDauSach)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBooks.size === 0) {
      setError('Vui lòng chọn ít nhất 1 sách để xóa');
      return;
    }

    if (!confirm(`Bạn chắc chắn muốn xóa ${selectedBooks.size} sách? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      setError(null);
      setMessage(null);

      // Xóa từng DAUSACH
      for (const maDauSach of selectedBooks) {
        await booksApi.dausach.delete(maDauSach);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dauSach'] }),
        queryClient.invalidateQueries({ queryKey: ['sach'] }),
        queryClient.invalidateQueries({ queryKey: ['cuonSach'] }),
      ]);

      setSelectedBooks(new Set());
      setDeleteMode(false);
      setMessage(`Xóa thành công ${selectedBooks.size} sách!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Xóa sách thất bại';
      setError(errorMsg);
      console.error(err);
    }
  };

  const totalPages = sachPage.totalPages;
  const totalElements = sachPage.totalElements;
  const startItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = totalElements === 0 ? 0 : Math.min(currentPage * pageSize, totalElements);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const isInitialLoading =
    (dauSachQuery.isLoading || sachQuery.isLoading || cuonSachQuery.isLoading || categoriesQuery.isLoading) &&
    !dauSachQuery.data &&
    !sachQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="flex items-center gap-3">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
          />
          <button
            onClick={() => {
              setDeleteMode(!deleteMode);
              setSelectedBooks(new Set());
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              deleteMode
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            type="button"
          >
            <Trash2 className="inline-block mr-2" size={18} />
            {deleteMode ? 'Hủy' : 'Xóa'}
          </button>
        </div>
      </div>

      {deleteMode && selectedBooks.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedBooks.size === filteredBooks.length && filteredBooks.length > 0}
              onChange={handleSelectAll}
              className="w-5 h-5 text-red-600 rounded cursor-pointer"
            />
            <span className="text-sm font-medium text-red-900">
              Đã chọn {selectedBooks.size} / {filteredBooks.length} sách
            </span>
          </div>
          <button
            onClick={handleDeleteSelected}
            disabled={sachQuery.isFetching}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            type="button"
          >
            <Trash2 size={18} />
            Xóa {selectedBooks.size} sách
          </button>
        </div>
      )}

      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {displayError}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {message}
        </div>
      )}

      {sachQuery.isFetching && !isInitialLoading && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs text-indigo-700">
          Đang tải trang dữ liệu mới...
        </div>
      )}

      {isInitialLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          Đang tải danh sách sách...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={`${book.maSach ?? book.maDauSach}`}
                book={book}
                deleteMode={deleteMode}
                isSelected={selectedBooks.has(book.maDauSach)}
                onToggleSelect={() => handleToggleSelect(book.maDauSach)}
              />
            ))}

            {filteredBooks.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium text-gray-700">
                  {totalElements === 0
                    ? 'Chưa có sách nào trong thư viện.'
                    : 'Trang hiện tại không có dữ liệu phù hợp.'}
                </p>
                <p className="text-sm mt-1">
                  {totalElements === 0
                    ? 'Vui lòng thêm sách mới để bắt đầu quản lý.'
                    : 'Thử đổi trang hoặc điều chỉnh bộ lọc tìm kiếm.'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-gray-600">
                Đang hiển thị {startItem} đến {endItem} trong tổng số {totalElements} cuốn sách
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-600" htmlFor="page-size-select">
                  Hiển thị:
                </label>
                <select
                  id="page-size-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}/trang
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CatalogView;