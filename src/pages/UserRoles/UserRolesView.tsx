import { useEffect, useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import userApi from '../../services/userApi';
import rolesApi from '../../services/rolesApi';
import type { NguoiDung } from '../../types';
import type { VaiTro } from '../../services/rolesApi';

interface UserRow extends NguoiDung {
  id?: string;
}

const UserRolesView = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<VaiTro[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch users and roles on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, rolesRes] = await Promise.all([
          userApi.getAll(),
          rolesApi.roles.getAll(),
        ]);

        setRows((usersRes.data.result ?? []) as UserRow[]);
        setRoles(rolesRes.data.result ?? []);
      } catch (err) {
        console.error(err);
        setError('Không tải được dữ liệu tài khoản hoặc vai trò.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateRole = async (username: string, newRole: string) => {
    try {
      setError(null);
      setMessage(null);
      setSubmitting(true);

      // Update user role via API
      await userApi.update(username, { vaiTro: newRole });

      // Update local state
      setRows((prev) =>
        prev.map((item) =>
          item.tenDangNhap === username ? { ...item, vaiTro: newRole as any } : item
        )
      );

      setMessage('Cập nhật vai trò thành công!');
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = 'Cập nhật vai trò thất bại.';
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

  return (
    <SectionContainer
      title="Phân quyền người dùng"
      description="Gán vai trò và kiểm soát quyền truy cập hệ thống."
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có tài khoản nào
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-700 border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold">Tài khoản</th>
                  <th className="py-3 px-4 font-semibold">Họ tên</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Vai trò</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.tenDangNhap}
                    className="border-b border-gray-100 hover:bg-gray-50 transition last:border-0"
                  >
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      {row.tenDangNhap}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{row.hoTen}</td>
                    <td className="py-3 px-4 text-gray-700">{row.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={row.vaiTro}
                        onChange={(e) =>
                          updateRole(row.tenDangNhap, e.target.value)
                        }
                        disabled={submitting}
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {roles.map((role) => (
                          <option key={role.tenVaiTro} value={role.tenVaiTro}>
                            {role.tenVaiTro}
                          </option>
                        ))}
                        {/* Fallback options if roles not loaded */}
                        {roles.length === 0 && (
                          <>
                            <option value="USER">USER</option>
                            <option value="STAFF">STAFF</option>
                            <option value="ADMIN">ADMIN</option>
                          </>
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SectionContainer>
  );
};

export default UserRolesView;
