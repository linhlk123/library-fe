  import React from 'react';
  import { useAuthStore } from '../../stores';
  import { SectionContainer } from '../../components/shared/SectionContainer';
  import { Mail, Calendar, MapPin, User as UserIcon } from 'lucide-react';

  export default function UserProfileView() {
    const { user } = useAuthStore();

    if (!user) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Không thể tải thông tin người dùng</p>
        </div>
      );
    }

    const formattedBirthDate = user.ngaySinh
      ? new Date(user.ngaySinh).toLocaleDateString('vi-VN')
      : 'Chưa cập nhật';

    return (
      <div className="space-y-6">
        {/* Profile header */}
        <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
              {user.hoTen?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.hoTen}</h1>
              <p className="text-blue-100">@{user.tenDangNhap}</p>
            </div>
          </div>
        </div>

        {/* Profile information */}
        <SectionContainer
          title="Thông tin cá nhân"
          description="Chi tiết tài khoản của bạn"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full name */}
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <UserIcon className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Họ tên</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {user.hoTen}
                </p>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-50 p-3">
                <UserIcon className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tên đăng nhập</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {user.tenDangNhap}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <Mail className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {user.email || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {/* Date of birth */}
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-50 p-3">
                <Calendar className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ngày sinh</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formattedBirthDate}
                </p>
              </div>
            </div>

            {/* Address (if available) */}
            {user.diaChi && (
              <div className="flex items-start gap-4 md:col-span-2">
                <div className="rounded-lg bg-red-50 p-3">
                  <MapPin className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Địa chỉ</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {user.diaChi}
                  </p>
                </div>
              </div>
            )}

            {/* Role */}
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-indigo-50 p-3">
                <UserIcon className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Vai trò</p>
                <div className="mt-1">
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {user.tenVaiTro === 'USER' ? 'Độc giả' : user.tenVaiTro}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Account notes */}
        <SectionContainer
          title="Ghi chú"
          description="Thông tin tài khoản của bạn"
        >
          <div className="space-y-4 text-sm text-gray-600">
            <p>✓ Tài khoản của bạn đang hoạt động bình thường</p>
            <p>✓ Bạn có thể mượn sách từ thư viện</p>
            <p>
              ✓ Vui lòng liên hệ nhân viên thư viện nếu bạn cần thay đổi thông
              tin cá nhân
            </p>
          </div>
        </SectionContainer>
      </div>
    );
  }
