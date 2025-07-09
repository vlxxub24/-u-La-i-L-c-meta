import React, { useState, useMemo } from 'react';
import { Character, Gender, MartialSoul, Origin, CharacterStats, InnateTalent, Constitution, Race, Species, Difficulty, DIFFICULTIES, ItemCategory, NPC, Quest, SoulRing, Skill } from './types';
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
  { id: 'hao_thien', name: 'Hạo Thiên Tông', description: 'Đệ nhất tông môn trên đại lục. Nổi tiếng với Võ Hồn Hạo Thiên Chùy mạnh nhất.' },
  { id: 'whdq', name: 'Võ Hồn Đế Quốc', description: 'Thế lực bá chủ, thống trị đại lục. Bắt đầu với sự công nhận và tài nguyên dồi dào.' },
  { id: 'lam_dien', name: 'Lam Điện Bá Vương Long Gia Tộc', description: 'Gia tộc sở hữu Võ Hồn rồng tấn công mạnh nhất. Thiên phú về nguyên tố Lôi.' },
  { id: 'thanh_long', name: 'Thánh Long Tông', description: 'Tông môn chuyên về các Võ Hồn loài rồng mạnh mẽ. Có kỹ năng chiến đấu bẩm sinh.' },
  { id: 'hai_than', name: 'Hải Thần Đảo', description: 'Vùng đất thiêng của Hải Thần, được biển cả ưu ái. Có khả năng thích ứng với môi trường nước.' },
  { id: 'sat_luc', name: 'Sát Lục Chi Đô', description: 'Vùng đất của tội ác và chém giết. Sống sót ở đây mang lại Sát Thần Lĩnh Vực.' },
  { id: 'sm', name: 'Tinh Đấu Đại Sâm Lâm', description: 'Gần gũi với thiên nhiên, dễ dàng thu phục Hồn Thú.' },
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
  time: { day: 1, timeOfDay: 'Sáng' },
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
          if (years >= 1000000) level = 95;
          else if (years >= 100000) level = 91;
          else if (years >= 10000) level = 51;
          else if (years >= 1000) level = 31;
          else if (years >= 100) level = 11;
          else level = 1;
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
      
      // Add starting soul rings for humans or innate skills for beasts
      if (isBeast && finalChar.cultivationYears) {
          finalChar.soulRings = []; // Beasts don't have soul rings, they have skills.
          const startingSkills: Skill[] = [];
          const years = finalChar.cultivationYears;

          startingSkills.push({
              name: 'Dã Thú Chi Hống',
              description: 'Phát ra một tiếng gầm mạnh mẽ, gây sợ hãi cho kẻ địch yếu hơn và tạm thời làm giảm sức tấn công của chúng.',
              manaCost: 10,
              cooldown: 2
          });

          if (years >= 1000) {
              startingSkills.push({
                  name: 'Huyết Mạch Thức Tỉnh',
                  description: 'Tạm thời kích phát huyết mạch, tăng cường toàn bộ chỉ số trong một khoảng thời gian ngắn.',
                  manaCost: 30,
                  cooldown: 5
              });
          }

          if (years >= 10000) {
              startingSkills.push({
                  name: 'Lĩnh Vực Sơ Khai',
                  description: 'Tỏa ra một lĩnh vực yếu ớt dựa trên thuộc tính bản thân, gây áp chế lên kẻ địch trong phạm vi.',
                  manaCost: 50,
                  cooldown: 10
              });
          }

          if (years >= 100000) {
              startingSkills.push({
                  name: 'Bản Mệnh Nhất Kích',
                  description: 'Tụ tập toàn bộ Hồn Lực vào một đòn tấn công hủy diệt, tiêu hao lớn nhưng có sức mạnh kinh người.',
                  manaCost: 100,
                  cooldown: 15
              });
          }
          finalChar.skills = [...(finalChar.skills || []), ...startingSkills];
      } else if (!isBeast && level >= 10 && (!finalChar.soulRings || finalChar.soulRings.length === 0)) {
          finalChar.soulRings = [];
          const ring1 = SOUL_RING_DATA.find(r => r.id === 'mandala_snake');
          if (ring1) finalChar.soulRings.push(ring1);
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
        case 6:
            if (!character.backstory) return "Vui lòng viết hoặc gợi ý một cốt truyện.";
            if (!character.worldDescription) return "Vui lòng viết hoặc gợi ý mô tả thế giới.";
            if (!character.realmSystem) return "Vui lòng cung cấp hệ thống cảnh giới.";
            return null;
        case 7:
            if (!character.difficulty) return "Vui lòng chọn độ khó.";
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

                                        if (isNewRaceSoulBeast) {
                                            updated.martialSoul = null;
                                        } else {
                                            updated.cultivationYears = undefined;
                                            updated.cultivationElements = [];
                                        }
                                        return updated;
                                    });
                                }}
                                    className={`flex flex-col items-center justify-center text-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 h-full
                                    ${character.race?.id === r.id ? 'bg-amber-800/60 border-amber-500 shadow-lg' : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/80'}`}>
                                    <r.icon className={`w-8 h-8 mb-2 transition-transform ${character.race?.id === r.id ? 'scale-110' : ''}`} />
                                    <span className="font-semibold text-sm">{r.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {character.race && (
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Giống Loài</label>
                            <div className="space-y-3">
                                {character.race.species.map(s => (
                                    <div key={s.id} onClick={() => updateCharacter('species', s)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${character.species?.id === s.id ? 'bg-blue-800/50 border-blue-600' : 'bg-stone-800/50 border-stone-700 hover:bg-stone-700/60'}`}>
                                        <h4 className="font-semibold text-blue-300">{s.name}</h4>
                                        <p className="text-xs text-stone-400">{s.description}</p>
                                    </div>
                                ))}
                                 <div className={`p-3 border rounded-lg transition-colors ${character.species?.isCustom ? 'bg-blue-800/50 border-blue-600' : 'bg-stone-800/50 border-stone-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" id="custom-species" name="species-choice" checked={character.species?.isCustom === true} onChange={() => updateCharacter('species', { id: 'custom_ai', name: '', description: '', isCustom: true })} className="h-4 w-4 text-amber-600 bg-stone-700 border-stone-600 focus:ring-amber-500" />
                                        <label htmlFor="custom-species" className="font-semibold text-blue-300 cursor-pointer">Tự định nghĩa Giống Loài</label>
                                    </div>
                                    {character.species?.isCustom && (
                                        <div className="mt-3 space-y-2 pl-7">
                                            <input type="text" placeholder="Tên Giống Loài" value={character.species.name} onChange={e => updateCharacter('species', { ...character.species!, name: e.target.value })}
                                                className="w-full bg-stone-900 border border-stone-600 rounded-md px-3 py-1.5 text-stone-200 text-sm" />
                                            <textarea placeholder="Mô tả..." value={character.species.description} onChange={e => updateCharacter('species', { ...character.species!, description: e.target.value })}
                                                className="w-full bg-stone-900 border border-stone-600 rounded-md px-3 py-1.5 text-stone-200 text-sm h-16 resize-none" />
                                            <AISuggestButton onClick={() => handleCustomDescriptionSuggestion('species')} isLoading={isLoading} text="Viết mô tả" className="text-xs py-1" />
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div className="text-right">
                                <AISuggestButton onClick={handleSpeciesRoll} isLoading={isLoading} text="Gieo Quẻ Giống Loài"/>
                             </div>
                        </div>
                    )}
                </div>
            </>
        );
      case 2: // Martial Soul / Cultivation
        if (isSoulBeastRace) {
            return (
                 <>
                    <h2 className="text-2xl font-bold text-amber-300 mb-6">Tu Luyện Hồn Thú</h2>
                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Tu vi ban đầu</label>
                            <select value={character.cultivationYears || ''} onChange={e => updateCharacter('cultivationYears', Number(e.target.value))}
                                className="w-full bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition">
                                <option value="" disabled>Chọn tu vi</option>
                                {CULTIVATION_YEARS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Nguyên Tố (Chọn tối đa 3)</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {ELEMENTS.map(el => (
                                    <button key={el} onClick={() => handleElementToggle(el, true)}
                                        className={`p-2 border rounded-md text-xs transition ${character.cultivationElements?.includes(el) ? 'bg-amber-800/60 border-amber-600 text-white' : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/80'}`}>
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
                <h2 className="text-2xl font-bold text-amber-300 mb-6">Thức Tỉnh Võ Hồn</h2>
                <div className="space-y-4">
                    {MARTIAL_SOULS.map(s => (
                        <div key={s.id} onClick={() => updateCharacter('martialSoul', s)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${character.martialSoul?.id === s.id ? 'bg-blue-800/50 border-blue-600' : 'bg-stone-800/50 border-stone-700 hover:bg-stone-700/60'}`}>
                            <h4 className="font-semibold text-blue-300">{s.name}</h4>
                            <p className="text-xs text-stone-400">{s.description}</p>
                        </div>
                    ))}
                    <div className={`p-3 border rounded-lg transition-colors ${character.martialSoul?.isCustom ? 'bg-blue-800/50 border-blue-600' : 'bg-stone-800/50 border-stone-700'}`}>
                        <div className="flex items-center gap-3">
                            <input type="radio" id="custom-soul" name="soul-choice" checked={character.martialSoul?.isCustom === true} onChange={() => updateCharacter('martialSoul', { id: 'custom_ai', name: '', description: '', category: 'Tự định nghĩa', isCustom: true, elements: [] })} className="h-4 w-4 text-amber-600 bg-stone-700 border-stone-600 focus:ring-amber-500" />
                            <label htmlFor="custom-soul" className="font-semibold text-blue-300 cursor-pointer">Tự định nghĩa Võ Hồn</label>
                        </div>
                        {character.martialSoul?.isCustom && (
                            <div className="mt-3 space-y-3 pl-7">
                                <input type="text" placeholder="Tên Võ Hồn" value={character.martialSoul.name} onChange={e => handleCustomSoulChange('name', e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-600 rounded-md px-3 py-1.5 text-stone-200 text-sm" />
                                <textarea placeholder="Mô tả Võ Hồn..." value={character.martialSoul.description} onChange={e => handleCustomSoulChange('description', e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-600 rounded-md px-3 py-1.5 text-stone-200 text-sm h-16 resize-none" />
                                <div>
                                    <label className="block text-xs font-medium text-stone-300 mb-1">Nguyên Tố (Chọn tối đa 3)</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {ELEMENTS.map(el => (
                                            <button key={el} onClick={() => handleElementToggle(el, false)}
                                                className={`p-2 border rounded-md text-xs transition ${character.martialSoul?.elements?.includes(el) ? 'bg-amber-800/60 border-amber-600 text-white' : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/80'}`}>
                                                {el}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-right mt-4">
                    <AISuggestButton onClick={handleMartialSoulSuggestion} isLoading={isLoading} text="Gieo Quẻ Võ Hồn"/>
                </div>
            </>
        );
      case 3: // Origin
        return (
            <>
                <h2 className="text-2xl font-bold text-amber-300 mb-6">Lựa Chọn Xuất Thân</h2>
                <div className="space-y-3">
                    {ORIGINS.map(o => (
                         <div key={o.id} onClick={() => updateCharacter('origin', o)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${character.origin?.id === o.id ? 'bg-blue-800/50 border-blue-600' : 'bg-stone-800/50 border-stone-700 hover:bg-stone-700/60'}`}>
                            <h4 className="font-semibold text-blue-300">{o.name}</h4>
                            <p className="text-xs text-stone-400">{o.description}</p>
                        </div>
                    ))}
                    <div className={`p-3 border rounded-lg transition-colors ${character.origin?.isCustom ? 'bg-blue-800/50 border-blue-600' : 'bg-stone-800/50 border-stone-700'}`}>
                        <div className="flex items-center gap-3">
                             <input type="radio" id="custom-origin" name="origin-choice" checked={character.origin?.isCustom === true} onChange={() => updateCharacter('origin', { id: 'custom_ai', name: '', description: '', isCustom: true })} className="h-4 w-4 text-amber-600 bg-stone-700 border-stone-600 focus:ring-amber-500" />
                            <label htmlFor="custom-origin" className="font-semibold text-blue-300 cursor-pointer">Tự định nghĩa Xuất Thân</label>
                        </div>
                        {character.origin?.isCustom && (
                            <div className="mt-3 space-y-2 pl-7">
                                <input type="text" placeholder="Tên Xuất Thân" value={character.origin.name} onChange={e => handleCustomOriginChange('name', e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-600 rounded-md px-3 py-1.5 text-stone-200 text-sm" />
                                <textarea placeholder="Mô tả Xuất Thân..." value={character.origin.description} onChange={e => handleCustomOriginChange('description', e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-600 rounded-md px-3 py-1.5 text-stone-200 text-sm h-16 resize-none" />
                                <AISuggestButton onClick={() => handleCustomDescriptionSuggestion('origin')} isLoading={isLoading} text="Viết mô tả" className="text-xs py-1" />
                            </div>
                        )}
                    </div>
                </div>
                 <div className="text-right mt-4">
                    <AISuggestButton onClick={handleOriginSuggestion} isLoading={isLoading} text="Gieo Quẻ Xuất Thân"/>
                </div>
            </>
        );
      case 4: // Talent & Constitution
        return (
             <>
                <h2 className="text-2xl font-bold text-amber-300 mb-6">Thiên Phú & Thể Chất</h2>
                 <div className="flex justify-center mb-6">
                    <div className="bg-stone-900 p-1 rounded-lg flex gap-1">
                        <button onClick={() => setTalentConstitutionMode('roll')} className={`px-4 py-1.5 text-sm rounded-md transition ${talentConstitutionMode === 'roll' ? 'bg-amber-700 text-white' : 'text-stone-300'}`}>Gieo Quẻ</button>
                        <button onClick={() => setTalentConstitutionMode('custom')} className={`px-4 py-1.5 text-sm rounded-md transition ${talentConstitutionMode === 'custom' ? 'bg-amber-700 text-white' : 'text-stone-300'}`}>Tùy Chỉnh</button>
                    </div>
                </div>
                {talentConstitutionMode === 'roll' ? (
                    <div className="text-center">
                        <AISuggestButton onClick={handleTalentConstitutionRoll} isLoading={isLoading} text="Gieo Quẻ Vận Mệnh" className="px-6 py-3 text-base"/>
                         <div className="mt-6 p-4 bg-black/20 rounded-lg space-y-4">
                            <div>
                                <h3 className="font-bold text-lg text-blue-300">Thiên Phú: {character.innateTalent?.name || 'Chưa có'}</h3>
                                <p className="text-sm text-stone-400">{character.innateTalent?.description || 'Nhấn nút để gieo quẻ'}</p>
                            </div>
                             <div>
                                <h3 className="font-bold text-lg text-green-300">Thể Chất: {character.constitution?.name || 'Chưa có'}</h3>
                                <p className="text-sm text-stone-400">{character.constitution?.description || 'Nhấn nút để gieo quẻ'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Thiên Phú</label>
                            <input type="text" placeholder="Tên Thiên Phú (ví dụ: Tiên Thiên Mãn Hồn Lực)" value={character.innateTalent?.name || ''} onChange={e => updateCharacter('innateTalent', { ...(character.innateTalent || { name: '', description: '' }), name: e.target.value })}
                                className="w-full bg-stone-900 border border-stone-700 rounded-md px-3 py-2 text-stone-200" />
                            <textarea placeholder="Mô tả Thiên Phú..." value={character.innateTalent?.description || ''} onChange={e => updateCharacter('innateTalent', { ...(character.innateTalent || { name: '', description: '' }), description: e.target.value })}
                                className="w-full mt-2 bg-stone-900 border border-stone-700 rounded-md px-3 py-2 text-stone-200 h-20 resize-none" />
                             <AISuggestButton onClick={() => handleCustomDescriptionSuggestion('talent')} isLoading={isLoading} text="Viết mô tả" className="text-xs py-1 mt-1" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Thể Chất</label>
                            <input type="text" placeholder="Tên Thể Chất (ví dụ: Bách Chiết Bất Nao)" value={character.constitution?.name || ''} onChange={e => updateCharacter('constitution', { ...(character.constitution || { name: '', description: '' }), name: e.target.value })}
                                className="w-full bg-stone-900 border border-stone-700 rounded-md px-3 py-2 text-stone-200" />
                            <textarea placeholder="Mô tả Thể Chất..." value={character.constitution?.description || ''} onChange={e => updateCharacter('constitution', { ...(character.constitution || { name: '', description: '' }), description: e.target.value })}
                                className="w-full mt-2 bg-stone-900 border border-stone-700 rounded-md px-3 py-2 text-stone-200 h-20 resize-none" />
                             <AISuggestButton onClick={() => handleCustomDescriptionSuggestion('constitution')} isLoading={isLoading} text="Viết mô tả" className="text-xs py-1 mt-1" />
                        </div>
                    </div>
                )}
            </>
        );
      case 5: // Stats
        return (
             <>
                <h2 className="text-2xl font-bold text-amber-300 mb-2">Phân Bổ Tiềm Năng</h2>
                <p className="text-center text-stone-400 text-sm mb-6">Bạn có <strong className={`font-bold ${pointsUsed > TOTAL_STAT_POINTS ? 'text-red-500' : 'text-green-400'}`}>{TOTAL_STAT_POINTS - pointsUsed}</strong> điểm để phân phối.</p>
                <div className="space-y-4 max-w-md mx-auto">
                    {Object.entries(STAT_LABELS).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between">
                            <label className="font-semibold text-stone-300 w-24">{label}</label>
                             <div className="flex items-center gap-2">
                                <button onClick={() => updateStats(key as keyof CharacterStats, character.stats[key as keyof CharacterStats] - 1)} className="px-3 py-1 bg-stone-700 rounded">-</button>
                                <input type="number" value={character.stats[key as keyof CharacterStats]} 
                                    onChange={(e) => updateStats(key as keyof CharacterStats, parseInt(e.target.value, 10))}
                                    className="w-16 bg-stone-900 border border-stone-600 rounded-md p-2 text-center text-white"
                                />
                                <button onClick={() => updateStats(key as keyof CharacterStats, character.stats[key as keyof CharacterStats] + 1)} className="px-3 py-1 bg-stone-700 rounded">+</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <label className="flex items-center justify-center gap-2 text-sm text-yellow-400 cursor-pointer">
                        <input type="checkbox" checked={heavensIntervention} onChange={e => setHeavensIntervention(e.target.checked)} className="h-4 w-4 text-amber-600 bg-stone-700 border-stone-600 focus:ring-amber-500 rounded"/>
                        Thiên Đạo Can Thiệp (Bỏ qua giới hạn điểm)
                    </label>
                </div>
            </>
        );
       case 6: // Backstory & World
        return (
            <>
                <h2 className="text-2xl font-bold text-amber-300 mb-6">Hoàn Thiện Cốt Truyện & Thế Giới</h2>
                <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">Cốt truyện nhân vật</label>
                        <textarea value={character.backstory} onChange={e => updateCharacter('backstory', e.target.value)}
                            className="w-full h-32 bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
                            placeholder="Viết một vài dòng về quá khứ của nhân vật..." />
                         <div className="text-right mt-2">
                             <AISuggestButton onClick={handleBackstorySuggestion} isLoading={isLoading} text="Gợi ý cốt truyện" />
                         </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">Tổng quan thế giới</label>
                        <textarea value={character.worldDescription} onChange={e => updateCharacter('worldDescription', e.target.value)}
                            className="w-full h-24 bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
                            placeholder="Mô tả về thế giới mà nhân vật sinh sống..." />
                         <div className="text-right mt-2">
                            <AISuggestButton onClick={handleWorldOverviewSuggestion} isLoading={isLoading} text="Gợi ý thế giới" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">Hệ thống cảnh giới tu luyện (mỗi cảnh giới một dòng)</label>
                        <textarea value={character.realmSystem} onChange={e => updateCharacter('realmSystem', e.target.value)}
                            className="w-full h-32 bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
                            placeholder="Ví dụ: Hồn Sĩ, Hồn Sư, Đại Hồn Sư..." />
                        <div className="text-right mt-2 flex justify-end gap-2">
                             <AISuggestButton onClick={handleRealmSystemSuggestion} isLoading={isLoading} text="Gợi ý cảnh giới" />
                             <AISuggestButton onClick={handleRealmSystemValidation} isLoading={isLoading} text="Kiểm tra & Sửa" />
                        </div>
                    </div>
                </div>
            </>
        );
      case 7: // Difficulty
        return (
            <>
                <h2 className="text-2xl font-bold text-amber-300 mb-6">Chọn Độ Khó</h2>
                <p className="text-center text-stone-400 mb-6">Độ khó sẽ ảnh hưởng đến thử thách, kẻ địch và kết quả của các lựa chọn trong câu chuyện.</p>
                <div className="space-y-4 max-w-lg mx-auto">
                    {DIFFICULTY_OPTIONS.map(opt => (
                        <button key={opt.name} onClick={() => updateCharacter('difficulty', opt.name)}
                            className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200
                                ${character.difficulty === opt.name ? 'bg-amber-800/60 border-amber-500 shadow-lg' : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/80'}
                            `}>
                            <h3 className="font-bold text-lg text-amber-300">{opt.name}</h3>
                            <p className="text-sm text-stone-300">{opt.description}</p>
                        </button>
                    ))}
                </div>
            </>
        );
      default:
        return <div>Step {step} không hợp lệ</div>;
    }
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg">
            <header className="p-6 border-b border-slate-700/50">
                <h1 className="text-3xl font-bold text-center text-amber-400">Tạo Nhân Vật</h1>
                <p className="text-center text-slate-400 mt-2">Kiến tạo một huyền thoại cho riêng bạn.</p>
                <div className="mt-6">
                    <Stepper steps={STEPS} currentStep={step} />
                </div>
            </header>

            <main className="p-6 min-h-[400px]">
                {error && <div className="bg-red-900/70 border border-red-700 text-red-200 p-3 rounded-md mb-6 text-center">{error}</div>}
                {renderStepContent()}
            </main>

            <footer className="p-6 bg-black/30 border-t border-slate-700/50 rounded-b-xl">
                 <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className="px-6 py-2 bg-slate-700 text-white font-bold rounded-md hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Quay Lại
                    </button>
                    
                    <div className="flex-grow text-center px-4">
                        {validationMessage && <p className="text-red-400 text-sm">{validationMessage}</p>}
                    </div>

                    {step < STEPS.length ? (
                         <button
                            onClick={handleNext}
                            disabled={!!validationMessage}
                            className="px-6 py-2 bg-amber-700 text-white font-bold rounded-md hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             Tiếp Theo
                         </button>
                    ) : (
                         <button
                            onClick={handleFinishCreation}
                            disabled={isFinalizing || !!validationMessage}
                            className="px-6 py-2 bg-green-700 text-white font-bold rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                         >
                            {isFinalizing ? <LoadingSpinner /> : <SparklesIcon className="w-5 h-5" />}
                            {isFinalizing ? 'Đang hoàn tất...' : 'Hoàn Tất'}
                         </button>
                    )}
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <button onClick={onBackToMenu} className="text-sm text-slate-400 hover:text-white transition">
                        Về Menu Chính
                    </button>
                    <AISuggestButton onClick={handleDestinyRoll} isLoading={isLoading} text="Thiên Mệnh An Bài"/>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default CreationScreen;