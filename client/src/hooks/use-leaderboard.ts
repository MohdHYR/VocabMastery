import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useLeaderboard(filters?: { grade?: string; unit?: string }) {
  return useQuery({
    queryKey: [api.leaderboard.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.grade) params.append("grade", filters.grade);
      if (filters?.unit) params.append("unit", filters.unit);
      
      const res = await fetch(`${api.leaderboard.list.path}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return await res.json();
    },
  });
}
