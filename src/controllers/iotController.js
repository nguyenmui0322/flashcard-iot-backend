import { db } from "../config/firebase.js";
import { timeoutWord } from "../utils/wordTimeoutManager.js";
import { assessPronunciation } from "../services/pronunciationService.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// Create multer storage configuration
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log(`Received file: ${file.originalname}, MIME type: ${file.mimetype}`);
    
    // Check file type
    if (file.mimetype === 'audio/wav' || 
        file.mimetype === 'audio/wave' || 
        file.mimetype === 'audio/x-wav' || 
        file.originalname.endsWith('.wav')) {
      cb(null, true);
    } else {
      console.error(`Rejected file: ${file.originalname} with MIME type: ${file.mimetype}`);
      cb(new Error('Only .wav audio files are allowed'), false);
    }
  }
});

// Get word groups for the user
export const getWordGroups = async (req, res) => {
  try {
    // Get user ID from the authenticated user
    const { uid } = req.user;
    
    // Query the word groups collection
    const wordGroupsRef = db.collection('wordGroups');
    const querySnapshot = await wordGroupsRef.where('userId', '==', uid).get();
    
    const wordGroups = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      let createdAt = new Date();
      
      // Safely handle the createdAt field to avoid the toDate error
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt instanceof Date) {
          createdAt = data.createdAt;
        } else {
          // Handle string or timestamp number
          createdAt = new Date(data.createdAt);
        }
      }
      
      wordGroups.push({
        id: doc.id,
        name: data.name
      });
    });
    
    res.status(200).json(wordGroups);
  } catch (error) {
    console.error("Error getting word groups:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving word groups",
      error: error.message
    });
  }
};

// Get words in a specific group
export const getWordsInGroup = async (req, res) => {
  try {
    // Get user ID from the authenticated user
    const { uid } = req.user;
    
    // Get group ID from the request parameters
    const { groupId } = req.params;
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required"
      });
    }
    
    // First verify the group exists and belongs to the user
    const groupRef = db.collection('wordGroups').doc(groupId);
    const groupDoc = await groupRef.get();
    
    if (!groupDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Word group not found"
      });
    }
    
    const groupData = groupDoc.data();
    if (groupData.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this word group"
      });
    }
    
    // Query the words collection for active words in this group
    const wordsRef = db.collection('words');
    const querySnapshot = await wordsRef
      .where('groupId', '==', groupId)
      .where('status', '==', 'active')
      .get();
    
    const words = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      words.push({
        id: doc.id,
        word: data.word,
        meaning: data.meaning || '',
        audioUrl: data.audioUrl || ''
      });
    });
    
    res.status(200).json(words);
  } catch (error) {
    console.error("Error getting words in group:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving words in group",
      error: error.message
    });
  }
};

// Timeout a word from IoT device
export const timeoutWordFromIoT = async (req, res) => {
  try {
    // Get user ID from the authenticated user
    const { uid } = req.user;
    
    // Get wordId and timeout duration from request
    const { wordId } = req.params;
    const { timeoutMinutes = 60 } = req.body;
    
    if (!wordId) {
      return res.status(400).json({
        success: false,
        message: "Word ID is required"
      });
    }
    
    // Convert timeout duration to number
    const duration = parseInt(timeoutMinutes, 10);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Timeout duration must be a positive number in minutes"
      });
    }
    
    // First check if word exists and belongs to user
    const wordRef = db.collection('words').doc(wordId);
    const wordDoc = await wordRef.get();
    
    if (!wordDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Word not found"
      });
    }
    
    const wordData = wordDoc.data();
    
    // Get the word's group to check ownership
    const groupRef = db.collection('wordGroups').doc(wordData.groupId);
    const groupDoc = await groupRef.get();
    
    if (!groupDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Word group not found"
      });
    }
    
    const groupData = groupDoc.data();
    if (groupData.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this word"
      });
    }
    
    // Set the timeout using server timestamp
    const result = await timeoutWord(wordId, duration);
    
    res.status(200).json({
      wordId: wordId,
      ...result
    });
  } catch (error) {
    console.error("Error setting word timeout from IoT:", error);
    res.status(500).json({
      success: false,
      message: "Error setting word timeout",
      error: error.message
    });
  }
};

// Assess pronunciation of a word
export const assessWordPronunciation = async (req, res) => {
  try {
    console.log("Received pronunciation assessment request");
    
    // Get user ID from the authenticated user
    const { uid } = req.user;
    console.log(`User ID: ${uid}`);
    
    // Get the word from request parameters
    const { word } = req.body;
    console.log(`Word to assess: ${word}`);
    
    if (!word) {
      return res.status(400).json({
        success: false,
        message: "Word is required in request body"
      });
    }
    
    // Debug request body and files
    console.log(`Request has file: ${req.file ? 'Yes' : 'No'}`);
    
    // Check for the audio file
    if (!req.file) {
      console.error("No audio file provided in the request");
      return res.status(400).json({
        success: false,
        message: "Audio file (.wav) is required"
      });
    }
    
    // Debug file info
    console.log(`File info: ${JSON.stringify({
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    }, null, 2)}`);
    
    // Get audio file buffer from request
    const audioBuffer = req.file.buffer;
    
    if (!audioBuffer || audioBuffer.length === 0) {
      console.error("Empty audio buffer");
      return res.status(400).json({
        success: false,
        message: "Empty audio file provided"
      });
    }
    
    console.log(`Audio buffer size: ${audioBuffer.length} bytes`);
    
    // Send to Azure for pronunciation assessment
    try {
      const assessmentResult = await assessPronunciation(word, audioBuffer);
      
      // Log result
      console.log(`Pronunciation assessment for "${word}" - Accuracy Score: ${assessmentResult.accuracyScore}`);
      
      // Return the assessment results - simplified to just the accuracy score
      res.status(200).json({
        accuracyScore: assessmentResult.accuracyScore
      });
    } catch (azureError) {
      console.error("Azure service error:", azureError);
      
      // Specific error handling for Speech SDK errors
      const errorMessage = azureError.message || "Unknown error";
      const errorCode = azureError.errorCode || 0;
      
      // Return a more detailed error
      res.status(500).json({
        success: false,
        message: "Error in Azure Speech Service",
        error: errorMessage,
        code: errorCode,
        details: "Check server logs for more information"
      });
    }
  } catch (error) {
    console.error("Error in pronunciation assessment controller:", error);
    res.status(500).json({
      success: false,
      message: "Error assessing pronunciation",
      error: error.message
    });
  }
};
