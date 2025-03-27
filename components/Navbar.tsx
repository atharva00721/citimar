"use client"
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-black/80 backdrop-blur-lg shadow-md' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-h-16 overflow-hidden">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center space-x-2 h-full">
              <Image 
                src='/logo.png' 
                alt='logo' 
                width={110} 
                height={40} 
                className='invert w-full h-full object-contain'
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/90 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-white/90 hover:text-white transition-colors">How It Works</a>
            <Link href="/explore" className="text-white/90 hover:text-white transition-colors">search </Link>
            <div className="flex items-center space-x-3">
              <Link href="/user" className="px-4 py-2 text-white/90 hover:text-white transition-colors">report now</Link>
              <Link href="/admin/login" className="px-4 py-2 bg-red-900/70 hover:bg-red-800 text-white rounded-lg transition-all">Admin Login</Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg transform transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-4">
          <a 
            href="#features" 
            className="block py-3 px-4 text-white/90 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="block py-3 px-4 text-white/90 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </a>
          <a 
            href="#trust" 
            className="block py-3 px-4 text-white/90 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Trust & Security
          </a>
          <div className="pt-2 space-y-3">
            <a 
              href="#" 
              className="block py-3 text-center px-4 text-white/90 hover:text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
            >
              User Login
            </a>
            <a 
              href="#" 
              className="block py-3 text-center px-4 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Admin Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;