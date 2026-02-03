import { useState, useEffect, useRef } from "react";
import { useVocabularies } from "@/hooks/use-vocabularies";
import { useSubmitResult } from "@/hooks/use-results";
import { NavBar } from "@/components/NavBar";
import { WordCard } from "@/components/WordCard";
import { fireConfetti } from "@/components/Confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ArrowRight, Check, X, Trophy, RefreshCw, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Vocabulary } from "@shared/schema";

import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

type Step = "select" | "learning" | "dictation" | "mcq" | "summary";

export default function Learn() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("select");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [score, setScore] = useState(0);
  const [showTestSelection, setShowTestSelection] = useState(false);

  // Data Fetching
  const { data: vocabularies, isLoading } = useVocabularies(
    step !== "select" ? { grade: selectedGrade, unit: selectedUnit } : undefined
  );
  
  // Mutation
  const submitResult = useSubmitResult();

  // Reset state when restarting
  const restart = () => {
    setStep("select");
    setCurrentIndex(0);
    setScore(0);
    setSelectedGrade("");
    setSelectedUnit("");
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Please sign in to start your learning journey and track your progress.</p>
            <Link href="/auth">
              <Button className="w-full">Sign In to Learn</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && step !== "select") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading your lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        <AnimatePresence mode="wait">
          {step === "select" && (
            <SelectionScreen 
              key="select"
              onStart={(grade, unit) => {
                setSelectedGrade(grade);
                setSelectedUnit(unit);
                setStep("learning");
              }} 
            />
          )}

          {step === "learning" && vocabularies && (
            <div className="flex flex-col flex-1">
              <div className="flex justify-center mb-6">
                <Button 
                  onClick={() => setShowTestSelection(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-2 rounded-full shadow-lg"
                  data-testid="button-take-test"
                >
                  Take the Test
                </Button>
              </div>

              <LearningPhase 
                key="learning"
                vocabularies={vocabularies} 
                onComplete={() => {
                  setCurrentIndex(0);
                  setStep("dictation");
                }}
              />

              <Dialog open={showTestSelection} onOpenChange={setShowTestSelection}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-center">Choose a Test</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4 pt-4">
                    <Button 
                      className="h-24 text-xl flex flex-col gap-2"
                      onClick={() => {
                        setShowTestSelection(false);
                        setStep("dictation");
                      }}
                      data-testid="button-select-dictation"
                    >
                      <Volume2 className="h-6 w-6" />
                      Dictation Test
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-24 text-xl flex flex-col gap-2"
                      onClick={() => {
                        setShowTestSelection(false);
                        setStep("mcq");
                      }}
                      data-testid="button-select-mcq"
                    >
                      <Check className="h-6 w-6" />
                      Multiple Choice
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {step === "dictation" && vocabularies && (
            <DictationTest 
              key="dictation"
              vocabularies={vocabularies}
              onScore={(points) => setScore(prev => prev + points)}
              onComplete={() => {
                setCurrentIndex(0);
                setStep("mcq");
              }}
            />
          )}

          {step === "mcq" && vocabularies && (
            <MCQTest 
              key="mcq"
              vocabularies={vocabularies}
              onScore={(points) => setScore(prev => prev + points)}
              onComplete={() => {
                submitResult.mutate(score); // Save score
                setStep("summary");
              }}
            />
          )}

          {step === "summary" && (
            <SummaryScreen 
              key="summary"
              score={score}
              totalPossible={(vocabularies?.length || 0) * 20} // 10 pts per dictation + 10 pts per MCQ
              onRestart={restart}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// === SUB-COMPONENTS ===

function SelectionScreen({ onStart }: { onStart: (grade: string, unit: string) => void }) {
  const [grade, setGrade] = useState("");
  const [unit, setUnit] = useState("");

  // In a real app, we might fetch available grades/units from API
  // For now, let's hardcode some options or allow text input if desired
  // Assuming simple text inputs for flexibility as per prompt requirements
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center flex-1 min-h-[60vh] text-center space-y-8"
    >
      <div>
        <h1 className="text-4xl font-display font-bold mb-4">Choose Your Lesson</h1>
        <p className="text-muted-foreground text-lg">Select a grade and unit to begin mastering new words.</p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-2">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium">Grade Level</label>
            <Input 
              placeholder="e.g. 5" 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium">Unit Number</label>
            <Input 
              placeholder="e.g. 1" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <Button 
            size="lg" 
            className="w-full h-12 text-lg font-bold"
            disabled={!grade || !unit}
            onClick={() => onStart(grade, unit)}
          >
            Start Learning
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LearningPhase({ vocabularies, onComplete }: { vocabularies: Vocabulary[], onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentWord = vocabularies[index];

  const playAudioSequence = () => {
    if (isPlaying || !currentWord) return;
    setIsPlaying(true);

    const speak = (text: string, rate: number, delayAfter: number) => {
      return new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = rate;
        u.onend = () => setTimeout(resolve, delayAfter);
        window.speechSynthesis.speak(u);
      });
    };

    (async () => {
      await speak(currentWord.word, 1.0, 500); // Normal
      await speak(currentWord.word, 0.5, 500); // Slow
      await speak(currentWord.word, 1.0, 0);    // Normal
      setIsPlaying(false);
    })();
  };

  // Auto-play on mount/change
  useEffect(() => {
    // Small timeout to allow transition
    const t = setTimeout(playAudioSequence, 500);
    return () => {
      clearTimeout(t);
      window.speechSynthesis.cancel();
    };
  }, [index]); // Explicitly depend on index to play when it changes

  const next = () => {
    window.speechSynthesis.cancel();
    if (index < vocabularies.length - 1) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    window.speechSynthesis.cancel();
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8">
      <div className="w-full max-w-2xl flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>Learning Mode</span>
        <span>{index + 1} / {vocabularies.length}</span>
      </div>
      
      <div className="relative w-full max-w-3xl flex items-center gap-4">
        <Button
          variant="default"
          size="icon"
          className="rounded-full h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
          onClick={prev}
          disabled={index === 0}
          data-testid="button-prev-word"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <WordCard 
          vocabulary={currentWord} 
          onPlayAudio={playAudioSequence}
          isPlaying={isPlaying}
        />

        <Button
          variant="default"
          size="icon"
          className="rounded-full h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
          onClick={next}
          disabled={index === vocabularies.length - 1}
          data-testid="button-next-word"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}

function DictationTest({ vocabularies, onScore, onComplete }: { vocabularies: Vocabulary[], onScore: (n: number) => void, onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const currentWord = vocabularies[index];

  const playWord = () => {
    const u = new SpeechSynthesisUtterance(currentWord.word);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
    // Speak twice as per request
    const u2 = new SpeechSynthesisUtterance(currentWord.word);
    u2.rate = 0.9;
    window.speechSynthesis.speak(u2);
  };

  useEffect(() => {
    playWord();
  }, [currentWord]);

  const checkAnswer = () => {
    if (input.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('correct');
      onScore(10);
      fireConfetti();
      // Simple "WOW" sound effect could go here, or handled by confetti visual is enough for MVP
      // new Audio('/wow.mp3').play().catch(() => {}); 
    } else {
      setStatus('wrong');
    }
  };

  const next = () => {
    setInput("");
    setStatus('idle');
    if (index < vocabularies.length - 1) {
      setIndex(index + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8 max-w-xl mx-auto w-full">
      <div className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>Dictation Test</span>
        <span>{index + 1} / {vocabularies.length}</span>
      </div>

      <Card className="w-full border-2">
        <CardHeader className="text-center pb-2">
          <CardTitle>Listen and Type</CardTitle>
          <p className="text-muted-foreground text-sm">Type the word you hear.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-6">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-20 w-20 rounded-full"
            onClick={playWord}
          >
            <Volume2 className="h-8 w-8" />
          </Button>

          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && status === 'idle' && checkAnswer()}
            placeholder="Type here..." 
            className="text-center text-2xl h-16 font-medium"
            autoFocus
            disabled={status !== 'idle'}
          />

          {status === 'idle' && (
            <Button onClick={checkAnswer} size="lg" className="w-full">Check Answer</Button>
          )}

          {status === 'correct' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4 w-full"
            >
              <div className="text-green-600 font-bold text-2xl flex items-center justify-center gap-2">
                <Check className="h-8 w-8" /> WOW!
              </div>
              <Button onClick={next} variant="default" className="w-full bg-green-600 hover:bg-green-700">Next Word</Button>
            </motion.div>
          )}

          {status === 'wrong' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center space-y-4 w-full"
            >
              <div className="text-orange-500 font-bold text-lg flex items-center justify-center gap-2">
                <X className="h-6 w-6" /> You can do it! Try again?
              </div>
              <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">Try Again</Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function MCQTest({ vocabularies, onScore, onComplete }: { vocabularies: Vocabulary[], onScore: (n: number) => void, onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const currentWord = vocabularies[index];

  useEffect(() => {
    // Generate options: correct word + 3 random distractors
    const allWords = vocabularies.map(v => v.word);
    const distractors = allWords.filter(w => w !== currentWord.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const shuffled = [currentWord.word, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(shuffled);
    setSelected(null);
  }, [currentWord, vocabularies]);

  const handleSelect = (option: string) => {
    if (selected) return; // Prevent changing answer
    setSelected(option);
    
    if (option === currentWord.word) {
      onScore(10);
      fireConfetti();
    }
    
    // Auto advance after short delay
    setTimeout(() => {
      if (index < vocabularies.length - 1) {
        setIndex(index + 1);
      } else {
        onComplete();
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8 max-w-2xl mx-auto w-full">
      <div className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>Multiple Choice</span>
        <span>{index + 1} / {vocabularies.length}</span>
      </div>

      <div className="w-full space-y-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-medium mb-2">What matches this definition?</h3>
            <p className="text-2xl font-bold text-primary">{currentWord.meaningEn}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => {
            const isSelected = selected === option;
            const isCorrect = option === currentWord.word;
            // Reveal correct answer if selection made
            const showCorrect = selected && isCorrect;
            const showWrong = isSelected && !isCorrect;

            return (
              <Button
                key={option}
                variant="outline"
                className={`h-20 text-xl font-medium transition-all ${
                  showCorrect ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-100' :
                  showWrong ? 'bg-red-100 border-red-500 text-red-700 hover:bg-red-100' :
                  'hover:border-primary hover:bg-primary/5'
                }`}
                onClick={() => handleSelect(option)}
                disabled={!!selected}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryScreen({ score, totalPossible, onRestart }: { score: number, totalPossible: number, onRestart: () => void }) {
  useEffect(() => {
    if (score / totalPossible > 0.7) {
      fireConfetti();
    }
  }, []);

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center flex-1 text-center space-y-8"
    >
      <div className="bg-yellow-100 p-8 rounded-full">
        <Trophy className="h-16 w-16 text-yellow-600" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-display">Lesson Complete!</h1>
        <p className="text-muted-foreground text-lg">You've mastered this unit.</p>
      </div>

      <Card className="w-full max-w-sm border-2">
        <CardContent className="pt-8 pb-8 space-y-4">
          <div className="text-center">
            <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Total Score</span>
            <div className="text-6xl font-bold text-primary mt-2">
              {score} <span className="text-2xl text-muted-foreground">/ {totalPossible}</span>
            </div>
          </div>
          <Progress value={(score / totalPossible) * 100} className="h-3" />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button size="lg" onClick={() => window.location.href = '/'} variant="outline">
          Back Home
        </Button>
        <Button size="lg" onClick={onRestart}>
          <RefreshCw className="mr-2 h-4 w-4" /> Try Another Unit
        </Button>
      </div>
    </motion.div>
  );
}
