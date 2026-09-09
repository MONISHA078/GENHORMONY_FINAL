import React from 'react';
import HistoryLog from '../components/dashboard/HistoryLog';

export const HistoryPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">History</h2>
        </div>
      </div>

      <div>
        <HistoryLog />
      </div>
    </div>
  );
};

export default HistoryPage;
