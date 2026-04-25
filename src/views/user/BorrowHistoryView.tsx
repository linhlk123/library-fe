import React from 'react';
import { useQuery } from '@tanstack/react-query';
import userApi from '../../services/userApi';
import { SectionContainer } from '../../components/shared/SectionContainer';
import { Loader } from '../../components/shared/Loader';
import { History } from 'lucide-react';

export default function BorrowHistoryView() {
  const { data: borrowingsData, isLoading } = useQuery({
    queryKey: ['borrowings'],
    queryFn: () => userApi.getAllPhieuMuonTra(),
  });

  const borrowings = borrowingsData?.data?.result || [];

  // Sort by borrow date descending
  const sortedBorrowings = [...borrowings].sort(
    (a, b) =>
      new Date(b.ngayMuon).getTime() - new Date(a.ngayMuon).getTime()
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" message="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <SectionContainer
      title="Lịch sử mượn sách"
      description={`Tổng cộng ${borrowings.length} lần mượn`}
    >
      {borrowings.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">Bạn chưa có lịch sử mượn sách</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Phiếu mượn
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Ngày mượn
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Hạn trả
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Ngày trả
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBorrowings.map((borrowing) => {
                const isReturned = !!borrowing.ngayTra;
                const isOverdue =
                  !isReturned &&
                  new Date(borrowing.ngayPhaiTra) < new Date();

                return (
                  <tr
                    key={borrowing.soPhieu}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        #{borrowing.soPhieu}
                      </p>
                      <p className="text-sm text-gray-600">
                        {borrowing.maCuonSach}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(borrowing.ngayMuon).toLocaleDateString(
                        'vi-VN'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(borrowing.ngayPhaiTra).toLocaleDateString(
                        'vi-VN'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {borrowing.ngayTra ? (
                        new Date(borrowing.ngayTra).toLocaleDateString(
                          'vi-VN'
                        )
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isReturned ? (
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          Đã trả
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Quá hạn
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          Đang mượn
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionContainer>
  );
}
