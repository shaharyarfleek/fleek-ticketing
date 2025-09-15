import React, { useRef, useState } from 'react';
import { Upload, X, File, Image, Video, FileText } from 'lucide-react';
import { Attachment, User } from '../types';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      onFilesSelected(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).slice(0, maxFiles);
      onFilesSelected(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-gray-500">
          Images, videos, documents (max {maxFiles} files)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

interface AttachmentListProps {
  attachments: Attachment[];
  onRemove?: (attachmentId: string) => void;
  showRemove?: boolean;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemove,
  showRemove = false
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 text-blue-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-green-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(attachment.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(attachment.size)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {attachment.type === 'image' && (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-8 h-8 rounded object-cover"
              />
            )}
            {showRemove && onRemove && (
              <button
                onClick={() => onRemove(attachment.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};