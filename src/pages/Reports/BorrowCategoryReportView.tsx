import { useState } from 'react';
import { Printer, FileText } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import reportsApi from '../../services/reportsApi';
import type { CTBC_THMS } from '../../types';

interface ReportDetail {
  maTheLoai: string | number;
  tenTheLoai: string;
  soLuotMuon: number;
  tiLe: number; // percentage
}

interface ReportData {
  thang: number;
  nam: number;
  tongSoLuotMuon: number;
  chiTiet: ReportDetail[];
}

export default function BorrowCategoryReportView() {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch report data from API
  const fetchReport = async () => {
    if (!selectedMonth) return;

    try {
      setLoading(true);

      const [yearStr, monthStr] = selectedMonth.split('-');
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);

      // First, get all lending reports (or filter by date)
      const reportsRes = await reportsApi.lendingReport.getAll({ pageSize: 100 });
      const reports = reportsRes.data.result ?? [];

      if (reports.length === 0) {
        setReportData(null);
        setLoading(false);
        return;
      }

      // Use the first report ID for now (in production, filter by month/year)
      const reportId = String(reports[0]?.maBCTHMS || '');

      // Get details from the report
      const detailsRes = await reportsApi.lendingReport.getDetails(reportId);
      const details = (detailsRes.data.result ?? []) as CTBC_THMS[];

      // Calculate total loans and format data
      const totalLoans = details.reduce((sum, item) => sum + item.soLuotMuon, 0);

      const chiTiet: ReportDetail[] = details.map((item) => ({
        maTheLoai: item.maTheLoai,
        tenTheLoai: item.theLoai?.tenTheLoai || `Thể loại ${item.maTheLoai}`,
        soLuotMuon: item.soLuotMuon,
        tiLe: totalLoans > 0 ? (item.soLuotMuon / totalLoans) * 100 : 0,
      }));

      const reportData: ReportData = {
        thang: month,
        nam: year,
        tongSoLuotMuon: totalLoans,
        chiTiet,
      };

      setReportData(reportData);
    } catch (err) {
      const error = err as Record<string, unknown>;
      console.error('Failed to fetch report:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <SectionContainer title="Báo cáo mượn sách theo thể loại" description="Thống kê lượt mượn sách phân theo thể loại trong tháng">
      <div className="space-y-6">
        {/* Control Panel */}
        <div className="print:hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn tháng/năm
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              onClick={fetchReport}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Đang lập...' : 'Lập Báo Cáo'}
            </button>

            {reportData && (
              <button
                onClick={handlePrint}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200 flex items-center gap-2"
              >
                <Printer size={18} />
                In Báo Cáo
              </button>
            )}
          </div>
        </div>

        {/* Summary Card - Bento Style */}
        {reportData && (
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 border border-indigo-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
              Tháng {reportData.thang}/{reportData.nam}
            </p>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-indigo-600">
                {reportData.tongSoLuotMuon}
              </div>
              <p className="text-gray-700 font-medium mb-1">
                Tổng số lượt mượn trong tháng
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        {reportData ? (
          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500 w-12">
                      STT
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                      Tên thể loại
                    </th>
                    <th className="px-6 py-4 text-right text-xs uppercase font-semibold text-gray-500 w-32">
                      Số lượt mượn
                    </th>
                    <th className="px-6 py-4 text-right text-xs uppercase font-semibold text-gray-500 w-24">
                      Tỉ lệ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.chiTiet.map((item, index) => (
                    <tr
                      key={item.maTheLoai}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.tenTheLoai}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                        {item.soLuotMuon}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-indigo-600 text-right">
                        {item.tiLe.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-gray-200 p-12 text-center shadow-sm">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              Vui lòng chọn tháng và bấm Lập báo cáo
            </p>
          </div>
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
        }
      `}</style>
    </SectionContainer>
  );
}
