/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { submitReportAction, getTargetRange } from '@/actions/submit';
import { ReportForm } from '@/components/report/report-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Server actions
const getSalt = async (): Promise<{ salt: string }> => {
  const res = await fetch('/api/salt');
  return res.json();
};


export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [salt, setSalt] = useState<string>("");
  const [difficulty, ] = useState<number>(2);
  const [sliderPos, setSliderPos] = useState<number>(0);
  const [verified, setVerified] = useState<boolean>(false);
  const [targetRange, setTargetRange] = useState<number>(0);

  useEffect(() => {
    if (!localStorage.getItem("anon_id")) {
      localStorage.setItem("anon_id", uuidv4());
    }

    const fetchSalt = async () => {
      try {
        const data = await getSalt();
        setSalt(data.salt);
        // Get initial target range
        const target = await getTargetRange();
        setTargetRange(target);
      } catch (err:any) {
        setStatus("Error initializing security parameters");
        console.log(err)
      }
    };

    fetchSalt();
  }, []);

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!validateHumanCheck()) {
        throw new Error("Please complete the human verification correctly");
      }

      const anonId: string = localStorage.getItem("anon_id") || "";
      const clientHash: string = await hashData(salt + anonId);

      const challenge: string = Date.now().toString();
      const { nonce } = await generateProofOfWork(challenge, difficulty);

      const response = await submitReportAction({
        clientHash,
        challenge,
        nonce,
        powDifficulty: difficulty,
        sliderValue: sliderPos / 10, // Convert to 0-100 range before sending to server
      });

      if (response.error) throw new Error(response.error);

      setStatus("Verification successful");
      setVerified(true);
    } catch (err: unknown) {
      const error = err as Error;
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const hashData = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const hashBuffer: ArrayBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(data)
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const generateProofOfWork = async (
    challenge: string,
    requiredZeros: number
  ): Promise<{ nonce: number; hash: string }> => {
    const target = "0".repeat(requiredZeros);
    let nonce = 0;
    const startTime = Date.now();

    while (true) {
      const hash: string = await hashData(challenge + nonce.toString());
      if (hash.startsWith(target)) return { nonce, hash };
      if (Date.now() - startTime > 15000) throw new Error("Timeout");
      nonce++;
    }
  };

  const validateHumanCheck = (): boolean => {
    // Convert sliderPos (0-1000) to actual value (0-100)
    const pos: number = sliderPos / 10;
    return Math.abs(pos - targetRange) <= 5; // Allow ±5 margin of error
  };

  const handleSliderChange = (value: number[]): void => {
    setSliderPos(value[0]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      {!verified ? (
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-medium text-center">
              Human Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Slider
                    defaultValue={[0]}
                    value={[sliderPos]}
                    max={1000}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="my-6"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Drag the slider to {targetRange}% to verify you&apos;re human
                  </p>
                  {validateHumanCheck() && (
                    <p className="text-xs text-green-600 text-center">
                      ✓ Verification successful
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full"
                  variant="default"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
                {status && (
                  <p
                    className={`text-sm text-center  ${
                      status.includes("Error")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {status}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-3xl shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-medium text-center">
              Secure Whistleblower Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReportForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}