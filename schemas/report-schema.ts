import { z } from "zod";

// Define allowed file types
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

// Schema for individual file validation
export const fileSchema = z.custom<File>(
  (file) => {
    // First check if it's a File object
    if (!(file instanceof File)) {
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return false;
    }

    // Check file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return false;
    }

    return true;
  },
  {
    message:
      "File must be a valid document, image, audio, or video file under 10MB",
  }
);

// Define the schema for report validation
export const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  categoryId: z.string().uuid("Please select a valid category"),
  files: z
    .array(z.instanceof(File))
    .min(1, "At least one file must be uploaded")
    .max(10, "Maximum 10 files allowed")

    .transform((files) => (Array.isArray(files) ? files : [])),
});

// Type for form data
export type ReportFormData = z.infer<typeof reportSchema>;

// Helper function to validate files individually with detailed errors
export const validateFiles = (
  files: File[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (files.length > 5) {
    errors.push("You can upload a maximum of 5 files");
  }

  files.forEach((file) => {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File "${file.name}" exceeds the maximum size of 10MB`);
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      errors.push(`File "${file.name}" is not a supported file type`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Export the constants so they can be reused elsewhere
export const FILE_CONSTRAINTS = {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES: 10,
};
