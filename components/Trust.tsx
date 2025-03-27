import React from 'react';
import { ShieldCheck, Lock, UserCheck, Database, Globe, FileCheck } from 'lucide-react';

const Trust = () => {
  const trustIndicators = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Encrypted Communication",
      description: "All data exchanges are protected with 256-bit encryption"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Zero Knowledge Protocol",
      description: "We cannot access your encrypted data - only you and authorized recipients can"
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Anonymity Guaranteed",
      description: "No IP logging, no personal data collection, no traceable metadata"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Secure Infrastructure",
      description: "Redundant, hardened servers with continuous security monitoring"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Regulatory Compliance",
      description: "Compliant with EU Whistleblower Directive and international standards"
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Regular Security Audits",
      description: "Independent security firms verify our platform's integrity quarterly"
    }
  ];

  const testimonials = [
    {
      quote: "This platform provided the security and anonymity I needed to report serious violations without fear of retaliation.",
      author: "Anonymous Whistleblower",
      organization: "Financial Services Industry"
    },
    {
      quote: "As a compliance officer, I trust this system to protect our internal reporters while maintaining proper documentation.",
      author: "Chief Ethics Officer",
      organization: "Fortune 500 Company"
    }
  ];

  return (
    <section id="trust" className="relative py-24 bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--tw-gradient-stops))] from-transparent via-red-950/30 to-transparent"></div>
      
      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-sm font-medium text-red-400 bg-red-950/60 rounded-full">
            Trusted & Verified
          </div>
          <h2 className="heading-lg text-white mb-6">
            Your Security is Our <span className="text-red-500">Top Priority</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Weve built our platform on a foundation of advanced security protocols and privacy-first principles to ensure complete protection.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {trustIndicators.map((item, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700 transition-all duration-300 hover:shadow-lg animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center mr-4 text-red-400">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="glass-card bg-gradient-to-r from-gray-800 to-gray-900/40 p-8 md:p-10 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Why Users Trust Our Platform</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-black/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-700 relative animate-fade-in-right"
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <div className="absolute -top-4 -left-4 text-6xl text-red-700 opacity-50 font-serif">&quot;</div>
                  <div className="relative z-10">
                    <p className="italic text-gray-300 mb-4">{testimonial.quote}</p>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.organization}</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-6xl text-red-700 opacity-50 font-serif rotate-180">&quot;</div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-black border border-gray-700 text-gray-300 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-red-500 mr-2" />
                <span>ISO 27001 Certified Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;
