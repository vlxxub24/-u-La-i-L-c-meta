import React from 'react';

export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ',
  OTHER = 'Khác',
}

export interface Species {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
}

export interface Race {
  id:string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  species: Species[];
}

export interface MartialSoul {
  id: string;
  name:string;
  description: string;
  category: string;
  isCustom?: boolean;
  elements?: string[];
}

export interface Origin {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
}

export interface InnateTalent {
    name: string;
    description: string;
}

export interface Constitution {
    name: string;
    description: string;
}

export interface CharacterStats {
    strength: number;
    intellect: number;
    physique: number;
    agility: number;
    stamina: number;
    luck: number;
}

export const DIFFICULTIES = ['Dễ', 'Thường', 'Khó', 'Địa Ngục'] as const;
export type Difficulty = typeof DIFFICULTIES[number];

export interface StoryEntry {
  id: number;
  type: 'narrative' | 'action';
  text: string;
}

export interface StatusEffect {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}

export interface NPC {
    id: string;
    name: string;
    description: string;
    avatar: string;
    gender: Gender;
    realm: string;
    attitude: 'Thân thiện' | 'Thù địch' | 'Trung lập';
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    isCompleted?: boolean;
}

// New Types for Game Systems
export enum ItemCategory {
  ALL = 'Tất Cả',
  EQUIPMENT = 'Trang Bị',
  CONSUMABLE = 'Tiêu Hao',
  MATERIAL = 'Nguyên Liệu',
  QUEST = 'Nhiệm Vụ',
  GONGFA = 'Công Pháp',
}

export type EquipmentSlot = 'head' | 'body' | 'feet' | 'hands' | 'weapon' | 'accessory1' | 'accessory2' | 'main-gongfa' | 'sub-gongfa';

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  slot?: EquipmentSlot; // Explicitly define which slot an item goes into
  bonus?: string;
  isEquipped?: boolean;
}

export interface Skill {
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
}

export type SoulRingColor = 'Thập Niên' | 'Bách Niên' | 'Thiên Niên' | 'Vạn Niên' | 'Thập Vạn Niên' | 'Bách Vạn Niên';
export type SoulRingType = 'Rừng' | 'Bay' | 'Biển' | 'Đặc Thù' | 'Côn Trùng';

export interface SoulRing {
  id: string;
  name: string;
  years: number;
  color: SoulRingColor;
  ability: string;
  sourceBeast: string;
  type: SoulRingType;
  story: string;
}


export interface Character {
  name: string;
  gender: Gender;
  race: Race | null;
  species: Species | null;
  martialSoul: MartialSoul | null;
  cultivationYears?: number;
  cultivationElements?: string[];
  origin: Origin | null;
  backstory: string;
  innateTalent: InnateTalent | null;
  constitution: Constitution | null;
  stats: CharacterStats;
  worldDescription?: string;
  realmSystem?: string;
  difficulty: Difficulty;
  // Game Hub fields
  adventureTitle?: string;
  personalityTraits?: string[];
  storyLog?: StoryEntry[];
  currentStatus?: StatusEffect[];
  npcs?: NPC[];
  activeQuests?: Quest[];

  // New Game System fields
  hp: { current: number; max: number };
  mana: { current: number; max: number };
  atk: number;
  money: number;
  realm: { name: string; level: number };
  exp: { current: number; next: number };
  inventory: Item[];
  equipment: Record<EquipmentSlot, Item | null>;
  skills: Skill[];
  soulRings: SoulRing[];
}

export interface Choice {
  text: string;
  successRate: 'Cao' | 'Trung bình' | 'Thấp';
  probability: number;
}

export interface MatureContentItem {
  id: string;
  name: string;
  value: string;
}