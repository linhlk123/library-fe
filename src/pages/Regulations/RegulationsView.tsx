import { useEffect, useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import regulationsApi from '../../services/regulationsApi';
import type { ThamSo } from '../../types';

interface RegulationParams {
  // Reader Regulations
  TuoiToiThieu: number;
  TuoiToiDa: number;
  ThoiHanThe: number;
  // Book Regulations
  KhoangCachNamXB: number;
  // Borrowing Regulations
  SoNgayMuonToiDa: number;
  SoSachMuonToiDa: number;
  // Financial Regulations
  TienPhatMoiNgay: number;
  ApDungQDKiemTraSoTienThu: boolean;
}

const INITIAL_PARAMS: RegulationParams = {
  TuoiToiThieu: 18,
  TuoiToiDa: 55,
  ThoiHanThe: 0.5,
  KhoangCachNamXB: 8,
  SoNgayMuonToiDa: 4,
  SoSachMuonToiDa: 5,
  TienPhatMoiNgay: 1000,
  ApDungQDKiemTraSoTienThu: false,
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
            TuoiToiThieu: Number(thamsoMap['TuoiToiThieu']) || INITIAL_PARAMS.TuoiToiThieu,
            TuoiToiDa: Number(thamsoMap['TuoiToiDa']) || INITIAL_PARAMS.TuoiToiDa,
            ThoiHanThe: Number(thamsoMap['ThoiHanThe']) || INITIAL_PARAMS.ThoiHanThe,
            KhoangCachNamXB: Number(thamsoMap['KhoangCachNamXB']) || INITIAL_PARAMS.KhoangCachNamXB,
            SoNgayMuonToiDa: Number(thamsoMap['SoNgayMuonToiDa']) || INITIAL_PARAMS.SoNgayMuonToiDa,
            SoSachMuonToiDa: Number(thamsoMap['SoSachMuonToiDa']) || INITIAL_PARAMS.SoSachMuonToiDa,
            TienPhatMoiNgay: Number(thamsoMap['TienPhatMoiNgay']) || INITIAL_PARAMS.TienPhatMoiNgay,
            ApDungQDKiemTraSoTienThu: thamsoMap['ApDungQDKiemTraSoTienThu'] !== undefined
              ? (thamsoMap['ApDungQDKiemTraSoTienThu'] === true || thamsoMap['ApDungQDKiemTraSoTienThu'] === 'true')
              : INITIAL_PARAMS.ApDungQDKiemTraSoTienThu,
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
          regulationsApi.thamso.update(item.tenThamSo, { tenThamSo: item.tenThamSo, giaTri: item.giaTri })
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
                  value={params.TuoiToiThieu}
                  onChange={(e) =>
                    handleChange('TuoiToiThieu', Number(e.target.value))
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
                  value={params.TuoiToiDa}
                  onChange={(e) =>
                    handleChange('TuoiToiDa', Number(e.target.value))
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
                  value={params.ThoiHanThe}
                  onChange={(e) =>
                    handleChange('ThoiHanThe', Number(e.target.value))
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
                  value={params.KhoangCachNamXB}
                  onChange={(e) =>
                    handleChange('KhoangCachNamXB', Number(e.target.value))
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
                  value={params.SoNgayMuonToiDa}
                  onChange={(e) =>
                    handleChange('SoNgayMuonToiDa', Number(e.target.value))
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
                  value={params.SoSachMuonToiDa}
                  onChange={(e) =>
                    handleChange('SoSachMuonToiDa', Number(e.target.value))
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
                  value={params.TienPhatMoiNgay}
                  onChange={(e) =>
                    handleChange('TienPhatMoiNgay', Number(e.target.value))
                  }
                />
              </label>

              {/* Toggle Switch */}
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition border border-gray-200">
                <input
                  type="checkbox"
                  disabled={loading || submitting}
                  checked={params.ApDungQDKiemTraSoTienThu}
                  onChange={(e) =>
                    handleChange('ApDungQDKiemTraSoTienThu', e.target.checked)
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
