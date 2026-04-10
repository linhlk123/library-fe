import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const UserAccountsView = () => {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'STUDENT',
  });

  return (
    <SectionContainer
      title="Tao tai khoan (user)"
      description="Tao tai khoan he thong cho thu thu, quan tri hoac doc gia."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-gray-600">
          Username
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Ho va ten
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Mat khau
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Vai tro
          <select
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="LIBRARIAN">LIBRARIAN</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
        <button className="md:col-span-2 justify-self-start rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Tao tai khoan
        </button>
      </div>
    </SectionContainer>
  );
};

export default UserAccountsView;
