import React, { useState, useMemo } from 'react';
import { Character, EquipmentSlot, Item, ItemCategory, Skill, NPC, Quest, Gender, SoulRing, SoulRingColor, SoulRingType } from '../types';
import { DOUGLUO_EVENTS } from '../data/worldData';
import { SOUL_RING_DATA } from '../data/soulRingData';
import XMarkIcon from './icons/XMarkIcon';
import UserIcon from './icons/UserIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import FireIcon from './icons/FireIcon';
import HammerIcon from './icons/HammerIcon'; 
import DocumentTextIcon from './icons/DocumentTextIcon';
import PlayerIcon from './icons/PlayerIcon';
import MapIcon from './icons/MapIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import BrainIcon from './icons/BrainIcon';


interface GameHubProps {
  character: Character;
  onClose: () => void;
  onUpdateCharacter: (character: Character) => void;
}

type HubTab = 'character' | 'equipment' | 'inventory' | 'alchemy' | 'soul_ring_book' | 'beast_skills';

// --- SUB-PANELS (Defined within the same file for simplicity) ---

// #region Character Panel
const CharacterPanel: React.FC<{ character: Character }> = ({ character }) => {
    const TABS = ['Nhân Vật', 'Nhiệm Vụ', 'Sự Kiện', 'Thế Giới', 'NPCs'];
    const [activeTab, setActiveTab] = useState(TABS[0]);

    const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-300">{label}</span>
                <span className="text-slate-400">{value} / {max}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${(value / max) * 100}%` }}></div>
            </div>
        </div>
    );
    
    const formatStat = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num;
    };

    const getAttitudeColor = (attitude: NPC['attitude']) => {
        switch (attitude) {
            case 'Thân thiện': return 'text-green-400';
            case 'Thù địch': return 'text-red-400';
            case 'Trung lập': return 'text-slate-400';
            default: return 'text-slate-400';
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'Nhân Vật':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Left Side */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="relative flex-shrink-0">
                                    <img src="https://i.imgur.com/s41bU4G.png" alt="Avatar" className="w-24 h-24 rounded-lg border-2 border-slate-600" />
                                    <button className="absolute -top-2 -right-2 bg-slate-700 hover:bg-slate-600 p-1 rounded-full border-2 border-slate-500">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-violet-300">{character.name}</h3>
                                    <p className="text-sm text-slate-400">Tính cách: {character.personalityTraits?.join(', ')}</p>
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
                                <h4 className="text-lg font-bold text-violet-400 mb-2">Chỉ Số Chi Tiết</h4>
                                <ProgressBar value={character.hp.current} max={character.hp.max} color="bg-red-500" label="HP" />
                                <ProgressBar value={character.mana.current} max={character.mana.max} color="bg-blue-500" label="Mana" />
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-400">ATK:</span><span className="font-semibold text-white">{formatStat(character.atk)}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Tiền:</span><span className="font-semibold text-yellow-400">{formatStat(character.money)}</span></div>
                                    <div className="col-span-2 flex justify-between"><span className="text-slate-400">Cảnh giới:</span><span className="font-semibold text-green-400">{character.realm.name} (Cấp {character.realm.level})</span></div>
                                </div>
                                <div className="pt-2">
                                     <div className="w-full bg-slate-900 rounded-full h-4 relative border border-slate-700">
                                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(character.exp.current / character.exp.next) * 100}%` }}></div>
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                            Tu vi (EXP): {formatStat(character.exp.current)} / {formatStat(character.exp.next)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="md:col-span-3 space-y-4">
                             <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h4 className="text-lg font-bold text-violet-400 mb-2">Trạng Thái Hiện Tại</h4>
                                <p className="text-sm text-slate-400 italic">
                                    {character.currentStatus && character.currentStatus.length > 0 ? character.currentStatus.map(s => s.name).join(', ') : 'Không có trạng thái nào đang hoạt động.'}
                                </p>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h4 className="text-lg font-bold text-violet-400 mb-2">Kỹ Năng</h4>
                                <div className="space-y-3">
                                    {character.skills.map(skill => (
                                        <div key={skill.name}>
                                            <h5 className="font-bold text-yellow-400">{skill.name} <span className="text-xs text-slate-400">(Mana: {skill.manaCost}, Hồi chiêu: {skill.cooldown})</span></h5>
                                            <p className="text-sm text-slate-300">{skill.description}</p>
                                        </div>
                                    ))}
                                     {character.skills.length === 0 && <p className="text-sm text-slate-400 italic">Chưa học được kỹ năng nào.</p>}
                                </div>
                            </div>
                             <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h4 className="text-lg font-bold text-violet-400 mb-2">Mối Quan Hệ</h4>
                                <p className="text-sm text-slate-400 italic">
                                    {character.npcs && character.npcs.length > 0 ? character.npcs.map(c => c.name).join(', ') : 'Chưa có thông tin.'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'Nhiệm Vụ':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-violet-300 mb-4">Danh Sách Nhiệm Vụ</h3>
                        {character.activeQuests && character.activeQuests.length > 0 ? (
                            <div className="space-y-4">
                                {character.activeQuests.map(quest => (
                                    <div key={quest.id} className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-yellow-500">
                                        <h4 className="font-bold text-lg text-yellow-300">{quest.title}</h4>
                                        <p className="text-sm text-slate-300 mt-1">{quest.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-slate-900/50 rounded-lg">
                                <p className="text-slate-400 italic">Không có nhiệm vụ nào đang hoạt động.</p>
                            </div>
                        )}
                    </div>
                );
            case 'Sự Kiện':
                return (
                     <div>
                        <h3 className="text-2xl font-bold text-violet-300 mb-4">Dòng Thời Gian Đại Lục</h3>
                        <div className="relative border-l-2 border-slate-700 pl-6 space-y-8">
                             {DOUGLUO_EVENTS.map((event, index) => (
                                 <div key={index} className="relative">
                                     <div className="absolute -left-[33px] top-1 w-4 h-4 bg-violet-500 rounded-full border-4 border-slate-800"></div>
                                     <p className="text-sm text-violet-400 font-semibold">{event.time}</p>
                                     <h4 className="font-bold text-lg text-amber-300 mt-1">{event.title}</h4>
                                     <p className="text-sm text-slate-300 mt-1">{event.description}</p>
                                 </div>
                             ))}
                        </div>
                    </div>
                );
            case 'Thế Giới':
                return (
                     <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-violet-300 mb-4">Tổng Quan Thế Giới</h3>
                            <div className="bg-slate-900/50 p-4 rounded-lg">
                                <p className="text-slate-300 whitespace-pre-wrap">{character.worldDescription}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-violet-300 mb-4">Hệ Thống Cảnh Giới</h3>
                            <div className="bg-slate-900/50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {character.realmSystem?.split('\n').map((realm, index) => (
                                        <p key={index} className="text-slate-300 text-sm p-2 bg-slate-800 rounded-md">
                                            {realm}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'NPCs':
                 return (
                    <div>
                        <h3 className="text-2xl font-bold text-violet-300 mb-4">Nhân Vật Đã Gặp</h3>
                         {character.npcs && character.npcs.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {character.npcs.map(npc => (
                                    <div key={npc.id} className="bg-slate-900/50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg text-amber-300">{npc.name}</h4>
                                                <p className="text-xs text-slate-400">{npc.gender} - {npc.realm}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getAttitudeColor(npc.attitude)} bg-black/30`}>{npc.attitude}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 mt-2 italic">{npc.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-slate-900/50 rounded-lg">
                                <p className="text-slate-400 italic">Chưa gặp gỡ nhân vật nào.</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return <div className="p-4 text-center text-slate-400">Chức năng "{activeTab}" đang được phát triển.</div>;
        }
    }

    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex-shrink-0 border-b border-slate-700 mb-4">
                <nav className="flex space-x-2 overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-slate-800 text-violet-400 border-b-2 border-violet-400' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow">
                {renderContent()}
            </div>
        </div>
    );
};
// #endregion Character Panel

// #region Equipment Panel
const EquipmentPanel: React.FC<{ character: Character, onUpdateCharacter: (char: Character) => void }> = ({ character, onUpdateCharacter }) => {
    const [selectedInventoryItem, setSelectedInventoryItem] = useState<Item | null>(null);

    const inventoryEquippable = useMemo(() => character.inventory.filter(i => (i.category === ItemCategory.EQUIPMENT || i.category === ItemCategory.GONGFA) && !i.isEquipped), [character.inventory]);

    const handleUnequip = (slot: EquipmentSlot) => {
        const itemToUnequip = character.equipment[slot];
        if (!itemToUnequip) return;

        const newInventory = character.inventory.map(item =>
            item.id === itemToUnequip.id ? { ...item, isEquipped: false } : item
        );

        const newEquipment = { ...character.equipment, [slot]: null };

        onUpdateCharacter({
            ...character,
            inventory: newInventory,
            equipment: newEquipment,
        });
    };

    const handleEquip = (itemToEquip: Item) => {
        if (!itemToEquip.slot) return;
        const targetSlot = itemToEquip.slot;

        // Find the item currently in the slot, if any
        const currentItemInSlot = character.equipment[targetSlot];

        let newInventory = [...character.inventory];

        // Mark the new item as equipped
        const toEquipIndex = newInventory.findIndex(i => i.id === itemToEquip.id);
        if (toEquipIndex > -1) {
            newInventory[toEquipIndex] = { ...newInventory[toEquipIndex], isEquipped: true };
        }

        // If there was an item in the slot, mark it as unequipped
        if (currentItemInSlot) {
            const currentItemIndex = newInventory.findIndex(i => i.id === currentItemInSlot.id);
            if (currentItemIndex > -1) {
                newInventory[currentItemIndex] = { ...newInventory[currentItemIndex], isEquipped: false };
            }
        }
        
        // Update the equipment record
        const newEquipment = { ...character.equipment, [targetSlot]: itemToEquip };
        
        onUpdateCharacter({ ...character, inventory: newInventory, equipment: newEquipment });
        setSelectedInventoryItem(null); // Clear selection after equipping
    };
    
    const EquipmentSlotDisplay: React.FC<{ slot: EquipmentSlot, label: string, icon: React.ReactNode, className?: string }> = ({ slot, label, icon, className }) => {
        const item = character.equipment[slot];
        return (
            <div className={`flex flex-col items-center ${className}`}>
                 <button onClick={() => handleUnequip(slot)} disabled={!item}
                    className={`w-16 h-16 bg-slate-900/70 rounded-lg flex items-center justify-center border-2 transition-all duration-200
                    ${item ? 'border-amber-500 hover:border-red-500 hover:bg-red-900/40' : 'border-slate-700'}
                    ${!item ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    {item ? <PlayerIcon className="w-10 h-10 text-amber-300" /> : icon}
                </button>
                <span className="text-xs mt-1 text-slate-400">{label}</span>
                <span className="text-xs font-bold text-white truncate w-16 text-center h-4">{item?.name || ''}</span>
            </div>
        )
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full p-6">
            <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col">
                <h3 className="text-xl font-bold text-violet-400 mb-6 flex items-center gap-2"><HammerIcon/> Trang Bị</h3>
                <div className="grid grid-cols-3 gap-y-4 items-start justify-items-center flex-grow">
                    
                    <div className="col-start-2">
                        <EquipmentSlotDisplay slot="head" label="Đầu" icon={<div className="text-slate-500">Đầu</div>}/>
                    </div>

                    <EquipmentSlotDisplay slot="hands" label="Tay" icon={<div className="text-slate-500">Tay</div>}/>
                    <EquipmentSlotDisplay slot="body" label="Thân" icon={<div className="text-slate-500">Thân</div>}/>
                    <EquipmentSlotDisplay slot="feet" label="Chân" icon={<div className="text-slate-500">Chân</div>}/>

                    <EquipmentSlotDisplay slot="weapon" label="Vũ Khí" icon={<div className="text-slate-500">Vũ Khí</div>}/>
                    <div className="bg-slate-900/50 rounded-full w-24 h-24 flex items-center justify-center border-2 border-blue-800 self-center">
                        <PlayerIcon className="w-16 h-16 text-blue-400"/>
                    </div>
                    <EquipmentSlotDisplay slot="accessory1" label="Phụ Kiện 1" icon={<div className="text-slate-500">PK1</div>}/>

                    <div className="col-start-3">
                         <EquipmentSlotDisplay slot="accessory2" label="Phụ Kiện 2" icon={<div className="text-slate-500">PK2</div>}/>
                    </div>
                </div>
                 <div className="mt-6 border-t border-slate-700 pt-6">
                     <h4 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2"><FireIcon/> Công Pháp</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <EquipmentSlotDisplay slot="main-gongfa" label="Công Pháp Chính" icon={<div className="text-slate-500">Chính</div>}/>
                        <EquipmentSlotDisplay slot="sub-gongfa" label="Công Pháp Phụ" icon={<div className="text-slate-500">Phụ</div>}/>
                     </div>
                 </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col">
                 <h3 className="text-xl font-bold text-violet-400 mb-4 flex items-center gap-2"><BriefcaseIcon/> Balo Đồ</h3>
                 <div className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-2 overflow-y-auto min-h-[150px]">
                     {inventoryEquippable.length === 0 ? (
                        <p className="text-slate-500 text-center p-4 italic">Không có trang bị nào trong balo.</p>
                     ) : (
                         <div className="space-y-2">
                             {inventoryEquippable.map(item => (
                                 <button key={item.id} onClick={() => setSelectedInventoryItem(item)} className={`w-full p-2 rounded text-left transition-colors ${selectedInventoryItem?.id === item.id ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                     <p className="font-bold text-green-400">{item.name}</p>
                                     <p className="text-xs text-slate-400">Loại: {item.category}</p>
                                 </button>
                             ))}
                         </div>
                     )}
                 </div>
                 {selectedInventoryItem && (
                    <div className="mt-4 border-t border-slate-700 pt-4 space-y-3">
                        <h4 className="font-bold text-lg text-amber-300">{selectedInventoryItem.name}</h4>
                        <p className="text-sm text-slate-300">{selectedInventoryItem.description}</p>
                        <p className="text-sm"><span className="text-slate-400">Bonus: </span><span className="font-semibold text-yellow-400">{selectedInventoryItem.bonus || '[Không có]'}</span></p>
                         <button onClick={() => handleEquip(selectedInventoryItem)} className="w-full px-4 py-2 bg-green-700 text-white font-bold rounded-md hover:bg-green-600 transition">
                            Trang Bị
                         </button>
                    </div>
                 )}
            </div>
        </div>
    );
}
// #endregion Equipment Panel

// #region Inventory Panel
const InventoryPanel: React.FC<{ character: Character, onUpdateCharacter: (char: Character) => void }> = ({ character, onUpdateCharacter }) => {
    const TABS = Object.values(ItemCategory);
    const [activeTab, setActiveTab] = useState<ItemCategory>(ItemCategory.ALL);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const filteredItems = useMemo(() => {
        const items = character.inventory.filter(item => activeTab === ItemCategory.ALL || item.category === activeTab);
        if (items.length > 0 && !items.find(i => i.id === selectedItem?.id)) {
            setSelectedItem(items[0]);
        } else if (items.length === 0) {
            setSelectedItem(null);
        }
        return items;
    }, [character.inventory, activeTab, selectedItem]);
    
    const handleDropItem = (itemToDrop: Item | null) => {
        if (!itemToDrop) return;
        if(window.confirm(`Bạn có chắc muốn vứt bỏ "${itemToDrop.name}" không?`)) {
            const newInventory = character.inventory.filter(i => i.id !== itemToDrop.id);
            let newEquipment = character.equipment;

            // If the dropped item was equipped, unequip it
            if (itemToDrop.isEquipped && itemToDrop.slot) {
                newEquipment = { ...character.equipment, [itemToDrop.slot]: null };
            }

            onUpdateCharacter({
                ...character,
                inventory: newInventory,
                equipment: newEquipment
            });
            setSelectedItem(null);
        }
    };


    return (
        <div className="h-full flex flex-col p-6">
            <h3 className="text-xl font-bold text-violet-400 mb-4 flex-shrink-0 flex items-center gap-2"><BriefcaseIcon/> Balo Đồ</h3>
            <div className="flex-shrink-0 border-b border-slate-700 mb-4">
                <nav className="flex space-x-1 flex-wrap">
                    {TABS.map(tab => (
                        <button key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 mb-1 text-xs font-semibold rounded-t-md transition-colors ${activeTab === tab ? 'bg-slate-700 text-violet-300' : 'text-slate-400 bg-slate-800/50 hover:bg-slate-700/50'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
                <div className="md:col-span-1 bg-slate-900/50 p-3 rounded-lg flex flex-col">
                    <h4 className="text-lg font-semibold text-violet-300 mb-2 px-1">Vật phẩm ({filteredItems.length})</h4>
                    <div className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-2 overflow-y-auto">
                        {filteredItems.length === 0 ? (
                            <p className="text-slate-500 text-center p-4 italic">Balo trống.</p>
                        ) : (
                            <div className="space-y-1">
                                {filteredItems.map(item => (
                                    <button key={item.id} onClick={() => setSelectedItem(item)} className={`w-full p-2.5 rounded-md text-left transition-colors ${selectedItem?.id === item.id ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                        <p className={`font-bold ${item.isEquipped ? 'text-amber-300' : 'text-green-400'}`}>{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.isEquipped ? '[Đã trang bị]' : `[${item.category}]`}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-lg">
                     {selectedItem ? (
                         <div className="space-y-4">
                             <h4 className="text-2xl font-bold text-green-300">{selectedItem.name}</h4>
                             <div className="text-sm space-y-2">
                                 <p><strong className="text-slate-400 w-24 inline-block">Loại:</strong> {selectedItem.category}</p>
                                 <p><strong className="text-slate-400 w-24 inline-block">Số lượng:</strong> {selectedItem.quantity}</p>
                                 <p><strong className="text-slate-400 w-24 inline-block">Mô tả:</strong> {selectedItem.description}</p>
                                 {selectedItem.bonus && <p><strong className="text-slate-400 w-24 inline-block">Bonus:</strong> <span className="text-yellow-400 font-semibold">{selectedItem.bonus}</span></p>}
                                 {selectedItem.isEquipped && <p className="text-amber-400 font-bold">Vật phẩm này đang được trang bị.</p>}
                             </div>
                             <div className="pt-4">
                                 <button onClick={() => handleDropItem(selectedItem)} className="px-6 py-2 bg-red-700 text-white font-bold rounded-md hover:bg-red-600 transition">Vứt Bỏ</button>
                             </div>
                         </div>
                     ) : (
                         <div className="flex items-center justify-center h-full">
                            <p className="text-slate-500 italic">Chọn một vật phẩm để xem chi tiết.</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};
// #endregion Inventory Panel

// #region Alchemy Panel
const AlchemyPanel: React.FC<{ character: Character, onUpdateCharacter: (char: Character) => void }> = ({ character, onUpdateCharacter }) => {
    const [selectedMaterials, setSelectedMaterials] = useState<Item[]>([]);
    
    const inventoryMaterials = useMemo(() => character.inventory.filter(i => i.category === ItemCategory.MATERIAL), [character.inventory]);

    return (
        <div className="h-full flex flex-col p-6">
             <h3 className="text-xl font-bold text-violet-400 mb-4 flex-shrink-0 flex items-center gap-2"><FireIcon/> Luyện Đan</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="bg-slate-900/50 p-3 rounded-lg flex flex-col">
                    <h4 className="text-lg font-semibold text-violet-300 mb-2 px-1">Balo Đồ (Nguyên liệu)</h4>
                    <div className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-2 overflow-y-auto">
                        {inventoryMaterials.length === 0 ? (
                            <p className="text-slate-500 text-center p-4 italic">Balo trống.</p>
                        ) : (
                             <p className="text-slate-500 text-center p-4 italic">Chưa có nguyên liệu.</p>
                        )}
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col justify-between">
                     <div>
                        <h4 className="text-lg font-semibold text-amber-400 mb-2 border-b border-slate-700 pb-2">Lò Luyện Đan</h4>
                        <div className="min-h-[100px] p-2">
                             <p className="text-slate-500 italic">
                                {selectedMaterials.length === 0 ? 'Chưa chọn nguyên liệu.' : selectedMaterials.map(m => m.name).join(', ')}
                            </p>
                        </div>
                     </div>
                     <div className="space-y-4">
                         <div className="border-t border-slate-700 pt-4">
                            <h4 className="text-lg font-semibold text-amber-400 mb-2">Kết quả dự kiến:</h4>
                             <p className="text-green-400 font-bold italic">Không có công thức phù hợp.</p>
                         </div>
                         <button className="w-full px-6 py-3 bg-blue-800 text-white font-bold rounded-md hover:bg-blue-700 transition disabled:opacity-50" disabled>
                            Luyện Đan
                         </button>
                     </div>
                </div>
             </div>
        </div>
    );
};
// #endregion Alchemy Panel


// #region Soul Ring Book Panel
const SoulRingBookPanel: React.FC<{ character: Character }> = ({ character }) => {
    const [selectedRing, setSelectedRing] = useState<SoulRing | null>(null);
    const [filterColor, setFilterColor] = useState<SoulRingColor | 'all'>('all');
    const [filterType, setFilterType] = useState<SoulRingType | 'all'>('all');
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Thập Niên': true,
        'Bách Niên': true,
    });

    const ownedRingIds = useMemo(() => new Set(character.soulRings.map(r => r.id)), [character.soulRings]);

    const SOUL_RING_COLORS: SoulRingColor[] = ['Thập Niên', 'Bách Niên', 'Thiên Niên', 'Vạn Niên', 'Thập Vạn Niên', 'Bách Vạn Niên'];
    const SOUL_RING_TYPES: SoulRingType[] = ['Rừng', 'Bay', 'Biển', 'Côn Trùng', 'Đặc Thù'];

    const filteredAndGroupedRings = useMemo(() => {
        let rings = SOUL_RING_DATA;

        if (filterColor !== 'all') {
            rings = rings.filter(r => r.color === filterColor);
        }
        if (filterType !== 'all') {
            rings = rings.filter(r => r.type === filterType);
        }

        return rings.reduce((acc, ring) => {
            const group = ring.color;
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(ring);
            return acc;
        }, {} as Record<SoulRingColor, SoulRing[]>);

    }, [filterColor, filterType]);
    
    const getRingColorClass = (color: SoulRingColor): string => {
        switch (color) {
            case 'Thập Niên': return 'text-white border-white/50';
            case 'Bách Niên': return 'text-yellow-300 border-yellow-400/50';
            case 'Thiên Niên': return 'text-purple-400 border-purple-500/50';
            case 'Vạn Niên': return 'text-gray-300 border-gray-400/50';
            case 'Thập Vạn Niên': return 'text-red-400 border-red-500/50 animate-pulse';
            case 'Bách Vạn Niên': return 'text-amber-400 border-amber-500/50 animate-pulse';
            default: return 'text-white';
        }
    };
    
    const getRingBgColorClass = (color: SoulRingColor): string => {
         switch (color) {
            case 'Thập Niên': return 'bg-white/10';
            case 'Bách Niên': return 'bg-yellow-900/20';
            case 'Thiên Niên': return 'bg-purple-900/20';
            case 'Vạn Niên': return 'bg-gray-800/20';
            case 'Thập Vạn Niên': return 'bg-red-900/20';
            case 'Bách Vạn Niên': return 'bg-amber-900/20';
            default: return 'bg-slate-800';
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-6">
            <div className="lg:col-span-1 bg-slate-900/50 p-4 rounded-lg flex flex-col">
                 <div className="mb-4 flex-shrink-0">
                    <h4 className="text-lg font-semibold text-violet-300 mb-2 px-1">Hồn Hoàn Nhân Vật</h4>
                    <div className="space-y-2 p-2 bg-slate-900 border border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                        {character.soulRings.length === 0 ? (
                            <p className="text-slate-500 text-center text-sm italic p-2">Chưa sở hữu Hồn Hoàn nào.</p>
                        ) : (
                            character.soulRings.map((ring, index) => (
                                <div key={index} className="p-1.5 bg-slate-800/70 rounded">
                                    <p className="text-sm font-bold text-amber-300">#{index + 1}: {ring.name}</p>
                                    <p className="text-xs text-slate-400">{ring.years.toLocaleString()} năm</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <h4 className="text-lg font-semibold text-violet-300 mb-2 px-1 flex-shrink-0">Bách Khoa Hồn Hoàn</h4>
                <div className="flex gap-2 mb-4 flex-shrink-0">
                    <select value={filterColor} onChange={e => setFilterColor(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 text-sm">
                        <option value="all">Tất cả màu sắc</option>
                        {SOUL_RING_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                     <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 text-sm">
                        <option value="all">Tất cả loại</option>
                        {SOUL_RING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-2 overflow-y-auto">
                   {Object.keys(filteredAndGroupedRings).length === 0 ? (
                       <p className="text-slate-500 text-center p-4 italic">Không tìm thấy Hồn Hoàn nào.</p>
                   ) : (
                       SOUL_RING_COLORS.map(colorGroup => {
                           const rings = filteredAndGroupedRings[colorGroup as SoulRingColor];
                           if (!rings || rings.length === 0) return null;
                           
                           const isExpanded = expandedGroups[colorGroup] ?? false;

                           return (
                               <div key={colorGroup} className="mb-2">
                                   <button onClick={() => setExpandedGroups(prev => ({...prev, [colorGroup]: !isExpanded}))} className={`w-full p-2 text-left rounded-md flex justify-between items-center transition-colors ${getRingBgColorClass(colorGroup)}`}>
                                       <span className={`font-bold ${getRingColorClass(colorGroup)}`}>{colorGroup} ({rings.length})</span>
                                        {isExpanded ? <span>-</span> : <span>+</span>}
                                   </button>
                                   {isExpanded && (
                                       <div className="pl-2 pt-1 mt-1 border-l-2 border-slate-700 space-y-1">
                                           {rings.map(ring => (
                                               <button key={ring.id} onClick={() => setSelectedRing(ring)} className={`w-full p-1.5 rounded text-left text-sm transition-colors flex justify-between items-center ${selectedRing?.id === ring.id ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                                   <span>{ring.name}</span>
                                                    {ownedRingIds.has(ring.id) && (
                                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-600 text-white flex-shrink-0">Sở Hữu</span>
                                                    )}
                                               </button>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           )
                       })
                   )}
                </div>
            </div>
            <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-lg overflow-y-auto">
                 {selectedRing ? (
                    <div className="space-y-4">
                         <h4 className={`text-2xl font-bold ${getRingColorClass(selectedRing.color)}`}>{selectedRing.name}</h4>
                         <div className="text-sm space-y-3 pb-4 border-b border-slate-700">
                             <p><strong className="text-slate-400 w-28 inline-block">Năm tu vi:</strong> {selectedRing.years.toLocaleString()} năm</p>
                             <p><strong className="text-slate-400 w-28 inline-block">Loại Hồn Thú:</strong> {selectedRing.type}</p>
                             <p><strong className="text-slate-400 w-28 inline-block">Nguồn gốc:</strong> {selectedRing.sourceBeast}</p>
                         </div>
                         <div>
                            <h5 className="font-bold text-amber-300 text-lg mb-1">Khả Năng Hồn Kỹ</h5>
                            <p className="text-slate-200">{selectedRing.ability}</p>
                         </div>
                         <div>
                            <h5 className="font-bold text-amber-300 text-lg mb-1">Cốt Truyện</h5>
                            <p className="text-slate-300 italic">{selectedRing.story}</p>
                         </div>
                    </div>
                 ) : (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500 italic text-lg">Chọn một Hồn Hoàn để xem chi tiết.</p>
                     </div>
                 )}
            </div>
        </div>
    );
};
// #endregion Soul Ring Book Panel

// #region Beast Skills Panel
const BeastSkillsPanel: React.FC<{ character: Character }> = ({ character }) => {
    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
            <h3 className="text-2xl font-bold text-violet-300 mb-6">Bản Mệnh Hồn Kỹ</h3>
            <div className="space-y-4">
                {character.skills && character.skills.length > 0 ? (
                    character.skills.map((skill, index) => (
                        <div key={index} className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-yellow-500">
                            <h4 className="font-bold text-lg text-yellow-300">{skill.name}</h4>
                            <div className="flex gap-4 text-xs text-slate-400 mt-1">
                                <span>Mana: {skill.manaCost}</span>
                                <span>Hồi chiêu: {skill.cooldown} lượt</span>
                            </div>
                            <p className="text-sm text-slate-300 mt-2">{skill.description}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400 italic">Hồn thú này chưa thức tỉnh bất kỳ kỹ năng bẩm sinh nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
// #endregion Beast Skills Panel


// --- MAIN HUB COMPONENT ---
const GameHub: React.FC<GameHubProps> = ({ character, onClose, onUpdateCharacter }) => {
  const isSoulBeast = character.race?.id === 'soul_beast' || character.race?.id === 'ancient_beast';

  const hubTabsConfig = {
    character: { id: 'character', label: 'Thông Tin', icon: UserIcon },
    equipment: { id: 'equipment', label: 'Trang Bị', icon: HammerIcon },
    inventory: { id: 'inventory', label: 'Balo Đồ', icon: BriefcaseIcon },
    alchemy: { id: 'alchemy', label: 'Luyện Đan', icon: FireIcon },
    soul_ring_book: { id: 'soul_ring_book', label: 'Hồn Hoàn Thư', icon: BrainIcon },
    beast_skills: { id: 'beast_skills', label: 'Bản Mệnh Kỹ', icon: BrainIcon },
  };

  const hubTabs = [
    hubTabsConfig.character,
    hubTabsConfig.equipment,
    hubTabsConfig.inventory,
    hubTabsConfig.alchemy,
    isSoulBeast ? hubTabsConfig.beast_skills : hubTabsConfig.soul_ring_book,
  ];
  
  const [activeTab, setActiveTab] = useState<HubTab>(hubTabs[0].id as HubTab);


  const getActiveTabInfo = () => {
    return hubTabs.find(t => t.id === activeTab) || {icon: DocumentTextIcon, label: 'Bảng Điều Khiển'};
  }
  
  const ActiveTabInfo = getActiveTabInfo();

  const renderContent = () => {
    switch (activeTab) {
      case 'character': return <CharacterPanel character={character} />;
      case 'equipment': return <EquipmentPanel character={character} onUpdateCharacter={onUpdateCharacter} />;
      case 'inventory': return <InventoryPanel character={character} onUpdateCharacter={onUpdateCharacter} />;
      case 'alchemy': return <AlchemyPanel character={character} onUpdateCharacter={onUpdateCharacter} />;
      case 'soul_ring_book': return <SoulRingBookPanel character={character} />;
      case 'beast_skills': return <BeastSkillsPanel character={character} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[90] flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="w-full h-full max-w-7xl max-h-[95vh] bg-slate-800/90 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-3">
                <ActiveTabInfo.icon className="w-7 h-7 text-violet-400"/>
                <h2 className="text-2xl font-bold text-violet-400">{ActiveTabInfo.label}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10">
                <XMarkIcon className="w-7 h-7"/>
            </button>
        </header>
        
        <div className="flex-grow flex min-h-0">
          <aside className="w-20 sm:w-48 flex-shrink-0 bg-black/20 border-r border-slate-700 p-2 sm:p-4">
            <nav className="flex flex-col space-y-2">
              {hubTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as HubTab)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-colors w-full text-left ${
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon className="w-6 h-6 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>
          
          <main className="flex-1 overflow-y-auto bg-slate-800/50">
            {renderContent()}
          </main>
        </div>
        <footer className="flex-shrink-0 p-3 bg-black/20 border-t border-slate-700 flex justify-end">
             <button onClick={onClose} className="px-6 py-2 bg-violet-700 text-white font-bold rounded-md hover:bg-violet-600 transition">
                Đóng
            </button>
        </footer>
      </div>
    </div>
  );
}

export default GameHub;