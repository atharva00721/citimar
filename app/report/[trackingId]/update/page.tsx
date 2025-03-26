"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCircleCheckFilled,
  IconClock,
  IconLoader,
} from "@tabler/icons-react";

import { updateReportStatus } from "@/actions/report";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UpdateStatusPageProps {
  params: {
    trackingId: string;
  };
}

export default function UpdateStatusPage({ params }: UpdateStatusPageProps) {
  const { trackingId } = params;
  const router = useRouter();
  const [status, setStatus] = useState<string>("SUBMITTED");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateReportStatus(trackingId, status, notes);

      if (result.success) {
        toast.success("Report status updated successfully");
        router.push(`/report/${trackingId}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update report status");
      }
    } catch (error) {
      toast.error("An error occurred while updating the report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6 max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/report/${trackingId}`}
          className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground"
        >
          <IconArrowLeft className="mr-1 size-4" />
          Back to Report
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">
          Update Report Status
        </h1>
        <p className="text-muted-foreground">Report ID: {trackingId}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Change Status</CardTitle>
            <CardDescription>
              Update the current status of this report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={status}
              onValueChange={setStatus}
              className="grid gap-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SUBMITTED" id="pending" />
                <Label htmlFor="pending" className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <IconClock className="size-3.5 text-yellow-500" />
                  </div>
                  Pending Review
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="UNDER_REVIEW" id="review" />
                <Label htmlFor="review" className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <IconClock className="size-3.5 text-orange-500" />
                  </div>
                  Under Review
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="IN_PROGRESS" id="investigation" />
                <Label
                  htmlFor="investigation"
                  className="flex items-center gap-2"
                >
                  <div className="size-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <IconLoader className="size-3.5 text-blue-500" />
                  </div>
                  In Progress
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RESOLVED" id="resolved" />
                <Label htmlFor="resolved" className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <IconCircleCheckFilled className="size-3.5 text-green-500" />
                  </div>
                  Resolved
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="notes">Status Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or details about this status update"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/report/${trackingId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
