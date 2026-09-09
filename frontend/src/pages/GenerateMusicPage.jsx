import React from 'react';
import GeneratedPlayer from '../components/dashboard/GeneratedPlayer';

export const GenerateMusicPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Generate Music</h2>
          <p className="text-sm text-harmony-muted mt-1">Create new music based on your emotion</p>
        </div>
      </div>

      <div>
        <GeneratedPlayer />
      </div>
    </div>
  );
};

export default GenerateMusicPage;
