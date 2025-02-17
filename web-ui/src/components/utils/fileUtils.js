// src/utils/fileUtils.js

export const fileUtils = {
    // Format file size to human readable string
    formatFileSize: (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    },

    // Get filename from path
    getFilename: (path) => {
        return path.split('/').pop() || path;
    },

    // Format timestamp to readable date
    formatDate: (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
};