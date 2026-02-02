import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertVocabulary } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useVocabularies(filters?: { grade?: string; unit?: string }) {
  return useQuery({
    queryKey: [api.vocabularies.list.path, filters],
    queryFn: async () => {
      // Clean undefined filters
      const params: Record<string, string> = {};
      if (filters?.grade) params.grade = filters.grade;
      if (filters?.unit) params.unit = filters.unit;

      const queryString = new URLSearchParams(params).toString();
      const url = `${api.vocabularies.list.path}${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch vocabularies");
      return api.vocabularies.list.responses[200].parse(await res.json());
    },
    enabled: true, 
  });
}

export function useCreateVocabulary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertVocabulary) => {
      const res = await fetch(api.vocabularies.create.path, {
        method: api.vocabularies.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to create vocabulary");
      }
      return api.vocabularies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vocabularies.list.path] });
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
      const res = await fetch(api.vocabularies.bulkCreate.path, {
        method: api.vocabularies.bulkCreate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to upload vocabulary");
      }
      return api.vocabularies.bulkCreate.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.vocabularies.list.path] });
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
