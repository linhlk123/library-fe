import { useEffect, useState } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import booksApi from '../../services/booksApi';
import type { TheLoai } from '../../types';

const CategoriesView = () => {
  const [categories, setCategories] = useState<TheLoai[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TheLoai | null>(null);
  const [formValue, setFormValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await booksApi.theloai.getAll();
      setCategories(res.data.result ?? []);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách thể loại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories by search query
  const filteredCategories = categories.filter((category) =>
    category.tenTheLoai.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (category?: TheLoai) => {
    if (category) {
      setSelectedCategory(category);
      setFormValue(category.tenTheLoai);
    } else {
      setSelectedCategory(null);
      setFormValue('');
    }
    setError(null);
    setMessage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormValue('');
  };

  const handleSaveCategory = async () => {
    const tenTheLoai = formValue.trim();
    if (!tenTheLoai) {
      setError('Tên thể loại không được để trống');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      if (selectedCategory) {
        // Update existing category
        const res = await booksApi.theloai.update(selectedCategory.maTheLoai, { tenTheLoai });
        const updatedCategory = res.data?.result;
        setCategories((prev) =>
          prev.map((item) =>
            item.maTheLoai === selectedCategory.maTheLoai ? (updatedCategory as TheLoai) : item
          )
        );
        setMessage('Cập nhật thể loại thành công!');
      } else {
        // Create new category
        const res = await booksApi.theloai.create({ tenTheLoai });
        const createdCategory = res.data?.result;
        setCategories((prev) => [...prev, (createdCategory as TheLoai)]);
        setMessage('Thêm thể loại thành công!');
      }

      handleCloseModal();
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Lưu thể loại thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as Record<string, unknown>).response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (data && typeof data === 'object' && 'message' in data) {
            errorMsg = String((data as Record<string, unknown>).message);
          }
        }
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (maTheLoai: number) => {
    if (!confirm('Bạn chắc chắn muốn xóa thể loại này?')) {
      return;
    }

    try {
      setError(null);
      setMessage(null);

      await booksApi.theloai.delete(maTheLoai);
      setCategories((prev) => prev.filter((item) => item.maTheLoai !== maTheLoai));
      setMessage('Xóa thể loại thành công!');
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Xóa thể loại thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as Record<string, unknown>).response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (data && typeof data === 'object' && 'message' in data) {
            errorMsg = String((data as Record<string, unknown>).message);
          }
        }
      }
      setError(errorMsg);
    }
  };

  return (
    <SectionContainer
      title="Danh sách thể loại"
      description="Quản lý danh mục thể loại sách"
    >
      <div className="space-y-6">
        {/* Search and Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo tên thể loại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Thêm thể loại
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            ✓ {message}
          </div>
        )}

        {/* Modal Add/Edit Category */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedCategory ? 'Cập nhật thể loại' : 'Thêm thể loại'}
              </h2>

              <div className="mb-6">
                <label className="text-sm text-gray-600">
                  Tên thể loại <span className="text-red-400">*</span>
                  <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="Nhập tên thể loại..."
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveCategory();
                    }}
                  />
                </label>
              </div>

              {/* Modal Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 mb-6">
                  ⚠️ {error}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 font-medium"
                >
                  {submitting ? 'Đang lưu...' : selectedCategory ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {categories.length === 0 ? 'Không có thể loại nào' : 'Không tìm thấy kết quả'}
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => {
              return (
                <div key={category.maTheLoai} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Summary Row */}
                  <button
                    onClick={() => setSelectedCategory(selectedCategory?.maTheLoai === category.maTheLoai ? null : category)}
                    className="w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{category.tenTheLoai}</p>
                      <p className="text-xs text-gray-500">Mã: {category.maTheLoai}</p>
                    </div>
                    <div className="ml-4">
                      {selectedCategory?.maTheLoai === category.maTheLoai && !showModal ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {selectedCategory?.maTheLoai === category.maTheLoai && !showModal && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Tên thể loại</p>
                        <p className="text-sm font-medium text-gray-900">{category.tenTheLoai}</p>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Mã thể loại</p>
                        <p className="text-sm font-medium text-gray-900">{category.maTheLoai}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(category)}
                          className="flex items-center gap-2 flex-1 px-4 py-2 rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Cập nhật
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.maTheLoai)}
                          className="flex items-center gap-2 flex-1 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </SectionContainer>
  );
};

export default CategoriesView;