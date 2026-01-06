"use client";
import React from 'react';
import { motion } from 'framer-motion';
import PixelSnow from '@/components/PixelSnow';

export default function QuizPlayPage({ question, totalQuestions, currentIdx, timer }: any) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center p-6 bg-background">
      <PixelSnow density={0.05} speed={0.3} className="z-0" />
      
      {/* Progress Header */}
      <div className="z-10 w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex flex-col gap-1 w-full max-w-xs">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Question {currentIdx + 1}/{totalQuestions}</span>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary" 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="relative flex items-center justify-center h-16 w-16">
          <svg className="absolute h-full w-full -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-secondary" />
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
              strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * timer) / 30} className="text-primary transition-all duration-1000" />
          </svg>
          <span className="text-xl font-bold">{timer}</span>
        </div>
      </div>

      <motion.div 
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="z-10 w-full max-w-2xl text-center"
      >
        <h2 className="text-3xl font-semibold mb-12 leading-tight">
          {question.text}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option: string, i: number) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={i}
              className="p-6 text-left rounded-2xl border border-border bg-card/40 hover:bg-primary/10 hover:border-primary transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-lg">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}