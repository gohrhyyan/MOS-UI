import React from 'react';
import { File, Clock, Calendar } from 'lucide-react';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import { fileUtils } from '../../utils/fileUtils';

const FileHistoryView = ({ setSelectedView, currentFiles, setPrintDetails }) => {
  // Sort files by modified timestamp in descending order (newest first)
  const sortedFiles = [...currentFiles].sort((a, b) => b.modified - a.modified);

  // Function to handle when a file is selected
  const handleFileSelect = (file) => {
    setPrintDetails(file);
    setSelectedView('prepare');
  };

  // Function to render a single file item
  const FileItem = ({ file }) => (
    <button
      onClick={() => handleFileSelect(file)}
      className="w-full flex items-center p-4 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="bg-gray-200 p-3 rounded-lg mr-4">
        <File className="w-6 h-6 text-gray-600" />
      </div>
      
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-800 truncate">
          {fileUtils.getFilename(file.path)}
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {fileUtils.formatDate(file.modified)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {fileUtils.formatFileSize(file.size)}
          </span>
        </div>
      </div>
    </button>
  );

  // Function to render empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <File className="w-12 h-12 mb-2" />
      <p>No print files found</p>
    </div>
  );

  return (
    // We'll use the ResponsiveContainer with the allowContentScroll prop
    <ResponsiveContainer>
      {/* TopBar stays fixed */}
      <TopBar 
        title="File History" 
        showBack={true} 
        onBack={() => setSelectedView('home')}
      />
      
      {/* This div will have scrolling content */}
      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {sortedFiles && sortedFiles.length > 0 ? (
          sortedFiles.map((file, index) => (
            <FileItem key={`${file.path}-${index}`} file={file} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default FileHistoryView;