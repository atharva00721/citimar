'use client'
import { useRouter } from 'next/router';
import { useState, useEffect, ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

type SaltResponse = {
  salt: string;
};

type SubmitResponse = {
  success?: boolean;
  error?: string;
};

type ProofOfWorkResult = {
  nonce: number;
  hash: string;
};

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [salt, setSalt] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(2);
  const [sliderPos, setSliderPos] = useState<number>(0);

  useEffect(() => {
    if (!localStorage.getItem('anon_id')) {
      localStorage.setItem('anon_id', uuidv4());
    }
    
    const fetchSalt = async () => {
      try {
        const res = await fetch('/api/salt');
        const data: SaltResponse = await res.json();
        setSalt(data.salt);
      } catch (err) {
        setStatus('Error initializing security parameters');
      }
    };
    
    fetchSalt();
  }, []);

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!validateHumanCheck()) {
        throw new Error('Complete the human verification');
      }

      const anonId: string = localStorage.getItem('anon_id') || '';
      const clientHash: string = await hashData(salt + anonId);

      const challenge: string = Date.now().toString();
      const { nonce, hash }: ProofOfWorkResult = await generateProofOfWork(challenge, difficulty);

      const res: Response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientHash,
          challenge,
          nonce,
          powDifficulty: difficulty,
          sliderValue: sliderPos
        }),
      });

      const newDifficulty: string | null = res.headers.get('X-Pow-Difficulty');
      if (newDifficulty) setDifficulty(parseInt(newDifficulty));

      const responseData: SubmitResponse = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Unknown error');

      setStatus('Submitted successfully');
      
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
      'SHA-256',
      encoder.encode(data)
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateProofOfWork = async (
    challenge: string,
    requiredZeros: number
  ): Promise<ProofOfWorkResult> => {
    const target = '0'.repeat(requiredZeros);
    let nonce = 0;
    const startTime = Date.now();
    
    while (true) {
      const hash: string = await hashData(challenge + nonce.toString());
      if (hash.startsWith(target)) return { nonce, hash };
      if (Date.now() - startTime > 15000) throw new Error('Timeout');
      nonce++;
    }
  };

  const validateHumanCheck = (): boolean => {
    const pos: number = sliderPos / 1000;
    return pos >= 0.7 && pos <= 0.8;
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSliderPos(parseInt(e.target.value));
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 px-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Secure Whistleblower Submission
        </h1>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="slider-container space-y-2">
              <div className="relative pt-1">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value={sliderPos}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer dark:bg-gray-700"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(sliderPos/1000)*100}%, #e5e7eb ${(sliderPos/1000)*100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Drag the slider to between 70% and 80% to verify you're human
              </p>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className={`
                w-full py-3 px-4 rounded-md transition-all
                ${loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}
                text-white font-semibold text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Submit Anonymously'}
            </button>
          </div>

          {status && (
            <div className={`mt-4 p-3 rounded-md text-sm text-center ${
              status.includes('Error') 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}