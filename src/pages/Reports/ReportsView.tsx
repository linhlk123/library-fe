import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import BorrowCategoryReportView from './BorrowCategoryReportView';
import LateReturnReportView from './LateReturnReportView';

const reportCards = [
  { title: 'Bao cao ton sach', value: '124', subtitle: 'Dau sach ton kho' },
  { title: 'Bao cao muon tre', value: '18', subtitle: 'Doc gia tre han' },
  { title: 'Bao cao tien phat', value: '12,500,000 VND', subtitle: 'Thang hien tai' },
];

type ReportTab = 'OVERVIEW' | 'BORROW_CATEGORY' | 'LATE_RETURN';

const ReportsView = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('OVERVIEW');

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
      title="Lap bao cao"
      description="Tong hop tinh hinh sach, muon tra va tien phat."
    >
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
            Báo cáo mượn sách theo thể loại
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
