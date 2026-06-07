import { useState, useEffect } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import BorrowCategoryReportView from './BorrowCategoryReportView';
import LateReturnReportView from './LateReturnReportView';
import { booksApi } from '../../services/booksApi';
import { lendingApi } from '../../services/lendingApi';
import reportsApi from '../../services/reportsApi';

type ReportTab = 'OVERVIEW' | 'BORROW_CATEGORY' | 'LATE_RETURN';

const ReportsView = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('OVERVIEW');
  const [totalDauSach, setTotalDauSach] = useState<number | null>(null);
  const [totalLateBooks, setTotalLateBooks] = useState<number | null>(null);
  const [totalFineCollected, setTotalFineCollected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const extractArray = (resData: any): any[] => {
          if (Array.isArray(resData)) return resData;
          if (resData && typeof resData === 'object' && Array.isArray(resData.content)) {
            return resData.content;
          }
          return [];
        };

        const [dausachRes, overdueRes, fineRes] = await Promise.all([
          booksApi.dausach.getAll({ pageSize: 999 }),
          reportsApi.overdueReport.getAll({ pageSize: 999 }),
          lendingApi.phieuThuTienPhat.getAll({ pageSize: 999 }),
        ]);

        const dausachList = extractArray(dausachRes.data?.result);
        const overdueList = extractArray(overdueRes.data?.result);
        const fineList = extractArray(fineRes.data?.result);

        setTotalDauSach(dausachList.length);
        setTotalLateBooks(overdueList.length);
        const totalFines = fineList.reduce((sum, item) => sum + (item.soTienThu || 0), 0);
        setTotalFineCollected(totalFines);
      } catch (err) {
        console.error('Lỗi khi tải thống kê báo cáo:', err);
        setError('Không tải được một số số liệu thống kê tổng quan.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const reportCards = [
    {
      title: 'Báo cáo tồn sách',
      value: loading ? 'Đang tải...' : totalDauSach !== null ? `${totalDauSach}` : 'N/A',
      subtitle: 'Đầu sách trong thư viện'
    },
    {
      title: 'Báo cáo mượn trễ',
      value: loading ? 'Đang tải...' : totalLateBooks !== null ? `${totalLateBooks}` : 'N/A',
      subtitle: 'Cuốn sách đang trễ hạn'
    },
    {
      title: 'Báo cáo tiền phạt',
      value: loading ? 'Đang tải...' : totalFineCollected !== null ? `${totalFineCollected.toLocaleString('vi-VN')} VND` : '0 VND',
      subtitle: 'Tổng tiền phạt đã thu'
    },
  ];

  if (activeTab === 'BORROW_CATEGORY') {
    return (
      <>
        <div className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Quay lại tổng quan
          </button>
        </div>
        <BorrowCategoryReportView />
      </>
    );
  }

  if (activeTab === 'LATE_RETURN') {
    return (
      <>
        <div className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Quay lại tổng quan
          </button>
        </div>
        <LateReturnReportView />
      </>
    );
  }

  return (
    <SectionContainer
      title="Lập báo cáo"
      description="Tổng hợp tình hình sách, mượn trả và tiền phạt"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {reportCards.map((card) => (
          <article key={card.title} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          </article>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Báo cáo chi tiết</h3>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('BORROW_CATEGORY')}
            className="w-full rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition text-left"
          >
            Thống kê mượn sách theo độc giả
          </button>
          <button
            onClick={() => setActiveTab('LATE_RETURN')}
            className="w-full rounded-lg bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 transition text-left"
          >
            Báo cáo sách trả trễ hạn
          </button>
        </div>
      </div>
    </SectionContainer>
  );
};

export default ReportsView;
