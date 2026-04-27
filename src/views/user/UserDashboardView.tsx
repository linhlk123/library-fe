import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores';
import userApi from '../../services/userApi';
import { SectionContainer } from '../../components/shared/SectionContainer';
import { 
  BookOpen, 
  BookCheck, 
  AlertCircle, 
  DollarSign,
  ChevronRight,
  Sparkles 
} from 'lucide-react';
import type { BookForUI, DauSach } from '../../types';
import type { LucideIcon } from 'lucide-react';

// Skeleton Loading Component
const StatCardSkeleton = () => (
  <div className="rounded-2xl bg-white/70 backdrop-blur-md p-6 shadow-sm border border-white/50 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 w-24 rounded-lg bg-gray-200 mb-3"></div>
        <div className="h-8 w-16 rounded-lg bg-gray-200"></div>
      </div>
      <div className="h-12 w-12 rounded-xl bg-gray-200"></div>
    </div>
  </div>
);

const BookCardSkeleton = () => (
  <div className="rounded-xl bg-white/70 backdrop-blur-md overflow-hidden shadow-sm border border-white/50 animate-pulse">
    <div className="h-40 bg-gray-200 mb-3"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded-lg"></div>
      <div className="h-3 bg-gray-200 rounded-lg w-3/4"></div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  bgColor, 
  textColor, 
  iconBg 
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  iconBg: string;
}) => (
  <div className="rounded-2xl bg-white/70 backdrop-blur-md p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 hover:border-white/80">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`mt-2 text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className={`rounded-xl ${iconBg} p-3`}>
        <Icon className={`${bgColor}`} size={24} />
      </div>
    </div>
  </div>
);

// Book Recommendation Card
const BookRecommendCard = ({ book }: { book: BookForUI }) => (
  <button
    onClick={() => {}}
    className="group rounded-xl bg-white/70 backdrop-blur-md overflow-hidden shadow-sm border border-white/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-indigo-200 flex flex-col"
  >
    {/* Book cover placeholder */}
    <div className={`h-40 w-full bg-gray-200 relative flex-shrink-0`}>
      {book.anhBiaUrl ? (
        <img
          src={book.anhBiaUrl}
          alt={book.tenDauSach}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
          Không có ảnh bìa
        </div>
      )}
      {book.theLoai && (
        <div className="absolute top-2 left-2">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] uppercase font-bold px-2 py-1 rounded">
            {book.theLoai.tenTheLoai}
          </span>
        </div>
      )}
    </div>

    {/* Book info */}
    <div className="p-4 flex-1">
      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
        {book.tenDauSach}
      </h3>
      {book.tacGiaList && book.tacGiaList.length > 0 && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-1">
          {book.tacGiaList.map((a) => a.tenTacGia).join(', ')}
        </p>
      )}
      <div className="mt-3 flex items-center text-indigo-600 text-xs font-medium">
        <span>Khám phá</span>
        <ChevronRight size={14} className="ml-1" />
      </div>
    </div>
  </button>
);

export default function UserDashboardView() {
  const { user } = useAuthStore();

  // Fetch borrowings data
  const { data: borrowingsData, isLoading: borrowingsLoading } = useQuery({
    queryKey: ['borrowings'],
    queryFn: () => userApi.getAllPhieuMuonTra(),
    retry: 1,
  });

  // Fetch books data for recommendations
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['dausach-recent'],
    queryFn: () => userApi.getAllDauSach(),
    retry: 1,
  });

  const borrowings = borrowingsData?.data?.result ?? [];
  const allBooks = booksData?.data?.result ?? [];

  // Calculate stats
  const activeBorrowings = borrowings.filter((b) => !b.ngayTra);
  const totalBorrowings = borrowings.length;

  const overdueBorrowings = activeBorrowings.filter((b) => {
    const dueDate = new Date(b.ngayPhaiTra);
    return dueDate < new Date();
  });

  // Simulate fines (in real app, fetch from API)
  const totalFines = overdueBorrowings.length * 5000;

  // Get recent books as recommendations
  const recommendedBooks = (allBooks as Array<DauSach & Partial<BookForUI>>).slice(0, 5).map((book) => ({
    ...book,
    totalCopies: 1,
    availableCopies: 1,
    status: 'AVAILABLE' as const,
    tacGiaList: book.tacGiaList ?? [],
  })) as BookForUI[];

  const isLoading = borrowingsLoading || booksLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 md:p-12 text-white shadow-lg border border-indigo-400/20 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="text-sm font-medium text-indigo-100">Chào mừng trở lại</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              Xin chào, <span className="text-yellow-300">{user?.hoTen}!</span> 👋
            </h1>
            <p className="mt-3 text-indigo-100 text-lg">
              Khám phá thế giới sách và quản lý mượn sách của bạn một cách dễ dàng
            </p>
          </div>
        </div>

        {/* Stats Grid - Bento Layout */}
        <div className="grid gap-6 md:grid-cols-3">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Sách đang mượn"
                value={activeBorrowings.length}
                icon={BookCheck}
                bgColor="text-green-600"
                textColor="text-green-600"
                iconBg="bg-green-100/80 backdrop-blur-sm"
              />
              <StatCard
                title="Tiền phạt"
                value={`${totalFines.toLocaleString('vi-VN')} ₫`}
                icon={DollarSign}
                textColor={totalFines > 0 ? 'text-red-600' : 'text-gray-900'}
                bgColor={totalFines > 0 ? 'text-red-600' : 'text-gray-600'}
                iconBg={totalFines > 0 ? 'bg-red-100/80 backdrop-blur-sm' : 'bg-gray-100/80 backdrop-blur-sm'}
              />
              <StatCard
                title="Tổng số mượn"
                value={totalBorrowings}
                icon={BookOpen}
                bgColor="text-indigo-600"
                textColor="text-indigo-600"
                iconBg="bg-indigo-100/80 backdrop-blur-sm"
              />
            </>
          )}
        </div>

        {/* Overdue Alert */}
        {overdueBorrowings.length > 0 && (
          <div className="rounded-2xl bg-red-50/70 backdrop-blur-md border-2 border-red-200/50 p-6 flex items-start gap-4">
            <div className="rounded-lg bg-red-100/80 p-3 flex-shrink-0">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                ⚠️ Có {overdueBorrowings.length} cuốn sách quá hạn
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Vui lòng trả sách sớm để tránh phí phạt thêm
              </p>
            </div>
          </div>
        )}

        {/* Recent Borrowings */}
        <SectionContainer
          title="📚 Mượn gần đây"
          description={`${activeBorrowings.length} cuốn sách đang được mượn`}
        >
          {borrowingsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-white/70 backdrop-blur-md animate-pulse"></div>
              ))}
            </div>
          ) : activeBorrowings.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-600 font-medium">Bạn chưa mượn sách nào</p>
              <p className="text-gray-500 text-sm mt-1">Hãy khám phá kho sách của chúng tôi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBorrowings.slice(0, 5).map((borrowing) => (
                <div
                  key={borrowing.soPhieu}
                  className="flex items-center justify-between rounded-xl bg-white/70 backdrop-blur-md p-4 border border-white/50 hover:shadow-md transition-all duration-300 hover:border-indigo-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      📖 Phiếu #{borrowing.soPhieu}
                    </p>
                    <div className="mt-2 flex gap-6 text-sm text-gray-600">
                      <span>📅 Mượn: {new Date(borrowing.ngayMuon).toLocaleDateString('vi-VN')}</span>
                      <span>⏰ Hạn: {new Date(borrowing.ngayPhaiTra).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {new Date(borrowing.ngayPhaiTra) < new Date() ? (
                      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
                        ⚠️ Quá hạn
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                        ✓ Đang mượn
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionContainer>

        {/* Recommended Books */}
        <SectionContainer
          title="⭐ Sách gợi ý cho bạn"
          description="Những cuốn sách mới được thêm vào thư viện"
        >
          {booksLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : recommendedBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-600 font-medium">Chưa có sách gợi ý</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {recommendedBooks.map((book) => (
                <BookRecommendCard key={book.maDauSach} book={book} />
              ))}
            </div>
          )}
        </SectionContainer>
      </div>
    </div>
  );
}
