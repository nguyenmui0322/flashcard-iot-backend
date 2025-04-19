import dotenv from 'dotenv';

dotenv.config();

// Check if Azure Speech API credentials are configured
const subscriptionKey = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;

if (!subscriptionKey || !region) {
  console.warn('⚠️ WARNING: Azure Speech Service credentials are not properly configured!');
  console.warn(`AZURE_SPEECH_KEY: ${subscriptionKey ? 'Configured' : 'Missing'}`);
  console.warn(`AZURE_SPEECH_REGION: ${region ? 'Configured' : 'Missing'}`);
  console.warn('Please make sure to set these variables in your .env file');
}

export const azureSpeechConfig = {
  subscriptionKey: subscriptionKey,
  region: region,
  language: "en-US",
  // Additional pronunciation assessment parameters
  assessmentParams: {
    referenceText: '', // Will be set per request
    gradingSystem: 'HundredMark',
    granularity: 'Phoneme',
    enableMiscue: true,
    scenarioId: 'englishPronunciationAssessment'
  }
}; 