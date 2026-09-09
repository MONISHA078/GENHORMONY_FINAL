import React from 'react';
import SongManager from '../components/admin/SongManager';
import { ShieldAlert } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-pink-500" />
            Admin Dashboard
          </h1>
          <p className="text-harmony-muted mt-1">
            Configure GenHarmony song databases, tag system constraints, and view dashboard analytics.
          </p>
        </div>
      </div>

      {/* Song Management Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Music Database Management</h2>
          <p className="text-xs text-harmony-muted">Add or remove emotion-tagged songs that compose GenHarmony's predefined library.</p>
        </div>
        <SongManager />
      </div>
    </div>
  );
};

export default AdminDashboard;
