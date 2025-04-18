import Word from "../models/Word.js";
import WordGroup from "../models/WordGroup.js";

// GET /words/:id
export const getWordById = async (req, res) => {
  try {
    const { id } = req.params;
    const word = await Word.findById(id);

    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy từ",
      });
    }

    // Get the group to check ownership
    const group = await WordGroup.findById(word.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ liên quan",
      });
    }

    // Check if user owns the group that contains this word
    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập từ này",
      });
    }

    res.status(200).json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error("Error getting word:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin từ",
      error: error.message,
    });
  }
};

// PUT /words/:id
export const updateWord = async (req, res) => {
  try {
    const { id } = req.params;
    const { term, definition, example, pronunciation, status } = req.body;

    const word = await Word.findById(id);
    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy từ",
      });
    }

    // Get the group to check ownership
    const group = await WordGroup.findById(word.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ liên quan",
      });
    }

    // Check if user owns the group that contains this word
    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật từ này",
      });
    }

    // Update learned status if changing status
    if (status && status !== word.status) {
      if (status === "learned" && word.status !== "learned") {
        await Word.markAsLearned(id);
      } else {
        await Word.update(id, { status });
      }
    }

    const updatedData = {};
    if (term) updatedData.term = term;
    if (definition) updatedData.definition = definition;
    if (example !== undefined) updatedData.example = example;
    if (pronunciation !== undefined) updatedData.pronunciation = pronunciation;

    if (Object.keys(updatedData).length > 0) {
      await Word.update(id, updatedData);
    }

    const updatedWord = await Word.findById(id);

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

// DELETE /words/:id
export const deleteWord = async (req, res) => {
  try {
    const { id } = req.params;
    const word = await Word.findById(id);

    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy từ",
      });
    }

    // Get the group to check ownership
    const group = await WordGroup.findById(word.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ liên quan",
      });
    }

    // Check if user owns the group that contains this word
    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa từ này",
      });
    }

    // Check if this word is currently selected in the group
    if (group.progress && group.progress.currentWordId === id) {
      await WordGroup.update(word.groupId, {
        "progress.currentWordId": null,
      });
    }

    await Word.delete(id);

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

// POST /words/:id/timeout
export const timeoutWord = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours } = req.body;

    const word = await Word.findById(id);
    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy từ",
      });
    }

    // Get the group to check ownership
    const group = await WordGroup.findById(word.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ liên quan",
      });
    }

    // Check if user owns the group that contains this word
    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật từ này",
      });
    }

    // Set timeout for the word
    const timedOutWord = await Word.setTimeout(id, hours || 24);

    // If this word is currently selected, set current word to null
    if (group.progress && group.progress.currentWordId === id) {
      await WordGroup.update(word.groupId, {
        "progress.currentWordId": null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Đặt timeout cho từ thành công",
      data: timedOutWord,
    });
  } catch (error) {
    console.error("Error setting timeout for word:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đặt timeout cho từ",
      error: error.message,
    });
  }
};
