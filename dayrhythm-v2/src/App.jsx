import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  Plus, X, Clock, TrendingUp, Download, ChevronLeft, ChevronRight,
  Edit3, Trash2, Sun, Moon, Coffee, Briefcase, Heart, Dumbbell,
  BookOpen, Utensils, Zap, Check, Calendar, Copy, RotateCcw,
  Settings, ChevronDown, Search, GripVertical, Save, FolderOpen,
  Palette, Tag, LayoutGrid, AlignJustify, Baby, Bike, Brain,
  Building, Camera, Car, Cloud, Code, Compass, Crown, Diamond,
  Flame, Gift, Globe, Headphones, Home, Key, Laptop, Leaf,
  Lightbulb, Map, Medal, Mic, Music, Paintbrush, Pen, Phone,
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
  Lightbulb, Map, Medal, Mic, Music, Paintbrush, Pen, Phone, Plane,
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
  if (saved && saved.version === 2) return saved;
  return {
    version: 2,
    categories: DEFAULT_CATEGORIES,
    tags: DEFAULT_TAGS,
    days: generateSeed(),
    templates: [
      { id: "t1", name: "Work Day", blocks: seedWorkday() },
      { id: "t2", name: "Weekend", blocks: seedWeekend() },
    ],
  };
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
// CIRCULAR CLOCK (with drag + labels)
// ════════════════════════════════════════════
function CircularClock({ blocks, categories, onUpdateBlock, onSelectBlock, selectedId, currentHour, remainingHrs }) {
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const size = 340;
  const cx = size / 2, cy = size / 2;
  const oR = 145, iR = 82;

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
    return snap30((angle / 360) * 24);
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
    dragRef.current = { block, mode, startHour: angleToHour(pt.x, pt.y), origStart: block.start, origEnd: block.end };
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    const hr = angleToHour(pt.x, pt.y);
    const d = dragRef.current;
    const delta = hr - d.startHour;

    if (d.mode === "move") {
      let ns = snap30((d.origStart + delta + 24) % 24);
      let ne = snap30((d.origEnd + delta + 24) % 24);
      onUpdateBlock(d.block.id, { start: ns, end: ne });
    } else if (d.mode === "start") {
      onUpdateBlock(d.block.id, { start: snap30((d.origStart + delta + 24) % 24) });
    } else if (d.mode === "end") {
      onUpdateBlock(d.block.id, { end: snap30((d.origEnd + delta + 24) % 24) });
    }
  }, [onUpdateBlock]);

  const handlePointerUp = useCallback(() => { dragRef.current = null; }, []);

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
  const nowP = ptc(oR + 14, nowAngle);
  const isToday = true;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto select-none touch-none"
      style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.07))" }}>
      <defs>
        <radialGradient id="bg2"><stop offset="0%" stopColor="#FAFBFC" /><stop offset="100%" stopColor="#F1F5F9" /></radialGradient>
        <filter id="gl2"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="active"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <circle cx={cx} cy={cy} r={oR + 6} fill="url(#bg2)" stroke="#E2E8F0" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={iR - 6} fill="white" stroke="#E2E8F0" strokeWidth="0.5" />

      {Array.from({ length: 24 }, (_, h) => {
        const a = hA(h), p1 = ptc(oR + 2, a), p2 = ptc(oR - 3, a);
        const lp = ptc(oR + 20, a);
        const major = h % 3 === 0;
        return (
          <g key={h}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={major ? "#94A3B8" : "#E2E8F0"} strokeWidth={major ? 1 : 0.5} />
            {major && <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central" fontSize="8.5" fontWeight="600" fill="#94A3B8" style={{ fontFamily: "'DM Sans'" }}>{h === 0 ? "12a" : h === 12 ? "12p" : h < 12 ? `${h}a` : `${h - 12}p`}</text>}
          </g>
        );
      })}

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
        const CatIcon = cat ? getIcon(cat.icon) : CircleDot;
        const isActive = currentHour >= block.start && currentHour < (block.end > block.start ? block.end : block.end + 24);

        const startP = ptc(midR, sa);
        const endP = ptc(midR, ea);

        return (
          <g key={block.id}>
            <path d={arc(sa, ea, oR, iR)} fill={color} opacity={sel ? 1 : 0.82}
              stroke={sel ? "#0F172A" : isActive ? color : "rgba(255,255,255,0.6)"}
              strokeWidth={sel ? 2.5 : isActive ? 2.5 : 0.8}
              filter={isActive ? "url(#active)" : undefined}
              style={{ cursor: "grab", transition: "opacity 0.15s" }}
              onMouseDown={(e) => handlePointerDown(e, block, "move")}
              onTouchStart={(e) => handlePointerDown(e, block, "move")}
              onClick={() => onSelectBlock(block.id)} />

            {blockDur >= 1.5 && (
              <text x={midP.x} y={midP.y - 6} textAnchor="middle" dominantBaseline="central"
                fontSize="7.5" fontWeight="600" fill={tc} style={{ pointerEvents: "none", fontFamily: "'DM Sans'" }}>
                {block.title.length > 12 ? block.title.slice(0, 11) + "…" : block.title}
              </text>
            )}
            <g transform={`translate(${midP.x - 6}, ${blockDur >= 1.5 ? midP.y + 1 : midP.y - 6})`} style={{ pointerEvents: "none" }}>
              <CatIcon size={12} color={tc} />
            </g>

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

      <circle cx={nowP.x} cy={nowP.y} r="5" fill="#EF4444" stroke="white" strokeWidth="2" filter="url(#gl2)" />

      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="21" fontWeight="700" fill="#0F172A" style={{ fontFamily: "'DM Sans'" }}>{fmt(currentHour)}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="#94A3B8" style={{ fontFamily: "'DM Sans'" }}>{remainingHrs.toFixed(1)}h free</text>
    </svg>
  );
}

// ════════════════════════════════════════════
// VERTICAL TIMELINE
// ════════════════════════════════════════════
function VerticalTimeline({ blocks, categories, onUpdateBlock, onSelectBlock, selectedId, onAddAtGap, currentHour }) {
  const hourH = 56;
  const dragRef = useRef(null);
  const contRef = useRef(null);

  const getHourFromY = (clientY) => {
    if (!contRef.current) return 0;
    const rect = contRef.current.getBoundingClientRect();
    const scrollTop = contRef.current.scrollTop;
    const y = clientY - rect.top + scrollTop;
    return snap30(Math.max(0, Math.min(24, y / hourH)));
  };

  const handleDown = (e, block, mode) => {
    e.stopPropagation();
    const touch = e.touches ? e.touches[0] : e;
    dragRef.current = { block, mode, startY: touch.clientY, origStart: block.start, origEnd: block.end };
  };

  const handleMove = useCallback((e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const hr = getHourFromY(touch.clientY);
    const d = dragRef.current;
    const delta = hr - getHourFromY(d.startY);

    if (d.mode === "move") {
      const blockDur = dur(d.origStart, d.origEnd);
      let ns = snap30(Math.max(0, Math.min(24 - blockDur, d.origStart + delta)));
      onUpdateBlock(d.block.id, { start: ns, end: snap30(ns + blockDur) });
    } else if (d.mode === "top") {
      onUpdateBlock(d.block.id, { start: snap30(Math.max(0, d.origStart + delta)) });
    } else if (d.mode === "bottom") {
      onUpdateBlock(d.block.id, { end: snap30(Math.min(24, d.origEnd + delta)) });
    }
  }, [onUpdateBlock]);

  const handleUp = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); window.removeEventListener("touchmove", handleMove); window.removeEventListener("touchend", handleUp); };
  }, [handleMove, handleUp]);

  const gaps = useMemo(() => {
    const sorted = [...blocks].filter((b) => b.end > b.start).sort((a, b) => a.start - b.start);
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
    <div ref={contRef} className="relative overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
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
          <div key={`gap-${i}`} className="absolute left-14 right-2 flex items-center justify-center cursor-pointer group rounded-lg hover:bg-gray-50 transition-colors"
            style={{ top: g.start * hourH + 2, height: Math.max(20, (g.end - g.start) * hourH - 4) }}
            onClick={() => onAddAtGap(g.start, g.end)}>
            <div className="flex items-center gap-1 text-gray-300 group-hover:text-gray-500 transition-colors">
              <Plus size={14} />
              <span className="text-[10px] font-medium">{dur(g.start, g.end).toFixed(1)}h</span>
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
            <div key={block.id} className="absolute left-14 right-2 rounded-xl overflow-hidden select-none touch-none"
              style={{ top, height, backgroundColor: color, opacity: sel ? 1 : 0.88, boxShadow: sel ? "0 0 0 2.5px #0F172A" : isActive ? `0 0 0 2px ${color}, 0 0 12px ${color}40` : "0 1px 3px rgba(0,0,0,0.08)", zIndex: sel ? 10 : isActive ? 5 : 1, transition: "box-shadow 0.2s" }}
              onClick={() => onSelectBlock(block.id)}>
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
function BlockEditor({ block, categories, tags, onSave, onDelete, onClose, onAddCat, onAddTag, prefillStart, prefillEnd }) {
  const [title, setTitle] = useState(block?.title || "");
  const [catId, setCatId] = useState(block?.catId || categories[0]?.id || "");
  const [tagId, setTagId] = useState(block?.tagId || "");
  const [color, setColor] = useState(block?.color || categories.find((c) => c.id === (block?.catId || categories[0]?.id))?.color || "#2563EB");
  const [sH, setSH] = useState(block?.start ?? prefillStart ?? 9);
  const [eH, setEH] = useState(block?.end ?? prefillEnd ?? 10);

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Star");
  const [newCatColor, setNewCatColor] = useState("#2563EB");

  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const ftags = tags.filter((t) => t.catId === catId || !t.catId);
  const timeOpts = Array.from({ length: 48 }, (_, i) => i * 0.5);

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
              {categories.map((c) => {
                const I = getIcon(c.icon);
                return (
                  <button key={c.id} onClick={() => { setCatId(c.id); setColor(c.color); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${catId === c.id ? "text-white shadow-md" : "bg-gray-100 text-gray-600"}`}
                    style={catId === c.id ? { backgroundColor: c.color } : {}}>
                    <I size={14} /> {c.name}
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

          {/* Tag */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tag</label>
            <div className="flex flex-wrap gap-1.5">
              {ftags.map((t) => (
                <button key={t.id} onClick={() => setTagId(t.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${tagId === t.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {t.name}
                </button>
              ))}
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
            {block?.id && (
              <button onClick={() => onDelete(block.id)}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100">
                <Trash2 size={15} /> Delete
              </button>
            )}
            <button onClick={() => onSave({ id: block?.id || uid(), title: title || "Untitled", catId, tagId, color, start: sH, end: eH })}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800">
              <Check size={15} /> {block?.id ? "Update" : "Add Block"}
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
      allData[dk(d)]?.blocks?.forEach((b) => { t[b.tagId] = (t[b.tagId] || 0) + dur(b.start, b.end); });
    }
    return Object.entries(t).map(([id, hours]) => {
      const tag = tags.find((x) => x.id === id);
      const cat = categories.find((c) => c.id === tag?.catId);
      return { name: tag?.name || id, hours: +hours.toFixed(1), color: cat?.color || "#94A3B8" };
    }).sort((a, b) => b.hours - a.hours);
  }, [allData, currentDate, tags, categories]);

  const totalH = catTotals.reduce((s, c) => s + c.hours, 0);

  return (
    <div className="space-y-4 pb-28" style={{ fontFamily: "'DM Sans'" }}>
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
// EXPORT
// ════════════════════════════════════════════
function ExportView({ blocks, date }) {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const handleICS = () => {
    const blob = new Blob([genICS(blocks, date)], { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `dayrhythm-${dk(date)}.ics`; a.click(); URL.revokeObjectURL(a.href);
    setExported(true); setTimeout(() => setExported(false), 2000);
  };
  const handleJSON = () => {
    navigator.clipboard.writeText(JSON.stringify({ date: dk(date), blocks }, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-4 pb-28" style={{ fontFamily: "'DM Sans'" }}>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
        <h4 className="text-base font-bold text-gray-900">Google Calendar Sync</h4>
        <p className="text-sm text-gray-500 leading-relaxed">Download .ics to import into any calendar app.</p>
        <button onClick={handleICS} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors">
          {exported ? <><Check size={16} /> Downloaded!</> : <><Calendar size={16} /> Export .ics for {fd(date)}</>}
        </button>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
        <h4 className="text-base font-bold text-gray-900">JSON (Zapier / Make.com)</h4>
        <p className="text-sm text-gray-500 leading-relaxed">Copy structured data for automation webhooks.</p>
        <button onClick={handleJSON} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors">
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy JSON</>}
        </button>
      </div>
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
        <h4 className="text-sm font-bold text-gray-900 mb-1">Automation Tip</h4>
        <p className="text-xs text-gray-600 leading-relaxed">Paste JSON into a Make.com webhook → Google Calendar "Create Event" module. Map title, start, end, and category.</p>
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

  useEffect(() => { save(state); }, [state]);

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const key = dk(currentDate);
  const dayData = state.days[key] || { theme: "", blocks: [] };
  const blocks = dayData.blocks;
  const { categories, tags, templates } = state;

  const allocated = blocks.reduce((s, b) => s + dur(b.start, b.end), 0);
  const remainingHrs = Math.max(0, 24 - allocated);

  const updateState = (fn) => setState((prev) => { const next = fn({ ...prev, days: { ...prev.days }, categories: [...prev.categories], tags: [...prev.tags], templates: [...prev.templates] }); return next; });

  const setDayBlocks = (newBlocks) => updateState((s) => { s.days[key] = { ...dayData, blocks: newBlocks }; return s; });
  const setDayTheme = (theme) => updateState((s) => { s.days[key] = { ...dayData, theme }; return s; });

  const handleSaveBlock = (block) => {
    const bs = [...blocks];
    const idx = bs.findIndex((b) => b.id === block.id);
    idx >= 0 ? (bs[idx] = block) : bs.push(block);
    bs.sort((a, b) => a.start - b.start);
    setDayBlocks(bs);
    setShowEditor(false); setEditBlock(null); setPrefill(null);
  };

  const handleDeleteBlock = (id) => {
    setDayBlocks(blocks.filter((b) => b.id !== id));
    setShowEditor(false); setEditBlock(null); setSelBlock(null);
  };

  const handleUpdateBlock = useCallback((id, updates) => {
    setState((prev) => {
      const dd = prev.days[key] || { theme: "", blocks: [] };
      const bs = dd.blocks.map((b) => b.id === id ? { ...b, ...updates } : b);
      return { ...prev, days: { ...prev.days, [key]: { ...dd, blocks: bs } } };
    });
  }, [key]);

  const handleSelectBlock = (id) => {
    if (selBlock === id) { setEditBlock(blocks.find((b) => b.id === id)); setShowEditor(true); }
    else setSelBlock(id);
  };

  const handleAddAtGap = (start, end) => {
    setPrefill({ start, end });
    setEditBlock(null);
    setShowEditor(true);
  };

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

  const nav = (d) => { const dt = new Date(currentDate); dt.setDate(dt.getDate() + d); setCurrentDate(dt); setSelBlock(null); };

  const tabItems = [
    { id: "rhythm", label: "Rhythm", icon: Sun },
    { id: "timeline", label: "Timeline", icon: AlignJustify },
    { id: "analytics", label: "Trends", icon: TrendingUp },
    { id: "export", label: "Sync", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">DayRhythm</h1>
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-0.5">
            {tabItems.map((t) => {
              const I = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>
                  <I size={12} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => nav(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200"><ChevronLeft size={18} className="text-gray-400" /></button>
          <div className="text-center flex-1">
            <div className="text-sm font-bold text-gray-900">{fd(currentDate)}</div>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <input value={dayData.theme} onChange={(e) => setDayTheme(e.target.value)} placeholder="Day theme..."
                className="text-[10px] text-center text-gray-400 bg-transparent border-none focus:outline-none focus:text-gray-600 w-24 placeholder:text-gray-300" />
              <button onClick={() => setShowTemplates(true)} className="text-[10px] text-blue-500 font-semibold hover:text-blue-600">
                Templates
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
              onSelectBlock={handleSelectBlock} selectedId={selBlock} currentHour={currentHour} remainingHrs={remainingHrs} />
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((c) => {
                const I = getIcon(c.icon);
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
                const I = cat ? getIcon(cat.icon) : CircleDot;
                const sel = selBlock === b.id;
                return (
                  <div key={b.id} onClick={() => handleSelectBlock(b.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${sel ? "bg-gray-100 ring-2 ring-gray-300" : "hover:bg-gray-50 active:bg-gray-100"}`}>
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: b.color }} />
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <I size={14} style={{ color: b.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{b.title}</div>
                      <div className="text-[10px] text-gray-400">{fmt(b.start)} – {fmt(b.end)} · {dur(b.start, b.end).toFixed(1)}h</div>
                    </div>
                    <Edit3 size={12} className="text-gray-300 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "timeline" && (
          <VerticalTimeline blocks={blocks} categories={categories} onUpdateBlock={handleUpdateBlock}
            onSelectBlock={handleSelectBlock} selectedId={selBlock} onAddAtGap={handleAddAtGap} currentHour={currentHour} />
        )}

        {tab === "analytics" && <AnalyticsView allData={state.days} categories={categories} tags={tags} currentDate={currentDate} />}
        {tab === "export" && <ExportView blocks={blocks} date={currentDate} />}
      </div>

      {/* FAB */}
      {(tab === "rhythm" || tab === "timeline") && (
        <button onClick={() => { setEditBlock(null); setPrefill(null); setShowEditor(true); }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gray-900 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all z-40"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          <Plus size={24} />
        </button>
      )}

      {/* Modals */}
      {showEditor && (
        <BlockEditor block={editBlock} categories={categories} tags={tags}
          onSave={handleSaveBlock} onDelete={handleDeleteBlock} onClose={() => { setShowEditor(false); setEditBlock(null); setPrefill(null); }}
          onAddCat={handleAddCat} onAddTag={handleAddTag}
          prefillStart={prefill?.start} prefillEnd={prefill?.end} />
      )}
      {showTemplates && (
        <TemplatePanel templates={templates} blocks={blocks}
          onLoadTemplate={handleLoadTemplate} onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate} onClose={() => setShowTemplates(false)} />
      )}
    </div>
  );
}
