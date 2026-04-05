import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line,
} from "recharts";
import {
  Plus, X, Clock, TrendingUp, Download, Upload, RefreshCw, ChevronLeft, ChevronRight,
  Edit3, Trash2, Sun, Moon, Coffee, Briefcase, Heart, Dumbbell,
  BookOpen, Utensils, Zap, Check, Copy,
  Settings, ChevronDown, Search, Save, FolderOpen,
  Tag, LayoutGrid, AlignJustify, Baby, Bike, Brain,
  Building, Camera, Car, Cloud, Code, Compass, Crown, Diamond,
  Flame, Gift, Globe, Headphones, Home, Key, Laptop, Leaf,
  Lightbulb, Map as MapIcon, Medal, Mic, Music, Paintbrush, Pen, Phone,
  Plane, Rocket, Shield, ShoppingBag, Star, Target, Tv, Users,
  Wallet, Watch, Wifi, Wine, Wrench, MessageCircle, Activity,
  Anchor, Award, Bell, Bookmark, Box, Cake, CircleDot, Clapperboard,
  Coins, Database, Dog, Egg, Eye, Feather, FileText, Flag,
  Footprints, Gamepad2, Glasses, GraduationCap, Hammer, HandHeart,
  Handshake, HardHat, HeartPulse, Mountain, Newspaper, PawPrint,
  PiggyBank, Pizza, Puzzle, Salad, Scissors, Ship, Shirt,
  Signpost, Smartphone, Sparkles, Stethoscope, Store, Sunrise,
  Tent, ThumbsUp, Timer, TreePine, Trophy, Umbrella, University,
  BedDouble, Monitor, Play, Flower2, Apple,
  Film, ShowerHead, Mail, CloudMoon,
  Bath, UsersRound, Video,
  HeartHandshake, Droplets, Sofa, MonitorPlay, MoonStar,
} from "lucide-react";

// ════════════════════════════════════════════
// ICON REGISTRY
// ════════════════════════════════════════════
const ICON_MAP = {
  Briefcase, Heart, Dumbbell, BookOpen, Coffee, Utensils, Moon, Zap, Sun,
  Baby, Bike, Brain, Building, Camera, Car, Cloud, Code, Compass, Crown,
  Diamond, Flame, Gift, Globe, Headphones, Home, Key, Laptop, Leaf,
  Lightbulb, Map: MapIcon, Medal, Mic, Music, Paintbrush, Pen, Phone, Plane,
  Rocket, Shield, ShoppingBag, Star, Target, Tv, Users, Wallet, Watch,
  Wifi, Wine, Wrench, MessageCircle, Activity, Anchor, Award, Bell,
  Bookmark, Box, Cake, CircleDot, Clapperboard, Coins, Database, Dog,
  Egg, Eye, Feather, FileText, Flag, Footprints, Gamepad2, Glasses,
  GraduationCap, Hammer, HandHeart, Handshake, HardHat, HeartPulse,
  Mountain, Newspaper, PawPrint, PiggyBank, Pizza, Puzzle, Salad,
  Scissors, Ship, Shirt, Signpost, Smartphone, Sparkles, Stethoscope,
  Store, Sunrise, Tent, ThumbsUp, Timer, TreePine, Trophy, Umbrella,
  University, Clock, Edit3, Trash2, Save, Settings, Tag, LayoutGrid,
  BedDouble, Monitor, Play, Flower2, Apple,
  Film, ShowerHead, Mail, CloudMoon,
  Bath, UsersRound, Video,
  HeartHandshake, Droplets, Sofa, MonitorPlay, MoonStar,
};

const ICON_CATEGORIES = [
  { label: "Meals & Food",    icons: ["Utensils","Coffee","Salad","Pizza","Egg","Apple","Wine","Cake"] },
  { label: "Sleep",           icons: ["Moon","BedDouble","Sunrise","Sun"] },
  { label: "Learning",        icons: ["BookOpen","GraduationCap","Brain","Newspaper","University","Lightbulb","Pen"] },
  { label: "Media",           icons: ["Play","Headphones","Tv","Film","Monitor","Clapperboard","Music","Mic","Gamepad2"] },
  { label: "Work",            icons: ["Briefcase","Code","Flame","Zap","Laptop","Target","Feather","Leaf","Wrench","Mail","UsersRound","Video"] },
  { label: "Family & Social", icons: ["Heart","Users","Baby","Home","HandHeart","Handshake","Gift","Dog"] },
  { label: "Health",          icons: ["Dumbbell","HeartPulse","Flower2","Footprints","Bike","Activity","Timer","Stethoscope","ShowerHead","Bath"] },
  { label: "Other",           icons: ["Car","Plane","ShoppingBag","Phone","Clock","Camera","Globe","Compass","Wallet","Map"] },
];

const ICON_NAMES = Object.keys(ICON_MAP);
const getIcon = (name) => ICON_MAP[name] || CircleDot;

// ════════════════════════════════════════════
// TAG → ICON MAP  (auto-assigns icon when tag is selected)
// ════════════════════════════════════════════
const TAG_ICON_MAP = {
  'Deep Work':    'Briefcase',
  'Shallow Work': 'Mail',
  'Meetings':     'Users',
  'Zoom Calls':   'Video',
  'Kids':         'Baby',
  'Meals':        'Utensils',
  'Family Time':  'Home',
  'Movies':       'Clapperboard',
  'Wife':         'HeartHandshake',
  'Shower':       'Droplets',
  'Commute':      'Car',
  'Errands':      'ShoppingBag',
  'Surfing':      'Laptop',
  'Relax':        'Sofa',
  'Reading':      'BookOpen',
  'Tutorials':    'MonitorPlay',
  'Exercise':     'Dumbbell',
  'Sleep':        'BedDouble',
  'Nap':          'MoonStar',
};
const DEFAULT_TAG_ICON = 'CircleDot';

const getCustomTagIcons = () => {
  try { return JSON.parse(localStorage.getItem('custom_tag_icons') || '{}'); } catch { return {}; }
};
const setCustomTagIcon = (tagName, iconName) => {
  const cur = getCustomTagIcons();
  if (iconName) cur[tagName] = iconName; else delete cur[tagName];
  localStorage.setItem('custom_tag_icons', JSON.stringify(cur));
};
function getIconForTag(tagName) {
  if (!tagName) return DEFAULT_TAG_ICON;
  const custom = getCustomTagIcons();
  return custom[tagName] || TAG_ICON_MAP[tagName] || DEFAULT_TAG_ICON;
}

// ════════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════════
const SK = "dayrhythm_v2";
const SK_BAK = "dayrhythm_v2_backup";
let _clearConfirmed = false; // set to true only by the explicit Clear All Blocks flow
const load = () => { try { return JSON.parse(localStorage.getItem(SK)) || null; } catch { return null; } };
const save = (d) => {
  try {
    const dayCount = Object.keys(d.days || {}).length;
    if (dayCount === 0 && !_clearConfirmed) {
      // Safety guard: refuse to overwrite non-empty data with empty days
      const existing = localStorage.getItem(SK);
      if (existing) {
        const parsed = JSON.parse(existing);
        const existingDayCount = Object.keys(parsed?.days || {}).length;
        if (existingDayCount > 0) {
          console.warn("[DayRhythm] BLOCKED: attempted to save empty days over existing data", new Error().stack);
          return;
        }
      }
    }
    _clearConfirmed = false;
    // Backup previous data before overwriting
    const current = localStorage.getItem(SK);
    if (current) { try { localStorage.setItem(SK_BAK, current); } catch {} }
    localStorage.setItem(SK, JSON.stringify(d));
  } catch {}
};

// ════════════════════════════════════════════
// GOOGLE AUTH
// ════════════════════════════════════════════
const GOOGLE_CLIENT_ID = "619989982515-dc3ioldl2etfp5qbjs4l1jos7u6n1dd2.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "";
const GOOGLE_AUTH_KEY = "google_auth";
const DRIVE_FILE_KEY = "drive_backup_file_id";
const GOOGLE_SCOPES = "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.appdata";

const loadAuth = () => { try { return JSON.parse(localStorage.getItem(GOOGLE_AUTH_KEY)) || null; } catch { return null; } };
const saveAuth = (auth) => { try { localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(auth)); } catch {} };
const clearAuthStorage = () => {
  [GOOGLE_AUTH_KEY, DRIVE_FILE_KEY, "gcal_token", "gcal_token_exp", "gcal_connected", "gcal_cal_id", "gcal_client_id"].forEach((k) => {
    try { localStorage.removeItem(k); } catch {}
  });
};

async function generatePKCE() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return { verifier, challenge };
}

async function startGoogleSignIn() {
  const { verifier, challenge } = await generatePKCE();
  localStorage.setItem("pkce_verifier", verifier);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: window.location.origin,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function driveBackup(stateData, token) {
  const content = JSON.stringify(stateData);
  const fileId = localStorage.getItem(DRIVE_FILE_KEY);
  if (fileId) {
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: content,
    });
  } else {
    const meta = JSON.stringify({ name: "rhythm-backup.json", parents: ["appDataFolder"] });
    const form = new FormData();
    form.append("metadata", new Blob([meta], { type: "application/json" }));
    form.append("file", new Blob([content], { type: "application/json" }));
    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (data.id) localStorage.setItem(DRIVE_FILE_KEY, data.id);
  }
}

async function driveRestore(token) {
  let fileId = localStorage.getItem(DRIVE_FILE_KEY);
  if (!fileId) {
    const res = await fetch("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D'rhythm-backup.json'&fields=files(id,name,modifiedTime)", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.files?.length) return null;
    fileId = data.files[0].id;
    localStorage.setItem(DRIVE_FILE_KEY, fileId);
  }
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return await res.json();
}

// ════════════════════════════════════════════
// DEFAULTS
// ════════════════════════════════════════════
const DEFAULT_CATEGORIES = [
  { id: "work",      name: "Work",      icon: "Briefcase",  color: "#3B82F6" },
  { id: "family",    name: "Family",    icon: "Heart",      color: "#EF4444" },
  { id: "self-care", name: "Self-Care", icon: "Sun",        color: "#F59E0B" },
  { id: "growth",    name: "Growth",    icon: "TrendingUp", color: "#10B981" },
  { id: "sleep",     name: "Sleep",     icon: "Moon",       color: "#1A1A1A" },
];

const DEFAULT_TAGS = [
  { id: "deep-work",    name: "Deep Work",    catId: "work",      icon: "Briefcase" },
  { id: "shallow-work", name: "Shallow Work", catId: "work",      icon: "Mail" },
  { id: "meetings",     name: "Meetings",     catId: "work",      icon: "Users" },
  { id: "zoom-calls",   name: "Zoom Calls",   catId: "work",      icon: "Video" },
  { id: "kids",         name: "Kids",         catId: "family",    icon: "Baby" },
  { id: "meals",        name: "Meals",        catId: "family",    icon: "Utensils" },
  { id: "family-time",  name: "Family Time",  catId: "family",    icon: "Home" },
  { id: "movies",       name: "Movies",       catId: "family",    icon: "Clapperboard" },
  { id: "wife",         name: "Wife",         catId: "family",    icon: "HeartHandshake" },
  { id: "shower",       name: "Shower",       catId: "self-care", icon: "Droplets" },
  { id: "commute",      name: "Commute",      catId: "self-care", icon: "Car" },
  { id: "errands",      name: "Errands",      catId: "self-care", icon: "ShoppingBag" },
  { id: "surfing",      name: "Surfing",      catId: "self-care", icon: "Laptop" },
  { id: "relax",        name: "Relax",        catId: "self-care", icon: "Sofa" },
  { id: "reading",      name: "Reading",      catId: "growth",    icon: "BookOpen" },
  { id: "tutorials",    name: "Tutorials",    catId: "growth",    icon: "MonitorPlay" },
  { id: "exercise",     name: "Exercise",     catId: "growth",    icon: "Dumbbell" },
  { id: "sleep-tag",    name: "Sleep",        catId: "sleep",     icon: "BedDouble" },
  { id: "nap",          name: "Nap",          catId: "sleep",     icon: "MoonStar" },
];

function migrateV630(saved) {
  if (localStorage.getItem('migrated_v630') === 'true') return saved;
  let { categories, tags, days, ...rest } = saved;

  // 1. Add new default categories if missing
  categories = [...(categories || [])];
  DEFAULT_CATEGORIES.forEach((dc) => {
    if (!categories.find((c) => c.id === dc.id)) categories.push(dc);
  });

  // 2. Add new default tags if missing
  tags = [...(tags || [])];
  DEFAULT_TAGS.forEach((dt) => {
    if (!tags.find((t) => t.id === dt.id)) tags.push(dt);
  });

  // 3. Migrate all blocks
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));
  const newDays = {};
  for (const [dateKey, dayData] of Object.entries(days || {})) {
    const newBlocks = (dayData.blocks || []).map((b) => {
      // Convert tagIds array → single tagId
      let tagId = b.tagId;
      if (!tagId && b.tagIds?.length) tagId = b.tagIds[0];
      const { tagIds: _ti, ...cleanBlock } = b;
      // Update color to match category
      const cat = catMap[cleanBlock.catId];
      const color = cat ? cat.color : (cleanBlock.color || "#94A3B8");
      // Update icon from tag name
      const tag = tagMap[tagId];
      const icon = tag ? getIconForTag(tag.name) : (cleanBlock.icon || undefined);
      return { ...cleanBlock, tagId: tagId || "", color, icon };
    });
    newDays[dateKey] = { ...dayData, blocks: newBlocks };
  }

  localStorage.setItem('migrated_v630', 'true');
  return { ...rest, categories, tags, days: newDays };
}

function initState() {
  const saved = load();
  if (saved && saved.version === 2) {
    const migrated = migrateV630(saved);
    // Merge any missing default categories into existing saves
    const cats = [...(migrated.categories || [])];
    DEFAULT_CATEGORIES.forEach((dc) => {
      if (!cats.find((c) => c.id === dc.id)) cats.push(dc);
    });
    // Add any missing default tags
    let tgs = [...(migrated.tags || [])];
    // Renames & icon backfill for existing tags
    tgs = tgs.map((t) => {
      const dt = DEFAULT_TAGS.find((d) => d.id === t.id);
      if (!dt) return t;
      return { ...t, name: dt.name, icon: t.icon || dt.icon };
    });
    DEFAULT_TAGS.forEach((dt) => {
      if (!tgs.find((t) => t.id === dt.id)) tgs.push(dt);
    });
    return { recurring: [], ...migrated, categories: cats, tags: tgs };
  }
  return {
    version: 2,
    categories: DEFAULT_CATEGORIES,
    tags: DEFAULT_TAGS,
    days: generateSeed(),
    templates: [
      { id: "t1", name: "Work Day", blocks: seedWorkday() },
      { id: "t2", name: "Weekend", blocks: seedWeekend() },
    ],
    recurring: [],
  };
}

function getEffectiveBlocks(state, dateKey) {
  const dayData = state.days[dateKey] || { theme: "", blocks: [] };
  const skipped = dayData.skipped || [];
  const d = new Date(dateKey + "T12:00:00");
  const dow = d.getDay();
  const applicable = (state.recurring || []).filter((r) => {
    if (skipped.includes(r.id)) return false;
    if (r.repeat === "daily") return true;
    if (r.repeat === "weekdays") return dow >= 1 && dow <= 5;
    if (r.repeat === "weekly") {
      const cd = new Date((r.createdDay || dateKey) + "T12:00:00");
      return cd.getDay() === dow;
    }
    return false;
  }).map((r) => ({ ...r, _fromRecurring: true }));
  return [...dayData.blocks, ...applicable].sort((a, b) => a.start - b.start);
}

function seedWorkday() {
  let id = 1;
  return [
    { id: id++, start: 6,    end: 7,    catId: "growth",    tagId: "exercise",     title: "Morning Workout", color: "#10B981", icon: "Dumbbell" },
    { id: id++, start: 7,    end: 8,    catId: "family",    tagId: "meals",        title: "Breakfast",       color: "#EF4444", icon: "Utensils" },
    { id: id++, start: 8,    end: 10,   catId: "work",      tagId: "deep-work",    title: "Strategic Planning", color: "#3B82F6", icon: "Briefcase" },
    { id: id++, start: 10,   end: 11.5, catId: "work",      tagId: "meetings",     title: "Team Calls",      color: "#3B82F6", icon: "Users" },
    { id: id++, start: 11.5, end: 13,   catId: "work",      tagId: "deep-work",    title: "Execution",       color: "#3B82F6", icon: "Briefcase" },
    { id: id++, start: 13,   end: 14,   catId: "family",    tagId: "meals",        title: "Lunch",           color: "#EF4444", icon: "Utensils" },
    { id: id++, start: 14,   end: 16,   catId: "work",      tagId: "meetings",     title: "Stakeholders",    color: "#3B82F6", icon: "Users" },
    { id: id++, start: 16,   end: 17.5, catId: "work",      tagId: "shallow-work", title: "Email & Admin",   color: "#3B82F6", icon: "Mail" },
    { id: id++, start: 18,   end: 19,   catId: "family",    tagId: "family-time",  title: "Family Time",     color: "#EF4444", icon: "Home" },
    { id: id++, start: 19,   end: 20,   catId: "family",    tagId: "meals",        title: "Dinner",          color: "#EF4444", icon: "Utensils" },
    { id: id++, start: 20,   end: 21,   catId: "growth",    tagId: "reading",      title: "Reading",         color: "#10B981", icon: "BookOpen" },
    { id: id++, start: 22,   end: 6,    catId: "sleep",     tagId: "sleep-tag",    title: "Sleep",           color: "#1A1A1A", icon: "BedDouble" },
  ];
}
function seedWeekend() {
  let id = 1;
  return [
    { id: id++, start: 7,    end: 8,    catId: "growth",    tagId: "exercise",    title: "Morning Run",     color: "#10B981", icon: "Dumbbell" },
    { id: id++, start: 8,    end: 9.5,  catId: "family",    tagId: "meals",       title: "Brunch",          color: "#EF4444", icon: "Utensils" },
    { id: id++, start: 9.5,  end: 12,   catId: "family",    tagId: "family-time", title: "Family Outing",   color: "#EF4444", icon: "Home" },
    { id: id++, start: 12,   end: 13,   catId: "family",    tagId: "meals",       title: "Lunch",           color: "#EF4444", icon: "Utensils" },
    { id: id++, start: 14,   end: 16,   catId: "self-care", tagId: "relax",       title: "Relaxation",      color: "#F59E0B", icon: "Sofa" },
    { id: id++, start: 16,   end: 18,   catId: "work",      tagId: "deep-work",   title: "Side Project",    color: "#3B82F6", icon: "Briefcase" },
    { id: id++, start: 18,   end: 20,   catId: "family",    tagId: "family-time", title: "Family Dinner",   color: "#EF4444", icon: "Home" },
    { id: id++, start: 22,   end: 7,    catId: "sleep",     tagId: "sleep-tag",   title: "Sleep",           color: "#1A1A1A", icon: "BedDouble" },
  ];
}

function generateSeed() {
  const days = {};
  const now = new Date();
  for (let d = 0; d < 14; d++) {
    const dt = new Date(now); dt.setDate(dt.getDate() - d);
    const k = dk(dt);
    const isWE = dt.getDay() === 0 || dt.getDay() === 6;
    const blocks = (isWE ? seedWeekend() : seedWorkday()).map((b, i) => ({ ...b, id: Date.now() + i + d * 100 }));
    days[k] = { theme: isWE ? "Recovery" : ["Execution Day", "Strategy Day", "Deep Focus", "Board Prep"][d % 4], blocks };
  }
  return days;
}

// ════════════════════════════════════════════
// ICON → EMOJI MAP  (auto-maps on export, user never sees this)
// ════════════════════════════════════════════
const ICON_EMOJI_MAP = {
  // Meals & Food
  Utensils:"🍽️", Coffee:"☕", Salad:"🥗", Pizza:"🍕", Egg:"🥚",
  Apple:"🍎", Wine:"🍷", Cake:"🎂",
  // Sleep & Rest
  Moon:"🌙", BedDouble:"🛏️", Sunrise:"🌅", Sun:"☀️", CloudMoon:"🌜",
  // Learning
  BookOpen:"📖", GraduationCap:"🎓", Brain:"🧠", Newspaper:"📰",
  University:"🏛️", Lightbulb:"💡", Pen:"✏️",
  // Media
  Play:"▶️", Headphones:"🎧", Tv:"📺", Film:"🎥", Monitor:"🖥️",
  Clapperboard:"🎬", Music:"🎵", Mic:"🎙️", Gamepad2:"🎮",
  // Work
  Briefcase:"💼", Code:"💻", Flame:"🔥", Zap:"⚡", Laptop:"💻",
  Target:"🎯", Feather:"🪶", Leaf:"🍃", Wrench:"🔧", Mail:"📧",
  FileText:"📋", Clipboard:"📋",
  // Family & Social
  Heart:"❤️", Users:"👥", Baby:"👶", Home:"🏠",
  HandHeart:"🫶", Handshake:"🤝", Gift:"🎁", Dog:"🐕",
  Sparkles:"✨",
  // Work (meetings)
  UsersRound:"🫂", Video:"📹",
  // Self-care
  Bath:"🛁", HeartHandshake:"🫶", Droplets:"💧", Sofa:"🛋️", MonitorPlay:"📺", MoonStar:"🌙",
  // Health & Fitness
  Dumbbell:"🏋️", HeartPulse:"💗", Flower2:"🌸", Footprints:"🚶",
  Bike:"🚴", Activity:"💪", Timer:"⏱️", Stethoscope:"🩺", ShowerHead:"🚿",
  // Travel & Other
  Car:"🚗", Plane:"✈️", ShoppingBag:"🛍️", Phone:"📱",
  Clock:"🕐", Camera:"📷", Globe:"🌍", Compass:"🧭",
  Wallet:"👛", Map:"🗺️",
  // Extended
  Building:"🏢", Cloud:"☁️", Crown:"👑", Diamond:"💎",
  Key:"🔑", Medal:"🏅", MessageCircle:"💬", Mountain:"⛰️",
  Paintbrush:"🎨", Rocket:"🚀", Shield:"🛡️", Star:"⭐",
  Trophy:"🏆", Umbrella:"☂️", Watch:"⌚", Wifi:"📶",
  Anchor:"⚓", Award:"🏆", Bell:"🔔", Bookmark:"🔖",
  Box:"📦", Coins:"💰", Database:"🗄️", Eye:"👁️",
  Flag:"🏁", Glasses:"👓", Hammer:"🔨", HardHat:"⛑️",
  PawPrint:"🐾", PiggyBank:"🐷", Puzzle:"🧩", Scissors:"✂️",
  Ship:"🚢", Shirt:"👔", Signpost:"🪧", Smartphone:"📱",
  Store:"🏪", Tent:"⛺", ThumbsUp:"👍", TreePine:"🌲",
};

const getEmoji = (iconId) => (iconId && ICON_EMOJI_MAP[iconId]) || "";
const normalizeEmoji = (s) => s.replace(/\uFE0F/g, ""); // strip variation selectors for comparison
const getIconFromEmoji = (emoji) => {
  const norm = normalizeEmoji(emoji);
  for (const [id, e] of Object.entries(ICON_EMOJI_MAP)) {
    if (normalizeEmoji(e) === norm) return id;
  }
  return null;
};

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════
const fmt = (h) => {
  const hr = Math.floor(h) % 24, mn = Math.round((h % 1) * 60);
  const s = hr >= 12 ? "PM" : "AM", d = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return mn > 0 ? `${d}:${String(mn).padStart(2, "0")} ${s}` : `${d} ${s}`;
};
const dur = (a, b) => (b > a ? b - a : 24 - a + b);
const dk = (d) => { const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dy = String(d.getDate()).padStart(2, "0"); return `${y}-${m}-${dy}`; };
const fd = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const snap30 = (v) => Math.round(v * 2) / 2;
const snapTo = (v, interval) => Math.round(v / interval) * interval;
const getTagIds = (block) => block?.tagIds || (block?.tagId ? [block.tagId] : []);


const timeAgo = (iso) => {
  if (!iso) return "Never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
};
const luminance = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
};
const textColor = (hex) => {
  try { return luminance(hex) > 0.55 ? "#1E293B" : "#FFFFFF"; } catch { return "#FFFFFF"; }
};

// Display name: auto-prepend mapped emoji for external outputs only
const getDisplayName = (block) => {
  const iconId = block?.icon || block?.iconId;
  const emoji = getEmoji(iconId);
  return emoji ? `${emoji} ${block.title}` : (block?.title || "");
};
// Parse imported GCal title: split emoji → reverse-lookup icon ID
const parseDisplayName = (title) => {
  if (!title) return { icon: null, name: "" };
  // Match a full emoji sequence: handles ZWJ sequences (👨‍👩‍👧), variation selectors (❤️), etc.
  const m = title.match(/^(\p{Emoji_Presentation}\uFE0F?(?:\u200D\p{Emoji_Presentation}\uFE0F?)*|\p{Emoji}\uFE0F)\s*/u);
  if (m) {
    const emoji = m[0].trim();
    return { icon: getIconFromEmoji(emoji), name: title.slice(m[0].length).trim() };
  }
  return { icon: null, name: title };
};

// ════════════════════════════════════════════
// CSV EXPORT (ALL DAYS)
// ════════════════════════════════════════════
function genCSV(allData, categories, tags) {
  const header = ["Date", "Icon", "Block Name", "Display Name", "Start Time", "End Time", "Duration (h)", "Category", "Tags"];
  const rows = [header];
  const sortedDates = Object.keys(allData).sort();
  for (const dateKey of sortedDates) {
    const dayBlocks = (allData[dateKey]?.blocks || []).slice().sort((a, b) => a.start - b.start);
    for (const b of dayBlocks) {
      const cat = categories.find((c) => c.id === b.catId);
      const tagNames = getTagIds(b).map((tid) => tags.find((t) => t.id === tid)?.name || "").filter(Boolean).join("; ");
      rows.push([dateKey, b.icon || "", b.title, getDisplayName(b), fmt(b.start), fmt(b.end), dur(b.start, b.end).toFixed(2), cat?.name || "", tagNames]);
    }
  }
  return rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

// ════════════════════════════════════════════
// ICS
// ════════════════════════════════════════════
function genICS(blocks, date) {
  const p = (n) => String(n).padStart(2, "0");
  const iD = (date, h) => { const d = new Date(date); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(Math.floor(h))}${p(Math.round((h % 1) * 60))}00`; };
  let s = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DayRhythm//EN\n";
  blocks.forEach((b) => { s += `BEGIN:VEVENT\nDTSTART:${iD(date, b.start)}\nDTEND:${iD(date, b.end > b.start ? b.end : b.end + 24)}\nSUMMARY:${getDisplayName(b)}\nEND:VEVENT\n`; });
  return s + "END:VCALENDAR";
}

function parseICS(text, targetDate) {
  const targetKey = dk(targetDate);
  const blocks = [];
  const raw = text.replace(/\r\n[ \t]/g, "").replace(/\r/g, "\n"); // unfold lines
  const events = raw.split("BEGIN:VEVENT").slice(1);
  for (const ev of events) {
    const get = (key) => { const m = ev.match(new RegExp(String.raw`${key}[^:\n]*:([^\n]+)`)); return m ? m[1].trim() : null; };
    const title = get("SUMMARY") || "Imported Event";
    const dtstart = get("DTSTART");
    const dtend = get("DTEND");
    if (!dtstart || !dtstart.includes("T")) continue; // skip all-day
    const parse = (s) => { const m = s.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/); return m ? { key: `${m[1]}-${m[2]}-${m[3]}`, h: parseInt(m[4]) + parseInt(m[5]) / 60 } : null; };
    const s = parse(dtstart);
    const e = dtend ? parse(dtend) : null;
    if (!s || s.key !== targetKey) continue;
    const start = snap30(s.h);
    const end = e ? snap30(e.h) : start + 0.5;
    blocks.push({ id: uid(), title, start, end: end <= start ? start + 0.5 : end, catId: "personal", tagId: "", color: "#2563EB" });
  }
  return blocks;
}

// ════════════════════════════════════════════
// COLOR PICKER
// ════════════════════════════════════════════
const PRESET_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#2563EB", "#7C3AED", "#EC4899", "#0891B2", "#6366F1", "#1E293B", "#D97706", "#059669", "#DC2626", "#8B5CF6", "#0D9488", "#E11D48", "#CA8A04"];

function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value || "#2563EB");
  useEffect(() => setHex(value || "#2563EB"), [value]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="w-6 h-6 rounded-md border border-gray-200" style={{ backgroundColor: hex }} />
        <span className="text-xs text-gray-500 font-mono">{hex}</span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 w-64">
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {PRESET_COLORS.map((c) => (
              <button key={c} onClick={() => { setHex(c); onChange(c); setOpen(false); }}
                className={`w-7 h-7 rounded-md border-2 transition-all ${hex === c ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input type="color" value={hex} onChange={(e) => { setHex(e.target.value); onChange(e.target.value); }}
              className="w-10 h-8 rounded cursor-pointer border-0 p-0" />
            <input value={hex} onChange={(e) => { const v = e.target.value; setHex(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v); }}
              className="flex-1 text-xs font-mono border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// ICON PICKER (inline — contained within modals)
// ════════════════════════════════════════════
function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const Sel = value ? getIcon(value) : null;
  const filtered = search ? ICON_NAMES.filter((n) => n.toLowerCase().includes(search.toLowerCase())).slice(0, 64) : null;

  const IconBtn = ({ name }) => {
    const I = getIcon(name);
    return (
      <button key={name} onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${value === name ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-600"}`}
        title={name}><I size={15} /></button>
    );
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        {Sel ? <Sel size={17} className="text-gray-700" /> : <CircleDot size={17} className="text-gray-400" />}
        <ChevronDown size={11} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 bg-gray-50 rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons..."
                className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            {value && (
              <button onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className="text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap px-2 py-1.5 rounded-lg hover:bg-red-50">
                Clear
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto overscroll-contain">
            {filtered ? (
              <div className="grid grid-cols-8 gap-1">
                {filtered.map((name) => <IconBtn key={name} name={name} />)}
              </div>
            ) : (
              <div className="space-y-2.5">
                {ICON_CATEGORIES.map(({ label, icons }) => (
                  <div key={label}>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
                    <div className="grid grid-cols-8 gap-1">
                      {icons.filter((n) => ICON_MAP[n]).map((name) => <IconBtn key={name} name={name} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// TREND SUMMARY (7-day rolling, Rhythm tab)
// ════════════════════════════════════════════
// ════════════════════════════════════════════
// CATEGORY LABEL HELPER (icon + name)
// ════════════════════════════════════════════
function CatLabel({ cat, size = 13, className = "" }) {
  if (!cat) return null;
  const Icon = getIcon(cat.icon || "CircleDot");
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Icon size={size} style={{ color: cat.color }} />
      <span>{cat.name}</span>
    </span>
  );
}

// ════════════════════════════════════════════
// CIRCULAR CLOCK (with drag + labels)
// ════════════════════════════════════════════
function CircularClock({ blocks, categories, onUpdateBlock, onSelectBlock, selectedId, currentHour, remainingHrs, onDeselect, onNavigate, snapInterval = 0.5 }) {
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const holdTimerRef = useRef(null);
  const pendingRef = useRef(null);
  const swipeRef = useRef(null);
  const blocksRef = useRef(blocks);
  const snapIntervalRef = useRef(snapInterval);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { snapIntervalRef.current = snapInterval; }, [snapInterval]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragLabel, setDragLabel] = useState(null);
  const rafRef = useRef(null);
  const rafDataRef = useRef(null);
  const circleInteractingRef = useRef(false);
  const ghostRef = useRef(null);
  const size = 380;
  const cx = size / 2, cy = size / 2;
  const oR = 148, iR = 95;

  const ptc = (r, a) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arc = (sa, ea, outerR, innerR) => {
    if (Math.abs(ea - sa) < 0.5) ea = sa + 0.5;
    const s1 = ptc(outerR, sa), e1 = ptc(outerR, ea);
    const s2 = ptc(innerR, ea), e2 = ptc(innerR, sa);
    const large = ea - sa > 180 ? 1 : 0;
    return `M ${s1.x} ${s1.y} A ${outerR} ${outerR} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y} Z`;
  };

  const hA = (h) => ((h % 24) / 24) * 360;

  const angleToHour = (px, py) => {
    const dx = px - cx, dy = py - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return snapTo((angle / 360) * 24, snapInterval);
  };

  const getSVGPoint = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: cx, y: cy };
    const pt = svg.createSVGPoint();
    const touch = e.touches ? e.touches[0] : e;
    pt.x = touch.clientX;
    pt.y = touch.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const handlePointerDown = (e, block, mode) => {
    e.stopPropagation();
    e.preventDefault();
    const pt = getSVGPoint(e);
    const pressHour = angleToHour(pt.x, pt.y);
    clearTimeout(holdTimerRef.current);

    // Recurring blocks: tap only, no drag
    if (block._fromRecurring) {
      pendingRef.current = { block, mode: "move", startHour: pressHour, origStart: block.start, origEnd: block.end, startPt: pt };
      return;
    }

    // Edge detection: determine resize vs move from WHERE on arc was pressed
    let resolvedMode = mode;
    if (mode === "move") {
      const blockDur = dur(block.start, block.end);
      let offset = pressHour - block.start;
      if (offset < 0) offset += 24;
      if (offset > blockDur) offset = blockDur;
      // Pixel-based edge zone: 26px on the midRadius arc (~0.82h)
      const midRadius = (oR + iR) / 2;
      const edgeZoneHours = (26 / (2 * Math.PI * midRadius)) * 24;
      const distFromStart = offset;
      const distFromEnd = blockDur - offset;
      if (distFromStart < edgeZoneHours && distFromEnd < edgeZoneHours) {
        // Short block: nearest edge wins
        resolvedMode = distFromStart <= distFromEnd ? "start" : "end";
      } else if (distFromStart < edgeZoneHours) {
        resolvedMode = "start";
      } else if (distFromEnd < edgeZoneHours) {
        resolvedMode = "end";
      }
    }

    const data = { block, mode: resolvedMode, startHour: pressHour, origStart: block.start, origEnd: block.end };

    // Always set pendingRef so a quick tap always triggers selection
    pendingRef.current = { ...data, startPt: pt };

    if (resolvedMode !== "move") {
      // Edge zone: require selection first (same rule as move)
      if (selectedId === block.id) {
        dragRef.current = data;
      }
      // If not selected, pendingRef handles tap-to-select via handlePointerUp
    } else {
      // Middle zone: hold to enter move/drag — only when block is already selected
      // Unselected blocks get tap-to-select only; no accidental drag on first touch
      if (selectedId === block.id) {
        holdTimerRef.current = setTimeout(() => {
          if (pendingRef.current) {
            ghostRef.current = { id: block.id, start: block.start, end: block.end };
            dragRef.current = pendingRef.current;
            pendingRef.current = null;
            setDraggingId(block.id);
          }
        }, 300);
      }
    }
  };

  const noOverlap = useCallback((id, ns, ne) => {
    const seg = (s, e) => e > s ? [[s, e]] : [[s, 24], [0, e]];
    const a = seg(ns, ne);
    return !blocksRef.current.filter((b) => b.id !== id).some((b) => {
      const bSeg = seg(b.start, b.end);
      return a.some(([s1, e1]) => bSeg.some(([s2, e2]) => s1 < e2 && e1 > s2));
    });
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (pendingRef.current) {
      const pt = getSVGPoint(e);
      const dx = pt.x - pendingRef.current.startPt.x;
      const dy = pt.y - pendingRef.current.startPt.y;
      // Lower threshold for edge resize (5px) vs move (15px) for quicker feedback
      const threshold = pendingRef.current.mode === "move" ? 15 : 5;
      if (Math.sqrt(dx * dx + dy * dy) > threshold) {
        clearTimeout(holdTimerRef.current);
        const pendingMode = pendingRef.current.mode;
        pendingRef.current = null;
        if (pendingMode === "move") return; // move requires hold timer, don't drag yet
        // edge resize: fall through to dragRef processing below
      } else {
        return; // under threshold — wait for tap or hold
      }
    }
    if (!dragRef.current) return;
    if (!circleInteractingRef.current) {
      circleInteractingRef.current = true;
      document.body.style.overflow = 'hidden';
    }
    e.preventDefault();
    const pt = getSVGPoint(e);
    const hr = angleToHour(pt.x, pt.y);
    const d = dragRef.current;
    const delta = hr - d.startHour;
    const si = snapIntervalRef.current;
    let update = null;
    if (d.mode === "move") {
      const ns = snapTo((d.origStart + delta + 24) % 24, si);
      const ne = snapTo((d.origEnd + delta + 24) % 24, si);
      if (noOverlap(d.block.id, ns, ne)) {
        const midHour = (ns + dur(ns, ne) / 2) % 24;
        const lp = ptc(oR + 22, hA(midHour));
        update = { id: d.block.id, updates: { start: ns, end: ne }, label: { x: lp.x, y: lp.y, text: `${fmt(ns)} – ${fmt(ne)}` } };
      }
    } else if (d.mode === "start") {
      const ns = snapTo((d.origStart + delta + 24) % 24, si);
      if (noOverlap(d.block.id, ns, d.origEnd)) {
        const lp = ptc(oR + 22, hA(ns));
        update = { id: d.block.id, updates: { start: ns }, label: { x: lp.x, y: lp.y, text: fmt(ns) } };
      }
    } else if (d.mode === "end") {
      const ne = snapTo((d.origEnd + delta + 24) % 24, si);
      if (noOverlap(d.block.id, d.origStart, ne)) {
        const lp = ptc(oR + 22, hA(ne));
        update = { id: d.block.id, updates: { end: ne }, label: { x: lp.x, y: lp.y, text: fmt(ne) } };
      }
    }
    if (update) {
      rafDataRef.current = update;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const data = rafDataRef.current; rafDataRef.current = null;
          if (data) { onUpdateBlock(data.id, data.updates); if (data.label) setDragLabel(data.label); }
        });
      }
    }
  }, [onUpdateBlock, noOverlap]);

  const handlePointerUp = useCallback(() => {
    if (circleInteractingRef.current) {
      circleInteractingRef.current = false;
      document.body.style.overflow = '';
    }
    clearTimeout(holdTimerRef.current);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (rafDataRef.current) {
      const data = rafDataRef.current; rafDataRef.current = null;
      onUpdateBlock(data.id, data.updates);
    }
    if (pendingRef.current) {
      onSelectBlock(pendingRef.current.block.id);
      pendingRef.current = null;
    }
    ghostRef.current = null;
    setDraggingId(null);
    setDragLabel(null);
    dragRef.current = null;
    swipeRef.current = null;
  }, [onSelectBlock, onUpdateBlock]);

  // Background swipe → navigate day (only within the circular area)
  const handleBgTouchStart = (e) => {
    if (dragRef.current || pendingRef.current) return;
    const t = e.touches[0];
    // Reject touches outside the circle boundary
    const svg = svgRef.current;
    if (svg) {
      const pt = svg.createSVGPoint();
      pt.x = t.clientX; pt.y = t.clientY;
      const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      const dist = Math.sqrt((sp.x - cx) ** 2 + (sp.y - cy) ** 2);
      if (dist > oR + 6) return;
    }
    swipeRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleBgTouchEnd = (e) => {
    if (!swipeRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeRef.current.x;
    const dy = t.clientY - swipeRef.current.y;
    swipeRef.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onNavigate(dx < 0 ? 1 : -1);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      if (circleInteractingRef.current) { circleInteractingRef.current = false; document.body.style.overflow = ''; }
    };
  }, [handlePointerMove, handlePointerUp]);

  const nowAngle = hA(currentHour);

  return (
    <svg ref={svgRef} viewBox="14 14 352 352" className="w-full select-none"
      style={{ filter: "drop-shadow(0 2px 14px rgba(0,0,0,0.07))", willChange: "transform", touchAction: "pan-y" }}
      onTouchStart={handleBgTouchStart} onTouchEnd={handleBgTouchEnd}>
      <defs>
        <radialGradient id="bg2"><stop offset="0%" stopColor="#FAFBFC" /><stop offset="100%" stopColor="#F1F5F9" /></radialGradient>
        <filter id="gl2"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="active"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <style>{`@keyframes dr-pulse{0%,100%{opacity:0.3}50%{opacity:0.75}}`}</style>
        <filter id="handleShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25" />
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={oR + 6} fill="url(#bg2)" stroke="#E2E8F0" strokeWidth="0.8" onClick={onDeselect} style={{ cursor: "default" }} />
      <circle cx={cx} cy={cy} r={iR - 6} fill="white" stroke="#E2E8F0" strokeWidth="0.5" onClick={onDeselect} style={{ cursor: "pointer" }} />

      {/* All 24 hour ticks — 12h format, AM blue-gray / PM warm */}
      {Array.from({ length: 24 }, (_, h) => {
        const a = hA(h);
        const major = h % 6 === 0;
        const p1 = ptc(oR + 2, a);
        const p2 = ptc(oR + 6, a);
        const lp = ptc(oR + 12 + ((h === 0 || h === 12) ? 1 : 0), a);
        const isAM = h < 12;
        const h12 = h % 12 === 0 ? "12" : `${h % 12}`;
        const labelColor = isAM
          ? (major ? "#475569" : "#94A3B8")
          : (major ? "#78716C" : "#B8A99A");
        const tickColor = isAM ? "#CBD5E1" : "#D4C5BA";
        return (
          <g key={h}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={tickColor} strokeWidth="1" strokeLinecap="round" />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
              fontSize={major ? "7.5" : "6"} fontWeight={major ? "700" : "500"}
              fill={labelColor} style={{ fontFamily: "'DM Sans'" }}>
              {h12}
            </text>
          </g>
        );
      })}

      {/* Blocks */}
      {blocks.map((block) => {
        let sa = hA(block.start);
        let ea = hA(block.end > block.start ? block.end : block.end + 24);
        if (ea <= sa) ea += 360;
        const color = block.color || "#94A3B8";
        const tc = textColor(color);
        const sel = selectedId === block.id;
        const blockDur = dur(block.start, block.end);
        const midA = sa + (ea - sa) / 2;
        const midR = (oR + iR) / 2;
        const midP = ptc(midR, midA);
        const cat = categories.find((c) => c.id === block.catId);
        const isActive = currentHour >= block.start && currentHour < (block.end > block.start ? block.end : block.end + 24);
        const startP = ptc(midR, sa);
        const endP = ptc(midR, ea);
        const arcLen = ((ea - sa) * Math.PI / 180) * ((oR + iR) / 2);
        const isDragging = draggingId === block.id;
        const blockIconName = block.icon || block.iconId;
        const BlockIcon = blockIconName ? getIcon(blockIconName) : null;
        const iconPx = blockDur >= 2 ? 22 : blockDur >= 1 ? 17 : blockDur >= 0.5 ? 11 : 9;
        const iconStroke = blockDur >= 0.5 ? 2.5 : 2;
        const showIcon = arcLen > 6 && blockDur >= 0.25 && BlockIcon;

        const arcOuterR = sel ? oR + 8 : oR;

        return (
          <g key={block.id}>
            {/* Ghost outline at original position during drag */}
            {isDragging && ghostRef.current && ghostRef.current.id === block.id && (() => {
              const gs = hA(ghostRef.current.start);
              const ge = hA(ghostRef.current.end > ghostRef.current.start ? ghostRef.current.end : ghostRef.current.end + 24);
              const gea = ge <= gs ? ge + 360 : ge;
              return <path d={arc(gs, gea, oR, iR)} fill={color} opacity="0.2" style={{ pointerEvents: "none" }} />;
            })()}

            {isActive && (
              <path d={arc(sa, ea, arcOuterR + 5, arcOuterR + 1)} fill="none" stroke={color} strokeWidth="3"
                style={{ animation: "dr-pulse 2s ease-in-out infinite" }} />
            )}
            <path d={arc(sa, ea, arcOuterR, iR)} fill={color}
              opacity={isDragging ? 1 : sel ? 1 : block._fromRecurring ? 0.65 : 0.9}
              stroke={isDragging ? "white" : block._fromRecurring ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
              strokeWidth={isDragging ? 4 : block._fromRecurring ? 1.5 : 0.5}
              strokeDasharray={block._fromRecurring ? "4 2" : undefined}
              filter={isDragging ? "url(#gl2)" : isActive ? "url(#active)" : undefined}
              style={{ cursor: block._fromRecurring ? "pointer" : isDragging ? "grabbing" : "grab", touchAction: "none" }}
              onMouseDown={(e) => handlePointerDown(e, block, "move")}
              onTouchStart={(e) => handlePointerDown(e, block, "move")} />

            {/* Icon — hidden when selected (center handle occupies midpoint) */}
            {showIcon && !sel && (
              <foreignObject x={midP.x - iconPx / 2} y={midP.y - iconPx / 2}
                width={iconPx} height={iconPx} style={{ pointerEvents: "none", overflow: "visible" }}>
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BlockIcon size={iconPx} color={tc} strokeWidth={iconStroke} />
                </div>
              </foreignObject>
            )}

            {/* Handles — shown when selected */}
            {sel && (
              <>
                {/* Edge handles — invisible hit zones always, visible dots only for wide-enough blocks */}
                <circle cx={startP.x} cy={startP.y} r="18" fill="transparent"
                  style={{ cursor: "ew-resize", touchAction: "none" }}
                  onMouseDown={(e) => handlePointerDown(e, block, "start")}
                  onTouchStart={(e) => handlePointerDown(e, block, "start")} />
                <circle cx={endP.x} cy={endP.y} r="18" fill="transparent"
                  style={{ cursor: "ew-resize", touchAction: "none" }}
                  onMouseDown={(e) => handlePointerDown(e, block, "end")}
                  onTouchStart={(e) => handlePointerDown(e, block, "end")} />
                {blockDur >= 0.75 && (
                  <>
                    <circle cx={startP.x} cy={startP.y} r="8" fill="white" stroke={color} strokeWidth="2"
                      filter="url(#handleShadow)" style={{ pointerEvents: "none" }} />
                    <circle cx={endP.x} cy={endP.y} r="8" fill="white" stroke={color} strokeWidth="2"
                      filter="url(#handleShadow)" style={{ pointerEvents: "none" }} />
                  </>
                )}
                {/* Center handle (relocate) — always shown for selected blocks */}
                <circle cx={midP.x} cy={midP.y} r="13"
                  fill="white" stroke="#E2E8F0" strokeWidth="1.5"
                  filter="url(#handleShadow)"
                  style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
                  onMouseDown={(e) => handlePointerDown(e, block, "move")}
                  onTouchStart={(e) => handlePointerDown(e, block, "move")} />
                {/* 2×3 grip dots inside center handle */}
                {[-3, 0, 3].flatMap((dx) => [-2.5, 2.5].map((dy) => (
                  <circle key={`g${dx}-${dy}`} cx={midP.x + dx} cy={midP.y + dy} r="1.3"
                    fill="#94A3B8" style={{ pointerEvents: "none" }} />
                )))}
              </>
            )}
          </g>
        );
      })}

      {/* Current time dot on outer ring */}
      <circle cx={ptc(oR + 4, nowAngle).x} cy={ptc(oR + 4, nowAngle).y} r="4"
        fill="#0F172A" />

      {/* Floating time label during edge resize */}
      {dragLabel && (
        <g>
          <rect x={dragLabel.x - 44} y={dragLabel.y - 10} width="88" height="20" rx="4"
            fill="#0F172A" opacity="0.85" />
          <text x={dragLabel.x} y={dragLabel.y} textAnchor="middle" dominantBaseline="central"
            fontSize="10" fontWeight="700" fill="white" style={{ fontFamily: "'DM Sans'", pointerEvents: "none" }}>
            {dragLabel.text}
          </text>
        </g>
      )}

      {/* Center — three zones: remaining (top), time (center), block info (bottom) */}
      {(() => {
        const remH = Math.floor(remainingHrs);
        const remM = Math.round((remainingHrs - remH) * 60);
        const remText = remM > 0 ? `${remH}h ${remM}m remaining` : `${remH}h remaining`;
        const activeBlock = blocks.find((b) => {
          if (b.end > b.start) return currentHour >= b.start && currentHour < b.end;
          return currentHour >= b.start || currentHour < b.end;
        });
        const blockName = activeBlock ? activeBlock.title : "Free Time";
        const blockTime = activeBlock ? `${fmt(activeBlock.start)} – ${fmt(activeBlock.end)}` : null;
        const foW = 160;
        // Block remaining time calculation
        let blockRemText = null;
        let blockRemOvertime = false;
        if (activeBlock) {
          const remMins = Math.round(dur(currentHour, activeBlock.end) * 60);
          const fmtM = (m) => { const h = Math.floor(m / 60), mn = m % 60; return h > 0 ? (mn > 0 ? `${h}h ${mn}m` : `${h}h`) : `${mn}m`; };
          if (remMins > 0) {
            blockRemText = fmtM(remMins) + " left";
          } else {
            blockRemText = "-" + fmtM(Math.abs(remMins)) + " over";
            blockRemOvertime = true;
          }
        }
        return (
          <>
            {/* Top zone: day remaining + block remaining */}
            <text x={cx} y={cy - 40} textAnchor="middle" dominantBaseline="central"
              fontSize="11" fontWeight="500" fill="#94A3B8" style={{ fontFamily: "'DM Sans'" }}>
              {remText}
            </text>
            {blockRemText && (
              <text x={cx} y={cy - 27} textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontWeight="500" fill={blockRemOvertime ? "#EF4444" : "#94A3B8"} style={{ fontFamily: "'DM Sans'" }}>
                {blockRemText}
              </text>
            )}
            {/* Center: current time at true cy */}
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fontSize="26" fontWeight="700" fill="#0F172A" style={{ fontFamily: "'DM Sans'" }}>
              {fmt(currentHour)}
            </text>
            {/* Bottom zone: block name */}
            <foreignObject x={cx - foW / 2} y={cy + 22} width={foW} height={16} style={{ pointerEvents: "none", overflow: "visible" }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: activeBlock ? "700" : "500", color: activeBlock ? "#0F172A" : "#94A3B8", fontFamily: "'DM Sans'",
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {blockName}
              </div>
            </foreignObject>
            {/* Bottom zone: block time range (active blocks only) */}
            {blockTime && (
              <text x={cx} y={cy + 44} textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontWeight="500" fill="#94A3B8" style={{ fontFamily: "'DM Sans'" }}>
                {blockTime}
              </text>
            )}
          </>
        );
      })()}
    </svg>
  );
}

// ════════════════════════════════════════════
// 3-DAY OVERVIEW
// ════════════════════════════════════════════
function ThreeDayView({ getBlocksForDay, currentDate, onNavigate, currentHour }) {
  const hourH = 56;
  const contRef = useRef(null);

  useEffect(() => {
    if (contRef.current) contRef.current.scrollTop = Math.max(0, (currentHour - 2) * hourH);
  }, []);

  const todayKey3 = dk(new Date());
  const days = useMemo(() => [-1, 0, 1].map((offset) => {
    const d = new Date(currentDate); d.setDate(d.getDate() + offset);
    const key = dk(d);
    const isToday = key === todayKey3;
    return {
      key, offset,
      label: isToday ? "Today" : d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
      blocks: getBlocksForDay(key),
      isToday,
    };
  }), [currentDate, getBlocksForDay]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 130px - 72px - env(safe-area-inset-bottom, 0px))" }}>
      {/* Sticky day headers */}
      <div className="flex flex-shrink-0 border-b border-gray-100 bg-white ml-10">
        {days.map(({ key, offset, label, isToday }) => (
          <div key={key} onClick={() => offset !== 0 && onNavigate(offset)}
            className={`flex-1 text-center py-1.5 text-[11px] font-bold transition-colors ${isToday ? "text-blue-600" : "text-gray-400 active:text-gray-700 cursor-pointer"}`}>
            {label}
          </div>
        ))}
      </div>
      {/* Scrollable body */}
      <div ref={contRef} className="flex-1 overflow-y-auto relative timeline-scroll" style={{ touchAction: "pan-y", overscrollBehavior: "contain" }}>
        <div className="flex" style={{ height: 24 * hourH }}>
          {/* Hour labels */}
          <div className="w-10 flex-shrink-0 relative">
            {Array.from({ length: 25 }, (_, h) => (
              <div key={h} className="absolute right-2 text-[9px] font-medium text-gray-300 -translate-y-2" style={{ top: h * hourH }}>
                {h < 24 ? fmt(h) : ""}
              </div>
            ))}
          </div>
          {/* Day columns */}
          {days.map(({ key, isToday, blocks, offset }) => (
            <div key={key} className={`flex-1 relative border-l border-gray-100 ${isToday ? "bg-white" : "bg-gray-50/60"}`}
              onClick={() => offset !== 0 && onNavigate(offset)}>
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="absolute left-0 right-0 border-t border-gray-100/80" style={{ top: h * hourH }} />
              ))}
              {isToday && (
                <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top: currentHour * hourH }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 -ml-0.5" />
                  <div className="flex-1 h-px bg-red-400 opacity-70" />
                </div>
              )}
              {blocks.map((block) => {
                const blockDur = dur(block.start, block.end);
                const tc = textColor(block.color || "#94A3B8");
                return (
                  <div key={block.id} className="absolute left-0.5 right-0.5 rounded overflow-hidden"
                    style={{ top: block.start * hourH, height: Math.max(18, blockDur * hourH), backgroundColor: block.color || "#94A3B8", opacity: block._fromRecurring ? 0.65 : 0.88, border: block._fromRecurring ? "1px dashed rgba(255,255,255,0.6)" : undefined }}>
                    <div className="px-1 pt-0.5 text-[9px] font-semibold leading-tight truncate" style={{ color: tc }}>{block.title}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// VERTICAL TIMELINE
// ════════════════════════════════════════════
function VerticalTimeline({ blocks, categories, onUpdateBlock, onSelectBlock, selectedId, onAddAtGap, currentHour, onDeselect, snapInterval = 0.5 }) {
  const hourH = 56;
  const dragRef = useRef(null);
  const holdTimerRef = useRef(null);
  const pendingRef = useRef(null);
  const contRef = useRef(null);

  useEffect(() => {
    if (contRef.current) contRef.current.scrollTop = 0;
  }, []);

  const getHourFromY = (clientY) => {
    if (!contRef.current) return 0;
    const rect = contRef.current.getBoundingClientRect();
    const scrollTop = contRef.current.scrollTop;
    const y = clientY - rect.top + scrollTop;
    return snapTo(Math.max(0, Math.min(24, y / hourH)), snapInterval);
  };

  const handleDown = (e, block, mode) => {
    e.stopPropagation();
    const touch = e.touches ? e.touches[0] : e;
    if (mode === "move" && block._fromRecurring) return; // recurring: tap only (onClick handles it)
    if (mode === "move") {
      // Require 350ms hold before drag activates
      clearTimeout(holdTimerRef.current);
      pendingRef.current = { block, mode, initY: touch.clientY, origStart: block.start, origEnd: block.end };
      holdTimerRef.current = setTimeout(() => {
        if (pendingRef.current) {
          dragRef.current = { ...pendingRef.current, startY: pendingRef.current.initY, initClientY: pendingRef.current.initY, active: true };
          pendingRef.current = null;
        }
      }, 350);
    } else {
      // Resize handles activate immediately
      dragRef.current = { block, mode, startY: touch.clientY, initClientY: touch.clientY, origStart: block.start, origEnd: block.end, active: false };
    }
  };

  const handleMove = useCallback((e) => {
    if (pendingRef.current) {
      const touch = e.touches ? e.touches[0] : e;
      if (Math.abs(touch.clientY - pendingRef.current.initY) > 10) {
        // User swiping — cancel hold, let scroll happen
        clearTimeout(holdTimerRef.current);
        pendingRef.current = null;
      }
      return;
    }
    if (!dragRef.current) return;
    const touch = e.touches ? e.touches[0] : e;
    const d = dragRef.current;
    if (!d.active) {
      if (Math.abs(touch.clientY - d.initClientY) < 10) return;
      d.active = true;
      d.startY = touch.clientY;
    }
    e.preventDefault();
    const hr = getHourFromY(touch.clientY);
    const delta = hr - getHourFromY(d.startY);

    if (d.mode === "move") {
      const blockDur = dur(d.origStart, d.origEnd);
      let ns = snapTo(Math.max(0, Math.min(24 - blockDur, d.origStart + delta)), snapInterval);
      onUpdateBlock(d.block.id, { start: ns, end: snapTo(ns + blockDur, snapInterval) });
    } else if (d.mode === "top") {
      onUpdateBlock(d.block.id, { start: snapTo(Math.max(0, d.origStart + delta), snapInterval) });
    } else if (d.mode === "bottom") {
      onUpdateBlock(d.block.id, { end: snapTo(Math.min(24, d.origEnd + delta), snapInterval) });
    }
  }, [onUpdateBlock]);

  const handleUp = useCallback(() => {
    clearTimeout(holdTimerRef.current);
    pendingRef.current = null;
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); window.removeEventListener("touchmove", handleMove); window.removeEventListener("touchend", handleUp); };
  }, [handleMove, handleUp]);

  const gaps = useMemo(() => {
    const segments = [];
    blocks.forEach((b) => {
      if (b.end > b.start) {
        segments.push({ start: b.start, end: b.end });
      } else {
        segments.push({ start: b.start, end: 24 });
        if (b.end > 0) segments.push({ start: 0, end: b.end });
      }
    });
    const sorted = segments.sort((a, b) => a.start - b.start);
    const g = [];
    let cursor = 0;
    sorted.forEach((b) => {
      if (b.start > cursor) g.push({ start: cursor, end: b.start });
      cursor = Math.max(cursor, b.end);
    });
    if (cursor < 24) g.push({ start: cursor, end: 24 });
    return g;
  }, [blocks]);

  return (
    <div ref={contRef} className="relative overflow-y-auto timeline-scroll" style={{ height: "calc(100vh - 130px - 72px - env(safe-area-inset-bottom, 0px))", touchAction: "pan-y", overscrollBehavior: "contain" }} onClick={onDeselect}>
      <div className="relative" style={{ height: 24 * hourH, minHeight: 24 * hourH }}>
        {Array.from({ length: 25 }, (_, h) => (
          <div key={h} className="absolute left-0 right-0 flex items-start" style={{ top: h * hourH }}>
            <div className="w-12 text-right pr-2 text-[10px] font-semibold text-gray-400 -mt-1.5" style={{ fontFamily: "'DM Sans'" }}>{fmt(h % 24)}</div>
            <div className="flex-1 border-t border-gray-100" />
          </div>
        ))}

        {/* Current time line */}
        <div className="absolute left-12 right-0 flex items-center z-20" style={{ top: currentHour * hourH }}>
          <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
          <div className="flex-1 h-0.5 bg-red-500 opacity-60" />
        </div>

        {/* Gap tap targets */}
        {gaps.map((g, i) => (
          <div key={`gap-${i}`} className="absolute left-14 right-2 flex items-center justify-center cursor-pointer group rounded-sm hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
            style={{ top: g.start * hourH + 2, height: Math.max(28, (g.end - g.start) * hourH - 4), zIndex: 2 }}
            onClick={(e) => { e.stopPropagation(); onAddAtGap(g.start, g.end); }}>
            <div className="flex items-center gap-1.5 text-gray-300 group-hover:text-blue-500 transition-colors">
              <Plus size={16} />
              <span className="text-[11px] font-semibold">{dur(g.start, g.end).toFixed(1)}h free</span>
            </div>
          </div>
        ))}

        {/* Blocks */}
        {blocks.map((block) => {
          const top = block.start * hourH;
          const blockDur = block.end > block.start ? block.end - block.start : 24 - block.start + block.end;
          const height = Math.max(24, blockDur * hourH);
          const color = block.color || "#94A3B8";
          const tc = textColor(color);
          const cat = categories.find((c) => c.id === block.catId);
          const BlockIcon = getIcon(block.icon || block.iconId || cat?.icon || "CircleDot");
          const sel = selectedId === block.id;
          const isActive = currentHour >= block.start && currentHour < block.start + blockDur;

          return (
            <div key={block.id} className="absolute left-14 right-2 rounded-sm overflow-hidden select-none"
              style={{ top, height, backgroundColor: color, opacity: sel ? 1 : block._fromRecurring ? 0.72 : 0.88, boxShadow: sel ? "0 0 0 2.5px #0F172A" : isActive ? `0 0 0 2px ${color}, 0 0 12px ${color}40` : "0 1px 3px rgba(0,0,0,0.08)", border: block._fromRecurring ? "1.5px dashed rgba(255,255,255,0.7)" : undefined, zIndex: sel ? 10 : isActive ? 5 : 3, transition: "box-shadow 0.2s" }}
              onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}>
              {/* Top drag handle */}
              <div className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize flex justify-center items-center"
                onMouseDown={(e) => handleDown(e, block, "top")} onTouchStart={(e) => handleDown(e, block, "top")}>
                {sel && <div className="w-8 h-1 rounded-full bg-white opacity-60" />}
              </div>
              {/* Content */}
              <div className="px-2 py-1 flex flex-col justify-start cursor-grab"
                onMouseDown={(e) => handleDown(e, block, "move")} onTouchStart={(e) => handleDown(e, block, "move")}>
                {/* Row 1: icon + name */}
                <div className="flex items-center gap-1.5">
                  <div className="flex-shrink-0 flex items-center justify-center"
                    style={{ width: blockDur < 0.5 ? 16 : 20, height: blockDur < 0.5 ? 16 : 20, minWidth: blockDur < 0.5 ? 16 : 20 }}>
                    <BlockIcon size={blockDur < 0.5 ? 10 : 12} color={tc} />
                  </div>
                  <span className="text-xs font-semibold truncate leading-tight" style={{ color: tc, fontSize: blockDur < 0.5 ? 10 : undefined }}>
                    {block.title}
                  </span>
                  {block._fromRecurring && <span className="text-[10px] opacity-60 flex-shrink-0" style={{ color: tc }}>↻</span>}
                </div>
                {/* Row 2: time range left, duration right — hidden for very short blocks */}
                {blockDur >= 0.5 && (
                  <div className="flex items-center justify-between mt-0.5 ml-[26px]">
                    <span className="text-[10px] opacity-70" style={{ color: tc }}>{fmt(block.start)} – {fmt(block.end)}</span>
                    <span className="text-[10px] font-bold opacity-60 flex-shrink-0" style={{ color: tc }}>{blockDur.toFixed(1)}h</span>
                  </div>
                )}
              </div>
              {/* Bottom drag handle */}
              <div className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex justify-center items-center"
                onMouseDown={(e) => handleDown(e, block, "bottom")} onTouchStart={(e) => handleDown(e, block, "bottom")}>
                {sel && <div className="w-8 h-1 rounded-full bg-white opacity-60" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// BLOCK EDITOR (with inline category/tag management)
// ════════════════════════════════════════════
function BlockEditor({ block, categories, tags, onSave, onDelete, onDeleteRecurring, onDuplicate, onClose, onAddCat, onAddTag, prefillStart, prefillEnd, snapInterval = 0.5 }) {
  const isRecurring = !!block?._fromRecurring;
  const [title, setTitle] = useState(block?.title || "");
  const popupRef = useRef(null);

  // Lock background scroll while popup is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Track popup with visual viewport when iOS keyboard appears
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handle = () => {
      const el = popupRef.current;
      if (!el) return;
      const kbH = window.innerHeight - vv.height;
      if (kbH > 100) {
        const bottomOffset = window.innerHeight - vv.height - vv.offsetTop;
        el.style.bottom = `${bottomOffset}px`;
        el.style.maxHeight = `${vv.height - 20}px`;
      } else {
        el.style.bottom = "";
        el.style.maxHeight = "";
      }
    };
    vv.addEventListener("resize", handle);
    vv.addEventListener("scroll", handle);
    return () => { vv.removeEventListener("resize", handle); vv.removeEventListener("scroll", handle); };
  }, []);

  const initCatId = block?.catId || categories[0]?.id || "";
  const initTagId = block?.tagId || getTagIds(block)[0] || "";
  const [catId, setCatId] = useState(initCatId);
  const [tagId, setTagId] = useState(initTagId);
  const [sH, setSH] = useState(block?.start ?? prefillStart ?? 9);
  const [eH, setEH] = useState(block?.end ?? prefillEnd ?? 10);
  const [repeat, setRepeat] = useState(block?.repeat || "none");

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Star");
  const [newCatColor, setNewCatColor] = useState("#3B82F6");

  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  // Derived from selections — never manually picked
  const selectedCat = categories.find((c) => c.id === catId);
  const color = selectedCat?.color || "#3B82F6";
  const selectedTag = tags.find((t) => t.id === tagId);
  const icon = selectedTag ? (selectedTag.icon || getIconForTag(selectedTag.name)) : (selectedCat?.icon || DEFAULT_TAG_ICON);

  const ftags = tags.filter((t) => t.catId === catId);
  const isEditing = !!(block?.id);
  const timeOpts = Array.from({ length: Math.round(24 / snapInterval) }, (_, i) => i * snapInterval);
  // Always show only times after start + midnight. For overnight existing blocks include stored end time.
  const baseEndOpts = [...timeOpts.filter((h) => h > sH), 24];
  const endTimeOpts = (isEditing && eH < sH && !baseEndOpts.includes(eH))
    ? [eH, ...baseEndOpts]
    : baseEndOpts;

  const handleCatChange = (id) => {
    setCatId(id);
    setTagId(""); // clear tag when category changes
  };

  const handleTagToggle = (id) => {
    setTagId((prev) => prev === id ? "" : id); // radio: tap again to deselect
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div ref={popupRef} className="fixed bottom-0 left-0 right-0 bg-white w-full max-w-md rounded-t-3xl p-5 pb-7 max-h-[90vh] overflow-y-auto sm:rounded-2xl sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'DM Sans', sans-serif", transition: "max-height 200ms ease, bottom 200ms ease" }}>
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4 sm:hidden" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{block?.id ? "Edit Block" : "New Block"}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => { const el = e.target; setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 350); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Deep Work Session" />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => {
                const CatI = getIcon(c.icon || "CircleDot");
                return (
                  <button key={c.id} onClick={() => handleCatChange(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${catId === c.id ? "text-white shadow-md" : "bg-gray-100 text-gray-600"}`}
                    style={catId === c.id ? { backgroundColor: c.color } : {}}>
                    <CatI size={12} />
                    {c.name}
                  </button>
                );
              })}
              <button onClick={() => setShowNewCat(!showNewCat)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-400 hover:bg-gray-100 border border-dashed border-gray-200">
                <Plus size={14} /> New
              </button>
            </div>
            {showNewCat && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl space-y-2">
                <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category name"
                  onFocus={(e) => { const el = e.target; setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 350); }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <div className="flex gap-2 items-center">
                  <IconPicker value={newCatIcon} onChange={setNewCatIcon} />
                  <ColorPicker value={newCatColor} onChange={setNewCatColor} />
                </div>
                <button onClick={() => {
                  if (newCatName.trim()) {
                    const nc = { id: uid(), name: newCatName.trim(), icon: newCatIcon, color: newCatColor };
                    onAddCat(nc);
                    handleCatChange(nc.id);
                    setNewCatName(""); setShowNewCat(false);
                  }
                }} className="w-full py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold">Add Category</button>
              </div>
            )}
          </div>

          {/* Tag — single-select, radio-style */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tag</label>
            {ftags.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No tags for this category yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {ftags.map((t) => {
                  const sel = tagId === t.id;
                  const TI = getIcon(getIconForTag(t.name));
                  return (
                    <button key={t.id} onClick={() => handleTagToggle(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${sel ? "text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      style={sel ? { backgroundColor: color } : {}}>
                      <TI size={12} />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
            <button onClick={() => setShowNewTag(!showNewTag)}
              className="flex items-center gap-1 mt-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 hover:bg-gray-100 border border-dashed border-gray-200">
              <Plus size={12} /> New tag
            </button>
            {showNewTag && (
              <div className="mt-2 flex gap-2">
                <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Tag name"
                  onFocus={(e) => { const el = e.target; setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 350); }}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button onClick={() => {
                  if (newTagName.trim()) {
                    const newTag = { id: uid(), name: newTagName.trim(), catId };
                    onAddTag(newTag);
                    setTagId(newTag.id);
                    setNewTagName(""); setShowNewTag(false);
                  }
                }} className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold">Add</button>
              </div>
            )}
          </div>

          {/* Repeat */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Repeat</label>
            <div className="flex gap-1.5 flex-wrap">
              {[["none", "None"], ["daily", "Daily"], ["weekdays", "Weekdays"], ["weekly", "Weekly"]].map(([val, label]) => (
                <button key={val} onClick={() => setRepeat(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${repeat === val ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {label}
                </button>
              ))}
            </div>
            {repeat !== "none" && <p className="text-[10px] text-amber-600 mt-1.5">Changes affect all occurrences</p>}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Start</label>
              <select value={sH} onChange={(e) => { const v = parseFloat(e.target.value); setSH(v); if (!isEditing) { setEH(Math.min(v + 1, 24)); } else if (eH !== 24 && eH <= v) { setEH(v + snapInterval); } }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                {timeOpts.map((h) => <option key={h} value={h}>{fmt(h)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">End</label>
              <select value={eH} onChange={(e) => setEH(parseFloat(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                {endTimeOpts.map((h) => <option key={h} value={h}>{h === 24 ? "12:00 AM (midnight)" : fmt(h)}</option>)}
              </select>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">Duration: {dur(sH, eH).toFixed(1)}h</p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {block?.id && !isRecurring && (
              <div className="flex gap-1.5">
                <button onClick={() => onDelete(block.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100">
                  <Trash2 size={15} />
                </button>
                <button onClick={() => onDuplicate(block)}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200">
                  <Copy size={14} /> Copy
                </button>
              </div>
            )}
            {isRecurring && (
              <div className="flex gap-1.5">
                <button onClick={() => onDelete(block.id)} title="Skip today only"
                  className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-600 text-xs font-semibold hover:bg-amber-100">
                  Skip today
                </button>
                <button onClick={() => onDeleteRecurring(block.id)} title="Remove recurring rule"
                  className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100">
                  <Trash2 size={13} /> All
                </button>
              </div>
            )}
            <button onClick={() => onSave({ ...block, id: block?.id || uid(), title: title || "Untitled", catId, tagId, tagIds: undefined, color, icon, iconId: undefined, start: sH, end: eH, repeat })}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800">
              <Check size={15} /> {isRecurring ? "Update recurring" : block?.id ? "Update" : "Add Block"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// TEMPLATE MANAGER
// ════════════════════════════════════════════
function TemplatePanel({ templates, blocks, onLoadTemplate, onSaveTemplate, onDeleteTemplate, onClose }) {
  const [newName, setNewName] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 pb-7 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'DM Sans'" }}>
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4 sm:hidden" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Templates</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="space-y-2 mb-4">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <FolderOpen size={16} className="text-gray-400" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                <div className="text-[10px] text-gray-400">{t.blocks.length} blocks</div>
              </div>
              <button onClick={() => onLoadTemplate(t)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">Load</button>
              <button onClick={() => onDeleteTemplate(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
          {templates.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No templates saved yet.</p>}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Save current day as template</label>
          <div className="flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Template name"
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button onClick={() => { if (newName.trim() && blocks.length > 0) { onSaveTemplate(newName.trim()); setNewName(""); } }}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800">
              <Save size={14} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════
// ════════════════════════════════════════════
// ANALYTICS DASHBOARD (5 sections)
// ════════════════════════════════════════════
function AnalyticsView({ allData, categories, tags, currentDate }) {
  const [period, setPeriod] = useState("week");
  const [selCat, setSelCat] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);
  const [lookback, setLookback] = useState(8);
  const [highlightLine, setHighlightLine] = useState(null);
  const [animated, setAnimated] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [expandedInvItem, setExpandedInvItem] = useState(null);
  const [activeTagFilters, setActiveTagFilters] = useState([]);

  // Lazy section visibility
  const sec4Ref = useRef(null);
  const sec5Ref = useRef(null);
  const [sec4Vis, setSec4Vis] = useState(false);
  const [sec5Vis, setSec5Vis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === sec4Ref.current && e.isIntersecting) setSec4Vis(true);
        if (e.target === sec5Ref.current && e.isIntersecting) setSec5Vis(true);
      });
    }, { rootMargin: "300px" });
    if (sec4Ref.current) obs.observe(sec4Ref.current);
    if (sec5Ref.current) obs.observe(sec5Ref.current);
    return () => obs.disconnect();
  }, []);

  // Trigger bar/donut animation on period change
  useEffect(() => {
    setAnimated(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
  }, [period]);

  // ── Period config ──────────────────────────
  const periodLen = period === "day" ? 1 : period === "week" ? 7 : 30;

  const periodDays = useMemo(() =>
    Array.from({ length: periodLen }, (_, i) => {
      const d = new Date(currentDate); d.setDate(d.getDate() - (periodLen - 1 - i)); return dk(d);
    }), [period, currentDate, periodLen]);

  const prevPeriodDays = useMemo(() =>
    Array.from({ length: periodLen }, (_, i) => {
      const d = new Date(currentDate); d.setDate(d.getDate() - (periodLen * 2 - 1 - i)); return dk(d);
    }), [period, currentDate, periodLen]);

  const periodBlocks = useMemo(() =>
    periodDays.flatMap((k) => (allData[k]?.blocks || []).map((b) => ({ ...b, _dk: k }))),
    [allData, periodDays]);

  const prevBlocks = useMemo(() =>
    prevPeriodDays.flatMap((k) => (allData[k]?.blocks || []).map((b) => ({ ...b, _dk: k }))),
    [allData, prevPeriodDays]);

  // ── Category totals ────────────────────────
  const catTotals = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = 0; });
    periodBlocks.forEach((b) => { if (m[b.catId] !== undefined) m[b.catId] += dur(b.start, b.end); });
    return categories.map((c) => ({ cat: c, hours: +(m[c.id] || 0).toFixed(2) }))
      .filter((x) => x.hours > 0).sort((a, b) => b.hours - a.hours);
  }, [periodBlocks, categories]);

  const prevCatMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = 0; });
    prevBlocks.forEach((b) => { if (m[b.catId] !== undefined) m[b.catId] += dur(b.start, b.end); });
    return m;
  }, [prevBlocks, categories]);

  const totalScheduled = catTotals.reduce((s, x) => s + x.hours, 0);
  const totalAvailable = periodLen * 24;
  const topCat = catTotals[0] || null;

  // Must be defined before any useMemo that calls it
  const fmtHM = (h) => {
    const hrs = Math.floor(h), mins = Math.round((h - hrs) * 60);
    return hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`;
  };

  const top5Cats = useMemo(() => catTotals.slice(0, 5), [catTotals]);

  // ── S1: Donut data ─────────────────────────
  const donutSlices = useMemo(() => {
    if (totalScheduled === 0) return [];
    let start = 0;
    return catTotals.map(({ cat, hours }) => {
      const sweep = (hours / totalScheduled) * 360;
      const s = { cat, hours, start, sweep };
      start += sweep;
      return s;
    });
  }, [catTotals, totalScheduled]);

  const donutPath = (startDeg, sweepDeg, oR, iR, cx, cy) => {
    if (sweepDeg >= 360) sweepDeg = 359.9;
    const rad = (d) => (d - 90) * Math.PI / 180;
    const pt = (r, d) => [cx + r * Math.cos(rad(d)), cy + r * Math.sin(rad(d))];
    const e = startDeg + sweepDeg;
    const lg = sweepDeg > 180 ? 1 : 0;
    const [x1, y1] = pt(oR, startDeg), [x2, y2] = pt(oR, e);
    const [x3, y3] = pt(iR, e), [x4, y4] = pt(iR, startDeg);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${oR} ${oR} 0 ${lg} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} A${iR} ${iR} 0 ${lg} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
  };

  // ── S2: Heatmap & average day ──────────────
  const heatmap = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({})));
    periodDays.forEach((dateKey) => {
      const d = new Date(dateKey + "T12:00:00");
      const dow = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      (allData[dateKey]?.blocks || []).forEach((b) => {
        const s = b.start, e = b.end > b.start ? b.end : b.end + 24;
        for (let h = Math.floor(s); h < Math.min(Math.ceil(e), s + 24); h++) {
          const hh = h % 24;
          const ov = Math.min(h + 1, e) - Math.max(h, s);
          if (ov > 0) grid[dow][hh][b.catId] = (grid[dow][hh][b.catId] || 0) + ov;
        }
      });
    });
    return grid.map((row) => row.map((cell) => {
      const entries = Object.entries(cell);
      if (!entries.length) return null;
      const [catId] = entries.sort((a, b) => b[1] - a[1])[0];
      return categories.find((c) => c.id === catId) || null;
    }));
  }, [allData, periodDays, categories]);

  const avgDayPattern = useMemo(() => {
    const compute = (dows) => {
      const acc = Array.from({ length: 24 }, () => ({}));
      periodDays.forEach((dateKey) => {
        const d = new Date(dateKey + "T12:00:00");
        if (!dows.includes(d.getDay())) return;
        (allData[dateKey]?.blocks || []).forEach((b) => {
          const s = b.start, e = b.end > b.start ? b.end : b.end + 24;
          for (let h = Math.floor(s); h < Math.min(Math.ceil(e), s + 24); h++) {
            const hh = h % 24;
            const ov = Math.min(h + 1, e) - Math.max(h, s);
            if (ov > 0) acc[hh][b.catId] = (acc[hh][b.catId] || 0) + ov;
          }
        });
      });
      return acc.map((cell) => {
        const entries = Object.entries(cell);
        if (!entries.length) return null;
        const [catId] = entries.sort((a, b) => b[1] - a[1])[0];
        return categories.find((c) => c.id === catId) || null;
      });
    };
    // Sun(0)–Thu(4) = weekdays; Fri(5)+Sat(6) = weekend
    return { weekday: compute([0, 1, 2, 3, 4]), weekend: compute([5, 6]) };
  }, [allData, periodDays, categories]);

  // ── S4: Contribution calendar & streaks ────
  const contribData = useMemo(() => {
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    const dim = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: dim }, (_, i) => {
      const dt = new Date(year, month, i + 1);
      const key = dk(dt);
      const hours = (allData[key]?.blocks || []).reduce((s, b) => s + dur(b.start, b.end), 0);
      return { d: i + 1, key, hours };
    });
    const startDow = new Date(year, month, 1).getDay(); // 0=Sun-based
    return { days, startDow };
  }, [allData, currentDate]);

  const streaks = useMemo(() => {
    return categories.map((cat) => {
      let current = 0, best = 0, run = 0, hitBreak = false;
      for (let i = 0; i < 90; i++) {
        const d = new Date(currentDate); d.setDate(d.getDate() - i);
        const has = (allData[dk(d)]?.blocks || []).some((b) => b.catId === cat.id);
        if (has) { run++; best = Math.max(best, run); if (!hitBreak) current++; }
        else { if (!hitBreak) hitBreak = true; run = 0; }
      }
      return { cat, current, best };
    }).filter((s) => s.best > 0).sort((a, b) => b.current - a.current || b.best - a.best);
  }, [allData, categories, currentDate]);

  const routineScore = useMemo(() => {
    const w = periodDays.filter((k) => (allData[k]?.blocks || []).length > 0).length;
    return periodLen > 0 ? Math.round((w / periodLen) * 100) : 0;
  }, [allData, periodDays, periodLen]);

  // ── S5: Trend lines & insights ─────────────
  const trendData = useMemo(() =>
    Array.from({ length: lookback }, (_, i) => {
      const wa = lookback - 1 - i;
      const entry = { name: wa === 0 ? "Now" : `-${wa}w` };
      top5Cats.forEach(({ cat }) => {
        let hrs = 0;
        for (let d = 0; d < 7; d++) {
          const dt = new Date(currentDate); dt.setDate(dt.getDate() - (wa * 7 + d));
          (allData[dk(dt)]?.blocks || []).forEach((b) => { if (b.catId === cat.id) hrs += dur(b.start, b.end); });
        }
        entry[cat.id] = +hrs.toFixed(1);
      });
      return entry;
    }), [allData, currentDate, lookback, top5Cats]);

  const insights = useMemo(() => {
    const ins = [];
    catTotals.forEach(({ cat, hours }) => {
      const prev = prevCatMap[cat.id] || 0;
      if (prev === 0 && hours > 0) {
        ins.push({ icon: "✨", cat, msg: `New this period — ${fmtHM(hours)} across ${periodBlocks.filter((b) => b.catId === cat.id).length} blocks` });
      } else if (prev > 0) {
        const pct = ((hours - prev) / prev) * 100;
        const delta = (hours - prev).toFixed(1);
        if (pct > 15) ins.push({ icon: "📈", cat, msg: `Up ${pct.toFixed(0)}% vs last period (+${delta}h)` });
        else if (pct < -15) ins.push({ icon: "📉", cat, msg: `Down ${Math.abs(pct).toFixed(0)}% vs last period (${delta}h)` });
      }
    });
    if (topCat && periodLen >= 7) {
      // Weekdays = Sun–Thu (0–4); Weekends = Fri–Sat (5–6)
      const wdH = periodBlocks.filter((b) => b.catId === topCat.cat.id && [0,1,2,3,4].includes(new Date(b._dk + "T12:00:00").getDay())).reduce((s, b) => s + dur(b.start, b.end), 0);
      const weH = periodBlocks.filter((b) => b.catId === topCat.cat.id && [5,6].includes(new Date(b._dk + "T12:00:00").getDay())).reduce((s, b) => s + dur(b.start, b.end), 0);
      if (wdH > 0 && weH > 0 && Math.abs(wdH / 5 - weH / 2) > 0.5)
        ins.push({ icon: "⚖️", cat: topCat.cat, msg: `Peaks ${weH / 2 > wdH / 5 ? "on weekends" : "on weekdays"} — ${fmtHM(Math.max(wdH, weH))} vs ${fmtHM(Math.min(wdH, weH))}` });
    }
    return ins.slice(0, 5);
  }, [catTotals, prevCatMap, periodBlocks, topCat, periodLen]);

  // ── S3: Per-cat sparkline (past 4 weeks) ───
  const getCatSparkline = useCallback((catId) =>
    Array.from({ length: 4 }, (_, w) => {
      let hrs = 0;
      for (let d = 0; d < 7; d++) {
        const dt = new Date(currentDate); dt.setDate(dt.getDate() - (3 - w) * 7 - d);
        (allData[dk(dt)]?.blocks || []).forEach((b) => { if (b.catId === catId) hrs += dur(b.start, b.end); });
      }
      return +hrs.toFixed(1);
    }), [allData, currentDate]);

  // ── SA: daily hours per category ──────────
  const catDailyHours = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = {}; });
    periodDays.forEach((k) => {
      const label = new Date(k + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
      (allData[k]?.blocks || []).forEach((b) => {
        if (!m[b.catId]) return;
        m[b.catId][label] = (m[b.catId][label] || 0) + dur(b.start, b.end);
      });
    });
    return m;
  }, [allData, periodDays, categories]);

  // ── SB: tag totals current + prev ─────────
  const tagTotals = useMemo(() => {
    const cur = {}, prev = {};
    tags.forEach((t) => { cur[t.id] = 0; prev[t.id] = 0; });
    periodBlocks.forEach((b) => { getTagIds(b).forEach((tid) => { if (cur[tid] !== undefined) cur[tid] += dur(b.start, b.end); }); });
    prevBlocks.forEach((b) => { getTagIds(b).forEach((tid) => { if (prev[tid] !== undefined) prev[tid] += dur(b.start, b.end); }); });
    return { cur, prev };
  }, [periodBlocks, prevBlocks, tags]);

  const tagsWithData = useMemo(() =>
    tags.filter((t) => (tagTotals.cur[t.id] || 0) > 0)
      .sort((a, b) => (tagTotals.cur[b.id] || 0) - (tagTotals.cur[a.id] || 0)),
    [tags, tagTotals]);

  const activeTags = useMemo(() =>
    activeTagFilters.length === 0
      ? tagsWithData
      : tagsWithData.filter((t) => activeTagFilters.includes(t.id)),
    [tagsWithData, activeTagFilters]);

  const tagChartData = useMemo(() => {
    const bars = period === "month"
      ? Array.from({ length: Math.ceil(periodLen / 7) }, (_, w) => ({ name: `W${w + 1}`, _keys: periodDays.slice(w * 7, (w + 1) * 7) }))
      : periodDays.map((k) => ({ name: new Date(k + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }), _keys: [k] }));
    return bars.filter((b) => b._keys.length > 0).map(({ name, _keys }) => {
      const entry = { name };
      activeTags.forEach((t) => {
        entry[t.id] = +_keys.flatMap((k) => allData[k]?.blocks || [])
          .filter((b) => getTagIds(b).includes(t.id))
          .reduce((s, b) => s + dur(b.start, b.end), 0).toFixed(1);
      });
      return entry;
    });
  }, [allData, periodDays, period, periodLen, activeTags]);

  const tagInsights = useMemo(() => {
    const ins = [];
    activeTags.forEach((t) => {
      const cur = tagTotals.cur[t.id] || 0;
      const prev = tagTotals.prev[t.id] || 0;
      if (cur === 0) return;
      const cat = categories.find((c) => c.id === t.catId);
      if (prev === 0) {
        ins.push({ type: "new", tag: t, cat, cur, pct: 999, msg: `New this period — ${fmtHM(cur)}` });
      } else {
        const pct = ((cur - prev) / prev) * 100;
        if (pct > 15) ins.push({ type: "up", tag: t, cat, cur, prev, pct, msg: `Up ${pct.toFixed(0)}% vs last period (+${fmtHM(cur - prev)})` });
        else if (pct < -15) ins.push({ type: "down", tag: t, cat, cur, prev, pct, msg: `Down ${Math.abs(pct).toFixed(0)}% vs last period (−${fmtHM(prev - cur)})` });
      }
    });
    return ins.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 3);
  }, [activeTags, tagTotals, categories, fmtHM]);

  // ── Render constants ───────────────────────
  const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const HR_LBL = ["12","1","2","3","4","5","6","7","8","9","10","11","12","1","2","3","4","5","6","7","8","9","10","11"];

  // ── Render ─────────────────────────────────
  return (
    <div className="space-y-4 pb-28" style={{ fontFamily: "'DM Sans'" }}>

      {/* ── Sticky period selector + summary strip ── */}
      <div className="sticky top-0 z-20 bg-gray-50 pt-1 pb-2">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
          {[["day","Day"],["week","Week"],["month","Month"]].map(([v, l]) => (
            <button key={v} onClick={() => { setPeriod(v); setExpandedCat(null); setSelCat(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${period === v ? "bg-gray-900 text-white shadow" : "text-gray-400 hover:text-gray-600"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 text-center">
            <div className="text-sm font-bold text-gray-900">{fmtHM(totalScheduled)}</div>
            <div className="text-[10px] text-gray-400 font-medium">Scheduled</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 text-center">
            <div className="text-sm font-bold text-gray-900">{fmtHM(Math.max(0, totalAvailable - totalScheduled))}</div>
            <div className="text-[10px] text-gray-400 font-medium">Free</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 text-center overflow-hidden">
            {topCat ? (() => {
              const I = getIcon(topCat.cat.icon || "CircleDot");
              return (<>
                <div className="flex items-center justify-center gap-1">
                  <I size={12} style={{ color: topCat.cat.color }} />
                  <div className="text-[11px] font-bold text-gray-900 truncate">{topCat.cat.name}</div>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">Most Time</div>
              </>);
            })() : <div className="text-[10px] text-gray-400 mt-1">No data</div>}
          </div>
        </div>
      </div>

      {/* ═══ SA: 168H TIME INVENTORY ═══ */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {totalAvailable}h {period === "day" ? "Today" : period === "week" ? "This Week" : "This Month"}
          </h3>
          <span className="text-[10px] text-gray-400 font-medium">{totalAvailable > 0 ? ((totalScheduled / totalAvailable) * 100).toFixed(0) : 0}% scheduled</span>
        </div>

        {/* Full-width stacked bar */}
        <div className="h-5 rounded-lg overflow-hidden flex bg-gray-100 mb-1.5">
          {catTotals.map(({ cat, hours }) => (
            <div key={cat.id} title={cat.name}
              style={{ width: animated ? `${(hours / totalAvailable) * 100}%` : "0%", backgroundColor: cat.color, transition: "width 0.4s ease-out" }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mb-4">
          <span>Scheduled: <b className="text-gray-700">{fmtHM(totalScheduled)}</b></span>
          <span>Free: <b className="text-gray-700">{fmtHM(Math.max(0, totalAvailable - totalScheduled))}</b></span>
        </div>

        {catTotals.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">No blocks scheduled for this period yet</div>
        ) : (<>
          {/* Donut + top categories side by side */}
          <div className="flex gap-3 items-center mb-4">
            <div className="relative flex-shrink-0">
              <svg width="90" height="90" viewBox="0 0 200 200">
                <g style={{ opacity: animated ? 1 : 0, transition: "opacity 0.3s ease-out" }}>
                  {donutSlices.map(({ cat, hours, start, sweep }) => (
                    <path key={cat.id} d={donutPath(start, sweep, 80, 52, 100, 100)}
                      fill={cat.color} opacity={0.88}
                      onMouseEnter={() => setHoveredSlice(cat.id)}
                      onMouseLeave={() => setHoveredSlice(null)} />
                  ))}
                  {totalScheduled < totalAvailable && (() => {
                    const sd = (totalScheduled / totalAvailable) * 360;
                    if (sd >= 360) return null;
                    return <path d={donutPath(sd, 360 - sd, 80, 52, 100, 100)} fill="#F1F5F9" />;
                  })()}
                </g>
                <text x="100" y="96" textAnchor="middle" fontSize="30" fontWeight="800" fill="#1E293B" fontFamily="DM Sans">
                  {totalAvailable > 0 ? Math.round((totalScheduled / totalAvailable) * 100) : 0}%
                </text>
                <text x="100" y="120" textAnchor="middle" fontSize="14" fill="#94A3B8" fontFamily="DM Sans">used</text>
              </svg>
              {hoveredSlice && (() => {
                const s = donutSlices.find((x) => x.cat.id === hoveredSlice);
                if (!s) return null;
                const I = getIcon(s.cat.icon || "CircleDot");
                return (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap flex items-center gap-1 pointer-events-none z-10">
                    <I size={9} style={{ color: s.cat.color }} />{s.cat.name}
                  </div>
                );
              })()}
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              {catTotals.slice(0, 4).map(({ cat, hours }) => {
                const I = getIcon(cat.icon || "CircleDot");
                return (
                  <div key={cat.id} className="flex items-center gap-1.5 min-w-0">
                    <I size={11} style={{ color: cat.color }} />
                    <span className="text-[11px] text-gray-600 flex-1 truncate">{cat.name}</span>
                    <span className="text-[11px] font-bold text-gray-800 tabular-nums flex-shrink-0">{fmtHM(hours)}</span>
                    <span className="text-[9px] text-gray-400 tabular-nums w-8 text-right flex-shrink-0">{totalAvailable > 0 ? ((hours / totalAvailable) * 100).toFixed(1) : 0}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full breakdown list */}
          <div className="space-y-0.5 border-t border-gray-50 pt-3">
            {catTotals.map(({ cat, hours }) => {
              const pct = totalAvailable > 0 ? (hours / totalAvailable) * 100 : 0;
              const isExp = expandedInvItem === cat.id;
              const I = getIcon(cat.icon || "CircleDot");
              const dayHours = catDailyHours[cat.id] || {};
              const blockCount = periodBlocks.filter((b) => b.catId === cat.id).length;
              const daysActive = Object.keys(dayHours).length;
              return (
                <div key={cat.id}>
                  <button className="w-full flex items-center gap-2 py-1.5"
                    onClick={() => setExpandedInvItem((p) => p === cat.id ? null : cat.id)}>
                    <div className="flex items-center gap-1.5 w-[88px] flex-shrink-0">
                      <I size={12} style={{ color: cat.color }} />
                      <span className="text-[11px] font-semibold text-gray-700 truncate">{cat.name}</span>
                    </div>
                    <div className="flex-1 h-3.5 bg-gray-100 rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm transition-all duration-500"
                        style={{ width: animated ? `${pct}%` : "0%", backgroundColor: cat.color }} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 w-14 text-right tabular-nums flex-shrink-0">{fmtHM(hours)}</span>
                    <span className="text-[9px] text-gray-400 w-9 text-right tabular-nums flex-shrink-0">{pct.toFixed(1)}%</span>
                    <ChevronDown size={10} className={`text-gray-300 flex-shrink-0 transition-transform ${isExp ? "rotate-180" : ""}`} />
                  </button>
                  {isExp && (
                    <div className="ml-[88px] mb-2 bg-gray-50 rounded-xl p-2.5 text-xs space-y-1.5">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.entries(dayHours).map(([day, h]) => (
                          <span key={day} className="text-gray-600"><span className="text-gray-400">{day} </span>{h.toFixed(1)}h</span>
                        ))}
                      </div>
                      <div className="flex gap-3 text-gray-500">
                        <span>Avg <b className="text-gray-700">{fmtHM(daysActive > 0 ? hours / daysActive : 0)}/day</b></span>
                        <span>Blocks <b className="text-gray-700">{blockCount}</b></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {/* Unscheduled row */}
            <div className="flex items-center gap-2 py-1.5 opacity-40">
              <div className="flex items-center gap-1.5 w-[88px] flex-shrink-0">
                <div className="w-3 h-3 rounded-sm bg-gray-300 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-gray-500">Free</span>
              </div>
              <div className="flex-1 h-3.5 bg-gray-100 rounded-sm overflow-hidden">
                <div className="h-full rounded-sm bg-gray-300 transition-all duration-500"
                  style={{ width: animated ? `${Math.max(0, (1 - totalScheduled / totalAvailable)) * 100}%` : "0%" }} />
              </div>
              <span className="text-[11px] font-bold text-gray-500 w-14 text-right tabular-nums flex-shrink-0">{fmtHM(Math.max(0, totalAvailable - totalScheduled))}</span>
              <span className="text-[9px] text-gray-400 w-9 text-right tabular-nums flex-shrink-0">{totalAvailable > 0 ? Math.max(0, (1 - totalScheduled / totalAvailable) * 100).toFixed(1) : 0}%</span>
              <div className="w-[10px] flex-shrink-0" />
            </div>
          </div>
        </>)}
      </div>

      {/* ═══ SB: FILTERABLE TAG BREAKDOWN ═══ */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">What's Consuming My Time?</h3>
        {tagsWithData.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">No tagged blocks this period</div>
        ) : (<>
          {/* Tag filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 mb-3" style={{ scrollbarWidth: "none" }}>
            <button onClick={() => setActiveTagFilters([])}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${activeTagFilters.length === 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
              All
            </button>
            {tagsWithData.map((t) => {
              const cat = categories.find((c) => c.id === t.catId);
              const I = getIcon(cat?.icon || "CircleDot");
              const isActive = activeTagFilters.includes(t.id);
              return (
                <button key={t.id}
                  onClick={() => setActiveTagFilters((prev) => {
                    if (prev.length === 0) return [t.id];
                    if (prev.includes(t.id)) { const n = prev.filter((x) => x !== t.id); return n.length === 0 ? [] : n; }
                    return [...prev, t.id];
                  })}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all border"
                  style={isActive || activeTagFilters.length === 0
                    ? { backgroundColor: cat?.color || "#94A3B8", borderColor: cat?.color || "#94A3B8", color: "white" }
                    : { backgroundColor: "white", borderColor: "#E2E8F0", color: "#94A3B8" }}>
                  <I size={10} style={{ color: isActive || activeTagFilters.length === 0 ? "white" : cat?.color || "#94A3B8" }} />
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Stacked bar chart */}
          {activeTags.length > 0 && (
            <div className="mb-3">
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={tagChartData} barGap={0} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#CBD5E1" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }}
                    formatter={(v, tid) => [fmtHM(v), tags.find((t) => t.id === tid)?.name || tid]} />
                  {activeTags.map((t, i) => {
                    const cat = categories.find((c) => c.id === t.catId);
                    return (
                      <Bar key={t.id} dataKey={t.id} stackId="a" fill={cat?.color || "#94A3B8"}
                        opacity={0.85} radius={i === activeTags.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Ranked tag list */}
          <div className="space-y-1.5 mb-3">
            {activeTags.map((t) => {
              const cur = tagTotals.cur[t.id] || 0;
              const prev = tagTotals.prev[t.id] || 0;
              const cat = categories.find((c) => c.id === t.catId);
              const I = getIcon(cat?.icon || "CircleDot");
              const maxH = Math.max(...activeTags.map((x) => tagTotals.cur[x.id] || 0), 0.01);
              const deltaPct = prev > 0 ? ((cur - prev) / prev) * 100 : null;
              const arrow = deltaPct === null ? null : deltaPct > 5 ? "↑" : deltaPct < -5 ? "↓" : "→";
              const arrowColor = deltaPct === null ? "" : deltaPct > 5 ? "text-emerald-500" : deltaPct < -5 ? "text-red-400" : "text-gray-400";
              return (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 w-[88px] flex-shrink-0">
                    <I size={12} style={{ color: cat?.color || "#94A3B8" }} />
                    <span className="text-[11px] font-semibold text-gray-700 truncate">{t.name}</span>
                  </div>
                  <div className="flex-1 h-3.5 bg-gray-100 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm transition-all duration-500"
                      style={{ width: animated ? `${(cur / maxH) * 100}%` : "0%", backgroundColor: cat?.color || "#94A3B8" }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 w-14 text-right tabular-nums flex-shrink-0">{fmtHM(cur)}</span>
                  {arrow && <span className={`text-[11px] font-bold w-3 flex-shrink-0 ${arrowColor}`}>{arrow}</span>}
                </div>
              );
            })}
          </div>

          {/* Tag insights */}
          {tagInsights.length > 0 && (
            <div className="space-y-1.5 pt-3 border-t border-gray-50">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Insights</div>
              {tagInsights.map((ins, i) => {
                const I = getIcon(ins.cat?.icon || "CircleDot");
                const icon = ins.type === "up" ? "📈" : ins.type === "down" ? "📉" : "✨";
                return (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-xl p-2.5">
                    <span className="text-sm leading-none mt-0.5 flex-shrink-0">{icon}</span>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <I size={11} style={{ color: ins.cat?.color || "#94A3B8" }} />
                        <span className="text-[11px] font-bold text-gray-800">{ins.tag.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-500">{ins.msg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>)}
      </div>

      {/* ═══ S2: DAILY RHYTHM PATTERN ═══ */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">When Am I Doing What?</h3>

        {/* Heatmap */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div style={{ minWidth: 260 }}>
            <div className="flex pl-8 mb-0.5">
              {HR_LBL.map((h, i) => (
                <div key={i} style={{ flex: "1 0 0", fontSize: "7px", color: "#CCC", textAlign: "center" }}>{h}</div>
              ))}
            </div>
            {DOW.map((day, dow) => (
              <div key={dow} className="flex items-center gap-0.5 mb-px">
                <div className="w-7 text-[9px] font-semibold text-gray-400 flex-shrink-0">{day}</div>
                <div className="flex flex-1 gap-px">
                  {heatmap[dow].map((cat, h) => (
                    <div key={h} style={{ flex: "1 0 0", height: 14, borderRadius: 2, backgroundColor: cat ? cat.color : "#F1F5F9", opacity: cat ? (selCat === null || selCat === cat.id ? 0.85 : 0.15) : 1, transition: "opacity 0.15s" }}
                      title={cat ? `${day} ${HR_LBL[h]} — ${cat.name}` : `${day} ${HR_LBL[h]}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Day bars */}
        <div className="mt-4 space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Average Day</div>
          {[["Weekdays", avgDayPattern.weekday], ["Weekends", avgDayPattern.weekend]].map(([label, pat]) => {
            const hasData = pat.some(Boolean);
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="w-14 text-[10px] text-gray-500 font-semibold flex-shrink-0">{label}</div>
                {hasData ? (
                  <div className="flex flex-1 gap-px h-5 rounded overflow-hidden">
                    {pat.map((cat, h) => (
                      <div key={h} style={{ flex: "1 0 0", backgroundColor: cat ? cat.color : "#F1F5F9", opacity: cat ? 0.8 : 1 }}
                        title={cat ? `${HR_LBL[h]} — ${cat.name}` : HR_LBL[h]} />
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 h-5 rounded bg-gray-50 flex items-center pl-2">
                    <span className="text-[9px] text-gray-300">No data</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-gray-50">
          {catTotals.map(({ cat }) => {
            const I = getIcon(cat.icon || "CircleDot");
            return (
              <div key={cat.id} className="flex items-center gap-1">
                <I size={10} style={{ color: cat.color }} />
                <span className="text-[9px] text-gray-400 font-medium">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ S3: CATEGORY DEEP DIVE ═══ */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">How Much Per Category?</h3>
        {catTotals.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">No category data for this period</div>
        ) : (
          <div className="space-y-1.5">
            {catTotals.map(({ cat, hours }) => {
              const maxH = catTotals[0].hours;
              const isExp = expandedCat === cat.id;
              const I = getIcon(cat.icon || "CircleDot");
              const blocks = periodBlocks.filter((b) => b.catId === cat.id);
              const avgBlockMin = blocks.length > 0 ? Math.round((hours / blocks.length) * 60) : 0;
              const prevH = prevCatMap[cat.id] || 0;
              const changePct = prevH > 0 ? ((hours - prevH) / prevH) * 100 : null;
              const dayCounts = {};
              if (isExp) blocks.forEach((b) => { const d = new Date(b._dk + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }); dayCounts[d] = (dayCounts[d] || 0) + dur(b.start, b.end); });
              const mostActive = isExp ? Object.entries(dayCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d).join(", ") : "";
              const sparkline = isExp ? getCatSparkline(cat.id) : null;
              const sparkMax = sparkline ? Math.max(...sparkline, 0.1) : 1;

              return (
                <div key={cat.id}>
                  <button className="w-full flex items-center gap-2 py-1.5"
                    onClick={() => setExpandedCat((p) => p === cat.id ? null : cat.id)}>
                    <div className="flex items-center gap-1.5 w-[90px] flex-shrink-0">
                      <I size={13} style={{ color: cat.color }} />
                      <span className="text-xs font-semibold text-gray-700 truncate">{cat.name}</span>
                    </div>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: animated ? `${(hours / maxH) * 100}%` : "0%", backgroundColor: cat.color }} />
                    </div>
                    <div className="w-14 text-right text-[11px] font-bold text-gray-600 flex-shrink-0">{fmtHM(hours)}</div>
                    <ChevronDown size={12} className={`text-gray-300 flex-shrink-0 transition-transform ${isExp ? "rotate-180" : ""}`} />
                  </button>
                  {isExp && (
                    <div className="ml-[90px] mt-1 mb-2 bg-gray-50 rounded-xl p-3 text-xs space-y-2">
                      <div className="flex gap-4 flex-wrap text-gray-600">
                        <span><span className="text-gray-400">Blocks </span><b className="text-gray-800">{blocks.length}</b></span>
                        <span><span className="text-gray-400">Avg block </span><b className="text-gray-800">{avgBlockMin}m</b></span>
                        {mostActive && <span><span className="text-gray-400">Most active </span><b className="text-gray-800">{mostActive}</b></span>}
                      </div>
                      {changePct !== null && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">vs last period:</span>
                          <span className={`font-bold ${changePct > 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {changePct > 0 ? "+" : ""}{changePct.toFixed(0)}% ({changePct > 0 ? "+" : ""}{(hours - prevH).toFixed(1)}h)
                          </span>
                        </div>
                      )}
                      {sparkline && (
                        <div>
                          <div className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">4-Week Trend</div>
                          <div className="flex items-end gap-1 h-12">
                            {sparkline.map((v, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                                <div className="w-full rounded-sm" style={{ height: `${(v / sparkMax) * 36}px`, minHeight: v > 0 ? 2 : 0, backgroundColor: cat.color, opacity: 0.5 + i * 0.15 }} />
                                <div className="text-[8px] text-gray-300">{i === 3 ? "Now" : `-${3 - i}w`}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ S4: CONSISTENCY & STREAKS ═══ */}
      <div ref={sec4Ref} className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Am I Sticking to It?</h3>
        {!sec4Vis ? <div className="h-56 bg-gray-50 rounded-xl" /> : (<>
          {/* Contribution calendar */}
          {(() => {
            const { days, startDow } = contribData;
            const maxH = Math.max(...days.map((d) => d.hours), 1);
            const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
            return (
              <div className="mb-4">
                <div className="text-[10px] font-bold text-gray-400 mb-2">{monthName}</div>
                <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {DOW.map((d) => <div key={d} className="text-[8px] text-center text-gray-300 font-semibold">{d[0]}</div>)}
                  {Array.from({ length: startDow }, (_, i) => <div key={`e${i}`} />)}
                  {days.map(({ d: day, key, hours }) => {
                    const intensity = hours > 0 ? Math.max(0.18, hours / maxH) : 0;
                    const isToday = key === dk(new Date());
                    const blockCount = (allData[key]?.blocks || []).length;
                    return (
                      <div key={key} className="aspect-square rounded flex items-center justify-center"
                        style={{ backgroundColor: hours > 0 ? `rgba(16,185,129,${intensity})` : "#F8FAFC", outline: isToday ? "2px solid #10B981" : undefined, outlineOffset: isToday ? "1px" : undefined }}
                        title={`${key} — ${fmtHM(hours)} (${blockCount} block${blockCount !== 1 ? "s" : ""})`}>
                        <span className="text-[8px] text-gray-500 font-medium leading-none">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Streaks */}
          {streaks.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Streaks</div>
              <div className="space-y-2">
                {streaks.map(({ cat, current, best }) => {
                  const I = getIcon(cat.icon || "CircleDot");
                  return (
                    <div key={cat.id} className="flex items-center gap-2">
                      <I size={13} style={{ color: cat.color }} />
                      <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{cat.name}</span>
                      <div className="flex items-center gap-1 text-right flex-shrink-0">
                        <span className="text-xs font-bold text-gray-900">{current}d</span>
                        {current > 3 && <span className="text-sm leading-none">🔥</span>}
                        <span className="text-[10px] text-gray-400">· best {best}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Routine score */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
            <svg width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#F1F5F9" strokeWidth="8" />
              <circle cx="32" cy="32" r="26" fill="none"
                stroke={routineScore >= 75 ? "#10B981" : routineScore >= 50 ? "#F59E0B" : "#EF4444"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(routineScore / 100) * 163.4} 163.4`}
                transform="rotate(-90 32 32)"
                style={{ transition: "stroke-dasharray 0.5s ease-out" }} />
              <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E293B" fontFamily="DM Sans">{routineScore}%</text>
            </svg>
            <div>
              <div className="text-sm font-bold text-gray-900">Routine Consistency</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{periodDays.filter((k) => (allData[k]?.blocks || []).length > 0).length} of {periodLen} days with blocks</div>
            </div>
          </div>
        </>)}
      </div>

      {/* ═══ S5: TRENDS OVER TIME ═══ */}
      <div ref={sec5Ref} className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">How Am I Changing?</h3>
          <div className="flex gap-1">
            {[[4,"4w"],[8,"8w"],[12,"12w"]].map(([v, l]) => (
              <button key={v} onClick={() => setLookback(v)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${lookback === v ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {!sec5Vis ? <div className="h-56 bg-gray-50 rounded-xl" /> : top5Cats.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No trend data available yet</div>
        ) : (<>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#CBD5E1" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }}
                formatter={(v, name) => [fmtHM(v), top5Cats.find((x) => x.cat.id === name)?.cat?.name || name]} />
              {top5Cats.map(({ cat }) => (
                <Line key={cat.id} type="monotone" dataKey={cat.id}
                  stroke={cat.color}
                  strokeWidth={highlightLine === null || highlightLine === cat.id ? 2.5 : 1}
                  opacity={highlightLine === null || highlightLine === cat.id ? 1 : 0.2}
                  dot={false} activeDot={{ r: 4, stroke: cat.color, fill: "white", strokeWidth: 2 }}
                  onClick={() => setHighlightLine((p) => p === cat.id ? null : cat.id)}
                  style={{ cursor: "pointer" }} />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Line legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 mb-4">
            {top5Cats.map(({ cat }) => {
              const I = getIcon(cat.icon || "CircleDot");
              return (
                <button key={cat.id} onClick={() => setHighlightLine((p) => p === cat.id ? null : cat.id)}
                  className={`flex items-center gap-1 transition-opacity ${highlightLine && highlightLine !== cat.id ? "opacity-25" : ""}`}>
                  <I size={11} style={{ color: cat.color }} />
                  <span className="text-[10px] text-gray-500 font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Insights</div>
              {insights.map((ins, i) => {
                const I = getIcon(ins.cat?.icon || "CircleDot");
                return (
                  <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                    <span className="text-base leading-none mt-0.5 flex-shrink-0">{ins.icon}</span>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <I size={12} style={{ color: ins.cat?.color || "#94A3B8" }} />
                        <span className="text-xs font-bold text-gray-800">{ins.cat?.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 leading-relaxed">{ins.msg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>)}
      </div>

    </div>
  );
}

// ────────────────────────────────────────────
// PLACEHOLDER for removed old weekData – keeps line numbers stable
// ────────────────────────────────────────────
// ════════════════════════════════════════════
// GOOGLE CALENDAR SYNC ENGINE
// ════════════════════════════════════════════
const syncCreating = new Set(); // dedup guard: block IDs currently mid-create

async function syncDiff(prevBlocks, currBlocks, date, token, calId, onBlockCreated) {
  if (!prevBlocks || !currBlocks) return;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const toISO = (hour) => { const d = new Date(date); d.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0); return d.toISOString(); };
  const toEvent = (b) => JSON.stringify({ summary: getDisplayName(b), start: { dateTime: toISO(b.start), timeZone: tz }, end: { dateTime: toISO(b.end > b.start ? b.end : b.end + 24), timeZone: tz }, description: `DayRhythm|${b.catId}|${getTagIds(b).join(",")}|${b.color}` });
  const checkRes = async (res, allow404 = false) => {
    if (!res) return;
    if (res.status === 401 || res.status === 403) throw new Error("auth");
    if (!res.ok && !(allow404 && res.status === 404)) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message || `HTTP ${res.status}`);
    }
  };
  const prevMap = new Map(prevBlocks.map((b) => [b.id, b]));
  const currMap = new Map(currBlocks.map((b) => [b.id, b]));
  for (const b of prevBlocks.filter((b) => !currMap.has(b.id) && b.gcalEventId)) {
    const res = await fetch(`${base}/${b.gcalEventId}`, { method: "DELETE", headers }).catch(() => null);
    await checkRes(res, true);
  }
  for (const b of currBlocks) {
    if (!b.gcalEventId) {
      if (syncCreating.has(b.id)) continue;
      syncCreating.add(b.id);
      try {
        const res = await fetch(base, { method: "POST", headers, body: toEvent(b) }).catch(() => null);
        await checkRes(res);
        if (res?.ok) { const ev = await res.json(); onBlockCreated(b.id, ev.id); }
      } finally {
        syncCreating.delete(b.id);
      }
    } else if (prevMap.has(b.id)) {
      const p = prevMap.get(b.id);
      if (b.title !== p.title || b.icon !== p.icon || b.start !== p.start || b.end !== p.end || b.catId !== p.catId || b.color !== p.color) {
        const res = await fetch(`${base}/${b.gcalEventId}`, { method: "PUT", headers, body: toEvent(b) }).catch(() => null);
        await checkRes(res, true);
      }
    }
  }
}

// ════════════════════════════════════════════
// GOOGLE CALENDAR PULL SYNC
// ════════════════════════════════════════════
async function pullSync(date, token, calId, currentBlocks) {
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end = new Date(date); end.setDate(end.getDate() + 1); end.setHours(12, 0, 0, 0);
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`
    + `?timeMin=${encodeURIComponent(start.toISOString())}`
    + `&timeMax=${encodeURIComponent(end.toISOString())}`
    + `&singleEvents=true`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
  if (!res) return null;
  if (res.status === 401 || res.status === 403) throw new Error("auth");
  if (!res.ok) return null;
  const data = await res.json();
  const gcalMap = new Map((data.items || []).filter((ev) => ev.start?.dateTime).map((ev) => [ev.id, ev]));
  // 1. Blocks deleted from Google Calendar
  const deletedIds = currentBlocks.filter((b) => b.gcalEventId && !gcalMap.has(b.gcalEventId)).map((b) => b.id);
  // 2. Blocks modified in Google Calendar
  const updatedBlocks = [];
  for (const block of currentBlocks) {
    if (!block.gcalEventId) continue;
    const ev = gcalMap.get(block.gcalEventId);
    if (!ev || !(ev.description || "").startsWith("DayRhythm|")) continue;
    const s = new Date(ev.start.dateTime), e = new Date(ev.end.dateTime);
    const newStart = snap30(s.getHours() + s.getMinutes() / 60);
    const newEnd = snap30(e.getHours() + e.getMinutes() / 60);
    const { icon: newIcon, name: newName } = parseDisplayName(ev.summary || block.title);
    if (newStart !== block.start || newEnd !== block.end || newName !== block.title || newIcon !== (block.icon || null)) {
      updatedBlocks.push({ ...block, start: newStart, end: newEnd, title: newName, icon: newIcon || undefined });
    }
  }
  // 3. New events in Google Calendar with no matching local block
  const trackedIds = new Set(currentBlocks.filter((b) => b.gcalEventId).map((b) => b.gcalEventId));
  const newBlocks = [];
  const requestedDateKey = dk(date);
  for (const [evId, ev] of gcalMap) {
    if (trackedIds.has(evId)) continue;
    const s = new Date(ev.start.dateTime), e = new Date(ev.end.dateTime);
    // Guard: only import new events whose local start date matches the requested date.
    // pullSync queries today-midnight→tomorrow-noon, so without this check, events
    // created on "tomorrow" (local time) get imported into today's block list.
    if (dk(s) !== requestedDateKey) continue;
    const newStart = snap30(s.getHours() + s.getMinutes() / 60);
    const newEnd = snap30(e.getHours() + e.getMinutes() / 60);
    const parts = (ev.description || "").split("|");
    const isDR = parts[0] === "DayRhythm";
    const rawTags = isDR ? parts[2] : "";
    const { icon: parsedIcon, name: parsedName } = parseDisplayName(ev.summary || "Untitled");
    newBlocks.push({
      id: uid(),
      title: parsedName,
      icon: parsedIcon || undefined,
      start: newStart,
      end: newEnd || newStart + 0.5,
      catId: isDR ? parts[1] : "personal",
      tagIds: rawTags ? rawTags.split(",").filter(Boolean) : [],
      color: isDR ? parts[3] : "#2563EB",
      gcalEventId: evId,
    });
  }
  return { deletedIds, updatedBlocks, newBlocks };
}

// ════════════════════════════════════════════
// GOOGLE ACCOUNT PANEL
// ════════════════════════════════════════════
function GoogleAccountPanel({ googleAuth, calendars, calId, onCalIdChange, onSignIn, onSignOut, syncStatus, onSyncNow, onBackupNow, onRestoreFromBackup, authError, onClearAuthError }) {
  const [, setTick] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState("");
  // Collapsible sub-section state — Account + Sync open by default
  const [openAccount, setOpenAccount] = useState(true);
  const [openSync, setOpenSync] = useState(true);
  const [openBackup, setOpenBackup] = useState(false);

  // Refresh relative timestamps every 30 s while panel is visible
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (!googleAuth?.connected) {
    return (
      <SettingsSection title="Sync & Calendar" open={openSync} onToggle={() => setOpenSync((o) => !o)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><RefreshCw size={16} className="text-blue-500" /></div>
          <h4 className="text-base font-bold text-gray-900">Google Account</h4>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">Sign in to sync your schedule with Google Calendar and back up your data to Google Drive.</p>
        {authError && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50">
            <span className="text-xs text-red-600 flex-1 leading-relaxed">{authError}</span>
            <button onClick={onClearAuthError} className="text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5"><X size={12} /></button>
          </div>
        )}
        <button onClick={onSignIn}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors">
          Sign in with Google
        </button>
      </SettingsSection>
    );
  }

  const { user } = googleAuth;
  const lastBackup = localStorage.getItem("last_backup");
  const lastSync = localStorage.getItem("last_calendar_sync");

  return (
    <>
      {/* ── ACCOUNT ── */}
      <SettingsSection title="Account" open={openAccount} onToggle={() => setOpenAccount((o) => !o)}>
        <div className="flex items-center gap-3">
          {user.avatar
            ? <img src={user.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0" referrerPolicy="no-referrer" />
            : <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">{(user.name || "G")[0].toUpperCase()}</div>}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Last backup: {timeAgo(lastBackup)}</div>
          </div>
        </div>
        <button onClick={onSignOut}
          className="w-full py-2 rounded-xl text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 hover:border-red-100 transition-colors">
          Sign out
        </button>
      </SettingsSection>

      {/* ── SYNC & CALENDAR ── */}
      <SettingsSection title="Sync & Calendar" open={openSync} onToggle={() => setOpenSync((o) => !o)}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Google Calendar</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected ✓</span>
          </div>
          {calendars.length > 0 && (
            <select value={calId} onChange={(e) => onCalIdChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              {calendars.map((c) => <option key={c.id} value={c.id}>{c.summary}{c.primary ? " (primary)" : ""}</option>)}
            </select>
          )}
          <div className="text-xs text-gray-400">
            Last sync: {syncStatus === "Syncing…" ? "syncing…" : timeAgo(lastSync)}
          </div>
          <button onClick={async () => { setSyncing(true); await onSyncNow(); setSyncing(false); }} disabled={syncing}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync Now"}
          </button>
        </div>
      </SettingsSection>

      {/* ── CLOUD BACKUP ── */}
      <SettingsSection title="Cloud Backup" open={openBackup} onToggle={() => setOpenBackup((o) => !o)}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Google Drive</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">On ✓</span>
          </div>
          <div className="text-xs text-gray-400">
            Last backup: {backingUp ? "backing up…" : timeAgo(lastBackup)}
          </div>
          <div className="flex gap-2">
            <button onClick={async () => { setBackingUp(true); await onBackupNow(); setBackingUp(false); }} disabled={backingUp}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-40 transition-colors">
              <Download size={12} className={backingUp ? "animate-bounce" : ""} />
              {backingUp ? "Backing up…" : "Backup Now"}
            </button>
            <button onClick={() => setShowRestoreConfirm(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors">
              <Upload size={12} /> Restore
            </button>
          </div>
          {restoreMsg && (
            <p className={`text-xs text-center ${restoreMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>{restoreMsg}</p>
          )}
        </div>
      </SettingsSection>

      {/* Restore confirm dialog */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !restoring && setShowRestoreConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'DM Sans'" }}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <Upload size={22} className="text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Restore from Backup?</h3>
              <p className="text-sm text-gray-500">This will replace all local data with your cloud backup. This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRestoreConfirm(false)} disabled={restoring}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 disabled:opacity-40">
                Cancel
              </button>
              <button disabled={restoring} onClick={async () => {
                setRestoring(true);
                const result = await onRestoreFromBackup();
                setRestoring(false);
                setShowRestoreConfirm(false);
                if (!result?.success) {
                  setRestoreMsg(result?.error || "Restore failed");
                  setTimeout(() => setRestoreMsg(""), 4000);
                }
              }} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40">
                {restoring ? "Restoring…" : "Yes, Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════
// CUSTOM CATEGORY ICONS  (parallels custom tag icons)
// ════════════════════════════════════════════
const getCustomCategoryIcons = () => {
  try { return JSON.parse(localStorage.getItem('custom_category_icons') || '{}'); } catch { return {}; }
};
const setCustomCategoryIcon = (catId, iconName) => {
  const cur = getCustomCategoryIcons();
  if (iconName) cur[catId] = iconName; else delete cur[catId];
  localStorage.setItem('custom_category_icons', JSON.stringify(cur));
};
function getIconForCategory(catId, categories) {
  const custom = getCustomCategoryIcons();
  if (custom[catId]) return custom[catId];
  const cat = categories.find((c) => c.id === catId);
  return cat?.icon || 'CircleDot';
}

// ════════════════════════════════════════════
// COLLAPSIBLE SETTINGS SECTION WRAPPER
// ════════════════════════════════════════════
function SettingsSection({ title, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ fontFamily: "'DM Sans'" }}>
      <button
        className="w-full flex items-center justify-between px-5 py-3.5"
        style={{ WebkitTapHighlightColor: "transparent", userSelect: "none" }}
        onClick={onToggle}>
        <span className="text-[15px] font-semibold text-gray-900">{title}</span>
        <ChevronDown size={18} className="text-gray-400 flex-shrink-0"
          style={{ transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  );
}

// ════════════════════════════════════════════
// TAG ICONS SECTION (Settings)
// ════════════════════════════════════════════
function TagIconsSection({ tags, categories }) {
  const [customIcons, setCustomIcons] = useState(getCustomTagIcons);
  const [editingTag, setEditingTag] = useState(null); // tag name currently being edited

  const handleIconChange = (tagName, iconName) => {
    setCustomTagIcon(tagName, iconName);
    setCustomIcons(getCustomTagIcons());
    setEditingTag(null);
  };

  const handleReset = (tagName) => {
    setCustomTagIcon(tagName, null);
    setCustomIcons(getCustomTagIcons());
  };

  const handleResetAll = () => {
    localStorage.removeItem('custom_tag_icons');
    setCustomIcons({});
  };

  return (
    <div className="space-y-3">
      {Object.keys(customIcons).length > 0 && (
        <div className="flex justify-end">
          <button onClick={handleResetAll} className="text-[10px] text-red-400 hover:text-red-600 font-semibold">Reset all</button>
        </div>
      )}
      {categories.map((cat) => {
        const catTags = tags.filter((t) => t.catId === cat.id);
        if (catTags.length === 0) return null;
        const CatI = getIcon(cat.icon || "CircleDot");
        return (
          <div key={cat.id} className="space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <CatI size={11} style={{ color: cat.color }} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{cat.name}</span>
            </div>
            {catTags.map((t) => {
              const iconName = customIcons[t.name] || TAG_ICON_MAP[t.name] || DEFAULT_TAG_ICON;
              const isCustom = !!customIcons[t.name];
              const TI = getIcon(iconName);
              const isEditing = editingTag === t.name;
              return (
                <div key={t.id}>
                  <div className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-gray-50">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "18" }}>
                      <TI size={14} style={{ color: cat.color }} />
                    </div>
                    <span className="flex-1 text-xs font-medium text-gray-700">{t.name}</span>
                    {isCustom && (
                      <button onClick={() => handleReset(t.name)} className="text-[9px] text-gray-400 hover:text-red-500 mr-1">Reset</button>
                    )}
                    <button onClick={() => setEditingTag(isEditing ? null : t.name)}
                      className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50">
                      Change
                    </button>
                  </div>
                  {isEditing && (
                    <div className="ml-9 mb-2">
                      <IconPicker value={iconName} onChange={(name) => handleIconChange(t.name, name)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════
// CATEGORY ICONS SECTION (Settings)
// ════════════════════════════════════════════
function CategoryIconsSection({ categories, onUpdateIcon }) {
  const [editingCat, setEditingCat] = useState(null);

  const defaultIcons = Object.fromEntries(
    DEFAULT_CATEGORIES.map((dc) => [dc.id, dc.icon])
  );

  const handleIconChange = (catId, iconName) => {
    onUpdateIcon?.(catId, iconName);
    setEditingCat(null);
  };

  const handleReset = (catId) => {
    const defaultIcon = defaultIcons[catId] || 'CircleDot';
    onUpdateIcon?.(catId, defaultIcon);
  };

  const handleResetAll = () => {
    categories.forEach((c) => {
      const defaultIcon = defaultIcons[c.id] || 'CircleDot';
      onUpdateIcon?.(c.id, defaultIcon);
    });
  };

  const isNonDefault = (cat) => cat.icon !== (defaultIcons[cat.id] || 'CircleDot');
  const anyCustom = categories.some(isNonDefault);

  return (
    <div className="space-y-3">
      {anyCustom && (
        <div className="flex justify-end">
          <button onClick={handleResetAll} className="text-[10px] text-red-400 hover:text-red-600 font-semibold">Reset all</button>
        </div>
      )}
      {categories.map((cat) => {
        const iconName = cat.icon || 'CircleDot';
        const CatI = getIcon(iconName);
        const isEditing = editingCat === cat.id;
        const isCustom = isNonDefault(cat);
        return (
          <div key={cat.id}>
            <div className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-gray-50">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "18" }}>
                <CatI size={14} style={{ color: cat.color }} />
              </div>
              <span className="flex-1 text-xs font-medium text-gray-700">{cat.name}</span>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              {isCustom && (
                <button onClick={() => handleReset(cat.id)} className="text-[9px] text-gray-400 hover:text-red-500 mr-1">Reset</button>
              )}
              <button onClick={() => setEditingCat(isEditing ? null : cat.id)}
                className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50">
                Change
              </button>
            </div>
            {isEditing && (
              <div className="ml-9 mb-2">
                <IconPicker value={iconName} onChange={(name) => handleIconChange(cat.id, name)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════
// TEMPLATE LOAD MODAL (multi-day)
// ════════════════════════════════════════════
function TemplateLoadModal({ template, currentDate, onLoad, onClose }) {
  const [mode, setMode] = useState("today");
  const [pickDate, setPickDate] = useState(() => new Date(currentDate));
  const [rangeStart, setRangeStart] = useState(() => new Date(currentDate));
  const [rangeEnd, setRangeEnd] = useState(() => { const d = new Date(currentDate); d.setDate(d.getDate() + 6); return d; });
  const [conflict, setConflict] = useState("merge"); // skip | merge | replace

  const getWeekSunday = (d) => { const r = new Date(d); r.setDate(r.getDate() - r.getDay()); return r; };

  const getDates = () => {
    switch (mode) {
      case "today": return [new Date(currentDate)];
      case "pick": return [new Date(pickDate)];
      case "range": {
        const dates = [];
        const d = new Date(rangeStart);
        while (d <= rangeEnd) { dates.push(new Date(d)); d.setDate(d.getDate() + 1); }
        return dates;
      }
      case "weekdays": {
        const sun = getWeekSunday(currentDate);
        return [0,1,2,3,4].map((i) => { const d = new Date(sun); d.setDate(d.getDate() + i); return d; });
      }
      case "weekends": {
        const sun = getWeekSunday(currentDate);
        return [5,6].map((i) => { const d = new Date(sun); d.setDate(d.getDate() + i); return d; });
      }
      case "week": {
        const sun = getWeekSunday(currentDate);
        return Array.from({ length: 7 }, (_, i) => { const d = new Date(sun); d.setDate(d.getDate() + i); return d; });
      }
      case "month": {
        const year = currentDate.getFullYear(), month = currentDate.getMonth();
        const dim = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: dim }, (_, i) => new Date(year, month, i + 1));
      }
      default: return [];
    }
  };

  const dates = getDates();
  const fmtRange = () => {
    if (dates.length === 1) return fd(dates[0]);
    return `${fd(dates[0])} – ${fd(dates[dates.length - 1])} (${dates.length} days)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 pb-7 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'DM Sans'" }}>
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4 sm:hidden" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Load: {template.name}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Apply to</label>
          <div className="space-y-1.5">
            {[
              ["today", "Today only"],
              ["pick", "Pick a date"],
              ["range", "Date range"],
              ["weekdays", "This week's weekdays (Sun–Thu)"],
              ["weekends", "This week's weekends (Fri–Sat)"],
              ["week", "Entire week (Sun–Sat)"],
              ["month", "Entire month"],
            ].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-xl hover:bg-gray-50">
                <input type="radio" name="tl-mode" value={val} checked={mode === val} onChange={() => setMode(val)}
                  className="accent-gray-900" />
                <span className="text-sm text-gray-700 font-medium">{label}</span>
              </label>
            ))}
          </div>

          {mode === "pick" && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Date</label>
              <input type="date" value={dk(pickDate)} onChange={(e) => setPickDate(new Date(e.target.value + "T12:00:00"))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          )}

          {mode === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Start</label>
                <input type="date" value={dk(rangeStart)} onChange={(e) => setRangeStart(new Date(e.target.value + "T12:00:00"))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">End</label>
                <input type="date" value={dk(rangeEnd)} onChange={(e) => setRangeEnd(new Date(e.target.value + "T12:00:00"))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">{fmtRange()}</div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">If a date has existing blocks</label>
            <div className="flex gap-1.5">
              {[["skip","Skip"], ["merge","Add"], ["replace","Replace"]].map(([val, label]) => (
                <button key={val} onClick={() => setConflict(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${conflict === val ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">Cancel</button>
            <button onClick={() => onLoad(template, dates, conflict)}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold">
              Load {dates.length > 1 ? `(${dates.length} days)` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// DRAG-REORDER HOOK
// ════════════════════════════════════════════
function useSortable(items, onReorder) {
  const dragState = useRef({ from: null, to: null });
  const [dragOver, setDragOver] = useState(null);
  const containerRef = useRef(null);

  const onDragStart = useCallback((i) => (e) => {
    e.preventDefault();
    dragState.current = { from: i, to: i };
    setDragOver(i);

    const onMove = (ev) => {
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      if (!containerRef.current) return;
      const rows = containerRef.current.querySelectorAll("[data-sort-row]");
      rows.forEach((row, ri) => {
        const rect = row.getBoundingClientRect();
        if (y >= rect.top && y < rect.bottom && ri !== dragState.current.to) {
          dragState.current.to = ri;
          setDragOver(ri);
        }
      });
    };
    const onEnd = () => {
      const { from, to } = dragState.current;
      dragState.current = { from: null, to: null };
      setDragOver(null);
      if (from !== null && to !== null && from !== to) {
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onReorder(next);
      }
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
    };
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd, { once: true });
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd, { once: true });
  }, [items, onReorder]);

  return { containerRef, onDragStart, dragOver };
}

// ════════════════════════════════════════════
// SORTABLE TAG LIST (sub-component so hooks work correctly)
// ════════════════════════════════════════════
function SortableTagList({ cat, catTags, blockCounts, editingTagId, editingTagName, setEditingTagId, setEditingTagName, setDeletingTag, setReassignTagId, addTagForCatId, setAddTagForCatId, newTagName, setNewTagName, onUpdateTag, onAddTag, onReorderTags }) {
  const { containerRef, onDragStart, dragOver } = useSortable(catTags, (newTags) => onReorderTags(cat.id, newTags));
  return (
    <div ref={containerRef} className="border-t border-gray-50 pb-1">
      {catTags.map((tag, tagIdx) => {
        const isEditingTag = editingTagId === tag.id;
        const tagBlockCount = blockCounts.tagCounts[tag.id] || 0;
        return (
          <div key={tag.id} data-sort-row
            className={`flex items-center gap-2 px-4 py-2 ${dragOver === tagIdx ? "border-t-2 border-blue-400" : "border-t border-gray-50"}`}>
            <span onTouchStart={onDragStart(tagIdx)} onMouseDown={onDragStart(tagIdx)}
              className="text-gray-300 cursor-grab touch-none select-none text-[13px] leading-none flex-shrink-0">⠿</span>
            <div className="w-1 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color + "70" }} />
            {isEditingTag ? (
              <input autoFocus value={editingTagName} onChange={e => setEditingTagName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { onUpdateTag({ ...tag, name: editingTagName.trim() || tag.name }); setEditingTagId(null); }
                  if (e.key === "Escape") setEditingTagId(null);
                }}
                className="flex-1 text-xs border border-blue-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            ) : (
              <span className="flex-1 text-xs text-gray-600">{tag.name}</span>
            )}
            {tagBlockCount > 0 && !isEditingTag && <span className="text-[10px] text-gray-400 flex-shrink-0">{tagBlockCount}b</span>}
            {isEditingTag ? (
              <>
                <button onClick={() => { onUpdateTag({ ...tag, name: editingTagName.trim() || tag.name }); setEditingTagId(null); }}
                  className="p-1 rounded-lg bg-blue-600 text-white flex-shrink-0"><Check size={11} /></button>
                <button onClick={() => setEditingTagId(null)} className="p-1 rounded-lg bg-gray-200 text-gray-600 flex-shrink-0"><X size={11} /></button>
              </>
            ) : (
              <>
                <button onClick={() => { setEditingTagId(tag.id); setEditingTagName(tag.name); }}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0"><Edit3 size={11} /></button>
                <button onClick={() => { setDeletingTag(tag); setReassignTagId(""); }}
                  className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0"><Trash2 size={11} /></button>
              </>
            )}
          </div>
        );
      })}
      {addTagForCatId === cat.id ? (
        <div className="flex gap-2 px-4 py-2 border-t border-gray-50">
          <input autoFocus value={newTagName} onChange={e => setNewTagName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && newTagName.trim()) { onAddTag({ id: uid(), name: newTagName.trim(), catId: cat.id }); setAddTagForCatId(null); setNewTagName(""); }
              if (e.key === "Escape") { setAddTagForCatId(null); setNewTagName(""); }
            }}
            placeholder="Tag name…"
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={() => { if (newTagName.trim()) onAddTag({ id: uid(), name: newTagName.trim(), catId: cat.id }); setAddTagForCatId(null); setNewTagName(""); }}
            className="px-2 py-1 rounded-lg bg-gray-900 text-white text-xs font-semibold">Save</button>
          <button onClick={() => { setAddTagForCatId(null); setNewTagName(""); }} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs"><X size={12} /></button>
        </div>
      ) : (
        <button onClick={() => { setAddTagForCatId(cat.id); setNewTagName(""); }}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-600 transition-colors px-4 py-2 border-t border-gray-50 w-full">
          <Plus size={11} /> Add tag
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// CATEGORY & TAG MANAGER
// ════════════════════════════════════════════
function CategoryTagManager({ categories, tags, allData, onUpdateCategory, onUpdateTag, onDeleteCategory, onDeleteTag, onAddCat, onAddTag, onReorderCategories, onReorderTags }) {
  const [expandedCats, setExpandedCats] = useState(new Set());
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [deletingCat, setDeletingCat] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [reassignCatId, setReassignCatId] = useState("");
  const [reassignTagId, setReassignTagId] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addTagForCatId, setAddTagForCatId] = useState(null);
  const [newTagName, setNewTagName] = useState("");

  const { containerRef: catContainerRef, onDragStart: onCatDragStart, dragOver: catDragOver } = useSortable(categories, onReorderCategories);

  const blockCounts = useMemo(() => {
    const catCounts = {};
    const tagCounts = {};
    for (const dayData of Object.values(allData)) {
      for (const b of (dayData.blocks || [])) {
        if (b.catId) catCounts[b.catId] = (catCounts[b.catId] || 0) + 1;
        if (b.tagId) tagCounts[b.tagId] = (tagCounts[b.tagId] || 0) + 1;
      }
    }
    return { catCounts, tagCounts };
  }, [allData]);

  const toggleCat = (catId) => setExpandedCats(prev => {
    const next = new Set(prev);
    if (next.has(catId)) next.delete(catId); else next.add(catId);
    return next;
  });

  const startDeleteCat = (cat) => {
    setDeletingCat(cat);
    setReassignCatId(categories.find(c => c.id !== cat.id)?.id || "");
  };

  const confirmDeleteCat = () => {
    onDeleteCategory(deletingCat.id, (blockCounts.catCounts[deletingCat.id] || 0) > 0 ? reassignCatId : null);
    setDeletingCat(null);
  };

  const confirmDeleteTag = () => {
    onDeleteTag(deletingTag.id, reassignTagId || null);
    setDeletingTag(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ fontFamily: "'DM Sans'" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categories & Tags</span>
        <button onClick={() => { setShowAddCat(true); setNewCatName(""); }}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">
          <Plus size={13} /> Category
        </button>
      </div>

      {/* Add category inline */}
      {showAddCat && (
        <div className="flex gap-2 px-4 py-3 border-b border-gray-100">
          <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && newCatName.trim()) { onAddCat({ id: uid(), name: newCatName.trim(), icon: "CircleDot", color: "#6B7280" }); setShowAddCat(false); setNewCatName(""); }
              if (e.key === "Escape") setShowAddCat(false);
            }}
            placeholder="Category name…"
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={() => { if (newCatName.trim()) onAddCat({ id: uid(), name: newCatName.trim(), icon: "CircleDot", color: "#6B7280" }); setShowAddCat(false); setNewCatName(""); }}
            className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold">Save</button>
          <button onClick={() => setShowAddCat(false)} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm"><X size={14} /></button>
        </div>
      )}

      {/* Category rows */}
      <div ref={catContainerRef}>
        {categories.map((cat, catIdx) => {
          const CatI = getIcon(cat.icon || "CircleDot");
          const catTags = tags.filter(t => t.catId === cat.id);
          const isExpanded = expandedCats.has(cat.id);
          const isEditingCat = editingCatId === cat.id;
          const catBlockCount = blockCounts.catCounts[cat.id] || 0;
          return (
            <div key={cat.id} data-sort-row className={catDragOver === catIdx ? "border-t-2 border-blue-400" : "border-t border-gray-100 first:border-t-0"}>
              {/* Category header row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <span onTouchStart={onCatDragStart(catIdx)} onMouseDown={onCatDragStart(catIdx)}
                  className="text-gray-300 cursor-grab touch-none select-none text-[13px] leading-none flex-shrink-0">⠿</span>
                <button onClick={() => !isEditingCat && toggleCat(cat.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "20" }}>
                    <CatI size={13} style={{ color: cat.color }} />
                  </div>
                  {isEditingCat ? (
                    <input autoFocus value={editingCatName} onChange={e => setEditingCatName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { onUpdateCategory({ ...cat, name: editingCatName.trim() || cat.name }); setEditingCatId(null); }
                        if (e.key === "Escape") setEditingCatId(null);
                      }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 text-sm font-semibold border border-blue-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  ) : (
                    <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{cat.name}</span>
                  )}
                  {catBlockCount > 0 && !isEditingCat && <span className="text-[10px] text-gray-400 flex-shrink-0">{catBlockCount}b</span>}
                  {!isEditingCat && (
                    <ChevronRight size={14} className={`text-gray-300 flex-shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`} />
                  )}
                </button>
                {isEditingCat ? (
                  <>
                    <button onClick={() => { onUpdateCategory({ ...cat, name: editingCatName.trim() || cat.name }); setEditingCatId(null); }}
                      className="p-1.5 rounded-lg bg-blue-600 text-white flex-shrink-0"><Check size={12} /></button>
                    <button onClick={() => setEditingCatId(null)} className="p-1.5 rounded-lg bg-gray-200 text-gray-600 flex-shrink-0"><X size={12} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex-shrink-0"><Edit3 size={13} /></button>
                    <button onClick={() => startDeleteCat(cat)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0"><Trash2 size={13} /></button>
                  </>
                )}
              </div>

              {/* Tags (expanded) */}
              {isExpanded && (
                <SortableTagList
                  cat={cat} catTags={catTags} blockCounts={blockCounts}
                  editingTagId={editingTagId} editingTagName={editingTagName}
                  setEditingTagId={setEditingTagId} setEditingTagName={setEditingTagName}
                  setDeletingTag={setDeletingTag} setReassignTagId={setReassignTagId}
                  addTagForCatId={addTagForCatId} setAddTagForCatId={setAddTagForCatId}
                  newTagName={newTagName} setNewTagName={setNewTagName}
                  onUpdateTag={onUpdateTag} onAddTag={onAddTag} onReorderTags={onReorderTags} />
              )}
            </div>
          );
        })}
      </div>

      {/* Delete category modal */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" onClick={() => setDeletingCat(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl space-y-4" onClick={e => e.stopPropagation()} style={{ fontFamily: "'DM Sans'" }}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto"><Trash2 size={22} className="text-red-500" /></div>
              <h3 className="text-base font-bold text-gray-900">Delete "{deletingCat.name}"?</h3>
              <p className="text-sm text-gray-500">
                {(blockCounts.catCounts[deletingCat.id] || 0) > 0
                  ? `${blockCounts.catCounts[deletingCat.id]} block${blockCounts.catCounts[deletingCat.id] !== 1 ? "s" : ""} will be reassigned. All tags in this category will be removed.`
                  : "This category and all its tags will be removed."}
              </p>
            </div>
            {(blockCounts.catCounts[deletingCat.id] || 0) > 0 && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Reassign blocks to</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.filter(c => c.id !== deletingCat.id).map(c => (
                    <button key={c.id} onClick={() => setReassignCatId(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${reassignCatId === c.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setDeletingCat(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">Cancel</button>
              <button onClick={confirmDeleteCat}
                disabled={(blockCounts.catCounts[deletingCat.id] || 0) > 0 && !reassignCatId}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete tag modal */}
      {deletingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" onClick={() => setDeletingTag(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl space-y-4" onClick={e => e.stopPropagation()} style={{ fontFamily: "'DM Sans'" }}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto"><Trash2 size={22} className="text-red-500" /></div>
              <h3 className="text-base font-bold text-gray-900">Delete tag "{deletingTag.name}"?</h3>
              <p className="text-sm text-gray-500">
                {(blockCounts.tagCounts[deletingTag.id] || 0) > 0
                  ? `${blockCounts.tagCounts[deletingTag.id]} block${blockCounts.tagCounts[deletingTag.id] !== 1 ? "s" : ""} use this tag.`
                  : "This tag will be removed."}
              </p>
            </div>
            {(blockCounts.tagCounts[deletingTag.id] || 0) > 0 && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Reassign to (optional)</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setReassignTagId("")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${reassignTagId === "" ? "border-gray-800 bg-gray-900 text-white" : "border-gray-200 text-gray-600"}`}>
                    Remove tag
                  </button>
                  {tags.filter(t => t.id !== deletingTag.id).map(t => (
                    <button key={t.id} onClick={() => setReassignTagId(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${reassignTagId === t.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setDeletingTag(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">Cancel</button>
              <button onClick={confirmDeleteTag} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// SYNC TAB (Export, Templates, Settings)
// ════════════════════════════════════════════
function ExportView({ blocks, date, allData, categories, tags, templates, onLoadTemplate, onSaveTemplate, onDeleteTemplate, onImportBlocks, googleAuth, calendars, calId, onCalIdChange, onSignIn, onSignOut, syncStatus, onSyncNow, onBackupNow, onRestoreFromBackup, authError, onClearAuthError, snapInterval, toggleSnap, onClearAllBlocks, onUpdateCategoryIcon, onUpdateCategory, onUpdateTag, onDeleteCategory, onDeleteTag, onAddCat, onAddTag, onReorderCategories, onReorderTags }) {
  const [exported, setExported] = useState(false);
  const [csvExported, setCsvExported] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateImportMsg, setTemplateImportMsg] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);
  // Collapsible section state — all collapsed by default (Google panel handles Sync & Calendar)
  const [openCatsTags, setOpenCatsTags] = useState(false);
  const [openTagIcons, setOpenTagIcons] = useState(false);
  const [openCatIcons, setOpenCatIcons] = useState(false);
  const [openPreferences, setOpenPreferences] = useState(false);
  const [openData, setOpenData] = useState(false);
  const fileRef = useRef(null);
  const templateImportRef = useRef(null);

  const handleICS = () => {
    const blob = new Blob([genICS(blocks, date)], { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `dayrhythm-${dk(date)}.ics`; a.click(); URL.revokeObjectURL(a.href);
    setExported(true); setTimeout(() => setExported(false), 2000);
  };

  const handleCSVAll = () => {
    const csv = genCSV(allData, categories, tags);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `rhythm-export-${dk(new Date())}.csv`; a.click(); URL.revokeObjectURL(a.href);
    setCsvExported(true); setTimeout(() => setCsvExported(false), 2000);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseICS(ev.target.result, date);
        if (parsed.length === 0) { setImportMsg("No events found for this date"); return; }
        const existing = new Set(blocks.map((b) => `${b.title}|${b.start}`));
        const toAdd = parsed.filter((b) => !existing.has(`${b.title}|${b.start}`));
        onImportBlocks([...blocks, ...toAdd]);
        setImportMsg(`✓ ${toAdd.length} event${toAdd.length !== 1 ? "s" : ""} imported${parsed.length > toAdd.length ? `, ${parsed.length - toAdd.length} skipped (duplicate)` : ""}`);
      } catch { setImportMsg("Could not parse .ics file"); }
      setTimeout(() => setImportMsg(""), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportTemplate = (t) => {
    const data = { name: t.name, blocks: t.blocks.map(({ id: _id, gcalEventId: _gc, _fromRecurring: _fr, ...rest }) => rest) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `rhythm-template-${t.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.json`; a.click(); URL.revokeObjectURL(a.href);
  };

  const handleTemplateImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.blocks || !Array.isArray(data.blocks)) { setTemplateImportMsg("Invalid template file"); return; }
        const newBlocks = data.blocks.map((b) => ({ ...b, id: uid() }));
        onImportBlocks(newBlocks);
        setTemplateImportMsg(`✓ Template "${data.name || "Imported"}" applied to today`);
      } catch { setTemplateImportMsg("Could not parse template file"); }
      setTimeout(() => setTemplateImportMsg(""), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3 pb-28" style={{ fontFamily: "'DM Sans'" }}>
      {/* Sync & Calendar, Cloud Backup, Account (each collapsible inside GoogleAccountPanel) */}
      <GoogleAccountPanel
        googleAuth={googleAuth} calendars={calendars} calId={calId} onCalIdChange={onCalIdChange}
        onSignIn={onSignIn} onSignOut={onSignOut} syncStatus={syncStatus}
        onSyncNow={onSyncNow} onBackupNow={onBackupNow} onRestoreFromBackup={onRestoreFromBackup}
        authError={authError} onClearAuthError={onClearAuthError} />

      {/* Categories & Tags Manager */}
      <CategoryTagManager
        categories={categories} tags={tags} allData={allData}
        onUpdateCategory={onUpdateCategory} onUpdateTag={onUpdateTag}
        onDeleteCategory={onDeleteCategory} onDeleteTag={onDeleteTag}
        onAddCat={onAddCat} onAddTag={onAddTag}
        onReorderCategories={onReorderCategories} onReorderTags={onReorderTags} />

      {/* Tag Icons */}
      <SettingsSection title="Tag Icons" open={openTagIcons} onToggle={() => setOpenTagIcons((o) => !o)}>
        <TagIconsSection tags={tags} categories={categories} />
      </SettingsSection>

      {/* Category Icons */}
      <SettingsSection title="Category Icons" open={openCatIcons} onToggle={() => setOpenCatIcons((o) => !o)}>
        <CategoryIconsSection categories={categories} onUpdateIcon={onUpdateCategoryIcon} />
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences" open={openPreferences} onToggle={() => setOpenPreferences((o) => !o)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">Time Grid</div>
            <div className="text-xs text-gray-400">Snap interval for all blocks</div>
          </div>
          <div className="flex gap-1">
            {[[0.25, "15 min"], [0.5, "30 min"]].map(([val, label]) => (
              <button key={val} onClick={() => snapInterval !== val && toggleSnap()}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${snapInterval === val ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Templates */}
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Templates</label>
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FolderOpen size={16} className="text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-[10px] text-gray-400">{t.blocks.length} blocks</div>
                </div>
                <button onClick={() => exportTemplate(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Download size={13} /></button>
                <button onClick={() => setPendingTemplate(t)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">Load</button>
                <button onClick={() => onDeleteTemplate(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
            {templates.length === 0 && <p className="text-sm text-gray-400 text-center py-1">No templates saved yet.</p>}
          </div>
          <div className="flex gap-2">
            <input value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Save current day as template…"
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button onClick={() => { if (newTemplateName.trim() && blocks.length > 0) { onSaveTemplate(newTemplateName.trim()); setNewTemplateName(""); } }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800">
              <Save size={14} /> Save
            </button>
          </div>
          <button onClick={() => templateImportRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
            <Upload size={13} /> Import Template (.json)
          </button>
          <input ref={templateImportRef} type="file" accept=".json,application/json" className="hidden" onChange={handleTemplateImport} />
          {templateImportMsg && <p className="text-xs text-center text-gray-500">{templateImportMsg}</p>}
        </div>
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection title="Data Management" open={openData} onToggle={() => setOpenData((o) => !o)}>
        <button onClick={handleCSVAll} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors">
          {csvExported ? <><Check size={16} /> Downloaded!</> : <><Download size={16} /> Export All Days (CSV)</>}
        </button>
        <button onClick={handleICS} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors">
          {exported ? <><Check size={16} /> Downloaded!</> : <><Download size={16} /> Export Today (.ics)</>}
        </button>
        <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors">
          <Upload size={16} /> Import .ics file
        </button>
        <input ref={fileRef} type="file" accept=".ics,text/calendar" className="hidden" onChange={handleImportFile} />
        {importMsg && <p className="text-xs text-center text-gray-500">{importMsg}</p>}
        <div className="border-t border-gray-100 pt-1">
          <button onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={14} /> Clear All Blocks
          </button>
        </div>
      </SettingsSection>

      {/* Refresh */}
      <div className="text-center pb-4">
        <button onClick={() => window.location.reload(true)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw size={14} /> Refresh App
        </button>
      </div>

      {/* Template load modal */}
      {pendingTemplate && (
        <TemplateLoadModal template={pendingTemplate} currentDate={date}
          onLoad={(tmpl, dates, conflictMode) => {
            onLoadTemplate(tmpl, dates, conflictMode);
            setPendingTemplate(null);
          }}
          onClose={() => setPendingTemplate(null)} />
      )}

      {/* Clear confirm dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Clear All Blocks?</h3>
              <p className="text-sm text-gray-500">This will permanently delete all tracked blocks across all days. Categories, tags, and templates are kept.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={() => { onClearAllBlocks(); setShowClearConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// CUSTOM DATE PICKER MODAL
// ════════════════════════════════════════════
function DatePickerModal({ currentDate, onChange, onClose }) {
  const [viewDate, setViewDate] = useState(() => new Date(currentDate));
  const [view, setView] = useState("day"); // "day" | "month"
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayKey = dk(new Date());
  const selectedKey = dk(currentDate);
  const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const navMonth = (delta) => setViewDate(new Date(year, month + delta, 1));
  const navYear = (delta) => setViewDate(new Date(year + delta, month, 1));
  const pick = (day) => { onChange(new Date(year, month, day, 12, 0, 0)); onClose(); };
  const pickMonth = (m) => { setViewDate(new Date(year, m, 1)); setView("day"); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-4 w-full max-w-xs shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'DM Sans'" }}>
        {view === "month" ? (
          <>
            {/* Year navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navYear(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronLeft size={18} className="text-gray-500" /></button>
              <button onClick={() => setView("day")} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">{year}</button>
              <button onClick={() => navYear(1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronRight size={18} className="text-gray-500" /></button>
            </div>
            {/* Month grid */}
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((name, i) => {
                const isCur = i === month;
                const isThisMonth = dk(new Date()) === dk(new Date(year, i, 1));
                return (
                  <button key={i} onClick={() => pickMonth(i)}
                    className="py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={isCur ? { backgroundColor: "#1E293B", color: "#fff" }
                      : isThisMonth ? { backgroundColor: "#EFF6FF", color: "#2563EB" }
                      : { color: "#374151" }}>
                    {name}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => navMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronLeft size={18} className="text-gray-500" /></button>
              <button onClick={() => setView("month")} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">{monthName}</button>
              <button onClick={() => navMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronRight size={18} className="text-gray-500" /></button>
            </div>
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DOW.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}
            </div>
            {/* Day grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayKey = dk(new Date(year, month, day));
                const isSel = dayKey === selectedKey;
                const isToday = dayKey === todayKey;
                return (
                  <button key={day} onClick={() => pick(day)}
                    className="aspect-square flex items-center justify-center text-xs font-medium rounded-full transition-all active:scale-90"
                    style={isSel ? { backgroundColor: "#2563EB", color: "#fff", fontWeight: 700 }
                      : isToday ? { backgroundColor: "#EFF6FF", color: "#2563EB", fontWeight: 700 }
                      : { color: "#374151" }}>
                    {day}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════
export default function DayRhythmV2() {
  const [state, setState] = useState(initState);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tab, setTab] = useState("rhythm");
  const [selBlock, setSelBlock] = useState(null);
  const [editBlock, setEditBlock] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [googleAuth, setGoogleAuth] = useState(loadAuth);
  const [calId, setCalId] = useState(() => localStorage.getItem("gcal_cal_id") || "primary");
  const [calendars, setCalendars] = useState([]);
  const [syncStatus, setSyncStatus] = useState("");
  const [restoreBackup, setRestoreBackup] = useState(null);
  const [authError, setAuthError] = useState("");
  const [snapInterval, setSnapInterval] = useState(() => parseFloat(localStorage.getItem("snap_interval") || "0.5"));
  const toggleSnap = () => setSnapInterval((s) => { const n = s === 0.5 ? 0.25 : 0.5; localStorage.setItem("snap_interval", String(n)); return n; });
  const [timelineView, setTimelineView] = useState("day"); // "day" | "3day"
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const saveTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(state), 400);
    return () => clearTimeout(saveTimerRef.current);
  }, [state]);

  // ── Google auth helpers ──
  const googleAuthRef = useRef(googleAuth);
  useEffect(() => { googleAuthRef.current = googleAuth; }, [googleAuth]);
  const backupTimerRef = useRef(null);
  const lastBackupRef = useRef(0);

  const getToken = useCallback(async () => {
    const auth = googleAuthRef.current;
    if (!auth?.access_token) return null;
    if (Date.now() < auth.token_expiry) return auth.access_token;
    if (!auth.refresh_token) return null;
    try {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: auth.refresh_token }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const updated = { ...auth, access_token: data.access_token, token_expiry: Date.now() + (data.expires_in - 300) * 1000 };
      saveAuth(updated);
      setGoogleAuth(updated);
      googleAuthRef.current = updated;
      return updated.access_token;
    } catch { return null; }
  }, []);

  // OAuth callback on load — check for ?code= from redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    if (error) {
      window.history.replaceState({}, "", window.location.pathname);
      setAuthError(`Google sign-in denied: ${error}`);
      return;
    }
    if (!code) return;
    window.history.replaceState({}, "", window.location.pathname);
    const verifier = localStorage.getItem("pkce_verifier");
    localStorage.removeItem("pkce_verifier");
    if (!verifier) {
      setAuthError("Sign-in failed (session lost during redirect). Please try again.");
      return;
    }
    (async () => {
      try {
        const res = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
            code, code_verifier: verifier,
            grant_type: "authorization_code", redirect_uri: window.location.origin,
          }),
        });
        const tokens = await res.json();
        if (!res.ok) {
          setAuthError(`Sign-in failed: ${tokens.error_description || tokens.error || res.status}`);
          return;
        }
        const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const profile = await profileRes.json();
        const auth = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: Date.now() + (tokens.expires_in - 300) * 1000,
          user: { id: profile.sub, email: profile.email, name: profile.name, avatar: profile.picture },
          connected: true, last_sync: null,
        };
        saveAuth(auth);
        setGoogleAuth(auth);
        // Fetch calendars, auto-select Routine
        try {
          const calRes = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });
          const calData = await calRes.json();
          const cals = (calData.items || []).filter((c) => ["owner", "writer"].includes(c.accessRole));
          setCalendars(cals);
          const savedCalId = localStorage.getItem("gcal_cal_id");
          if (!savedCalId || savedCalId === "primary") {
            const routine = cals.find((c) => c.summary?.toLowerCase() === "routine");
            if (routine) { setCalId(routine.id); localStorage.setItem("gcal_cal_id", routine.id); }
          }
        } catch {}
        // Check Drive for backup to restore
        try {
          const backup = await driveRestore(tokens.access_token);
          if (backup?.version === 2 && Object.keys(backup.days || {}).length > 0) {
            const localDayCount = Object.keys(state.days || {}).length;
            if (localDayCount === 0) {
              setState(backup);
            } else {
              setRestoreBackup(backup);
            }
          }
        } catch {}
      } catch (e) {
        setAuthError(`Sign-in failed: ${e?.message || "network error"}`);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch calendars when auth becomes available
  useEffect(() => {
    if (!googleAuth?.access_token) { setCalendars([]); return; }
    (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCalendars((data.items || []).filter((c) => ["owner", "writer"].includes(c.accessRole)));
      } catch {}
    })();
  }, [googleAuth?.access_token, getToken]);

  // Drive auto-backup (debounced 5s, min 30s between backups)
  useEffect(() => {
    if (!googleAuth?.connected) return;
    clearTimeout(backupTimerRef.current);
    backupTimerRef.current = setTimeout(async () => {
      if (!navigator.onLine) return;
      const now = Date.now();
      if (now - lastBackupRef.current < 30000) return;
      lastBackupRef.current = now;
      try {
        const token = await getToken();
        if (token) { await driveBackup(state, token); localStorage.setItem("last_backup", new Date().toISOString()); }
      } catch {}
    }, 5000);
    return () => clearTimeout(backupTimerRef.current);
  }, [state, googleAuth?.connected, getToken]);

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 10000); return () => clearInterval(t); }, []);
  const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  const key = dk(currentDate);
  const dayData = state.days[key] || { theme: "", blocks: [] };
  // blocks = day-specific blocks only (used for GCal sync)
  const dayBlocks = dayData.blocks;
  // effectiveBlocks = day blocks + applicable recurring (used for rendering)
  const blocks = useMemo(() => getEffectiveBlocks(state, key), [state, key]);

  const syncRef = useRef({ dateKey: null, blocks: null, token: null, timer: null });
  const pullSkipRef = useRef(false);
  const blocksRef = useRef(dayBlocks);
  const dateRef = useRef(currentDate);
  useEffect(() => { dateRef.current = currentDate; }, [currentDate]);
  useEffect(() => { blocksRef.current = dayBlocks; }, [dayBlocks]);

  const handleGcalBlockCreated = useCallback((blockId, gcalEventId) => {
    setState((prev) => {
      const k = dk(dateRef.current);
      const dd = prev.days[k];
      if (!dd) return prev;
      return { ...prev, days: { ...prev.days, [k]: { ...dd, blocks: dd.blocks.map((b) => b.id === blockId ? { ...b, gcalEventId } : b) } } };
    });
  }, []);

  const handleGcalPull = useCallback((dateKey, deletedIds, updatedBlocks, newBlocks) => {
    if (!deletedIds.length && !updatedBlocks.length && !newBlocks.length) return;
    pullSkipRef.current = true;
    setState((prev) => {
      const dd = prev.days[dateKey] || { theme: "", blocks: [] };
      let bs = dd.blocks.filter((b) => !deletedIds.includes(b.id));
      for (const upd of updatedBlocks) {
        const idx = bs.findIndex((b) => b.id === upd.id);
        if (idx >= 0) bs[idx] = upd;
      }
      bs = [...bs, ...newBlocks];
      bs.sort((a, b) => a.start - b.start);
      return { ...prev, days: { ...prev.days, [dateKey]: { ...dd, blocks: bs } } };
    });
  }, []);

  useEffect(() => {
    const gcalToken = googleAuth?.access_token;
    const dateKey = dk(currentDate);
    if (!gcalToken || syncRef.current.dateKey !== dateKey || syncRef.current.token !== gcalToken) {
      clearTimeout(syncRef.current.timer);
      syncRef.current = { dateKey, blocks: dayBlocks, token: gcalToken, timer: null };
      return;
    }
    clearTimeout(syncRef.current.timer);
    const prevBlocks = syncRef.current.blocks;
    syncRef.current.timer = setTimeout(async () => {
      if (pullSkipRef.current) {
        pullSkipRef.current = false;
        syncRef.current.blocks = dayBlocks;
        return;
      }
      setSyncStatus("Syncing…");
      try {
        const token = await getToken();
        if (!token) throw new Error("auth");
        await syncDiff(prevBlocks, dayBlocks, currentDate, token, calId, handleGcalBlockCreated);
        localStorage.setItem("last_calendar_sync", new Date().toISOString());
        setSyncStatus("✓ Synced");
        setTimeout(() => setSyncStatus(""), 3000);
      } catch(e) {
        if (e?.message === "auth") {
          setGoogleAuth((prev) => prev ? { ...prev, access_token: null } : null);
          setSyncStatus("Session expired — sign in again");
        } else {
          setSyncStatus(`Sync failed: ${e?.message || "unknown error"}`);
        }
      }
      syncRef.current.blocks = dayBlocks;
    }, 1500);
    return () => clearTimeout(syncRef.current.timer);
  }, [dayBlocks, currentDate, googleAuth?.access_token, calId, handleGcalBlockCreated, getToken]);

  useEffect(() => {
    if (!googleAuth?.access_token || !calId) return;
    const dateKey = dk(currentDate);
    const runPull = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const result = await pullSync(currentDate, token, calId, blocksRef.current);
        if (result) handleGcalPull(dateKey, result.deletedIds, result.updatedBlocks, result.newBlocks);
      } catch (e) {
        if (e?.message === "auth") {
          setGoogleAuth((prev) => prev ? { ...prev, access_token: null } : null);
          setSyncStatus("Session expired — sign in again");
        }
      }
    };
    runPull();
    const onVisibility = () => { if (!document.hidden) runPull(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [currentDate, googleAuth?.access_token, calId, handleGcalPull, getToken]);
  const { categories, tags, templates } = state;

  const allocated = blocks.reduce((s, b) => s + dur(b.start, b.end), 0);
  const remainingHrs = Math.max(0, 24 - allocated);

  const updateState = (fn) => setState((prev) => { const next = fn({ ...prev, days: { ...prev.days }, categories: [...prev.categories], tags: [...prev.tags], templates: [...prev.templates], recurring: [...(prev.recurring || [])] }); return next; });

  const setDayBlocks = (newBlocks) => updateState((s) => { s.days[key] = { ...dayData, blocks: newBlocks }; return s; });

  const handleSaveBlock = (block) => {
    const { _fromRecurring, ...cleanBlock } = block;
    if (cleanBlock.repeat && cleanBlock.repeat !== "none") {
      // Save/update in recurring array (affects all future occurrences)
      setState((prev) => {
        const rec = [...(prev.recurring || [])];
        const idx = rec.findIndex((r) => r.id === cleanBlock.id);
        const template = { ...cleanBlock, createdDay: key };
        idx >= 0 ? (rec[idx] = template) : rec.push(template);
        return { ...prev, recurring: rec };
      });
    } else {
      // Normal day block
      setState((prev) => {
        const dd = prev.days[key] || { theme: "", blocks: [] };
        const bs = [...dd.blocks];
        const idx = bs.findIndex((b) => b.id === cleanBlock.id);
        idx >= 0 ? (bs[idx] = cleanBlock) : bs.push(cleanBlock);
        bs.sort((a, b) => a.start - b.start);
        return { ...prev, days: { ...prev.days, [key]: { ...dd, blocks: bs } } };
      });
    }
    setShowEditor(false); setEditBlock(null); setPrefill(null); setSelBlock(null);
  };

  const handleDeleteBlock = (id) => {
    const isRecurring = (state.recurring || []).some((r) => r.id === id);
    if (isRecurring) {
      // "Skip today" — add to this day's skipped list
      setState((prev) => {
        const dd = prev.days[key] || { theme: "", blocks: [] };
        return { ...prev, days: { ...prev.days, [key]: { ...dd, skipped: [...(dd.skipped || []), id] } } };
      });
    } else {
      setDayBlocks(dayBlocks.filter((b) => b.id !== id));
    }
    setShowEditor(false); setEditBlock(null); setSelBlock(null);
  };

  const handleDeleteRecurring = (id) => {
    setState((prev) => ({ ...prev, recurring: (prev.recurring || []).filter((r) => r.id !== id) }));
    setShowEditor(false); setEditBlock(null); setSelBlock(null);
  };

  const handleDuplicateBlock = (block) => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextKey = dk(nextDay);
    const copy = { ...block, id: uid(), gcalEventId: undefined, _fromRecurring: undefined };
    setState((prev) => {
      const dd = prev.days[nextKey] || { theme: "", blocks: [] };
      const bs = [...dd.blocks, copy].sort((a, b) => a.start - b.start);
      return { ...prev, days: { ...prev.days, [nextKey]: { ...dd, blocks: bs } } };
    });
    setShowEditor(false); setEditBlock(null);
    setCurrentDate(nextDay);
    showToast(`Copied to ${fd(nextDay)}`);
  };

  const handleUpdateBlock = useCallback((id, updates) => {
    setState((prev) => {
      const dd = prev.days[key] || { theme: "", blocks: [] };
      const bs = dd.blocks.map((b) => b.id === id ? { ...b, ...updates } : b);
      return { ...prev, days: { ...prev.days, [key]: { ...dd, blocks: bs } } };
    });
  }, [key]);

  const handleSelectBlock = useCallback((id) => {
    setSelBlock(id);
  }, []);

  useEffect(() => {
    if (!selBlock) return;
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${selBlock}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const tabBarH = 80;
      const fullyVisible = rect.top >= 0 && rect.bottom <= vh - tabBarH;
      if (!fullyVisible) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(t);
  }, [selBlock]);

  const handleAddAtGap = useCallback((start, end) => {
    setPrefill({ start, end });
    setEditBlock(null);
    setShowEditor(true);
  }, []);

  const handleAddCat = (cat) => updateState((s) => { s.categories.push(cat); return s; });
  const handleAddTag = (tag) => updateState((s) => { s.tags.push(tag); return s; });
  const handleUpdateCategoryIcon = (catId, iconName) => updateState((s) => {
    s.categories = s.categories.map((c) => c.id === catId ? { ...c, icon: iconName } : c);
    return s;
  });
  const handleUpdateCategory = (updatedCat) => updateState((s) => { s.categories = s.categories.map(c => c.id === updatedCat.id ? updatedCat : c); return s; });
  const handleUpdateTag = (updatedTag) => updateState((s) => { s.tags = s.tags.map(t => t.id === updatedTag.id ? updatedTag : t); return s; });
  const handleDeleteCategory = (catId, replaceCatId) => updateState((s) => {
    s.categories = s.categories.filter(c => c.id !== catId);
    s.tags = s.tags.filter(t => t.catId !== catId);
    const fallback = s.categories[0]?.id || null;
    for (const dateKey of Object.keys(s.days)) {
      s.days[dateKey] = { ...s.days[dateKey], blocks: (s.days[dateKey].blocks || []).map(b => b.catId === catId ? { ...b, catId: replaceCatId || fallback, tagId: null } : b) };
    }
    return s;
  });
  const handleDeleteTag = (tagId, replaceTagId) => updateState((s) => {
    s.tags = s.tags.filter(t => t.id !== tagId);
    for (const dateKey of Object.keys(s.days)) {
      s.days[dateKey] = { ...s.days[dateKey], blocks: (s.days[dateKey].blocks || []).map(b => b.tagId === tagId ? { ...b, tagId: replaceTagId || null } : b) };
    }
    return s;
  });
  const handleReorderCategories = (newCats) => updateState((s) => { s.categories = newCats; return s; });
  const handleReorderTags = (catId, newCatTags) => updateState((s) => {
    const firstIdx = s.tags.findIndex(t => t.catId === catId);
    s.tags = s.tags.filter(t => t.catId !== catId);
    s.tags.splice(firstIdx === -1 ? s.tags.length : firstIdx, 0, ...newCatTags);
    return s;
  });

  const handleLoadTemplate = (t, dates, conflictMode) => {
    // Legacy call from old TemplatePanel (no dates arg): load onto current day
    if (!dates) { setDayBlocks(t.blocks.map((b) => ({ ...b, id: uid() }))); return; }
    setState((prev) => {
      const next = { ...prev, days: { ...prev.days } };
      dates.forEach((dateObj) => {
        const dateKey = dk(dateObj);
        const existing = prev.days[dateKey] || { theme: "", blocks: [] };
        let blocks;
        if (conflictMode === "replace") {
          blocks = t.blocks.map((b) => ({ ...b, id: uid() }));
        } else if (conflictMode === "skip" && existing.blocks.length > 0) {
          return; // skip this date
        } else {
          // merge: add non-overlapping blocks
          blocks = [...existing.blocks, ...t.blocks.map((b) => ({ ...b, id: uid() }))].sort((a, b) => a.start - b.start);
        }
        next.days[dateKey] = { ...existing, blocks };
      });
      return next;
    });
    showToast(`Template loaded on ${dates.length} day${dates.length !== 1 ? "s" : ""}`);
  };
  const handleSaveTemplate = (name) => {
    updateState((s) => { s.templates.push({ id: uid(), name, blocks: blocks.map((b) => ({ ...b })) }); return s; });
  };
  const handleDeleteTemplate = (id) => {
    updateState((s) => { s.templates = s.templates.filter((t) => t.id !== id); return s; });
  };

  const handleImportBlocks = useCallback((newBlocks) => setDayBlocks(newBlocks), [key]);

  const handleClearAllBlocks = useCallback(() => {
    _clearConfirmed = true; // permit the upcoming empty-days save
    updateState((s) => { s.days = {}; return s; });
    setCurrentDate(new Date());
    setTab("rhythm");
  }, []);

  const handleSyncNow = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setSyncStatus("Syncing…");
    try {
      const dateKey = dk(currentDate);
      const result = await pullSync(currentDate, token, calId, blocksRef.current);
      if (result) handleGcalPull(dateKey, result.deletedIds, result.updatedBlocks, result.newBlocks);
      localStorage.setItem("last_calendar_sync", new Date().toISOString());
      setSyncStatus("✓ Synced");
      setTimeout(() => setSyncStatus(""), 3000);
    } catch (e) {
      if (e?.message === "auth") setGoogleAuth((prev) => prev ? { ...prev, access_token: null } : null);
      setSyncStatus(`Sync failed: ${e?.message || "unknown"}`);
    }
  }, [currentDate, calId, getToken, handleGcalPull]);

  const handleBackupNow = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      await driveBackup(state, token);
      localStorage.setItem("last_backup", new Date().toISOString());
    } catch {}
  }, [state, getToken]);

  const handleRestoreFromBackup = useCallback(async () => {
    const token = await getToken();
    if (!token) return { success: false, error: "Not signed in" };
    try {
      const backup = await driveRestore(token);
      if (!backup) return { success: false, error: "No backup found" };
      setState(backup);
      localStorage.setItem("last_backup", new Date().toISOString());
      setTimeout(() => window.location.reload(), 500);
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message || "Restore failed" };
    }
  }, [getToken]);

  const handleSignOut = useCallback(async () => {
    const auth = googleAuthRef.current;
    if (auth?.access_token) {
      try { await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(auth.access_token)}`, { method: "POST" }); } catch {}
    }
    clearAuthStorage();
    setGoogleAuth(null);
    setCalendars([]);
    setCalId("primary");
    setSyncStatus("");
  }, []);

  const handlePullDay = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const dateKey = dk(currentDate);
    try {
      const result = await pullSync(currentDate, token, calId, blocksRef.current);
      if (result) handleGcalPull(dateKey, result.deletedIds, result.updatedBlocks, result.newBlocks);
    } catch (e) {
      if (e?.message === "auth") {
        setGoogleAuth((prev) => prev ? { ...prev, access_token: null } : null);
        setSyncStatus("Session expired — sign in again");
      }
    }
  }, [currentDate, calId, getToken, handleGcalPull]);

  const nav = useCallback((d) => { const dt = new Date(currentDate); dt.setDate(dt.getDate() + d); setCurrentDate(dt); setSelBlock(null); }, [currentDate]);

  const tabItems = [
    { id: "rhythm", label: "Rhythm", icon: Sun },
    { id: "timeline", label: "Timeline", icon: AlignJustify },
    { id: "analytics", label: "Trends", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Lock body/html scroll when Timeline tab is active so the inner scroll
  // container captures all touch, preventing the page from stealing scroll
  // from the hour column and grid area.
  useEffect(() => {
    if (tab === "timeline") {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [tab]);

  // Keyboard shortcuts — uses ref to avoid stale closures
  const kbRef = useRef({});
  kbRef.current = { showEditor, selBlock, blocks };
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const { showEditor, selBlock, blocks } = kbRef.current;
      if (e.key === "Escape") {
        if (showEditor) { setShowEditor(false); setEditBlock(null); setPrefill(null); }
        else setSelBlock(null);
      } else if (e.key === "Enter" && selBlock && !showEditor) {
        const b = blocks.find((b) => b.id === selBlock);
        if (b) { setEditBlock(b); setShowEditor(true); }
      } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !showEditor && blocks.length > 0) {
        e.preventDefault();
        const idx = blocks.findIndex((b) => b.id === selBlock);
        const next = e.key === "ArrowDown" ? (idx + 1) % blocks.length : (idx - 1 + blocks.length) % blocks.length;
        setSelBlock(blocks[next]?.id || blocks[0].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100dvh" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-3 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <button onClick={() => nav(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronLeft size={18} className="text-gray-400" /></button>
          <div className="text-center flex-1">
            <button onClick={() => setShowDatePicker(true)} className="cursor-pointer">
              <h1 className="text-base font-bold text-gray-900 tracking-tight">{fd(currentDate)}</h1>
            </button>
            <div className="flex items-center justify-center mt-0.5">
              <button onClick={() => setCurrentDate(new Date())}
                className={`text-[10px] font-semibold transition-colors ${dk(currentDate) !== dk(new Date()) ? "text-blue-500 hover:text-blue-600" : "text-gray-300 cursor-default"}`}>
                Today
              </button>
            </div>
          </div>
          <button onClick={() => nav(1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronRight size={18} className="text-gray-400" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pt-0">
          <div className="space-y-3 pb-24" style={{ display: tab === "rhythm" ? undefined : "none" }}>
            <div className="-mx-3">
              <CircularClock blocks={blocks} categories={categories} onUpdateBlock={handleUpdateBlock}
                onSelectBlock={handleSelectBlock} selectedId={selBlock} currentHour={currentHour} remainingHrs={remainingHrs} onDeselect={() => setSelBlock(null)} onNavigate={nav} snapInterval={snapInterval} />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-3 px-3" style={{ scrollbarWidth: "none" }}>
              {categories.map((c) => {
                const hrs = blocks.filter((b) => b.catId === c.id).reduce((s, b) => s + dur(b.start, b.end), 0);
                return (
                  <div key={c.id} className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{c.name} · {hrs.toFixed(1)}h</span>
                  </div>
                );
              })}
            </div>
            {/* Day timeline bar — 24h scale with block positions and "now" indicator */}
            {(() => {
              const totalMin = 24 * 60;
              const scheduledMin = blocks.reduce((s, b) => s + dur(b.start, b.end) * 60, 0);
              const freeMin = Math.max(0, totalMin - scheduledMin);
              const fmtH = (m) => { const h = Math.floor(m / 60), mn = m % 60; return h > 0 ? (mn > 0 ? `${h}h ${mn}m` : `${h}h`) : `${mn}m`; };
              const isViewingToday = dk(currentDate) === dk(new Date());
              const nowPct = isViewingToday ? ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / (totalMin * 60)) * 100 : null;
              const hrLabels = ["12","1","2","3","4","5","6","7","8","9","10","11","12","1","2","3","4","5","6","7","8","9","10","11","12"];
              return (
                <div style={{ padding: "6px 4px 0", marginBottom: "4px" }}>
                  <div style={{ position: "relative", height: "12px", borderRadius: "6px", background: "#F3F4F6" }}>
                    {blocks.map((b) => {
                      const startMin = b.start * 60;
                      const endMin = b.end > b.start ? b.end * 60 : b.end * 60 + totalMin;
                      const left = (startMin / totalMin) * 100;
                      const width = Math.min(((endMin - startMin) / totalMin) * 100, 100 - left);
                      const cat = categories.find((c) => c.id === b.catId);
                      return (
                        <div key={b.id} title={`${b.title}: ${fmt(b.start)} – ${fmt(b.end)}`}
                          style={{ position: "absolute", top: 0, height: "100%", left: `${left}%`, width: `${width}%`, backgroundColor: cat?.color || b.color || "#94A3B8" }} />
                      );
                    })}
                    {nowPct !== null && (
                      <div style={{ position: "absolute", top: "-2px", left: `${nowPct}%`, width: "2px", height: "16px", background: "#000", borderRadius: "1px", zIndex: 10 }} />
                    )}
                  </div>
                  <div style={{ position: "relative", height: "12px", marginTop: "3px" }}>
                    {hrLabels.map((l, i) => {
                      const pct = (i / 24) * 100;
                      const xform = i === 0 ? "translateX(0)" : i === 24 ? "translateX(-100%)" : "translateX(-50%)";
                      return (
                        <span key={i} style={{ position: "absolute", left: `${pct}%`, transform: xform, fontSize: "8px", color: "#AAA", whiteSpace: "nowrap" }}>{l}</span>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "6px", fontSize: "10px", color: "#888", marginTop: "4px" }}>
                    <span>{fmtH(scheduledMin)} scheduled</span>
                    <span>·</span>
                    <span>{fmtH(freeMin)} free</span>
                  </div>
                </div>
              );
            })()}
            {/* Compact block list */}
            <div className="space-y-px">
              {blocks.map((b) => {
                const blockIconName = b.icon || b.iconId;
                const BlockIcon = blockIconName ? getIcon(blockIconName) : null;
                return (
                  <div key={b.id} data-block-id={b.id} onClick={() => { setEditBlock(b); setShowEditor(true); }}
                    className="block-card flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-all hover:bg-gray-50 active:bg-gray-100"
                    style={selBlock === b.id ? { backgroundColor: b.color + "18" } : {}}>
                    <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: b.color, borderRadius: 0 }} />
                    <div className="w-9 h-9 min-w-[36px] rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (b.color || "#94A3B8") + "20" }}>
                      {BlockIcon
                        ? <BlockIcon size={14} style={{ color: b.color || "#94A3B8" }} />
                        : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color || "#94A3B8" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate leading-tight">{b.title}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-400 leading-tight">{fmt(b.start)} – {fmt(b.end)} · {dur(b.start, b.end).toFixed(1)}h</span>
                        {getTagIds(b).map((tid) => { const tag = tags.find((t) => t.id === tid); return tag ? <span key={tid} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{tag.name}</span> : null; })}
                      </div>
                    </div>
                    {b._fromRecurring ? <span className="text-[11px] text-gray-300 flex-shrink-0">↻</span> : <Edit3 size={12} className="text-gray-300 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
            {/* Manage recurring rules */}
            {(state.recurring || []).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Recurring blocks</span>
                  <span className="text-[10px] text-gray-400">{state.recurring.length} rule{state.recurring.length !== 1 ? "s" : ""}</span>
                </div>
                {state.recurring.map((r) => {
                  const cat = categories.find((c) => c.id === r.catId);
                  const repeatLabel = { daily: "Daily", weekdays: "Weekdays", weekly: "Weekly" }[r.repeat] || r.repeat;
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 active:bg-gray-50"
                      onClick={() => { setEditBlock({ ...r, _fromRecurring: true }); setShowEditor(true); }}>
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{r.title}</div>
                        <div className="text-[10px] text-gray-400">{repeatLabel} · {fmt(r.start)}–{fmt(r.end)}{cat ? ` · ${cat.name}` : ""}</div>
                      </div>
                      <span className="text-[11px] text-gray-300">↻</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3" style={{ display: tab === "timeline" ? undefined : "none" }}>
            {/* Day / 3-Day toggle */}
            <div className="flex items-center justify-end mb-2 gap-1">
              {[["day", "Day"], ["3day", "3-Day"]].map(([v, label]) => (
                <button key={v} onClick={() => setTimelineView(v)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${timelineView === v ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {label}
                </button>
              ))}
            </div>
            {timelineView === "day"
              ? <VerticalTimeline blocks={blocks} categories={categories} onUpdateBlock={handleUpdateBlock}
                  onSelectBlock={handleSelectBlock} selectedId={selBlock} onAddAtGap={handleAddAtGap} currentHour={currentHour} onDeselect={() => setSelBlock(null)} snapInterval={snapInterval} />
              : <ThreeDayView getBlocksForDay={(dateKey) => getEffectiveBlocks(state, dateKey)} categories={categories}
                  currentDate={currentDate} onNavigate={(d) => { nav(d); setTimelineView("day"); }} currentHour={currentHour} />
            }
          </div>

        <div className="pt-3" style={{ display: tab === "analytics" ? undefined : "none" }}>
          <AnalyticsView allData={state.days} categories={categories} tags={tags} currentDate={currentDate} />
        </div>
        <div className="pt-3" style={{ display: tab === "settings" ? undefined : "none" }}>
          <ExportView blocks={blocks} date={currentDate} allData={state.days} categories={categories} tags={tags}
            templates={templates} onLoadTemplate={handleLoadTemplate} onSaveTemplate={handleSaveTemplate} onDeleteTemplate={handleDeleteTemplate}
            onImportBlocks={handleImportBlocks} googleAuth={googleAuth} calendars={calendars} calId={calId}
            onCalIdChange={(id) => { setCalId(id); localStorage.setItem("gcal_cal_id", id); }}
            onSignIn={startGoogleSignIn} onSignOut={handleSignOut} syncStatus={syncStatus}
            onSyncNow={handleSyncNow} onBackupNow={handleBackupNow} onRestoreFromBackup={handleRestoreFromBackup}
            authError={authError} onClearAuthError={() => setAuthError("")}
            snapInterval={snapInterval} toggleSnap={toggleSnap} onClearAllBlocks={handleClearAllBlocks}
            onUpdateCategoryIcon={handleUpdateCategoryIcon}
            onUpdateCategory={handleUpdateCategory} onUpdateTag={handleUpdateTag}
            onDeleteCategory={handleDeleteCategory} onDeleteTag={handleDeleteTag}
            onAddCat={handleAddCat} onAddTag={handleAddTag}
            onReorderCategories={handleReorderCategories} onReorderTags={handleReorderTags} />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-2xl shadow-xl pointer-events-none"
          style={{ bottom: "calc(72px + env(safe-area-inset-bottom, 0px) + 16px)" }}>
          {toast}
        </div>
      )}

      {/* FAB */}
      {(tab === "rhythm" || (tab === "timeline" && timelineView === "day")) && (
        <button onClick={() => { setEditBlock(null); setPrefill(null); setShowEditor(true); }}
          className="fixed right-5 w-14 h-14 rounded-full bg-gray-900 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all z-40"
          style={{ bottom: "calc(72px + env(safe-area-inset-bottom, 0px) + 12px)", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          <Plus size={24} />
        </button>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabItems.map((t) => {
          const I = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${active ? "text-gray-900" : "text-gray-400"}`}>
              <I size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      {showEditor && (
        <BlockEditor block={editBlock} categories={categories} tags={tags}
          onSave={handleSaveBlock} onDelete={handleDeleteBlock} onDeleteRecurring={handleDeleteRecurring} onDuplicate={handleDuplicateBlock} onClose={() => { setShowEditor(false); setEditBlock(null); setPrefill(null); setSelBlock(null); }}
          onAddCat={handleAddCat} onAddTag={handleAddTag}
          prefillStart={prefill?.start} prefillEnd={prefill?.end} snapInterval={snapInterval} />
      )}
      {showDatePicker && (
        <DatePickerModal currentDate={currentDate}
          onChange={(d) => { setCurrentDate(d); setSelBlock(null); }}
          onClose={() => setShowDatePicker(false)} />
      )}

      {/* Drive restore prompt */}
      {restoreBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setRestoreBackup(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'DM Sans'" }}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <Download size={22} className="text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Cloud Backup Found</h3>
              <p className="text-sm text-gray-500">A backup with {Object.keys(restoreBackup.days || {}).length} days was found in Google Drive. Restore it?</p>
              <p className="text-xs text-gray-400">Your current local data will be replaced.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRestoreBackup(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                Keep Local
              </button>
              <button onClick={() => { setState(restoreBackup); setRestoreBackup(null); setCurrentDate(new Date()); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
