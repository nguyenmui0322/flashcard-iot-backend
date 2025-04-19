export function wordGroupPrompt(excludedTopics) {
    const excludedText = excludedTopics.length > 0
      ? `Các chủ đề ngoài trừ: ${excludedTopics.join(", ")}`
      : "Các chủ đề ngoài trừ: không có";
  
    return `Tôi đang cần làm một ứng dụng Flashcard học tiếng anh. Tôi cần bạn giúp tôi sinh ra 1 chủ đề ngẫu nhiên có 10 từ vựng tiếng anh thoả mãn các điều kiện sau:
  - ${excludedText}
  - Tên chủ đề bằng tiếng việt, tối đa 12 ký tự, viết thường, ngắn gọn, dễ hiểu
  - Từ tiếng anh và nghĩa tiếng việt của nó đều tối đa 12 ký tự, viết thường, ngắn gọn, dễ hiểu
  - Chủ đề và từ tiếng anh có độ khó ở mức trung bình
  - Định dạng trả về: minify json như dưới đây:{"wordGroup":<tên chủ đề>,"words":[{"word":<tên từ>,"meaning":<nghĩa bằng tiếng việt>,"type":<loại từ>},...]}
  - Loại từ là một trong các loại sau: "Danh từ", "Đại từ", "Động từ", "Tính từ", "Trạng từ", "Giới từ", "Liên từ", "Thán từ", "Khác"`;
}

export function wordPrompt(topic, excludedWords) {
    const topicText = topic ? `Các từ tiếng anh thuộc chủ đề: ${topic}` : "Các từ tiếng anh thuộc chủ đề: không có";
    const excludedText = excludedWords.length > 0
      ? `Các từ tiếng anh ngoại trừ: ${excludedWords.join(", ")}`
      : "Các từ tiếng anh ngoại trừ: không có";
  
    return `Tôi đang cần làm một ứng dụng Flashcard học tiếng anh. Tôi cần bạn giúp tôi sinh ra 10 từ vựng tiếng anh thoả mãn các điều kiện sau:
  - ${topicText}
  - ${excludedText}
  - Từ tiếng anh và nghĩa tiếng việt của nó đều tối đa 12 ký tự, viết thường, ngắn gọn, dễ hiểu
  - Các từ tiếng anh có độ khó ở mức trung bình
  - Định dạng trả về: minify json như dưới đây:[{"word":<tên từ>,"meaning":<nghĩa bằng tiếng việt>,"type":<loại từ>},...]
  - Loại từ là một trong các loại sau: "Danh từ", "Đại từ", "Động từ", "Tính từ", "Trạng từ", "Giới từ", "Liên từ", "Thán từ", "Khác"`;
}