"use client";

import { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion, Subject } from '@/types';
import { getQuestionsBySubject } from '@/lib/quiz-data';
import { personalizeDifficulty, type PersonalizeDifficultyInput, type PersonalizeDifficultyOutput } from '@/ai/flows/personalize-difficulty';

import { QuestionDisplay } from './QuestionDisplay';
import { SubjectSelector } from './SubjectSelector';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw, CheckCircle, XCircle, BookOpenText, Brain } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const TOTAL_QUESTIONS_PER_QUIZ = 10;

export function QuizClient() {
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAi, setIsSubmittingAi] = useState(false); // For AI call specifically
  const [difficultyAdjustment, setDifficultyAdjustment] = useState<string | null>(null);

  const { toast } = useToast();

  const resetQuizState = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(null);
    setQuizCompleted(false);
    setDifficultyAdjustment(null);
    setIsSubmittingAi(false);
  };

  const loadQuestions = useCallback((subject: Subject) => {
    setIsLoading(true);
    resetQuizState();
    setTimeout(() => {
      const subjectQuestions = getQuestionsBySubject(subject);
      setQuestions(subjectQuestions.slice(0, TOTAL_QUESTIONS_PER_QUIZ));
      setIsLoading(false);
    }, 300); // Simulate API delay
  }, []);

  useEffect(() => {
    if (currentSubject) {
      loadQuestions(currentSubject);
    }
  }, [currentSubject, loadQuestions]);

  const handleSubjectSelect = (subject: Subject) => {
    setCurrentSubject(subject);
  };

  const handleAnswerSelect = (answerId: string) => {
    if (quizCompleted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answerId,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finalizeQuiz();
    }
  };
  
  const finalizeQuiz = async () => {
    let calculatedScore = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerId) {
        calculatedScore++;
      }
    });
    const finalScorePercentage = (calculatedScore / questions.length) * 100;
    setScore(finalScorePercentage);
    setQuizCompleted(true);
    
    setIsSubmittingAi(true);
    try {
      const input: PersonalizeDifficultyInput = {
        userId: 'user_mock_001', 
        score: finalScorePercentage,
      };
      const result: PersonalizeDifficultyOutput = await personalizeDifficulty(input);
      setDifficultyAdjustment(result.suggestedDifficultyAdjustment);
      toast({
        title: "AI Difficulty Suggestion",
        description: (
            <div className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                <span>Next quiz difficulty: <strong>{result.suggestedDifficultyAdjustment.toLowerCase()}</strong></span>
            </div>
        ),
        duration: 6000,
      });
    } catch (error) {
      console.error("Error personalizing difficulty:", error);
      toast({
        title: "AI Error",
        description: "Could not get difficulty suggestion at this time.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAi(false);
    }
  };

  const handleRestartQuiz = () => {
    if (currentSubject) {
        loadQuestions(currentSubject);
    }
  };
  
  const handleSelectNewSubject = () => {
    setCurrentSubject(null);
    resetQuizState();
  };

  if (!currentSubject) {
    return <SubjectSelector selectedSubject={currentSubject} onSelectSubject={handleSubjectSelect} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-primary">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-lg font-semibold">Preparing {currentSubject} Quiz...</p>
      </div>
    );
  }

  if (questions.length === 0 && !isLoading) {
     return (
      <Alert variant="destructive" className="max-w-md mx-auto text-center">
        <XCircle className="h-5 w-5 mx-auto mb-2" />
        <AlertTitle className="font-semibold text-lg">No Questions Found</AlertTitle>
        <AlertDescription>
          Sorry, we couldn't find any questions for {currentSubject}.
        </AlertDescription>
         <Button onClick={handleSelectNewSubject} variant="outline" className="mt-6">
            <BookOpenText className="mr-2 h-4 w-4" /> Choose Another Subject
        </Button>
      </Alert>
    );
  }

  if (quizCompleted) {
    const correctAnswersCount = Math.round((score! / 100) * questions.length);
    let scoreColor = 'text-destructive';
    if (score !== null) {
        if (score >= 70) scoreColor = 'text-green-600';
        else if (score >= 40) scoreColor = 'text-yellow-500';
    }

    return (
      <Card className="w-full text-center shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary">Quiz Results</CardTitle>
          <CardDescription className="text-lg">Subject: {currentSubject}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 md:px-6">
          <div className={`text-6xl font-extrabold ${scoreColor}`}>
            {score?.toFixed(0)}%
          </div>
          <p className="text-xl text-muted-foreground">
            You got <strong>{correctAnswersCount}</strong> out of <strong>{questions.length}</strong> questions right.
          </p>
          
          {isSubmittingAi && (
            <div className="flex items-center justify-center text-sm text-primary py-3">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing performance for difficulty suggestion...
            </div>
          )}
          {difficultyAdjustment && !isSubmittingAi && (
            <Alert variant={difficultyAdjustment === "INCREASE" ? "default" : difficultyAdjustment === "DECREASE" ? "destructive" : "default"} className="text-left max-w-md mx-auto">
              <Brain className="h-5 w-5" />
              <AlertTitle className="font-semibold">AI Difficulty Suggestion</AlertTitle>
              <AlertDescription>
                For your next quiz, we suggest to <strong>{difficultyAdjustment.toLowerCase()}</strong> the difficulty.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-xl font-semibold mb-3 text-primary">Review Your Answers</h3>
            <div className="max-h-72 overflow-y-auto space-y-3 p-3 bg-background rounded-lg border">
              {questions.map((q, idx) => {
                const userAnswer = userAnswers[q.id];
                const isCorrect = userAnswer === q.correctAnswerId;
                return (
                  <div key={q.id} className={`p-3 rounded-md text-left text-sm ${isCorrect ? 'bg-green-500/10 border-l-4 border-green-500' : 'bg-destructive/10 border-l-4 border-destructive'}`}>
                    <p className="font-medium text-foreground mb-1">Q{idx + 1}: {q.text}</p>
                    <p>Your answer: <span className={isCorrect ? 'text-green-700 font-semibold' : 'text-destructive font-semibold'}>{q.options.find(opt => opt.id === userAnswer)?.text || "Not answered"}</span>
                      {isCorrect ? <CheckCircle className="inline h-4 w-4 ml-1 text-green-600" /> : <XCircle className="inline h-4 w-4 ml-1 text-destructive" />}
                    </p>
                    {!isCorrect && <p className="text-green-700">Correct: {q.options.find(opt => opt.id === q.correctAnswerId)?.text}</p>}
                  </div>
                );
              })}
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-8 pb-6">
          <Button onClick={handleRestartQuiz} variant="outline" className="w-full sm:w-auto text-base py-3">
            <RefreshCw className="mr-2 h-5 w-5" />
            Restart {currentSubject} Quiz
          </Button>
          <Button onClick={handleSelectNewSubject} className="w-full sm:w-auto text-base py-3 bg-primary hover:bg-primary/90">
             <BookOpenText className="mr-2 h-5 w-5" /> Choose New Subject
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="space-y-6 w-full">
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm py-3 z-10 -mx-4 px-4 rounded-b-lg shadow-sm">
            <Progress value={progressPercentage} className="w-full h-2.5" />
            <p className="text-xs text-muted-foreground text-center mt-1.5">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>

      <div className="pt-2"> 
        <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={userAnswers[currentQuestion.id]}
            onAnswerSelect={handleAnswerSelect}
            isSubmitted={quizCompleted} // Will always be false here, but kept for prop consistency
        />
      </div>

      <div className="flex justify-between items-center mt-8 pb-4">
        <Button
          variant="outline"
          onClick={handleSelectNewSubject}
          className="py-3 px-5 text-sm"
        >
          Change Subject
        </Button>
        <Button
          onClick={handleNextQuestion}
          disabled={!userAnswers[currentQuestion.id] || isSubmittingAi}
          className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[150px] py-3 px-5 text-base font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:ring-2 ring-offset-2 ring-accent"
        >
          {isSubmittingAi && currentQuestionIndex === questions.length -1 ? <Loader2 className="animate-spin h-5 w-5" /> : (currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question')}
        </Button>
      </div>
    </div>
  );
}
