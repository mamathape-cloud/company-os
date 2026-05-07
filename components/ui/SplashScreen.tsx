"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  message: string;
  onComplete: () => void;
}

export default function SplashScreen({ message, onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete();
    }, 2300);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary">
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-bold text-white"
      >
        {message}
      </motion.h1>
    </div>
  );
}
