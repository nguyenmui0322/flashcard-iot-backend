import Word from "../models/Word.js";
import WordGroup from "../models/WordGroup.js";

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
