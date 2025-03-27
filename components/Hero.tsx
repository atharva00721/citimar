import React from 'react';
import { Shield, Lock, Send } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  return (
    <div className="relative min-h-screen pt-20 overflow-hidden flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-60 h-60 bg-red-800/10 rounded-full filter blur-3xl animate-float opacity-30"></div>
        <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-red-700/10 rounded-full filter blur-3xl animate-float opacity-20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] right-[25%] w-40 h-40 bg-red-600/10 rounded-full filter blur-3xl animate-float opacity-25" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="section-container relative z-10 flex flex-col items-center justify-center text-center">      
        <h1 className="heading-xl text-white max-w-4xl mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Report Safely, <span className="text-red-400">Stay Anonymous</span>
        </h1>
        
        <p className="subheading text-white/80 max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Our secure platform empowers whistleblowers to safely report misconduct while maintaining complete anonymity. Join the movement for transparency and accountability.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link href="/user" className="btn-primary flex items-center justify-center bg-red-700 hover:bg-red-600">
            <Send className="w-5 h-5 mr-2" />
            Report Now
          </Link>
        </div>
        
        <div className="w-full max-w-4xl relative h-96 animate-fade-in-delay">
          {/* Mock interface */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden glass-panel bg-black/30 border-gray-800">
            <div className="h-12 bg-gray-900 flex items-center px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="mx-auto flex items-center space-x-1">
                <Lock className="w-4 h-4 text-red-400" />
                <span className="text-xs text-white/80">secure-aegis.com</span>
              </div>
            </div>
            <div className="p-8 flex flex-col h-[calc(100%-3rem)] bg-gray-900">
              <h3 className="text-lg text-white font-medium mb-4">New Anonymous Report</h3>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="space-y-4 flex-grow">
                <div className="h-6 bg-gray-700 rounded w-full"></div>
                <div className="h-24 bg-gray-700 rounded w-full"></div>
                <div className="h-6 bg-gray-700 rounded w-1/3"></div>
              </div>
              <div className="mt-auto self-end">
                <div className="h-10 bg-red-700 rounded-lg w-32"></div>
              </div>
            </div>
          </div>
          
          {/* Security indicators */}
          <div className="absolute -right-6 top-1/4 bg-red-700 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse-subtle">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium">End-to-End Encrypted</span>
            </div>
          </div>
          <div className="absolute -left-6 bottom-1/4 bg-red-800 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse-subtle" style={{ animationDelay: '1.5s' }}>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">Anonymous Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
