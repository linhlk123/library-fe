import React from 'react';
import { CreditCard } from 'lucide-react';
import { MOCK_FINES } from '../../data/mockData';
import FineItem from './FineItem';

const FinesView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white px-6 py-5 border-b border-gray-100 rounded-t-xl shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Outstanding Fines
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Please pay your fines to restore borrowing privileges.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase font-semibold">
            Total Due
          </p>
          <p className="text-2xl font-bold text-red-600">
            $
            {MOCK_FINES.reduce((acc, fine) => acc + fine.amount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-b-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {MOCK_FINES.map((fine) => (
            <FineItem key={fine.id} fine={fine} />
          ))}
          {MOCK_FINES.length === 0 && (
            <li className="p-12 text-center text-gray-500">
              <span className="bg-green-100 text-green-600 p-3 rounded-full inline-block mb-3">
                <CreditCard size={24} />
              </span>
              <p>You have no outstanding fines. Great job!</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FinesView;
