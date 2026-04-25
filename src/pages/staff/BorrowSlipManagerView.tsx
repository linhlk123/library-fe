import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Edit2, Trash2, AlertTriangle, Check, X, Clock } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import { staffApi } from '../../services/staffApi';
import type { PhieuMuonTra } from '../../types';
import { useUIStore } from '../../stores';
import { isPendingBorrowStatus } from '../../utils/borrowStatus';

interface PhieuMuonTraData extends PhieuMuonTra {
  hoTenDocGia?: string;
}

/**
 * Get valid next status transitions for current status
 */
const getValidNextStatuses = (currentStatus: string): Array<{ status: string; label: string; color: string; icon: string }> => {
  const normalizedStatus = currentStatus?.toUpperCase().replace(/\s+/g, '_') || 'PENDING';

  const transitions: Record<string, Array<{ status: string; label: string; color: string; icon: string }>> = {
    'PENDING': [
      { status: 'ACTIVE', label: 'Duyệt (Đang mượn)', color: 'bg-blue-600 hover:bg-blue-700', icon: '✓' },
      { status: 'REJECTED', label: 'Từ chối', color: 'bg-red-600 hover:bg-red-700', icon: '✕' },
    ],
    'CHO_DUYET': [
      { status: 'ACTIVE', label: 'Duyệt (Đang mượn)', color: 'bg-blue-600 hover:bg-blue-700', icon: '✓' },
      { status: 'REJECTED', label: 'Từ chối', color: 'bg-red-600 hover:bg-red-700', icon: '✕' },
    ],
    'ĐANG_MƯỢN': [
      { status: 'RETURNED', label: 'Đã trả', color: 'bg-green-600 hover:bg-green-700', icon: '✓' },
      { status: 'REJECTED', label: 'Hủy', color: 'bg-red-600 hover:bg-red-700', icon: '✕' },
    ],
    'ACTIVE': [
      { status: 'RETURNED', label: 'Đã trả', color: 'bg-green-600 hover:bg-green-700', icon: '✓' },
      { status: 'REJECTED', label: 'Hủy', color: 'bg-red-600 hover:bg-red-700', icon: '✕' },
    ],
    'ĐÃ_TRẢ': [],
    'RETURNED': [],
    'REJECTED': [],
  };

  return transitions[normalizedStatus] || [];
};

/**
 * Get status display label
 */
const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'PENDING': 'Chờ duyệt',
    'CHO_DUYET': 'Chờ duyệt',
    'ACTIVE': 'Đang mượn',
    'ĐANG_MƯỢN': 'Đang mượn',
    'RETURNED': 'Đã trả',
    'ĐÃ_TRẢ': 'Đã trả',
    'REJECTED': 'Từ chối',
  };
  return labelMap[status.toUpperCase().replace(/\s+/g, '_')] || status;
};

const BorrowSlipManagerView = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  const [selectedSlip, setSelectedSlip] = useState<PhieuMuonTraData | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmStatusUpdate, setShowConfirmStatusUpdate] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    maCuonSach: 0,
    maDocGia: '',
    ngayMuon: '',
    ngayPhaiTra: '',
    ngayTra: '',
    soNgayMuon: 0,
    tienPhat: 0,
    maNhanVien: '',
  });

  const previousPendingCountRef = useRef<number>(0);
  const hasHydratedRef = useRef(false);

  const {
    data: pendingSlips = [],
    isLoading,
    isFetching,
    error: pendingError,
  } = useQuery({
    queryKey: ['staff-borrow-pending-slips'],
    queryFn: async () => {
      const response = await staffApi.borrowSlips.getAll();
      const allSlips = (response.data?.result ?? []) as PhieuMuonTraData[];
      return allSlips.filter((slip) => isPendingBorrowStatus(slip.trangThai));
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (pendingError) {
      setError('Không tải được danh sách phiếu mượn chờ duyệt.');
      return;
    }

    setError(null);
  }, [pendingError]);

  useEffect(() => {
    const currentCount = pendingSlips.length;

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      previousPendingCountRef.current = currentCount;
      return;
    }

    if (currentCount > previousPendingCountRef.current) {
      const newItems = currentCount - previousPendingCountRef.current;
      addNotification({
        type: 'INFO',
        message: `🎉 Có ${newItems} yêu cầu mượn sách mới vừa được gửi!`,
      });
    }

    previousPendingCountRef.current = currentCount;
  }, [addNotification, pendingSlips.length]);

  /**
   * Validate form data before submission
   */
  const validateFormData = (): string | null => {
    if (!editForm.ngayPhaiTra) {
      return 'Hạn trả không được để trống.';
    }

    if (editForm.soNgayMuon < 0) {
      return 'Số ngày mượn không được là số âm.';
    }

    if (editForm.tienPhat < 0) {
      return 'Tiền phạt không được là số âm.';
    }

    const ngayMuon = new Date(editForm.ngayMuon);
    const ngayPhaiTra = new Date(editForm.ngayPhaiTra);

    if (ngayPhaiTra <= ngayMuon) {
      return 'Hạn trả phải sau ngày mượn.';
    }

    return null;
  };

  /**
   * Handle status update action
   */
  const handleStatusUpdate = (slip: PhieuMuonTraData, newStatus: string) => {
    setSelectedSlip(slip);
    setPendingStatusUpdate(newStatus);
    setShowConfirmStatusUpdate(true);
  };

  /**
   * Confirm and execute status update
   */
  const handleConfirmStatusUpdate = async () => {
    if (!selectedSlip || !pendingStatusUpdate) return;

    try {
      setUpdatingStatus(true);
      setError(null);

      // Build payload with only status change
      const payload = {
        maCuonSach: selectedSlip.maCuonSach,
        maDocGia: selectedSlip.maDocGia,
        ngayMuon: selectedSlip.ngayMuon,
        ngayPhaiTra: selectedSlip.ngayPhaiTra,
        ngayTra: selectedSlip.ngayTra || null,
        soNgayMuon: selectedSlip.soNgayMuon,
        tienPhat: selectedSlip.tienPhat,
        maNhanVien: localStorage.getItem('maNhanVien') || '',
        trangThai: pendingStatusUpdate,
      };

      await staffApi.borrowSlips.update(String(selectedSlip.soPhieu!), payload);

      const newStatusLabel = getStatusLabel(pendingStatusUpdate);
      addNotification({
        type: 'SUCCESS',
        message: `✓ Cập nhật trạng thái thành ${newStatusLabel} thành công!`,
      });

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['staff-borrow-pending-slips'] });

      setShowConfirmStatusUpdate(false);
      setPendingStatusUpdate(null);
      setSelectedSlip(null);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as Record<string, unknown>).response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (data && typeof data === 'object' && 'message' in data) {
            setError(String((data as Record<string, unknown>).message));
            return;
          }
        }
      }
      setError('⚠️ Cập nhật trạng thái thất bại.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRowClick = (slip: PhieuMuonTraData) => {
    setSelectedSlip(slip);
    setEditForm({
      maCuonSach: slip.maCuonSach || 0,
      maDocGia: slip.maDocGia || '',
      ngayMuon: slip.ngayMuon || '',
      ngayPhaiTra: slip.ngayPhaiTra || '',
      ngayTra: slip.ngayTra || '',
      soNgayMuon: slip.soNgayMuon || 0,
      tienPhat: slip.tienPhat || 0,
      maNhanVien: localStorage.getItem('maNhanVien') || '',
    });
    setShowDrawer(true);
    setError(null);
    setMessage(null);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setSelectedSlip(null);
    setEditForm({
      maCuonSach: 0,
      maDocGia: '',
      ngayMuon: '',
      ngayPhaiTra: '',
      ngayTra: '',
      soNgayMuon: 0,
      tienPhat: 0,
      maNhanVien: '',
    });
    setError(null);
    setMessage(null);
  };

  /**
   * Handle ngayTra change with auto-calculation of soNgayMuon and tienPhat
   */
  const handleNgayTraChange = (ngayTra: string) => {
    setEditForm((prev) => {
      const newForm = { ...prev, ngayTra };

      if (ngayTra && prev.ngayMuon) {
        // Calculate days borrowed
        const muonDate = new Date(prev.ngayMuon);
        const traDate = new Date(ngayTra);
        const diffTime = traDate.getTime() - muonDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        newForm.soNgayMuon = Math.max(diffDays, 0);

        // Calculate fine if returned late
        const hoanHanDate = new Date(prev.ngayPhaiTra);
        if (traDate > hoanHanDate) {
          const lateDay = Math.ceil(
            (traDate.getTime() - hoanHanDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          newForm.tienPhat = lateDay * 1000; // 1000 VNĐ per late day
        } else {
          newForm.tienPhat = 0;
        }
      }

      return newForm;
    });
  };

  const handleUpdateSlip = async () => {
    if (!selectedSlip) return;

    // Validate form
    const validationError = validateFormData();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      // Build payload matching API specification
      const payload = {
        maCuonSach: editForm.maCuonSach,
        maDocGia: editForm.maDocGia,
        ngayMuon: editForm.ngayMuon,
        ngayPhaiTra: editForm.ngayPhaiTra,
        ngayTra: editForm.ngayTra || null,
        soNgayMuon: editForm.soNgayMuon,
        tienPhat: editForm.tienPhat,
        maNhanVien: editForm.maNhanVien,
      };

      const response = await staffApi.borrowSlips.update(String(selectedSlip.soPhieu!), payload);

      setMessage(response.data?.message ?? '✓ Cập nhật phiếu mượn trả thành công!');

      // Update reader's debt if there are fines
      if (editForm.tienPhat > 0) {
        await staffApi.updateReaderDebt(editForm.maDocGia);
      }

      // Update state with new data
      await queryClient.invalidateQueries({ queryKey: ['staff-borrow-pending-slips'] });

      setTimeout(() => {
        handleCloseDrawer();
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as Record<string, unknown>).response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (data && typeof data === 'object' && 'message' in data) {
            setError(String((data as Record<string, unknown>).message));
          }
        }
      }
      if (!error) {
        setError('⚠️ Cập nhật phiếu mượn trả thất bại.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSlip = async () => {
    if (!selectedSlip) return;

    try {
      setDeleting(true);
      setError(null);
      const response = await staffApi.borrowSlips.delete(String(selectedSlip.soPhieu!));

      setMessage(response.data?.message ?? '✓ Xóa phiếu mượn thành công!');

      // Update reader's debt after deletion
      if (selectedSlip.tienPhat && selectedSlip.tienPhat > 0) {
        await staffApi.updateReaderDebt(selectedSlip.maDocGia);
      }

      // Remove from state
      await queryClient.invalidateQueries({ queryKey: ['staff-borrow-pending-slips'] });

      setTimeout(() => {
        setShowConfirmDelete(false);
        handleCloseDrawer();
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as Record<string, unknown>).response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (data && typeof data === 'object' && 'message' in data) {
            setError(String((data as Record<string, unknown>).message));
          }
        }
      }
      setError('⚠️ Xóa phiếu mượn thất bại.');
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock size={14} /> },
      ĐANG_MƯỢN: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Clock size={14} /> },
      ĐÃ_TRẢ: { bg: 'bg-green-100', text: 'text-green-700', icon: <Check size={14} /> },
      TRỄ_HẠN: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertTriangle size={14} /> },
    };
    const config = statusMap[status] || statusMap.PENDING;
    return (
      <div className={`${config.bg} ${config.text} inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.icon}
        {status}
      </div>
    );
  };

  /**
   * Calculate number of days between two dates
   */
  const calculateDaysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Calculate overdue information
   */
  const calculateOverdueInfo = (
    ngayPhaiTra: string,
    ngayTra: string | undefined
  ): { overdueDays: number; isOverdue: boolean } => {
    if (!ngayTra) {
      return { overdueDays: 0, isOverdue: false };
    }

    const dueDate = new Date(ngayPhaiTra);
    const returnDate = new Date(ngayTra);

    if (returnDate > dueDate) {
      const diffTime = returnDate.getTime() - dueDate.getTime();
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { overdueDays, isOverdue: true };
    }

    return { overdueDays: 0, isOverdue: false };
  };

  return (
    <SectionContainer
      title="Quản lý Phiếu Mượn/Trả"
      description="Quản lý, cập nhật trạng thái và gia hạn phiếu mượn sách cho độc giả."
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border border-indigo-200 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            {isFetching && (
              <div className="border-b border-indigo-100 bg-indigo-50 px-6 py-2 text-xs text-indigo-700">
                Đang cập nhật yêu cầu mới...
              </div>
            )}
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Mã Phiếu</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Độc Giả</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Ngày Mượn</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Hạn Trả</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Trạng Thái</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {pendingSlips.map((slip) => (
                  <tr
                    key={slip.soPhieu}
                    onClick={() => handleRowClick(slip)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{slip.soPhieu}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{slip.maDocGia}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(slip.ngayMuon).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(slip.ngayPhaiTra).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(slip.trangThai || 'PENDING')}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {getValidNextStatuses(slip.trangThai || 'PENDING').map((action) => (
                          <button
                            key={action.status}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(slip, action.status);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-white ${action.color} transition-colors`}
                          >
                            {action.icon} {action.label}
                          </button>
                        ))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(slip);
                          }}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                        >
                          <Edit2 size={16} />
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pendingSlips.length === 0 && !isLoading && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">Hiện chưa có yêu cầu mượn sách chờ duyệt</p>
              </div>
            )}
          </div>
        )}

        {/* Drawer */}
        {showDrawer && selectedSlip && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={handleCloseDrawer}
            ></div>

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-screen w-full max-w-md z-50 bg-white shadow-2xl overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Chi tiết phiếu mượn</h2>
                <button
                  onClick={handleCloseDrawer}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Display Info - Read-only Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mã Phiếu</label>
                    <p className="text-sm font-medium text-gray-900">{selectedSlip.soPhieu}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cuốn Sách (Mã Cuốn)</label>
                    <input
                      type="number"
                      value={editForm.maCuonSach}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Độc Giả (Mã)</label>
                    <input
                      type="text"
                      value={editForm.maDocGia}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ngày Mượn</label>
                    <input
                      type="date"
                      value={editForm.ngayMuon}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>

                  {/* Ngày Trả Thực Tế */}
                  {selectedSlip.ngayTra && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Ngày Trả Thực Tế
                      </label>
                      <input
                        type="date"
                        value={selectedSlip.ngayTra}
                        disabled
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                      />
                    </div>
                  )}

                  {/* Số Ngày Thực Tế */}
                  {selectedSlip.ngayTra && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Số Ngày Thực Tế (mượn)
                      </label>
                      <p className="text-sm font-semibold text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        {calculateDaysBetween(editForm.ngayMuon, selectedSlip.ngayTra)} ngày
                      </p>
                    </div>
                  )}

                  {/* Số Tiền Nợ Quá Hạn */}
                  {selectedSlip.ngayTra && calculateOverdueInfo(editForm.ngayPhaiTra, selectedSlip.ngayTra).isOverdue && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Số Tiền Nợ Quá Hạn
                      </label>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-red-700">
                          {calculateOverdueInfo(editForm.ngayPhaiTra, selectedSlip.ngayTra).overdueDays} ngày trễ
                        </p>
                        <p className="text-lg font-bold text-red-600 mt-1">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(editForm.tienPhat)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Editable Fields */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  {/* Hạn Trả */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Hạn Trả (Gia hạn) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editForm.ngayPhaiTra}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          ngayPhaiTra: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Ngày Trả Thực Tế */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Ngày Trả Thực Tế
                    </label>
                    <input
                      type="date"
                      value={editForm.ngayTra}
                      onChange={(e) => handleNgayTraChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editForm.ngayTra ? '✓ Đã nhập ngày trả thực tế' : '(Để trống nếu chưa trả)'}
                    </p>
                  </div>

                  {/* Số Ngày Mượn */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Số Ngày Mượn
                    </label>
                    <input
                      type="number"
                      value={editForm.soNgayMuon}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          soNgayMuon: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="0"
                    />
                    {editForm.ngayTra && (
                      <p className="text-xs text-gray-500 mt-1">
                        Tính tự động từ ngày mượn đến ngày trả
                      </p>
                    )}
                  </div>

                  {/* Tiền Phạt */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tiền Phạt (VND)
                    </label>
                    <input
                      type="number"
                      value={editForm.tienPhat}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          tienPhat: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tổng phạt: <span className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(editForm.tienPhat)}
                      </span>
                    </p>
                    {editForm.ngayTra && editForm.tienPhat > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        +{(editForm.tienPhat / 1000).toFixed(0)} ngày trễ × 1,000 VNĐ/ngày
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <button
                    onClick={handleUpdateSlip}
                    disabled={updating}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all"
                  >
                    {updating ? 'Đang lưu...' : '✓ Lưu cập nhật'}
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={deleting}
                    className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Xóa phiếu
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Confirm Delete Modal */}
        {showConfirmDelete && selectedSlip && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setShowConfirmDelete(false)}
            >
              <div
                className="bg-white rounded-lg shadow-xl max-w-sm mx-4 p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="rounded-full bg-red-100 p-3">
                    <AlertTriangle size={32} className="text-red-600" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-center text-lg font-bold text-gray-900">
                  Xóa vĩnh viễn phiếu này?
                </h3>

                {/* Message */}
                <p className="text-center text-sm text-gray-600">
                  Hành động này là <span className="font-semibold text-red-600">XÓA CỨNG</span> và không thể hoàn tác. Bạn có chắc chắn muốn xóa?
                </p>

                {/* Slip Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Mã phiếu: <span className="font-semibold text-gray-900">{selectedSlip.soPhieu}</span></p>
                  <p className="text-xs text-gray-500">Độc giả: <span className="font-semibold text-gray-900">{selectedSlip.maDocGia}</span></p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDeleteSlip}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Confirm Status Update Modal */}
        {showConfirmStatusUpdate && selectedSlip && pendingStatusUpdate && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setShowConfirmStatusUpdate(false)}
            >
              <div
                className="bg-white rounded-lg shadow-xl max-w-sm mx-4 p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Check size={32} className="text-blue-600" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-center text-lg font-bold text-gray-900">
                  Cập nhật trạng thái phiếu?
                </h3>

                {/* Message */}
                <p className="text-center text-sm text-gray-600">
                  Bạn sắp thay đổi trạng thái từ <span className="font-semibold text-amber-600">{getStatusLabel(selectedSlip.trangThai || 'PENDING')}</span> sang <span className="font-semibold text-blue-600">{getStatusLabel(pendingStatusUpdate)}</span>
                </p>

                {/* Slip Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-gray-500">Mã phiếu: <span className="font-semibold text-gray-900">{selectedSlip.soPhieu}</span></p>
                  <p className="text-xs text-gray-500">Độc giả: <span className="font-semibold text-gray-900">{selectedSlip.maDocGia}</span></p>
                  <p className="text-xs text-gray-500">Trạng thái hiện tại: <span className="font-semibold text-amber-700">{getStatusLabel(selectedSlip.trangThai || 'PENDING')}</span></p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowConfirmStatusUpdate(false)}
                    disabled={updatingStatus}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmStatusUpdate}
                    disabled={updatingStatus}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updatingStatus ? 'Đang cập nhật...' : 'Xác nhận'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SectionContainer>
  );
};

export default BorrowSlipManagerView;
