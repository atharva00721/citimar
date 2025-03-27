import React from 'react';
import { ShieldCheck, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center mr-3">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Aegis</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering transparency through secure, anonymous whistleblowing solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#trust" className="text-gray-400 hover:text-white transition-colors">Trust & Security</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR Compliance</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5">Contact</h3>
            <p className="text-gray-400 mb-4">
              Have questions about our platform?
            </p>
            <a 
              href="mailto:info@aegis.com" 
              className="inline-block px-5 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-white transition-colors mb-4 border border-gray-800"
            >
              Contact Support
            </a>
            <p className="text-xs text-gray-500">
              For security reasons, we do not offer phone support.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Aegis. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">
                Accessibility
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">
                FAQ
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;