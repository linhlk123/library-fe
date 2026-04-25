import { useEffect, useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import lendingApi from '../../services/lendingApi';
import readersApi from '../../services/readersApi';
import type { DocGia, PhieuThuTienPhat } from '../../types';

interface FineForm {
  maDocGia: string;
  ngayThu: string;
  soTienThu: number;
}

const FineReceiptView = () => {
  // Form state
  const [formValue, setFormValue] = useState<FineForm>({
    maDocGia: '',
    ngayThu: new Date().toISOString().split('T')[0],
    soTienThu: 0,
  });

  // Computed state
  const [tongNoHienTai, setTongNoHienTai] = useState<number>(0);
  const [conLai, setConLai] = useState<number>(0);

  // Data state
  const [docGiaList, setDocGiaList] = useState<DocGia[]>([]);
  const [debtorList, setDebtorList] = useState<DocGia[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Get maNhanVien from localStorage
  const maNhanVien = localStorage.getItem('maNhanVien') || 'staff';

  // Fetch độc giả data
  useEffect(() => {
    const fetchDocGia = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await readersApi.docgia.getAll();
        const allDocGia = res.data.result ?? [];

        setDocGiaList(allDocGia);

        // Filter only debtors (tongNo > 0)
        const debtors = allDocGia.filter((dg) => dg.tongNo > 0);
        setDebtorList(debtors);
      } catch (err) {
        console.error(err);
        setError('Không tải được danh sách độc giả. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocGia();
  }, []);

  // Auto-calculate conLai whenever tongNoHienTai or soTienThu changes
  useEffect(() => {
    if (formValue.soTienThu > tongNoHienTai) {
      // Prevent over-payment
      setFormValue((prev) => ({ ...prev, soTienThu: tongNoHienTai }));
      setConLai(0);
    } else {
      const remaining = tongNoHienTai - formValue.soTienThu;
      setConLai(remaining);
    }
  }, [tongNoHienTai, formValue.soTienThu]);

  // Handle maDocGia change - auto-fetch tongNo
  const handleDocGiaChange = (maDocGia: string) => {
    setFormValue((prev) => ({ ...prev, maDocGia }));

    if (maDocGia) {
      const selectedDocGia = docGiaList.find((dg) => dg.maDocGia === maDocGia);
      if (selectedDocGia) {
        setTongNoHienTai(selectedDocGia.tongNo);
      }
    } else {
      setTongNoHienTai(0);
      setConLai(0);
    }
  };

  const handleDateChange = (ngayThu: string) => {
    setFormValue((prev) => ({ ...prev, ngayThu }));
  };

  const handleSoTienThuChange = (value: number) => {
    const soTienThu = Math.max(0, value);
    setFormValue((prev) => ({ ...prev, soTienThu }));
  };

  const handleResetForm = () => {
    setFormValue({
      maDocGia: '',
      ngayThu: new Date().toISOString().split('T')[0],
      soTienThu: 0,
    });
    setTongNoHienTai(0);
    setConLai(0);
    setError(null);
  };

  const handleSaveFineReceipt = async () => {
    // Validation
    if (!formValue.maDocGia.trim()) {
      setError('Vui lòng chọn độc giả.');
      return;
    }

    if (formValue.soTienThu <= 0) {
      setError('Số tiền thu phải lớn hơn 0.');
      return;
    }

    if (!formValue.ngayThu) {
      setError('Vui lòng chọn ngày thu.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: Omit<PhieuThuTienPhat, 'soPTT'> = {
        maDocGia: formValue.maDocGia, 
        soTienThu: formValue.soTienThu, 
        ngayThu: formValue.ngayThu,
        maNhanVien: maNhanVien, 
        conLai: conLai  // Use actual conLai state value
      };

      await lendingApi.phieuThuTienPhat.create(payload);
      
      // Update reader's tongNo (debt) after successful payment
      // const newTongNo = Math.max(0, tongNoHienTai - formValue.soTienThu);
      // await readersApi.docgia.update(formValue.maDocGia, { tongNo: newTongNo });
      
      setMessage('✓ Lập phiếu thu tiền phạt thành công!');

      // Reset form after success
      setTimeout(() => {
        handleResetForm();
        setMessage(null);
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Lập phiếu thu tiền phạt thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as Record<string, unknown>).response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (data && typeof data === 'object' && 'message' in data) {
            errorMsg = String((data as Record<string, unknown>).message);
          }
        }
      }
      setError(`⚠️ ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionContainer
      title="Lập Phiếu Thu Tiền Phạt"
      description="Ghi nhận và quản lý thanh toán tiền phạt quá hạn từ độc giả với tính toán tự động."
    >
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 transition-all animate-in">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 transition-all animate-in">
            {message}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border border-indigo-200 border-t-indigo-600"></div>
            </div>
            <p className="mt-4 text-gray-500">Đang tải dữ liệu độc giả...</p>
          </div>
        ) : (
          <div className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Row 1: Select Độc Giả */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Chọn Độc Giả Cần Thu Tiền <span className="text-red-500">*</span>
              </label>
              <select
                value={formValue.maDocGia}
                onChange={(e) => handleDocGiaChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">-- Chọn độc giả có nợ --</option>
                {debtorList.map((dg) => (
                  <option key={dg.maDocGia} value={dg.maDocGia}>
                    {dg.maDocGia} - {dg.hoTen} (Nợ: {dg.tongNo.toLocaleString('vi-VN')} đ)
                  </option>
                ))}
              </select>
              {formValue.maDocGia && (
                <p className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Đã chọn: {debtorList.find((dg) => dg.maDocGia === formValue.maDocGia)?.hoTen}
                </p>
              )}
              {debtorList.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  ℹ️ Hiện không có độc giả nào có nợ
                </p>
              )}
            </div>

            {/* Row 2: Ngày Thu */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Ngày Thu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formValue.ngayThu}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-xs text-gray-500">
                {formValue.ngayThu && new Date(formValue.ngayThu).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {/* Row 3: Financial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tổng Nợ Hiện Tại */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Tổng Nợ Hiện Tại
                </label>
                <input
                  type="number"
                  value={tongNoHienTai}
                  readOnly
                  disabled
                  className="w-full px-3 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 font-bold text-lg focus:outline-none cursor-not-allowed"
                />
                <p className="mt-2 text-xs text-gray-500">
                  (Tự động từ hệ thống)
                </p>
              </div>

              {/* Số Tiền Thu */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <label className="block text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">
                  Số Tiền Thu <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formValue.soTienThu}
                  onChange={(e) => handleSoTienThuChange(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-3 rounded-lg border border-green-300 bg-white text-green-700 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-green-700 font-medium">
                  Nhập số tiền muốn thu
                </p>
              </div>

              {/* Nợ Còn Lại */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <label className="block text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">
                  Nợ Còn Lại
                </label>
                <input
                  type="number"
                  value={conLai}
                  readOnly
                  disabled
                  className="w-full px-3 py-3 rounded-lg border border-red-300 bg-red-100 text-red-900 font-bold text-lg focus:outline-none cursor-not-allowed"
                />
                <p className="mt-2 text-xs text-red-700">
                  (Tổng nợ - Số tiền thu)
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleResetForm}
                disabled={submitting}
                type="button"
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
              >
                Xóa Trống
              </button>
              <button
                onClick={handleSaveFineReceipt}
                disabled={submitting || loading || !formValue.maDocGia}
                type="button"
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang xử lý...' : '✓ Lưu Phiếu Thu'}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold">ℹ️ Ghi chú:</span> Hệ thống tự động lấy số tiền nợ hiện tại của độc giả khi bạn chọn từ danh sách. Số tiền thu không thể vượt quá tổng nợ. Nợ còn lại sẽ được tính và cập nhật tự động.
              </p>
            </div>

            {/* Debtors Summary */}
            {debtorList.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-xs font-semibold text-amber-900 mb-2">
                  📊 Tóm tắt độc giả có nợ:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {debtorList.slice(0, 6).map((dg) => (
                    <div key={dg.maDocGia} className="text-xs text-amber-800 bg-white rounded p-2">
                      <span className="font-medium">{dg.maDocGia}</span>: {dg.tongNo.toLocaleString('vi-VN')}đ
                    </div>
                  ))}
                  {debtorList.length > 6 && (
                    <div className="text-xs text-amber-800 bg-white rounded p-2 font-medium">
                      +{debtorList.length - 6} khác
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default FineReceiptView;