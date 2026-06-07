import { useState, useEffect } from 'react';
import { Printer, AlertTriangle, RefreshCw } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import { lendingApi } from '../../services/lendingApi';
import { readersApi } from '../../services/readersApi';
import { booksApi } from '../../services/booksApi';

interface LateBookDetail {
  id: string | number;
  maDocGia: string;
  tenDocGia: string;
  maCuonSach: number;
  tenSach: string;
  ngayMuon: string;
  ngayPhaiTra: string;
  ngayTra: string;
  soNgayTraTre: number;
  tienPhat: number;
}

export default function LateReturnReportView() {
  const [reportData, setReportData] = useState<LateBookDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all late return records by evaluating PhieuMuonTra
  const fetchAllReports = async () => {
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

      const formattedData: LateBookDetail[] = slips
        .filter((slip) => {
          const due = new Date(slip.ngayPhaiTra);
          due.setHours(0, 0, 0, 0);

          if (slip.ngayTra) {
            const returned = new Date(slip.ngayTra);
            returned.setHours(0, 0, 0, 0);
            return returned > due;
          } else {
            return now > due;
          }
        })
        .map((slip) => {
          const due = new Date(slip.ngayPhaiTra);
          due.setHours(0, 0, 0, 0);
          const returned = slip.ngayTra ? new Date(slip.ngayTra) : now;
          returned.setHours(0, 0, 0, 0);

          const diffTime = returned.getTime() - due.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const soNgayTraTre = diffDays > 0 ? diffDays : 0;

          const maSach = cuonSachMap.get(slip.maCuonSach);
          const maDauSach = maSach ? sachMap.get(maSach) : undefined;
          const tenSach = maDauSach ? (dauSachMap.get(maDauSach) || `Sách #${maSach}`) : `Cuốn #${slip.maCuonSach}`;
          const tenDocGia = readersMap.get(slip.maDocGia) || 'Độc giả không rõ';

          return {
            id: `${slip.soPhieu || slip.maCuonSach}-${slip.maDocGia}`,
            maDocGia: slip.maDocGia,
            tenDocGia,
            maCuonSach: slip.maCuonSach,
            tenSach,
            ngayMuon: slip.ngayMuon
              ? new Date(slip.ngayMuon).toLocaleDateString('vi-VN')
              : 'N/A',
            ngayPhaiTra: slip.ngayPhaiTra
              ? new Date(slip.ngayPhaiTra).toLocaleDateString('vi-VN')
              : 'N/A',
            ngayTra: slip.ngayTra
              ? new Date(slip.ngayTra).toLocaleDateString('vi-VN')
              : 'Chưa trả',
            soNgayTraTre,
            tienPhat: slip.tienPhat || (soNgayTraTre * 1000),
          };
        });

      setReportData(formattedData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định khi tải danh sách';
      console.error('Failed to fetch overdue books:', errorMsg);
      setError(`Không thể tải danh sách sách trả trễ: ${errorMsg}`);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const totalLateBooks = reportData.length;
  const maxLateDays = reportData.length > 0
    ? Math.max(...reportData.map((item) => item.soNgayTraTre))
    : 0;

  return (
    <SectionContainer
      title="Báo cáo sách trả trễ hạn"
      description="Thống kê toàn bộ các cuốn sách được trả muộn hơn hạn quy định"
    >
      <div className="space-y-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 print:hidden">
            {error}
          </div>
        )}

        {/* Control Panel */}
        <div className="print:hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Thao tác dữ liệu</h4>
            <p className="text-xs text-gray-500">
              Dữ liệu sách trả trễ được tính toán tự động dựa trên toàn bộ dữ liệu phiếu mượn hiện hành.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAllReports}
              disabled={loading}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Làm mới danh sách
            </button>
            {reportData.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5 transition"
              >
                <Printer size={15} />
                In Báo Cáo
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards - Bento Style */}
        {reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Total Late Books */}
            <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-8 border border-red-200 shadow-sm">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
                Tổng sách đang trễ hạn
              </p>
              <div className="flex items-end gap-2">
                <div className="text-5xl font-bold text-red-600">{totalLateBooks}</div>
                <p className="text-gray-700 font-medium mb-2">quyển</p>
              </div>
              <p className="mt-3 text-xs text-red-700">
                Tổng số bản ghi có ngày trả lớn hơn hạn trả hoặc quá hạn mà chưa trả
              </p>
            </div>

            {/* Card 2: Maximum Late Days */}
            <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-8 border border-orange-200 shadow-sm">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
                Trễ kỷ lục
              </p>
              <div className="flex items-end gap-2">
                <div className="text-5xl font-bold text-orange-600">{maxLateDays}</div>
                <p className="text-gray-700 font-medium mb-2">ngày</p>
              </div>
              <p className="mt-3 text-xs text-orange-700">
                Sách trễ hạn nhiều nhất trong toàn bộ dữ liệu
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        {reportData.length > 0 ? (
          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">
                Danh sách sách trả trễ hạn
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Hiển thị toàn bộ dữ liệu trả trễ
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500 w-12">
                      STT
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                      Độc giả
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                      Sách mượn
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500 w-28">
                      Ngày mượn
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500 w-28">
                      Hạn trả
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500 w-28">
                      Ngày trả
                    </th>
                    <th className="px-6 py-4 text-right text-xs uppercase font-semibold text-gray-500 w-28">
                      Số ngày trễ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        <div className="font-semibold">{item.tenDocGia}</div>
                        <div className="text-xs text-gray-500">Mã: {item.maDocGia}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="font-medium text-gray-900">{item.tenSach}</div>
                        <div className="text-xs text-gray-500">Mã cuốn: #{item.maCuonSach}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {item.ngayMuon}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {item.ngayPhaiTra}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className={item.ngayTra === 'Chưa trả' ? 'text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded' : 'text-gray-500'}>
                          {item.ngayTra}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            {item.soNgayTraTre} ngày
                          </span>
                          {item.soNgayTraTre > 30 && (
                            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 animate-bounce" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="rounded-xl bg-white border border-gray-200 p-12 text-center shadow-sm">
              <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                Chưa ghi nhận dữ liệu sách trả trễ hạn nào trong hệ thống phiếu mượn.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Vui lòng lập phiếu mượn trễ hạn hoặc cập nhật ngày trả thực tế.
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
          .rounded-xl {
            border-radius: 0.5rem;
          }
          table {
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </SectionContainer>
  );
}
