import { MetadataSanitizationTest } from "@/components/testing/metadata-test";

export const metadata = {
  title: "Metadata Sanitization Test",
  description: "Test the metadata sanitization process for uploaded files",
};

export default function MetadataTestPage() {
  return (
    <div className="container mx-auto py-10">
      <MetadataSanitizationTest />
    </div>
  );
}
