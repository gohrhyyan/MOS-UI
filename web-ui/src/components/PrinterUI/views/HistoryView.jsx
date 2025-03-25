import React from 'react';
import { File, Clock, Calendar } from 'lucide-react';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import { fileUtils } from '../../utils/fileUtils';

const FileHistoryView = ({ setSelectedView, currentFiles, setSelectedFilePath }) => {
  // Sort files by modified timestamp in descending order (newest first)
  const sortedFiles = [...currentFiles].sort((a, b) => b.modified - a.modified);

  // Function to handle when a file is selected
  const handleFileSelect = (file) => {
    setSelectedFilePath(file.path);
    setSelectedView('prepare');
  };

  // Function to render a single file item
  const FileItem = ({ file }) => (
    <button
      onClick={() => handleFileSelect(file)}
      className="w-full flex items-center p-4 mb-2 rounded-lg transition-colors"
    >
      <div className="flex-1 text-left overflow-hidden">
        <div className="font-medium truncate max-w-full">
          {fileUtils.getFilename(file.path)}
        </div>
        <div className="text-sm flex items-center gap-4 mt-1">
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
    <div className="flex flex-col items-center justify-center h-full">
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