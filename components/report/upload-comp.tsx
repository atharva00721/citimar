"use client";

import React, { useState } from "react";
import { X, AlertCircle, Shield, Upload, FileType } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

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
    <Card className="border bg-background">
      <CardContent className="p-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Evidence Files</span>
          <Badge variant="outline" className="text-muted-foreground text-xs">
            Optional (Max 5)
          </Badge>
        </div>

        {/* Privacy notice */}
        <div className="mb-3 flex items-start text-xs text-muted-foreground bg-blue-50/50 p-2 rounded-md">
          <Shield className="h-3.5 w-3.5 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
          <p>
            For your privacy, personal metadata will be automatically removed
            from uploaded files.
          </p>
        </div>

        <div
          className={`border border-dashed p-6 rounded-md text-center ${
            dragActive ? "border-primary bg-primary/5" : "border-muted"
          } ${
            fileError ? "border-destructive/50" : ""
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
            <Upload className="h-8 w-8 text-muted-foreground mb-2 stroke-[1.25px]" />
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">Drop files here</span>{" "}
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Images, PDFs, documents, audio and video (max 10MB)
            </p>
          </label>
        </div>

        {fileError && (
          <div className="mt-2 flex items-start text-destructive text-xs">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Selected ({selectedFiles.length}/5)
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5 px-3 bg-muted/40 rounded-md"
                >
                  <div className="flex items-center overflow-hidden gap-2">
                    <div className="w-7 h-7 bg-primary/10 rounded flex items-center justify-center">
                      <FileType className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-xs font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <X
                      size={14}
                      className="text-muted-foreground hover:text-destructive"
                    />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
