import React from 'react';
import PredefinedPlayer from '../components/dashboard/PredefinedPlayer';

export const MusicPlayerPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Music Player</h2>
        </div>
      </div>
      
      <div>
        <PredefinedPlayer />
      </div>
    </div>
  );
};

export default MusicPlayerPage;
