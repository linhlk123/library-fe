import { useEffect, useState } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import booksApi from '../../services/booksApi';
import type { TacGia } from '../../types';

const AuthorsView = () => {
  const [authors, setAuthors] = useState<TacGia[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<TacGia | null>(null);
  const [formValue, setFormValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await booksApi.tacgia.getAll();
      setAuthors(res.data.result ?? []);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách tác giả.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Filter authors by search query
  const filteredAuthors = authors.filter((author) =>
    author.tenTacGia.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (author?: TacGia) => {
    if (author) {
      setSelectedAuthor(author);
      setFormValue(author.tenTacGia);
    } else {
      setSelectedAuthor(null);
      setFormValue('');
    }
    setError(null);
    setMessage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAuthor(null);
    setFormValue('');
  };

  const handleSaveAuthor = async () => {
    const tenTacGia = formValue.trim();
    if (!tenTacGia) {
      setError('Tên tác giả không được để trống');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      if (selectedAuthor) {
        // Update existing author
        const res = await booksApi.tacgia.update(selectedAuthor.maTacGia, { tenTacGia });
        const updatedAuthor = res.data?.result;
        setAuthors((prev) =>
          prev.map((item) =>
            item.maTacGia === selectedAuthor.maTacGia ? (updatedAuthor as TacGia) : item
          )
        );
        setMessage('Cập nhật tác giả thành công!');
      } else {
        // Create new author
        const res = await booksApi.tacgia.create({ tenTacGia });
        const createdAuthor = res.data?.result;
        setAuthors((prev) => [...prev, (createdAuthor as TacGia)]);
        setMessage('Thêm tác giả thành công!');
      }

      handleCloseModal();
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Lưu tác giả thất bại.';
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

  const handleDeleteAuthor = async (maTacGia: number) => {
    if (!confirm('Bạn chắc chắn muốn xóa tác giả này?')) {
      return;
    }

    try {
      setError(null);
      setMessage(null);

      await booksApi.tacgia.delete(maTacGia);
      setAuthors((prev) => prev.filter((item) => item.maTacGia !== maTacGia));
      setMessage('Xóa tác giả thành công!');
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Xóa tác giả thất bại.';
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
      title="Danh sách tác giả"
      description="Quản lý danh mục tác giả trong thư viện"
    >
      <div className="space-y-6">
        {/* Search and Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo tên tác giả..."
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
            Thêm tác giả
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

        {/* Modal Add/Edit Author */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedAuthor ? 'Cập nhật tác giả' : 'Thêm tác giả'}
              </h2>

              <div className="mb-6">
                <label className="text-sm text-gray-600">
                  Tên tác giả <span className="text-red-400">*</span>
                  <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="Nhập tên tác giả..."
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveAuthor();
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
                  onClick={handleSaveAuthor}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 font-medium"
                >
                  {submitting ? 'Đang lưu...' : selectedAuthor ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Authors List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : filteredAuthors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {authors.length === 0 ? 'Không có tác giả nào' : 'Không tìm thấy kết quả'}
              </p>
            </div>
          ) : (
            filteredAuthors.map((author) => {
              return (
                <div key={author.maTacGia} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Summary Row */}
                  <button
                    onClick={() => setSelectedAuthor(selectedAuthor?.maTacGia === author.maTacGia ? null : author)}
                    className="w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{author.tenTacGia}</p>
                      <p className="text-xs text-gray-500">Mã: {author.maTacGia}</p>
                    </div>
                    <div className="ml-4">
                      {selectedAuthor?.maTacGia === author.maTacGia && !showModal ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {selectedAuthor?.maTacGia === author.maTacGia && !showModal && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Tên tác giả</p>
                        <p className="text-sm font-medium text-gray-900">{author.tenTacGia}</p>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Mã tác giả</p>
                        <p className="text-sm font-medium text-gray-900">{author.maTacGia}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(author)}
                          className="flex items-center gap-2 flex-1 px-4 py-2 rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Cập nhật
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAuthor(author.maTacGia)}
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

export default AuthorsView;