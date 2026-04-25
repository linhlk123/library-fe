import { useEffect, useState, useRef } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import lendingApi from '../../services/lendingApi';
import readersApi from '../../services/readersApi';
import userApi from '../../services/userApi';
import { staffApi } from '../../services/staffApi';
import { Search, X } from 'lucide-react';
import type { DocGia, CuonSach, DauSach, Sach } from '../../types';

interface SlipFormState {
  maDocGia: string;
  maDauSach: number | null;
  maSach: number | null;
  maCuonSach: string;
  ngayMuon: string;
  ngayPhaiTra: string;
  ngayTra: string;
  soNgayMuon: number;
  tienPhat: number;
}

const BorrowReturnSlipView = () => {
  // Form state
  const [formValue, setFormValue] = useState<SlipFormState>({
    maDocGia: '',
    maDauSach: null,
    maSach: null,
    maCuonSach: '',
    ngayMuon: new Date().toISOString().split('T')[0],
    ngayPhaiTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ngayTra: '',
    soNgayMuon: 0,
    tienPhat: 0,
  });

  // Data state
  const [docGiaList, setDocGiaList] = useState<DocGia[]>([]);
  const [dauSachList, setDauSachList] = useState<DauSach[]>([]);
  const [sachList, setSachList] = useState<Sach[]>([]);
  const [cuonSachList, setCuonSachList] = useState<CuonSach[]>([]);

  // Search & Filter state
  const [searchDauSach, setSearchDauSach] = useState('');
  const [filteredDauSach, setFilteredDauSach] = useState<DauSach[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDauSach, setSelectedDauSach] = useState<DauSach | null>(null);
  const [availableCopies, setAvailableCopies] = useState<(CuonSach & { maSach: number })[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get maNhanVien from localStorage
  const maNhanVien = localStorage.getItem('maNhanVien') || 'staff';

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [docGiaRes, dauSachRes, sachRes, cuonSachRes] = await Promise.all([
          readersApi.docgia.getAll(),
          userApi.getAllDauSach(),
          userApi.getAllSach?.() || Promise.resolve({ data: { result: [] } }),
          userApi.getAllCuonSach?.() || Promise.resolve({ data: { result: [] } }),
        ]);

        setDocGiaList(docGiaRes.data?.result ?? []);
        setDauSachList(dauSachRes.data?.result ?? []);
        setSachList(sachRes.data?.result ?? []);
        setCuonSachList(cuonSachRes.data?.result ?? []);
      } catch (err) {
        console.error(err);
        setError('Không tải được dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search DauSach
  const handleSearchDauSach = (value: string) => {
    setSearchDauSach(value);
    if (value.trim()) {
      const filtered = dauSachList.filter((ds) =>
        ds.tenDauSach.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDauSach(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredDauSach([]);
      setShowSuggestions(false);
    }
  };

  // Handle select DauSach
  const handleSelectDauSach = (dauSach: DauSach) => {
    setSelectedDauSach(dauSach);
    setSearchDauSach(dauSach.tenDauSach);
    setShowSuggestions(false);
    setFormValue((prev) => ({
      ...prev,
      maDauSach: dauSach.maDauSach,
      maSach: null,
      maCuonSach: '',
    }));

    // Filter available copies for this DauSach
    const sachForDauSach = sachList.filter((s) => s.maDauSach === dauSach.maDauSach);
    const available = cuonSachList
      .filter((cs) => cs.tinhTrang === 'AVAILABLE')
      .filter((cs) => sachForDauSach.some((s) => s.maSach === cs.maSach))
      .map((cs) => ({
        ...cs,
        maSach: sachForDauSach.find((s) => s.maSach === cs.maSach)?.maSach || 0,
      }));

    setAvailableCopies(available);
  };

  // Clear DauSach selection
  const handleClearDauSach = () => {
    setSearchDauSach('');
    setSelectedDauSach(null);
    setFilteredDauSach([]);
    setShowSuggestions(false);
    setAvailableCopies([]);
    setFormValue((prev) => ({
      ...prev,
      maDauSach: null,
      maSach: null,
      maCuonSach: '',
    }));
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Automatic calculation when ngayTra changes
  const handleNgayTraChange = (ngayTra: string) => {
    setFormValue((prev) => {
      const newForm = { ...prev, ngayTra };

      if (ngayTra && prev.ngayMuon) {
        // Calculate days borrowed
        const muonDate = new Date(prev.ngayMuon);
        const traDate = new Date(ngayTra);
        const diffTime = traDate.getTime() - muonDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        newForm.soNgayMuon = Math.max(diffDays, 0);

        // Calculate fine
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

  const handleDateChange = (field: keyof SlipFormState, value: string) => {
    if (field === 'ngayTra') {
      handleNgayTraChange(value);
    } else {
      setFormValue((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDocGiaChange = (maDocGia: string) => {
    setFormValue((prev) => ({ ...prev, maDocGia }));
  };

  const handleCuonSachChange = (maCuonSach: string) => {
    setFormValue((prev) => ({ ...prev, maCuonSach }));
  };

  const handleResetForm = () => {
    setFormValue({
      maDocGia: '',
      maDauSach: null,
      maSach: null,
      maCuonSach: '',
      ngayMuon: new Date().toISOString().split('T')[0],
      ngayPhaiTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ngayTra: '',
      soNgayMuon: 0,
      tienPhat: 0,
    });
    handleClearDauSach();
    setError(null);
  };

  const handleSaveSlip = async () => {
    // Validation
    if (!formValue.maDocGia.trim()) {
      setError('Vui lòng chọn độc giả.');
      return;
    }

    if (!selectedDauSach) {
      setError('Vui lòng chọn đầu sách.');
      return;
    }

    if (!formValue.maCuonSach.trim()) {
      setError('Vui lòng chọn cuốn sách.');
      return;
    }

    if (!formValue.ngayMuon) {
      setError('Vui lòng chọn ngày mượn.');
      return;
    }

    if (!formValue.ngayPhaiTra) {
      setError('Vui lòng chọn ngày phải trả.');
      return;
    }

    // Additional validations according to regulations
    const selectedDocGia = docGiaList.find((dg) => dg.maDocGia === formValue.maDocGia);

    // Validation 1: Thẻ phải còn hạn
    if (selectedDocGia) {
      const today = new Date().toISOString().split('T')[0];
      if (selectedDocGia.ngayHetHan && selectedDocGia.ngayHetHan < today) {
        setError('❌ Thẻ độc giả đã hết hạn. Không thể mượn sách.');
        return;
      }
    }

    // Validation 3: Cuốn sách không có người đang mượn
    const selectedBook = availableCopies.find((cs) => String(cs.maCuonSach) === formValue.maCuonSach);
    if (selectedBook && selectedBook.tinhTrang !== 'AVAILABLE') {
      setError('❌ Cuốn sách này đang được mượn. Vui lòng chọn cuốn khác.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        maDocGia: formValue.maDocGia,
        maCuonSach: parseInt(formValue.maCuonSach),
        maNhanVien,
        ngayMuon: formValue.ngayMuon,
        ngayPhaiTra: formValue.ngayPhaiTra,
        ngayTra: formValue.ngayTra || null,
        tienPhat: formValue.tienPhat,
      };

      await lendingApi.phieuMuonTra.create(payload);
      setMessage('✓ Lưu phiếu mượn thành công!');

      // Update reader's debt if there are fines
      if (formValue.tienPhat > 0) {
        await staffApi.updateReaderDebt(formValue.maDocGia);
      }

      // Reset form after success
      setTimeout(() => {
        handleResetForm();
        setMessage(null);
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Lập phiếu mượn/trả thất bại.';
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
      title="Lập Phiếu Mượn/Trả Sách"
      description="Quản lý quy trình mượn hoặc trả sách cho độc giả với tính toán tiền phạt tự động."
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
            <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Row 1: DocGia & DauSach Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Độc Giả */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Chọn Độc Giả <span className="text-red-500">*</span>
                </label>
                <select
                  value={formValue.maDocGia}
                  onChange={(e) => handleDocGiaChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Chọn độc giả --</option>
                  {docGiaList.map((dg) => (
                    <option key={dg.maDocGia} value={dg.maDocGia}>
                      {dg.maDocGia} - {dg.hoTen}
                    </option>
                  ))}
                </select>
                {formValue.maDocGia && (
                  <p className="mt-1 text-xs text-gray-500">
                    ✓ Đã chọn: {docGiaList.find((dg) => dg.maDocGia === formValue.maDocGia)?.hoTen}
                  </p>
                )}
              </div>

              {/* Search Đầu Sách with Autocomplete */}
              <div ref={searchRef} className="relative">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tìm Đầu Sách <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Nhập tên sách để tìm..."
                    value={searchDauSach}
                    onChange={(e) => handleSearchDauSach(e.target.value)}
                    onFocus={() => searchDauSach && setShowSuggestions(true)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {selectedDauSach && (
                    <button
                      onClick={handleClearDauSach}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredDauSach.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {filteredDauSach.map((ds) => (
                      <button
                        key={ds.maDauSach}
                        onClick={() => handleSelectDauSach(ds)}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-semibold text-gray-900 text-sm">{ds.tenDauSach}</p>
                        <p className="text-xs text-gray-500">Mã: {ds.maDauSach}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showSuggestions && searchDauSach && filteredDauSach.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 text-center text-gray-500 text-sm">
                    Không tìm thấy sách nào
                  </div>
                )}

                {selectedDauSach && (
                  <p className="mt-1 text-xs text-gray-500">
                    ✓ Đã chọn: {selectedDauSach.tenDauSach}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Select Cuốn Sách (Filtered by DauSach) */}
            {selectedDauSach && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Chọn Cuốn Sách (Còn) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formValue.maCuonSach}
                  onChange={(e) => handleCuonSachChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Chọn cuốn sách --</option>
                  {availableCopies.map((cs) => (
                    <option key={cs.maCuonSach} value={String(cs.maCuonSach)}>
                      Cuốn #{cs.maCuonSach} (Kho: {cs.maSach})
                    </option>
                  ))}
                </select>
                {formValue.maCuonSach && (
                  <p className="mt-1 text-xs text-gray-500">
                    ✓ Đã chọn: Cuốn #{formValue.maCuonSach}
                  </p>
                )}
                {availableCopies.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    ⚠️ Không có cuốn sách nào còn sẵn cho đầu sách này
                  </p>
                )}
              </div>
            )}
            {/* Row 3: Date Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ngày Mượn */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ngày Mượn <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formValue.ngayMuon}
                  onChange={(e) => handleDateChange('ngayMuon', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formValue.ngayMuon && new Date(formValue.ngayMuon).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Ngày Phải Trả */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ngày Phải Trả <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formValue.ngayPhaiTra}
                  onChange={(e) => handleDateChange('ngayPhaiTra', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formValue.ngayPhaiTra && new Date(formValue.ngayPhaiTra).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Ngày Trả Thực Tế */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ngày Trả Thực Tế
                </label>
                <input
                  type="date"
                  value={formValue.ngayTra}
                  onChange={(e) => handleDateChange('ngayTra', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formValue.ngayTra ? new Date(formValue.ngayTra).toLocaleDateString('vi-VN') : '(Để trống nếu chưa trả)'}
                </p>
              </div>
            </div>

            {/* Row 4: Auto-Calculated Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Số Ngày Mượn */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số Ngày Mượn (Tự Tính)
                </label>
                <div className="flex items-end gap-2">
                  <input
                    type="number"
                    value={formValue.soNgayMuon}
                    readOnly
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-none"
                  />
                  <span className="text-sm text-gray-600 pb-2.5">ngày</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Tính từ ngày trả thực tế (nếu có)
                </p>
              </div>

              {/* Tiền Phạt */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <label className="block text-sm font-semibold text-red-900 mb-2">
                  Tiền Phạt (Tự Tính)
                </label>
                <div className="flex items-end gap-2">
                  <input
                    type="number"
                    value={formValue.tienPhat}
                    readOnly
                    className="flex-1 px-4 py-2.5 rounded-lg border border-red-300 bg-white text-red-900 font-bold text-lg focus:outline-none"
                  />
                  <span className="text-sm text-red-700 pb-2.5 font-semibold">VNĐ</span>
                </div>
                <p className="mt-2 text-xs text-red-700">
                  {formValue.tienPhat > 0
                    ? `+${(formValue.tienPhat / 1000).toFixed(0)} ngày trễ × 1000 VNĐ/ngày`
                    : 'Trả đúng hạn'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleResetForm}
                disabled={submitting}
                type="button"
                className="flex-1 px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
              >
                Xóa Trống
              </button>
              <button
                onClick={handleSaveSlip}
                disabled={submitting || loading}
                type="button"
                className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu...' : '✓ Lưu Phiếu'}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2">
              <p className="text-xs text-blue-900 font-semibold">ℹ️ Quy định về phiếu mượn trả:</p>
              <ul className="text-xs text-blue-900 space-y-1 list-disc list-inside">
                <li>Chỉ cho mượn với thẻ còn hạn, không có sách mượn quá hạn</li>
                <li>Sách không được có người đang mượn</li>
                <li>Mỗi độc giả mượn tối đa 5 quyển sách trong 4 ngày</li>
                <li>Tiền phạt trễ hạn: 1,000 VNĐ/ngày</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default BorrowReturnSlipView;