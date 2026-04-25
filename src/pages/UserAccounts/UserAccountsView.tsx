import { useEffect, useState } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import SectionContainer from '../../components/shared/SectionContainer';
import userApi from '../../services/userApi';
import type { NguoiDung } from '../../types';

interface UserAccount extends NguoiDung {
  id?: string;
}

interface UserForm {
  tenDangNhap: string;
  hoTen: string;
  matKhau: string;
  vaiTro: string;
}

const INITIAL_FORM: UserForm = {
  tenDangNhap: '',
  hoTen: '',
  matKhau: '',
  vaiTro: 'USER',
};

const UserAccountsView = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [formValue, setFormValue] = useState<UserForm>(INITIAL_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await userApi.getAll();
      setUsers(res.data.result ?? []);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search query
  const filteredUsers = users.filter(
    (user) =>
      user.tenDangNhap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.hoTen.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (user?: UserAccount) => {
    if (user) {
      setSelectedUser(user);
      setFormValue({
        tenDangNhap: user.tenDangNhap,
        hoTen: user.hoTen,
        matKhau: '',
        vaiTro: user.vaiTro,
      });
    } else {
      setSelectedUser(null);
      setFormValue(INITIAL_FORM);
    }
    setError(null);
    setMessage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormValue(INITIAL_FORM);
  };

  const handleSaveUser = async () => {
    const { tenDangNhap, hoTen, matKhau, vaiTro } = formValue;

    if (!tenDangNhap.trim() || !hoTen.trim() || !vaiTro.trim()) {
      setError('Tên đăng nhập, họ tên và vai trò không được để trống');
      return;
    }

    if (!selectedUser && !matKhau.trim()) {
      setError('Mật khẩu không được để trống khi tạo tài khoản mới');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      if (selectedUser) {
        // Update existing user
        const updateData: Record<string, unknown> = {
          tenDangNhap,
          hoTen,
          vaiTro,
        };
        if (matKhau.trim()) {
          updateData.matKhau = matKhau;
        }

        const res = await userApi.update(selectedUser.tenDangNhap, updateData);
        const updatedUser = res.data?.result;
        setUsers((prev) =>
          prev.map((item) =>
            item.tenDangNhap === selectedUser.tenDangNhap ? (updatedUser as UserAccount) : item
          )
        );
        setMessage('Cập nhật tài khoản thành công!');
      } else {
        // Create new user
        const createData = {
          tenDangNhap,
          hoTen,
          matKhau,
          vaiTro,
        };

        const res = await userApi.create(createData);
        const createdUser = res.data?.result;
        setUsers((prev) => [...prev, (createdUser as UserAccount)]);
        setMessage('Thêm tài khoản thành công!');
      }

      handleCloseModal();
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Lưu tài khoản thất bại.';
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

  const handleDeleteUser = async (tenDangNhap: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa tài khoản này?')) {
      return;
    }

    try {
      setError(null);
      setMessage(null);

      await userApi.delete(tenDangNhap);
      setUsers((prev) => prev.filter((item) => item.tenDangNhap !== tenDangNhap));
      setMessage('Xóa tài khoản thành công!');
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Xóa tài khoản thất bại.';
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
      title="Danh sách tài khoản"
      description="Quản lý tài khoản hệ thống cho thư thư, quản trị viên hoặc độc giả."
    >
      <div className="space-y-6">
        {/* Search and Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo tên đăng nhập hoặc họ tên..."
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
            Thêm tài khoản
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

        {/* Modal Add/Edit User Account */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản'}
              </h2>

              <div className="space-y-4 mb-6">
                <label className="text-sm text-gray-600">
                  Tên đăng nhập <span className="text-red-400">*</span>
                  <input
                    type="text"
                    value={formValue.tenDangNhap}
                    onChange={(e) => setFormValue((p) => ({ ...p, tenDangNhap: e.target.value }))}
                    placeholder="Ví dụ: user123"
                    disabled={!!selectedUser}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </label>

                <label className="text-sm text-gray-600">
                  Họ và tên <span className="text-red-400">*</span>
                  <input
                    type="text"
                    value={formValue.hoTen}
                    onChange={(e) => setFormValue((p) => ({ ...p, hoTen: e.target.value }))}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="text-sm text-gray-600">
                  Mật khẩu {!selectedUser && <span className="text-red-400">*</span>}
                  <input
                    type="password"
                    value={formValue.matKhau}
                    onChange={(e) => setFormValue((p) => ({ ...p, matKhau: e.target.value }))}
                    placeholder={selectedUser ? 'Để trống nếu không đổi' : 'Mật khẩu mạnh...'}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="text-sm text-gray-600">
                  Vai trò <span className="text-red-400">*</span>
                  <select
                    value={formValue.vaiTro}
                    onChange={(e) => setFormValue((p) => ({ ...p, vaiTro: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USER">USER</option>
                    <option value="STAFF">STAFF</option>
                  </select>
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
                  onClick={handleSaveUser}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 font-medium"
                >
                  {submitting ? 'Đang lưu...' : selectedUser ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {users.length === 0 ? 'Không có tài khoản nào' : 'Không tìm thấy kết quả'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              return (
                <div key={user.tenDangNhap} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Summary Row */}
                  <button
                    onClick={() => setSelectedUser(selectedUser?.tenDangNhap === user.tenDangNhap ? null : user)}
                    className="w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.hoTen}</p>
                      <p className="text-xs text-gray-500">Tên đăng nhập: {user.tenDangNhap}</p>
                    </div>
                    <div className="ml-4">
                      {selectedUser?.tenDangNhap === user.tenDangNhap && !showModal ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {selectedUser?.tenDangNhap === user.tenDangNhap && !showModal && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Họ và tên</p>
                        <p className="text-sm font-medium text-gray-900">{user.hoTen}</p>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Tên đăng nhập</p>
                        <p className="text-sm font-medium text-gray-900">{user.tenDangNhap}</p>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Vai trò</p>
                        <p className="text-sm font-medium text-gray-900">{user.vaiTro}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(user)}
                          className="flex items-center gap-2 flex-1 px-4 py-2 rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Cập nhật
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.tenDangNhap)}
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

export default UserAccountsView;
