import { useEffect, useState } from 'react';
import { Printer, AlertTriangle, Calendar } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import reportsApi from '../../services/reportsApi';
import type { BCSachTraTre } from '../../types';

interface LateBookDetail {
  id: string | number;
  tenSach: string;
  ngayMuon: string; // dd/MM/yyyy format
  soNgayTraTre: number;
}

export default function LateReturnReportView() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [reportData, setReportData] = useState<LateBookDetail[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch late return report from API
  const fetchReport = async () => {
    try {
      setLoading(true);

      // Call API to get books returned late by date
      const response = await reportsApi.overdueReport.getByDate(selectedDate);
      const overdueBooks = (response.data.result ?? []) as BCSachTraTre[];

      // Format data for display
      const formattedData: LateBookDetail[] = overdueBooks.map((book) => ({
        id: `${book.ngay}-${book.maCuonSach}`,
        tenSach: book.cuonSach?.dausach?.tenDauSach || `Cuốn #${book.maCuonSach}`,
        ngayMuon: new Date(book.ngay).toLocaleDateString('vi-VN', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        }),
        soNgayTraTre: book.soNgayTraTre,
      }));

      setReportData(formattedData);
    } catch (err) {
      const error = err as Record<string, unknown>;
      console.error('Failed to fetch report:', error.message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate summary stats
  const totalLateBooks = reportData.length;
  const maxLateDays = reportData.length > 0
    ? Math.max(...reportData.map((item) => item.soNgayTraTre))
    : 0;

  const formatSelectedDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SectionContainer>
      <div className="space-y-6">
        {/* Control Panel */}
        <div className="print:hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn ngày chốt báo cáo
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                <Calendar size={20} className="text-gray-400" />
                <input
                  id="reportDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-gray-900 font-medium"
                />
              </div>
            </div>

            <button
              onClick={fetchReport}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Đang lập...' : 'Lập Báo Cáo'}
            </button>

            {reportData.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200 flex items-center gap-2"
              >
                <Printer size={18} />
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
                Tính đến {formatSelectedDate(selectedDate)}
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
                Sách trễ hạn nhiều nhất
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
                Ngày chốt: {formatSelectedDate(selectedDate)}
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
                      Tên sách
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500 w-32">
                      Ngày mượn
                    </th>
                    <th className="px-6 py-4 text-right text-xs uppercase font-semibold text-gray-500 w-40">
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
                        {item.tenSach}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.ngayMuon}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-700">
                            {item.soNgayTraTre}
                          </span>
                          {item.soNgayTraTre > 30 && (
                            <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
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
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                Không có sách nào trả trễ tính đến ngày này
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Hãy chọn ngày khác hoặc bấm "Lập Báo Cáo" để xem thống kê
              </p>
            </div>
          )
        )}
      </div>

      {/* Print Styles */}
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
