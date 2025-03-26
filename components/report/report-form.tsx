// components/ReportForm.tsx
"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { FileUpload } from "./upload-comp";
import { AlertCircle, CheckCircle, Loader2, Info, Copy } from "lucide-react";
import {
  reportSchema,
  validateFiles,
  ReportFormData,
} from "@/schemas/report-schema";
import { ZodError } from "zod";
import { submitReport } from "@/actions/report";
import { useRouter } from "next/navigation";
import { batchCleanFiles } from "@/utils/file-sanitizer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type FormErrors = {
  title?: string;
  description?: string;
  files?: string[];
  form?: string;
};

export const ReportForm = () => {
  const router = useRouter();
  const [report, setReport] = useState<ReportFormData>({
    title: "",
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
          if (path === "title") {
            formattedErrors.title = err.message;
          } else if (path === "description") {
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
      // Clean metadata from files before uploading and automatically rename them
      const cleanedFiles = await batchCleanFiles(report.files, true);

      // Create FormData for server action
      const formData = new FormData();
      formData.append("title", report.title);
      formData.append("description", report.description);

      // Add cleaned files to FormData
      cleanedFiles.forEach((file) => {
        formData.append("evidence", file);
      });

      // Directly call the server action
      const result = await submitReport(formData);

      if (result.success) {
        // Show success message
        setSubmitStatus({
          success: true,
          message:
            "Your report has been submitted successfully. Redirecting to tracking page...",
          trackingId: result.trackingId,
        });

        // Reset form
        setReport({
          title: "",
          description: "",
          files: [],
        });

        // Refresh the page data
        router.refresh();

        // Redirect to tracking page after a brief delay to let the user see the success message
        setTimeout(() => {
          if (result.trackingId) {
            router.push(`/report/${result.trackingId}`);
          }
        }, 1500);
      } else {
        // Show error message
        setSubmitStatus({
          success: false,
          message:
            result.error ||
            "There was an error submitting your report. Please try again.",
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
    <div className="max-w-2xl mx-auto">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">Submit Corruption Report</CardTitle>
        <CardDescription>
          Provide details about your report. All submissions are confidential.
        </CardDescription>
      </CardHeader>

      {/* Success message */}
      {submitStatus.success && (
        <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {submitStatus.message}
            {submitStatus.trackingId && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-1">
                  Please save this tracking ID:
                </p>
                <div className="p-2 bg-background border rounded-md font-mono text-sm flex justify-between items-center">
                  <code className="text-xs sm:text-sm">
                    {submitStatus.trackingId}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        submitStatus.trackingId || ""
                      );
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {submitStatus.success === false && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Form validation error */}
      {errors.form && (
        <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">
            Please check your form
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            {errors.form}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Report Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={report.title}
            onChange={(e) => {
              setReport({ ...report, title: e.target.value });
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            className={
              errors.title ? "border-destructive ring-destructive" : ""
            }
            placeholder="Brief title describing the incident"
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Description field */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description of Incident <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={report.description}
            onChange={(e) => {
              setReport({ ...report, description: e.target.value });
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            className={`min-h-32 ${
              errors.description ? "border-destructive ring-destructive" : ""
            }`}
            placeholder="Please provide a detailed description of the corruption incident..."
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Your identity will remain confidential throughout this process.
          </p>
        </div>

        {/* File upload */}
        <div>
          <FileUpload
            onFileSelect={(files) => {
              setReport({ ...report, files });
              if (errors.files?.length) {
                setErrors((prev) => ({ ...prev, files: undefined }));
              }
            }}
          />

          {errors.files && errors.files.length > 0 && (
            <div className="mt-2">
              {errors.files.map((error, index) => (
                <p key={index} className="text-xs text-destructive">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <CardFooter className="px-0 pt-2 pb-0">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            size="lg"
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
        </CardFooter>
      </form>
    </div>
  );
};
