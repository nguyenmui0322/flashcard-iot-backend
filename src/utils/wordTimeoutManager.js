import { db, admin } from "../config/firebase.js";

/**
 * Scan for timed-out words and reactivate them if the timeout period has passed
 */
export const reactivateTimedOutWords = async () => {
  try {
    console.log("Scanning for timed-out words to reactivate...");
    
    // Use server timestamp
    const now = admin.firestore.Timestamp.now();
    
    // Query for words that are currently timed out
    const wordsRef = db.collection('words');
    const timedOutWordsQuery = await wordsRef
      .where('status', '==', 'timeout')
      .get();
    
    if (timedOutWordsQuery.empty) {
      console.log("No timed-out words found");
      return 0;
    }
    
    // Array to hold batch operations
    const batch = db.batch();
    let reactivatedCount = 0;
    
    timedOutWordsQuery.forEach((doc) => {
      const wordData = doc.data();
      
      // Check if the word has a timeoutUntil timestamp
      if (wordData.timeoutUntil) {
        // Compare timestamps directly if they're Firestore timestamps
        if (now.seconds >= wordData.timeoutUntil.seconds) {
          console.log(`Reactivating word: ${wordData.word} (ID: ${doc.id})`);
          
          // Update the word document to remove timeout
          batch.update(doc.ref, {
            status: 'active',
            timeoutUntil: null,
            lastReactivatedAt: now
          });
          
          reactivatedCount++;
        }
      } else {
        // If there's no timeoutUntil field but the word is marked as timed out,
        // reactivate it (handles potential data inconsistency)
        console.log(`Reactivating word with no timeout date: ${wordData.word} (ID: ${doc.id})`);
        
        batch.update(doc.ref, {
          status: 'active',
          timeoutUntil: null,
          lastReactivatedAt: now
        });
        
        reactivatedCount++;
      }
    });
    
    // Commit the batch if we have updates to make
    if (reactivatedCount > 0) {
      await batch.commit();
      console.log(`Successfully reactivated ${reactivatedCount} words`);
    } else {
      console.log("No words need reactivation at this time");
    }
    
    return reactivatedCount;
  } catch (error) {
    console.error("Error reactivating timed-out words:", error);
    throw error;
  }
};

/**
 * Schedule a job to regularly check for and reactivate timed-out words
 * @param {number} intervalMinutes - How often to run the check (in minutes)
 */
export const scheduleWordTimeoutCheck = (intervalMinutes = 15) => {
  console.log(`Scheduling word timeout check every ${intervalMinutes} minutes`);
  
  // Initial run immediately after server starts
  reactivateTimedOutWords().catch(err => 
    console.error("Error in initial timeout check:", err)
  );
  
  // Convert minutes to milliseconds for setInterval
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Set up the recurring job
  const intervalId = setInterval(() => {
    reactivateTimedOutWords().catch(err => 
      console.error("Error in scheduled timeout check:", err)
    );
  }, intervalMs);
  
  return intervalId;
};

/**
 * Set a timeout for a specific word
 * @param {string} wordId - The ID of the word to time out
 * @param {number} timeoutMinutes - Duration of timeout in minutes
 */
export const timeoutWord = async (wordId, timeoutMinutes = 60) => {
  try {
    const wordRef = db.collection('words').doc(wordId);
    const wordDoc = await wordRef.get();
    
    if (!wordDoc.exists) {
      throw new Error(`Word with ID ${wordId} not found`);
    }
    
    // Use server timestamp for current time
    const now = admin.firestore.Timestamp.now();
    
    // Calculate the future timestamp when timeout should end
    // We need to add the minutes in seconds to the current timestamp
    const secondsToAdd = timeoutMinutes * 60;
    const timeoutUntil = new admin.firestore.Timestamp(
      now.seconds + secondsToAdd,
      now.nanoseconds
    );
    
    await wordRef.update({
      status: 'timeout',
      timeoutUntil: timeoutUntil,
    });
    
    return {
      success: true,
      message: `Word timed out for ${timeoutMinutes} minutes using server time`,
      timeoutUntil: timeoutUntil
    };
  } catch (error) {
    console.error(`Error timing out word ${wordId}:`, error);
    throw error;
  }
}; 