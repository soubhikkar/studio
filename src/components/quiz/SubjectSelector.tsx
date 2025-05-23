"use client";

import type { Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Calculator, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubjectSelectorProps {
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject) => void;
}

const subjectsConfig: { name: Subject; icon: React.ElementType; description: string }[] = [
  { name: 'Math', icon: Calculator, description: 'Test your numerical and problem-solving skills.' },
  { name: 'English', icon: BookOpen, description: 'Challenge your grammar, vocabulary, and comprehension.' },
];

export function SubjectSelector({ selectedSubject, onSelectSubject }: SubjectSelectorProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Welcome to QuizWhiz!</CardTitle>
        <p className="text-center text-muted-foreground pt-1">Choose a subject to start your quiz.</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {subjectsConfig.map((subjectItem) => (
          <Button
            key={subjectItem.name}
            variant={selectedSubject === subjectItem.name ? 'default' : 'outline'}
            onClick={() => onSelectSubject(subjectItem.name)}
            className="w-full py-6 rounded-lg transition-all duration-200 ease-in-out transform hover:shadow-md focus:ring-2 focus:ring-accent"
            size="lg"
          >
            <div className="flex items-center justify-start w-full">
              <subjectItem.icon className="mr-4 h-7 w-7 text-primary group-hover:text-primary-foreground" />
              <div className="text-left">
                <span className="text-lg font-semibold">{subjectItem.name}</span>
                <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">{subjectItem.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
