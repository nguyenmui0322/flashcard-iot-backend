import WordGroup from "../models/WordGroup.js";
import Word from "../models/Word.js";

// GET /word-groups
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

// POST /word-groups
export const createWordGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.uid;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên nhóm từ không được để trống",
      });
    }

    const group = await WordGroup.create({
      name,
      description,
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

// GET /word-groups/:id
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

    // Check if user owns this group
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

// PUT /word-groups/:id
export const updateWordGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const group = await WordGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ",
      });
    }

    // Check if user owns this group
    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật nhóm từ này",
      });
    }

    const updatedGroup = await WordGroup.update(id, {
      name: name || group.name,
      description: description !== undefined ? description : group.description,
    });

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

// DELETE /word-groups/:id
export const deleteWordGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await WordGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ",
      });
    }

    // Check if user owns this group
    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa nhóm từ này",
      });
    }

    // Get all words in this group and delete them
    const words = await Word.findByGroupId(id);
    for (const word of words) {
      await Word.delete(word.id);
    }

    await WordGroup.delete(id);

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

// GET /word-groups/:id/words
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

    // Check if user owns this group
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

// POST /word-groups/:id/words
export const addWordToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { term, definition, example, pronunciation } = req.body;

    const group = await WordGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ",
      });
    }

    // Check if user owns this group
    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thêm từ vào nhóm này",
      });
    }

    if (!term || !definition) {
      return res.status(400).json({
        success: false,
        message: "Từ và định nghĩa không được để trống",
      });
    }

    const word = await Word.create({
      term,
      definition,
      example,
      pronunciation,
      groupId: id,
    });

    res.status(201).json({
      success: true,
      message: "Thêm từ vào nhóm thành công",
      data: word,
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

// POST /set-current-word
export const setCurrentWord = async (req, res) => {
  try {
    const { word: wordId, group: groupId } = req.query;

    if (!wordId || !groupId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin từ hoặc nhóm từ",
      });
    }

    const group = await WordGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm từ",
      });
    }

    // Check if user owns this group
    if (group.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật nhóm từ này",
      });
    }

    const word = await Word.findById(wordId);
    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy từ",
      });
    }

    if (word.groupId !== groupId) {
      return res.status(400).json({
        success: false,
        message: "Từ này không thuộc nhóm từ đã chọn",
      });
    }

    const updatedGroup = await WordGroup.setCurrentWord(groupId, wordId);

    res.status(200).json({
      success: true,
      message: "Đã đặt từ hiện tại thành công",
      data: updatedGroup,
    });
  } catch (error) {
    console.error("Error setting current word:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đặt từ hiện tại",
      error: error.message,
    });
  }
};
