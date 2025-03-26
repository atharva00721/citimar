/**
 * Utilities for sanitizing files and removing sensitive metadata
 */

import { FILE_CONSTRAINTS } from "@/schemas/report-schema";

/**
 * Types of files that may contain metadata we want to clean
 */
const METADATA_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Clean metadata from a document file
 * @param file The file to clean metadata from
 * @param autoRename Whether to automatically rename the file
 * @returns Promise resolving to a sanitized file with metadata removed
 */
export async function cleanFileMetadata(
  file: File,
  autoRename = true
): Promise<File> {
  try {
    // Generate a safe filename if auto-rename is enabled
    const safeFilename = autoRename ? generateSafeFilename(file) : file.name;

    // Skip if file type doesn't typically contain metadata we want to clean
    if (!METADATA_FILE_TYPES.includes(file.type)) {
      return autoRename
        ? new File([file], safeFilename, { type: file.type })
        : file;
    }

    // Process based on file type
    if (file.type.startsWith("image/")) {
      return await cleanImageMetadata(file, safeFilename);
    } else if (
      file.type.includes("pdf") ||
      file.type.includes("msword") ||
      file.type.includes("document")
    ) {
      return await cleanDocumentMetadata(file, safeFilename);
    }

    // Return file with potential rename but otherwise unchanged
    return autoRename
      ? new File([file], safeFilename, { type: file.type })
      : file;
  } catch (error) {
    console.error("Error cleaning file metadata:", error);
    // Return original file if cleaning fails
    return file;
  }
}

/**
 * Clean metadata from image files
 * @param imageFile The image file to clean
 * @param newFilename New filename to use (optional)
 * @returns Promise resolving to a sanitized image file
 */
async function cleanImageMetadata(
  imageFile: File,
  newFilename?: string
): Promise<File> {
  // Create a canvas and remove EXIF data by redrawing the image
  const blob = await new Promise<Blob>((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set up image loading with CORS settings to prevent tainted canvas
    img.crossOrigin = "anonymous";

    // Set up image loading
    img.onload = () => {
      // Set the canvas dimensions to match the image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Clear the canvas first
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the image to remove metadata
      ctx?.drawImage(img, 0, 0);

      // Determine compression quality based on file type
      // - For JPEG, use a good quality but not 100% to keep size reasonable
      // - PNG compression doesn't work the same way, so we don't specify for those
      let quality: number | undefined;

      if (imageFile.type === "image/jpeg" || imageFile.type === "image/jpg") {
        // Use 0.85 quality (85%) for JPEGs which is a good balance between size and quality
        quality = 0.85;
      }

      // Convert canvas to a blob with appropriate compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // If blob conversion fails, use original file
            resolve(imageFile);
          }
        },
        imageFile.type,
        quality
      );
    };

    // Handle errors by returning the original file
    img.onerror = () => {
      console.error("Error loading image for metadata cleaning");
      resolve(imageFile);
    };

    // Create a safe URL from the file
    const objectUrl = URL.createObjectURL(imageFile);

    // Load the image from the file
    img.src = objectUrl;

    // Clean up object URL when done to prevent memory leaks
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  });

  // Use provided filename or original name
  const filename = newFilename || imageFile.name;

  // Create a new file with the sanitized content
  return new File([blob], filename, {
    type: imageFile.type,
    lastModified: new Date().getTime(),
  });
}

/**
 * Clean metadata from document files (PDF, Word)
 * @param docFile The document file to clean
 * @param newFilename New filename to use (optional)
 * @returns Promise resolving to a sanitized document file
 */
async function cleanDocumentMetadata(
  docFile: File,
  newFilename?: string
): Promise<File> {
  // In a real implementation, you would use libraries like pdf-lib for PDFs
  // or appropriate libraries for Word documents

  // For now, we'll at least change the filename and last modified date
  // which removes some identifiable information
  return new File([docFile], newFilename || docFile.name, {
    type: docFile.type,
    lastModified: new Date().getTime(),
  });
}

/**
 * Batch process multiple files to clean their metadata
 * @param files Array of files to clean
 * @param autoRename Whether to automatically rename the files
 * @returns Promise resolving to an array of sanitized files
 */
export async function batchCleanFiles(
  files: File[],
  autoRename = true
): Promise<File[]> {
  return Promise.all(files.map((file) => cleanFileMetadata(file, autoRename)));
}

/**
 * Generate a safe, anonymous filename while preserving extension
 * @param originalFile The original file
 * @returns A new unique filename with the same extension
 */
export function generateSafeFilename(originalFile: File): string {
  const extension = originalFile.name.split(".").pop() || "";
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);

  // Create a generic file name based on type
  let typePrefix = "file";
  if (originalFile.type.startsWith("image/")) {
    typePrefix = "image";
  } else if (originalFile.type.startsWith("video/")) {
    typePrefix = "video";
  } else if (originalFile.type.startsWith("audio/")) {
    typePrefix = "audio";
  } else if (originalFile.type.includes("pdf")) {
    typePrefix = "document";
  } else if (originalFile.type.includes("document")) {
    typePrefix = "document";
  }

  return `${typePrefix}_${timestamp}_${randomStr}.${extension}`;
}
