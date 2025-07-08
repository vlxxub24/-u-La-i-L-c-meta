import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Character } from './types';
import GameScreen from './GameScreen';
import CreationScreen from './CreationScreen';
import SparklesIcon from './components/icons/SparklesIcon';
import BookOpenIcon from './components/icons/BookOpenIcon';
import GlobeAltIcon from './components/icons/GlobeAltIcon';
import ClipboardIcon from './components/icons/ClipboardIcon';
import XMarkIcon from './components/icons/XMarkIcon';
import { Cog6ToothIcon } from './components/icons/Cog6ToothIcon';
import { getApiSettings, updateApiSettings, ApiSettings } from './services/geminiService';
import { MATURE_CONTENT_OPTIONS } from './data/matureContent';
import DocumentArrowDownIcon from './components/icons/DocumentArrowDownIcon';
import TrashIcon from './components/icons/TrashIcon';


// --- HELPER COMPONENTS ---
const SettingsModal: React.FC<{ onClose: () => void, onSave: () => void }> = ({ onClose, onSave }) => {
    const [apiSource, setApiSource] = useState<'system' | 'personal'>('system');
    const [personalKeys, setPersonalKeys] = useState<string[]>(['']);
    const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({type: 'idle', message: ''});
    const [selectedMatureIds, setSelectedMatureIds] = useState<string[]>([]);

    useEffect(() => {
        const currentSettings = getApiSettings();
        setApiSource(currentSettings.source);
        // Ensure there's always at least one input box if personal keys are selected but empty
        setPersonalKeys(currentSettings.keys.length > 0 ? currentSettings.keys : ['']);

        try {
            const savedMatureSettings = localStorage.getItem('dl_mature_settings');
            if (savedMatureSettings) {
                setSelectedMatureIds(JSON.parse(savedMatureSettings));
            }
        } catch (e) {
            console.error("Failed to load mature settings from localStorage", e);
        }
    }, []);
    
    const handlePersonalKeyChange = (index: number, value: string) => {
        const newKeys = [...personalKeys];
        newKeys[index] = value;
        setPersonalKeys(newKeys);
    };

    const addPersonalKey = () => {
        setPersonalKeys([...personalKeys, '']);
    };

    const removePersonalKey = (index: number) => {
        if (personalKeys.length <= 1) {
            setPersonalKeys(['']); // Don't remove the last one, just clear it
            return;
        }
        const newKeys = personalKeys.filter((_, i) => i !== index);
        setPersonalKeys(newKeys);
    };

    const handleMatureChange = (id: string, checked: boolean) => {
        setSelectedMatureIds(prev => {
            if (checked) {
                return [...prev, id];
            } else {
                return prev.filter(currentId => currentId !== id);
            }
        });
    };

    const handleSave = () => {
        // Save mature settings first
        try {
            localStorage.setItem('dl_mature_settings', JSON.stringify(selectedMatureIds));
        } catch(e) {
            console.error("Failed to save mature settings to localStorage", e);
            setStatus({type: 'error', message: 'Lưu cài đặt nội dung thất bại.'});
            return;
        }

        // Then save API settings
        const settingsToSave: ApiSettings = {
            source: apiSource,
            keys: personalKeys.map(k => k.trim()).filter(k => k !== '') // Clean up keys before saving
        };
        
        const result = updateApiSettings(settingsToSave);

        if (result.success) {
            setStatus({type: 'success', message: 'Tất cả cài đặt đã được lưu và áp dụng!'});
            onSave(); // Notify parent component that settings have changed
            setTimeout(() => {
                setStatus({type: 'idle', message: ''});
            }, 2000);
        } else {
            setStatus({type: 'error', message: result.error || 'Lưu cài đặt API thất bại.'});
        }
    };
    
    const RadioOption = ({ value, label, current, onChange }: {value: 'system' | 'personal', label: string, current: string, onChange: (val: 'system' | 'personal') => void}) => (
      <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${current === value ? 'border-amber-500 bg-amber-900/20' : 'border-stone-700 hover:bg-stone-800/50'}`}>
        <input type="radio" name="api-source" value={value} checked={current === value} onChange={() => onChange(value)} className="hidden" />
        <span className="font-semibold text-stone-200">{label}</span>
      </label>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-lg shadow-2xl shadow-black/30" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b border-stone-700">
                    <h2 className="text-xl font-bold text-amber-400">Thiết Lập API Gemini</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* API Key Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-amber-500 mb-3">Nguồn API Key Gemini</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RadioOption value="system" label="Sử dụng API Key của Hệ Thống (Mặc định)" current={apiSource} onChange={setApiSource} />
                            <RadioOption value="personal" label="Sử dụng API Key Cá Nhân" current={apiSource} onChange={setApiSource} />
                        </div>

                        {apiSource === 'personal' && (
                            <div className="mt-6 pl-2 border-l-4 border-amber-800/50">
                                <div className="ml-4">
                                    <h4 className="text-md font-semibold text-amber-400 mb-2">Khóa API Gemini Cá Nhân</h4>
                                    <p className="text-xs text-stone-500 mb-4">
                                        Hỗ trợ xoay tua nhiều key để tăng giới hạn sử dụng.
                                        Bạn có thể lấy key từ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Google AI Studio</a>.
                                    </p>
                                    <div className="space-y-3">
                                        {personalKeys.map((key, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="password"
                                                    value={key}
                                                    onChange={(e) => handlePersonalKeyChange(index, e.target.value)}
                                                    placeholder={`Dán API Key #${index + 1} vào đây`}
                                                    className="flex-grow bg-stone-900/70 border border-stone-700 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-500 focus:border-amber-500 transition"
                                                />
                                                <button onClick={() => removePersonalKey(index)} className="p-2 bg-red-800/70 hover:bg-red-700 rounded-md text-white">
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addPersonalKey} className="mt-4 px-3 py-1.5 text-sm bg-stone-700 hover:bg-stone-600 rounded-md text-amber-300 transition">
                                        + Thêm API Key
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-stone-700"></div>

                    {/* Mature Content Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-amber-500 mb-3">Nội dung Người lớn (18+)</h3>
                        <p className="text-sm text-stone-400 mb-4">Các tùy chọn này sẽ chỉ dẫn AI tạo ra nội dung phù hợp. Vui lòng cân nhắc trước khi bật.</p>
                        <div className="space-y-4">
                            {MATURE_CONTENT_OPTIONS.map(option => (
                                <div key={option.id}>
                                    <label htmlFor={`mature-${option.id}`} className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            id={`mature-${option.id}`}
                                            type="checkbox"
                                            checked={selectedMatureIds.includes(option.id)}
                                            onChange={(e) => handleMatureChange(option.id, e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded bg-stone-700 border-stone-600 text-amber-600 focus:ring-amber-500"
                                        />
                                        <div className="flex-1">
                                            <span className="font-semibold text-stone-200">{option.name}</span>
                                            <p className="text-xs text-stone-400 whitespace-pre-wrap">{option.value}</p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-stone-700 bg-black/20">
                     {status.message && (
                        <p className={`text-sm text-center mb-3 ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {status.message}
                        </p>
                    )}
                    <button onClick={handleSave} className="w-full px-4 py-2 bg-amber-700 text-white font-bold rounded-md hover:bg-amber-600 transition">
                        Lưu Cài Đặt
                    </button>
                </div>
            </div>
        </div>
    );
};

const UpdatesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="w-full max-w-lg bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-lg shadow-2xl shadow-black/30" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center border-b border-stone-700">
                <h2 className="text-xl font-bold text-amber-400">Cập Nhật Game</h2>
                <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10"><XMarkIcon className="w-6 h-6"/></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto text-stone-300 space-y-2">
                <h3 className="font-bold text-lg text-amber-500">Phiên bản 1.7.0</h3>
                 <p>✨ Nâng cấp Trải nghiệm Chơi Game!</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Hệ Thống Tỉ Lệ Thành Công:</strong> Mỗi lựa chọn hành động giờ đây sẽ đi kèm với một đánh giá về tỉ lệ thành công (Cao, Trung bình, Thấp) và một con số phần trăm cụ thể, giúp bạn ra quyết định một cách chiến lược hơn.</li>
                    <li><strong>AI Gợi Ý Hành Động:</strong> Khi bế tắc, bạn có thể nhấn nút "AI Gợi Ý Hành Động" để AI đưa ra một phương án hành động sáng tạo và bất ngờ.</li>
                    <li><strong>Lưu Game Vào Tệp:</strong> Trong bảng điều khiển, bạn có thể "Lưu vào Tệp" để tải xuống file lưu game `.json` của mình, giúp sao lưu và chia sẻ dễ dàng.</li>
                </ul>
                <h3 className="font-bold text-lg text-amber-500 mt-4">Phiên bản 1.6.0</h3>
                <p>🔞 Thêm Tùy chọn Nội dung Người lớn!</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Trong mục "Cài đặt", bạn giờ đây có thể bật các quy tắc chi tiết cho nội dung 18+.</li>
                    <li>Các tùy chọn này sẽ trực tiếp chỉ dẫn AI tạo ra câu chuyện với ngôn từ và các tình tiết trần trụi, bạo lực, hoặc khiêu dâm theo ý muốn của bạn.</li>
                </ul>
            </div>
        </div>
    </div>
);

const LoadGameModal: React.FC<{
    onClose: () => void;
    savedGames: Character[];
    onLoad: (character: Character) => void;
    onDelete: (characterName: string) => void;
    onExport: (character: Character) => void;
}> = ({ onClose, savedGames, onLoad, onDelete, onExport }) => (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="w-full max-w-lg bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-lg shadow-2xl shadow-black/30" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center border-b border-stone-700">
                <h2 className="text-xl font-bold text-amber-400">Tải Game Đã Lưu</h2>
                <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10"><XMarkIcon className="w-6 h-6"/></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
                {savedGames.length === 0 ? (
                    <p className="text-center text-stone-400">Không tìm thấy file lưu nào.</p>
                ) : (
                    <div className="space-y-3">
                        {savedGames.map((char) => (
                             <div key={char.name} className="bg-stone-800/80 border border-stone-700 rounded-lg transition-all duration-200 hover:border-amber-600">
                                <div className="p-3">
                                    <p className="font-bold text-amber-400">{char.name}</p>
                                    <p className="text-xs text-stone-400">{char.martialSoul?.name || char.race?.name || 'Chưa có thông tin'} | {char.origin?.name || 'Vô danh'}</p>
                                </div>
                                <div className="flex items-center justify-end gap-2 p-2 border-t border-stone-700/50 bg-black/20">
                                     <button onClick={() => onLoad(char)} className="px-3 py-1 text-sm bg-amber-700 hover:bg-amber-600 text-white rounded-md transition font-semibold">
                                         Tải
                                     </button>
                                     <button onClick={() => onExport(char)} title="Xuất file" className="p-2 bg-slate-700/60 hover:bg-slate-700 rounded-md text-slate-300 transition">
                                        <DocumentArrowDownIcon className="w-4 h-4" />
                                     </button>
                                     <button onClick={() => onDelete(char.name)} title="Xóa" className="p-2 bg-red-800/60 hover:bg-red-700 rounded-md text-white transition">
                                        <TrashIcon className="w-4 h-4" />
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);


const MainMenu: React.FC<{
    onStartNewGame: () => void;
    onLoadGame: (character: Character) => void;
    savedGames: Character[];
    onLoadFromFile: (character: Character) => void;
    onDeleteGame: (characterName: string) => void;
    onExportGame: (character: Character) => void;
    userId: string;
    onSettingsClick: () => void;
}> = ({ onStartNewGame, onLoadGame, savedGames, onLoadFromFile, onDeleteGame, onExportGame, userId, onSettingsClick }) => {
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showUpdatesModal, setShowUpdatesModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const loadedChar = JSON.parse(text);
                        // Basic validation
                        if (loadedChar.name && loadedChar.stats) {
                            onLoadFromFile(loadedChar);
                        } else {
                            alert("File lưu không hợp lệ.");
                        }
                    }
                } catch (error) {
                    console.error("Failed to parse save file:", error);
                    alert("Không thể đọc file lưu. File có thể bị hỏng.");
                }
            };
            reader.readAsText(file);
        }
    };

    const Button = ({onClick, children, isPrimary = false}: {onClick?: () => void, children: React.ReactNode, isPrimary?: boolean}) => (
        <button onClick={onClick} className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-stone-100 font-semibold text-base md:text-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${isPrimary ? 'bg-amber-800/20 border-amber-600 hover:bg-amber-800/50' : 'bg-black/20 border-stone-600 hover:bg-black/40 hover:border-stone-400'}`}>
            {children}
        </button>
    );

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen text-stone-200 p-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-stone-100 mb-2" style={{textShadow: '0 1px 10px rgba(0,0,0,0.7)'}}>
                        Đấu La Đại Lục: Khởi Nguyên
                    </h1>
                </div>

                <div className="w-full max-w-sm space-y-4">
                    <Button onClick={onStartNewGame} isPrimary={true}>
                        <SparklesIcon className="w-6 h-6 text-amber-400"/> Bắt Đầu Cuộc Phiêu Lưu Mới
                    </Button>
                    <Button onClick={() => setShowLoadModal(true)}>
                        <BookOpenIcon className="w-6 h-6"/> Tải Game Đã Lưu ({savedGames.length})
                    </Button>
                     <Button onClick={() => fileInputRef.current?.click()}>
                        <GlobeAltIcon className="w-6 h-6"/> Tải Game Từ Tệp
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                    <Button onClick={onSettingsClick}>
                        <Cog6ToothIcon className="w-6 h-6"/> Cài đặt
                    </Button>
                    <Button onClick={() => setShowUpdatesModal(true)}>
                        <ClipboardIcon className="w-6 h-6"/> Xem Cập Nhật Game
                    </Button>
                </div>

                <div className="mt-8 text-center text-xs text-stone-500">
                   <p>UserID: {userId}</p>
                </div>

            </div>
            {showLoadModal && <LoadGameModal
                savedGames={savedGames}
                onLoad={onLoadGame}
                onClose={() => setShowLoadModal(false)}
                onDelete={onDeleteGame}
                onExport={onExportGame}
            />}
            {showUpdatesModal && <UpdatesModal onClose={() => setShowUpdatesModal(false)} />}
        </>
    );
};


// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [screen, setScreen] = useState<'menu' | 'create' | 'game'>('menu');
  const [character, setCharacter] = useState<Character | null>(null);
  const [savedGames, setSavedGames] = useState<Character[]>([]);
  const [userId, setUserId] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0);

  const matureInstructionString = useMemo(() => {
    try {
        const idsJSON = localStorage.getItem('dl_mature_settings');
        if (!idsJSON) return '';
        const ids: string[] = JSON.parse(idsJSON);
        
        const instructions = MATURE_CONTENT_OPTIONS
          .filter(item => ids.includes(item.id))
          .map(item => `- ${item.name}: ${item.value}`)
          .join('\n\n');
        
        return instructions;
    } catch (e) {
        console.error("Failed to process mature settings", e);
        return '';
    }
  }, [settingsVersion]);


  useEffect(() => {
    // Service initializes itself, so no need for explicit calls here.
    try {
        const saved = localStorage.getItem('dl_saved_games');
        if (saved) {
            setSavedGames(JSON.parse(saved));
        }
        let id = localStorage.getItem('dl_user_id');
        if (!id) {
            id = Date.now().toString(36) + Math.random().toString(36).substring(2);
            localStorage.setItem('dl_user_id', id);
        }
        setUserId(id);

    } catch (e) {
        console.error("Failed to load data from localStorage", e);
    }
  }, []);

  const saveGame = (charToSave: Character) => {
    setSavedGames(prev => {
        const existingIndex = prev.findIndex(g => g.name === charToSave.name);
        let newGames;
        if (existingIndex > -1) {
            newGames = [...prev];
            newGames[existingIndex] = charToSave;
        } else {
            newGames = [...prev, charToSave];
        }
        try {
            localStorage.setItem('dl_saved_games', JSON.stringify(newGames));
        } catch (e) {
            console.error("Failed to save games to localStorage", e);
        }
        return newGames;
    });
  };
  
  const handleDeleteGame = (charNameToDelete: string) => {
      if (window.confirm(`Bạn có chắc muốn xóa nhân vật "${charNameToDelete}" không? Hành động này không thể hoàn tác.`)) {
        const newGames = savedGames.filter(g => g.name !== charNameToDelete);
        setSavedGames(newGames);
        try {
            localStorage.setItem('dl_saved_games', JSON.stringify(newGames));
        } catch (e) {
            console.error("Failed to save games to localStorage after deletion", e);
        }
      }
    };

    const handleExportGame = (charToExport: Character) => {
        try {
            const dataStr = JSON.stringify(charToExport, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.download = `${charToExport.name || 'nhan-vat'}-save.json`;
            
            document.body.appendChild(linkElement);
            linkElement.click();
            
            document.body.removeChild(linkElement);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export game to file:", error);
            alert("Đã xảy ra lỗi khi xuất game ra tệp.");
        }
    };

  const handleStartNewGame = () => {
    setCharacter(null); // Clear previous character
    setScreen('create');
  };

  const handleLoadGame = (char: Character) => {
    setCharacter(char);
    setScreen('game');
  };

  const handleCreationComplete = (newCharacter: Character) => {
    saveGame(newCharacter);
    setCharacter(newCharacter);
    setScreen('game');
  };

  const handleSettingsSaved = () => {
    setSettingsVersion(v => v + 1);
  };

  const renderScreen = () => {
    switch(screen) {
        case 'create':
            return <CreationScreen onCreationComplete={handleCreationComplete} onBackToMenu={() => setScreen('menu')} />;
        case 'game':
            if (character) {
                return <GameScreen
                    character={character}
                    onSaveGame={saveGame}
                    onExitToMenu={() => setScreen('menu')}
                    matureInstructions={matureInstructionString}
                />;
            }
            // Fallback if character is null
            setScreen('menu');
            return null;
        case 'menu':
        default:
             return (
                <MainMenu
                  onStartNewGame={handleStartNewGame}
                  onLoadGame={handleLoadGame}
                  savedGames={savedGames}
                  onLoadFromFile={handleLoadGame}
                  onDeleteGame={handleDeleteGame}
                  onExportGame={handleExportGame}
                  userId={userId}
                  onSettingsClick={() => setShowSettingsModal(true)}
                />
            );
    }
  }

  return (
    <>
      {renderScreen()}
      {showSettingsModal && <SettingsModal onSave={handleSettingsSaved} onClose={() => setShowSettingsModal(false)} />}
    </>
  );
};

export default App;