"use client";

import React, { useState } from "react";
import { X, AlertCircle, Shield } from "lucide-react";

// Props for handling file selection.
type FileUploadProps = {
  onFileSelect: (files: File[]) => void;
};

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Define allowed file types and max size
  const ACCEPTED_FILE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "video/mp4",
    "video/mpeg",
    "audio/mpeg",
    "audio/mp3",
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 5;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `"${file.name}" is not a supported file type`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `"${file.name}" exceeds the maximum size of 10MB`,
      };
    }

    return { valid: true };
  };

  const processFiles = (filesToProcess: File[]) => {
    if (selectedFiles.length + filesToProcess.length > MAX_FILES) {
      setFileError(`You can upload a maximum of ${MAX_FILES} files`);
      return;
    }

    let errorMessage = null;
    const validFiles: File[] = [];

    for (const file of filesToProcess) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errorMessage = validation.error;
        break;
      }
    }

    if (errorMessage) {
      setFileError(errorMessage);
    } else {
      setFileError(null);
      setSelectedFiles((prev) => {
        const updated = [...prev, ...validFiles];
        onFileSelect(updated);
        return updated;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFileSelect(updatedFiles);
    if (fileError) setFileError(null);
  };

  // Function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-4 border rounded-md shadow-sm bg-white">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Upload Evidence{" "}
        <span className="text-sm text-gray-500">(optional, max 5 files)</span>
      </label>

      {/* Privacy notice */}
      <div className="mb-3 flex items-start text-xs text-gray-600 bg-blue-50 p-2 rounded">
        <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
        <p>
          For your privacy, personal metadata will be automatically removed from
          uploaded files.
        </p>
      </div>

      <div
        className={`border-2 border-dashed p-6 rounded-md text-center ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${
          fileError ? "border-red-300" : ""
        } transition-colors duration-200 ease-in-out`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          id="file-upload"
          accept={ACCEPTED_FILE_TYPES.join(",")}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <svg
            className="w-10 h-10 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600">
            Drag and drop files here, or{" "}
            <span className="text-blue-600 font-semibold">browse</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: Images, PDFs, Word documents, audio and video
            files (max 10MB each)
          </p>
        </label>
      </div>

      {fileError && (
        <div className="mt-2 flex items-start text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({selectedFiles.length}/5)
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
              >
                <div className="flex items-center overflow-hidden">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-2">
                    <span className="text-xs font-medium text-blue-700">
                      {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                  <div className="truncate">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
