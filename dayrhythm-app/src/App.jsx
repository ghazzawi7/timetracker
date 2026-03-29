import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
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
};

const ICON_NAMES = Object.keys(ICON_MAP);
const getIcon = (name) => ICON_MAP[name] || CircleDot;

// ════════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════════
const SK = "dayrhythm_v2";
const load = () => { try { return JSON.parse(localStorage.getItem(SK)) || null; } catch { return null; } };
const save = (d) => { try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} };

// ════════════════════════════════════════════
// DEFAULTS
// ════════════════════════════════════════════
const DEFAULT_CATEGORIES = [
  { id: "work", name: "Work", icon: "Briefcase", color: "#2563EB" },
  { id: "personal", name: "Personal", icon: "Heart", color: "#7C3AED" },
];

const DEFAULT_TAGS = [
  { id: "deep-work", name: "Deep Work", catId: "work" },
  { id: "meetings", name: "Meetings", catId: "work" },
  { id: "admin", name: "Admin", catId: "work" },
  { id: "exercise", name: "Exercise", catId: "personal" },
  { id: "family", name: "Family", catId: "personal" },
  { id: "meals", name: "Meals", catId: "personal" },
  { id: "learning", name: "Learning", catId: "personal" },
  { id: "rest", name: "Rest", catId: "personal" },
];

function initState() {
  const saved = load();
  if (saved && saved.version === 2) return { recurring: [], ...saved };
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
    { id: id++, start: 6, end: 7, catId: "personal", tagId: "exercise", title: "Morning Workout", color: "#7C3AED" },
    { id: id++, start: 7, end: 8, catId: "personal", tagId: "meals", title: "Breakfast", color: "#F59E0B" },
    { id: id++, start: 8, end: 10, catId: "work", tagId: "deep-work", title: "Strategic Planning", color: "#2563EB" },
    { id: id++, start: 10, end: 11.5, catId: "work", tagId: "meetings", title: "Team Calls", color: "#0891B2" },
    { id: id++, start: 11.5, end: 13, catId: "work", tagId: "deep-work", title: "Execution", color: "#2563EB" },
    { id: id++, start: 13, end: 14, catId: "personal", tagId: "meals", title: "Lunch", color: "#F59E0B" },
    { id: id++, start: 14, end: 16, catId: "work", tagId: "meetings", title: "Stakeholders", color: "#0891B2" },
    { id: id++, start: 16, end: 17.5, catId: "work", tagId: "admin", title: "Email & Admin", color: "#6366F1" },
    { id: id++, start: 18, end: 19, catId: "personal", tagId: "family", title: "Family Time", color: "#EC4899" },
    { id: id++, start: 19, end: 20, catId: "personal", tagId: "meals", title: "Dinner", color: "#F59E0B" },
    { id: id++, start: 20, end: 21, catId: "personal", tagId: "learning", title: "Reading", color: "#8B5CF6" },
    { id: id++, start: 22, end: 6, catId: "personal", tagId: "rest", title: "Sleep", color: "#1E293B" },
  ];
}
function seedWeekend() {
  let id = 1;
  return [
    { id: id++, start: 7, end: 8, catId: "personal", tagId: "exercise", title: "Morning Run", color: "#10B981" },
    { id: id++, start: 8, end: 9.5, catId: "personal", tagId: "meals", title: "Brunch", color: "#F59E0B" },
    { id: id++, start: 9.5, end: 12, catId: "personal", tagId: "family", title: "Family Outing", color: "#EC4899" },
    { id: id++, start: 12, end: 13, catId: "personal", tagId: "meals", title: "Lunch", color: "#F59E0B" },
    { id: id++, start: 14, end: 16, catId: "personal", tagId: "rest", title: "Relaxation", color: "#8B5CF6" },
    { id: id++, start: 16, end: 18, catId: "work", tagId: "deep-work", title: "Side Project", color: "#2563EB" },
    { id: id++, start: 18, end: 20, catId: "personal", tagId: "family", title: "Family Dinner", color: "#EC4899" },
    { id: id++, start: 22, end: 7, catId: "personal", tagId: "rest", title: "Sleep", color: "#1E293B" },
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
// HELPERS
// ════════════════════════════════════════════
const fmt = (h) => {
  const hr = Math.floor(h) % 24, mn = Math.round((h % 1) * 60);
  const s = hr >= 12 ? "PM" : "AM", d = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return mn > 0 ? `${d}:${String(mn).padStart(2, "0")} ${s}` : `${d} ${s}`;
};
const dur = (a, b) => (b > a ? b - a : 24 - a + b);
const dk = (d) => d.toISOString().split("T")[0];
const fd = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const snap30 = (v) => Math.round(v * 2) / 2;
const snapTo = (v, interval) => Math.round(v / interval) * interval;
const getTagIds = (block) => block?.tagIds || (block?.tagId ? [block.tagId] : []);
const luminance = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
};
const textColor = (hex) => {
  try { return luminance(hex) > 0.55 ? "#1E293B" : "#FFFFFF"; } catch { return "#FFFFFF"; }
};

// ════════════════════════════════════════════
// ICS
// ════════════════════════════════════════════
function genICS(blocks, date) {
  const p = (n) => String(n).padStart(2, "0");
  const iD = (date, h) => { const d = new Date(date); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(Math.floor(h))}${p(Math.round((h % 1) * 60))}00`; };
  let s = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DayRhythm//EN\n";
  blocks.forEach((b) => { s += `BEGIN:VEVENT\nDTSTART:${iD(date, b.start)}\nDTEND:${iD(date, b.end > b.start ? b.end : b.end + 24)}\nSUMMARY:${b.title}\nEND:VEVENT\n`; });
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
// ICON PICKER
// ════════════════════════════════════════════
function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = ICON_NAMES.filter((n) => n.toLowerCase().includes(search.toLowerCase())).slice(0, 60);
  const Sel = getIcon(value);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <Sel size={18} className="text-gray-700" />
        <span className="text-xs text-gray-500">{value}</span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 w-72">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons..."
              className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
            {filtered.map((name) => {
              const I = ICON_MAP[name];
              return (
                <button key={name} onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${value === name ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-600"}`}
                  title={name}><I size={16} /></button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// TREND SUMMARY (7-day rolling, Rhythm tab)
// ════════════════════════════════════════════
function TrendSummary({ allData, categories, currentDate }) {
  const rows = useMemo(() => {
    // Build 7 day keys ending on currentDate
    const keys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - (6 - i));
      return dk(d);
    });
    // And the previous 7-day window for comparison
    const prevKeys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - (13 - i));
      return dk(d);
    });
    return categories.map((cat) => {
      const thisWeek = keys.reduce((s, k) => s + (allData[k]?.blocks || []).filter((b) => b.catId === cat.id).reduce((x, b) => x + dur(b.start, b.end), 0), 0);
      const lastWeek = prevKeys.reduce((s, k) => s + (allData[k]?.blocks || []).filter((b) => b.catId === cat.id).reduce((x, b) => x + dur(b.start, b.end), 0), 0);
      return { cat, thisWeek, lastWeek };
    }).filter((r) => r.thisWeek > 0 || r.lastWeek > 0);
  }, [allData, categories, currentDate]);

  if (rows.length === 0) return null;
  const maxHrs = Math.max(...rows.map((r) => Math.max(r.thisWeek, r.lastWeek)), 1);

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-700">This week</span>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-gray-800" />This</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-gray-200" />Last</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {rows.map(({ cat, thisWeek, lastWeek }) => {
          const delta = thisWeek - lastWeek;
          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] font-medium text-gray-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-900">{thisWeek.toFixed(1)}h</span>
                  {delta !== 0 && (
                    <span className={`text-[10px] font-semibold ${delta > 0 ? "text-emerald-500" : "text-red-400"}`}>
                      {delta > 0 ? "+" : ""}{delta.toFixed(1)}h
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                {/* Last week bar (background) */}
                <div className="absolute inset-y-0 left-0 bg-gray-200 rounded-full"
                  style={{ width: `${(lastWeek / maxHrs) * 100}%` }} />
                {/* This week bar (foreground) */}
                <div className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{ width: `${(thisWeek / maxHrs) * 100}%`, backgroundColor: cat.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
  const size = 380;
  const cx = size / 2, cy = size / 2;
  const oR = 148, iR = 78;

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
      const edgeZone = Math.max(0.25, blockDur * 0.2);
      if (offset < edgeZone) resolvedMode = "start";
      else if (offset > blockDur - edgeZone) resolvedMode = "end";
    }

    const data = { block, mode: resolvedMode, startHour: pressHour, origStart: block.start, origEnd: block.end };

    if (resolvedMode !== "move") {
      // Edge zone: immediate resize
      dragRef.current = data;
      return;
    }

    // Middle zone: 400ms hold to enter move/drag
    pendingRef.current = { ...data, startPt: pt };
    holdTimerRef.current = setTimeout(() => {
      if (pendingRef.current) {
        dragRef.current = pendingRef.current;
        pendingRef.current = null;
        setDraggingId(block.id);
        try { navigator.vibrate?.(30); } catch {}
      }
    }, 400);
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
      if (Math.sqrt(dx * dx + dy * dy) > 8) {
        clearTimeout(holdTimerRef.current);
        pendingRef.current = null;
      }
      return;
    }
    if (!dragRef.current) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    const hr = angleToHour(pt.x, pt.y);
    const d = dragRef.current;
    const delta = hr - d.startHour;
    const si = snapIntervalRef.current;
    if (d.mode === "move") {
      const ns = snapTo((d.origStart + delta + 24) % 24, si);
      const ne = snapTo((d.origEnd + delta + 24) % 24, si);
      if (noOverlap(d.block.id, ns, ne)) onUpdateBlock(d.block.id, { start: ns, end: ne });
    } else if (d.mode === "start") {
      const ns = snapTo((d.origStart + delta + 24) % 24, si);
      if (noOverlap(d.block.id, ns, d.origEnd)) onUpdateBlock(d.block.id, { start: ns });
    } else if (d.mode === "end") {
      const ne = snapTo((d.origEnd + delta + 24) % 24, si);
      if (noOverlap(d.block.id, d.origStart, ne)) onUpdateBlock(d.block.id, { end: ne });
    }
  }, [onUpdateBlock, noOverlap]);

  const handlePointerUp = useCallback(() => {
    clearTimeout(holdTimerRef.current);
    if (pendingRef.current) {
      onSelectBlock(pendingRef.current.block.id);
      pendingRef.current = null;
    }
    setDraggingId(null);
    dragRef.current = null;
    swipeRef.current = null;
  }, [onSelectBlock]);

  // Background swipe → navigate day (only fires when not interacting with a block)
  const handleBgTouchStart = (e) => {
    if (dragRef.current || pendingRef.current) return;
    const t = e.touches[0];
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
    };
  }, [handlePointerMove, handlePointerUp]);

  const nowAngle = hA(currentHour);
  const handInner = ptc(oR - 2, nowAngle);
  const handOuter = ptc(oR + 22, nowAngle);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${size} ${size}`} className="w-full select-none touch-none"
      style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.07))", willChange: "transform" }}
      onTouchStart={handleBgTouchStart} onTouchEnd={handleBgTouchEnd}>
      <defs>
        <radialGradient id="bg2"><stop offset="0%" stopColor="#FAFBFC" /><stop offset="100%" stopColor="#F1F5F9" /></radialGradient>
        <filter id="gl2"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="active"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <style>{`@keyframes dr-pulse{0%,100%{opacity:0.3}50%{opacity:0.75}}`}</style>
      </defs>

      <circle cx={cx} cy={cy} r={oR + 6} fill="url(#bg2)" stroke="#E2E8F0" strokeWidth="0.8" onClick={onDeselect} style={{ cursor: "default" }} />
      <circle cx={cx} cy={cy} r={iR - 6} fill="white" stroke="#E2E8F0" strokeWidth="0.5" onClick={onDeselect} style={{ cursor: "pointer" }} />

      {/* 24-hour tick marks with 12h labels + AM/PM color coding */}
      {Array.from({ length: 24 }, (_, h) => {
        const a = hA(h);
        const major = h % 6 === 0;
        const mid = h % 3 === 0;
        const p1 = ptc(oR + 2, a);
        const p2 = ptc(oR - (major ? 7 : mid ? 4 : 2), a);
        const lp = ptc(oR + (major ? 21 : 17), a);
        const showLabel = h % 2 === 0;
        const isAM = h < 12;
        const h12 = h % 12 === 0 ? "12" : `${h % 12}`;
        const amLabel = h === 0 ? "am" : h === 12 ? "pm" : null;
        const labelColor = major ? (isAM ? "#475569" : "#78716C") : (isAM ? "#94A3B8" : "#A8917A");
        return (
          <g key={h}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={major ? (isAM ? "#64748B" : "#78716C") : mid ? "#CBD5E1" : "#E2E8F0"}
              strokeWidth={major ? 1.5 : mid ? 0.8 : 0.5} />
            {showLabel && (
              <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
                fontSize={major ? "8" : "6"} fontWeight={major ? "700" : "400"}
                fill={labelColor} style={{ fontFamily: "'DM Sans'" }}>
                {h12}
              </text>
            )}
            {amLabel && (
              <text x={ptc(oR + 30, a).x} y={ptc(oR + 30, a).y}
                textAnchor="middle" dominantBaseline="central"
                fontSize="5.5" fontWeight="600"
                fill={isAM ? "#94A3B8" : "#A8917A"}
                style={{ fontFamily: "'DM Sans'" }}>
                {amLabel}
              </text>
            )}
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
        const norm = ((midA % 360) + 360) % 360;
        // Use radial rotation for narrow arcs (fits ring width), tangential for wide
        const arcLen = ((ea - sa) * Math.PI / 180) * ((oR + iR) / 2);
        const useRadial = arcLen < 55;
        const textRot = useRadial
          ? (norm > 180 ? norm - 270 : norm - 90)
          : ((norm > 90 && norm < 270) ? norm - 180 : norm);
        const maxChars = useRadial ? 9 : Math.max(4, Math.floor(arcLen / 8));
        const fontSize = blockDur >= 3 ? "10" : blockDur >= 1.5 ? "9" : "7.5";
        const isDragging = draggingId === block.id;

        return (
          <g key={block.id}>
            {isActive && (
              <path d={arc(sa, ea, oR + 5, oR + 1)} fill="none" stroke={color} strokeWidth="3"
                style={{ animation: "dr-pulse 2s ease-in-out infinite" }} />
            )}
            <path d={arc(sa, ea, oR, iR)} fill={color}
              opacity={isDragging ? 1 : sel ? 1 : block._fromRecurring ? 0.65 : 0.85}
              stroke={isDragging ? "white" : sel ? "#0F172A" : block._fromRecurring ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)"}
              strokeWidth={isDragging ? 4 : sel ? 2.5 : block._fromRecurring ? 1.5 : 0.8}
              strokeDasharray={block._fromRecurring ? "4 2" : undefined}
              filter={isDragging ? "url(#gl2)" : isActive ? "url(#active)" : undefined}
              style={{ cursor: block._fromRecurring ? "pointer" : isDragging ? "grabbing" : "grab" }}
              onMouseDown={(e) => handlePointerDown(e, block, "move")}
              onTouchStart={(e) => handlePointerDown(e, block, "move")} />

            {/* Block title — radial for narrow arcs, tangential for wide */}
            {blockDur >= 0.5 && arcLen > 12 && (
              <text x={midP.x} y={midP.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={fontSize} fontWeight="600" fill={tc}
                transform={`rotate(${textRot},${midP.x},${midP.y})`}
                style={{ pointerEvents: "none", fontFamily: "'DM Sans'" }}>
                {block.title.length > maxChars ? block.title.slice(0, maxChars - 1) + "…" : block.title}
              </text>
            )}

            {/* Resize handle dots — shown when selected, edge-draggable */}
            <circle cx={startP.x} cy={startP.y} r="6" fill={color} stroke="white" strokeWidth="2"
              style={{ cursor: "ew-resize" }} opacity={sel ? 1 : 0}
              onMouseDown={(e) => handlePointerDown(e, block, "start")}
              onTouchStart={(e) => handlePointerDown(e, block, "start")} />
            <circle cx={endP.x} cy={endP.y} r="6" fill={color} stroke="white" strokeWidth="2"
              style={{ cursor: "ew-resize" }} opacity={sel ? 1 : 0}
              onMouseDown={(e) => handlePointerDown(e, block, "end")}
              onTouchStart={(e) => handlePointerDown(e, block, "end")} />
          </g>
        );
      })}

      {/* Current time notch on outer bezel — black */}
      <line x1={handInner.x} y1={handInner.y} x2={handOuter.x} y2={handOuter.y}
        stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />

      {/* Center content — vertically centered as a group */}
      <text x={cx} y={cy - 9} textAnchor="middle" dominantBaseline="central"
        fontSize="21" fontWeight="700" fill="#0F172A" style={{ fontFamily: "'DM Sans'" }}>
        {fmt(currentHour)}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" dominantBaseline="central"
        fontSize="10" fontWeight="600" fill="#94A3B8" style={{ fontFamily: "'DM Sans'" }}>
        {remainingHrs.toFixed(1)}h free
      </text>
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

  const days = useMemo(() => [-1, 0, 1].map((offset) => {
    const d = new Date(currentDate); d.setDate(d.getDate() + offset);
    const key = dk(d);
    return {
      key, offset,
      label: offset === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
      blocks: getBlocksForDay(key),
      isToday: offset === 0,
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
      <div ref={contRef} className="flex-1 overflow-y-auto relative">
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
    <div ref={contRef} className="relative overflow-y-auto" style={{ height: "calc(100vh - 130px - 72px - env(safe-area-inset-bottom, 0px))" }} onClick={onDeselect}>
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
          <div key={`gap-${i}`} className="absolute left-14 right-2 flex items-center justify-center cursor-pointer group rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
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
          const CatIcon = cat ? getIcon(cat.icon) : CircleDot;
          const sel = selectedId === block.id;
          const isActive = currentHour >= block.start && currentHour < block.start + blockDur;

          return (
            <div key={block.id} className="absolute left-14 right-2 rounded-sm overflow-hidden select-none touch-none"
              style={{ top, height, backgroundColor: color, opacity: sel ? 1 : block._fromRecurring ? 0.72 : 0.88, boxShadow: sel ? "0 0 0 2.5px #0F172A" : isActive ? `0 0 0 2px ${color}, 0 0 12px ${color}40` : "0 1px 3px rgba(0,0,0,0.08)", border: block._fromRecurring ? "1.5px dashed rgba(255,255,255,0.7)" : undefined, zIndex: sel ? 10 : isActive ? 5 : 3, transition: "box-shadow 0.2s" }}
              onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}>
              {/* Top drag handle */}
              <div className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize flex justify-center items-center"
                onMouseDown={(e) => handleDown(e, block, "top")} onTouchStart={(e) => handleDown(e, block, "top")}>
                {sel && <div className="w-8 h-1 rounded-full bg-white opacity-60" />}
              </div>
              {/* Content */}
              <div className="px-3 py-1.5 flex items-center gap-2 cursor-grab"
                onMouseDown={(e) => handleDown(e, block, "move")} onTouchStart={(e) => handleDown(e, block, "move")}>
                <CatIcon size={14} color={tc} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: tc }}>{block.title}</div>
                  {blockDur >= 1 && <div className="text-[10px] opacity-70" style={{ color: tc }}>{fmt(block.start)} – {fmt(block.end)}</div>}
                </div>
                {block._fromRecurring && <span className="text-[10px] opacity-60" style={{ color: tc }}>↻</span>}
                <span className="text-[10px] font-bold opacity-60" style={{ color: tc }}>{blockDur.toFixed(1)}h</span>
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
  const [catId, setCatId] = useState(block?.catId || categories[0]?.id || "");
  const [tagIds, setTagIds] = useState(getTagIds(block));
  const toggleTag = (id) => setTagIds((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 2 ? [...prev, id] : prev);
  const [color, setColor] = useState(block?.color || categories.find((c) => c.id === (block?.catId || categories[0]?.id))?.color || "#2563EB");
  const [sH, setSH] = useState(block?.start ?? prefillStart ?? 9);
  const [eH, setEH] = useState(block?.end ?? prefillEnd ?? 10);
  const [repeat, setRepeat] = useState(block?.repeat || "none");

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Star");
  const [newCatColor, setNewCatColor] = useState("#2563EB");

  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const ftags = tags.filter((t) => t.catId === catId || !t.catId);
  const timeOpts = Array.from({ length: Math.round(24 / snapInterval) }, (_, i) => i * snapInterval);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 pb-7 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Deep Work Session" />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                  <button key={c.id} onClick={() => { setCatId(c.id); setColor(c.color); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${catId === c.id ? "text-white shadow-md" : "bg-gray-100 text-gray-600"}`}
                    style={catId === c.id ? { backgroundColor: c.color } : {}}>
                    {c.name}
                  </button>
                ))}
              <button onClick={() => setShowNewCat(!showNewCat)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-400 hover:bg-gray-100 border border-dashed border-gray-200">
                <Plus size={14} /> New
              </button>
            </div>
            {showNewCat && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl space-y-2">
                <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category name"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <div className="flex gap-2 items-center">
                  <IconPicker value={newCatIcon} onChange={setNewCatIcon} />
                  <ColorPicker value={newCatColor} onChange={setNewCatColor} />
                </div>
                <button onClick={() => {
                  if (newCatName.trim()) {
                    const nc = { id: uid(), name: newCatName.trim(), icon: newCatIcon, color: newCatColor };
                    onAddCat(nc);
                    setCatId(nc.id);
                    setColor(nc.color);
                    setNewCatName(""); setShowNewCat(false);
                  }
                }} className="w-full py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold">Add Category</button>
              </div>
            )}
          </div>

          {/* Tags (up to 2) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tags</label>
              <span className="text-[10px] text-gray-300">{tagIds.length}/2</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ftags.map((t) => {
                const sel = tagIds.includes(t.id);
                const disabled = !sel && tagIds.length >= 2;
                return (
                  <button key={t.id} onClick={() => toggleTag(t.id)} disabled={disabled}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${sel ? "bg-gray-900 text-white" : disabled ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-gray-100 text-gray-600"}`}>
                    {t.name}
                  </button>
                );
              })}
              <button onClick={() => setShowNewTag(!showNewTag)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 hover:bg-gray-100 border border-dashed border-gray-200">
                <Plus size={12} /> New
              </button>
            </div>
            {showNewTag && (
              <div className="mt-2 flex gap-2">
                <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Tag name"
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button onClick={() => {
                  if (newTagName.trim()) {
                    onAddTag({ id: uid(), name: newTagName.trim(), catId });
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

          {/* Color */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Block Color</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Start</label>
              <select value={sH} onChange={(e) => setSH(parseFloat(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                {timeOpts.map((h) => <option key={h} value={h}>{fmt(h)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">End</label>
              <select value={eH} onChange={(e) => setEH(parseFloat(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                {timeOpts.map((h) => <option key={h} value={h}>{fmt(h)}</option>)}
              </select>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">Duration: {dur(sH, eH).toFixed(1)}h</p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {block?.id && !isRecurring && (
              <div className="flex gap-1.5">
                <button onClick={() => onDuplicate(block)}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200">
                  <Copy size={14} /> Copy
                </button>
                <button onClick={() => onDelete(block.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100">
                  <Trash2 size={15} />
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
            <button onClick={() => onSave({ ...block, id: block?.id || uid(), title: title || "Untitled", catId, tagIds, color, start: sH, end: eH, repeat })}
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
function AnalyticsView({ allData, categories, tags, currentDate }) {
  const weekData = useMemo(() => {
    const r = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentDate); d.setDate(d.getDate() - i);
      const day = allData[dk(d)];
      const entry = { name: d.toLocaleDateString("en-US", { weekday: "short" }) };
      categories.forEach((c) => { entry[c.name] = 0; });
      day?.blocks?.forEach((b) => {
        const cat = categories.find((c) => c.id === b.catId);
        if (cat) entry[cat.name] = +(entry[cat.name] + dur(b.start, b.end)).toFixed(1);
      });
      r.push(entry);
    }
    return r;
  }, [allData, currentDate, categories]);

  const monthData = useMemo(() => {
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const entry = { name: `Wk ${4 - w}` };
      categories.forEach((c) => { entry[c.name] = 0; });
      let days = 0;
      for (let d = 0; d < 7; d++) {
        const dt = new Date(currentDate); dt.setDate(dt.getDate() - (w * 7 + d));
        const day = allData[dk(dt)];
        if (day) {
          days++;
          day.blocks.forEach((b) => {
            const cat = categories.find((c) => c.id === b.catId);
            if (cat) entry[cat.name] += dur(b.start, b.end);
          });
        }
      }
      const n = Math.max(days, 1);
      categories.forEach((c) => { entry[c.name] = +(entry[c.name] / n).toFixed(1); });
      weeks.push(entry);
    }
    return weeks;
  }, [allData, currentDate, categories]);

  const catTotals = useMemo(() => {
    const t = {};
    categories.forEach((c) => { t[c.id] = { name: c.name, color: c.color, hours: 0 }; });
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate); d.setDate(d.getDate() - i);
      allData[dk(d)]?.blocks?.forEach((b) => { if (t[b.catId]) t[b.catId].hours += dur(b.start, b.end); });
    }
    return Object.values(t).sort((a, b) => b.hours - a.hours);
  }, [allData, currentDate, categories]);

  const tagBD = useMemo(() => {
    const t = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate); d.setDate(d.getDate() - i);
      allData[dk(d)]?.blocks?.forEach((b) => { getTagIds(b).forEach((tid) => { t[tid] = (t[tid] || 0) + dur(b.start, b.end); }); });
    }
    return Object.entries(t).map(([id, hours]) => {
      const tag = tags.find((x) => x.id === id);
      const cat = categories.find((c) => c.id === tag?.catId);
      return { name: tag?.name || id, hours: +hours.toFixed(1), color: cat?.color || "#94A3B8" };
    }).sort((a, b) => b.hours - a.hours);
  }, [allData, currentDate, tags, categories]);

  const totalH = catTotals.reduce((s, c) => s + c.hours, 0);

  const weekGrid = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentDate); d.setDate(d.getDate() - 6 + i);
      const key = dk(d);
      const dayBlocks = allData[key]?.blocks || [];
      const total = dayBlocks.reduce((s, b) => s + dur(b.start, b.end), 0);
      const segs = categories.map((c) => ({ color: c.color, hours: dayBlocks.filter((b) => b.catId === c.id).reduce((s, b) => s + dur(b.start, b.end), 0) })).filter((s) => s.hours > 0);
      const isToday = key === dk(new Date());
      return { d, key, total, segs, isToday, label: d.toLocaleDateString("en-US", { weekday: "short" }) };
    });
  }, [allData, currentDate, categories]);

  return (
    <div className="space-y-4 pb-28" style={{ fontFamily: "'DM Sans'" }}>

      {/* Weekly inventory grid */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h4 className="text-xs font-bold text-gray-700 mb-3">Week at a glance</h4>
        <div className="grid grid-cols-7 gap-1">
          {weekGrid.map(({ label, total, segs, isToday }) => {
            const maxH = Math.max(...weekGrid.map((d) => d.total), 1);
            const barH = 56; // px height of bar area
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className={`text-[9px] font-bold uppercase ${isToday ? "text-blue-500" : "text-gray-400"}`}>{label}</span>
                <div className="w-full rounded-md overflow-hidden flex flex-col-reverse" style={{ height: barH, backgroundColor: "#F1F5F9" }}>
                  {segs.map((seg, i) => (
                    <div key={i} style={{ height: `${(seg.hours / maxH) * barH}px`, backgroundColor: seg.color, flexShrink: 0 }} />
                  ))}
                </div>
                <span className={`text-[9px] font-semibold tabular-nums ${isToday ? "text-blue-500" : "text-gray-400"}`}>
                  {total > 0 ? `${total.toFixed(0)}h` : ""}
                </span>
              </div>
            );
          })}
        </div>
        {/* Category legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: c.color }} />
              <span className="text-[9px] text-gray-400 font-medium">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {catTotals.map((c) => (
          <div key={c.name} className="flex-shrink-0 rounded-2xl p-3 min-w-[90px] text-center" style={{ backgroundColor: c.color + "18" }}>
            <div className="text-lg font-bold" style={{ color: c.color }}>{c.hours.toFixed(0)}h</div>
            <div className="text-[10px] font-medium opacity-60" style={{ color: c.color }}>{c.name} (7d)</div>
          </div>
        ))}
        <div className="flex-shrink-0 bg-gray-50 rounded-2xl p-3 min-w-[90px] text-center">
          <div className="text-lg font-bold text-gray-900">{totalH.toFixed(0)}h</div>
          <div className="text-[10px] text-gray-400 font-medium">Total (7d)</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-3">This Week</h4>
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={weekData} barGap={1}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#CBD5E1" }} axisLine={false} tickLine={false} width={22} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
            {categories.map((c, i) => (
              <Bar key={c.id} dataKey={c.name} stackId="a" fill={c.color}
                radius={i === categories.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-3">Monthly Trend (Avg/Day)</h4>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={monthData}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#CBD5E1" }} axisLine={false} tickLine={false} width={22} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
            {categories.map((c) => (
              <Area key={c.id} type="monotone" dataKey={c.name} stackId="1" stroke={c.color} fill={c.color + "30"} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-3">By Tag (7d)</h4>
        <div className="space-y-1.5">
          {tagBD.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-[72px] text-[11px] text-gray-600 font-medium truncate">{item.name}</div>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, tagBD.length > 0 ? (item.hours / Math.max(...tagBD.map((t) => t.hours))) * 100 : 0)}%`, backgroundColor: item.color }} />
              </div>
              <div className="w-10 text-right text-[11px] font-semibold text-gray-500">{item.hours}h</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  const toEvent = (b) => JSON.stringify({ summary: b.title, start: { dateTime: toISO(b.start), timeZone: tz }, end: { dateTime: toISO(b.end > b.start ? b.end : b.end + 24), timeZone: tz }, description: `DayRhythm|${b.catId}|${getTagIds(b).join(",")}|${b.color}` });
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
      if (b.title !== p.title || b.start !== p.start || b.end !== p.end || b.catId !== p.catId || b.color !== p.color) {
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
    const newTitle = ev.summary || block.title;
    if (newStart !== block.start || newEnd !== block.end || newTitle !== block.title) {
      updatedBlocks.push({ ...block, start: newStart, end: newEnd, title: newTitle });
    }
  }
  // 3. New events in Google Calendar with no matching local block
  const trackedIds = new Set(currentBlocks.filter((b) => b.gcalEventId).map((b) => b.gcalEventId));
  const newBlocks = [];
  for (const [evId, ev] of gcalMap) {
    if (trackedIds.has(evId)) continue;
    const s = new Date(ev.start.dateTime), e = new Date(ev.end.dateTime);
    const newStart = snap30(s.getHours() + s.getMinutes() / 60);
    const newEnd = snap30(e.getHours() + e.getMinutes() / 60);
    const parts = (ev.description || "").split("|");
    const isDR = parts[0] === "DayRhythm";
    const rawTags = isDR ? parts[2] : "";
    newBlocks.push({
      id: uid(),
      title: ev.summary || "Untitled",
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
// GOOGLE CALENDAR SYNC UI
// ════════════════════════════════════════════
function GoogleCalSync({ date, onImportBlocks, onTokenChange, onCalIdChange, syncStatus }) {
  const [clientId, setClientId] = useState(() => localStorage.getItem("gcal_client_id") || "");
  const [draftId, setDraftId] = useState("");
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("gcal_token");
    const exp = localStorage.getItem("gcal_token_exp");
    return t && exp && Date.now() < parseInt(exp) ? t : null;
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalId, setSelectedCalId] = useState(() => localStorage.getItem("gcal_cal_id") || "primary");
  const tokenClientRef = useRef(null);

  const initClient = useCallback((id) => {
    if (!window.google || !id) return;
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: id,
      scope: "https://www.googleapis.com/auth/calendar",
      callback: (resp) => {
        if (resp.access_token) {
          const tk = resp.access_token;
          setToken(tk);
          localStorage.setItem("gcal_token", tk);
          localStorage.setItem("gcal_token_exp", String(Date.now() + resp.expires_in * 1000 - 60000));
          setStatus("Connected");
          onTokenChange(tk);
          fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            headers: { Authorization: `Bearer ${tk}` },
          }).then((r) => r.json()).then((data) => {
            const cals = (data.items || []).filter((c) => ["owner", "writer"].includes(c.accessRole));
            setCalendars(cals);
            // Auto-select "Routine" calendar if no specific calendar chosen yet
            const savedId = localStorage.getItem("gcal_cal_id");
            if (!savedId || savedId === "primary") {
              const routine = cals.find((c) => c.summary?.toLowerCase() === "routine");
              if (routine) {
                setSelectedCalId(routine.id);
                localStorage.setItem("gcal_cal_id", routine.id);
                onCalIdChange(routine.id);
              }
            }
          }).catch(() => {});
        } else {
          setStatus("Auth failed — check your Client ID");
        }
      },
    });
  }, [onTokenChange]);

  useEffect(() => {
    if (!token) return;
    fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()).then((data) => {
      setCalendars((data.items || []).filter((c) => ["owner", "writer"].includes(c.accessRole)));
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!clientId) return;
    if (window.google?.accounts) { initClient(clientId); return; }
    if (document.getElementById("gis-script")) return;
    const s = document.createElement("script");
    s.id = "gis-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => initClient(clientId);
    document.head.appendChild(s);
  }, [clientId, initClient]);

  const connect = () => tokenClientRef.current?.requestAccessToken({ prompt: token ? "" : "consent" });

  const disconnect = () => {
    if (token) window.google?.accounts.oauth2.revoke(token, () => {});
    setToken(null);
    setCalendars([]);
    localStorage.removeItem("gcal_token");
    localStorage.removeItem("gcal_token_exp");
    setStatus("Disconnected");
    onTokenChange(null);
  };

  const gcalFetch = (url, opts = {}) =>
    fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts.headers || {}) } });

  const importDay = async () => {
    setLoading(true); setStatus("Importing…");
    try {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(selectedCalId)}/events?timeMin=${encodeURIComponent(start.toISOString())}&timeMax=${encodeURIComponent(end.toISOString())}&singleEvents=true&orderBy=startTime`;
      const res = await gcalFetch(url);
      if (res.status === 401) { setStatus("Session expired — reconnect"); setToken(null); onTokenChange(null); setLoading(false); return; }
      const data = await res.json();
      const imported = (data.items || [])
        .filter((ev) => ev.start?.dateTime)
        .map((ev) => {
          const s = new Date(ev.start.dateTime), e = new Date(ev.end.dateTime);
          const sh = snap30(s.getHours() + s.getMinutes() / 60);
          const eh = snap30(e.getHours() + e.getMinutes() / 60);
          const parts = (ev.description || "").split("|");
          const isDR = parts[0] === "DayRhythm";
          return { id: uid(), title: ev.summary || "Event", start: sh, end: eh, catId: isDR ? parts[1] : "personal", tagId: isDR ? parts[2] : "", color: isDR ? parts[3] : "#2563EB", gcalEventId: ev.id };
        });
      onImportBlocks(imported);
      setStatus(`✓ ${imported.length} events imported`);
    } catch { setStatus("Import failed — check connection"); }
    setLoading(false);
  };

  if (!clientId) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3" style={{ fontFamily: "'DM Sans'" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><RefreshCw size={16} className="text-blue-500" /></div>
          <h4 className="text-base font-bold text-gray-900">Google Calendar Live Sync</h4>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">Paste your Google OAuth 2.0 Client ID to enable 2-way sync with Google Calendar.</p>
        <input value={draftId} onChange={(e) => setDraftId(e.target.value)} placeholder="xxxxxxx.apps.googleusercontent.com"
          className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" />
        <button onClick={() => { const v = draftId.trim(); if (!v) return; localStorage.setItem("gcal_client_id", v); setClientId(v); }}
          className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          Connect
        </button>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Don't have a Client ID yet?{" "}
          <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">Open Google Cloud Console →</a>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3" style={{ fontFamily: "'DM Sans'" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><RefreshCw size={16} className="text-blue-500" /></div>
          <h4 className="text-base font-bold text-gray-900">Google Calendar</h4>
        </div>
        {token
          ? <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Connected</span>
          : <span className="text-xs text-gray-400">Not connected</span>}
      </div>
      {(syncStatus || status) && <p className={`text-xs font-medium ${(syncStatus || status).startsWith("✓") ? "text-green-600" : "text-gray-400"}`}>{syncStatus || status}</p>}
      {!token ? (
        <button onClick={connect} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          Sign in with Google
        </button>
      ) : (
        <div className="space-y-2">
          {calendars.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Calendar</label>
              <select
                value={selectedCalId}
                onChange={(e) => { setSelectedCalId(e.target.value); localStorage.setItem("gcal_cal_id", e.target.value); onCalIdChange(e.target.value); }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                {calendars.map((c) => (
                  <option key={c.id} value={c.id}>{c.summary}{c.primary ? " (primary)" : ""}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50">
            <RefreshCw size={13} className={`text-gray-400 flex-shrink-0 ${syncStatus === "Syncing…" ? "animate-spin" : ""}`} />
            <span className="text-xs text-gray-500">{syncStatus || "Auto-sync active — edits save instantly"}</span>
          </div>
          <button onClick={importDay} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
            <Download size={15} /> Pull from Google Calendar
          </button>
          <button onClick={disconnect} className="w-full py-2 rounded-xl text-xs text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
            Disconnect account
          </button>
        </div>
      )}
      <button onClick={() => { localStorage.removeItem("gcal_client_id"); setClientId(""); setToken(null); onTokenChange(null); setStatus(""); }}
        className="text-[11px] text-gray-300 hover:text-gray-400 transition-colors">
        Change Client ID
      </button>
    </div>
  );
}

// ════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════
function ExportView({ blocks, date, onImportBlocks, onTokenChange, onCalIdChange, syncStatus }) {
  const [exported, setExported] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);

  const handleICS = () => {
    const blob = new Blob([genICS(blocks, date)], { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `dayrhythm-${dk(date)}.ics`; a.click(); URL.revokeObjectURL(a.href);
    setExported(true); setTimeout(() => setExported(false), 2000);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseICS(ev.target.result, date);
        if (parsed.length === 0) { setImportMsg("No events found for this date"); return; }
        // Merge: skip blocks whose title+start already exist
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

  return (
    <div className="space-y-4 pb-28" style={{ fontFamily: "'DM Sans'" }}>
      <GoogleCalSync date={date} onImportBlocks={onImportBlocks} onTokenChange={onTokenChange} onCalIdChange={onCalIdChange} syncStatus={syncStatus} />
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
        <h4 className="text-base font-bold text-gray-900">Export / Import</h4>
        <p className="text-sm text-gray-500 leading-relaxed">Export today as .ics or import from any calendar app.</p>
        <button onClick={handleICS} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors">
          {exported ? <><Check size={16} /> Downloaded!</> : <><Download size={16} /> Export .ics for {fd(date)}</>}
        </button>
        <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors">
          <Upload size={16} /> Import .ics file
        </button>
        <input ref={fileRef} type="file" accept=".ics,text/calendar" className="hidden" onChange={handleImportFile} />
        {importMsg && <p className="text-xs text-center text-gray-500">{importMsg}</p>}
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
  const [tab, setTab] = useState("rhythm");
  const [selBlock, setSelBlock] = useState(null);
  const [editBlock, setEditBlock] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [gcalToken, setGcalToken] = useState(() => { const t = localStorage.getItem("gcal_token"); const exp = localStorage.getItem("gcal_token_exp"); return t && exp && Date.now() < parseInt(exp) ? t : null; });
  const [gcalCalId, setGcalCalId] = useState(() => localStorage.getItem("gcal_cal_id") || "primary");
  const [syncStatus, setSyncStatus] = useState("");
  const [snapInterval, setSnapInterval] = useState(() => parseFloat(localStorage.getItem("snap_interval") || "0.5"));
  const toggleSnap = () => setSnapInterval((s) => { const n = s === 0.5 ? 0.25 : 0.5; localStorage.setItem("snap_interval", String(n)); return n; });
  const [timelineView, setTimelineView] = useState("day"); // "day" | "3day"

  const saveTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(state), 400);
    return () => clearTimeout(saveTimerRef.current);
  }, [state]);

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const currentHour = now.getHours() + now.getMinutes() / 60;

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
        await syncDiff(prevBlocks, dayBlocks, currentDate, gcalToken, gcalCalId, handleGcalBlockCreated);
        setSyncStatus("✓ Synced");
        setTimeout(() => setSyncStatus(""), 3000);
      } catch(e) {
        if (e?.message === "auth") {
          setGcalToken(null);
          localStorage.removeItem("gcal_token");
          localStorage.removeItem("gcal_token_exp");
          setSyncStatus("Session expired — reconnect in Sync tab");
        } else {
          console.error("GCal sync error:", e);
          setSyncStatus(`Sync failed: ${e?.message || "unknown error"}`);
        }
      }
      syncRef.current.blocks = dayBlocks;
    }, 1500);
    return () => clearTimeout(syncRef.current.timer);
  }, [dayBlocks, currentDate, gcalToken, gcalCalId, handleGcalBlockCreated]);

  useEffect(() => {
    if (!gcalToken || !gcalCalId) return;
    const dateKey = dk(currentDate);
    const runPull = async () => {
      try {
        const result = await pullSync(currentDate, gcalToken, gcalCalId, blocksRef.current);
        if (result) handleGcalPull(dateKey, result.deletedIds, result.updatedBlocks, result.newBlocks);
      } catch (e) {
        if (e?.message === "auth") {
          setGcalToken(null);
          localStorage.removeItem("gcal_token");
          localStorage.removeItem("gcal_token_exp");
          setSyncStatus("Session expired — reconnect in Sync tab");
        }
      }
    };
    runPull();
    const onVisibility = () => { if (!document.hidden) runPull(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [currentDate, gcalToken, gcalCalId, handleGcalPull]);
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
    setShowEditor(false); setEditBlock(null); setPrefill(null);
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
    const copy = { ...block, id: uid(), gcalEventId: undefined, _fromRecurring: undefined, title: block.title + " (copy)" };
    setState((prev) => {
      const dd = prev.days[key] || { theme: "", blocks: [] };
      const bs = [...dd.blocks, copy].sort((a, b) => a.start - b.start);
      return { ...prev, days: { ...prev.days, [key]: { ...dd, blocks: bs } } };
    });
    setEditBlock(copy);
    // editor stays open with the new copy
  };

  const handleUpdateBlock = useCallback((id, updates) => {
    setState((prev) => {
      const dd = prev.days[key] || { theme: "", blocks: [] };
      const bs = dd.blocks.map((b) => b.id === id ? { ...b, ...updates } : b);
      return { ...prev, days: { ...prev.days, [key]: { ...dd, blocks: bs } } };
    });
  }, [key]);

  const handleSelectBlock = useCallback((id) => {
    if (selBlock === id) {
      const b = blocks.find((bl) => bl.id === id);
      if (b) { setEditBlock(b); setShowEditor(true); }
    } else {
      setSelBlock(id);
    }
  }, [selBlock, blocks]);

  const handleAddAtGap = useCallback((start, end) => {
    setPrefill({ start, end });
    setEditBlock(null);
    setShowEditor(true);
  }, []);

  const handleAddCat = (cat) => updateState((s) => { s.categories.push(cat); return s; });
  const handleAddTag = (tag) => updateState((s) => { s.tags.push(tag); return s; });

  const handleLoadTemplate = (t) => {
    const newBlocks = t.blocks.map((b) => ({ ...b, id: uid() }));
    setDayBlocks(newBlocks);
    setShowTemplates(false);
  };
  const handleSaveTemplate = (name) => {
    updateState((s) => { s.templates.push({ id: uid(), name, blocks: blocks.map((b) => ({ ...b })) }); return s; });
  };
  const handleDeleteTemplate = (id) => {
    updateState((s) => { s.templates = s.templates.filter((t) => t.id !== id); return s; });
  };

  const handleImportBlocks = useCallback((newBlocks) => setDayBlocks(newBlocks), [key]);

  const nav = useCallback((d) => { const dt = new Date(currentDate); dt.setDate(dt.getDate() + d); setCurrentDate(dt); setSelBlock(null); }, [currentDate]);

  const tabItems = [
    { id: "rhythm", label: "Rhythm", icon: Sun },
    { id: "timeline", label: "Timeline", icon: AlignJustify },
    { id: "analytics", label: "Trends", icon: TrendingUp },
    { id: "export", label: "Sync", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <button onClick={() => nav(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronLeft size={18} className="text-gray-400" /></button>
          <div className="text-center flex-1 relative">
            <label className="cursor-pointer">
              <h1 className="text-base font-bold text-gray-900 tracking-tight">{fd(currentDate)}</h1>
              <input type="date" value={dk(currentDate)}
                onChange={(e) => { if (e.target.value) setCurrentDate(new Date(e.target.value + "T12:00:00")); }}
                className="absolute inset-0 opacity-0 w-full cursor-pointer" />
            </label>
            <div className="flex items-center justify-center gap-3 mt-0.5">
              <button onClick={() => setShowTemplates(true)} className="text-[10px] text-blue-500 font-semibold hover:text-blue-600 relative z-10">
                Templates
              </button>
              <button onClick={toggleSnap} className="text-[10px] font-semibold text-gray-400 hover:text-gray-600 relative z-10 tabular-nums">
                {snapInterval === 0.25 ? "15m" : "30m"}
              </button>
            </div>
          </div>
          <button onClick={() => nav(1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronRight size={18} className="text-gray-400" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pt-3">
        {tab === "rhythm" && (
          <div className="space-y-3 pb-24">
            <CircularClock blocks={blocks} categories={categories} onUpdateBlock={handleUpdateBlock}
              onSelectBlock={handleSelectBlock} selectedId={selBlock} currentHour={currentHour} remainingHrs={remainingHrs} onDeselect={() => setSelBlock(null)} onNavigate={nav} snapInterval={snapInterval} />
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((c) => {
                const hrs = blocks.filter((b) => b.catId === c.id).reduce((s, b) => s + dur(b.start, b.end), 0);
                return (
                  <div key={c.id} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[11px] text-gray-500 font-medium">{c.name} · {hrs.toFixed(1)}h</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-[11px] text-gray-400">Tap block → tap again to edit · Drag to move/resize</div>
            {/* Compact block list */}
            <div className="space-y-1">
              {blocks.map((b) => {
                const cat = categories.find((c) => c.id === b.catId);
                const BlockIcon = cat ? getIcon(cat.icon) : CircleDot;
                const sel = selBlock === b.id;
                return (
                  <div key={b.id} onClick={() => handleSelectBlock(b.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${sel ? "bg-gray-100 ring-2 ring-gray-300" : "hover:bg-gray-50 active:bg-gray-100"}`}>
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: b.color }} />
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <BlockIcon size={14} style={{ color: b.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{b.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-gray-400">{fmt(b.start)} – {fmt(b.end)} · {dur(b.start, b.end).toFixed(1)}h</span>
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
        )}

        {tab === "timeline" && (
          <div>
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
        )}

        <div style={{ display: tab === "analytics" ? undefined : "none" }}>
          <TrendSummary allData={state.days} categories={categories} currentDate={currentDate} />
          <div className="mt-3">
            <AnalyticsView allData={state.days} categories={categories} tags={tags} currentDate={currentDate} />
          </div>
        </div>
        <div style={{ display: tab === "export" ? undefined : "none" }}>
          <ExportView blocks={blocks} date={currentDate} onImportBlocks={handleImportBlocks} onTokenChange={setGcalToken} onCalIdChange={setGcalCalId} syncStatus={syncStatus} />
        </div>
      </div>

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
          onSave={handleSaveBlock} onDelete={handleDeleteBlock} onDeleteRecurring={handleDeleteRecurring} onDuplicate={handleDuplicateBlock} onClose={() => { setShowEditor(false); setEditBlock(null); setPrefill(null); }}
          onAddCat={handleAddCat} onAddTag={handleAddTag}
          prefillStart={prefill?.start} prefillEnd={prefill?.end} snapInterval={snapInterval} />
      )}
      {showTemplates && (
        <TemplatePanel templates={templates} blocks={blocks}
          onLoadTemplate={handleLoadTemplate} onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate} onClose={() => setShowTemplates(false)} />
      )}
    </div>
  );
}
