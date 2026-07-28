import { CopyButton } from "@/components/CopyButton";
import { publicAssetPath } from "@/lib/paths";

const pdfPath = "/pdf/Seedance2.0-真人動漫分身教學.pdf";

const prompt = `Reference Character:
Use the provided reference images exactly.

Real Yuni:
A photorealistic Taiwanese female real estate agent with long dark brown hair, wearing a light blue sleeveless knit top, white shorts, yellow socks and white sneakers.

Cartoon Yuni:
A Korean-style flat 2D illustrated version of Real Yuni. Identical hairstyle, facial features, outfit and colors. Bold clean outlines. Simple cel shading. Expressive eyes. Same proportions throughout the video.

Video Style:
15 seconds.
Vertical 9:16.
Ultra realistic luxury apartment.
Modern minimalist interior.
Bright natural daylight.
Premium Taiwanese real estate advertisement.
Smooth DJI gimbal movement.
35mm cinematic lens.
Natural walking.
Natural facial expressions.
Natural Taiwanese Mandarin female voice.
The real Yuni speaks with a friendly Taiwanese accent.
The cartoon never speaks.
The cartoon naturally lives inside the apartment.
She interacts with furniture and objects naturally.
Correct perspective.
Correct lighting.
Correct contact shadows.
No floating.
No stickers.
No clipping.
No fisheye.
No distorted walls.
No warped furniture.
No stretched body.
No AI artifacts.
No over-sharpening.
No plastic skin.
Keep architecture perfectly straight.
Maintain realistic room proportions.
Commercial film quality.

Scene 1 — 0–3s — Living Room:
Real Yuni walks into the living room while smiling.
Dialogue:「一進門，就是明亮又舒服的客廳。」
Camera slowly pushes forward.
Cartoon Yuni is already sitting comfortably on the sofa.
She drinks coffee.
She notices the camera.
She smiles and gently waves.

Scene 2 — 3–6s — Dining Area:
Real Yuni walks beside the dining table.
Dialogue:「餐廳空間很剛好，一家人用餐很舒服。」
Cartoon Yuni is happily eating strawberry cake.
She suddenly notices the camera.
She quickly hides the cake behind her back.
She smiles awkwardly.

Scene 3 — 6–9s — Kitchen:
Real Yuni walks into the modern kitchen.
Dialogue:「廚房收納規劃完整，料理也很方便。」
Cartoon Yuni opens the refrigerator.
She finds a pudding.
She smiles happily.
She quietly closes the refrigerator.
She pretends nothing happened.

Scene 4 — 9–12s — Master Bedroom:
Real Yuni stands beside the bed.
Dialogue:「主臥採光很好，每天起床都很舒服。」
Cartoon Yuni stretches lazily on the bed.
She sits up.
She gives a happy thumbs up.

Scene 5 — 12–15s — Apartment Entrance:
Modern luxury building entrance.
Real Yuni walks toward the entrance.
Cartoon Yuni happily runs over.
She gently pulls Real Yuni's sleeve.
Real Yuni looks down naturally and smiles.
Both wave toward the camera.
Dialogue:「想用這種真人加分身的方式介紹房子嗎？留言『分身』，製作方法分享給你。」
Fade out naturally.

Animation Rules:
The real Yuni always focuses on introducing the property.
The cartoon behaves like another resident already living inside the apartment.
Small, natural and cute interactions only.
No exaggerated cartoon movement.
No unnecessary dancing.
Natural eye contact.
Natural timing.
Maintain identical appearance, hairstyle, outfit, body proportions, illustration style and color palette for both Real Yuni and Cartoon Yuni throughout the entire video.
Never redesign either character.
Always match the provided character reference sheets exactly.`;

const storyboards = [
  ["Scene 1", "0–3 秒", "客廳", "真人：走入客廳並介紹", "分身：坐在沙發喝咖啡、微笑揮手"],
  ["Scene 2", "3–6 秒", "餐廳", "真人：走在餐桌旁介紹", "分身：吃草莓蛋糕，被發現後藏到背後"],
  ["Scene 3", "6–9 秒", "廚房", "真人：走入廚房介紹收納", "分身：打開冰箱找到布丁，裝作沒事"],
  ["Scene 4", "9–12 秒", "主臥", "真人：站在床邊介紹採光", "分身：伸懶腰、坐起並比讚"],
  ["Scene 5", "12–15 秒", "社區入口", "真人：走向入口", "分身：跑過來拉衣袖；兩人一起向鏡頭揮手"],
] as const;

const settings = [
  ["Model", "Seedance 2.0"], ["Duration", "15 seconds"], ["Aspect Ratio", "9:16"], ["Resolution", "1080 × 1920"], ["Motion", "Medium"], ["Style", "Cinematic / Realistic"], ["Character Consistency", "High"], ["Seed", "建議固定"], ["Voice", "Natural Taiwanese Mandarin female voice"],
] as const;

const checks = ["真人與動漫分身外觀一致", "五個場景順序正確", "人物服裝與髮型沒有改變", "建築牆面與家具沒有扭曲", "人物沒有漂浮、穿模或被裁切", "光線、透視與接觸陰影自然", "動作自然，不要過度跳舞或誇張表演", "中文對白正確", "沒有貼紙、水印或 AI 瑕疵", "影片為 15 秒、9:16"];

export default function SeedanceTutorialPage() {
  const pdfUrl = publicAssetPath(pdfPath);

  return <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
    <p className="eyebrow">AI 教學 / 影片生成</p>
    <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">Seedance 2.0｜真人 × 動漫分身房屋介紹影片教學</h1>
    <p className="mt-5 text-lg leading-8 text-cyan-100">使用場景圖、真人角色與動漫分身，製作一支 15 秒直式房屋介紹影片。</p>
    <p className="mt-6 max-w-3xl leading-8 text-slate-300">真人房仲負責介紹房屋，動漫分身則像已經住在屋內的另一位角色，在不同空間進行自然、可愛的小互動。</p>
    <p className="mt-3 max-w-3xl leading-8 text-slate-300">整支影片共 15 秒，分成 5 個場景，每個場景約 3 秒。</p>

    <section className="mt-12"><h2 className="text-2xl font-semibold text-white">1. 事前準備</h2><ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-200 sm:grid-cols-2">{["客廳場景圖", "餐廳場景圖", "廚房場景圖", "主臥場景圖", "社區入口場景圖", "真人角色參考圖", "動漫分身參考圖"].map((item) => <li className="glass rounded-xl px-4 py-3" key={item}>{item}</li>)}</ul><ul className="mt-5 list-inside list-disc space-y-2 leading-7 text-slate-300"><li>可利用 GPT、Gemini 或其他圖片生成工具製作與修飾素材。</li><li>所有場景的建築風格、光線與色調應保持一致。</li><li>真人角色的髮型、服裝與身形必須固定。</li><li>動漫分身需保留與真人相同的髮型、服裝、配色及主要特徵。</li><li>建議先完成場景圖與角色參考圖，再進入影片生成。</li></ul></section>

    <section className="mt-12"><h2 className="text-2xl font-semibold text-white">2. 製作流程</h2><ol className="mt-5 grid gap-3 sm:grid-cols-2">{["準備場景圖", "準備真人角色參考圖", "生成動漫分身參考圖", "使用 GPT 整理英文提示詞", "將素材導入 Lumeflow、Higgsfield 或其他支援工具", "選擇 Seedance 2.0，製作 15 秒影片", "檢查角色、建築與動作後輸出"].map((item, index) => <li className="glass flex gap-3 rounded-xl p-4 text-sm text-slate-200" key={item}><span className="font-bold text-cyan-300">0{index + 1}</span>{item}</li>)}</ol><p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-7 text-cyan-50">建議使用英文提示詞。英文通常較容易讓影片模型理解角色、鏡頭、場景及限制條件，可降低角色漂移、畫面變形與動作誤判。</p></section>

    <section className="glass mt-12 rounded-2xl p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Copy-ready prompt</p><h2 className="mt-2 text-2xl font-semibold text-white">3. 完整英文 Prompt</h2></div><CopyButton text={prompt} /></div><pre className="mt-6 max-h-[38rem] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs leading-6 text-slate-200 sm:p-5 sm:text-sm">{prompt}</pre></section>

    <section className="mt-12"><h2 className="text-2xl font-semibold text-white">4. 分鏡摘要</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{storyboards.map(([scene, time, place, real, avatar]) => <div className="glass rounded-xl p-5" key={scene}><p className="text-xs font-bold tracking-widest text-cyan-300">{scene} · {time}</p><h3 className="mt-2 text-lg font-semibold text-white">{place}</h3><p className="mt-3 text-sm leading-6 text-slate-200">{real}</p><p className="mt-1 text-sm leading-6 text-slate-300">{avatar}</p></div>)}</div></section>

    <section className="mt-12"><h2 className="text-2xl font-semibold text-white">5. Seedance 2.0 建議設定</h2><dl className="glass mt-5 grid overflow-hidden rounded-2xl sm:grid-cols-2">{settings.map(([name, value]) => <div className="flex justify-between gap-4 border-b border-white/10 px-5 py-4 text-sm sm:[&:nth-last-child(-n+2)]:border-b-0" key={name}><dt className="text-slate-400">{name}</dt><dd className="text-right font-medium text-slate-100">{value}</dd></div>)}</dl></section>

    <section className="mt-12"><h2 className="text-2xl font-semibold text-white">6. 成片檢查</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{checks.map((item) => <li className="glass flex gap-3 rounded-xl p-4 text-sm leading-6 text-slate-200" key={item}><span className="text-cyan-300">✓</span>{item}</li>)}</ul></section>

    <section className="mt-12 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-6 sm:p-8"><p className="eyebrow">Download guide</p><h2 className="mt-3 text-2xl font-semibold text-white">完整圖解教學</h2><p className="mt-3 leading-7 text-slate-200">已整理成 5 頁中英對照 PDF，可下載收藏或分享。</p><a href={pdfUrl} download target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">下載完整 5 頁 PDF 教學</a></section>

    <section className="mt-12 border-t border-white/10 pt-8"><p className="leading-7 text-slate-300">可將本頁網址分享給想製作「真人 × 動漫分身」影片的朋友。</p><div className="glass mt-6 rounded-2xl p-5"><p className="eyebrow">Related tutorials</p><h2 className="mt-2 text-xl font-semibold text-white">相關教學</h2><p className="mt-2 text-sm text-slate-300">角色一致性與房屋鏡頭設計（即將推出）</p></div></section>
  </article>;
}
