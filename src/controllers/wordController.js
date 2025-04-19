import Word from "../models/Word.js";
import WordGroup from "../models/WordGroup.js";
import { timeoutWord } from "../utils/wordTimeoutManager.js";

export const updateWord = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, meaning, type, status } = req.body;

    const updatedData = {};

    if (word) updatedData.word = word;
    if (meaning) updatedData.meaning = meaning;
    if (type) updatedData.type = type;
    if (status) updatedData.status = status;

    const updatedWord = await Word.update(id, updatedData);

    if (status) {
      const group = await WordGroup.findById(updatedWord.groupId);

      await WordGroup.update(updatedWord.groupId, {
        learnedWords: group.learnedWords + (status === "active" ? 1 : -1),
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật từ thành công",
      data: updatedWord,
    });
  } catch (error) {
    console.error("Error updating word:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật từ",
      error: error.message,
    });
  }
};

export const deleteWord = async (req, res) => {
  try {
    const { id } = req.params;
    const word = await Word.findById(id);

    const group = await WordGroup.findById(word.groupId);

    await Promise.all([
      WordGroup.update(word.groupId, {
        totalWords: group.totalWords - 1,
        learnedWords: group.learnedWords - (word.status === "active" ? 1 : 0),
      }),
      Word.delete(id),
    ]);

    res.status(200).json({
      success: true,
      message: "Xóa từ thành công",
    });
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa từ",
      error: error.message,
    });
  }
};

/**
 * Set a timeout for a word
 */
export const setWordTimeout = async (req, res) => {
  try {
    const { wordId } = req.params;
    const { timeoutMinutes = 60 } = req.body;
    
    if (!wordId) {
      return res.status(400).json({
        success: false,
        message: "Word ID is required"
      });
    }
    
    // Get the timeout duration in minutes
    const duration = parseInt(timeoutMinutes, 10);
    
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Timeout duration must be a positive number"
      });
    }
    
    // Set the timeout using server timestamp
    const result = await timeoutWord(wordId, duration);
    
    res.status(200).json({
      success: true,
      message: `Word has been timed out for ${duration} minutes using server time`,
      wordId: wordId,
      ...result
    });
  } catch (error) {
    console.error("Error setting word timeout:", error);
    res.status(500).json({
      success: false,
      message: "Error setting word timeout",
      error: error.message
    });
  }
};
