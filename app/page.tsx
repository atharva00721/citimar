"use  client";
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Trust from "../components/Trust";
import Footer from "../components/Footer";

export default function Page(){

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-red-200">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Trust />
      <Footer />
    </div>
  );
};

