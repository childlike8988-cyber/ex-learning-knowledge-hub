"use client";
import { useEffect } from "react";
import { publicAssetPath } from "@/lib/paths";
export function LegacyLifeManagementRedirect() { useEffect(() => { window.location.replace(publicAssetPath("/life-management/")); }, []); return <p className="mx-auto max-w-4xl px-5 py-20 text-slate-300">正在前往生活管理…</p>; }
