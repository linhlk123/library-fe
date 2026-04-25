import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import booksApi from '../../services/booksApi';
import type { BookForUI, TheLoai } from '../../types';

interface UpdateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookForUI | null;
  onSuccess: () => void;
}

interface FormData {
  tenDauSach: string;
  maTheLoai: string | number;
  anhBiaUrl: string;
  nhaXuatBan: string;
  namXuatBan: number | string;
  giaTien: number | string;
}

const UpdateBookModal: React.FC<UpdateBookModalProps> = ({
  isOpen,
  onClose,
  book,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    tenDauSach: '',
    maTheLoai: '',
    anhBiaUrl: '',
    nhaXuatBan: '',
    namXuatBan: '',
    giaTien: '',
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<TheLoai[]>([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await booksApi.theloai.getAll();
        const cats = (res.data.result ?? []) as TheLoai[];
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Populate form data when modal opens or book changes
  useEffect(() => {
    if (isOpen && book) {
      setFormData({
        tenDauSach: book.tenDauSach || '',
        maTheLoai: book.theLoai?.maTheLoai || '',
        anhBiaUrl: book.anhBiaUrl || '',
        nhaXuatBan: book.nhaXuatBan || '',
        namXuatBan: book.namXuatBan || '',
        giaTien: book.giaTien || '',
      });
    }
  }, [isOpen, book]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        tenDauSach: formData.tenDauSach,
        maTheLoai: parseInt(String(formData.maTheLoai), 10),
        anhBiaUrl: formData.anhBiaUrl,
        nhaXuatBan: formData.nhaXuatBan,
        namXuatBan: parseInt(String(formData.namXuatBan), 10),
        giaTien: parseInt(String(formData.giaTien), 10),
      };

      if (book && book.maDauSach) {
        // Call update API
        await booksApi.dausach.update(book.maDauSach, payload as unknown as Record<string, unknown>);
      }

      // Call success callback
      onSuccess();
      onClose();
    } catch (err) {
      const error = err as Record<string, unknown>;
      console.error('Failed to update book:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Cập nhật thông tin sách
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition text-gray-600"
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Row 1: Full Width - Title */}
            <div>
              <label htmlFor="tenDauSach" className="block text-sm font-medium text-gray-700 mb-2">
                Tên Đầu Sách *
              </label>
              <input
                id="tenDauSach"
                type="text"
                name="tenDauSach"
                value={formData.tenDauSach}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Nhập tên đầu sách"
              />
            </div>

            {/* Row 2: 2 Columns - Category & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="maTheLoai" className="block text-sm font-medium text-gray-700 mb-2">
                  Thể Loại
                </label>
                <select
                  id="maTheLoai"
                  name="maTheLoai"
                  value={formData.maTheLoai}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Chọn thể loại</option>
                  {categories.map((cat) => (
                    <option key={cat.maTheLoai} value={cat.maTheLoai}>
                      {cat.tenTheLoai}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="anhBiaUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Link Ảnh Bìa
                </label>
                <input
                  id="anhBiaUrl"
                  type="text"
                  name="anhBiaUrl"
                  value={formData.anhBiaUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Row 3: 3 Columns - Publisher, Year, Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="nhaXuatBan" className="block text-sm font-medium text-gray-700 mb-2">
                  Nhà Xuất Bản
                </label>
                <input
                  id="nhaXuatBan"
                  type="text"
                  name="nhaXuatBan"
                  value={formData.nhaXuatBan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Nhà xuất bản"
                />
              </div>

              <div>
                <label htmlFor="namXuatBan" className="block text-sm font-medium text-gray-700 mb-2">
                  Năm Xuất Bản
                </label>
                <input
                  id="namXuatBan"
                  type="number"
                  name="namXuatBan"
                  value={formData.namXuatBan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="2024"
                />
              </div>

              <div>
                <label htmlFor="giaTien" className="block text-sm font-medium text-gray-700 mb-2">
                  Giá Tiền (VND)
                </label>
                <input
                  id="giaTien"
                  type="number"
                  name="giaTien"
                  value={formData.giaTien}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="0"
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              type="button"
            >
              Hủy
            </button>
            <button
              onClick={(e) => {
                const form = (e.currentTarget.closest('div') as HTMLElement).parentElement?.querySelector('form') as HTMLFormElement;
                if (form) {
                  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
              }}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
              type="button"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-in.fade-in.zoom-in-95 {
          animation: fadeIn 0.3s ease-out, zoomIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default UpdateBookModal;
