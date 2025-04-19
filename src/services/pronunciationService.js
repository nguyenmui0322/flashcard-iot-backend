import { azureSpeechConfig } from "../config/azure.js";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { Buffer } from "buffer";

/**
 * Assess pronunciation using Azure Speech Services SDK
 * @param {string} word - The word to assess pronunciation for
 * @param {Buffer} audioBuffer - The audio file buffer containing the pronunciation
 * @returns {Object} - Assessment results including accuracy score
 */
export const assessPronunciation = async (word, audioBuffer) => {
  try {
    console.log(`Starting pronunciation assessment for word: "${word}"`);
    
    const { subscriptionKey, region } = azureSpeechConfig;
    
    // Debug Azure configuration
    console.log(`Azure config - Region: ${region}`);
    console.log(`Subscription key configured: ${subscriptionKey ? 'Yes' : 'No'}`);
    
    if (!subscriptionKey || !region) {
      throw new Error("Azure Speech Service credentials not configured");
    }
    
    // Debug audio buffer
    console.log(`Audio buffer received: ${audioBuffer ? 'Yes' : 'No'}, Size: ${audioBuffer ? audioBuffer.length : 0} bytes`);
    
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error("Empty or invalid audio buffer received");
    }
    
    // Create the pronunciation assessment config
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      word,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );
    
    // Create the push stream
    const pushStream = sdk.AudioInputStream.createPushStream();
    
    // Push the audio data to the stream
    pushStream.write(audioBuffer);
    pushStream.close();
    
    // Create the audio config from the push stream
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    
    // Create the speech config
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
    speechConfig.speechRecognitionLanguage = "en-US";
    
    // Create the speech recognizer
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    
    // Apply the pronunciation assessment config to the recognizer
    pronunciationAssessmentConfig.applyTo(recognizer);
    
    console.log("Starting pronunciation assessment with Speech SDK...");
    
    // Create a promise to handle the recognition result
    return new Promise((resolve, reject) => {
      // Handle the recognition result
      recognizer.recognizeOnceAsync(
        async (result) => {
          console.log(`Recognition result received: ${result.text}`);
          
          // Get the pronunciation assessment result
          const pronunciationAssessmentResult = sdk.PronunciationAssessmentResult.fromResult(result);
          console.log("Pronunciation assessment result received");
          
          const assessmentResult = {
            accuracyScore: pronunciationAssessmentResult.accuracyScore,
            fluencyScore: pronunciationAssessmentResult.fluencyScore,
            completenessScore: pronunciationAssessmentResult.completenessScore,
            pronunciationScore: pronunciationAssessmentResult.pronunciationScore,
            recognizedText: result.text || word
          };
          
          console.log("Assessment results:", JSON.stringify(assessmentResult, null, 2));
          
          // Close the recognizer
          recognizer.close();
          
          resolve(assessmentResult);
        },
        (error) => {
          console.error("Error during recognition:", error);
          
          // Close the recognizer
          recognizer.close();
          
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error("Error in pronunciation assessment:", error);
    throw error;
  }
}; 