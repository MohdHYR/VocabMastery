import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVocabularySchema } from "@shared/schema";
import { useCreateVocabulary, useBulkCreateVocabulary } from "@/hooks/use-vocabularies";
import { NavBar } from "@/components/NavBar";
import Papa from "papaparse";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, FileUp, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for form (handling arrays as strings for input)
const formSchema = insertVocabularySchema.extend({
  antonyms: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),
  synonyms: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),
});

type FormData = z.input<typeof formSchema>;

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  
  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You do not have permission to view this page.</p>
        <Button onClick={() => window.location.href = '/'}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage vocabulary and track student progress.</p>
        </div>

        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload (CSV)</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <ManualEntryForm />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkUploadForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ManualEntryForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  
  const createVocabulary = useCreateVocabulary();

  const onSubmit = (data: FormData) => {
    // The resolver handles the transformation of comma-separated strings to arrays
    // But react-hook-form passes the Transformed data to onSubmit.
    // However, insertVocabularySchema expects arrays. 
    // zodResolver returns the OUTPUT type of the schema.
    
    // We need to cast because RHF types are tricky with transformations
    createVocabulary.mutate(data as any, {
      onSuccess: () => reset()
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Word</CardTitle>
        <CardDescription>Enter details for a single vocabulary item.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Input id="grade" placeholder="e.g. 5" {...register("grade")} />
              {errors.grade && <p className="text-sm text-destructive">{errors.grade.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" placeholder="e.g. 1" {...register("unit")} />
              {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input id="word" placeholder="e.g. Magnificent" className="text-lg font-medium" {...register("word")} />
            {errors.word && <p className="text-sm text-destructive">{errors.word.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meaningEn">Meaning (English)</Label>
              <Textarea id="meaningEn" placeholder="Definition in English..." {...register("meaningEn")} />
              {errors.meaningEn && <p className="text-sm text-destructive">{errors.meaningEn.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="meaningAr">Meaning (Arabic)</Label>
              <Textarea id="meaningAr" dir="rtl" placeholder="التعريف بالعربية..." className="text-right font-arabic" {...register("meaningAr")} />
              {errors.meaningAr && <p className="text-sm text-destructive">{errors.meaningAr.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usageEn">Usage (English)</Label>
              <Input id="usageEn" placeholder="Example sentence..." {...register("usageEn")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageAr">Usage (Arabic)</Label>
              <Input id="usageAr" dir="rtl" placeholder="مثال بالعربية..." className="text-right font-arabic" {...register("usageAr")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="synonyms">Synonyms (comma separated)</Label>
              <Input id="synonyms" placeholder="great, grand, superb" {...register("synonyms")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="antonyms">Antonyms (comma separated)</Label>
              <Input id="antonyms" placeholder="bad, poor, humble" {...register("antonyms")} />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || createVocabulary.isPending} className="w-full">
            {(isSubmitting || createVocabulary.isPending) ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Word
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BulkUploadForm() {
  const bulkCreate = useBulkCreateVocabulary();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Transform CSV data to match schema
          const formattedData = results.data.map((row: any) => ({
            grade: row.grade,
            unit: row.unit,
            word: row.word,
            meaningEn: row.meaning_en,
            meaningAr: row.meaning_ar,
            usageEn: row.usage_en,
            usageAr: row.usage_ar,
            synonyms: row.synonyms ? row.synonyms.split(',').map((s: string) => s.trim()) : [],
            antonyms: row.antonyms ? row.antonyms.split(',').map((s: string) => s.trim()) : [],
          }));

          // Validate with Zod array
          const validationResult = z.array(insertVocabularySchema).safeParse(formattedData);
          
          if (!validationResult.success) {
            console.error(validationResult.error);
            toast({
              title: "Validation Error",
              description: "CSV format is incorrect. Check console for details.",
              variant: "destructive"
            });
            return;
          }

          bulkCreate.mutate(validationResult.data);
        } catch (err) {
          toast({
            title: "Parsing Error",
            description: "Failed to parse CSV file.",
            variant: "destructive"
          });
        }
      },
      error: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload</CardTitle>
        <CardDescription>Upload a CSV file with headers: grade, unit, word, meaning_en, meaning_ar, synonyms, antonyms, usage_en, usage_ar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 hover:bg-muted/10 transition-colors">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <Label htmlFor="csv-upload" className="cursor-pointer">
            <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Select CSV File
            </span>
            <Input 
              id="csv-upload" 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </Label>
          {file && <p className="mt-4 text-sm font-medium">{file.name}</p>}
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!file || bulkCreate.isPending} 
          className="w-full"
        >
          {bulkCreate.isPending ? <Loader2 className="animate-spin mr-2" /> : <FileUp className="mr-2 h-4 w-4" />}
          Upload and Process
        </Button>
      </CardContent>
    </Card>
  );
}
