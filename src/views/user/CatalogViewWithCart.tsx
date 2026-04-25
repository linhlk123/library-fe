import { useState, useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import userApi from '../../services/userApi';
import { SectionContainer } from '../../components/shared/SectionContainer';
import { BookDetailModal } from './BookDetailModal';
import BorrowCartDrawer from '../../components/shared/BorrowCartDrawer';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores';
import { 
  Search, 
  BookOpen, 
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react';
import type { BookForUI as BaseBookForUI, PageResponse, Sach } from '../../types';

// Extended Book Type for UI
interface BookForUI extends BaseBookForUI {
  maCuonSach?: number;
}

const toDeletedFlag = (value: unknown): boolean => {
  if (value === 1 || value === '1' || value === true || value === 'true') {
    return true;
  }
  return false;
};

const isDeletedRecord = (record: unknown): boolean => {
  if (!record || typeof record !== 'object') {
    return false;
  }

  const raw = record as {
    is_deleted?: unknown;
    isDeleted?: unknown;
  };

  return toDeletedFlag(raw.is_deleted) || toDeletedFlag(raw.isDeleted);
};

// Skeleton Components
const BookCardSkeleton = () => (
  <div className="rounded-xl bg-white overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-44 bg-gradient-to-br from-gray-200 to-gray-300"></div>
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded-lg w-20"></div>
      <div className="h-4 bg-gray-200 rounded-lg"></div>
      <div className="h-3 bg-gray-200 rounded-lg w-3/4"></div>
      <div className="border-t border-gray-200 my-2"></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-lg mt-2"></div>
    </div>
  </div>
);

// Enhanced Book Card Component with Cart Button
const BookCard = ({ 
  book, 
  onSelect,
  onAddToCart,
  isInCart,
}: { 
  book: BookForUI;
  onSelect: (book: BookForUI) => void;
  onAddToCart: (book: BookForUI) => void;
  isInCart: boolean;
}) => {
  const isDisabled = book.status === 'UNAVAILABLE';

  return (
    <div className={`group rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 ${
      isDisabled ? 'opacity-60 cursor-not-allowed' : ''
    }`}>
      {/* Main card */}
      <div 
        onClick={() => !isDisabled && onSelect(book)}
        className={`bg-white border flex flex-col flex-1 cursor-pointer hover:shadow-lg transition-all duration-300 ${
          isDisabled ? 'border-gray-100 shadow-sm' : 'border-gray-100 shadow-sm hover:-translate-y-0.5 hover:shadow-lg'
        }`}
        style={{ borderRadius: 'calc(0.75rem - 2px)' }}
      >
        {/* Cover Image */}
        <div className="h-44 w-full bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 relative flex-shrink-0 overflow-hidden rounded-t-lg">
          {book.anhBiaUrl ? (
            <img
              src={book.anhBiaUrl}
              alt={book.tenDauSach}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                !isDisabled && 'group-hover:scale-105'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <BookOpen size={48} />
            </div>
          )}

          {/* Category Badge */}
          {book.theLoai && (
            <div className="absolute top-2 left-2">
              <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] uppercase font-bold px-2 py-1 rounded">
                {book.theLoai.tenTheLoai}
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute bottom-2 left-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                book.status === 'AVAILABLE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {book.status === 'AVAILABLE' ? '✓ Còn' : '✗ Hết'}
            </span>
          </div>

          {/* In Cart Badge */}
          {isInCart && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                ✓ Đã thêm
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {book.tenDauSach}
          </h3>

          {/* Authors */}
          <p className="text-xs text-gray-600 line-clamp-1 mb-2">
            {book.tacGiaList.map((a) => a.tenTacGia).join(', ')}
          </p>

          {/* Publisher & Year */}
          {(book.nhaXuatBan || book.namXuatBan) && (
            <div className="text-xs text-gray-600 mb-2">
              <div className="line-clamp-1">{book.nhaXuatBan || 'N/A'}</div>
              <div className="text-gray-500">{book.namXuatBan || 'N/A'}</div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Book Details Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Available Copies */}
            <div className="text-center bg-gray-50 rounded p-1.5">
              <p className="text-xs text-gray-500">Còn lại</p>
              <p className={`text-sm font-bold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.availableCopies}
              </p>
            </div>

            {/* Total Copies */}
            <div className="text-center bg-gray-50 rounded p-1.5">
              <p className="text-xs text-gray-500">Tổng</p>
              <p className="text-sm font-bold text-gray-900">{book.totalCopies}</p>
            </div>

            {/* Price */}
            {book.giaTien && (
              <div className="text-center bg-gray-50 rounded p-1.5">
                <p className="text-xs text-gray-500">Giá</p>
                <p className="text-sm font-bold text-gray-900">
                  {(book.giaTien / 1000).toFixed(0)}k
                </p>
              </div>
            )}

            {/* Inventory */}
            {book.soLuong && (
              <div className="text-center bg-gray-50 rounded p-1.5">
                <p className="text-xs text-gray-500">Kho</p>
                <p className="text-sm font-bold text-gray-900">{book.soLuong}</p>
              </div>
            )}
          </div>

          {/* View Details Link */}
          <div className="mt-auto flex items-center justify-center text-indigo-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Chi tiết</span>
            <ChevronRight size={14} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => onAddToCart(book)}
        disabled={isDisabled}
        className={`w-full mt-2 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
          isInCart
            ? 'bg-blue-100 text-blue-700 border border-blue-300 cursor-default'
            : isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:scale-[1.02] border border-indigo-700'
        }`}
        title={isDisabled ? 'Sách này không còn' : ''}
      >
        <ShoppingCart size={16} />
        {isInCart ? '✓ Đã thêm' : 'Thêm vào giỏ'}
      </button>

      {/* Warning for disabled state */}
      {isDisabled && (
        <div className="mt-1 flex items-center gap-1 text-xs text-orange-600 px-1">
          <AlertCircle size={12} />
          <span>Không có sẵn</span>
        </div>
      )}
    </div>
  );
};

export default function CatalogViewWithCart() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBook, setSelectedBook] = useState<BookForUI | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Cart store
  const { cartItems, addToCart, isBookInCart } = useCartStore();
  const { addNotification } = useUIStore();

  // Fetch all data
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['dausach'],
    queryFn: () => userApi.getAllDauSach(),
  });

  const { data: sachData, isLoading: sachLoading, isFetching: sachFetching } = useQuery({
    queryKey: ['sach', currentPage, pageSize],
    queryFn: () => userApi.getAllSachPaginated(currentPage, pageSize),
    placeholderData: keepPreviousData,
  });

  const { data: cuonSachData, isLoading: cuonSachLoading } = useQuery({
    queryKey: ['cuonsach'],
    queryFn: () => userApi.getAllCuonSach(),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => userApi.getAllCategories(),
  });

  const dauSachList = useMemo(() => booksData?.data?.result ?? [], [booksData]);
  const sachPage = useMemo<PageResponse<Sach>>(
    () =>
      sachData?.data?.result ?? {
        content: [],
        currentPage,
        totalPages: 0,
        totalElements: 0,
        pageSize,
      },
    [currentPage, pageSize, sachData]
  );
  const sachList = useMemo(
    () => (sachPage.content ?? []).filter((sach) => !isDeletedRecord(sach)),
    [sachPage.content]
  );
  const cuonSachList = useMemo(() => cuonSachData?.data?.result ?? [], [cuonSachData]);
  const categories = useMemo(() => categoriesData?.data?.result ?? [], [categoriesData]);

  // Combine data into BookForUI format
  const books: BookForUI[] = useMemo(() => {
    return dauSachList
      .filter((ds) => !isDeletedRecord(ds))
      .reduce<BookForUI[]>((acc, ds) => {
        const relatedSach = sachList.filter((s) => s.maDauSach === ds.maDauSach);

        if (relatedSach.length === 0) {
          return acc;
        }

        const relatedCuonSach = cuonSachList.filter((cs) =>
          relatedSach.some((s) => s.maSach === cs.maSach)
        );
        const firstSach = relatedSach[0];
        const availableCopy = relatedCuonSach.find((cs) => cs.tinhTrang === 'AVAILABLE');
        const theLoai = firstSach
          ? categories.find((c) => c.maTheLoai === firstSach.maTheLoai)
          : categories.find((c) => c.maTheLoai === ds.maTheLoai);
        const availableCopies = relatedCuonSach.filter(
          (cs) => cs.tinhTrang === 'AVAILABLE'
        ).length;

        acc.push({
          maDauSach: ds.maDauSach,
          maCuonSach: availableCopy?.maCuonSach,
          tenDauSach: ds.tenDauSach,
          tacGiaList: ds.tacGiaList ?? [],
          maSach: firstSach?.maSach,
          nhaXuatBan: firstSach?.nhaXuatBan,
          namXuatBan: firstSach?.namXuatBan,
          giaTien: firstSach?.giaTien,
          soLuong: firstSach?.soLuong,
          theLoai,
          totalCopies: relatedCuonSach.length,
          availableCopies,
          status: availableCopies > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
          anhBiaUrl: ds.anhBiaUrl ?? undefined,
        });

        return acc;
      }, []);
  }, [categories, cuonSachList, dauSachList, sachList]);

  // Filter and search logic
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

  const isLoading = booksLoading || sachLoading || cuonSachLoading || categoriesLoading;
  const totalPages = sachPage.totalPages;
  const totalElements = sachPage.totalElements;
  const startItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = totalElements === 0 ? 0 : Math.min(currentPage * pageSize, totalElements);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleAddToCart = (book: BookForUI) => {
    const result = addToCart({
      maDauSach: book.maDauSach,
      maCuonSach: book.maCuonSach,
      tenDauSach: book.tenDauSach,
      anhBiaUrl: book.anhBiaUrl,
      tacGiaList: book.tacGiaList,
      nhaXuatBan: book.nhaXuatBan,
    });

    addNotification({
      type: result.success ? 'SUCCESS' : 'ERROR',
      message: result.message,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Cart Button */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              📚 Khám phá Kho Sách
            </h1>
            <p className="text-lg text-gray-600">
              Tìm kiếm và khám phá những cuốn sách yêu thích của bạn
            </p>
          </div>
          {/* Cart Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            <ShoppingCart size={20} />
            <span>Giỏ sách</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold border-2 border-white">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Toolbar */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none">
              <Search className="text-indigo-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sách, tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pl-12 pr-12 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category Filter Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`flex-shrink-0 rounded-full px-4 py-2 font-medium transition-all duration-300 border-2 ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              ✨ Tất cả
            </button>

            {categoriesLoading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 h-9 w-32 rounded-full bg-gray-200 animate-pulse border border-gray-200"
                ></div>
              ))
            ) : (
              categories.map((category) => (
                <button
                  key={category.maTheLoai}
                  onClick={() => setSelectedCategory(String(category.maTheLoai))}
                  className={`flex-shrink-0 rounded-full px-4 py-2 font-medium transition-all duration-300 border-2 whitespace-nowrap ${
                    selectedCategory === String(category.maTheLoai)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category.tenTheLoai}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <p className="text-sm font-medium text-gray-600">
              Tìm thấy{' '}
              <span className="font-bold text-indigo-600">{filteredBooks.length}</span>{' '}
              cuốn sách
              {selectedCategory !== 'ALL' &&
                ` trong thể loại "${
                  categories.find((c) => String(c.maTheLoai) === selectedCategory)
                    ?.tenTheLoai
                }"`}
            </p>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>

        {sachFetching && !isLoading && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs text-indigo-700">
            Đang tải trang dữ liệu mới...
          </div>
        )}

        {/* Books Grid */}
        <SectionContainer
          title={`${
            selectedCategory === 'ALL'
              ? '📖 Toàn bộ sách'
              : `📖 ${categories.find((c) => String(c.maTheLoai) === selectedCategory)?.tenTheLoai}`
          }`}
          description={
            filteredBooks.length > 0
              ? 'Nhấp vào cuốn sách để xem chi tiết hoặc thêm vào giỏ'
              : 'Không có cuốn sách nào phù hợp'
          }
        >
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex rounded-full bg-indigo-100 p-4 mb-4">
                <BookOpen className="text-indigo-400" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-4">
                Không tìm thấy cuốn sách nào
              </h3>
              <p className="text-gray-600 mt-2">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn thể loại khác
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                }}
                className="mt-6 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-300 hover:shadow-lg"
              >
                Xem tất cả sách
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.maDauSach}
                  book={book}
                  onSelect={setSelectedBook}
                  onAddToCart={handleAddToCart}
                  isInCart={isBookInCart(book.maDauSach)}
                />
              ))}
            </div>
          )}
        </SectionContainer>

        {/* Pagination info */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-gray-600">
              Đang hiển thị {startItem} đến {endItem} trong tổng số {totalElements} cuốn sách
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-gray-600" htmlFor="user-page-size-select">
                Hiển thị:
              </label>
              <select
                id="user-page-size-select"
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
      </div>

      {/* Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* Cart Drawer */}
      <BorrowCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </div>
  );
}
