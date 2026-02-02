import { motion, AnimatePresence } from "framer-motion";
import { Vocabulary } from "@shared/schema";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordCardProps {
  vocabulary: Vocabulary;
  onPlayAudio: () => void;
  isPlaying: boolean;
}

export function WordCard({ vocabulary, onPlayAudio, isPlaying }: WordCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={vocabulary.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/5 relative overflow-hidden group">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Unit {vocabulary.unit} • Grade {vocabulary.grade}
              </span>
              
              <h2 className="text-6xl md:text-7xl font-display font-bold text-primary tracking-tight">
                {vocabulary.word}
              </h2>
            </div>

            <Button 
              size="lg" 
              onClick={onPlayAudio}
              disabled={isPlaying}
              className={`rounded-full h-16 w-16 p-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
            >
              <Volume2 className="h-8 w-8" />
            </Button>

            <div className="grid md:grid-cols-2 gap-8 w-full pt-8 border-t">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Definition</h3>
                <p className="text-2xl font-medium">{vocabulary.meaningEn}</p>
                <p className="text-xl text-arabic text-muted-foreground mt-1" dir="rtl">{vocabulary.meaningAr}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Usage</h3>
                <p className="text-lg italic text-foreground/80">"{vocabulary.usageEn}"</p>
                <p className="text-lg text-arabic text-muted-foreground/80" dir="rtl">{vocabulary.usageAr}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {vocabulary.synonyms && vocabulary.synonyms.map((syn, i) => (
                <span key={i} className="px-3 py-1 rounded-md bg-secondary/10 text-secondary-foreground text-sm font-medium">
                  {syn}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
