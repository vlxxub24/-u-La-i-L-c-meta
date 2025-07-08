import { GoogleGenAI } from "@google/genai";
import { Choice } from "./types";

const CREATION_SYSTEM_INSTRUCTION = `Bạn là một Game Master (GM) cho một trò chơi nhập vai (RPG) có chủ đề 'Đấu La Đại Lục' (Soul Land). Nhiệm vụ của bạn là cung cấp các gợi ý sáng tạo, phù hợp với cốt truyện và bối cảnh của thế giới này.
- Luôn trả lời bằng tiếng Việt.
- Khi được yêu cầu cung cấp danh sách hoặc đối tượng JSON (ví dụ: tên nhân vật, thiên phú, giống loài), hãy trả về một đối tượng hoặc mảng JSON hợp lệ. Chỉ trả về JSON, không có bất kỳ văn bản giải thích nào khác bên ngoài đối tượng JSON.
- Khi được yêu cầu viết mô tả hoặc cốt truyện, hãy viết một đoạn văn ngắn gọn, súc tích (2-4 câu).
- Đảm bảo các gợi ý của bạn phù hợp với không khí huyền huyễn, tu chân của Đấu La Đại Lục.`;

const GAME_SYSTEM_INSTRUCTION = `Bạn là một Game Master (GM) chuyên nghiệp, bậc thầy kể chuyện cho một trò chơi nhập vai (RPG) dựa trên thế giới 'Đấu La Đại Lục'. Nhiệm vụ của bạn là tạo ra một cốt truyện sâu sắc, hấp dẫn, và tương tác.

# QUY TẮC CỐT LÕI:
- **Bám sát nguyên tác:** Cốt truyện PHẢI tuân thủ chặt chẽ không khí, bối cảnh, thuật ngữ (Võ Hồn, Hồn Hoàn, Hồn Lực, v.v.), và các địa danh nổi tiếng (Thánh Hồn Thôn, Sử Lai Khắc, Tinh Đấu Đại Sâm Lâm, v.v.) của 'Đấu La Đại Lục'.
- **Cốt truyện dài và chi tiết:** Phần "narrative" phải là một đoạn văn tường thuật chi tiết, dài từ 2-3 đoạn văn. Mô tả sâu sắc về môi trường xung quanh, cảm xúc, suy nghĩ của nhân vật, và phản ứng của các NPC.
- **Dẫn dắt hợp lý:** Dựa vào **Xuất Thân**, **Cốt Truyện**, và **hành động trước đó** của nhân vật để phát triển câu chuyện một cách logic.
- **Luôn trả lời bằng tiếng Việt.**

# ĐỊNH DẠNG PHẢN HỒI:
- Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hợp lệ duy nhất, không có bất kỳ văn bản giải thích hay markdown nào.
- **Cấu trúc JSON đầu ra phải chính xác như ví dụ sau:**
{
  "narrative": "Ánh nắng ban mai xuyên qua khe cửa, nhẹ nhàng chiếu lên khuôn mặt ngái ngủ của bạn. Không khí trong lành của làng Thánh Hồn mang theo mùi cỏ sớm và sương đêm, báo hiệu một ngày trọng đại đã tới. Hôm nay là ngày mà mọi đứa trẻ 6 tuổi trong làng đều mong chờ - lễ thức tỉnh Võ Hồn.\\n\\nBạn cảm nhận được sự hồi hộp len lỏi trong từng thớ thịt. Liệu mình sẽ thức tỉnh được Võ Hồn gì? Một Lam Ngân Thảo yếu đuối hay một Hạo Thiên Chùy bá đạo? Già làng Jack, với nụ cười hiền hậu quen thuộc, đã đứng đợi ngoài sân từ sớm. Tiếng gọi của ông vọng vào: 'Các cháu ơi, mau ra đây nào!'.",
  "choices": [
    {
      "text": "Hào hứng chạy ra sân ngay lập tức, không muốn bỏ lỡ một giây nào.",
      "successRate": "Cao",
      "probability": 90
    },
    {
      "text": "Từ từ thay quần áo chỉnh tề rồi mới ra gặp già làng, giữ phong thái chững chạc.",
      "successRate": "Trung bình",
      "probability": 60
    },
    {
      "text": "Ở trong nhà, cố gắng cảm nhận Hồn Lực trong cơ thể trước khi ra ngoài.",
      "successRate": "Thấp",
      "probability": 25
    }
  ]
}
- **Yêu cầu quan trọng:**
  - "narrative": (string) Mô tả chi tiết (2-3 đoạn văn).
  - "choices": (array) Một mảng chứa chính xác 3 lựa chọn hành động.
  - "successRate": (string) PHẢI là một trong ba giá trị: "Cao", "Trung bình", hoặc "Thấp".
  - "probability": (number) Một số nguyên từ 0 đến 100.
  - **Quy tắc thoát ký tự JSON:** Bên trong các giá trị chuỗi JSON (ví dụ: trong "narrative" hoặc "text"), tất cả các dấu ngoặc kép (") phải được thoát ký tự bằng dấu gạch chéo ngược (\\"). Ví dụ: "Già làng nói: \\"Lại đây nào.\\"". Việc này CỰC KỲ QUAN TRỌNG để đảm bảo JSON hợp lệ.`;


class GeminiService {
  private ais: GoogleGenAI[];
  private currentKeyIndex = 0;

  constructor(apiKeys: string[]) {
    if (!apiKeys || apiKeys.length === 0) {
        throw new Error("Cần ít nhất một API Key để khởi tạo dịch vụ Gemini.");
    }
    const validKeys = apiKeys.filter(k => k && k.trim() !== '');
    if (validKeys.length === 0) {
         throw new Error("Các API Key được cung cấp không hợp lệ hoặc trống.");
    }
    this.ais = validKeys.map(apiKey => new GoogleGenAI({ apiKey }));
  }

  private getNextAiInstance(): GoogleGenAI {
    const ai = this.ais[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.ais.length;
    return ai;
  }
  
  private async _generate(prompt: string, systemInstruction: string, expectJson: boolean): Promise<string> {
     try {
      const ai = this.getNextAiInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
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
      throw new Error("Không thể nhận phản hồi từ AI. Vui lòng kiểm tra lại API Key hoặc thử lại sau.");
    }
  }

  public async getSuggestion(prompt: string, expectJson: boolean = false): Promise<string> {
      return this._generate(prompt, CREATION_SYSTEM_INSTRUCTION, expectJson);
  }

  public async getCharacterSuggestion(races: any[], origins: any[]): Promise<any> {
    const prompt = `Tạo một nhân vật hoàn chỉnh cho game RPG 'Đấu La Đại Lục'. Phản hồi BẮT BUỘC là một đối tượng JSON duy nhất.
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
  }

  public async getSpeciesSuggestion(raceName: string): Promise<{ name: string; description: string }> {
      const prompt = `Dựa trên chủng tộc "${raceName}" trong thế giới Đấu La Đại Lục, hãy tạo ra một giống loài độc nhất với tên và mô tả ngắn gọn (1-2 câu). Trả về dưới dạng JSON với cấu trúc: { "name": "Tên Giống Loài", "description": "Mô tả ngắn gọn" }.`;
      const result = await this.getSuggestion(prompt, true);
      return JSON.parse(result);
  }

  public async getOriginSuggestion(characterPrompt: string): Promise<{ name: string; description: string }> {
    const prompt = `Dựa trên thông tin nhân vật sau đây, hãy tạo ra một Xuất Thân độc đáo và sáng tạo (ví dụ: một ngôi làng bí ẩn, một gia tộc sa sút, một môn phái hắc ám...).
    ---
    Nhân vật:
    ${characterPrompt}
    ---
    Trả về dưới dạng JSON với cấu trúc: { "name": "Tên Xuất Thân", "description": "Mô tả ngắn gọn về xuất thân đó (2-3 câu)." }.`;
    const result = await this.getSuggestion(prompt, true);
    return JSON.parse(result);
  }

  public async getMartialSoulSuggestion(): Promise<{ name: string; description: string; elements: string[] }> {
    const prompt = `Tạo một Võ Hồn độc đáo và sáng tạo cho game nhập vai trong thế giới Đấu La Đại Lục. Vui lòng cung cấp một Tên, một Mô tả ngắn gọn (2-3 câu về sức mạnh và đặc tính), và một mảng chứa từ 1 đến 3 Nguyên Tố phù hợp. Danh sách các nguyên tố có thể chọn là: Hỏa, Băng, Lôi, Phong, Thủy, Thổ, Quang, Ám, Độc, Không Gian, Sinh Mệnh, Hủy Diệt. Trả về kết quả dưới dạng một đối tượng JSON hợp lệ duy nhất có cấu trúc sau: { "name": "string", "description": "string", "elements": ["string", "string", ...] }.`;
    const result = await this.getSuggestion(prompt, true);
    const parsed = JSON.parse(result);
    if (parsed.name && parsed.description && Array.isArray(parsed.elements)) {
        return parsed;
    }
    throw new Error("AI không trả về định dạng Võ Hồn mong muốn.");
  }

  public async getWorldOverview(characterPrompt: string): Promise<string> {
    const prompt = `Dựa trên thông tin nhân vật sau đây, hãy viết một đoạn mô tả thế giới quan (khoảng 3-4 câu) thật hấp dẫn và độc đáo, nơi nhân vật này sinh sống.
    Nhân vật:
    ${characterPrompt}`;
    return this.getSuggestion(prompt, false);
  }

  public async getRealmSystemSuggestion(): Promise<string> {
    const prompt = `Tạo một hệ thống cảnh giới tu luyện cho thế giới huyền huyễn như Đấu La Đại Lục. Liệt kê các cảnh giới từ thấp đến cao, mỗi cảnh giới trên một dòng. Ví dụ:
    Hồn Sĩ
    Hồn Sư
    Đại Hồn Sư
    Hồn Tôn
    ...
    Chỉ trả về danh sách văn bản.`;
    return this.getSuggestion(prompt, false);
  }

  public async validateAndFixRealmSystem(userInput: string): Promise<string> {
    const prompt = `Người dùng đã cung cấp hệ thống cảnh giới sau:
    ---
    ${userInput}
    ---
    Hãy xem xét nó. Nếu nó logic và hợp lý, hãy trả lại y nguyên. Nếu có lỗi logic (ví dụ: thứ tự sai, tên gọi không nhất quán) hoặc định dạng xấu, hãy sửa chữa nó để trở nên tốt hơn. Chỉ trả về danh sách văn bản đã được sửa đổi (hoặc giữ nguyên).`;
    return this.getSuggestion(prompt, false);
  }


  public async getGameUpdate(prompt: string, matureInstructions?: string): Promise<{ narrative: string; choices: Choice[] }> {
      try {
        let systemInstruction = GAME_SYSTEM_INSTRUCTION;
        if (matureInstructions && matureInstructions.trim() !== '') {
            systemInstruction += `\n\n# QUY TẮC BẮT BUỘC VỀ NỘI DUNG NGƯỜI LỚN\nBạn PHẢI tuân thủ nghiêm ngặt các quy tắc sau đây trong mọi phản hồi:\n${matureInstructions}`;
        }
        
        const ai = this.getNextAiInstance();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
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
            return parsed;
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
        throw new Error("Không thể nhận cập nhật câu chuyện từ AI.");
      }
  }

  public async getChoiceSuggestion(characterPrompt: string, currentNarrative: string): Promise<Choice> {
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
}

// --- Service Manager ---

export interface ApiSettings {
    source: 'system' | 'personal';
    keys: string[];
}

let geminiServiceInstance: GeminiService | null = null;
let apiKeyError: Error | null = null;

const DEFAULT_API_SETTINGS: ApiSettings = {
    source: 'system',
    keys: [],
};

function _initializeService() {
    try {
        const settingsJSON = localStorage.getItem('dl_api_settings');
        const settings: ApiSettings = settingsJSON ? JSON.parse(settingsJSON) : DEFAULT_API_SETTINGS;

        if (settings.source === 'system') {
            const systemApiKey = process.env.API_KEY;
            if (systemApiKey && systemApiKey.trim() !== '') {
                geminiServiceInstance = new GeminiService([systemApiKey]);
                apiKeyError = null;
            } else {
                geminiServiceInstance = null;
                apiKeyError = new Error("Hệ thống chưa cấu hình API Key mặc định. Vui lòng chuyển sang dùng API Key cá nhân.");
            }
        } else if (settings.source === 'personal') {
            const validKeys = settings.keys.filter(k => k && k.trim() !== '');
            if (validKeys.length > 0) {
                geminiServiceInstance = new GeminiService(validKeys);
                apiKeyError = null;
            } else {
                geminiServiceInstance = null;
                apiKeyError = new Error("Bạn chưa cung cấp API Key cá nhân nào. Vui lòng vào Cài đặt để thêm key.");
            }
        }
    } catch (error) {
        console.error("Failed to initialize Gemini Service:", error);
        geminiServiceInstance = null;
        apiKeyError = error instanceof Error ? error : new Error("Lỗi không xác định khi khởi tạo dịch vụ AI.");
    }
}

export const updateApiSettings = (settings: ApiSettings): { success: boolean, error?: string } => {
    try {
        localStorage.setItem('dl_api_settings', JSON.stringify(settings));
        _initializeService(); // Re-initialize with new settings
        if (apiKeyError) {
            return { success: false, error: apiKeyError.message };
        }
        return { success: true };
    } catch (e) {
        const errorMsg = "Không thể lưu cài đặt API.";
        console.error(errorMsg, e);
        return { success: false, error: errorMsg };
    }
};

export const getApiSettings = (): ApiSettings => {
    try {
        const settingsJSON = localStorage.getItem('dl_api_settings');
        return settingsJSON ? JSON.parse(settingsJSON) : DEFAULT_API_SETTINGS;
    } catch (e) {
        return DEFAULT_API_SETTINGS;
    }
};

// Initial setup on load
_initializeService();


// A proxy/wrapper to access the service instance
export const geminiService = {
    getSuggestion: (prompt: string, expectJson: boolean = false): Promise<string> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.getSuggestion(prompt, expectJson);
    },
    getCharacterSuggestion: (races: any[], origins: any[]): Promise<any> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.getCharacterSuggestion(races, origins);
    },
    getSpeciesSuggestion: (raceName: string): Promise<{ name: string; description: string }> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.getSpeciesSuggestion(raceName);
    },
    getOriginSuggestion: (characterPrompt: string): Promise<{ name: string; description: string }> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.getOriginSuggestion(characterPrompt);
    },
    getMartialSoulSuggestion: (): Promise<{ name: string; description: string; elements: string[] }> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.getMartialSoulSuggestion();
    },
    getWorldOverview: (characterPrompt: string): Promise<string> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.getWorldOverview(characterPrompt);
    },
    getRealmSystemSuggestion: (): Promise<string> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.getRealmSystemSuggestion();
    },
    validateAndFixRealmSystem: (userInput: string): Promise<string> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.validateAndFixRealmSystem(userInput);
    },
    getGameUpdate: (prompt: string, matureInstructions?: string): Promise<{ narrative: string; choices: Choice[] }> => {
        if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
        return geminiServiceInstance.getGameUpdate(prompt, matureInstructions);
    },
    getChoiceSuggestion: (characterPrompt: string, currentNarrative: string): Promise<Choice> => {
      if (!geminiServiceInstance) return Promise.reject(apiKeyError || new Error("Dịch vụ AI chưa được khởi tạo."));
      return geminiServiceInstance.getChoiceSuggestion(characterPrompt, currentNarrative);
    }
};