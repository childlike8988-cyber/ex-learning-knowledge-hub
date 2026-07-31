import { BreakfastManagement } from "@/components/BreakfastManagement";
import { EmotionalStateCards } from "@/components/EmotionalStateCards";
import { ExerciseLevelSelector } from "@/components/ExerciseLevelSelector";
import { HomeExerciseLibrary } from "@/components/HomeExerciseLibrary";
import { LifeManagementHero } from "@/components/LifeManagementHero";
import { LifeManagementNav } from "@/components/LifeManagementNav";
import { LifeManagementSafetyNotice } from "@/components/LifeManagementSafetyNotice";
import { ResultsShowcase } from "@/components/ResultsShowcase";
import { WeeklyExerciseOptions } from "@/components/WeeklyExerciseOptions";

export function LifeManagementPage() { return <div className="mx-auto max-w-6xl px-5 sm:px-8"><LifeManagementHero /><LifeManagementNav /><ResultsShowcase /><ExerciseLevelSelector /><HomeExerciseLibrary /><WeeklyExerciseOptions /><EmotionalStateCards /><BreakfastManagement /><section id="collaboration" className="scroll-mt-24 py-12"><p className="eyebrow">Breakfast plan / collaboration</p><h2 className="mt-3 text-3xl font-semibold text-white">早餐計畫／合作入口</h2><div className="glass mt-5 rounded-2xl p-6"><p className="max-w-2xl leading-7 text-slate-300">了解早餐計畫、健康陪跑與副業合作方式。此入口目前仍在準備，未設定假網址或外部聯絡連結。</p><button type="button" disabled aria-disabled="true" className="mt-6 min-h-12 cursor-not-allowed rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-slate-400">了解早餐計畫／合作方式（即將提供）</button></div></section><LifeManagementSafetyNotice /></div>; }
