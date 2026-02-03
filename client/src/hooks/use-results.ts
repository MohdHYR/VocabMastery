import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSubmitResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { score: number; grade?: string; unit?: string }) => {
      const res = await fetch(api.results.create.path, {
        method: api.results.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("You must be logged in to save results.");
        throw new Error("Failed to save result");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaderboard.list.path] });
      toast({
        title: "Result Saved!",
        description: "Your score has been added to the leaderboard.",
      });
    },
    onError: (error) => {
      toast({
        title: "Warning",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
