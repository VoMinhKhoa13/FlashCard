import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Define response schema to enforce structured JSON output from Gemini
const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    cards: {
      type: SchemaType.ARRAY,
      description: "Danh sách các thẻ từ vựng trích xuất từ hình ảnh",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            description: "Mã định danh duy nhất cho thẻ (ví dụ: card_1, card_2,...)",
          },
          word: {
            type: SchemaType.STRING,
            description: "Từ vựng tiếng Anh được trích xuất (e.g. 'implement', 'substantial')",
          },
          pos: {
            type: SchemaType.STRING,
            description: "Từ loại viết tắt (noun, verb, adjective, adverb, v.v.)",
          },
          ipa: {
            type: SchemaType.STRING,
            description: "Phiên âm IPA của từ đó (e.g. /ɪmˈplɪment/)",
          },
          meaning: {
            type: SchemaType.STRING,
            description: "Nghĩa tiếng Việt rõ ràng, chính xác của từ vựng này",
          },
          example: {
            type: SchemaType.STRING,
            description: "Câu ví dụ tiếng Anh sử dụng từ vựng này",
          },
          exampleVi: {
            type: SchemaType.STRING,
            description: "Bản dịch nghĩa tiếng Việt của câu ví dụ tiếng Anh đó",
          },
          quiz: {
            type: SchemaType.OBJECT,
            description: "Câu hỏi trắc nghiệm kiểm tra mức độ ghi nhớ từ vựng này",
            properties: {
              question: {
                type: SchemaType.STRING,
                description: "Nội dung câu hỏi trắc nghiệm (bằng tiếng Việt hoặc điền vào chỗ trống tiếng Anh)",
              },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: "Mảng chứa đúng 4 lựa chọn trắc nghiệm tiếng Việt hoặc tiếng Anh",
              },
              answerIndex: {
                type: SchemaType.INTEGER,
                description: "Chỉ mục (index 0 đến 3) của câu trả lời chính xác trong mảng options",
              },
            },
            required: ["question", "options", "answerIndex"],
          },
        },
        required: ["id", "word", "pos", "ipa", "meaning", "example", "exampleVi", "quiz"],
      },
    },
  },
  required: ["cards"],
};

export async function POST(req: NextRequest) {
  try {
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "Vui lòng cấu hình GEMINI_API_KEY hợp lệ trong file .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { image } = body; // Base64 image data string

    if (!image) {
      return NextResponse.json(
        { error: "Không tìm thấy dữ liệu hình ảnh được truyền lên" },
        { status: 400 }
      );
    }

    // Extract mime type and clean base64 data
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const prompt = `Bạn là một trợ lý AI chuyên giảng dạy tiếng Anh TOEIC. Hãy phân tích hình ảnh này và đọc TOÀN BỘ các từ vựng xuất hiện trong bảng danh sách từ vựng. Trích xuất tất cả các từ trong bảng (không bỏ sót bất kỳ từ nào) và định dạng chúng theo đúng Schema đã cho. Hãy đảm bảo mỗi từ đều có đầy đủ thông tin: nghĩa dịch chính xác theo cột NGHĨA trong bảng, phiên âm chuẩn theo cột PHIÊN ÂM, kèm theo câu ví dụ tiếng Anh, bản dịch ví dụ tiếng Việt và một câu hỏi quiz trắc nghiệm tiếng Việt chất lượng cao.`;

    let text = "";

    try {
      console.log("Đang thử kết xuất bằng mô hình chính: gemini-2.5-flash...");
      const primaryModel = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const result = await primaryModel.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        prompt,
      ]);

      text = result.response.text();
    } catch (primaryError: any) {
      console.warn("Mô hình chính (gemini-2.5-flash) gặp lỗi hoặc hết quota. Chi tiết:", primaryError.message || primaryError);
      console.log("Đang chuyển hướng tự động sang mô hình dự phòng (gemini-flash-latest / 1.5 Flash)...");

      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const result = await fallbackModel.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        prompt,
      ]);

      text = result.response.text();
    }

    if (!text) {
      throw new Error("Không nhận được phản hồi văn bản từ các mô hình Gemini");
    }

    const parsedData = JSON.parse(text);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Lỗi khi xử lý hình ảnh:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi xử lý hình ảnh phía máy chủ" },
      { status: 500 }
    );
  }
}
