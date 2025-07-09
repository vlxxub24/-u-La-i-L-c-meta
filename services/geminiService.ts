import { GoogleGenAI } from "@google/genai";
import { Choice, Character } from "./types";

const CREATION_SYSTEM_INSTRUCTION = `Bạn là một Game Master (GM) cho một trò chơi nhập vai (RPG) có chủ đề 'Đấu La Đại Lục' (Soul Land). Nhiệm vụ của bạn là cung cấp các gợi ý sáng tạo, phù hợp với cốt truyện và bối cảnh của thế giới này.
- Luôn trả lời bằng tiếng Việt.
- Khi được yêu cầu cung cấp danh sách hoặc đối tượng JSON (ví dụ: tên nhân vật, thiên phú, giống loài), hãy trả về một đối tượng hoặc mảng JSON hợp lệ. Chỉ trả về JSON, không có bất kỳ văn bản giải thích nào khác bên ngoài đối tượng JSON.
- Khi được yêu cầu viết mô tả hoặc cốt truyện, hãy viết một đoạn văn ngắn gọn, súc tích (2-4 câu).
- Đảm bảo các gợi ý của bạn phù hợp với không khí huyền huyễn, tu chân của Đấu La Đại Lục.
- **QUY TẮC JSON (CỰC KỲ QUAN TRỌNG):**
  - Để đảm bảo JSON luôn hợp lệ, hãy tuân thủ nghiêm ngặt quy tắc sau: bên trong bất kỳ giá trị chuỗi nào (ví dụ, trong "description"), mọi ký tự dấu ngoặc kép (") cho lời thoại PHẢI được thoát ký tự bằng dấu gạch chéo ngược (\\").
  - **Ví dụ đúng:** \`{"description": "Già làng nói: \\"Lại đây nào.\\""}\`
  - **Ví dụ sai:** \`{"description": "Già làng nói: "Lại đây nào.""}\`
  - Để nhấn mạnh từ ngữ, hãy dùng dấu sao (*như thế này*), TUYỆT ĐỐI không dùng dấu ngoặc kép.`;

const GAME_SYSTEM_INSTRUCTION = `Bạn là một Game Master (GM) chuyên nghiệp, bậc thầy kể chuyện cho một trò chơi nhập vai (RPG) dựa trên thế giới 'Đấu La Đại Lục'. Nhiệm vụ của bạn là tạo ra một cốt truyện sâu sắc, hấp dẫn, và tương tác, với khả năng ghi nhớ sự kiện cực tốt.

# QUY TẮC CỐT LÕI:
- **Bám sát nguyên tác:** Cốt truyện PHẢI tuân thủ chặt chẽ không khí, bối cảnh, thuật ngữ (Võ Hồn, Hồn Hoàn, Hồn Lực, v.v.), và các địa danh nổi tiếng (Thánh Hồn Thôn, Sử Lai Khắc, Tinh Đấu Đại Sâm Lâm, v.v.) của 'Đấu La Đại Lục'.
- **Cốt truyện dài và chi tiết:** Phần "narrative" phải là một đoạn văn tường thuật chi tiết, dài từ 2-3 đoạn văn. Mô tả sâu sắc về môi trường xung quanh, cảm xúc, suy nghĩ của nhân vật, và phản ứng của các NPC.
- **Dẫn dắt hợp lý:** Dựa vào **Xuất Thân**, **Cốt Truyện**, và **toàn bộ diễn biến câu chuyện đã cung cấp** để phát triển câu chuyện một cách logic.
- **Luôn trả lời bằng tiếng Việt.**

# NGUYÊN TẮC GHI NHỚ & LIÊN TỤC (RẤT QUAN TRỌNG):
- **Tóm tắt cốt truyện:** Bạn sẽ nhận được tóm tắt các sự kiện gần đây trong prompt. Hãy coi đây là bối cảnh **quan trọng nhất** và là sự thật tuyệt đối.
- **Duy trì tính nhất quán:** Các sự kiện, NPC, và tình tiết đã xuất hiện trong diễn biến câu chuyện phải được ghi nhớ và nhắc lại một cách hợp lý. **TUYỆT ĐỐI KHÔNG "QUÊN"** những gì đã xảy ra chỉ vài lượt trước. Ví dụ, nếu nhân vật vừa bị thương, họ vẫn phải cảm thấy đau ở lượt sau. Nếu một NPC vừa tỏ ra thù địch, họ không thể đột nhiên thân thiện mà không có lý do.
- **Phát triển dựa trên lịch sử:** Mọi diễn biến mới phải là kết quả logic từ các sự kiện trong tóm tắt và hành động mới nhất của người chơi.
- **Đồng hành (Companions):** Mảng \`npcs\` chỉ nên chứa các nhân vật **đang tích cực đi cùng hoặc tham gia vào nhóm của người chơi**. Các NPC khác mà người chơi chỉ gặp gỡ hoặc tương tác không nên được thêm vào mảng này. Chỉ thêm một NPC vào mảng \`npcs\` khi họ chính thức gia nhập nhóm.
- **Quản lý thời gian:** Bạn cũng phải quản lý hệ thống thời gian trong game. Mỗi khi tường thuật, hãy cập nhật thời gian một cách logic. Một chuyến đi dài có thể mất nửa ngày, một cuộc trò chuyện ngắn có thể không làm thay đổi thời gian. Thời gian sẽ được cập nhật qua trường \`time\` trong \`characterUpdate\`.

# ĐỊNH DẠNG PHẢN HỒI:
- Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hợp lệ duy nhất, không có bất kỳ văn bản giải thích hay markdown nào.
- **Cấu trúc JSON đầu ra phải chính xác như ví dụ sau:**
{
  "narrative": "Bạn đã đánh bại con Mạn Đà La Xà và một Hồn Hoàn màu tím ngàn năm từ từ hiện ra. Sau khi giúp Tiểu Vũ giải quyết đám người xấu, cô ấy quyết định sẽ đi cùng bạn để cảm ơn. Tiểu Vũ đã chính thức trở thành đồng hành của bạn.",
  "choices": [
    { "text": "Ngay lập tức ngồi xuống hấp thụ Hồn Hoàn.", "successRate": "Trung bình", "probability": 70 },
    { "text": "Kiểm tra xung quanh để đảm bảo an toàn trước khi hấp thụ.", "successRate": "Cao", "probability": 95 },
    { "text": "Hỏi Tiểu Vũ về lai lịch của cô ấy.", "successRate": "Cao", "probability": 90 }
  ],
  "characterUpdate": {
    "exp": { "current": 95, "next": 100 },
    "money": 250,
    "time": { "day": 1, "timeOfDay": "Chiều" },
    "npcs": [
        { "id": "tieu_vu", "name": "Tiểu Vũ", "gender": "Nữ", "avatar": "", "realm": "Đại Hồn Sư (10 vạn năm)", "attitude": "Thân thiện", "description": "Một cô gái hoạt bát, đáng yêu với đôi tai thỏ đặc trưng. Thân phận thực sự là một Hồn Thú 10 vạn năm hóa hình." }
    ]
  }
}
- **Giải thích các trường:**
  - "narrative": (string) Mô tả chi tiết (2-3 đoạn văn).
  - "choices": (array) Một mảng chứa chính xác 3 lựa chọn hành động.
  - "characterUpdate": (object) **TÙY CHỌN**. Chỉ bao gồm trường này khi có sự thay đổi về trạng thái của nhân vật (ví dụ: tăng kinh nghiệm, nhận vật phẩm, thay đổi HP, thêm đồng hành, thay đổi thời gian).
    - **QUAN TRỌNG:** Đối với các trường là **mảng** (như \`inventory\`, \`activeQuests\`, \`currentStatus\`, \`npcs\`), bạn PHẢI trả về toàn bộ mảng mới, bao gồm cả các mục cũ và mục mới. Ví dụ: nếu người chơi đã có 'Già làng Jack' trong \`npcs\` và giờ 'Tiểu Vũ' gia nhập, bạn phải trả về một mảng chứa cả hai.
    - Đối với các trường là **đối tượng** (như \`hp\`, \`exp\`, \`realm\`, \`time\`), hãy trả về toàn bộ đối tượng đã được cập nhật.
    - Đối với các trường **số** (như \`money\`, \`atk\`), hãy trả về giá trị **mới và đầy đủ**.
- **QUY TẮC JSON (CỰC KỲ QUAN TRỌNG):**
  - Để đảm bảo JSON luôn hợp lệ, hãy tuân thủ nghiêm ngặt quy tắc sau: bên trong bất kỳ giá trị chuỗi nào (ví dụ, trong "narrative" hoặc "description"), mọi ký tự dấu ngoặc kép (") cho lời thoại PHẢI được thoát ký tự bằng dấu gạch chéo ngược (\\").
  - **Ví dụ đúng:** \`"narrative": "Già làng Jack hét lên: \\"Mau lên nào!\\""\`
  - **Ví dụ sai:** \`"narrative": "Già làng Jack hét lên: "Mau lên nào!""\`
  - Để nhấn mạnh từ ngữ, hãy dùng dấu sao (*như thế này*), TUYỆT ĐỐI không dùng dấu ngoặc kép.
  - TUYỆT ĐỐI không sử dụng ký tự gạch chéo ngược (\\) cho bất kỳ mục đích nào khác ngoài việc thoát dấu ngoặc kép hoặc các ký tự đặc biệt của JSON (như \\n, \\t).`;


let ai: GoogleGenAI | null = null;

export function initializeGemini(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
        console.warn("Attempted to initialize Gemini with an empty API key. AI service will be disabled.");
        ai = null;
        return;
    }
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI. The API Key might be invalid.", error);
        ai = null;
    }
}


async function _generate(prompt: string, systemInstruction: string, expectJson: boolean): Promise<string> {
    if (!ai) {
        throw new Error("Dịch vụ AI chưa được khởi tạo. Vui lòng kiểm tra cấu hình API Key trong Cài đặt.");
    }
     try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: expectJson ? "application/json" : "text/plain",
        }
      });
      
      let text = response.text;
      
      if (expectJson) {
        // Strip markdown fences
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = text.match(fenceRegex);
        if (match && match[2]) {
            text = match[2].trim();
        }
      }

      return text;
    } catch (error) {
      console.error("Error generating content from Gemini:", error);
      throw new Error("Không thể nhận phản hồi từ AI. Vui lòng kiểm tra API Key và thử lại sau.");
    }
}

async function getGameUpdate(prompt: string, matureInstructions?: string): Promise<{ narrative: string; choices: Choice[]; characterUpdate?: Partial<Character> }> {
    if (!ai) {
        throw new Error("Dịch vụ AI chưa được khởi tạo. Vui lòng kiểm tra cấu hình API Key trong Cài đặt.");
    }
    try {
      let systemInstruction = GAME_SYSTEM_INSTRUCTION;
      if (matureInstructions && matureInstructions.trim() !== '') {
          systemInstruction += `\n\n# QUY TẮC BẮT BUỘC VỀ NỘI DUNG NGƯỜI LỚN\nBạn PHẢI tuân thủ nghiêm ngặt các quy tắc sau đây trong mọi phản hồi:\n${matureInstructions}`;
      }
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      
      let text = response.text;
      
      // Strip markdown fences
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = text.match(fenceRegex);
      if (match && match[2]) {
          text = match[2].trim();
      }
      
      const parsed = JSON.parse(text);
      if (parsed.narrative && Array.isArray(parsed.choices) && parsed.choices.length > 0 && parsed.choices[0].text && parsed.choices[0].successRate) {
          // The characterUpdate field is optional
          return {
              narrative: parsed.narrative,
              choices: parsed.choices,
              characterUpdate: parsed.characterUpdate
          };
      }
      throw new Error("AI did not return the expected game update format.");
    } catch (error) {
      console.error("Error getting game update from Gemini:", error);
      if (error instanceof Error && error.message.includes("AI did not")) {
          throw error;
      }
      // Check for specific JSON parsing error
      if (error instanceof SyntaxError) {
        throw new Error(`Lỗi phân tích JSON từ AI. Phản hồi của AI có thể không hợp lệ. Chi tiết: ${error.message}`);
      }
      throw new Error("Không thể nhận cập nhật câu chuyện từ AI. Vui lòng kiểm tra cấu hình API Key trong Cài đặt.");
    }
}


export const geminiService = {
    getSuggestion: (prompt: string, expectJson: boolean = false): Promise<string> => {
        return _generate(prompt, CREATION_SYSTEM_INSTRUCTION, expectJson);
    },
    async getCharacterSuggestion(races: any[], origins: any[]): Promise<any> {
        const prompt = `Tạo một nhân vật hoàn chỉnh cho game RPG 'Đấu La Đại Lục'. Phản hồi BẮT BUỘC là một đối tượng JSON duy nhất.
    **QUAN TRỌNG**: Hãy đảm bảo sự đa dạng trong việc tạo nhân vật. Đừng lúc nào cũng chỉ chọn Hồn Thú. Hãy cân bằng và lựa chọn ngẫu nhiên từ TẤT CẢ các chủng tộc có sẵn (Loài Người, Hồn Thú, Thần Tộc, v.v.) để làm cho thế giới game phong phú hơn.
    
    **Yêu cầu:**
    1.  **race**: Chọn một từ danh sách sau (sử dụng 'id'): ${JSON.stringify(races)}.
    2.  **origin**: Chọn một từ danh sách sau (sử dụng 'id'): ${JSON.stringify(origins)}.
    3.  **stats**: Phân phối chính xác 30 điểm cho 6 chỉ số (strength, intellect, physique, agility, stamina, luck).
    4.  **species**: Tạo một giống loài mới, độc đáo, phù hợp với chủng tộc đã chọn.
    5.  **cultivation/martialSoul**: Nếu chủng tộc là 'soul_beast' hoặc 'ancient_beast', cung cấp 'cultivationYears' (từ 100-100000) và 'cultivationElements' (mảng 1-3 nguyên tố). Nếu không, cung cấp 'martialSoul' với 'name', 'description', 'category' và 'elements' (mảng 1-3 nguyên tố).
    6.  **worldDescription**: Một đoạn mô tả thế giới quan (2-3 câu).
    7.  **realmSystem**: Một danh sách các cảnh giới tu luyện, phân tách bằng dấu \\n.
    
    **Ví dụ cấu trúc JSON cho một nhân vật loài người:**
    {
      "name": "Lâm Phong",
      "gender": "Nam",
      "race": { "id": "human" },
      "species": { "name": "Thường Dân", "description": "Xuất thân bình thường." },
      "martialSoul": { "name": "Lam Ngân Thảo", "description": "Sức sống mãnh liệt, khả năng kiểm soát phi thường.", "category": "Hệ khống chế", "elements": ["Sinh Mệnh", "Thủy"] },
      "origin": { "id": "shrek" },
      "backstory": "Lớn lên ở một ngôi làng nhỏ, từ bé đã thể hiện tài năng vượt trội. Quyết định đến Sử Lai Khắc để tìm kiếm cơ hội đột phá.",
      "innateTalent": { "name": "Tiên Thiên Mãn Hồn Lực", "description": "Sinh ra đã có Hồn Lực đạt cấp 10." },
      "constitution": { "name": "Bách Chiết Bất Nao", "description": "Cơ thể dẻo dai, khả năng chịu đựng đáng kinh ngạc." },
      "stats": { "strength": 4, "intellect": 7, "physique": 5, "agility": 5, "stamina": 6, "luck": 3 },
      "worldDescription": "Một thế giới mà sức mạnh được quyết định bởi Võ Hồn. Các Hồn Sư săn giết Hồn Thú để hấp thu Hồn Hoàn.",
      "realmSystem": "Hồn Sĩ\\nHồn Sư\\nĐại Hồn Sư\\nHồn Tôn\\nHồn Tông\\nHồn Vương\\nHồn Đế\\nHồn Thánh\\nHồn Đấu La\\nPhong Hào Đấu La"
    }

    **Lưu ý:**
    - "gender": PHẢI là một trong ba giá trị: "Nam", "Nữ", hoặc "Khác".
    - Nếu là Hồn Thú, thay thế "martialSoul" bằng "cultivationYears" (number) và "cultivationElements" (array).
    `;
        const result = await this.getSuggestion(prompt, true);
        return JSON.parse(result);
    },

    async getSpeciesSuggestion(raceName: string): Promise<{ name: string; description: string }> {
      const prompt = `Dựa trên chủng tộc "${raceName}" trong thế giới Đấu La Đại Lục, hãy tạo ra một giống loài độc nhất với tên và mô tả ngắn gọn (1-2 câu). Trả về dưới dạng JSON với cấu trúc: { "name": "Tên Giống Loài", "description": "Mô tả ngắn gọn" }.`;
      const result = await this.getSuggestion(prompt, true);
      return JSON.parse(result);
    },

    async getOriginSuggestion(characterPrompt: string): Promise<{ name: string; description: string }> {
    const prompt = `Dựa trên thông tin nhân vật sau đây, hãy tạo ra một Xuất Thân độc đáo và sáng tạo (ví dụ: một ngôi làng bí ẩn, một gia tộc sa sút, một môn phái hắc ám...).
    ---
    Nhân vật:
    ${characterPrompt}
    ---
    Trả về dưới dạng JSON với cấu trúc: { "name": "Tên Xuất Thân", "description": "Mô tả ngắn gọn về xuất thân đó (2-3 câu)." }.`;
    const result = await this.getSuggestion(prompt, true);
    return JSON.parse(result);
  },

    async getMartialSoulSuggestion(): Promise<{ name: string; description: string; elements: string[] }> {
    const prompt = `Tạo một Võ Hồn độc đáo và sáng tạo cho game nhập vai trong thế giới Đấu La Đại Lục. Vui lòng cung cấp một Tên, một Mô tả ngắn gọn (2-3 câu về sức mạnh và đặc tính), và một mảng chứa từ 1 đến 3 Nguyên Tố phù hợp. Danh sách các nguyên tố có thể chọn là: Hỏa, Băng, Lôi, Phong, Thủy, Thổ, Quang, Ám, Độc, Không Gian, Sinh Mệnh, Hủy Diệt. Trả về kết quả dưới dạng một đối tượng JSON hợp lệ duy nhất có cấu trúc sau: { "name": "string", "description": "string", "elements": ["string", "string", ...] }.`;
    const result = await this.getSuggestion(prompt, true);
    const parsed = JSON.parse(result);
    if (parsed.name && parsed.description && Array.isArray(parsed.elements)) {
        return parsed;
    }
    throw new Error("AI không trả về định dạng Võ Hồn mong muốn.");
  },

    getWorldOverview: (characterPrompt: string): Promise<string> => {
    const prompt = `Dựa trên thông tin nhân vật sau đây, hãy viết một đoạn mô tả thế giới quan (khoảng 3-4 câu) thật hấp dẫn và độc đáo, nơi nhân vật này sinh sống.
    Nhân vật:
    ${characterPrompt}`;
    return geminiService.getSuggestion(prompt, false);
  },

    getRealmSystemSuggestion: (): Promise<string> => {
    const prompt = `Tạo một hệ thống cảnh giới tu luyện cho thế giới huyền huyễn như Đấu La Đại Lục. Liệt kê các cảnh giới từ thấp đến cao, mỗi cảnh giới trên một dòng. Ví dụ:
    Hồn Sĩ
    Hồn Sư
    Đại Hồn Sư
    Hồn Tôn
    ...
    Chỉ trả về danh sách văn bản.`;
    return geminiService.getSuggestion(prompt, false);
  },

    validateAndFixRealmSystem: (userInput: string): Promise<string> => {
    const prompt = `Người dùng đã cung cấp hệ thống cảnh giới sau:
    ---
    ${userInput}
    ---
    Hãy xem xét nó. Nếu nó logic và hợp lý, hãy trả lại y nguyên. Nếu có lỗi logic (ví dụ: thứ tự sai, tên gọi không nhất quán) hoặc định dạng xấu, hãy sửa chữa nó để trở nên tốt hơn. Chỉ trả về danh sách văn bản đã được sửa đổi (hoặc giữ nguyên).`;
    return geminiService.getSuggestion(prompt, false);
  },

    getGameUpdate: getGameUpdate,

    async getChoiceSuggestion(characterPrompt: string, currentNarrative: string): Promise<Choice> {
    const prompt = `Đây là nhân vật và bối cảnh hiện tại trong game.
    ---
    Nhân vật:
    ${characterPrompt}
    ---
    Bối cảnh:
    ${currentNarrative}
    ---
    Dựa trên thông tin trên, hãy đề xuất MỘT hành động tiếp theo thật sáng tạo và bất ngờ mà người chơi có thể thực hiện.
    Trả về dưới dạng một đối tượng JSON duy nhất, không có văn bản giải thích nào khác.
    **Ví dụ cấu trúc JSON:**
    {
      "text": "Thử dùng Lam Ngân Thảo để trói chân con Hồn Thú kia.",
      "successRate": "Trung bình",
      "probability": 65
    }
    **Yêu cầu:**
    - "successRate": PHẢI là một trong ba giá trị: "Cao", "Trung bình", hoặc "Thấp".
    - "probability": PHẢI là một số nguyên từ 0 đến 100.`;
    const result = await this.getSuggestion(prompt, true);
    const parsed = JSON.parse(result);
     if (parsed.text && parsed.successRate && typeof parsed.probability === 'number') {
        return parsed as Choice;
    }
    throw new Error("AI không trả về định dạng gợi ý lựa chọn mong muốn.");
    }
};