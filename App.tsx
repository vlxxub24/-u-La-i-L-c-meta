
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
import { MATURE_CONTENT_OPTIONS } from './data/matureContent';
import DocumentArrowDownIcon from './components/icons/DocumentArrowDownIcon';
import TrashIcon from './components/icons/TrashIcon';
import { initializeGemini } from './services/geminiService';


// --- HELPER COMPONENTS ---
const SettingsModal: React.FC<{ onClose: () => void, onSave: () => void }> = ({ onClose, onSave }) => {
    const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({type: 'idle', message: ''});
    const [selectedMatureIds, setSelectedMatureIds] = useState<string[]>([]);
    const [apiKeyMode, setApiKeyMode] = useState<'default' | 'personal'>('default');
    const [personalApiKey, setPersonalApiKey] = useState('');

    useEffect(() => {
        try {
            const savedMatureSettings = localStorage.getItem('dl_mature_settings');
            if (savedMatureSettings) {
                setSelectedMatureIds(JSON.parse(savedMatureSettings));
            }
            const savedApiKeyMode = localStorage.getItem('dl_api_key_mode') as 'default' | 'personal' || 'default';
            const savedPersonalApiKey = localStorage.getItem('dl_personal_api_key') || '';
            setApiKeyMode(savedApiKeyMode);
            setPersonalApiKey(savedPersonalApiKey);
        } catch (e) {
            console.error("Failed to load settings from localStorage", e);
        }
    }, []);
    
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
        try {
            // Save mature settings
            localStorage.setItem('dl_mature_settings', JSON.stringify(selectedMatureIds));
            
            // Save API Key settings
            localStorage.setItem('dl_api_key_mode', apiKeyMode);
            localStorage.setItem('dl_personal_api_key', personalApiKey);

            setStatus({type: 'success', message: 'Cài đặt đã được lưu!'});
            onSave(); // Notify parent to re-initialize AI and re-render
            setTimeout(() => {
                setStatus({type: 'idle', message: ''});
            }, 2000);
        } catch(e) {
            console.error("Failed to save settings to localStorage", e);
             setStatus({type: 'error', message: 'Lưu cài đặt thất bại.'});
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-lg shadow-2xl shadow-black/30" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b border-stone-700">
                    <h2 className="text-xl font-bold text-amber-400">Cài Đặt</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
                     {/* API Key Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-amber-500 mb-3">Quản lý API Key</h3>
                        <p className="text-sm text-stone-400 mb-4">Bạn có thể sử dụng API Key mặc định của trò chơi hoặc cung cấp API Key Gemini của riêng bạn.</p>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-700 bg-black/20 cursor-pointer has-[:checked]:border-amber-500 has-[:checked]:bg-amber-900/20 transition-all">
                                <input
                                    type="radio"
                                    name="apiKeyMode"
                                    value="default"
                                    checked={apiKeyMode === 'default'}
                                    onChange={() => setApiKeyMode('default')}
                                    className="h-4 w-4 text-amber-600 bg-stone-700 border-stone-600 focus:ring-amber-500"
                                />
                                <div>
                                    <span className="font-semibold text-stone-200">Sử dụng API Key Mặc Định</span>
                                    <p className="text-xs text-stone-400">Sử dụng khóa do nhà phát triển cung cấp. Có thể có giới hạn sử dụng.</p>
                                </div>
                            </label>
                             <label className="flex flex-col items-start gap-3 p-3 rounded-lg border border-stone-700 bg-black/20 cursor-pointer has-[:checked]:border-amber-500 has-[:checked]:bg-amber-900/20 transition-all">
                                <div className="flex items-center gap-3 w-full">
                                    <input
                                        type="radio"
                                        name="apiKeyMode"
                                        value="personal"
                                        checked={apiKeyMode === 'personal'}
                                        onChange={() => setApiKeyMode('personal')}
                                        className="h-4 w-4 text-amber-600 bg-stone-700 border-stone-600 focus:ring-amber-500"
                                    />
                                     <div>
                                        <span className="font-semibold text-stone-200">Sử dụng API Key Cá Nhân</span>
                                        <p className="text-xs text-stone-400">Nhập API Key Gemini của riêng bạn để không bị giới hạn.</p>
                                    </div>
                                </div>
                                {apiKeyMode === 'personal' && (
                                     <input
                                        type="password"
                                        value={personalApiKey}
                                        onChange={(e) => setPersonalApiKey(e.target.value)}
                                        placeholder="Dán API Key của bạn vào đây"
                                        className="ml-7 w-[calc(100%-28px)] bg-stone-900 border border-stone-600 rounded-md px-3 py-1.5 text-stone-200 text-sm focus:ring-amber-500 focus:border-amber-500 transition"
                                    />
                                )}
                            </label>
                        </div>
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


  const setupAi = () => {
    const mode = localStorage.getItem('dl_api_key_mode') || 'default';
    let keyToUse = process.env.API_KEY as string;

    if (mode === 'personal') {
        const personalKey = localStorage.getItem('dl_personal_api_key');
        keyToUse = personalKey || ''; // Use personal key, or empty string if not set
    }
    
    initializeGemini(keyToUse);
  };

  useEffect(() => {
    setupAi(); // Initialize AI on first load
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
    setupAi(); // Re-initialize AI with new settings from localStorage
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