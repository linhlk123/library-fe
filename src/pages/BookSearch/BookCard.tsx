import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import type { BookForUI } from '../../types';
import UpdateBookModal from './UpdateBookModal';

interface BookCardProps {
  book: BookForUI;
  deleteMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  deleteMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all flex flex-col h-full cursor-pointer ${
        isSelected
          ? 'border-red-500 bg-red-50 ring-2 ring-red-300'
          : 'border-gray-100'
      } ${deleteMode ? 'ring-1 ring-gray-200' : ''}`}
      onClick={() => deleteMode && onToggleSelect?.()}
      role={deleteMode ? 'button' : 'article'}
      tabIndex={deleteMode ? 0 : -1}
      onKeyPress={(e) => {
        if (deleteMode && (e.key === 'Enter' || e.key === ' ')) {
          onToggleSelect?.();
        }
      }}
    >
      {/* Checkbox Overlay (Delete Mode) */}
      {deleteMode && (
        <div className="absolute top-2 right-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            className="w-5 h-5 text-red-600 rounded cursor-pointer"
          />
        </div>
      )}

      {/* Cover Image */}
      <div className={`h-40 w-full bg-gray-200 relative flex-shrink-0 ${isSelected ? 'opacity-75' : ''}`}>
        {book.anhBiaUrl ? (
          <img
            src={book.anhBiaUrl}
            alt={book.tenDauSach}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Không có ảnh bìa
          </div>
        )}

        {book.theLoai && (
          <div className="absolute top-2 left-2">
            <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] uppercase font-bold px-2 py-1 rounded">
              {book.theLoai.tenTheLoai}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-2 left-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              book.status === 'AVAILABLE'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {book.status === 'AVAILABLE' ? 'Còn' : 'Hết'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title */}
        <h3
          className="text-sm font-bold text-gray-900 line-clamp-2"
          title={book.tenDauSach}
        >
          {book.tenDauSach}
        </h3>

        {/* Authors */}
        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
          {book.tacGiaList.map((a) => a.tenTacGia).join(', ')}
        </p>

        {/* Publisher & Year */}
        {(book.nhaXuatBan || book.namXuatBan) && (
          <div className="text-xs text-gray-600 mb-2">
            <div>{book.nhaXuatBan || 'N/A'}</div>
            <div className="text-gray-500">{book.namXuatBan || 'N/A'}</div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-2"></div>

        {/* Book Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Availability */}
          <div className="text-center bg-gray-50 rounded p-1.5">
            <p className="text-xs text-gray-500">Còn lại</p>
            <p className="text-sm font-bold text-gray-900">{book.availableCopies}</p>
          </div>

          {/* Total */}
          <div className="text-center bg-gray-50 rounded p-1.5">
            <p className="text-xs text-gray-500">Tổng</p>
            <p className="text-sm font-bold text-gray-900">{book.totalCopies}</p>
          </div>

          {/* Price */}
          {book.giaTien && (
            <div className="text-center bg-gray-50 rounded p-1.5">
              <p className="text-xs text-gray-500">Giá</p>
              <p className="text-sm font-bold text-gray-900">
                {(book.giaTien / 1000).toFixed(0)}k
              </p>
            </div>
          )}

          {/* Total Quantity */}
          {book.soLuong && (
            <div className="text-center bg-gray-50 rounded p-1.5">
              <p className="text-xs text-gray-500">Kho</p>
              <p className="text-sm font-bold text-gray-900">{book.soLuong}</p>
            </div>
          )}
        </div>

        {/* Update Button */}
        {!deleteMode && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="mt-auto w-full py-2 px-3 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            <Edit2 size={16} />
            Cập nhật
          </button>
        )}
      </div>

      {/* Update Book Modal */}
      <UpdateBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        book={book}
        onSuccess={() => {
          // Optionally refetch book list here
          console.log('Book updated successfully');
        }}
      />
    </div>
  );
};

export default BookCard;  