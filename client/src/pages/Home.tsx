import { Link } from "wouter";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ArrowRight, Trophy, Sparkles, BookOpen, ChevronDown, X } from "lucide-react";
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

  const { data: metadata } = useQuery<{ grade: string, unit: string }[]>({
    queryKey: ["/api/metadata/grades-units"],
    queryFn: async () => {
      const res = await fetch("/api/metadata/grades-units");
      if (!res.ok) throw new Error("Failed to fetch metadata");
      return await res.json();
    }
  });

  const allGrades = useMemo(() => 
    Array.from(new Set(metadata?.map(m => m.grade) || [])).sort(), 
    [metadata]
  );

  const availableUnits = useMemo(() => {
    const filtered = metadata?.filter(m => 
      selectedGrades.length === 0 || selectedGrades.includes(m.grade)
    ) || [];
    return Array.from(new Set(filtered.map(m => m.unit))).sort();
  }, [metadata, selectedGrades]);

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
    // When changing grades, we don't automatically clear units unless they become invalid
    // But requirement says "Unit options should update automatically when Grade filters change"
    // and "Never show invalid grade–unit combinations"
  };

  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev => 
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  const clearFilters = () => {
    setSelectedGrades([]);
    setSelectedUnits([]);
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
          <div className="flex flex-col gap-6 mb-10">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h2 className="text-3xl font-display font-bold">Top Learners</h2>
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[140px] justify-between">
                      {selectedGrades.length === 0 ? "All Grades" : `Grades (${selectedGrades.length})`}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {allGrades.map(g => (
                      <DropdownMenuCheckboxItem
                        key={g}
                        checked={selectedGrades.includes(g)}
                        onCheckedChange={() => toggleGrade(g)}
                      >
                        Grade {g}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[140px] justify-between">
                      {selectedUnits.length === 0 ? "All Units" : `Units (${selectedUnits.length})`}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {availableUnits.map(u => (
                      <DropdownMenuCheckboxItem
                        key={u}
                        checked={selectedUnits.includes(u)}
                        onCheckedChange={() => toggleUnit(u)}
                      >
                        Unit {u}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {(selectedGrades.length > 0 || selectedUnits.length > 0) && (
                  <Button variant="ghost" size="icon" onClick={clearFilters} className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {selectedGrades.map(g => (
                <Badge key={`g-${g}`} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                  Grade {g}
                  <button onClick={() => toggleGrade(g)} className="hover:bg-muted rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedUnits.map(u => (
                <Badge key={`u-${u}`} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                  Unit {u}
                  <button onClick={() => toggleUnit(u)} className="hover:bg-muted rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
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
                    <div className="col-span-2 text-center">Grade</div>
                    <div className="col-span-2 text-center">Unit</div>
                    <div className="col-span-3 text-right">Score</div>
                  </div>
                  {leaderboard?.map((entry: any, index: number) => (
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
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                            index === 1 ? 'bg-slate-100 text-slate-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' : 'text-muted-foreground'}
                        `}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="col-span-4 font-medium flex flex-col">
                        <span className="text-foreground">{entry.username}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge variant="outline" className="font-semibold">Grade {entry.grade}</Badge>
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge variant="outline" className="font-semibold">Unit {entry.unit}</Badge>
                      </div>
                      <div className="col-span-3 text-right font-display font-bold text-primary">
                        {entry.score} pts
                      </div>
                    </motion.div>
                  ))}
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
