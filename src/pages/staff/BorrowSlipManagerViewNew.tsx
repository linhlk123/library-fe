import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { staffApi } from '../../services/staffApi';
import { useUIStore, useAuthStore } from '../../stores';
import type { PhieuMuonTra } from '../../types';

interface PhieuMuonTraData extends PhieuMuonTra {
  hoTenDocGia?: string;
}

interface BorrowFormData {
  maCuonSach: number;
  maDocGia: string;
  ngayMuon: string;
  ngayPhaiTra: string;
  ngayTra?: string;
  soNgayMuon: number;
  tienPhat: number;
}

const getStatusColor = (status: string) => {
  const normalized = status?.toUpperCase().replace(/\s+/g, '_') || '';
  switch (normalized) {
    case 'PENDING':
    case 'CHO_DUYET':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'ACTIVE':
    case 'ĐANG_MƯỢN':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'RETURNED':
    case 'ĐÃ_TRẢ':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'REJECTED':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};

const getStatusLabel = (status: string): string => {
  const normalized = status?.toUpperCase().replace(/\s+/g, '_') || '';
  const labelMap: Record<string, string> = {
    'PENDING': 'Chờ duyệt',
    'CHO_DUYET': 'Chờ duyệt',
    'ACTIVE': 'Đang mượn',
    'ĐANG_MƯỢN': 'Đang mượn',
    'RETURNED': 'Đã trả',
    'ĐÃ_TRẢ': 'Đã trả',
    'REJECTED': 'Từ chối',
  };
  return labelMap[normalized] || status;
};

export default function BorrowSlipManagerView() {
  const { token } = useAuthStore();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<PhieuMuonTraData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<BorrowFormData>({
    maCuonSach: 0,
    maDocGia: '',
    ngayMuon: new Date().toISOString().split('T')[0],
    ngayPhaiTra: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    soNgayMuon: 0,
    tienPhat: 0,
  });

  // Fetch borrow slips
  const { data: slips = [], isLoading } = useQuery({
    queryKey: ['borrow-slips'],
    queryFn: async () => {
      const response = await staffApi.borrowSlips.getAll();
      return (response.data?.result ?? []) as PhieuMuonTraData[];
    },
    enabled: !!token,
  });

  // Filter slips
  const filteredSlips = slips.filter(slip => {
    const matchesSearch =
      slip.maDocGia?.includes(searchQuery.toLowerCase()) ||
      slip.soPhieu?.toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'all' ||
      slip.trangThai?.toUpperCase().replace(/\s+/g, '_') === statusFilter.toUpperCase().replace(/\s+/g, '_');

    return matchesSearch && matchesStatus;
  });

  const handleSaveSlip = async () => {
    setIsSubmitting(true);
    try {
      if (selectedSlip?.soPhieu) {
        await staffApi.borrowSlips.update(String(selectedSlip.soPhieu), formData as any);
        addNotification({ type: 'SUCCESS', message: '✓ Phiếu mượn đã được cập nhật' });
      }
      await queryClient.invalidateQueries({ queryKey: ['borrow-slips'] });
      setShowForm(false);
    } catch (error) {
      addNotification({ type: 'ERROR', message: '✗ Có lỗi xảy ra' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlip = async (slip: PhieuMuonTraData) => {
    if (confirm('Xác nhận xóa phiếu mượn này?')) {
      try {
        await staffApi.borrowSlips.delete(String(slip.soPhieu));
        addNotification({ type: 'SUCCESS', message: '✓ Phiếu mượn đã được xóa' });
        await queryClient.invalidateQueries({ queryKey: ['borrow-slips'] });
      } catch (error) {
        addNotification({ type: 'ERROR', message: '✗ Có lỗi xảy ra' });
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Phiếu Mượn</h2>
          <p className="text-slate-600 text-sm mt-1">Quản lý yêu cầu mượn sách từ độc giả</p>
        </div>
        {/* <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg shadow-lg shadow-emerald-200/30 transition-all"
        >
          <Plus size={20} />
          Tạo Phiếu Mượn
        </button> */}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-lg border border-white/30 group-hover:bg-white/50 transition-all"></div>
          <div className="relative flex items-center gap-2 px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã độc giả hoặc số phiếu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/40 backdrop-blur-xl border border-white/30 hover:bg-white/50 text-slate-700 font-medium transition-all"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="CHO_DUYET">Chờ duyệt</option>
          <option value="ACTIVE">Đang mượn</option>
          <option value="RETURNED">Đã trả</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </div>

      {/* Slips Table */}
      <div className="relative group rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/30"></div>
        <div className="relative overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Đang tải...</div>
          ) : filteredSlips.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Không có phiếu mượn</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-white/20">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Số Phiếu</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Mã Độc Giả</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Ngày Mượn</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Hạn Trả</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Trạng Thái</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Tiền Phạt</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlips.map((slip) => (
                  <tr
                    key={slip.soPhieu}
                    className="border-b border-white/10 hover:bg-white/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{slip.soPhieu}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{slip.maDocGia}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{slip.ngayMuon}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{slip.ngayPhaiTra}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(slip.trangThai || '')}`}>
                        {getStatusLabel(slip.trangThai || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {slip.tienPhat?.toLocaleString()} ₫
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedSlip(slip);
                          setFormData({
                            maCuonSach: slip.maCuonSach || 0,
                            maDocGia: slip.maDocGia || '',
                            ngayMuon: slip.ngayMuon || '',
                            ngayPhaiTra: slip.ngayPhaiTra || '',
                            ngayTra: slip.ngayTra,
                            soNgayMuon: slip.soNgayMuon || 0,
                            tienPhat: slip.tienPhat || 0,
                          });
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg bg-white/40 hover:bg-emerald-100 text-emerald-600 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSlip(slip)}
                        className="p-2 rounded-lg bg-white/40 hover:bg-red-100 text-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative group rounded-2xl max-w-md w-full max-h-96 overflow-auto">
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/40"></div>
            <div className="relative p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedSlip ? 'Cập Nhật Phiếu Mượn' : 'Tạo Phiếu Mượn Mới'}
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Mã độc giả"
                  value={formData.maDocGia}
                  onChange={(e) => setFormData({ ...formData, maDocGia: e.target.value })}
                  className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                />
                <input
                  type="number"
                  placeholder="Mã cuốn sách"
                  value={formData.maCuonSach}
                  onChange={(e) => setFormData({ ...formData, maCuonSach: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                />
                <input
                  type="date"
                  value={formData.ngayMuon}
                  onChange={(e) => setFormData({ ...formData, ngayMuon: e.target.value })}
                  className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                />
                <input
                  type="date"
                  value={formData.ngayPhaiTra}
                  onChange={(e) => setFormData({ ...formData, ngayPhaiTra: e.target.value })}
                  className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSlip}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
