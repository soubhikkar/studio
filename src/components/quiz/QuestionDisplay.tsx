"use client";

import type { QuizQuestion } from '@/types';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react'; // For visual feedback

interface QuestionDisplayProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onAnswerSelect: (answerId: string) => void;
  isSubmitted: boolean; // To show correct/incorrect answers
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  isSubmitted,
}: QuestionDisplayProps) {
  return (
    <Card className="w-full transition-all duration-300 ease-in-out shadow-lg rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-baseline">
          <CardTitle className="text-xl md:text-2xl text-primary">Question {questionNumber}</CardTitle>
          <span className="text-sm text-muted-foreground">of {totalQuestions}</span>
        </div>
        <CardDescription className="text-lg md:text-xl pt-3 font-medium text-foreground">{question.text}</CardDescription>
      </CardHeader>
      <CardContent>
        {question.imageUrl && (
          <div className="my-4 rounded-lg overflow-hidden shadow-md aspect-video relative">
            <Image
              src={question.imageUrl}
              alt={`Illustration for ${question.subject} question: ${question.dataAiHint || 'quiz image'}`}
              data-ai-hint={question.dataAiHint || 'quiz illustration'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={questionNumber <= 2} // Prioritize first few images
            />
          </div>
        )}
        <RadioGroup
          value={selectedAnswer}
          onValueChange={onAnswerSelect}
          className="space-y-3 mt-6"
          disabled={isSubmitted} // Disable radio group after submission
        >
          {question.options.map((option, index) => {
            const isCorrect = option.id === question.correctAnswerId;
            const isSelected = option.id === selectedAnswer;
            
            let itemStyles = "border-input hover:border-primary";
            let feedbackIcon = null;

            if (isSubmitted) {
              if (isCorrect) {
                itemStyles = "border-green-500 bg-green-500/10 text-green-700 hover:border-green-600";
                if (isSelected) feedbackIcon = <CheckCircle className="h-5 w-5 text-green-600" />;
              } else if (isSelected && !isCorrect) {
                itemStyles = "border-destructive bg-destructive/10 text-destructive hover:border-red-600";
                feedbackIcon = <XCircle className="h-5 w-5 text-destructive" />;
              } else {
                 itemStyles = "border-input opacity-70"; // Mute unselected incorrect options
              }
            }

            return (
              <Label
                key={option.id}
                htmlFor={`${question.id}-option-${option.id}`}
                className={`flex items-center space-x-3 p-4 border rounded-lg transition-all duration-200 ease-in-out cursor-pointer ${itemStyles} ${isSubmitted && !isSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <RadioGroupItem 
                  value={option.id} 
                  id={`${question.id}-option-${option.id}`} 
                  className={`h-5 w-5 ${isSubmitted && isCorrect ? 'border-green-500 text-green-600 focus-visible:ring-green-500' : isSubmitted && isSelected && !isCorrect ? 'border-destructive text-destructive focus-visible:ring-destructive' : 'text-primary focus:ring-primary'}`} 
                />
                <span className="flex-1 text-sm md:text-base">
                  {String.fromCharCode(65 + index)}. {option.text}
                </span>
                {isSubmitted && isSelected && feedbackIcon}
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
