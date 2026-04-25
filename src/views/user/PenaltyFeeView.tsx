import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  CreditCard,
  BookOpen,
  Target,
} from 'lucide-react';
import { lendingApi } from '../../services/lendingApi';
import { useAuthStore } from '../../stores';
import type { TrangThaiPhieuMuon, PhieuThuTienPhat } from '../../types';

// ─── Types ────────────────────────────────────────────────────────
// THÊM INTERFACE NÀY VÀO ĐÂY:
export interface PhieuMuonTra {
  soPhieu?: number;           // Legacy field
  maCuonSach: number;
  maDocGia: string;
  ngayMuon: string;
  ngayPhaiTra: string;
  ngayTra?: string;
  soNgayMuon?: number;        // Number of rental days
  tienPhat: number;
  maNhanVien: string;
  trangThai?: TrangThaiPhieuMuon;  // For manager view
}

interface PenaltyRecord {
  slip: PhieuMuonTra;
  bookName: string;
  daysLate: number;
  fineAmount: number;
  reason: string;
}

interface PenaltyStats {
  penaltyRecords: PenaltyRecord[];
  totalFine: number;
  totalPaid: number;
  remainingDebt: number;
  hasDebt: boolean;
}

// ─── Constants ────────────────────────────────────────────────────
const REGULATIONS = [
  { icon: '📅', text: 'Thời gian mượn tối đa: 4 ngày' },
  { icon: '💰', text: 'Phí trả trễ: 1.000đ/ngày' },
  { icon: '📚', text: 'Tối đa có thể mượn: 5 cuốn cùng một lúc' },
];

// ─── Utilities ────────────────────────────────────────────────────
const calculateDaysLate = (dueDate: string, returnDate?: string): number => {
  const due = new Date(dueDate);
  const returned = returnDate ? new Date(returnDate) : new Date();
  const diffMs = returned.getTime() - due.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const calculateFine = (daysLate: number): number => {
  const PENALTY_PER_DAY = 1000; // 1,000đ per day
  return Math.max(0, daysLate * PENALTY_PER_DAY);
};

const isPenaltized = (slip: PhieuMuonTra): boolean => {
  // Has explicit penalty amount
  if (slip.tienPhat && slip.tienPhat > 0) {
    return true;
  }

  // Overdue without return date
  const now = new Date();
  const dueDate = new Date(slip.ngayPhaiTra);
  const isOverdue = now > dueDate;
  const hasNotReturned = !slip.ngayTra;

  return isOverdue && hasNotReturned;
};

const getPenaltyStats = (
  slips: PhieuMuonTra[],
  payments: PhieuThuTienPhat[] = []
): PenaltyStats => {
  const penaltyRecords: PenaltyRecord[] = slips
    .filter(isPenaltized)
    .map((slip) => {
      const daysLate = calculateDaysLate(slip.ngayPhaiTra, slip.ngayTra);
      const fineAmount = slip.tienPhat > 0 ? slip.tienPhat : calculateFine(daysLate);
      const bookName =
        (slip as PhieuMuonTra & { tenDauSach?: string }).tenDauSach ||
        `Sách (ID: ${slip.maCuonSach})`;

      return {
        slip,
        bookName,
        daysLate,
        fineAmount,
        reason:
          daysLate > 0
            ? `Trả trễ ${daysLate} ngày`
            : 'Vi phạm quy định thư viện',
      };
    });

  const totalFine = penaltyRecords.reduce((sum, record) => sum + record.fineAmount, 0);
  
  // Calculate total paid from payment records
  const totalPaid = payments.reduce((sum, payment) => sum + payment.soTienThu, 0);
  
  // Remaining debt = total fine - total paid
  const remainingDebt = Math.max(0, totalFine - totalPaid);

  return {
    penaltyRecords,
    totalFine,
    totalPaid,
    remainingDebt,
    hasDebt: remainingDebt > 0,
  };
};

// ─── Skeleton Loaders ────────────────────────────────────────────
const SkeletonHero = () => (
  <div className="mb-8 rounded-2xl bg-gradient-to-r from-red-50 to-rose-100 p-8 animate-pulse">
    <div className="mb-4 h-8 w-40 rounded bg-red-200/50" />
    <div className="mb-6 h-12 w-32 rounded bg-red-200/50" />
    <div className="h-12 w-32 rounded bg-red-400/50" />
  </div>
);

const SkeletonItem = () => (
  <div className="rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
    <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
    <div className="h-4 w-1/3 rounded bg-gray-200" />
  </div>
);

const SkeletonList = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <SkeletonItem key={i} />
    ))}
  </div>
);

// ─── Hero Card - With Debt ────────────────────────────────────────
interface HeroCardWithDebtProps {
  totalFine: number;
  totalPaid: number;
  remainingDebt: number;
}

const HeroCardWithDebt: React.FC<HeroCardWithDebtProps> = ({ totalFine, totalPaid, remainingDebt }) => {
  const paymentProgress = totalFine > 0 ? (totalPaid / totalFine) * 100 : 0;

  return (
    <div className="mb-8 rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-100 p-8 shadow-lg">
      <div className="flex items-center justify-between gap-8">
        <div className="flex-1">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
            Còn nợ phí phạt
          </p>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-5xl font-bold text-red-700">
              {remainingDebt.toLocaleString('vi-VN')}
            </h2>
            <span className="text-xl font-semibold text-red-600">đ</span>
          </div>

          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-600 font-medium">Đã thanh toán</span>
              <span className="text-red-700 font-semibold">
                {totalPaid.toLocaleString('vi-VN')}đ / {totalFine.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="h-2 rounded-full bg-red-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-300"
                style={{ width: `${paymentProgress}%` }}
              />
            </div>
            <p className="text-xs text-red-600">
              {Math.round(paymentProgress)}% đã thanh toán
            </p>
          </div>

          <p className="mt-4 text-sm text-red-600">
            Vui lòng thanh toán để duy trì trạng thái tài khoản
          </p>
        </div>
        <div className="flex-shrink-0">
          <AlertCircle size={48} className="text-red-400" />
        </div>
      </div>

      <button className="mt-6 flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-700 hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0">
        <CreditCard size={20} />
        Thanh toán trực tuyến
      </button>
    </div>
  );
};

// ─── Hero Card - No Debt (Success) ────────────────────────────────
const HeroCardNoDebt = () => (
  <div className="mb-8 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-100 p-8 shadow-lg">
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <CheckCircle2 size={48} className="text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-green-700">
          Bạn không có khoản nợ nào
        </h2>
        <p className="mt-1 text-green-600">
          Tài khoản của bạn trạng thái tốt. Tiếp tục thưởng thức việc mượn sách!
        </p>
      </div>
    </div>
  </div>
);

// ─── Penalty List Item ────────────────────────────────────────────
interface PenaltyItemProps {
  record: PenaltyRecord;
}

const PenaltyItem: React.FC<PenaltyItemProps> = ({ record }) => (
  <div className="rounded-lg border border-red-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-3 flex items-start justify-between">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{record.bookName}</h4>
        <p className="text-xs text-gray-500 mt-1">
          Mã phiếu: <span className="font-mono font-semibold">{record.slip.soPhieu}</span>
        </p>
      </div>
      <div className="flex-shrink-0 rounded-lg bg-red-100 px-3 py-2 text-right">
        <p className="text-lg font-bold text-red-700">
          {record.fineAmount.toLocaleString('vi-VN')}đ
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 text-sm text-gray-600">
      <TrendingDown size={16} className="text-red-500 flex-shrink-0" />
      <span>{record.reason}</span>
    </div>
  </div>
);

// ─── Regulations Section ──────────────────────────────────────────
const RegulationsSection = () => (
  <div className="mt-12 rounded-xl border-l-4 border-blue-400 bg-blue-50 p-6">
    <div className="flex items-start gap-3">
      <BookOpen size={24} className="mt-1 text-blue-600 flex-shrink-0" />
      <div>
        <h3 className="mb-4 text-lg font-bold text-blue-900">
          Quy định nộp phạt của thư viện
        </h3>
        <ul className="space-y-3">
          {REGULATIONS.map((reg, idx) => (
            <li key={idx} className="flex items-center gap-3 text-blue-800">
              <span className="text-lg">{reg.icon}</span>
              <span>{reg.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-blue-600">
          Mọi thắc mắc liên quan đến phí phạt vui lòng liên hệ với quầy phục vụ.
        </p>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────
const PenaltyFeeView: React.FC = () => {
  const { user } = useAuthStore();
  const maDocGia = user?.tenDangNhap;

  // ─── Data Fetching: Borrow Slips ──────────────────────────────
  const { data: borrowSlips, isLoading: isLoadingSlips, error: errorSlips } = useQuery({
    queryKey: ['penalty-fees', maDocGia],
    queryFn: async () => {
      if (!maDocGia) throw new Error('User not authenticated');
      const response = await lendingApi.phieuMuonTra.getByMaDocGia(maDocGia);
      return response.data?.result || [];
    },
    enabled: !!maDocGia,
  });

  // ─── Data Fetching: Payment Records ───────────────────────────
  const { data: paymentRecords = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payment-records', maDocGia],
    queryFn: async () => {
      if (!maDocGia) throw new Error('User not authenticated');
      const response = await lendingApi.phieuThuTienPhat.getAll();
      const allPayments = response.data?.result || [];
      // Filter payments for this user
      return allPayments.filter((p) => p.maDocGia === maDocGia);
    },
    enabled: !!maDocGia,
  });

  // ─── Calculate Penalty Stats ─────────────────────────────────
  const penaltyStats = useMemo(() => {
    if (!borrowSlips) return { penaltyRecords: [], totalFine: 0, totalPaid: 0, remainingDebt: 0, hasDebt: false };
    return getPenaltyStats(borrowSlips, paymentRecords);
  }, [borrowSlips, paymentRecords]);

  const isLoading = isLoadingSlips || isLoadingPayments;
  const error = errorSlips;

  // ─── Render: Loading State ───────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Quản lý Vi phạm & Phí phạt
          </h1>
          <p className="text-gray-600">
            Xem và quản lý các khoản phí phạt của bạn từ thư viện
          </p>
        </div>

        {/* Loading Skeleton */}
        <SkeletonHero />
        <SkeletonList />
      </div>
    );
  }

  // ─── Render: Error State ──────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Quản lý Vi phạm & Phí phạt
          </h1>
          <p className="text-gray-600">
            Xem và quản lý các khoản phí phạt của bạn từ thư viện
          </p>
        </div>

        {/* Error Card */}
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-6">
          <div className="flex items-center gap-4">
            <AlertCircle size={32} className="text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">
                Không thể tải dữ liệu
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error instanceof Error
                  ? error.message
                  : 'Đã xảy ra lỗi khi tải danh sách phí phạt. Vui lòng thử lại sau.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: No Debt State ────────────────────────────────────
  if (!penaltyStats.hasDebt) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Quản lý Vi phạm & Phí phạt
          </h1>
          <p className="text-gray-600">
            Xem và quản lý các khoản phí phạt của bạn từ thư viện
          </p>
        </div>

        {/* Hero Card - No Debt */}
        <HeroCardNoDebt />

        {/* Regulations */}
        <RegulationsSection />
      </div>
    );
  }

  // ─── Render: With Debt State ──────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Quản lý Vi phạm & Phí phạt
        </h1>
        <p className="text-gray-600">
          Xem và quản lý các khoản phí phạt của bạn từ thư viện
        </p>
      </div>

      {/* Hero Card - With Debt */}
      <HeroCardWithDebt totalFine={penaltyStats.totalFine} totalPaid={penaltyStats.totalPaid} remainingDebt={penaltyStats.remainingDebt} />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-600">
                Tổng nợ ban đầu
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {penaltyStats.totalFine.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-600">
                Đã thanh toán
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {penaltyStats.totalPaid.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-600">
                Còn phải thanh toán
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-600">
                {penaltyStats.remainingDebt.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3">
              <TrendingDown size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-600">
                Vi phạm
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {penaltyStats.penaltyRecords.length}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Target size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Penalty List */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Danh sách chi tiết vi phạm
        </h2>
        <div className="space-y-3">
          {penaltyStats.penaltyRecords.map((record, idx) => (
            <PenaltyItem key={`${record.slip.soPhieu}-${idx}`} record={record} />
          ))}
        </div>
      </div>

      {/* Regulations */}
      <RegulationsSection />
    </div>
  );
};

export default PenaltyFeeView;
