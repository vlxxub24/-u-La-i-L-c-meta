import React, { useState, useMemo } from 'react';
import { Character, Gender, MartialSoul, Origin, CharacterStats, InnateTalent, Constitution, Race, Species, Difficulty, DIFFICULTIES, ItemCategory, NPC, Quest, SoulRing } from './types';
import { geminiService } from './services/geminiService';
import Stepper from './components/Stepper';
import SparklesIcon from './components/icons/SparklesIcon';
import UserIcon from './components/icons/UserIcon';
import PawIcon from './components/icons/PawIcon';
import FireIcon from './components/icons/FireIcon';
import { getRealmFromLevel, DEFAULT_REALM_SYSTEM_STRING, DOUGLUO_WORLD_DESCRIPTION } from './data/worldData';
import { SOUL_RING_DATA } from './data/soulRingData';


// --- DATA CONSTANTS ---
const MARTIAL_SOULS: MartialSoul[] = [
  { id: 'bao_tu', name: 'Lam Ngân Thảo', category: 'Hệ khống chế', description: 'Sức sống mãnh liệt, khả năng kiểm soát phi thường.' },
  { id: 'ho_vuong', name: 'Tà Mâu Bạch Hổ', category: 'Hệ cận chiến', description: 'Sức mạnh và tốc độ bùng nổ, sát thương vật lý cao.' },
  { id: 'phuong_hoang_lua', name: 'Tà Hỏa Phượng Hoàng', category: 'Hệ hỏa', description: 'Ngọn lửa cực hạn, khả năng tấn công diện rộng hủy diệt.' },
  { id: 'cuu_tam', name: 'Cửu Tâm Hải Đường', category: 'Hệ hỗ trợ', description: 'Khả năng hồi phục và trị liệu mạnh nhất.' },
  { id: 'thien_kiem', name: 'Thất Sát Kiếm', category: 'Hệ công kích', description: 'Sức tấn công đơn mục tiêu vô song, sắc bén tuyệt đối.' },
];

const CULTIVATION_YEARS = [
    { value: 100, label: 'Bách Niên (100 năm)'},
    { value: 1000, label: 'Thiên Niên (1,000 năm)'},
    { value: 10000, label: 'Vạn Niên (10,000 năm)'},
    { value: 100000, label: 'Thập Vạn Niên (100,000 năm)'},
    { value: 1000000, label: 'Bách Vạn Niên (1,000,000 năm)'},
];

const RACES: Race[] = [
    {
        id: 'human',
        name: 'Loài Người',
        description: 'Chủng tộc đông đảo nhất, sở hữu khả năng sáng tạo và tiềm năng tu luyện vô hạn. Con người có thể thức tỉnh mọi loại Võ Hồn, từ đó bước lên con đường cường giả.',
        icon: UserIcon,
        species: [
            { id: 'commoner', name: 'Thường Dân', description: 'Xuất thân bình thường, là nền tảng của đại đa số cường giả.' },
            { id: 'noble', name: 'Quý Tộc', description: 'Dòng dõi cao quý, có tài nguyên và thiên phú khởi đầu tốt hơn.' },
        ],
    },
    {
        id: 'soul_beast',
        name: 'Hồn Thú',
        description: 'Sinh linh của trời đất, tu luyện theo năm tháng. Khi đạt 10 vạn năm tu vi, Hồn Thú có thể lựa chọn hóa hình thành người để đột phá giới hạn.',
        icon: PawIcon,
        species: [
            { id: 'azure_bull_python', name: 'Thiên Thanh Ngưu Mãng', description: 'Vua của rừng rậm, sức mạnh và phòng ngự tuyệt đỉnh.' },
            { id: 'flame_leopard', name: 'Hỏa Viêm Báo', description: 'Bậc thầy tốc độ và ẩn nấp, tấn công bằng ma hỏa.' },
            { id: 'jade_scorpion', name: 'Bích Lân Hạt', description: 'Sở hữu độc tố cực mạnh, có thể ăn mòn cả Hồn Lực.' },
        ],
    },
    {
        id: 'ancient_beast',
        name: 'Hồn Thú Cổ Đại',
        description: 'Dòng dõi thượng cổ mang huyết mạch Thần cấp. Chúng là những sinh vật cực kỳ hiếm, sinh ra đã sở hữu sức mạnh kinh thiên động địa.',
        icon: PawIcon,
        species: [
            { id: 'golden_dragon_king', name: 'Kim Long Vương', description: 'Huyết mạch Long Thần, sức mạnh vật lý và khí huyết đạt đến cực hạn.' },
            { id: 'ice_jade_emperor_scorpion', name: 'Băng Bích Đế Hoàng Hạt', description: 'Chúa tể của băng giá, mang trong mình nguyên tố băng tuyết tinh khiết nhất.' },
        ],
    },
    {
        id: 'god_clan',
        name: 'Thần Tộc',
        description: 'Hậu duệ của các vị Thần từ Thần Giới. Họ được thừa hưởng một phần Thần Lực, con đường tu luyện thuận lợi hơn người thường rất nhiều.',
        icon: FireIcon,
        species: [
            { id: 'angel_bloodline', name: 'Huyết Mạch Thiên Sứ', description: 'Thừa hưởng sức mạnh của Thiên Sứ Thần, có khả năng thanh tẩy và phán quyết.' },
            { id: 'asura_bloodline', name: 'Huyết Mạch Tu La', description: 'Mang trong mình Sát Thần chi lực, càng chiến càng mạnh.' },
        ],
    },
];

const ORIGINS: Origin[] = [
  { id: 'shrek', name: 'Sử Lai Khắc Học Viện', description: 'Chỉ thu nhận quái vật. Kỹ năng cơ bản vững chắc.' },
  { id: 'qblt', name: 'Thất Bảo Lưu Ly Tông', description: 'Giàu có bậc nhất, khởi đầu với nhiều tài nguyên.' },
  { id: 'sm', name: 'Tinh Đấu Đại Sâm Lâm', description: 'Gần gũi với thiên nhiên, dễ dàng thu phục Hồn Thú.' },
  { id: 'vhd', name: 'Võ Hồn Điện', description: 'Thế lực bá chủ. Bắt đầu với một bí kíp đặc biệt.' },
  { id: 'tan_tu', name: 'Tán Tu', description: 'Tự do tự tại, không ràng buộc, tiềm năng vô hạn.' },
];

const DIFFICULTY_OPTIONS: { name: Difficulty, description: string }[] = [
    { name: 'Dễ', description: 'Trải nghiệm câu chuyện nhẹ nhàng, kẻ địch yếu và ít thử thách hơn.' },
    { name: 'Thường', description: 'Trải nghiệm cân bằng, phù hợp với hầu hết người chơi.' },
    { name: 'Khó', description: 'Thử thách cao hơn, kẻ địch mạnh hơn và cần chiến thuật rõ ràng.' },
    { name: 'Địa Ngục', description: 'Độ khó khắc nghiệt, mọi sai lầm đều có thể trả giá đắt.' }
];

const ELEMENTS: string[] = ['Hỏa', 'Băng', 'Lôi', 'Phong', 'Thủy', 'Thổ', 'Quang', 'Ám', 'Độc', 'Không Gian', 'Sinh Mệnh', 'Hủy Diệt'];

const TOTAL_STAT_POINTS = 30;
const STAT_LABELS: { [key in keyof CharacterStats]: string } = {
    strength: "Sức mạnh",
    intellect: "Trí tuệ",
    physique: "Thể chất",
    agility: "Nhanh nhẹn",
    stamina: "Sức bền",
    luck: "May mắn",
};

// --- INITIAL STATE ---
const initialCharacter: Character = {
  name: '',
  gender: Gender.MALE,
  race: null,
  species: null,
  martialSoul: null,
  cultivationYears: undefined,
  cultivationElements: [],
  origin: null,
  backstory: '',
  innateTalent: null,
  constitution: null,
  stats: {
    strength: 5,
    intellect: 5,
    physique: 5,
    agility: 5,
    stamina: 5,
    luck: 5,
  },
  worldDescription: DOUGLUO_WORLD_DESCRIPTION,
  realmSystem: DEFAULT_REALM_SYSTEM_STRING,
  difficulty: 'Thường',
  hp: { current: 100, max: 100 },
  mana: { current: 50, max: 50 },
  atk: 10,
  money: 0,
  realm: { name: 'Phàm Nhân', level: 1 },
  exp: { current: 0, next: 100 },
  inventory: [],
  equipment: {
    head: null, body: null, feet: null, hands: null, weapon: null,
    accessory1: null, accessory2: null, 'main-gongfa': null, 'sub-gongfa': null
  },
  skills: [],
  soulRings: [],
  currentStatus: [],
  npcs: [],
  activeQuests: [],
};

// --- HELPER COMPONENTS ---
const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "w-5 h-5 border-2 border-amber-300/50 border-t-amber-400 rounded-full animate-spin" }) => (
    <div className={className}></div>
);

const AISuggestButton: React.FC<{onClick: () => void, isLoading: boolean, text?: string, className?: string}> = ({onClick, isLoading, text = "Gợi ý AI", className}) => (
     <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 px-3 py-1.5 bg-black/20 text-amber-300 border border-amber-800 rounded-md hover:bg-amber-900/40 hover:border-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-4 h-4" />}
        <span className="text-sm">{text}</span>
    </button>
);


interface CreationScreenProps {
    onCreationComplete: (character: Character) => void;
    onBackToMenu: () => void;
}

const CreationScreen: React.FC<CreationScreenProps> = ({ onCreationComplete, onBackToMenu }) => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [talentConstitutionMode, setTalentConstitutionMode] = useState<'roll' | 'custom'>('roll');
  const [heavensIntervention, setHeavensIntervention] = useState(false);

  const isSoulBeastRace = useMemo(() => character.race?.id === 'soul_beast' || character.race?.id === 'ancient_beast', [character.race]);
  
  const STEPS = useMemo(() => [
    { label: 'Danh Tính' },
    { label: isSoulBeastRace ? 'Tu Luyện' : 'Võ Hồn' },
    { label: 'Xuất Thân' },
    { label: 'Thiên Phú' },
    { label: 'Tiềm Năng' },
    { label: 'Tổng Quan' },
    { label: 'Độ Khó' }
  ], [isSoulBeastRace]);

  const pointsUsed = useMemo(() => {
    return Object.values(character.stats).reduce((sum, val) => sum + val, 0);
  }, [character.stats]);

  const updateCharacter = <K extends keyof Character>(key: K, value: Character[K]) => {
    setCharacter(prev => ({ ...prev, [key]: value }));
  };
  
  const characterToPromptString = (char: Character): string => {
      const powerSystemPrompt = isSoulBeastRace
        ? `- Tu Vi: ${char.cultivationYears} năm\n- Nguyên Tố: ${char.cultivationElements?.join(', ') || 'Không'}`
        : `- Võ Hồn: ${char.martialSoul?.name || 'Chưa có'} (Loại: ${char.martialSoul?.category || 'N/A'}, Mô tả: ${char.martialSoul?.description || 'N/A'})`;

      return `
- Tên: ${char.name || 'Vô Danh'}
- Giới tính: ${char.gender}
- Chủng Tộc: ${char.race?.name || 'Chưa rõ'}
- Giống Loài: ${char.species?.name || 'Chưa rõ'}
${powerSystemPrompt}
- Xuất Thân: ${char.origin?.name || 'Chưa có'} (${char.origin?.description || 'N/A'})
- Thiên Phú: ${char.innateTalent?.name || 'Không'} (${char.innateTalent?.description || 'N/A'})
- Thể Chất: ${char.constitution?.name || 'Không'} (${char.constitution?.description || 'N/A'})
    `.trim();
  }

  const updateStats = (key: keyof CharacterStats, value: number) => {
      const parsedValue = Math.max(0, value || 0);
      const newStats = { ...character.stats, [key]: parsedValue };

      if (heavensIntervention) {
          setCharacter(prev => ({ ...prev, stats: newStats }));
      } else {
          const total = Object.values(newStats).reduce((sum, val) => sum + val, 0);
          if (total <= TOTAL_STAT_POINTS) {
              setCharacter(prev => ({...prev, stats: newStats}));
          }
      }
  };

  const handleNext = () => {
    if (step < STEPS.length) setStep(s => s + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleAIRequest = async (action: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const finalizeCharacterStats = (char: Character): Character => {
      let finalChar = { ...char };
      const isBeast = finalChar.race?.id === 'soul_beast' || finalChar.race?.id === 'ancient_beast';
      let level = 1;

      // Determine starting level
      if (isBeast && finalChar.cultivationYears) {
          const years = finalChar.cultivationYears;
          if (years >= 1000000) level = 99;
          else if (years >= 100000) level = 95;
          else if (years >= 10000) level = 65;
          else if (years >= 1000) level = 35;
          else if (years >= 100) level = 15;
          else level = 5;
      } else {
          if (finalChar.innateTalent?.name?.includes("Tiên Thiên Mãn Hồn Lực")) {
              level = 10;
          }
      }

      const realm = getRealmFromLevel(level);

      // Base stats
      let baseHp = 80 + finalChar.stats.physique * 15 + level * 5;
      let baseMana = 40 + finalChar.stats.intellect * 10 + level * 5;
      let baseAtk = 10 + finalChar.stats.strength * 2 + level;
      let baseMoney = 10 + (finalChar.stats.luck * 5) + (level * 10);
      
      // Apply huge bonuses for high-level beasts
       if (isBeast && finalChar.cultivationYears) {
          const years = finalChar.cultivationYears;
          if (years >= 100000) {
              baseHp *= 20; baseMana *= 20; baseAtk *= 20;
          } else if (years >= 10000) {
              baseHp *= 5; baseMana *= 5; baseAtk *= 5;
          }
       }


      finalChar.hp = { current: baseHp, max: baseHp };
      finalChar.mana = { current: baseMana, max: baseMana };
      finalChar.atk = baseAtk;
      finalChar.money = baseMoney;
      finalChar.realm = realm;
      finalChar.exp = { current: 0, next: level * 100 + 100 };
      
      // Add starting NPCs and Quests
      if (!finalChar.npcs || finalChar.npcs.length === 0) {
         if (finalChar.origin?.id === 'sm') { // Tinh Đấu Đại Sâm Lâm
             finalChar.npcs = [{
                id: 'daiming', name: 'Đại Minh', gender: Gender.MALE, avatar: '',
                realm: 'Phong Hào Đấu La (20 vạn năm)', attitude: 'Thân thiện',
                description: 'Thiên Thanh Ngưu Mãng, một trong hai vị vua của Tinh Đấu Đại Sâm Lâm. Tính tình nóng nảy nhưng trọng tình nghĩa.'
             }];
         } else { // Mặc định
             finalChar.npcs = [{
                id: 'jack', name: 'Già Làng Jack', gender: Gender.MALE, avatar: '',
                realm: 'Phàm Nhân', attitude: 'Thân thiện',
                description: 'Trưởng thôn của Thánh Hồn Thôn, người đã dẫn dắt vô số đứa trẻ thức tỉnh Võ Hồn.'
             }];
         }
      }

      if (!finalChar.activeQuests || finalChar.activeQuests.length === 0) {
          finalChar.activeQuests = [{
              id: 'main_quest_1',
              title: 'Thức Tỉnh Võ Hồn',
              description: 'Đã đến lúc vận mệnh được định đoạt. Hãy đến quảng trường của làng để tham gia lễ thức tỉnh Võ Hồn hàng năm.',
              isCompleted: false
          }];
      }

      // Add starting soul rings
      if (!finalChar.soulRings || finalChar.soulRings.length === 0) {
          finalChar.soulRings = [];
          if (isBeast && finalChar.cultivationYears) {
              const years = finalChar.cultivationYears;
              if (years >= 100000) {
                  const ring1 = SOUL_RING_DATA.find(r => r.id === 'blue_silver_emperor');
                  const ring2 = SOUL_RING_DATA.find(r => r.id === 'ghost_tiger');
                  if (ring1) finalChar.soulRings.push(ring1);
                  if (ring2) finalChar.soulRings.push(ring2);
              } else if (years >= 10000) {
                  const ring1 = SOUL_RING_DATA.find(r => r.id === 'ghost_tiger');
                  if (ring1) finalChar.soulRings.push(ring1);
              }
          } else if (level >= 10) {
              const ring1 = SOUL_RING_DATA.find(r => r.id === 'mandala_snake');
              if (ring1) finalChar.soulRings.push(ring1);
          }
      }

      return finalChar;
  }
  
  const handleFinishCreation = async () => {
    setIsFinalizing(true);
    setError(null);
    let finalCharacter: Character;
    try {
        let charToFinalize = {...character};
        
        if (charToFinalize.inventory.length === 0) {
            charToFinalize.inventory.push({ id: 'start_item_1', name: 'Thính Phong Nhĩ Hoàn', description: 'Một chiếc khuyên tai đơn giản, giúp lắng nghe những âm thanh từ xa.', category: ItemCategory.EQUIPMENT, quantity: 1, bonus: 'Nhanh nhẹn +1', slot: 'accessory1' });
        }
        if (charToFinalize.skills.length === 0) {
            charToFinalize.skills.push({ name: 'Linh Giác Chi Nhãn', description: 'Khả năng cảm nhận thế giới thông qua linh giác cường hóa, nhận biết dòng chảy linh khí, rung động và bản chất sự vật thay vì thị giác vật lý.', manaCost: 0, cooldown: 0 });
        }

        const charPrompt = characterToPromptString(charToFinalize);
        const prompt = `Dựa trên thông tin nhân vật sau đây, hãy tạo ra một "adventureTitle" (tiêu đề cho cuộc phiêu lưu, thật kêu và hấp dẫn) và một mảng "personalityTraits" (2-3 tính cách nổi bật).
---
Nhân vật:
${charPrompt}
---
Trả về dưới dạng JSON với cấu trúc: { "adventureTitle": "string", "personalityTraits": ["string", "string"] }.`;

        const result = await geminiService.getSuggestion(prompt, true);
        const parsed = JSON.parse(result);

        const characterWithAITraits = {
            ...charToFinalize,
            adventureTitle: parsed.adventureTitle || `Hành trình của ${charToFinalize.name}`,
            personalityTraits: parsed.personalityTraits || ['Dũng cảm', 'Bí ẩn'],
        };
        finalCharacter = finalizeCharacterStats(characterWithAITraits);
        onCreationComplete(finalCharacter);
    } catch (e) {
        setError("Không thể hoàn tất nhân vật với AI. Sử dụng giá trị mặc định.");
        let fallbackCharacter = {...character};
        if (fallbackCharacter.inventory.length === 0) {
            fallbackCharacter.inventory.push({ id: 'start_item_1', name: 'Thính Phong Nhĩ Hoàn', description: 'Một chiếc khuyên tai đơn giản, giúp lắng nghe những âm thanh từ xa.', category: ItemCategory.EQUIPMENT, quantity: 1, bonus: 'Nhanh nhẹn +1', slot: 'accessory1' });
        }
        if (fallbackCharacter.skills.length === 0) {
            fallbackCharacter.skills.push({ name: 'Linh Giác Chi Nhãn', description: 'Khả năng cảm nhận thế giới thông qua linh giác cường hóa, nhận biết dòng chảy linh khí, rung động và bản chất sự vật thay vì thị giác vật lý.', manaCost: 0, cooldown: 0 });
        }
        const characterWithDefaults = {
            ...fallbackCharacter,
            adventureTitle: `Hành trình của ${fallbackCharacter.name}`,
            personalityTraits: ['Dũng cảm', 'Bí ẩn'],
        };
        finalCharacter = finalizeCharacterStats(characterWithDefaults);
        setTimeout(() => onCreationComplete(finalCharacter), 1500);
    } finally {
        setIsFinalizing(false);
    }
  };

  const handleDestinyRoll = () => handleAIRequest(async () => {
    const raceOptions = RACES.map(r => ({ id: r.id, name: r.name }));
    const originOptions = ORIGINS.map(o => ({ id: o.id, name: o.name }));
    const result = await geminiService.getCharacterSuggestion(raceOptions, originOptions);

    const race = RACES.find(r => r.id === result.race.id) || null;
    const origin = ORIGINS.find(o => o.id === result.origin.id) || null;
    
    let newCharacter: Character = {
        ...initialCharacter,
        name: result.name,
        gender: result.gender,
        race: race,
        species: { ...result.species, id: 'custom_ai', isCustom: true },
        martialSoul: result.martialSoul ? { ...result.martialSoul, id: 'custom_ai', isCustom: true } : null,
        cultivationYears: result.cultivationYears,
        cultivationElements: result.cultivationElements,
        origin: origin,
        backstory: result.backstory,
        innateTalent: result.innateTalent,
        constitution: result.constitution,
        stats: result.stats,
        worldDescription: result.worldDescription,
        realmSystem: result.realmSystem,
        difficulty: 'Thường', // Default difficulty for AI roll
    };
    
    // We don't finalize stats here, we just set the character state.
    // Finalization will happen when user clicks "Finish Creation".
    setCharacter(newCharacter);
  });
  
  const handleSpeciesRoll = () => handleAIRequest(async () => {
    if (!character.race) return;
    const result = await geminiService.getSpeciesSuggestion(character.race.name);
    if(result.name && result.description) {
        updateCharacter('species', { ...result, id: 'custom_ai', isCustom: true });
    }
  });

  const handleOriginSuggestion = () => handleAIRequest(async () => {
    const prompt = characterToPromptString(character);
    const result = await geminiService.getOriginSuggestion(prompt);
     if (result.name && result.description) {
        const updatedOrigin: Origin = {
            id: 'custom_ai',
            isCustom: true,
            name: result.name,
            description: result.description,
        };
        updateCharacter('origin', updatedOrigin);
    }
  });

  const handleMartialSoulSuggestion = () => handleAIRequest(async () => {
    const result = await geminiService.getMartialSoulSuggestion();
    if (result.name && result.description && result.elements) {
        const updatedSoul: MartialSoul = {
            id: 'custom_ai',
            isCustom: true,
            category: 'Tự định nghĩa',
            name: result.name,
            description: result.description,
            elements: result.elements,
        };
        updateCharacter('martialSoul', updatedSoul);
    }
  });

  const handleTalentConstitutionRoll = () => handleAIRequest(async () => {
      const prompt = `Tạo ra một Thiên Phú và một Thể Chất độc đáo cho nhân vật trong Đấu La Đại Lục. Kết quả phải ở định dạng JSON với cấu trúc: { "talent": { "name": "Tên Thiên Phú", "description": "Mô tả" }, "constitution": { "name": "Tên Thể Chất", "description": "Mô tả" } }. Phân loại sức mạnh (ví dụ: Phàm Phẩm, Huyền Phẩm, Địa Phẩm, Thiên Phẩm, Thần Phẩm) và thêm vào mô tả.`;
      const result = await geminiService.getSuggestion(prompt, true);
      const parsed = JSON.parse(result);
      if (parsed.talent && parsed.constitution) {
          updateCharacter('innateTalent', parsed.talent);
          updateCharacter('constitution', parsed.constitution);
      } else {
          throw new Error("AI response did not contain talent and constitution.");
      }
  });

  const handleCustomDescriptionSuggestion = (type: 'talent' | 'constitution' | 'species' | 'origin') => handleAIRequest(async () => {
    let entity, name, prompt;

    const basePrompt = (entityType: string, entityName: string) => 
        `Viết một mô tả khái niệm (2-3 câu) cho một ${entityType} có tên là "${entityName}" trong thế giới Đấu La Đại Lục.`;

    switch(type) {
        case 'species':
            entity = character.species;
            name = entity?.name;
            prompt = `Viết một mô tả khái niệm (2-3 câu) cho một Giống Loài có tên là "${name}" thuộc chủng tộc "${character.race?.name}" trong thế giới Đấu La Đại Lục.`;
            break;
        case 'talent':
            entity = character.innateTalent;
            name = entity?.name;
            prompt = basePrompt('Thiên Phú', name || '');
            break;
        case 'constitution':
            entity = character.constitution;
            name = entity?.name;
            prompt = basePrompt('Thể Chất', name || '');
            break;
        case 'origin':
            entity = character.origin;
            name = entity?.name;
            prompt = basePrompt('Xuất Thân', name || '');
            break;
    }

    if (!name) {
        setError(`Vui lòng nhập tên trước.`);
        return;
    }

    const result = await geminiService.getSuggestion(prompt);

    switch(type) {
        case 'talent':
            updateCharacter('innateTalent', { ...(character.innateTalent || { name: '' }), description: result });
            break;
        case 'constitution':
            updateCharacter('constitution', { ...(character.constitution || { name: '' }), description: result });
            break;
        case 'species':
            updateCharacter('species', { ...(character.species!), description: result });
            break;
        case 'origin':
            updateCharacter('origin', { ...(character.origin!), description: result });
            break;
    }
  });


  const handleBackstorySuggestion = () => handleAIRequest(async () => {
      if ((!isSoulBeastRace && !character.martialSoul) || !character.origin) {
          setError("Vui lòng chọn đầy đủ thông tin ở các bước trước.");
          return;
      }
      
      const prompt = `Viết một cốt truyện ngắn (3-4 câu) cho một nhân vật dựa trên các thông tin sau: \n${characterToPromptString(character)}`;
      const result = await geminiService.getSuggestion(prompt);
      updateCharacter('backstory', result);
  });

  const handleWorldOverviewSuggestion = () => handleAIRequest(async () => {
    const prompt = characterToPromptString(character);
    const result = await geminiService.getWorldOverview(prompt);
    updateCharacter('worldDescription', result);
  });

  const handleRealmSystemSuggestion = () => handleAIRequest(async () => {
      const result = await geminiService.getRealmSystemSuggestion();
      updateCharacter('realmSystem', result);
  });

  const handleRealmSystemValidation = () => handleAIRequest(async () => {
    if(!character.realmSystem) return;
    const result = await geminiService.validateAndFixRealmSystem(character.realmSystem);
    updateCharacter('realmSystem', result);
  });


  const handleCustomSoulChange = (field: 'name' | 'description', value: string) => {
    if (!character.martialSoul?.isCustom) return;
    const updatedSoul = { ...character.martialSoul, [field]: value };
    updateCharacter('martialSoul', updatedSoul as MartialSoul);
  };
  
  const handleCustomOriginChange = (field: 'name' | 'description', value: string) => {
    if (!character.origin?.isCustom) return;
    const updatedOrigin = { ...character.origin, [field]: value };
    updateCharacter('origin', updatedOrigin as Origin);
  };

  const handleElementToggle = (element: string, forSoulBeast: boolean) => {
    if(forSoulBeast) {
        const currentElements = character.cultivationElements ?? [];
        const newElements = currentElements.includes(element)
            ? currentElements.filter(el => el !== element)
            : [...currentElements, element];
        
        if (newElements.length > 3) {
            setError("Bạn chỉ có thể chọn tối đa 3 nguyên tố.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        setError(null);
        updateCharacter('cultivationElements', newElements);

    } else { // For custom Martial Soul
        if (!character.martialSoul?.isCustom) return;
        const currentElements = character.martialSoul.elements ?? [];
        const newElements = currentElements.includes(element)
            ? currentElements.filter(el => el !== element)
            : [...currentElements, element];

        if (newElements.length > 3) {
            setError("Bạn chỉ có thể chọn tối đa 3 nguyên tố.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        setError(null);

        const updatedSoul = { ...character.martialSoul, elements: newElements };
        updateCharacter('martialSoul', updatedSoul as MartialSoul);
    }
  };
  
  const getValidationMessage = (): string | null => {
    switch(step) {
        case 1:
            if (!character.name) return "Vui lòng nhập tên nhân vật.";
            if (!character.race) return "Vui lòng chọn một Chủng Tộc.";
            if (!character.species) return "Vui lòng chọn một Giống Loài.";
            if (character.species.isCustom && !character.species.name) return "Vui lòng nhập tên cho Giống Loài tự định nghĩa.";
            return null;
        case 2: 
            if (isSoulBeastRace) {
                if (!character.cultivationYears) return "Vui lòng chọn Tu Vi ban đầu.";
                if (!character.cultivationElements || character.cultivationElements.length === 0) return "Vui lòng chọn ít nhất một Nguyên Tố.";
            } else {
                if (!character.martialSoul) return "Vui lòng chọn hoặc tạo một Võ Hồn.";
                if (character.martialSoul.isCustom && !character.martialSoul.name) return "Vui lòng nhập tên cho Võ Hồn tự định nghĩa.";
            }
            return null;
        case 3: 
            if (!character.origin) return "Vui lòng chọn một Xuất Thân.";
            if (character.origin.isCustom && !character.origin.name) return "Vui lòng nhập tên cho Xuất Thân tự định nghĩa.";
            return null;
        case 4: 
            if (!character.innateTalent || !character.innateTalent.name) return "Vui lòng điền hoặc gieo một Thiên Phú.";
            if (!character.constitution || !character.constitution.name) return "Vui lòng điền hoặc gieo một Thể Chất.";
            return null;
        case 5: 
            if (!heavensIntervention && pointsUsed !== TOTAL_STAT_POINTS) return `Vui lòng phân phối chính xác ${TOTAL_STAT_POINTS} điểm. Hiện tại: ${pointsUsed}.`;
            return null;
        default: 
            return null;
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1: // Identity
        return (
            <>
                <h2 className="text-2xl font-bold text-amber-300 mb-6">Danh Tính</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="char-name" className="block text-sm font-medium text-stone-300 mb-2">Tên nhân vật</label>
                        <input type="text" id="char-name" value={character.name} onChange={(e) => updateCharacter('name', e.target.value)}
                            className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">Giới tính</label>
                        <div className="flex gap-4">
                            {Object.values(Gender).map(g => (
                                <button key={g} onClick={() => updateCharacter('gender', g)}
                                    className={`px-4 py-2 rounded-md border text-sm transition ${character.gender === g ? 'bg-amber-800/60 border-amber-600 text-white' : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/80'}`}>
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">Chủng Tộc</label>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {RACES.map(r => (
                                <button key={r.id} onClick={() => {
                                    const newRace = r;
                                    const isNewRaceSoulBeast = newRace.id === 'soul_beast' || newRace.id === 'ancient_beast';

                                    setCharacter(prev => {
                                        const updated = { ...prev, race: newRace, species: null };

                                        // Clear conflicting power system data when race type changes
                                        if (isNewRaceSoulBeast) {
                                            updated.martialSoul = null; // Clear martial soul if new race is beast
                                        } else {
                                            updated.cultivationYears = undefined; // Clear beast data if new race is not beast
                                            updated.cultivationElements = [];
                                        }

                                        return updated;
                                    });
                                }}
                                    className={`p-3 border-2 rounded-lg text-center transition-all ${character.race?.id === r.id ? 'border-amber-500 bg-amber-900/20' : 'border-stone-700 hover:border-amber-700/40 hover:bg-stone-800/50'}`}>
                                    <r.icon className="w-8 h-8 mx-auto mb-2 text-amber-400"/>
                                    <h3 className="font-semibold text-sm text-stone-200">{r.name}</h3>
                                </button>
                            ))}
                        </div>
                    </div>
                    {character.race && (
                         <div>
                            <p className="text-sm text-stone-400 italic mb-4">{character.race.description}</p>
                            <label htmlFor="species-select" className="block text-sm font-medium text-stone-300 mb-2">Giống Loài</label>
                            <div className="flex gap-2 items-stretch">
                                <select id="species-select"
                                    value={character.species?.id || ''}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        if (selectedId === 'custom') {
                                            updateCharacter('species', {id: 'custom', name: '', description: '', isCustom: true});
                                        } else {
                                            const selectedSpecies = character.race?.species.find(s => s.id === selectedId);
                                            updateCharacter('species', selectedSpecies || null);
                                        }
                                    }}
                                    className="flex-grow w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition">
                                    <option value="" disabled>-- Chọn một giống loài --</option>
                                    {character.race.species.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    <option value="custom" className="font-bold text-amber-300">Tự Định Nghĩa...</option>
                                </select>
                                <AISuggestButton onClick={handleSpeciesRoll} isLoading={isLoading} text="Gieo Vận Mệnh"/>
                            </div>
                            {character.species?.isCustom && (
                                <div className="mt-4 p-4 border-t-2 border-amber-800 bg-black/20 space-y-4 rounded-b-lg">
                                    <label className="block text-sm font-medium text-stone-300">Tên Giống Loài Tự Định Nghĩa</label>
                                    <input type="text" value={character.species.name}
                                        onChange={e => updateCharacter('species', {...character.species, name: e.target.value})}
                                        className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2" />
                                    <label className="block text-sm font-medium text-stone-300">Mô tả</label>
                                    <textarea value={character.species.description}
                                        onChange={e => updateCharacter('species', {...character.species, description: e.target.value})}
                                        rows={3} className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2"/>
                                    <div className="mt-2">
                                        <AISuggestButton onClick={() => handleCustomDescriptionSuggestion('species')} isLoading={isLoading} />
                                    </div>
                                </div>
                            )}
                            {character.species && !character.species.isCustom && <p className="text-sm text-stone-400 italic mt-2">{character.species.description}</p>}
                        </div>
                    )}
                </div>
            </>
        );
      case 2: // Martial Soul or Cultivation
        if (isSoulBeastRace) {
            return (
                <>
                    <h2 className="text-2xl font-bold text-amber-300 mb-2">Con Đường Tu Luyện</h2>
                    <p className="text-stone-400 mb-6">Nền tảng sức mạnh của Hồn Thú đến từ năm tháng và nguyên tố.</p>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Tu Vi Ban Đầu</label>
                            <div className="grid md:grid-cols-3 gap-3">
                                {CULTIVATION_YEARS.map(item => (
                                    <button key={item.value} onClick={() => updateCharacter('cultivationYears', item.value)}
                                        className={`p-3 border-2 rounded-lg text-center transition-all ${character.cultivationYears === item.value ? 'border-amber-500 bg-amber-900/20' : 'border-stone-700 hover:border-amber-700/40 hover:bg-stone-800/50'}`}>
                                        <h3 className="font-semibold text-sm text-stone-200">{item.label}</h3>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-stone-300 mb-2">Nguyên Tố Tu Luyện (chọn tối đa 3)</label>
                             <div className="flex flex-wrap gap-2">
                                {ELEMENTS.map(el => (
                                    <button key={el} onClick={() => handleElementToggle(el, true)}
                                        className={`px-3 py-1 text-xs rounded-full border transition-all ${character.cultivationElements?.includes(el) ? 'bg-amber-400 border-amber-300 text-stone-900 font-semibold' : 'bg-stone-800 border-stone-700 hover:bg-stone-700'}`}>
                                        {el}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </>
            );
        }
        return (
            <>
                <h2 className="text-2xl font-bold text-amber-300 mb-2">Thức tỉnh Võ Hồn</h2>
                <p className="text-stone-400 mb-6">Sức mạnh cốt lõi định hình con đường của bạn.</p>
                <div className="grid md:grid-cols-2 gap-4">
                    {MARTIAL_SOULS.map(soul => (
                        <button key={soul.id} onClick={() => updateCharacter('martialSoul', soul)}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${character.martialSoul?.id === soul.id ? 'border-amber-500 bg-amber-900/20' : 'border-stone-700 hover:border-amber-700/40 hover:bg-stone-800/50'}`}>
                            <h3 className="font-bold text-lg text-amber-400">{soul.name}</h3>
                            <p className="text-sm text-amber-500 mb-2">{soul.category}</p>
                            <p className="text-sm text-stone-400">{soul.description}</p>
                        </button>
                    ))}
                </div>
                <div className="my-4 flex items-center">
                    <div className="flex-grow border-t border-stone-700"></div>
                    <span className="flex-shrink mx-4 text-stone-500 text-sm">hoặc</span>
                    <div className="flex-grow border-t border-stone-700"></div>
                </div>
                <button onClick={() => updateCharacter('martialSoul', {id: 'custom', name: '', description: '', category: 'Tự định nghĩa', isCustom: true, elements: []})}
                    className={`w-full p-4 border-2 rounded-lg text-center transition-all ${character.martialSoul?.isCustom ? 'border-amber-500 bg-amber-900/20' : 'border-stone-700 hover:border-amber-700/40 hover:bg-stone-800/50'}`}>
                    <h3 className="font-bold text-lg text-amber-400">Tự định nghĩa Võ Hồn</h3>
                </button>
                {character.martialSoul?.isCustom && (
                    <div className="mt-4 p-4 border-t-2 border-amber-800 bg-black/20 space-y-4 rounded-b-lg">
                        <div className="text-center mb-4 border-b border-stone-700 pb-4">
                            <p className="text-sm text-stone-400 mb-2">Không có ý tưởng? Hãy để AI giúp bạn!</p>
                            <AISuggestButton onClick={handleMartialSoulSuggestion} isLoading={isLoading} text="AI Gợi Ý Võ Hồn" className="px-4 py-2" />
                        </div>
                        <div>
                            <label htmlFor="custom-soul-name" className="block text-sm font-medium text-stone-300 mb-2">Tên Võ Hồn</label>
                            <input type="text" id="custom-soul-name" value={character.martialSoul.name} onChange={(e) => handleCustomSoulChange('name', e.target.value)}
                                className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition"
                                placeholder="Ví dụ: Băng Hồn Cốt Long"/>
                        </div>
                        <div>
                            <label htmlFor="custom-soul-desc" className="block text-sm font-medium text-stone-300 mb-2">Mô tả Võ Hồn</label>
                            <textarea
                                id="custom-soul-desc"
                                value={character.martialSoul.description}
                                onChange={(e) => handleCustomSoulChange('description', e.target.value)}
                                rows={3}
                                className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition"
                                placeholder="Mô tả sức mạnh, hình dạng, và đặc tính của Võ Hồn."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Nguyên Tố (chọn tối đa 3)</label>
                             <div className="flex flex-wrap gap-2">
                                {ELEMENTS.map(el => (
                                    <button key={el} onClick={() => handleElementToggle(el, false)}
                                        className={`px-3 py-1 text-xs rounded-full border transition-all ${character.martialSoul?.elements?.includes(el) ? 'bg-amber-400 border-amber-300 text-stone-900 font-semibold' : 'bg-stone-800 border-stone-700 hover:bg-stone-700'}`}>
                                        {el}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                )}
            </>
        );
      case 3: // Origin
        return (
            <>
                <h2 className="text-2xl font-bold text-amber-300 mb-2">Lựa chọn Xuất Thân</h2>
                <p className="text-stone-400 mb-6">Nơi bạn bắt đầu sẽ ảnh hưởng đến con đường phía trước.</p>
                 <div className="grid md:grid-cols-2 gap-4">
                    {ORIGINS.map(origin => (
                        <button key={origin.id} onClick={() => updateCharacter('origin', origin)}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${character.origin?.id === origin.id ? 'border-amber-500 bg-amber-900/20' : 'border-stone-700 hover:border-amber-700/40 hover:bg-stone-800/50'}`}>
                            <h3 className="font-bold text-lg text-amber-400">{origin.name}</h3>
                            <p className="text-sm text-stone-400">{origin.description}</p>
                        </button>
                    ))}
                </div>
                 <div className="my-4 flex items-center">
                    <div className="flex-grow border-t border-stone-700"></div>
                    <span className="flex-shrink mx-4 text-stone-500 text-sm">hoặc</span>
                    <div className="flex-grow border-t border-stone-700"></div>
                </div>
                <button onClick={() => updateCharacter('origin', {id: 'custom', name: '', description: '', isCustom: true})}
                    className={`w-full p-4 border-2 rounded-lg text-center transition-all ${character.origin?.isCustom ? 'border-amber-500 bg-amber-900/20' : 'border-stone-700 hover:border-amber-700/40 hover:bg-stone-800/50'}`}>
                    <h3 className="font-bold text-lg text-amber-400">Tự định nghĩa Xuất Thân</h3>
                </button>
                {character.origin?.isCustom && (
                    <div className="mt-4 p-4 border-t-2 border-amber-800 bg-black/20 space-y-4 rounded-b-lg">
                        <div className="text-center mb-4 border-b border-stone-700 pb-4">
                             <AISuggestButton onClick={handleOriginSuggestion} isLoading={isLoading} text="AI Gợi Ý Xuất Thân" className="px-4 py-2" />
                        </div>
                        <div>
                            <label htmlFor="custom-origin-name" className="block text-sm font-medium text-stone-300 mb-2">Tên Xuất Thân</label>
                            <input type="text" id="custom-origin-name" value={character.origin.name} onChange={(e) => handleCustomOriginChange('name', e.target.value)}
                                className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition"
                                placeholder="Ví dụ: Làng Thợ Rèn Thánh Hồn"/>
                        </div>
                        <div>
                            <label htmlFor="custom-origin-desc" className="block text-sm font-medium text-stone-300 mb-2">Mô tả Xuất Thân</label>
                            <textarea
                                id="custom-origin-desc"
                                value={character.origin.description}
                                onChange={(e) => handleCustomOriginChange('description', e.target.value)}
                                rows={3}
                                className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition"
                                placeholder="Mô tả về nơi bạn lớn lên, gia tộc, hoặc quá khứ..."
                            />
                             <div className="mt-2">
                                <AISuggestButton onClick={() => handleCustomDescriptionSuggestion('origin')} isLoading={isLoading} />
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
       case 4: // Talent and Constitution
        return (
            <>
                <h2 className="text-2xl font-bold text-amber-300 mb-2">Thiên Phú & Thể Chất</h2>
                <p className="text-stone-400 mb-6">Những món quà trời ban định hình tiềm năng của bạn.</p>
                <div className="flex justify-center mb-6">
                    <div className="p-1 bg-stone-900/80 border border-stone-700 rounded-lg flex gap-1">
                        <button onClick={() => setTalentConstitutionMode('roll')} className={`px-4 py-1.5 text-sm rounded-md transition ${talentConstitutionMode === 'roll' ? 'bg-amber-700 text-white shadow' : 'text-stone-300 hover:bg-stone-700/50'}`}>
                            Gieo Vận Mệnh
                        </button>
                        <button onClick={() => setTalentConstitutionMode('custom')} className={`px-4 py-1.5 text-sm rounded-md transition ${talentConstitutionMode === 'custom' ? 'bg-amber-700 text-white shadow' : 'text-stone-300 hover:bg-stone-700/50'}`}>
                            Tự Định Nghĩa
                        </button>
                    </div>
                </div>

                {talentConstitutionMode === 'roll' ? (
                     <div className="text-center">
                         <button onClick={handleTalentConstitutionRoll} disabled={isLoading} className="px-6 py-3 bg-amber-800/40 text-amber-200 border border-amber-600 rounded-lg hover:bg-amber-800/60 transition flex items-center gap-3 mx-auto disabled:opacity-50">
                             {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-5 h-5" />}
                             Nhận Thiên Mệnh Gợi Ý
                         </button>
                         {character.innateTalent && character.constitution && (
                            <div className="mt-6 space-y-4 text-left">
                                <div className="p-4 bg-black/20 border border-stone-700 rounded-lg">
                                    <h3 className="font-bold text-amber-400">Thiên Phú: {character.innateTalent.name}</h3>
                                    <p className="text-sm text-stone-300 italic">{character.innateTalent.description}</p>
                                </div>
                                <div className="p-4 bg-black/20 border border-stone-700 rounded-lg">
                                    <h3 className="font-bold text-amber-400">Thể Chất: {character.constitution.name}</h3>
                                    <p className="text-sm text-stone-300 italic">{character.constitution.description}</p>
                                </div>
                            </div>
                         )}
                     </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-black/20 border border-stone-700 rounded-lg">
                            <label className="block text-sm font-medium text-stone-300 mb-2">Tên Thiên Phú</label>
                            <input type="text" value={character.innateTalent?.name || ''}
                                onChange={e => updateCharacter('innateTalent', {...(character.innateTalent || { description: '' }), name: e.target.value})}
                                className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2" />
                            <label className="block text-sm font-medium text-stone-300 mt-4 mb-2">Mô tả Thiên Phú</label>
                            <textarea value={character.innateTalent?.description || ''}
                                onChange={e => updateCharacter('innateTalent', {...(character.innateTalent || { name: '' }), description: e.target.value})}
                                rows={3} className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2"/>
                            <div className="mt-2">
                                <AISuggestButton onClick={() => handleCustomDescriptionSuggestion('talent')} isLoading={isLoading} />
                            </div>
                        </div>
                        <div className="p-4 bg-black/20 border border-stone-700 rounded-lg">
                             <label className="block text-sm font-medium text-stone-300 mb-2">Tên Thể Chất</label>
                            <input type="text" value={character.constitution?.name || ''}
                                onChange={e => updateCharacter('constitution', {...(character.constitution || { description: '' }), name: e.target.value})}
                                className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2" />
                            <label className="block text-sm font-medium text-stone-300 mt-4 mb-2">Mô tả Thể Chất</label>
                            <textarea value={character.constitution?.description || ''}
                                onChange={e => updateCharacter('constitution', {...(character.constitution || { name: '' }), description: e.target.value})}
                                rows={3} className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2"/>
                            <div className="mt-2">
                                <AISuggestButton onClick={() => handleCustomDescriptionSuggestion('constitution')} isLoading={isLoading} />
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
      case 5: // Potential
        return (
            <>
                <h2 className="text-2xl font-bold text-amber-300 mb-2">Phân bố Tiềm Năng</h2>
                <p className="text-stone-400 mb-6">Phân chia điểm tiềm năng để định hình sức mạnh ban đầu của bạn.</p>
                <div className={`p-4 rounded-lg transition-all duration-500 ${heavensIntervention ? 'bg-amber-900/20 border border-amber-600' : 'bg-black/20 border border-stone-700'}`}>
                   <div className="flex justify-between items-center">
                        <h3 className="font-bold text-amber-300">Tổng điểm còn lại: {heavensIntervention ? '∞' : TOTAL_STAT_POINTS - pointsUsed}</h3>
                        <div className="flex items-center gap-2">
                            <label htmlFor="heavens-toggle" className="text-sm text-stone-400">Thiên Đạo Can Thiệp</label>
                            <input
                                id="heavens-toggle"
                                type="checkbox"
                                checked={heavensIntervention}
                                onChange={(e) => setHeavensIntervention(e.target.checked)}
                                className="h-4 w-4 rounded bg-stone-700 border-stone-600 text-amber-600 focus:ring-amber-500"
                            />
                        </div>
                   </div>
                   <p className="text-xs text-stone-500 mt-1 mb-6">
                       {heavensIntervention ? "Cảnh báo: Bạn đã phá vỡ quy tắc, hậu quả khó lường!" : `Bạn có ${TOTAL_STAT_POINTS} điểm để phân phối.`}
                   </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(character.stats).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-stone-300 mb-1">{STAT_LABELS[key as keyof CharacterStats]}</label>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateStats(key as keyof CharacterStats, value - 1)} className="px-2 py-0.5 bg-stone-700 rounded">-</button>
                                    <input type="number" value={value}
                                        onChange={(e) => updateStats(key as keyof CharacterStats, parseInt(e.target.value, 10))}
                                        className="w-16 text-center bg-stone-900 border border-stone-700 rounded-md p-1"
                                    />
                                    <button onClick={() => updateStats(key as keyof CharacterStats, value + 1)} className="px-2 py-0.5 bg-stone-700 rounded">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
      case 6: // Overview
         return (
             <>
                <h2 className="text-2xl font-bold text-amber-300 mb-2">Tổng Quan Nhân Vật</h2>
                <p className="text-stone-400 mb-6">Xem lại và hoàn thiện linh hồn bạn vừa tạo ra.</p>
                <div className="bg-black/20 p-4 border border-stone-700 rounded-lg space-y-4 text-sm">
                    <div className="flex flex-col sm:flex-row"><strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Tên:</strong> <span>{character.name || 'Chưa đặt tên'}</span></div>
                    <div className="flex flex-col sm:flex-row"><strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Giới tính:</strong> <span>{character.gender}</span></div>
                    <div className="flex flex-col sm:flex-row"><strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Chủng Tộc:</strong> <span>{character.race?.name || 'Chưa chọn'}</span></div>
                    <div className="flex flex-col sm:flex-row"><strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Giống Loài:</strong> <span>{character.species?.name || 'Chưa chọn'}</span></div>
                    
                    {isSoulBeastRace ? (
                        <>
                         <div className="flex flex-col sm:flex-row"><strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Tu Vi:</strong> <span>{character.cultivationYears} năm</span></div>
                         <div className="flex flex-col sm:flex-row"><strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Nguyên Tố:</strong> <span>{character.cultivationElements?.join(', ') || 'Không'}</span></div>
                        </>
                    ) : (
                        <div className="flex flex-col sm:flex-row"><strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Võ Hồn:</strong> <span>{character.martialSoul?.name || 'Chưa chọn'}</span></div>
                    )}
                    <div className="flex flex-col sm:flex-row"><strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Xuất Thân:</strong> <span>{character.origin?.name || 'Chưa chọn'}</span></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-start">
                        <strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Thiên Phú:</strong> 
                        <div className="flex-grow">
                           <p>{character.innateTalent?.name || 'Chưa có'}</p>
                           {character.innateTalent && <p className="text-xs text-stone-400 italic">{character.innateTalent.description}</p>}
                        </div>
                    </div>
                     <div className="flex flex-col sm:flex-row sm:items-start">
                        <strong className="font-semibold text-amber-300 w-full sm:w-28 flex-shrink-0">Thể Chất:</strong> 
                        <div className="flex-grow">
                           <p>{character.constitution?.name || 'Chưa có'}</p>
                           {character.constitution && <p className="text-xs text-stone-400 italic">{character.constitution.description}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <strong className="font-semibold text-amber-300 mb-2 sm:mb-0">Cốt truyện:</strong>
                        <div className="w-full">
                          <textarea
                              value={character.backstory}
                              onChange={(e) => updateCharacter('backstory', e.target.value)}
                              rows={4}
                              className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-300 text-sm italic"
                              placeholder="Thêm một vài dòng về quá khứ của bạn..."
                          />
                          <div className="mt-2">
                            <AISuggestButton onClick={handleBackstorySuggestion} isLoading={isLoading} />
                          </div>
                        </div>
                    </div>

                    <div>
                        <strong className="font-semibold text-amber-300">Chỉ số:</strong>
                         <ul className="list-disc list-inside text-stone-400 pl-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                             {Object.entries(character.stats).map(([key, value]) => (
                                <li key={key}>{STAT_LABELS[key as keyof CharacterStats]}: {value}</li>
                             ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 bg-black/20 p-4 border border-stone-700 rounded-lg space-y-4">
                    <h3 className="text-xl font-bold text-amber-300 mb-2">Xây Dựng Thế Giới</h3>
                    {/* World Overview */}
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">Khái Quát Thế Giới</label>
                        <div className="p-3 bg-stone-900/70 border border-stone-700 rounded-md min-h-[60px] text-stone-300 text-sm italic whitespace-pre-wrap">
                            {character.worldDescription || "Chưa có mô tả thế giới. Hãy để AI giúp bạn!"}
                        </div>
                        <div className="mt-2">
                           <AISuggestButton onClick={handleWorldOverviewSuggestion} isLoading={isLoading} text="AI Tạo Thế Giới Quan"/>
                        </div>
                    </div>
                     {/* Realm System */}
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">Hệ Thống Cảnh Giới Tu Luyện</label>
                        <textarea
                            value={character.realmSystem}
                            onChange={(e) => updateCharacter('realmSystem', e.target.value)}
                            rows={6}
                            className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-300 text-sm"
                            placeholder="Nhập hệ thống cảnh giới, mỗi cảnh giới một dòng..."/>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <AISuggestButton onClick={handleRealmSystemSuggestion} isLoading={isLoading} text="AI Gợi Ý"/>
                            <AISuggestButton onClick={handleRealmSystemValidation} isLoading={isLoading} text="AI Kiểm Tra & Sửa Lỗi"/>
                        </div>
                    </div>
                </div>
            </>
         );
        case 7: // Difficulty
            return (
                <>
                    <h2 className="text-2xl font-bold text-amber-300 mb-2">Chọn Độ Khó</h2>
                    <p className="text-stone-400 mb-6">Mỗi lựa chọn sẽ định hình nên những thử thách bạn phải đối mặt.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {DIFFICULTY_OPTIONS.map(opt => (
                            <button key={opt.name} onClick={() => updateCharacter('difficulty', opt.name)}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${character.difficulty === opt.name ? 'border-amber-500 bg-amber-900/20' : 'border-stone-700 hover:border-amber-700/40 hover:bg-stone-800/50'}`}>
                                <h3 className="font-bold text-lg text-amber-400">{opt.name}</h3>
                                <p className="text-sm text-stone-400">{opt.description}</p>
                            </button>
                        ))}
                    </div>
                </>
            );
      default:
        return null;
    }
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-stone-100">Định Hình Số Phận</h1>
          <p className="text-stone-400 mt-1">Tạo ra một linh hồn mới trong thế giới đầy rẫy bí ẩn.</p>
        </div>
        
        <div className="mb-6 text-center">
            <button 
              onClick={handleDestinyRoll}
              disabled={isLoading || isFinalizing}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 mx-auto disabled:opacity-60 disabled:cursor-wait"
            >
              {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-6 h-6"/>}
              Thiên Mệnh An Bài (AI Tạo Nhanh)
            </button>
            <p className="text-xs text-stone-500 mt-2">Để AI tạo một nhân vật hoàn chỉnh cho bạn!</p>
        </div>

        <div className="mb-8">
            <Stepper steps={STEPS} currentStep={step} />
        </div>

        <div className="bg-stone-900/60 backdrop-blur-sm border border-stone-800 rounded-2xl p-6 md:p-8 min-h-[400px]">
            {renderStepContent()}
        </div>

        {error && (
            <div className="mt-4 w-full p-3 bg-red-900/70 border border-red-700 text-red-200 text-center rounded-lg">
                <p><strong>Lỗi:</strong> {error}</p>
            </div>
        )}

        <div className="mt-8 flex justify-between items-center">
            <button onClick={step === 1 ? onBackToMenu : handleBack}
              disabled={isFinalizing}
              className="px-6 py-2 bg-stone-700/80 text-white rounded-md hover:bg-stone-600/80 transition disabled:opacity-50">
              {step === 1 ? "Về Menu Chính" : "Quay Lại"}
            </button>
            <div className="flex flex-col items-end">
                {step < STEPS.length ? (
                     <button onClick={handleNext} disabled={!!validationMessage || isFinalizing}
                        className="px-6 py-2 bg-amber-700 text-white font-bold rounded-md hover:bg-amber-600 transition disabled:bg-stone-600 disabled:cursor-not-allowed">
                         Tiếp Theo
                     </button>
                ) : (
                    <button onClick={handleFinishCreation}
                        disabled={isFinalizing || !!getValidationMessage()}
                        className="px-8 py-3 bg-green-700 text-white font-bold rounded-md hover:bg-green-600 transition flex items-center gap-2 disabled:bg-stone-600 disabled:cursor-wait">
                         {isFinalizing ? <LoadingSpinner className="w-6 h-6 border-4" /> : 'Bắt Đầu Phiêu Lưu'}
                    </button>
                )}
                {validationMessage && step < STEPS.length && (
                    <p className="text-xs text-red-400 mt-2 text-right">{validationMessage}</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreationScreen;