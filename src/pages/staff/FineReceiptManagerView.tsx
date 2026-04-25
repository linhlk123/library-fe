import { useEffect, useState } from 'react';
import { ChevronRight, Edit2, Trash2, AlertTriangle, X, DollarSign } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import type { PhieuThu } from '../../types';
import { staffApi } from '../../services/staffApi';
import readersApi from '../../services/readersApi';

interface PhieuThuData extends PhieuThu {
  hoTenDocGia?: string;
}

const FineReceiptManagerView = () => {
  const [receipts, setReceipts] = useState<PhieuThuData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PhieuThuData | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    soTienThu: 0,
    ghiChu: '',
  });

  // Fetch receipts on mount
  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.fineReceipts.getAll();
      const data = response.data?.result ?? [];
      setReceipts(data);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách phiếu thu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (receipt: PhieuThuData) => {
    setSelectedReceipt(receipt);
    setEditForm({
      soTienThu: receipt.soTienThu,
      ghiChu: receipt.ghiChu || '',
    });
    setShowDrawer(true);
    setError(null);
    setMessage(null);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setSelectedReceipt(null);
    setEditForm({ soTienThu: 0, ghiChu: '' });
    setError(null);
    setMessage(null);
  };

  const handleUpdateReceipt = async () => {
    if (!selectedReceipt) return;

    try {
      setUpdating(true);
      setError(null);
      const response = await staffApi.fineReceipts.update(selectedReceipt.soPTT, {
        soTienThu: editForm.soTienThu,
        ghiChu: editForm.ghiChu,
      });

      setMessage(response.data?.message ?? '✓ Cập nhật phiếu thu thành công!');

      // Calculate change in amount paid
      const amountDifference = editForm.soTienThu - selectedReceipt.soTienThu;

      // Update reader's debt: tongNo = tongNo - (new payment - old payment)
      if (amountDifference !== 0) {
        // Get current reader's debt
        const docGiaRes = await readersApi.docgia.getById(selectedReceipt.maDocGia);
        const docGia = docGiaRes.data?.result;
        
        if (docGia) {
          const newTongNo = Math.max(0, docGia.tongNo - amountDifference);
          await readersApi.docgia.update(selectedReceipt.maDocGia, { tongNo: newTongNo });
        }
      }

      // Update state
      setReceipts((prev) =>
        prev.map((receipt) =>
          receipt.soPTT === selectedReceipt.soPTT
            ? { ...receipt, soTienThu: editForm.soTienThu, ghiChu: editForm.ghiChu }
            : receipt
        )
      );

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
      setError('⚠️ Cập nhật phiếu thu thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReceipt = async () => {
    if (!selectedReceipt) return;

    try {
      setDeleting(true);
      setError(null);
      const response = await staffApi.fineReceipts.delete(selectedReceipt.soPTT);

      setMessage(response.data?.message ?? '✓ Xóa phiếu thu thành công!');

      // Restore reader's debt when deleting receipt
      // tongNo = tongNo + soTienThu (add back the paid amount)
      const docGiaRes = await readersApi.docgia.getById(selectedReceipt.maDocGia);
      const docGia = docGiaRes.data?.result;
      
      if (docGia) {
        const newTongNo = docGia.tongNo + selectedReceipt.soTienThu;
        await readersApi.docgia.update(selectedReceipt.maDocGia, { tongNo: newTongNo });
      }

      // Remove from state
      setReceipts((prev) => prev.filter((receipt) => receipt.soPTT !== selectedReceipt.soPTT));

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
      setError('⚠️ Xóa phiếu thu thất bại.');
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <SectionContainer
      title="Quản lý Phiếu Thu Tiền Phạt"
      description="Quản lý phiếu thu tiền phạt từ độc giả."
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border border-indigo-200 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Mã Phiếu</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Độc Giả</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Số Tiền Thu</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Ngày Thu</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Nhân Viên Lập</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr
                    key={receipt.soPTT}
                    onClick={() => handleRowClick(receipt)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{receipt.soPTT}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{receipt.maDocGia}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600 flex items-center gap-1">
                      <DollarSign size={16} />
                      {formatCurrency(receipt.soTienThu)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(receipt.ngayThu).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{receipt.maNhanVien}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                        <Edit2 size={16} />
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {receipts.length === 0 && !loading && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">Không có phiếu thu nào</p>
              </div>
            )}
          </div>
        )}

        {/* Drawer */}
        {showDrawer && selectedReceipt && (
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
                <h2 className="text-lg font-semibold text-gray-900">Chi tiết phiếu thu</h2>
                <button
                  onClick={handleCloseDrawer}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Display Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mã Phiếu</label>
                    <p className="text-sm font-medium text-gray-900">{selectedReceipt.soPTT}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Độc Giả</label>
                    <p className="text-sm font-medium text-gray-900">{selectedReceipt.maDocGia}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ngày Thu</label>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedReceipt.ngayThu).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nhân Viên Lập</label>
                    <p className="text-sm text-gray-700">{selectedReceipt.maNhanVien}</p>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  {/* Số Tiền Thu */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Số Tiền Thu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">₫</span>
                      <input
                        type="number"
                        value={editForm.soTienThu}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            soTienThu: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatCurrency(editForm.soTienThu)}
                    </p>
                  </div>

                  {/* Ghi Chú */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Ghi Chú</label>
                    <textarea
                      value={editForm.ghiChu}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          ghiChu: e.target.value,
                        }))
                      }
                      placeholder="Nhập ghi chú..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <button
                    onClick={handleUpdateReceipt}
                    disabled={updating}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all"
                  >
                    {updating ? 'Đang lưu...' : '✓ Lưu thay đổi'}
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
        {showConfirmDelete && selectedReceipt && (
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

                {/* Receipt Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Mã phiếu: <span className="font-semibold text-gray-900">{selectedReceipt.soPTT}</span></p>
                  <p className="text-xs text-gray-500">Độc giả: <span className="font-semibold text-gray-900">{selectedReceipt.maDocGia}</span></p>
                  <p className="text-xs text-gray-500">Số tiền: <span className="font-semibold text-red-600">{formatCurrency(selectedReceipt.soTienThu)}</span></p>
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
                    onClick={handleDeleteReceipt}
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
      </div>
    </SectionContainer>
  );
};

export default FineReceiptManagerView;
