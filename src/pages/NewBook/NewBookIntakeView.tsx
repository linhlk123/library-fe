import { useEffect, useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';
import booksApi from '../../services/booksApi'; 
import type { TheLoai, TacGia } from '../../types';
import { Upload, X } from 'lucide-react';

interface BookForm {
  tenDauSach: string;
  maTheLoai: string;
  maTacGia: string;        // chọn tác giả từ dropdown
  nhaXuatBan: string;
  namXuatBan: string;
  giaTien: number;
  soLuong: number;
}

const INITIAL_FORM: BookForm = {
  tenDauSach: '',
  maTheLoai: '',
  maTacGia: '',
  nhaXuatBan: '',
  namXuatBan: '',
  giaTien: 0,
  soLuong: 1,
};

const NewBookIntakeView = () => {
  const [form, setForm] = useState<BookForm>(INITIAL_FORM);
  const [theLoaiList, setTheLoaiList] = useState<TheLoai[]>([]);
  const [tacGiaList, setTacGiaList] = useState<TacGia[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      booksApi.theloai.getAll(),
      booksApi.tacgia.getAll(),
    ]).then(([tlRes, tgRes]) => {
      setTheLoaiList(tlRes.data.result ?? []);
      setTacGiaList(tgRes.data.result ?? []);
    }).catch(console.error);
  }, []);

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh (JPG, PNG, GIF, WebP).');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước hình ảnh không được vượt quá 5MB.');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  // Upload image to server
  const handleImageUpload = async () => {
    if (!imageFile) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('/api/dausach/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Upload hình ảnh thất bại.');
      }

      const apiResponse = await response.json();
      setUploadedImageId(apiResponse.result);
      setMessage('Tải ảnh lên thành công!');
    } catch (err) {
      console.error(err);
      setError('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageId(null);
  };

  const handleChange = (field: keyof BookForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { tenDauSach, maTheLoai, maTacGia, nhaXuatBan, soLuong, giaTien } = form;

    if (!tenDauSach.trim() || !maTheLoai || !maTacGia || !nhaXuatBan.trim() || soLuong < 1 || giaTien < 0) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    if (!uploadedImageId) {
      setError('Vui lòng tải lên ảnh bìa sách.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      // Bước 1: Tạo DauSach
      const dauSachRes = await booksApi.dausach.create({
        tenDauSach: tenDauSach.trim(),
        maTheLoai: Number(maTheLoai), 
        anhBiaUrl: uploadedImageId    
      });
      const maDauSach: number = dauSachRes.data.result.maDauSach;

      // Bước 2: Gắn tác giả vào DauSach qua CTTacGia
      await booksApi.cttacgia.create({ 
        maDauSach: Number(maDauSach), 
        maTacGia: Number(maTacGia),
      });
      // Bước 3: Tạo Sach (bản in)
      const sachRes = await booksApi.sach.create({
        maDauSach: Number(maDauSach),
        maTheLoai: Number(maTheLoai),
        nhaXuatBan,
        namXuatBan: form.namXuatBan ? Number(form.namXuatBan) : new Date().getFullYear(),
        giaTien,
        soLuong,
      });
      const maSach: number = sachRes.data.result.maSach;

      // Bước 4: Tạo từng CuonSach vật lý
      await Promise.all(
        Array.from({ length: soLuong }, () =>
          booksApi.cuonsach.create({ maSach: Number(maSach), tinhTrang: 'AVAILABLE' })
        )
      );

      setForm(INITIAL_FORM);
      setImageFile(null);
      setImagePreview(null);
      setUploadedImageId(null);
      setMessage(`Tiếp nhận "${tenDauSach}" thành công — ${soLuong} cuốn đã được tạo.`);
    } catch (err) {
      console.error(err);
      setError('Tiếp nhận sách thất bại. Kiểm tra lại thông tin hoặc kết nối.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionContainer
      title="Tiếp nhận sách mới"
      description="Nhập thông tin sách mới và số lượng bản sao."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Tên đầu sách — full width */}
          <label className="text-sm text-gray-600 md:col-span-2">
            Tên đầu sách <span className="text-red-400">*</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="VD: Lập trình Python cơ bản"
              value={form.tenDauSach}
              onChange={(e) => handleChange('tenDauSach', e.target.value)}
            />
          </label>

          {/* Image Upload — full width */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 block mb-2">
              Tải ảnh bìa sách
            </label>
            
            {!imagePreview ? (
              <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Nhấp để chọn ảnh hoặc kéo thả tại đây
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (JPG, PNG, GIF, WebP - tối đa 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative w-32 h-48 mx-auto border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Chọn ảnh khác
                  </button>
                  
                  {!uploadedImageId && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      className="flex-1 text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    >
                      {uploadingImage ? 'Đang tải...' : 'Tải ảnh lên'}
                    </button>
                  )}
                  
                  {uploadedImageId && (
                    <div className="flex-1 flex items-center justify-center bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      ✓ Đã tải lên
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Thể loại — dropdown */}
          <label className="text-sm text-gray-600">
            Thể loại <span className="text-red-400">*</span>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
              value={form.maTheLoai}
              onChange={(e) => handleChange('maTheLoai', e.target.value)}
            >
              <option value="">-- Chọn thể loại --</option>
              {theLoaiList.map((tl) => (
                <option key={tl.maTheLoai} value={tl.maTheLoai}>
                  {tl.tenTheLoai}
                </option>
              ))}
            </select>
          </label>

          {/* Tác giả — dropdown */}
          <label className="text-sm text-gray-600">
            Tác giả <span className="text-red-400">*</span>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
              value={form.maTacGia}
              onChange={(e) => handleChange('maTacGia', e.target.value)}
            >
              <option value="">-- Chọn tác giả --</option>
              {tacGiaList.map((tg) => (
                <option key={tg.maTacGia} value={tg.maTacGia}>
                  {tg.tenTacGia}
                </option>
              ))}
            </select>
          </label>

          {/* Nhà xuất bản */}
          <label className="text-sm text-gray-600">
            Nhà xuất bản <span className="text-red-400">*</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="VD: NXB Giáo Dục"
              value={form.nhaXuatBan}
              onChange={(e) => handleChange('nhaXuatBan', e.target.value)}
            />
          </label>

          {/* Năm xuất bản */}
          <label className="text-sm text-gray-600">
            Năm xuất bản
            <input
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder={String(new Date().getFullYear())}
              value={form.namXuatBan}
              onChange={(e) => handleChange('namXuatBan', e.target.value)}
            />
          </label>

          {/* Giá tiền */}
          <label className="text-sm text-gray-600">
            Giá tiền (VNĐ)
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={form.giaTien}
              onChange={(e) => handleChange('giaTien', Number(e.target.value))}
            />
          </label>

          {/* Số lượng */}
          <label className="text-sm text-gray-600">
            Số lượng cuốn nhập <span className="text-red-400">*</span>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={form.soLuong}
              onChange={(e) => handleChange('soLuong', Number(e.target.value))}
            />
          </label>

        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Đang xử lý...' : 'Lưu thông tin sách mới'}
        </button>
      </div>
    </SectionContainer>
  );
};

export default NewBookIntakeView;