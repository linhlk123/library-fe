import { useEffect, useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import regulationsApi from '../../services/regulationsApi';
import type { ThamSo } from '../../types';

interface RegulationParams {
  // Reader Regulations
  TUOI_TOI_THIEU: number;
  TUOI_TOI_DA: number;
  HAN_THE_DOC_GIA: number;
  // Book Regulations
  KHOANG_CACH_NAM_XB: number;
  // Borrowing Regulations
  SO_NGAY_MUON_TOI_DA: number;
  SO_SACH_MUON_TOI_DA: number;
  // Financial Regulations
  TIEN_PHAT_MOI_NGAY: number;
  KIEM_TRA_SO_TIEN_THU: boolean;
}

const INITIAL_PARAMS: RegulationParams = {
  TUOI_TOI_THIEU: 0,
  TUOI_TOI_DA: 0,
  HAN_THE_DOC_GIA: 0,
  KHOANG_CACH_NAM_XB: 0,
  SO_NGAY_MUON_TOI_DA: 0,
  SO_SACH_MUON_TOI_DA: 0,
  TIEN_PHAT_MOI_NGAY: 0,
  KIEM_TRA_SO_TIEN_THU: false,
};

const RegulationsView = () => {
  const [params, setParams] = useState<RegulationParams>(INITIAL_PARAMS);
  const [originalParams, setOriginalParams] = useState<RegulationParams>(INITIAL_PARAMS);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch regulations on mount
  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await regulationsApi.thamso.getAll();

        if (res.data?.result && Array.isArray(res.data.result)) {
          const thamsoMap: Record<string, string | number | boolean> = {};
          res.data.result.forEach((item: ThamSo) => {
            const value = isNaN(Number(item.giaTri))
              ? item.giaTri === 'true'
              : Number(item.giaTri);
            thamsoMap[item.tenThamSo] = value;
          });

          const newParams: RegulationParams = {
            TUOI_TOI_THIEU: Number(thamsoMap['TUOI_TOI_THIEU']) || 0,
            TUOI_TOI_DA: Number(thamsoMap['TUOI_TOI_DA']) || 0,
            HAN_THE_DOC_GIA: Number(thamsoMap['HAN_THE_DOC_GIA']) || 0,
            KHOANG_CACH_NAM_XB: Number(thamsoMap['KHOANG_CACH_NAM_XB']) || 0,
            SO_NGAY_MUON_TOI_DA: Number(thamsoMap['SO_NGAY_MUON_TOI_DA']) || 0,
            SO_SACH_MUON_TOI_DA: Number(thamsoMap['SO_SACH_MUON_TOI_DA']) || 0,
            TIEN_PHAT_MOI_NGAY: Number(thamsoMap['TIEN_PHAT_MOI_NGAY']) || 0,
            KIEM_TRA_SO_TIEN_THU: (thamsoMap['KIEM_TRA_SO_TIEN_THU'] === true ||
              thamsoMap['KIEM_TRA_SO_TIEN_THU'] === 'true') ?? false,
          };

          setParams(newParams);
          setOriginalParams(newParams);
        }
      } catch (err) {
        console.error(err);
        const errorMsg = err instanceof Error ? err.message : 'Không tải được quy định.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchRegulations();
  }, []);

  const handleChange = (key: keyof RegulationParams, value: number | boolean) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveRules = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const updates = Object.entries(params).map(([key, value]) => ({
        tenThamSo: key,
        giaTri: String(value),
      }));

      const responses = await Promise.all(
        updates.map((item) =>
          regulationsApi.thamso.update(item.tenThamSo, { giaTri: item.giaTri })
        )
      );

      const backendMsg = responses[0]?.data?.message || 'Cập nhật quy định thành công!';
      setMessage(backendMsg);
      setOriginalParams(params);
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : 'Lưu quy định thất bại.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = JSON.stringify(params) !== JSON.stringify(originalParams);

  return (
    <SectionContainer
      title="Quản lý Quy định"
      description="Cập nhật các tham số hoạt động của hệ thống thư viện."
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ❌ {error}
          </div>
        )}
        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✅ {message}
          </div>
        )}

        {/* Regulations Grid - Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Reader Regulations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Quy định Độc Giả
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Tuổi tối thiểu
                </span>
                <input
                  type="number"
                  min={0}
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  value={params.TUOI_TOI_THIEU}
                  onChange={(e) =>
                    handleChange('TUOI_TOI_THIEU', Number(e.target.value))
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Tuổi tối đa
                </span>
                <input
                  type="number"
                  min={0}
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  value={params.TUOI_TOI_DA}
                  onChange={(e) =>
                    handleChange('TUOI_TOI_DA', Number(e.target.value))
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Thời hạn thẻ độc giả (năm)
                </span>
                <input
                  type="number"
                  min={0}
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  value={params.HAN_THE_DOC_GIA}
                  onChange={(e) =>
                    handleChange('HAN_THE_DOC_GIA', Number(e.target.value))
                  }
                />
              </label>
            </div>
          </div>

          {/* Card 2: Book Regulations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📚</span> Quy định Sách
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Khoảng cách năm xuất bản (năm)
                </span>
                <input
                  type="number"
                  min={0}
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  value={params.KHOANG_CACH_NAM_XB}
                  onChange={(e) =>
                    handleChange('KHOANG_CACH_NAM_XB', Number(e.target.value))
                  }
                />
              </label>
              <p className="text-xs text-gray-500 italic mt-4 p-2 bg-blue-50 rounded border border-blue-100">
                💡 Được sử dụng để kiểm tra tuổi của sách khi nhập mới.
              </p>
            </div>
          </div>

          {/* Card 3: Borrowing Regulations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔄</span> Quy định Mượn Trả
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Số ngày mượn tối đa (ngày)
                </span>
                <input
                  type="number"
                  min={0}
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  value={params.SO_NGAY_MUON_TOI_DA}
                  onChange={(e) =>
                    handleChange('SO_NGAY_MUON_TOI_DA', Number(e.target.value))
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Số sách mượn tối đa (quyển)
                </span>
                <input
                  type="number"
                  min={0}
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  value={params.SO_SACH_MUON_TOI_DA}
                  onChange={(e) =>
                    handleChange('SO_SACH_MUON_TOI_DA', Number(e.target.value))
                  }
                />
              </label>
            </div>
          </div>

          {/* Card 4: Financial Regulations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💰</span> Quy định Tài Chính
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Tiền phạt mỗi ngày (VND)
                </span>
                <input
                  type="number"
                  min={0}
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  value={params.TIEN_PHAT_MOI_NGAY}
                  onChange={(e) =>
                    handleChange('TIEN_PHAT_MOI_NGAY', Number(e.target.value))
                  }
                />
              </label>

              {/* Toggle Switch */}
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition border border-gray-200">
                <input
                  type="checkbox"
                  disabled={loading || submitting}
                  checked={params.KIEM_TRA_SO_TIEN_THU}
                  onChange={(e) =>
                    handleChange('KIEM_TRA_SO_TIEN_THU', e.target.checked)
                  }
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">
                  Kiểm tra số tiền thu
                </span>
              </label>
              <p className="text-xs text-gray-500 italic p-2 bg-amber-50 rounded border border-amber-100">
                ℹ️ Bật để kiểm tra số tiền thu không vượt quá tổng nợ.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={() => {
              setParams(originalParams);
              setError(null);
              setMessage(null);
            }}
            disabled={loading || submitting || !hasChanges}
            className="rounded-lg border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveRules}
            disabled={loading || submitting || !hasChanges}
            className="rounded-lg bg-indigo-600 text-white px-6 py-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {submitting ? '⏳ Đang lưu...' : '💾 Lưu quy định'}
          </button>
        </div>

        {/* Info Message */}
        {!hasChanges && (
          <p className="text-xs text-gray-500 text-center italic">
            Không có thay đổi nào để lưu.
          </p>
        )}
      </div>
    </SectionContainer>
  );
};

export default RegulationsView;
