import { useEffect, useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import type { LoaiDocGia, NguoiDung, DocGia } from '../../types';
import { readersApi } from '../../services/readersApi';
import { userApi } from '../../services/userApi';
import { Search, Plus, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';

interface ReaderCardForm {
  maDocGia: string;
  maLoaiDocGia: string;
  ngayLapThe: string;
  ngayHetHan: string;
}

const INITIAL_FORM: ReaderCardForm = {
  maDocGia: '',
  maLoaiDocGia: '',
  ngayLapThe: '',
  ngayHetHan: '',
};

const ReaderCardView = () => {
  const [form, setForm] = useState<ReaderCardForm>(INITIAL_FORM);
  const [selectedUser, setSelectedUser] = useState<NguoiDung | null>(null);
  
  const [readerTypes, setReaderTypes] = useState<LoaiDocGia[]>([]);
  const [users, setUsers] = useState<NguoiDung[]>([]);
  const [readerCardsList, setReaderCardsList] = useState<DocGia[]>([]);
  
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DocGia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch reader types, users, and reader cards on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingTypes(true);
        setLoadingUsers(true);
        
        const [typesRes, usersRes, cardsRes] = await Promise.all([
          readersApi.loaidocgia.getAll(),
          userApi.getAll(),
          readersApi.docgia.getAll(),
        ]);
        
        setReaderTypes(typesRes.data.result ?? []);
        setUsers(usersRes.data.result ?? []);
        setReaderCardsList(cardsRes.data.result ?? []);
      } catch (err) {
        console.error(err);
        setError('Không tải được dữ liệu.');
      } finally {
        setLoadingTypes(false);
        setLoadingUsers(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate expiration date (6 months from today)
  const calculateExpirationDate = (): string => {
    const today = new Date();
    const expiration = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    return expiration.toISOString().slice(0, 10);
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().slice(0, 10);
  };

  // Check if reader card is expired
  const isCardExpired = (ngayHetHan: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(ngayHetHan);
    expirationDate.setHours(0, 0, 0, 0);
    return expirationDate < today;
  };

  // Filter cards by search query
  const filteredCards = readerCardsList.filter(card => {
    const query = searchQuery.toLowerCase();
    return (
      card.maDocGia.toLowerCase().includes(query) ||
      card.hoTen.toLowerCase().includes(query) ||
      card.email.toLowerCase().includes(query)
    );
  });

  const handleOpenModal = () => {
    setForm(INITIAL_FORM);
    setSelectedUser(null);
    setError(null);
    setMessage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(INITIAL_FORM);
    setSelectedUser(null);
  };

  const handleDeleteCard = async (maDocGia: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa thẻ độc giả này?')) {
      return;
    }
    try {
      await readersApi.docgia.delete(maDocGia);
      setMessage('Xóa thẻ độc giả thành công!');
      setSelectedCard(null);
      const updatedCards = await readersApi.docgia.getAll();
      setReaderCardsList(updatedCards.data.result ?? []);
    } catch (err) {
      console.error(err);
      setError('Xóa thẻ độc giả thất bại.');
    }
  };

  const handleUserChange = (maDocGia: string) => {
    setForm((prev) => ({ 
      ...prev, 
      maDocGia,
      ngayLapThe: getTodayDate(),
      ngayHetHan: calculateExpirationDate(),
    }));
    
    // Find selected user and set user info
    const user = users?.find((u: NguoiDung) => u.tenDangNhap === maDocGia);
    if (user) {
      setSelectedUser(user);
      setError(null);
    } else {
      setSelectedUser(null);
    }
  };

  const handleChange = (key: keyof ReaderCardForm, value: string | number) => {
    const newForm = { ...form, [key]: value };
    // Auto-calculate expiration date when ngayLapThe changes
    if (key === 'ngayLapThe' && newForm.ngayLapThe) {
      const lapDate = new Date(newForm.ngayLapThe);
      const hetDate = new Date(lapDate.getFullYear(), lapDate.getMonth() + 6, lapDate.getDate());
      newForm.ngayHetHan = hetDate.toISOString().slice(0, 10);
    }
    setForm(newForm);
  };

  const handleSubmit = async () => {
    if (!form.maDocGia || !form.maLoaiDocGia || !form.ngayLapThe || !form.ngayHetHan) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    if (!selectedUser) {
      setError('Vui lòng chọn người dùng hợp lệ.');
      return;
    }

    // Validate dates
    if (new Date(form.ngayLapThe) >= new Date(form.ngayHetHan)) {
      setError('Ngày hết hạn phải lớn hơn ngày lập thẻ.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const payload = {
        maDocGia: form.maDocGia,
        maLoaiDocGia: Number(form.maLoaiDocGia),
        ngayLapThe: form.ngayLapThe,
        ngayHetHan: form.ngayHetHan,
      };

      await readersApi.docgia.create(payload);

      setMessage(`Lập thẻ độc giả cho "${selectedUser.hoTen}" thành công!`);
      setForm(INITIAL_FORM);
      setSelectedUser(null);
      
      // Refresh reader cards list
      const updatedCards = await readersApi.docgia.getAll();
      setReaderCardsList(updatedCards.data.result ?? []);
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = 'Lập thẻ độc giả thất bại.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiError = err as Record<string, unknown>;
        const data = apiError.response as Record<string, unknown>;
        errorMessage = (data?.message as string) || 'Lập thẻ độc giả thất bại.';
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionContainer
      title="Danh sách độc giả"
      description="Quản lý thẻ độc giả"
    >
      <div className="space-y-6">
        {/* Search and Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo mã độc giả, tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Thêm độc giả
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

        {/* Modal Add Reader Card */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thêm độc giả</h2>

              {/* Step 1: Select User */}
              <div className="border-b pb-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bước 1: Chọn người dùng</h3>
                <label className="text-sm text-gray-600">
                  Tên đăng nhập <span className="text-red-400">*</span>
                  <select
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                    value={form.maDocGia}
                    onChange={(e) => handleUserChange(e.target.value)}
                    disabled={loadingUsers}
                  >
                    <option value="">Chọn người dùng</option>
                    {users?.map((user: NguoiDung) => (
                      <option key={user.tenDangNhap} value={user.tenDangNhap}>
                        {user.tenDangNhap} - {user.hoTen}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Step 2: Display User Info */}
              {selectedUser && (
                <div className="border-b pb-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bước 2: Thông tin người dùng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Họ tên</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.hoTen}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ngày sinh</p>
                      <p className="text-sm text-gray-900">{selectedUser.ngaySinh}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Reader Card Details */}
              {selectedUser && (
                <div className="border-b pb-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bước 3: Thông tin thẻ độc giả</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-sm text-gray-600">
                      Loại độc giả <span className="text-red-400">*</span>
                      <select
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                        value={form.maLoaiDocGia}
                        onChange={(e) => handleChange('maLoaiDocGia', e.target.value)}
                        disabled={loadingTypes}
                      >
                        <option value="">Chọn loại độc giả</option>
                        {readerTypes.map((type) => (
                          <option key={type.maLoaiDocGia} value={type.maLoaiDocGia}>
                            {type.tenLoaiDocGia}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div>
                      <p className="text-xs text-gray-500">Vai trò</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                        selectedUser.vaiTro === 'STAFF'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedUser.vaiTro}
                      </span>
                    </div>

                    <label className="text-sm text-gray-600">
                      Ngày lập thẻ <span className="text-red-400">*</span>
                      <input
                        type="date"
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                        value={form.ngayLapThe}
                        onChange={(e) => handleChange('ngayLapThe', e.target.value)}
                      />
                    </label>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngày hết hạn (6 tháng)</p>
                      <p className="text-sm font-semibold text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        {form.ngayHetHan || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 mb-6">
                  ⚠️ {error}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedUser}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 font-medium"
                >
                  {submitting ? 'Đang lập...' : 'Lập thẻ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards List */}
        <div className="space-y-3">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có độc giả nào</p>
            </div>
          ) : (
            filteredCards.map((card) => {
              const expired = isCardExpired(card.ngayHetHan);
              const isExpanded = selectedCard?.maDocGia === card.maDocGia;

              return (
                <div key={card.maDocGia} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Summary Row */}
                  <button
                    onClick={() => setSelectedCard(isExpanded ? null : card)}
                    className="w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between transition"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-xs text-gray-500">Mã độc giả</p>
                        <p className="font-semibold text-gray-900">{card.maDocGia}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Họ tên</p>
                        <p className="text-sm text-gray-900">{card.hoTen}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{card.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {expired ? (
                          <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                            Đã hết hạn
                          </span>
                        ) : (
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            Còn hạn
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Personal Info */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Thông tin cá nhân</h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Họ tên</p>
                              <p className="text-sm text-gray-900">{card.hoTen}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm text-gray-900">{card.email}</p>
                            </div>
                            {card.diaChi && (
                              <div>
                                <p className="text-xs text-gray-500">Địa chỉ</p>
                                <p className="text-sm text-gray-900">{card.diaChi}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Info */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Thông tin thẻ</h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Vai trò</p>
                              <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                                card.tenVaiTro === 'STAFF'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {card.tenVaiTro}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Loại độc giả</p>
                              <p className="text-sm font-medium text-gray-900">{card.tenLoaiDocGia || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Tổng nợ</p>
                              <p className={`text-sm font-medium ${card.tongNo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {card.tongNo.toLocaleString()} VNĐ
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="mb-6 p-3 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Hạn thẻ</p>
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{card.ngayLapThe}</span>
                          {' '}→{' '}
                          <span className="font-semibold">{card.ngayHetHan}</span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          className="flex items-center gap-2 flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-100 font-medium disabled:opacity-50"
                          disabled
                        >
                          <Edit className="w-4 h-4" />
                          Cập nhật
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.maDocGia)}
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

export default ReaderCardView;
