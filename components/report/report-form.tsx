// components/ReportForm.tsx
"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { FileUpload } from "./upload-comp";
import { AlertCircle, CheckCircle, Loader2, Info } from "lucide-react";
import { reportSchema, validateFiles, ReportFormData } from "@/schemas/report-schema";
import { ZodError } from "zod";
import { submitReport } from "@/actions/report";
import { useRouter } from "next/navigation";

type FormErrors = {
  description?: string;
  files?: string[];
  form?: string;
};

export const ReportForm = () => {
  const router = useRouter();
  const [report, setReport] = useState<ReportFormData>({
    description: "",
    files: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
    trackingId?: string;
  }>({});

  const validateForm = (): boolean => {
    try {
      // Validate form with Zod schema
      reportSchema.parse(report);
      
      // Additional file validation for better error messages
      const fileValidation = validateFiles(report.files);
      if (!fileValidation.valid) {
        setErrors({ files: fileValidation.errors });
        return false;
      }
      
      // Clear errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert Zod errors to our form errors format
        const formattedErrors: FormErrors = {};
        
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          if (path === "description") {
            formattedErrors.description = err.message;
          } else if (path === "files") {
            if (!formattedErrors.files) formattedErrors.files = [];
            formattedErrors.files.push(err.message);
          } else {
            formattedErrors.form = "Please check the form for errors";
          }
        });
        
        setErrors(formattedErrors);
      } else {
        // Handle unexpected errors
        setErrors({ form: "An unexpected error occurred during validation" });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("description", report.description);
      
      // Add files to FormData
      report.files.forEach((file) => {
        formData.append("evidence", file);
      });
      
      // Directly call the server action
      const result = await submitReport(formData);
      
      if (result.success) {
        // Show success message
        setSubmitStatus({
          success: true,
          message: "Your report has been submitted successfully. Keep this tracking ID for reference.",
          trackingId: result.trackingId,
        });
        
        // Reset form
        setReport({
          description: "",
          files: [],
        });
        
        // Refresh the page data
        router.refresh();
      } else {
        // Show error message
        setSubmitStatus({
          success: false,
          message: result.error || "There was an error submitting your report. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setSubmitStatus({
        success: false,
        message: "There was an error submitting your report. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Submit Corruption Report
      </h2>

      {/* Success message */}
      {submitStatus.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
          <CheckCircle
            className="text-green-500 mr-3 mt-0.5 flex-shrink-0"
            size={18}
          />
          <div>
            <p className="text-green-800">{submitStatus.message}</p>
            {submitStatus.trackingId && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">
                  Please save this tracking ID to check your report status in the future:
                </p>
                <p className="p-2 bg-white border border-green-100 rounded font-mono text-sm flex justify-between items-center">
                  <span>{submitStatus.trackingId}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      navigator.clipboard.writeText(submitStatus.trackingId || "");
                    }}
                  >
                    Copy
                  </Button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {submitStatus.success === false && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle
            className="text-red-500 mr-3 mt-0.5 flex-shrink-0"
            size={18}
          />
          <p className="text-red-800">{submitStatus.message}</p>
        </div>
      )}

      {/* Form validation error */}
      {errors.form && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start">
          <Info className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-amber-800">{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description field */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description of Incident <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="description"
            value={report.description}
            onChange={(e) => {
              setReport({ ...report, description: e.target.value });
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            className={`w-full p-3 border rounded-md min-h-32 ${
              errors.description
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-blue-500"
            }`}
            placeholder="Please provide a detailed description of the corruption incident. Include relevant details such as location, date, time, and people involved."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your identity will remain confidential throughout this process.
          </p>
        </div>

        {/* File upload */}
        <div>
          <FileUpload onFileSelect={(files) => {
            setReport({ ...report, files });
            if (errors.files?.length) {
              setErrors((prev) => ({ ...prev, files: undefined }));
            }
          }} />
          
          {errors.files && errors.files.length > 0 && (
            <div className="mt-2">
              {errors.files.map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <Button
            type="submit"
            className={`w-full sm:w-auto px-6 py-2.5 rounded-md font-medium text-white 
                      transition-colors ${
                        isSubmitting
                          ? "bg-blue-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
