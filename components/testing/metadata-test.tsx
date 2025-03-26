"use client";

import { useState } from "react";
import { batchCleanFiles } from "@/utils/file-sanitizer";
import {
  compareMetadataSanitization,
  MetadataEntry,
} from "@/utils/metadata-extractor";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MetadataSanitizationTest = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{
    beforeSanitization: MetadataEntry[];
    afterSanitization: MetadataEntry[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sanitizationOptions, setSanitizationOptions] = useState({
    autoRename: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Check if it's an image file
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file for the test.");
        return;
      }

      setFile(selectedFile);
      setComparisonResult(null);
      setError(null);
    }
  };

  const runTest = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Extract metadata before sanitization
      const beforeMetadata = await extractImageMetadata(file);

      // Clean the file with selected options
      const cleanedFile = await cleanFileMetadata(
        file,
        sanitizationOptions.autoRename
      );

      // Extract metadata after sanitization
      const afterMetadata = await extractImageMetadata(cleanedFile);

      setComparisonResult({
        beforeSanitization: beforeMetadata,
        afterSanitization: afterMetadata,
      });
    } catch (err) {
      console.error("Error during metadata test:", err);
      setError("An error occurred during sanitization test.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSanitizedFile = async () => {
    if (!file) return;

    try {
      // Use the same options as the test
      const cleanedFile = await cleanFileMetadata(
        file,
        sanitizationOptions.autoRename
      );

      // Create download URL
      const downloadUrl = URL.createObjectURL(cleanedFile);

      // Create and trigger download link
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = cleanedFile.name; // Use the possibly renamed file
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Error downloading sanitized file:", err);
      setError("Failed to download sanitized file.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Metadata Sanitization Test</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select an image file to test sanitization
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <div className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={sanitizationOptions.autoRename}
            onChange={(e) =>
              setSanitizationOptions((prev) => ({
                ...prev,
                autoRename: e.target.checked,
              }))
            }
            className="rounded text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Auto-rename file for privacy
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-5">
          Removes any personal information or patterns from filenames
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle
            className="text-red-500 mr-2 mt-0.5 flex-shrink-0"
            size={16}
          />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={runTest}
        disabled={!file || isProcessing}
        className={`w-full mb-8 ${isProcessing ? "opacity-70" : ""}`}
      >
        {isProcessing ? "Processing..." : "Test Metadata Sanitization"}
      </Button>

      {comparisonResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <Button
              onClick={downloadSanitizedFile}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <FileText className="mr-2" size={16} />
              Download Sanitized File
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3 text-amber-700">
                Before Sanitization
              </h3>
              <div className="space-y-2">
                {comparisonResult.beforeSanitization.map((entry, index) => (
                  <div key={`before-${index}`} className="text-sm">
                    <span className="font-medium">{entry.name}:</span>{" "}
                    {entry.value?.toString() || "N/A"}
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3 text-green-700">
                After Sanitization
                <CheckCircle
                  className="inline-block ml-2 text-green-500"
                  size={16}
                />
              </h3>
              <div className="space-y-2">
                {comparisonResult.afterSanitization.map((entry, index) => (
                  <div key={`after-${index}`} className="text-sm">
                    <span className="font-medium">{entry.name}:</span>{" "}
                    {entry.value?.toString() || "N/A"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-md font-medium mb-2 text-blue-700">
              Summary of Changes:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              {detectChanges(
                comparisonResult.beforeSanitization,
                comparisonResult.afterSanitization
              ).map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Detect changes between before and after metadata
 */
function detectChanges(
  before: MetadataEntry[],
  after: MetadataEntry[]
): string[] {
  const changes: string[] = [];

  // Check if filename changed
  const beforeName = before.find((e) => e.name === "Filename")?.value;
  const afterName = after.find((e) => e.name === "Filename")?.value;
  if (beforeName !== afterName) {
    changes.push(`Filename changed from "${beforeName}" to "${afterName}"`);
  }

  // Check if file size changed
  const beforeSize = before.find((e) => e.name === "File size")
    ?.value as string;
  const afterSize = after.find((e) => e.name === "File size")?.value as string;
  if (beforeSize !== afterSize) {
    // Extract numbers to calculate percentage change
    const beforeSizeNum = parseFloat(beforeSize.split(" ")[0]);
    const afterSizeNum = parseFloat(afterSize.split(" ")[0]);

    if (!isNaN(beforeSizeNum) && !isNaN(afterSizeNum) && beforeSizeNum > 0) {
      const percentChange =
        ((afterSizeNum - beforeSizeNum) / beforeSizeNum) * 100;
      const changeType = percentChange > 0 ? "increased" : "decreased";

      changes.push(
        `File size ${changeType} by ${Math.abs(percentChange).toFixed(
          1
        )}% (from ${beforeSize} to ${afterSize})`
      );

      // If the file size increased significantly, provide an explanation
      if (percentChange > 5) {
        changes.push(
          "Note: File size may increase after sanitization due to the canvas re-drawing process removing compression optimizations"
        );
      }
    } else {
      changes.push(`File size changed from ${beforeSize} to ${afterSize}`);
    }
  }

  // Check if last modified date changed
  const beforeDate = before.find((e) => e.name === "Last modified")?.value;
  const afterDate = after.find((e) => e.name === "Last modified")?.value;
  if (beforeDate !== afterDate) {
    changes.push("File modification date was updated");
  }

  // Look specifically for location data removal
  const hasLocationBefore = before.some(
    (entry) =>
      entry.name.includes("GPS") ||
      entry.name.includes("Location") ||
      entry.name.includes("Lat") ||
      entry.name.includes("Long")
  );

  if (hasLocationBefore) {
    changes.push("Location data (GPS coordinates) was removed");
  }

  // Look for other EXIF data that was removed
  before.forEach((entry) => {
    const afterEntry = after.find((e) => e.name === entry.name);
    if (
      !afterEntry &&
      ![
        "Filename",
        "File size",
        "MIME type",
        "Last modified",
        "Width",
        "Height",
      ].includes(entry.name)
    ) {
      // Skip GPS entries as they're handled above
      if (!entry.name.includes("GPS") && !entry.name.includes("Location")) {
        changes.push(`Removed metadata: ${entry.name}`);
      }
    }
  });

  if (changes.length === 0) {
    changes.push(
      "No metadata was cleaned. The image may not have contained identifiable metadata."
    );
  }

  return changes;
}
