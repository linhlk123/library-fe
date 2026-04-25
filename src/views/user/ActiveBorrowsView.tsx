import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, TrendingDown, Loader2, History, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { lendingApi } from '../../services/lendingApi';
import { useAuthStore } from '../../stores';

interface BorrowRecord {
  soPhieu?: number;
  maCuonSach: number;
  tenDauSach: string;
  anhBiaUrl?: string;
  tacGia: string;
  ngayMuon: string;
  ngayHetHan: string;
  soNgayMuon: number;
  trangThai: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'RETURNED';
}

interface BorrowApiRecord {
  soPhieu?: number;
  maCuonSach?: number | string;
  tenDauSach?: string;
  anhBiaUrl?: string;
  tacGia?: string;
  ngayMuon?: string;
  ngayPhaiTra?: string;
  ngayHetHan?: string;
  soNgayMuon?: number;
  trangThai?: string;
}

interface BorrowStatus {
  record: BorrowRecord;
  daysRemaining: number;
  isOverdue: boolean;
  overdaysDays: number;
  fineAmount: number;
  progressPercent: number;
  dbStatus: string;
  statusLabel: string;
  statusBadgeClassName: string;
}

const STATUS_META: Record<string, { label: string; badgeClassName: string; cardClassName: string }> = {
  PENDING: {
    label: 'Chờ duyệt',
    badgeClassName: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    cardClassName: 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50',
  },
  ACTIVE: {
    label: 'Đang mượn',
    badgeClassName: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    cardClassName: 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50',
  },
  RETURNED: {
    label: 'Đã trả',
    badgeClassName: 'bg-green-100 text-green-700 ring-1 ring-green-200',
    cardClassName: 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50',
  },
  REJECTED: {
    label: 'Từ chối',
    badgeClassName: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
    cardClassName: 'border-rose-200 bg-gradient-to-r from-rose-50 to-red-50',
  },
};

const normalizeBorrowStatus = (status?: string): BorrowRecord['trangThai'] => {
  const normalized = (status || 'PENDING').toUpperCase();

  if (normalized === 'ĐANG_MƯỢN' || normalized === 'ACTIVE') {
    return 'ACTIVE';
  }

  if (normalized === 'ĐÃ_TRẢ' || normalized === 'RETURNED') {
    return 'RETURNED';
  }

  if (normalized === 'TRỄ_HẠN' || normalized === 'REJECTED') {
    return 'REJECTED';
  }

  return 'PENDING';
};

const calculateBorrowStatus = (record: BorrowRecord): BorrowStatus => {
  const dbStatus = normalizeBorrowStatus(record.trangThai);
  const statusMeta = STATUS_META[dbStatus] || STATUS_META.PENDING;
  const now = new Date();
  const dueDate = new Date(record.ngayHetHan);
  const borrowStart = new Date(record.ngayMuon);
  const totalBorrowTime = record.soNgayMuon || 4;

  const isClosed = dbStatus === 'RETURNED' || dbStatus === 'REJECTED';
  const timeDiff = dueDate.getTime() - now.getTime();
  const daysRemaining = isClosed ? 0 : Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const borrowedTime = (now.getTime() - borrowStart.getTime()) / (1000 * 60 * 60 * 24);
  const progressPercent = isClosed
    ? dbStatus === 'RETURNED'
      ? 100
      : 0
    : Math.min((borrowedTime / totalBorrowTime) * 100, 100);

  const isOverdue = !isClosed && daysRemaining < 0;
  const overduesDays = isOverdue ? Math.abs(daysRemaining) : 0;
  const fineAmount = overduesDays * 1000;

  return {
    record,
    daysRemaining: Math.max(daysRemaining, 0),
    isOverdue,
    overdaysDays: overduesDays,
    fineAmount,
    progressPercent: Math.max(progressPercent, 0),
    dbStatus,
    statusLabel: statusMeta.label,
    statusBadgeClassName: statusMeta.badgeClassName,
  };
};


const ActiveBorrowsView: React.FC = () => {
  const { user } = useAuthStore();
  const maDocGia = user?.tenDangNhap || localStorage.getItem('maDocGia');

  useEffect(() => {
    document.title = 'Lịch sử mượn sách';
  }, []);

  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ['borrow-history', maDocGia],
    queryFn: () => lendingApi.phieuMuonTra.getByMaDocGia(maDocGia || ''), 
    enabled: !!maDocGia,
  });

// 2. Mapping dữ liệu từ PhieuMuonTraResponseDTO
  const borrows: BorrowRecord[] = useMemo(() => {
    // Trích xuất mảng an toàn
    const rawList = (Array.isArray(apiData)
      ? apiData
      : Array.isArray(apiData?.data)
        ? apiData.data
        : Array.isArray(apiData?.data?.result)
          ? apiData.data.result
          : []) as unknown as BorrowApiRecord[];

    return rawList
      .map((phieu) => ({
        // 🎯 FALLBACK: Nếu thiếu mã cuốn sách thì mượn tạm soPhieu làm Key để React không bị lỗi
        soPhieu: phieu.soPhieu,
        maCuonSach: Number(phieu.maCuonSach ?? phieu.soPhieu ?? 0), 
        tenDauSach: phieu.tenDauSach || `Phiếu mượn số #${phieu.soPhieu}`, 
        anhBiaUrl: phieu.anhBiaUrl,   
        tacGia: phieu.tacGia || 'Đang cập nhật...',         
        ngayMuon: phieu.ngayMuon || new Date().toISOString(),
        ngayHetHan: phieu.ngayPhaiTra || phieu.ngayHetHan || new Date().toISOString(),
        soNgayMuon: phieu.soNgayMuon || 4, 
        trangThai: normalizeBorrowStatus(phieu.trangThai),
      }))
      .sort((a, b) => new Date(b.ngayMuon).getTime() - new Date(a.ngayMuon).getTime());
  }, [apiData]);
  // 3. TÍNH TOÁN TRẠNG THÁI TIẾN ĐỘ & TRỄ HẠN
  const borrowsStatus = useMemo(
    () => borrows.map(calculateBorrowStatus),
    [borrows]
  );

  const overdueCount = borrowsStatus.filter(b => b.isOverdue).length;
  const totalFine = borrowsStatus.reduce((sum, b) => sum + b.fineAmount, 0);
  const pendingCount = borrowsStatus.filter(b => b.dbStatus === 'PENDING').length;
  const activeCount = borrowsStatus.filter(b => b.dbStatus === 'ACTIVE').length;
  const returnedCount = borrowsStatus.filter(b => b.dbStatus === 'RETURNED').length;
  const rejectedCount = borrowsStatus.filter(b => b.dbStatus === 'REJECTED').length;

  // ─── XỬ LÝ RENDER CÁC TRẠNG THÁI TRỐNG/LỖI/LOADING ───────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-2">Đang tải lịch sử mượn sách...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center text-red-500">
        <AlertCircle size={48} className="mb-2 mx-auto" />
        <p>Lỗi khi lấy dữ liệu mượn sách. Vui lòng tải lại trang.</p>
      </div>
    );
  }

  if (borrowsStatus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
          <History className="text-blue-600" size={28} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Không có lịch sử mượn sách</h3>
        <p className="text-sm text-gray-600 mt-2">
          Bạn chưa có phiếu mượn nào trong hệ thống.
        </p>
      </div>
    );
  }

  // ─── RENDER GIAO DIỆN CHÍNH ──────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-900 text-white p-3">
            <History size={22} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Lịch sử mượn sách</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Lịch sử mượn sách</h2>
            <p className="mt-1 text-sm text-slate-600">
              Theo dõi toàn bộ phiếu mượn, từ chờ duyệt đến đã trả hoặc bị từ chối.
            </p>
          </div>
        </div>
      </div>

      {/* ─── WARNING SECTION (if overdue) ─────────────────────────────── */}
      {overdueCount > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900">Cảnh báo: Sách quá hạn!</h4>
            <p className="text-sm text-red-800 mt-1">
              Bạn có <span className="font-bold">{overdueCount}</span> cuốn sách đã quá hạn trả.{' '}
              <span className="font-bold">Tổng phạt: {totalFine.toLocaleString()}đ</span>
            </p>
            <button className="mt-2 text-sm font-semibold text-red-700 hover:text-red-900 underline">
              Trả sách ngay
            </button>
          </div>
        </div>
      )}

      {/* ─── HEADER STATS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-900">{pendingCount}</p>
          <p className="text-xs text-amber-700">PENDING</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-900">
            {activeCount}
          </p>
          <p className="text-xs text-blue-700">ACTIVE</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-900">{returnedCount}</p>
          <p className="text-xs text-green-700">RETURNED</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-red-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-rose-900">{rejectedCount}</p>
          <p className="text-xs text-rose-700">REJECTED</p>
        </div>
      </div>

      {/* ─── BORROW CARDS ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {borrowsStatus.map((status) => (
          <div
            key={status.record.soPhieu ?? status.record.maCuonSach}
            className={`rounded-lg border-2 overflow-hidden transition-all ${
              status.dbStatus === 'RETURNED' || status.dbStatus === 'REJECTED'
                ? STATUS_META[status.dbStatus]?.cardClassName || STATUS_META.PENDING.cardClassName
                : status.isOverdue
                  ? 'border-red-200 bg-gradient-to-r from-red-50 to-orange-50'
                  : status.progressPercent > 80
                  ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50'
                  : 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
            }`}
          >
            {/* ─── CARD HEADER ───────────────────────────────────── */}
            <div className="flex gap-4 p-4">
              {/* Cover Image */}
              <div className="flex-shrink-0 w-20 h-24 rounded-lg bg-gray-300 overflow-hidden shadow-md">
                {status.record.anhBiaUrl ? (
                  <img
                    src={status.record.anhBiaUrl}
                    alt={status.record.tenDauSach}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs text-center px-1">
                    Không ảnh bìa
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                    #{status.record.soPhieu ?? status.record.maCuonSach}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${status.statusBadgeClassName}`}>
                    {status.statusLabel}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 line-clamp-2">
                  {status.record.tenDauSach}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{status.record.tacGia}</p>

                {/* Status Badge & Days */}
                <div className="flex items-center gap-2 mt-2">
                  {status.dbStatus === 'RETURNED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                      <CheckCircle2 size={12} /> Đã hoàn tất
                    </span>
                  ) : status.dbStatus === 'REJECTED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500 text-white text-xs font-bold">
                      <XCircle size={12} /> Bị từ chối
                    </span>
                  ) : status.dbStatus === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-bold">
                      <Clock3 size={12} /> Chờ thủ thư duyệt
                    </span>
                  ) : status.isOverdue ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                      🚨 Trễ {status.overdaysDays} ngày
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        status.daysRemaining <= 1
                          ? 'bg-orange-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {status.daysRemaining === 0
                        ? '⏰ Hôm nay trả'
                        : `${status.daysRemaining} ngày còn`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── PROGRESS BAR ──────────────────────────────────── */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">Tiến độ mượn</span>
                <span className="text-xs text-gray-600">{Math.round(status.progressPercent)}%</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden border border-white/30">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    status.dbStatus === 'RETURNED'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : status.dbStatus === 'REJECTED'
                        ? 'bg-gradient-to-r from-rose-500 to-red-500'
                        : status.isOverdue
                      ? 'bg-gradient-to-r from-red-600 to-red-500'
                      : status.progressPercent > 80
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(status.progressPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* ─── OVERDUE FINE INFO (if applicable) ───────────────────── */}
            {status.isOverdue && (
              <div className="px-4 pb-4 pt-2 border-t border-red-200">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="text-red-600" size={16} />
                  <span className="text-red-900 font-semibold">
                    Phạt trễ: <span className="text-red-700">{status.fineAmount.toLocaleString()}đ</span>
                  </span>
                </div>
              </div>
            )}

            {/* ─── FOOTER INFO ───────────────────────────────────── */}
            <div className="px-4 py-3 bg-white/30 border-t border-gray-200/50 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Ngày mượn</p>
                <p className="font-semibold text-gray-900">
                  {new Date(status.record.ngayMuon).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Hạn trả</p>
                <p className={`font-semibold ${
                  status.isOverdue ? 'text-red-700' : 'text-gray-900'
                }`}>
                  {new Date(status.record.ngayHetHan).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* ─── ACTION BUTTONS ────────────────────────────────────────── */}
            <div className="px-4 py-3 flex gap-2 bg-white/50 border-t border-gray-200/50">
              {status.dbStatus === 'ACTIVE' ? (
                <button className="flex-1 py-2 px-3 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">
                  Trả sách ngay
                </button>
              ) : status.dbStatus === 'PENDING' ? (
                <>
                  <button className="flex-1 py-2 px-3 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm hover:bg-blue-200 transition-colors">
                    Chi tiết
                  </button>
                  <button className="flex-1 py-2 px-3 rounded-lg bg-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-200 transition-colors">
                    Chờ duyệt
                  </button>
                </>
              ) : (
                <button className="flex-1 py-2 px-3 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
                  Chi tiết
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── REGULATIONS INFO ──────────────────────────────────────────── */}
      <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
        <h4 className="font-bold text-gray-900 mb-3">📋 Quy định mượn sách</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <p>Thời gian mượn tối đa: <span className="font-semibold">4 ngày</span></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <p>Phí trả trễ: <span className="font-semibold">1.000đ/ngày</span></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <p>Tối đa có thể mượn: <span className="font-semibold">5 cuốn</span> cùng một lúc</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveBorrowsView;