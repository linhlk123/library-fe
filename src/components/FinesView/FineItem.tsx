import React from 'react';
import { CreditCard } from 'lucide-react';
import type { Fine } from '../../types';

interface FineItemProps {
  fine: Fine;
}

const FineItem: React.FC<FineItemProps> = ({ fine }) => {
  return (
    <li className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="bg-red-100 p-2 rounded-full text-red-600 flex-shrink-0 mt-1">
          <CreditCard size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
            {fine.reason.replace('_', ' ')}
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {fine.status}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Issued: {fine.issuedDate}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
        <span className="text-lg font-bold text-gray-900">
          ${fine.amount.toFixed(2)}
        </span>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          Pay Now
        </button>
      </div>
    </li>
  );
};

export default FineItem;
