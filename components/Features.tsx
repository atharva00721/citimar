
import React from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Fingerprint, 
  Eye, 
  Clock, 
  Zap 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Lock className="w-6 h-6 text-red-500" />,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted both in transit and at rest using industry-leading encryption protocols.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-red-500" />,
      title: 'Secure Case Tracking',
      description: 'Follow your report\'s progress with a secure anonymous identifier that protects your identity.'
    },
    {
      icon: <Fingerprint className="w-6 h-6 text-red-500" />,
      title: 'Multi-Level Authentication',
      description: 'Advanced authentication systems ensure only authorized personnel can access sensitive information.'
    },
    {
      icon: <Eye className="w-6 h-6 text-red-500" />,
      title: 'Anonymous Reporting',
      description: 'Our platform never collects identifying information, ensuring complete confidentiality.'
    },
    {
      icon: <Clock className="w-6 h-6 text-red-500" />,
      title: 'Auto-Destruction Options',
      description: 'Set messages and files to automatically delete after being read or after a time period.'
    },
    {
      icon: <Zap className="w-6 h-6 text-red-500" />,
      title: 'Real-Time Updates',
      description: 'Receive encrypted notifications about your case without compromising your identity.'
    },
  ];

  return (
    <section id="features" className="relative py-24 bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--tw-gradient-stops))] from-transparent via-red-950/30 to-transparent"></div>
      
      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-sm font-medium text-red-400 bg-red-950/60 rounded-full">
            Premium Security Features
          </div>
          <h2 className="heading-lg text-white mb-6">
            Built for <span className="text-red-500">Maximum Security</span> and Confidentiality
          </h2>
          <p className="text-gray-300 text-lg">
            Our platform is engineered from the ground up with security as the primary focus, ensuring whistleblower protection at every step.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/10 border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300   transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-red-950/50 flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
