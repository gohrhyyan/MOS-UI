import React from 'react';
import { ArrowLeft } from 'lucide-react';

const TopBar = ({ title, showBack = false, onBack }) => (
  <div className="w-full flex items-center justify-between p-4 border-b">
    {showBack ? (
      <button onClick={onBack} className="p-2">
        <ArrowLeft className="w-5 h-5" />
      </button>
    ) : (
      <div className="w-9" />
    )}
    <span className="text-lg font-medium">{title}</span>
    <div className="w-9" />
  </div>
);

export default TopBar;