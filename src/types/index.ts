export interface AnswerOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  subject: Subject;
  text: string;
  imageUrl?: string;
  dataAiHint?: string;
  options: AnswerOption[];
  correctAnswerId: string;
}

export type Subject = 'Math' | 'English';
