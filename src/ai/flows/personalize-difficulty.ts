// src/ai/flows/personalize-difficulty.ts
'use server';
/**
 * @fileOverview Adjusts the difficulty of quiz questions based on user performance.
 *
 * - personalizeDifficulty - A function that adjusts the difficulty of quiz questions.
 * - PersonalizeDifficultyInput - The input type for the personalizeDifficulty function.
 * - PersonalizeDifficultyOutput - The return type for the personalizeDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeDifficultyInputSchema = z.object({
  userId: z.string().describe('The ID of the user taking the quiz.'),
  score: z.number().describe('The user score on the previous quiz (0-100).'),
});
export type PersonalizeDifficultyInput = z.infer<typeof PersonalizeDifficultyInputSchema>;

const PersonalizeDifficultyOutputSchema = z.object({
  suggestedDifficultyAdjustment: z
    .string()
    .describe(
      'A suggestion to increase, decrease, or maintain the difficulty level for the next quiz.  Must be one of: INCREASE, DECREASE, MAINTAIN'
    ),
});
export type PersonalizeDifficultyOutput = z.infer<typeof PersonalizeDifficultyOutputSchema>;

export async function personalizeDifficulty(input: PersonalizeDifficultyInput): Promise<PersonalizeDifficultyOutput> {
  return personalizeDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeDifficultyPrompt',
  input: {schema: PersonalizeDifficultyInputSchema},
  output: {schema: PersonalizeDifficultyOutputSchema},
  prompt: `Based on the user's score on the previous quiz, suggest whether to INCREASE, DECREASE, or MAINTAIN the difficulty level for the next quiz.

User ID: {{{userId}}}
Previous Score: {{{score}}}

Consider these factors:
* Scores above 80 should generally result in an INCREASE.
* Scores between 50 and 80 should generally result in MAINTAIN.
* Scores below 50 should generally result in a DECREASE.

Your response must be one of: INCREASE, DECREASE, MAINTAIN.  Respond ONLY with that single word.`,
});

const personalizeDifficultyFlow = ai.defineFlow(
  {
    name: 'personalizeDifficultyFlow',
    inputSchema: PersonalizeDifficultyInputSchema,
    outputSchema: PersonalizeDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      suggestedDifficultyAdjustment: output!,
    };
  }
);
