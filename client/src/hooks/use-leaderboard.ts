import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useLeaderboard(filters?: { grade?: string[]; unit?: string[] }) {
  return useQuery({
    queryKey: [api.leaderboard.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.grade && filters.grade.length > 0) {
        filters.grade.forEach(g => params.append("grade", g));
      }
      if (filters?.unit && filters.unit.length > 0) {
        filters.unit.forEach(u => params.append("unit", u));
      }
      
      const res = await fetch(`${api.leaderboard.list.path}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return await res.json();
    },
  });
}
