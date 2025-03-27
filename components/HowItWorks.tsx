
import React from 'react';
import { Shield, FileText, MessageCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: "Connect Securely",
      description: "Access our platform through a secure browser. No account creation or personal information required.",
      color: "bg-red-800"
    },
    {
      icon: <FileText className="w-8 h-8 text-white" />,
      title: "Submit Your Report",
      description: "Document the issue with as much detail as possible. Attach evidence securely with our metadata-stripping tool.",
      color: "bg-red-700"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-white" />,
      title: "Track Progress Anonymously",
      description: "Use your anonymous case ID to follow updates and communicate with investigators without revealing your identity.",
      color: "bg-red-600"
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-black text-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute -right-40 -top-40 w-[30rem] h-[30rem] bg-red-900/50 rounded-full filter blur-3xl"></div>
        <div className="absolute -left-20 -bottom-40 w-[25rem] h-[25rem] bg-red-800/30 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-sm font-medium text-red-300 bg-red-900/60 backdrop-blur-sm rounded-full border border-red-700/50">
            Simple Three-Step Process
          </div>
          <h2 className="heading-lg mb-6">
            How to Report <span className="text-red-400">Anonymously</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Our streamlined process makes it easy to submit reports while maintaining your anonymity throughout the entire journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 mx-auto md:mx-0 z-10 relative`}>
                {step.icon}
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-16 right-0 h-0.5 bg-gradient-to-r from-red-700/80 to-transparent"></div>
              )}
              
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-900 text-white font-bold text-sm mb-4 md:mb-5">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a href="#" className="btn-primary inline-flex items-center bg-red-700 hover:bg-red-600">
            Start Secure Reporting Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
