import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconFile, IconAlertTriangle } from "@tabler/icons-react";

type EvidenceAnalysisType = {
  fileTypeDistribution: Record<string, string>;
  evidencePatterns: string[];
  securityImplications: string[];
  evidenceRecommendations: string[];
};

export function EvidenceAnalytics({ 
  evidenceAnalysis 
}: { 
  evidenceAnalysis?: EvidenceAnalysisType 
}) {
  if (!evidenceAnalysis) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[20vh] text-muted-foreground">
            No evidence analysis available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <IconFile className="h-5 w-5" />
          Evidence Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Type Distribution */}
          <div>
            <h3 className="text-sm font-semibold mb-2">File Type Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(evidenceAnalysis.fileTypeDistribution).map(([type, percentage]) => (
                <div key={type} className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground uppercase">{type}</div>
                  <div className="text-lg font-semibold">{percentage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Patterns */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Evidence Patterns</h3>
            <ul className="space-y-2">
              {evidenceAnalysis.evidencePatterns.map((pattern, index) => (
                <li key={index} className="text-sm text-muted-foreground flex gap-2">
                  <span>•</span>
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Security Implications */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
              Security Implications
            </h3>
            <ul className="space-y-2">
              {evidenceAnalysis.securityImplications.map((implication, index) => (
                <li key={index} className="text-sm text-muted-foreground flex gap-2">
                  <span>•</span>
                  <span>{implication}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
            <ul className="space-y-2">
              {evidenceAnalysis.evidenceRecommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex gap-2">
                  <span>•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 