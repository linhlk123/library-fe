import React from 'react';
import type { Loan } from '../../types';

interface LoanRowProps {
  loan: Loan;
}

const LoanRow: React.FC<LoanRowProps> = ({ loan }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded object-cover shadow-sm"
              src={loan.book.coverUrl}
              alt=""
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {loan.book.title}
            </div>
            <div className="text-sm text-gray-500">
              {loan.book.authors[0].name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {loan.borrowDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
        {loan.dueDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            loan.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {loan.status}
        </span>
      </td>
    </tr>
  );
};

export default LoanRow;
