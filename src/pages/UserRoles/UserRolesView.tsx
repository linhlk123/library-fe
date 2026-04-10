import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const UserRolesView = () => {
  const [rows, setRows] = useState([
    { username: 'admin', role: 'ADMIN' },
    { username: 'thu_thu_01', role: 'LIBRARIAN' },
  ]);

  const updateRole = (index: number, role: string) => {
    setRows((prev) => prev.map((item, i) => (i === index ? { ...item, role } : item)));
  };

  return (
    <SectionContainer
      title="Phan quyen nguoi dung"
      description="Gan vai tro va kiem soat quyen truy cap he thong."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-4">Tai khoan</th>
              <th className="py-2 pr-4">Vai tro</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.username} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 text-gray-800">{row.username}</td>
                <td className="py-3 pr-4">
                  <select
                    value={row.role}
                    onChange={(e) => updateRole(idx, e.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="LIBRARIAN">LIBRARIAN</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionContainer>
  );
};

export default UserRolesView;
