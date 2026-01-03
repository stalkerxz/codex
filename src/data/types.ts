export type Lesson = {
  id: string;
  title: string;
  concept: string;
  whyItMatters: string;
  mission: string;
  checklistItems: string[];
  examplePrompt: string;
};

export type UserProgress = {
  lessonId: string;
  uploadedImage?: Blob;
  checklistCheckedStates: boolean[];
  mastered: boolean;
  completedAt?: string;
};
