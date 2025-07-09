
import React, { useState, useEffect, useRef } from 'react';
import { Character, CharacterStats, Choice, StoryEntry } from './types';
import { geminiService } from './services/geminiService';

// Import all necessary icons
import SendIcon from './components/icons/SendIcon';
import PlayerIcon from './components/icons/PlayerIcon';
import XMarkIcon from './components/icons/XMarkIcon';
import SparklesIcon from './components/icons/SparklesIcon';
import DocumentArrowDownIcon from './components/icons/DocumentArrowDownIcon';
import ArrowPathIcon from './components/icons/ArrowPathIcon';
import InformationCircleIcon from './components/icons/InformationCircleIcon';
import UserGroupIcon from './components/icons/UserGroupIcon';
import DocumentTextIcon from './components/icons/DocumentTextIcon';
import BookOpenIcon from './components/icons/BookOpenIcon';
import ArrowLeftOnRectangleIcon from './components/icons/ArrowLeftOnRectangleIcon';
import ChevronUpIcon from './components/icons/ChevronUpIcon';
import ChevronDownIcon from './components/icons/ChevronDownIcon';
import ServerIcon from './components/icons/ServerIcon';
import BriefcaseIcon from './components/icons/BriefcaseIcon';
import GameHub from './components/GameHub';


interface GameScreenProps {
  character: Character;
  onSaveGame: (character: Character) => void;
  onExitToMenu: () => void;
  matureInstructions: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-6 h-6 border-4 border-slate-400/50 border-t-violet-500 rounded-full animate-spin"></div>
);

const ExitConfirmationModal: React.FC<{
    onSaveAndExit: () => void;
    onExitWithoutSaving: () => void;
    onCancel: () => void;
}> = ({ onSaveAndExit, onExitWithoutSaving, onCancel }) => (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl shadow-black/30" onClick={e => e.stopPropagation()}>
             <div className="p-6 text-center">
                 <h2 className="text-xl font-bold text-amber-400 mb-4">Bạn muốn rời đi?</h2>
                 <p className="text-slate-400 mb-6">Mọi tiến trình chưa lưu sẽ bị mất nếu bạn thoát mà không lưu.</p>
                 <div className="flex flex-col gap-3">
                    <button onClick={onSaveAndExit} className="w-full px-4 py-2 bg-green-700 text-white font-bold rounded-md hover:bg-green-600 transition">Lưu và Thoát</button>
                    <button onClick={onExitWithoutSaving} className="w-full px-4 py-2 bg-red-800/80 text-white font-bold rounded-md hover:bg-red-700/80 transition">Thoát không lưu</button>
                    <button onClick={onCancel} className="w-full px-4 py-2 bg-slate-700 text-white font-bold rounded-md hover:bg-slate-600 transition">Hủy</button>
                 </div>
             </div>
        </div>
    </div>
);

const InfoPanel: React.FC<{ icon: React.ReactNode; title: string; borderColor: string; children: React.ReactNode }> = ({ icon, title, borderColor, children }) => (
    <div className={`bg-slate-800/50 border ${borderColor} rounded-lg shadow-inner`}>
        <div className="flex items-center gap-3 p-3 border-b border-slate-700/50">
            {icon}
            <h3 className="font-bold text-lime-300">{title}</h3>
        </div>
        <div className="p-3 text-sm text-slate-400 min-h-[50px]">
            {children}
        </div>
    </div>
);

const GameScreen: React.FC<GameScreenProps> = ({ character: initialCharacter, onSaveGame, onExitToMenu, matureInstructions }) => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'exitConfirmation' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const storyLogRef = useRef<HTMLDivElement>(null);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isChoicesVisible, setIsChoicesVisible] = useState(true);

  const isSoulBeastRace = character.race?.id === 'soul_beast' || character.race?.id === 'ancient_beast';

  const handleManualSave = () => {
    if (saveStatus !== 'idle') return;
    setSaveStatus('saving');
    onSaveGame(character);
    // Fake delay for user feedback
    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleSaveToFile = () => {
    try {
        const dataStr = JSON.stringify(character, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.download = `${character.name || 'nhan-vat'}-save.json`;
        
        document.body.appendChild(linkElement);
        linkElement.click();
        
        document.body.removeChild(linkElement);
        URL.revokeObjectURL(url);
        alert("Đã lưu game ra tệp!");
    } catch (error) {
        console.error("Failed to save to file:", error);
        alert("Đã xảy ra lỗi khi lưu game ra tệp.");
    }
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
- Cốt truyện: ${char.backstory || 'Không có'}
- Chỉ số: Sức mạnh ${char.stats.strength}, Trí tuệ ${char.stats.intellect}, Thể chất ${char.stats.physique}, Nhanh nhẹn ${char.stats.agility}, Sức bền ${char.stats.stamina}, May mắn ${char.stats.luck}
- HP hiện tại: ${char.hp.current}/${char.hp.max}
- Mana hiện tại: ${char.mana.current}/${char.mana.max}
- Tiền: ${char.money}
- Kinh nghiệm: ${char.exp.current}/${char.exp.next}
- Cảnh giới: ${char.realm.name} (Cấp ${char.realm.level})
- Thời gian hiện tại: Ngày ${char.time.day}, Buổi ${char.time.timeOfDay}
- Hệ thống cảnh giới của thế giới này:
${char.realmSystem || 'Chưa định nghĩa'}
- Độ khó của trò chơi: ${char.difficulty}. (Hướng dẫn cho GM: Điều chỉnh các thử thách, kẻ địch và kết quả cho phù hợp. Ví dụ: 'Địa Ngục' nghĩa là các sự kiện cực kỳ khó khăn và nguy hiểm, trong khi 'Dễ' thì ngược lại.)
    `.trim();
  }

  const handleAction = async (actionText: string) => {
    if (!actionText || isLoading) return;

    setError(null);
    setIsLoading(true);
    setChoices([]);
    setUserInput('');

    const newActionEntry: StoryEntry = {
      id: Date.now(),
      type: 'action',
      text: actionText,
    };

    // Update state to show user action immediately
    const characterBeforeAI = {
      ...character,
      storyLog: [...(character.storyLog || []), newActionEntry],
    };
    setCharacter(characterBeforeAI);

    try {
        const characterPrompt = characterToPromptString(characterBeforeAI);

        const HISTORY_LOOKBACK = 8;
        const recentHistory = (characterBeforeAI.storyLog || []).slice(-HISTORY_LOOKBACK);
        const storyContext = recentHistory.map(entry => {
            if (entry.type === 'action') {
                return `[HÀNH ĐỘNG CỦA NGƯỜI CHƠI]: ${entry.text}`;
            } else {
                return `[DIỄN BIẾN CỐT TRUYỆN]: ${entry.text}`;
            }
        }).join('\n\n');

        const fullPrompt = `
Dưới đây là thông tin về nhân vật và bối cảnh trò chơi.
---
[THÔNG TIN NHÂN VẬT]
${characterPrompt}
---
[DIỄN BIẾN CÂU CHUYỆN GẦN ĐÂY (Theo thứ tự)]
${storyContext}
---
Dựa vào TOÀN BỘ thông tin trên, hãy viết tiếp câu chuyện một cách logic và nhất quán, bắt đầu từ sau hành động cuối cùng của người chơi. Hãy đảm bảo duy trì tính liên tục của câu chuyện và các nhân vật. Nếu có sự thay đổi về trạng thái nhân vật, hãy bao gồm trường "characterUpdate".
`.trim();

        const update = await geminiService.getGameUpdate(fullPrompt, matureInstructions);

        // Merge character updates from AI if they exist
        const characterAfterUpdate = {
            ...characterBeforeAI,
            ...(update.characterUpdate || {}),
        };
        
        const newNarrativeEntry: StoryEntry = {
            id: Date.now() + 1,
            type: 'narrative',
            text: update.narrative,
        };
        
        // Add the new narrative to the log
        const finalUpdatedChar = {
            ...characterAfterUpdate,
            storyLog: [...characterAfterUpdate.storyLog, newNarrativeEntry],
        };

        setCharacter(finalUpdatedChar);
        setChoices(update.choices);

    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = async () => {
    if (isLoading || suggestionLoading) return;
    
    setSuggestionLoading(true);
    setError(null);
    try {
        const characterPrompt = characterToPromptString(character);
        const lastNarrative = character.storyLog?.filter(s => s.type === 'narrative').pop()?.text || 'Bối cảnh ban đầu.';
        const newChoice = await geminiService.getChoiceSuggestion(characterPrompt, lastNarrative);
        setChoices(prev => [...prev, newChoice]);
    } catch(e) {
        setError((e as Error).message);
    } finally {
        setSuggestionLoading(false);
    }
  }
  
  const handleStartStory = async () => {
      if (isLoading) return;
      if (character.storyLog && character.storyLog.length > 0) {
          setIsStoryVisible(true);
          return;
      }

      setIsLoading(true);
      setError(null);
      try {
          const characterPrompt = characterToPromptString(character);
          const initialPrompt = `Hãy bắt đầu trò chơi. Dựa vào thông tin nhân vật, hãy tạo ra bối cảnh mở đầu thật hấp dẫn và đưa ra các lựa chọn đầu tiên. \n\nNhân vật:\n${characterPrompt}`;
          const firstUpdate = await geminiService.getGameUpdate(initialPrompt, matureInstructions);
          
          const characterAfterUpdate = {
              ...character,
              ...(firstUpdate.characterUpdate || {}),
          };

          const firstNarrativeEntry: StoryEntry = {
              id: Date.now(),
              type: 'narrative',
              text: firstUpdate.narrative,
          };
          
          const updatedCharacter = {
              ...characterAfterUpdate,
              storyLog: [firstNarrativeEntry]
          };

          setCharacter(updatedCharacter);
          setChoices(firstUpdate.choices);
          setIsStoryVisible(true);

      } catch(e) {
          setError((e as Error).message)
      } finally {
          setIsLoading(false);
      }
  }


  useEffect(() => {
    if (isStoryVisible && storyLogRef.current) {
        storyLogRef.current.scrollTop = storyLogRef.current.scrollHeight;
    }
  }, [character.storyLog, isStoryVisible]);

  const getSuccessRateColor = (rate: 'Cao' | 'Trung bình' | 'Thấp') => {
    switch (rate) {
        case 'Cao': return 'bg-green-800/80 border-green-600/80 text-green-300';
        case 'Trung bình': return 'bg-yellow-800/80 border-yellow-600/80 text-yellow-300';
        case 'Thấp': return 'bg-red-800/80 border-red-600/80 text-red-300';
        default: return 'bg-slate-800 border-slate-600 text-slate-300';
    }
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <header className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">{character.adventureTitle || `Hành trình của ${character.name}`}</h1>
                 <button onClick={() => setActiveModal('exitConfirmation')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-all duration-200">
                    <ArrowLeftOnRectangleIcon className="w-5 h-5"/> Về Menu
                 </button>
            </div>
            <div className="text-amber-300 text-sm font-semibold bg-black/20 px-3 py-1 rounded-full inline-block border border-amber-800/50">
                <span>Ngày {character.time.day} - {character.time.timeOfDay}</span>
            </div>
        </header>
        
        <main className="space-y-6">
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6">
                 <p className="text-sm text-slate-400 mb-6">
                    <span className="font-semibold text-slate-300">🎭 Tính cách:</span> {character.personalityTraits?.join(', ') || 'Chưa xác định'}
                 </p>
                 <div className="flex flex-wrap items-center gap-3">
                     <button onClick={handleStartStory} disabled={isLoading || isStoryVisible} className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg shadow-md transition flex items-center gap-2 flex-grow sm:flex-grow-0 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? <LoadingSpinner/> : (
                           character.storyLog && character.storyLog.length > 0 
                           ? '➡️ Tiếp tục câu chuyện' 
                           : '🚀 Bắt đầu câu chuyện'
                        )}
                     </button>
                    
                    <button onClick={handleManualSave} disabled={saveStatus !== 'idle'} className={`px-4 py-2.5 rounded-lg font-bold text-white shadow-md transition flex items-center gap-2 ${
                        saveStatus === 'idle' ? 'bg-green-700 hover:bg-green-600' :
                        saveStatus === 'saving' ? 'bg-slate-600 cursor-wait' :
                        'bg-green-500 cursor-default'
                    }`}>
                       {saveStatus === 'idle' && <><ServerIcon className="w-5 h-5"/> Lưu Game</>}
                       {saveStatus === 'saving' && <><div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> Đang lưu...</>}
                       {saveStatus === 'saved' && <>✅ Đã lưu!</>}
                    </button>

                    <button onClick={() => setIsHubOpen(true)} className="px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-all duration-200 flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5"/>
                        Bảng Điều Khiển
                    </button>
                    <button onClick={handleSaveToFile} title="Tải file .json về máy" className="p-2.5 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-slate-300 transition-all duration-200">
                        <DocumentArrowDownIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => { if(confirm('Bạn có chắc muốn tạo lại nhân vật mới? Mọi tiến trình sẽ bị mất.')) onExitToMenu(); }} title="Bắt Đầu Lại" className="p-2.5 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-slate-300 transition-all duration-200">
                        <ArrowPathIcon className="w-5 h-5"/>
                    </button>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoPanel icon={<InformationCircleIcon className="w-6 h-6 text-blue-400"/>} title="Trạng Thái Hiện Tại" borderColor="border-blue-500">
                    {character.currentStatus && character.currentStatus.length > 0 ? character.currentStatus.map(s => s.name).join(', ') : 'Không có trạng thái nào.'}
                </InfoPanel>
                <InfoPanel icon={<UserGroupIcon className="w-6 h-6 text-green-400"/>} title="Đồng Hành" borderColor="border-green-500">
                    {character.npcs && character.npcs.length > 0 ? character.npcs.map(c => c.name).join(', ') : 'Chưa có đồng hành nào.'}
                </InfoPanel>
                <InfoPanel icon={<DocumentTextIcon className="w-6 h-6 text-yellow-400"/>} title="Nhiệm Vụ Đang Làm" borderColor="border-yellow-500">
                     {character.activeQuests && character.activeQuests.length > 0 ? character.activeQuests.map(q => q.title).join(', ') : 'Không có nhiệm vụ nào đang hoạt động.'}
                </InfoPanel>
            </div>

            {isStoryVisible && (
                <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
                        <h3 className="text-xl font-bold text-lime-300">Diễn biến câu chuyện</h3>
                        <button
                            onClick={() => setIsChoicesVisible(prev => !prev)}
                            className="p-1.5 rounded-full hover:bg-slate-700/50 transition-colors"
                            title={isChoicesVisible ? "Ẩn lựa chọn" : "Hiện lựa chọn"}
                            aria-label={isChoicesVisible ? "Ẩn lựa chọn" : "Hiện lựa chọn"}
                            aria-expanded={isChoicesVisible}
                        >
                            {isChoicesVisible ? <ChevronUpIcon className="w-5 h-5 text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-400" />}
                        </button>
                    </div>
                    <div className="flex flex-col h-[60vh]">
                      <div ref={storyLogRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                        {character.storyLog?.map(entry => (
                            <div key={entry.id} className={`flex items-start gap-3 max-w-4xl mx-auto ${entry.type === 'action' ? 'justify-end' : ''}`}>
                               {entry.type === 'narrative' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center text-violet-400"><BookOpenIcon className="w-5 h-5"/></div>}
                                <div className={`p-4 rounded-xl max-w-[80%] ${entry.type === 'narrative' ? 'bg-black/30 border border-slate-800' : 'bg-slate-700/50 border border-slate-600'}`}>
                                    <p className="whitespace-pre-wrap">{entry.text}</p>
                                </div>
                               {entry.type === 'action' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center text-slate-300"><PlayerIcon className="w-5 h-5"/></div>}
                            </div>
                        ))}
                         {isLoading && !error && (
                            <div className="flex justify-center p-4">
                                <LoadingSpinner />
                            </div>
                        )}
                      </div>
                      
                      {isChoicesVisible && (
                          <footer className="flex-shrink-0 bg-black/40 p-4 border-t border-slate-700/50">
                            <div className="max-w-4xl mx-auto">
                                 {error && (
                                    <div className="mb-4 w-full p-3 bg-red-900/70 border border-red-700 text-red-200 text-center rounded-lg">
                                        <p><strong>Lỗi:</strong> {error}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                                    {!isLoading && choices.map((choice, i) => (
                                        <button key={i} onClick={() => handleAction(choice.text)} className={`w-full text-left p-2 border rounded-lg hover:brightness-125 transition text-sm ${getSuccessRateColor(choice.successRate)}`}>
                                             <div className="flex justify-between items-start gap-2">
                                                <span className="flex-1 text-slate-100 text-xs">{choice.text}</span>
                                                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-black/30">
                                                    {choice.probability}%
                                                </span>
                                            </div>
                                            <div className="text-left text-xs mt-1 opacity-80">{choice.successRate}</div>
                                        </button>
                                    ))}
                                </div>
                                 <div className="flex items-center gap-2">
                                     <form onSubmit={(e) => {e.preventDefault(); handleAction(userInput)}} className="flex-grow flex gap-2">
                                        <input 
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder="Hoặc tự nhập hành động của bạn..."
                                            disabled={isLoading}
                                            className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-violet-500 focus:border-violet-500 transition disabled:opacity-50"
                                        />
                                        <button type="submit" disabled={isLoading || !userInput} className="bg-violet-700 text-white p-3 rounded-lg hover:bg-violet-600 transition disabled:bg-slate-600 disabled:cursor-not-allowed">
                                            <SendIcon className="w-5 h-5" />
                                        </button>
                                    </form>
                                    <button onClick={handleSuggestionClick} disabled={isLoading || suggestionLoading} className="flex items-center justify-center gap-2 p-3 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-violet-900/40 hover:border-violet-700 transition disabled:opacity-50 disabled:cursor-wait">
                                       {suggestionLoading ? <div className="w-5 h-5 border-2 border-slate-400/50 border-t-violet-500 rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5 text-violet-400" />}
                                    </button>
                                </div>
                            </div>
                          </footer>
                      )}
                    </div>
                </div>
            )}
        </main>
        
        {isHubOpen && <GameHub character={character} onClose={() => setIsHubOpen(false)} onUpdateCharacter={setCharacter} />}

        {activeModal === 'exitConfirmation' && (
            <ExitConfirmationModal
                onSaveAndExit={() => { onSaveGame(character); onExitToMenu(); }}
                onExitWithoutSaving={onExitToMenu}
                onCancel={() => setActiveModal(null)}
            />
        )}
    </div>
  );
};

export default GameScreen;