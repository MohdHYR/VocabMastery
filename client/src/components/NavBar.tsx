import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Trophy, 
  Settings, 
  LogOut, 
  User as UserIcon,
  GraduationCap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function NavBar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="border-b bg-card text-card-foreground sticky top-0 z-[100] shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-1.5 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">VocabMastery</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant={location === "/" ? "secondary" : "ghost"} size="sm" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
          </Link>
          
          <Link href="/learn">
            <Button variant={location === "/learn" ? "secondary" : "ghost"} size="sm" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Learn</span>
            </Button>
          </Link>

          <div className="h-6 w-px bg-border mx-2" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <div className="flex items-center justify-start gap-2 p-2 mb-2 border-b">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.isAdmin ? "Administrator" : "Student"}</p>
                  </div>
                </div>
                
                {user.isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Teacher Dashboard
                    </DropdownMenuItem>
                  </Link>
                )}
                
                <DropdownMenuItem 
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer" 
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  Student Sign In
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  Teacher Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
