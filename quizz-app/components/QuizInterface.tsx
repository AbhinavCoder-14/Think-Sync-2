"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface QuizProps {
  problem: {
    problemId: string;
    title: string;
    image?: string;
    options: { id: number; title: string }[];
  };
  onSubmit: (answer: number) => void;
  timer?: number;
}

export default function Quiz({ problem, onSubmit, timer = 20 }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selected !== null) {
      onSubmit(selected);
      setSelected(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-3xl space-y-8">
        {/* Timer */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Question {problem.problemId}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: timer, ease: 'linear' }}
              />
            </div>
            <span className="text-sm font-mono">{timer}s</span>
          </div>
        </div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            {problem.title}
          </h2>

          {/* Options */}
          <div className="grid gap-3">
            {problem.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`
                  w-full p-4 text-left rounded-lg border transition-all
                  ${
                    selected === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card/40 hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    h-5 w-5 rounded-full border-2 flex items-center justify-center
                    ${
                      selected === option.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }
                  `}
                  >
                    {selected === option.id && (
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span className="text-base">{option.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={selected === null}
            className="w-full"
            size="lg"
          >
            Submit Answer
          </Button>
        </motion.div>
      </div>
    </div>
  );
}