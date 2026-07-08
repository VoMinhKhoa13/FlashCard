export interface Quiz {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Card {
  id: string;
  word: string;
  pos: string;
  ipa: string;
  meaning: string;
  example: string;
  exampleVi: string;
  quiz: Quiz;
}

export interface Lesson {
  id: string;
  name: string;
  createdAt: number;
  cards: Card[];
}

export const mockCards: Card[] = [
  {
    id: "card_1",
    word: "Implement",
    pos: "verb",
    ipa: "/ˈɪm.plɪ.ment/",
    meaning: "Thực hiện, thi hành, áp dụng (một kế hoạch, chính sách)",
    example: "The committee decided to implement the new safety procedures immediately.",
    exampleVi: "Ủy ban đã quyết định thực hiện các quy trình an toàn mới ngay lập tức.",
    quiz: {
      question: "Từ nào đồng nghĩa với 'Implement' trong ngữ cảnh 'thi hành một kế hoạch'?",
      options: [
        "Postpone (Trì hoãn)",
        "Execute (Thực thi)",
        "Ignore (Bỏ qua)",
        "Construct (Xây dựng)"
      ],
      answerIndex: 1
    }
  },
  {
    id: "card_2",
    word: "Substantial",
    pos: "adjective",
    ipa: "/səbˈstæn.ʃəl/",
    meaning: "Đáng kể, nhiều, quan trọng",
    example: "The company reported a substantial increase in profits this quarter.",
    exampleVi: "Công ty đã báo cáo mức tăng lợi nhuận đáng kể trong quý này.",
    quiz: {
      question: "Hoàn thành câu: 'The project requires a _______ amount of time and money.'",
      options: [
        "substantial",
        "trivial",
        "microscopic",
        "temporary"
      ],
      answerIndex: 0
    }
  },
  {
    id: "card_3",
    word: "Collaborate",
    pos: "verb",
    ipa: "/kəˈlæb.ə.reɪt/",
    meaning: "Hợp tác, cộng tác",
    example: "Researchers from both universities will collaborate on this study.",
    exampleVi: "Các nhà nghiên cứu từ cả hai trường đại học sẽ cộng tác trong nghiên cứu này.",
    quiz: {
      question: "Ý nghĩa của động từ 'collaborate' là gì?",
      options: [
        "Cạnh tranh gay gắt",
        "Làm việc độc lập",
        "Hợp tác cùng làm việc",
        "Phân chia nhiệm vụ"
      ],
      answerIndex: 2
    }
  }
];
