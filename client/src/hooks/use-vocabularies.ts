import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { InsertVocabulary } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useVocabularies(filters?: { grade?: string; unit?: string }) {
  return useQuery({
    queryKey: ["/api/vocabularies", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.grade) params.grade = filters.grade;
      if (filters?.unit) params.unit = filters.unit;

      const queryString = new URLSearchParams(params).toString();
      const url = `/api/vocabularies${queryString ? `?${queryString}` : ""}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch vocabularies");
      return await res.json();
    },
    enabled: true, 
  });
}

export function useCreateVocabulary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertVocabulary) => {
      const res = await fetch("/api/vocabularies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to create vocabulary");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabularies"] });
      toast({
        title: "Success",
        description: "Vocabulary word added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBulkCreateVocabulary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertVocabulary[]) => {
      const res = await fetch("/api/vocabularies/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to upload vocabulary");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabularies"] });
      toast({
        title: "Bulk Upload Complete",
        description: `Successfully added ${data.length} words.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
