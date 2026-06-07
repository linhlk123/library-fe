import { useState, useEffect } from 'react';
import { Printer, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import { lendingApi } from '../../services/lendingApi';
import { readersApi } from '../../services/readersApi';
import { booksApi } from '../../services/booksApi';

interface BorrowedBookDetail {
  maCuonSach: number;
  tenSach: string;
  ngayMuon: string;
  ngayPhaiTra: string;
  ngayTra: string | null;
  trangThai: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'RETURNED_LATE';
}

interface UserBorrowStats {
  maDocGia: string;
  tenDocGia: string;
  tongMuon: number;
  dangMuon: number;
  treHan: number;
  daTra: number;
  danhSachMuon: BorrowedBookDetail[];
}

export default function BorrowCategoryReportView() {
  const [userData, setUserData] = useState<UserBorrowStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Fetch all loan records and group by user
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [slipsRes, readersRes, cuonSachRes, sachRes, dauSachRes] = await Promise.all([
        lendingApi.phieuMuonTra.getAll({ pageSize: 1000 }),
        readersApi.docgia.getAll({ pageSize: 1000 }),
        booksApi.cuonsach.getAll({ pageSize: 1000 }),
        booksApi.sach.getAll({ pageSize: 1000 }),
        booksApi.dausach.getAll({ pageSize: 1000 }),
      ]);

      const extractArray = (resData: any): any[] => {
        if (Array.isArray(resData)) return resData;
        if (resData && typeof resData === 'object' && Array.isArray(resData.content)) {
          return resData.content;
        }
        return [];
      };

      const slips = extractArray(slipsRes.data?.result);
      const readers = extractArray(readersRes.data?.result);
      const cuonSachs = extractArray(cuonSachRes.data?.result);
      const sachs = extractArray(sachRes.data?.result);
      const dauSachs = extractArray(dauSachRes.data?.result);

      const readersMap = new Map(readers.map(r => [r.maDocGia, r.hoTen]));
      const cuonSachMap = new Map(cuonSachs.map(cs => [cs.maCuonSach, cs.maSach]));
      const sachMap = new Map(sachs.map(s => [s.maSach, s.maDauSach]));
      const dauSachMap = new Map(dauSachs.map(ds => [ds.maDauSach, ds.tenDauSach]));

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Group slips by maDocGia
      const userGroups = new Map<string, any[]>();
      slips.forEach((slip) => {
        if (!slip.maDocGia) return;
        if (!userGroups.has(slip.maDocGia)) {
          userGroups.set(slip.maDocGia, []);
        }
        userGroups.get(slip.maDocGia)!.push(slip);
      });

      const stats: UserBorrowStats[] = [];

      userGroups.forEach((userSlips, maDocGia) => {
        const tenDocGia = readersMap.get(maDocGia) || 'Độc giả không rõ';
        const danhSachMuon: BorrowedBookDetail[] = userSlips.map((slip) => {
          const maSach = cuonSachMap.get(slip.maCuonSach);
          const maDauSach = maSach ? sachMap.get(maSach) : undefined;
          const tenSach = maDauSach ? (dauSachMap.get(maDauSach) || `Sách #${maSach}`) : `Cuốn #${slip.maCuonSach}`;

          const due = new Date(slip.ngayPhaiTra);
          due.setHours(0, 0, 0, 0);

          let trangThai: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'RETURNED_LATE' = 'ACTIVE';
          if (slip.ngayTra) {
            const returned = new Date(slip.ngayTra);
            returned.setHours(0, 0, 0, 0);
            trangThai = returned > due ? 'RETURNED_LATE' : 'RETURNED';
          } else {
            trangThai = now > due ? 'OVERDUE' : 'ACTIVE';
          }

          return {
            maCuonSach: slip.maCuonSach,
            tenSach,
            ngayMuon: slip.ngayMuon ? new Date(slip.ngayMuon).toLocaleDateString('vi-VN') : 'N/A',
            ngayPhaiTra: slip.ngayPhaiTra ? new Date(slip.ngayPhaiTra).toLocaleDateString('vi-VN') : 'N/A',
            ngayTra: slip.ngayTra ? new Date(slip.ngayTra).toLocaleDateString('vi-VN') : null,
            trangThai,
          };
        });

        const tongMuon = danhSachMuon.length;
        const daTra = danhSachMuon.filter(item => item.trangThai === 'RETURNED' || item.trangThai === 'RETURNED_LATE').length;
        const treHan = danhSachMuon.filter(item => item.trangThai === 'OVERDUE').length;
        const dangMuon = danhSachMuon.filter(item => item.trangThai === 'ACTIVE').length;

        stats.push({
          maDocGia,
          tenDocGia,
          tongMuon,
          dangMuon,
          treHan,
          daTra,
          danhSachMuon,
        });
      });

      // Sort by total borrows descending
      stats.sort((a, b) => b.tongMuon - a.tongMuon);
      setUserData(stats);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định khi tải dữ liệu';
      console.error('Failed to load user borrow stats:', errorMsg);
      setError(`Không thể tải dữ liệu thống kê mượn sách: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const toggleExpand = (maDocGia: string) => {
    if (expandedUser === maDocGia) {
      setExpandedUser(null);
    } else {
      setExpandedUser(maDocGia);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'RETURNED_LATE') => {
    switch (status) {
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle size={12} />
            Đã trả
          </span>
        );
      case 'RETURNED_LATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle size={12} />
            Đã trả (Trễ)
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle size={12} />
            Trễ hạn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} />
            Đang mượn
          </span>
        );
    }
  };

  return (
    <SectionContainer
      title="Thống kê mượn sách theo độc giả"
      description="Xem tổng số lượng sách đã mượn và trạng thái mượn trả chi tiết của từng độc giả"
    >
      <div className="space-y-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 print:hidden">
            {error}
          </div>
        )}

        {/* Action Panel */}
        <div className="print:hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Thao tác dữ liệu</h4>
            <p className="text-xs text-gray-500">
              Nhấp vào từng hàng để mở rộng và xem danh sách cuốn sách chi tiết của độc giả đó.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
            {userData.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5 transition"
              >
                <Printer size={15} />
                In Thống Kê
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {userData.length > 0 ? (
          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
                    <th className="px-6 py-4 text-left w-12">STT</th>
                    <th className="px-6 py-4 text-left">Độc giả</th>
                    <th className="px-6 py-4 text-center w-28">Tổng mượn</th>
                    <th className="px-6 py-4 text-center w-28 text-blue-600">Đang mượn</th>
                    <th className="px-6 py-4 text-center w-28 text-green-600">Đã trả</th>
                    <th className="px-6 py-4 text-center w-28 text-red-600">Trễ hạn</th>
                    <th className="px-6 py-4 text-center w-16 print:hidden">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {userData.map((user, index) => {
                    const isExpanded = expandedUser === user.maDocGia;
                    return (
                      <>
                        <tr
                          key={user.maDocGia}
                          onClick={() => toggleExpand(user.maDocGia)}
                          className="hover:bg-gray-50/80 cursor-pointer transition duration-150"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="font-semibold text-gray-900">{user.tenDocGia}</div>
                            <div className="text-xs text-gray-500">Mã: {user.maDocGia}</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                            {user.tongMuon}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-blue-600 text-center">
                            {user.dangMuon}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600 text-center">
                            {user.daTra}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-red-600 text-center">
                            {user.treHan}
                          </td>
                          <td className="px-6 py-4 text-center print:hidden">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </td>
                        </tr>

                        {/* Collapsible details row */}
                        {isExpanded && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-inner">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                                      <th className="px-4 py-3 text-left w-24">Mã cuốn</th>
                                      <th className="px-4 py-3 text-left">Tên sách</th>
                                      <th className="px-4 py-3 text-left w-32">Ngày mượn</th>
                                      <th className="px-4 py-3 text-left w-32">Hạn trả</th>
                                      <th className="px-4 py-3 text-left w-32">Ngày trả</th>
                                      <th className="px-4 py-3 text-center w-32">Trạng thái</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {user.danhSachMuon.map((book) => (
                                      <tr key={book.maCuonSach} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-gray-600 font-mono">
                                          #{book.maCuonSach}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                          {book.tenSach}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                          {book.ngayMuon}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 font-medium">
                                          {book.ngayPhaiTra}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                          {book.ngayTra || (
                                            <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded text-xs">
                                              Chưa trả
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          {getStatusBadge(book.trangThai)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="rounded-xl bg-white border border-gray-200 p-12 text-center shadow-sm">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                Chưa có dữ liệu mượn sách nào được ghi nhận.
              </p>
            </div>
          )
        )}
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </SectionContainer>
  );
}
