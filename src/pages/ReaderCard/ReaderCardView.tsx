import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const ReaderCardView = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardType: 'Sinh vien',
    expiry: '',
  });

  return (
    <SectionContainer
      title="Lap the doc gia"
      description="Tiep nhan thong tin va tao the doc gia moi."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-gray-600">
          Ho va ten
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          So dien thoai
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Loai doc gia
          <select
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.cardType}
            onChange={(e) => setForm((p) => ({ ...p, cardType: e.target.value }))}
          >
            <option>Sinh vien</option>
            <option>Giang vien</option>
            <option>Nghien cuu vien</option>
          </select>
        </label>
        <label className="text-sm text-gray-600 md:col-span-2">
          Ngay het han
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.expiry}
            onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))}
          />
        </label>
        <button className="md:col-span-2 justify-self-start rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Tao the doc gia
        </button>
      </div>
    </SectionContainer>
  );
};

export default ReaderCardView;
