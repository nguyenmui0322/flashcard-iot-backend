import Word from "../models/Word.js";
import WordGroup from "../models/WordGroup.js";
import { getUSPronunciationURL } from "../utils/pronunciationScraper.js";
import { generateContent } from "../config/googleAI.js";
import { wordGroupPrompt } from "../utils/prompt.js";
import { db } from "../config/firebase.js";

export const getWordGroups = async (req, res) => {
  try {
    const userId = req.user.uid;
    const groups = await WordGroup.findAll(userId);

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error getting word groups:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhóm từ",
      error: error.message,
    });
  }
};

export const createWordGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.uid;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên nhóm từ không được để trống",
      });
    }

    const group = await WordGroup.create({
      name,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Tạo nhóm từ thành công",
      data: group,
    });
  } catch (error) {
    console.error("Error creating word group:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo nhóm từ",
      error: error.message,
    });
  }
};

export const getWordGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await WordGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ",
      });
    }

    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập nhóm từ này",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error getting word group:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin nhóm từ",
      error: error.message,
    });
  }
};

export const updateWordGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedGroup = await WordGroup.update(id, { name });

    res.status(200).json({
      success: true,
      message: "Cập nhật nhóm từ thành công",
      data: updatedGroup,
    });
  } catch (error) {
    console.error("Error updating word group:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật nhóm từ",
      error: error.message,
    });
  }
};

export const deleteWordGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const [words] = await Promise.all([
      Word.findByGroupId(id),
      WordGroup.delete(id),
    ]);

    await Promise.all(words.map((word) => Word.delete(word.id)));

    res.status(200).json({
      success: true,
      message: "Xóa nhóm từ thành công",
    });
  } catch (error) {
    console.error("Error deleting word group:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa nhóm từ",
      error: error.message,
    });
  }
};

export const getWordsInGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await WordGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ",
      });
    }

    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập nhóm từ này",
      });
    }

    const words = await Word.findByGroupId(id);

    res.status(200).json({
      success: true,
      data: words,
    });
  } catch (error) {
    console.error("Error getting words in group:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách từ trong nhóm",
      error: error.message,
    });
  }
};

export const addWordToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, meaning, type } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({
        success: false,
        message: "Từ và nghĩa không được để trống",
      });
    }

    // Fetch the US pronunciation URL from Cambridge Dictionary
    let audioUrl = "";
    try {
      audioUrl = await getUSPronunciationURL(word) || "";
    } catch (error) {
      console.error(`Error fetching pronunciation for "${word}":`, error);
      // Continue even if pronunciation fetching fails
    }

    console.log(audioUrl);

    const data = await Word.create({
      word,
      meaning,
      type,
      groupId: id,
      audioUrl, // Add the pronunciation URL
    });

    res.status(201).json({
      success: true,
      message: "Thêm từ vào nhóm thành công",
      data,
    });
  } catch (error) {
    console.error("Error adding word to group:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm từ vào nhóm",
      error: error.message,
    });
  }
};

/**
 * Generate a word group with words using Google's Generative AI
 */
export const generateWordGroup = async (req, res) => {
  try {
    const { excludedTopics = [] } = req.body;
    const userId = req.user.uid;
    
    // Generate prompt for word group generation
    const prompt = wordGroupPrompt(excludedTopics);
    
    // Generate content using Google's Generative AI
    const generatedContent = await generateContent(prompt);
    
    // Clean the response text if it contains Markdown code blocks
    let cleanedContent = generatedContent;
    if (generatedContent.includes("```")) {
      // Extract content between code fences (```json and ```)
      const codeBlockMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        cleanedContent = codeBlockMatch[1].trim();
      }
    }
    
    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Error parsing generated content:", error);
      console.error("Raw content:", generatedContent);
      console.error("Cleaned content:", cleanedContent);
      return res.status(500).json({
        success: false,
        message: "Error parsing AI-generated content",
        error: error.message,
        rawContent: generatedContent
      });
    }
    
    // Extract word group name and words from the parsed content
    const { wordGroup: name, words } = parsedContent;
    
    if (!name || !words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid AI-generated content structure",
        data: parsedContent
      });
    }
    
    // Create the word group
    const group = await WordGroup.create({
      name,
      userId,
      totalWords: words.length,
      learnedWords: 0
    });
    
    // Add the words to the group
    const wordsPromises = words.map(async (wordItem) => {
      let audioUrl = "";
      try {
        audioUrl = await getUSPronunciationURL(wordItem.word) || "";
      } catch (error) {
        console.error(`Error fetching pronunciation for "${wordItem.word}":`, error);
      }
      
      return Word.create({
        word: wordItem.word,
        meaning: wordItem.meaning,
        type: wordItem.type,
        groupId: group.id,
        audioUrl,
      });
    });
    
    const createdWords = await Promise.all(wordsPromises);
    
    res.status(201).json({
      success: true,
      message: "Word group generated successfully",
      data: {
        group,
        words: createdWords,
      }
    });
  } catch (error) {
    console.error("Error generating word group:", error);
    res.status(500).json({
      success: false,
      message: "Error generating word group",
      error: error.message
    });
  }
};
