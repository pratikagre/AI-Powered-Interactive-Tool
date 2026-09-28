import dotenv from 'dotenv';
import { processGenerate } from '../api/generate';

dotenv.config();

export const handleGenerateRequest = processGenerate;
