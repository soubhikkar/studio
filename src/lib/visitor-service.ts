'use server';

import { promises as fs } from 'fs';
import path from 'path';

const countFilePath = path.join(process.cwd(), 'visitor-count.json');

type CountData = {
  count: number;
};

export async function getAndIncrementVisitorCount(): Promise<number> {
  let countData: CountData;
  try {
    const data = await fs.readFile(countFilePath, 'utf8');
    countData = JSON.parse(data);
    countData.count++;
  } catch (error) {
    countData = { count: 1 };
  }

  try {
    await fs.writeFile(countFilePath, JSON.stringify(countData, null, 2));
  } catch (writeError) {
    console.error("Failed to write visitor count file:", writeError);
  }

  return countData.count;
}
