import { Link } from "wouter";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Trophy, Sparkles, BookOpen, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { NavBar } from "@/components/NavBar";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  
  const { data: leaderboard, isLoading } = useLeaderboard({ 
    grade: selectedGrades, 
    unit: selectedUnits 
  });

  // Fetch all scores to determine available filters in the leaderboard
  const { data: allScores } = useLeaderboard({});

  const allGrades = useMemo(() => 
    Array.from(new Set(allScores?.map(m => String(m.grade)) || [])).sort(), 
    [allScores]
  );

  const allUnits = useMemo(() => 
    Array.from(new Set(allScores?.map(m => String(m.unit)) || [])).sort(), 
    [allScores]
  );

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev => 
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  const toggleAllGrades = () => {
    if (selectedGrades.length === allGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades([...allGrades]);
    }
  };

  const toggleAllUnits = () => {
    if (selectedUnits.length === allUnits.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits([...allUnits]);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-muted/50 -z-10" />
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm mb-6">
              Master Vocabulary the Fun Way
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 text-primary pb-2">
              Elevate Your English Skills
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students learning new words through interactive lessons, 
              dictation tests, and gamified challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/learn">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:scale-105 transition-all">
                  Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted">
                  Teacher Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="h-8 w-8 text-primary" />}
              title="Interactive Learning"
              description="Listen to pronunciations and see contextual usage for every word."
            />
            <FeatureCard 
              icon={<Sparkles className="h-8 w-8 text-secondary" />}
              title="Gamified Tests"
              description="Earn points through dictation and multiple choice challenges."
            />
            <FeatureCard 
              icon={<Trophy className="h-8 w-8 text-accent" />}
              title="Compete & Win"
              description="Climb the leaderboard and show off your vocabulary mastery."
            />
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-10">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-display font-bold">Top Learners</h2>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading scores...</div>
              ) : (
                <div className="divide-y overflow-x-auto">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[600px]">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-4">Student</div>
                    
                    <div className="col-span-2 text-center flex items-center justify-center gap-1">
                      <span>Grade</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 hover:bg-muted-foreground/10 ${selectedGrades.length > 0 ? 'text-primary' : ''}`}>
                            <Filter className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-48 p-2" 
                          align="center" 
                          onInteractOutside={(e) => {
                            // Standard popover behavior for clicking completely outside
                          }}
                        >
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <h4 className="font-medium text-sm px-2 py-1 border-b">Filter Grade</h4>
                            <div className="max-h-60 overflow-y-auto px-1 pt-1">
                              <div 
                                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer border-b mb-1" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleAllGrades();
                                }}
                              >
                                <Checkbox 
                                  checked={allGrades.length > 0 && selectedGrades.length === allGrades.length} 
                                  onCheckedChange={() => {}} 
                                />
                                <span className="text-sm font-bold">Select All</span>
                              </div>
                              {allGrades.map(g => (
                                <div 
                                  key={g} 
                                  className="flex items-center space-x-2 px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleGrade(g);
                                  }}
                                >
                                  <Checkbox checked={selectedGrades.includes(g)} onCheckedChange={() => {}} />
                                  <span className="text-sm">Grade {g}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="col-span-2 text-center flex items-center justify-center gap-1">
                      <span>Unit</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 hover:bg-muted-foreground/10 ${selectedUnits.length > 0 ? 'text-primary' : ''}`}>
                            <Filter className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-48 p-2" 
                          align="center"
                          onInteractOutside={(e) => {
                            // Standard popover behavior for clicking completely outside
                          }}
                        >
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <h4 className="font-medium text-sm px-2 py-1 border-b">Filter Unit</h4>
                            <div className="max-h-60 overflow-y-auto px-1 pt-1">
                              <div 
                                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer border-b mb-1" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleAllUnits();
                                }}
                              >
                                <Checkbox 
                                  checked={allUnits.length > 0 && selectedUnits.length === allUnits.length} 
                                  onCheckedChange={() => {}} 
                                />
                                <span className="text-sm font-bold">Select All</span>
                              </div>
                              {allUnits.map(u => (
                                <div 
                                  key={u} 
                                  className="flex items-center space-x-2 px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleUnit(u);
                                  }}
                                >
                                  <Checkbox checked={selectedUnits.includes(u)} onCheckedChange={() => {}} />
                                  <span className="text-sm">Unit {u}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="col-span-3 text-right">Score</div>
                  </div>

                  {leaderboard?.map((entry: any, index: number) => {
                    // Recalculate rank handling ties
                    let rank = index + 1;
                    if (index > 0 && entry.score === leaderboard[index - 1].score) {
                      // Find the first index with this score
                      let firstIdx = index;
                      while (firstIdx > 0 && leaderboard[firstIdx - 1].score === entry.score) {
                        firstIdx--;
                      }
                      rank = firstIdx + 1;
                    }

                    return (
                      <motion.div 
                        key={`${entry.username}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors min-w-[600px]"
                      >
                        <div className="col-span-1 flex justify-center">
                          <span className={`
                            flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold
                            ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                              rank === 2 ? 'bg-slate-100 text-slate-700' :
                              rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-muted-foreground'}
                          `}>
                            {rank}
                          </span>
                        </div>
                        <div className="col-span-4 font-medium flex flex-col">
                          <span className="text-foreground">{entry.username}</span>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="col-span-2 text-center text-sm font-semibold text-muted-foreground">
                          <Badge variant="outline" className="font-mono">{entry.grade}</Badge>
                        </div>
                        <div className="col-span-2 text-center text-sm font-semibold text-muted-foreground">
                          <Badge variant="outline" className="font-mono">{entry.unit}</Badge>
                        </div>
                        <div className="col-span-3 text-right font-display font-bold text-primary">
                          {entry.score} pts
                        </div>
                      </motion.div>
                    );
                  })}
                  {leaderboard?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No scores yet. Be the first!</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-muted border border-border hover:border-primary transition-colors duration-300">
      <div className="mb-4 bg-white w-16 h-16 rounded-xl shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
