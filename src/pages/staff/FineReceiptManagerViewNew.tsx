import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { staffApi } from '../../services/staffApi';
import { useUIStore, useAuthStore } from '../../stores';
import type { PhieuThuTienPhat } from '../../types';

interface FineReceiptFormData {
  maDocGia: string;
  soTienThu: number;
  ngayThu?: string;
  ghiChu?: string;
}

export default function FineReceiptManagerView() {
  const { token } = useAuthStore();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PhieuThuTienPhat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FineReceiptFormData>({
    maDocGia: '',
    soTienThu: 0,
    ngayThu: new Date().toISOString().split('T')[0],
    ghiChu: '',
  });

  // Fetch fine receipts
  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['fine-receipts'],
    queryFn: async () => {
      const response = await staffApi.fineReceipts.getAll();
      return (response.data?.result ?? []) as PhieuThuTienPhat[];
    },
    enabled: !!token,
  });

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt =>
    receipt.maDocGia?.includes(searchQuery.toLowerCase()) ||
    receipt.soPTT?.toString().includes(searchQuery)
  );

  const handleCreateNew = () => {
    setSelectedReceipt(null);
    setFormData({
      maDocGia: '',
      soTienThu: 0,
      ngayThu: new Date().toISOString().split('T')[0],
      ghiChu: '',
    });
    setShowForm(true);
  };

  const handleSaveReceipt = async () => {
    if (!formData.maDocGia || formData.soTienThu <= 0) {
      addNotification({ type: 'ERROR', message: '✗ Vui lòng điền đầy đủ thông tin' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedReceipt?.soPTT) {
        await staffApi.fineReceipts.update(Number(selectedReceipt.soPTT), formData as any);
        addNotification({ type: 'SUCCESS', message: '✓ Phiếu thu đã được cập nhật' });
      } else {
        await staffApi.fineReceipts.create(formData as any);
        addNotification({ type: 'SUCCESS', message: '✓ Phiếu thu đã được tạo' });
      }
      await queryClient.invalidateQueries({ queryKey: ['fine-receipts'] });
      setShowForm(false);
    } catch (error) {
      addNotification({ type: 'ERROR', message: '✗ Có lỗi xảy ra' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReceipt = async (receipt: PhieuThuTienPhat) => {
    if (confirm('Xác nhận xóa phiếu thu này?')) {
      try {
        await staffApi.fineReceipts.delete(receipt.soPTT as number);
        addNotification({ type: 'SUCCESS', message: '✓ Phiếu thu đã được xóa' });
        await queryClient.invalidateQueries({ queryKey: ['fine-receipts'] });
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
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Phiếu Thu Tiền Phạt</h2>
          <p className="text-slate-600 text-sm mt-1">Quản lý thanh toán tiền phạt vi phạm từ độc giả</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg shadow-lg shadow-emerald-200/30 transition-all"
        >
          <Plus size={20} />
          Tạo Phiếu Thu
        </button>
      </div>

      {/* Search */}
      <div className="relative group">
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

      {/* Receipts Table */}
      <div className="relative group rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/30"></div>
        <div className="relative overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Đang tải...</div>
          ) : filteredReceipts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Không có phiếu thu</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-white/20">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Số Phiếu</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Mã Độc Giả</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Số Tiền Thu</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Ngày Thu</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Ghi Chú</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-700">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => (
                  <tr
                    key={receipt.soPTT}
                    className="border-b border-white/10 hover:bg-white/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{receipt.soPTT}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{receipt.maDocGia}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                      {receipt.soTienThu?.toLocaleString()} ₫
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{receipt.ngayThu}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {(receipt as any).ghiChu || '-'}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedReceipt(receipt);
                          setFormData({
                            maDocGia: receipt.maDocGia || '',
                            soTienThu: receipt.soTienThu || 0,
                            ngayThu: receipt.ngayThu,
                            ghiChu: (receipt as any).ghiChu,
                          });
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg bg-white/40 hover:bg-emerald-100 text-emerald-600 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReceipt(receipt)}
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
                {selectedReceipt ? 'Cập Nhật Phiếu Thu' : 'Tạo Phiếu Thu Mới'}
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
                  placeholder="Số tiền thu"
                  value={formData.soTienThu}
                  onChange={(e) => setFormData({ ...formData, soTienThu: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                />
                <input
                  type="date"
                  value={formData.ngayThu}
                  onChange={(e) => setFormData({ ...formData, ngayThu: e.target.value })}
                  className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                />
                <textarea
                  placeholder="Ghi chú"
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  rows={2}
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
                  onClick={handleSaveReceipt}
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
