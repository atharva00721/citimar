export interface SubmitRequest {
    clientHash: string;
    challenge: string;
    nonce: number;
    powDifficulty: number;
    sliderValue: number;
  }
  
  export interface RateLimiterOptions {
    duration: number;
    max: number;
  }
  
  export interface RateLimitResult {
    success: boolean;
    remaining: number;
  }