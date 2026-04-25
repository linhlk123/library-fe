import React from 'react';
import { useQuery } from '@tanstack/react-query';
import userApi from '../../services/userApi';
import { X, BookOpen } from 'lucide-react';
import type { BookForUI } from '../../types';

interface BookDetailModalProps {
  book: BookForUI;
  onClose: () => void;
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  // Fetch editions and copies
  const { data: sachData } = useQuery({
    queryKey: ['sach'],
    queryFn: () => userApi.getAllSach(),
  });

  const { data: cuonSachData } = useQuery({
    queryKey: ['cuonsach'],
    queryFn: () => userApi.getAllCuonSach(),
  });

  const sachList = sachData?.data?.result || [];
  const cuonSachList = cuonSachData?.data?.result || [];

  // Get editions of this book
  const editions = sachList.filter((s) => s.maDauSach === book.maDauSach);

  // Calculate availability per edition
  const editionsWithAvailability = editions.map((edition) => {
    const copies = cuonSachList.filter((cs) => cs.maSach === edition.maSach);
    const availableCopies = copies.filter(
      (cs) => cs.tinhTrang === 'AVAILABLE'
    );
    return {
      ...edition,
      totalCopies: copies.length,
      availableCopies: availableCopies.length,
    };
  });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-900">Chi tiết sách</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Book cover and basic info */}
            <div className="flex gap-8">
              {/* Cover */}
              <div className="flex-shrink-0">
                <div className="h-80 w-48 rounded-2xl bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 overflow-hidden shadow-lg border border-white/50 flex items-center justify-center group">
                  {book.anhBiaUrl ? (
                    <img
                      src={book.anhBiaUrl}
                      alt={book.tenDauSach}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                      <BookOpen size={56} className="mb-2" />
                      <p className="text-sm font-medium">Không có ảnh bìa</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {book.tenDauSach}
                </h1>

                {/* Authors */}
                {book.tacGiaList && book.tacGiaList.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tác giả:</span>{' '}
                      {book.tacGiaList.map((a) => a.tenTacGia).join(', ')}
                    </p>
                  </div>
                )}

                {/* MaDauSach */}
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Mã:</span> {book.maDauSach}
                </p>
              </div>
            </div>

            {/* Editions */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Các ấn bản</h3>
              {editionsWithAvailability.length === 0 ? (
                <p className="text-gray-600">Chưa có ấn bản nào</p>
              ) : (
                <div className="space-y-4">
                  {editionsWithAvailability.map((edition) => (
                    <div
                      key={edition.maSach}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Nhà xuất bản: {edition.nhaXuatBan}
                          </p>
                          <p className="text-sm text-gray-600">
                            Năm: {edition.namXuatBan}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {edition.giaTien.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-gray-600">
                          Số lượng: {edition.totalCopies} cuốn
                        </span>
                        {edition.availableCopies > 0 ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            Có {edition.availableCopies} cuốn
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Hết sách
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
