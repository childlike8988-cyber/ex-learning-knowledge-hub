"use client";

import { useState } from "react";
import type { AiLearningLesson } from "@/lib/ai-learning/content";

export function AiTaPanel({ lesson }: { lesson: AiLearningLesson }) {
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const response = selectedQuestion ? lesson.aiTaResponses[selectedQuestion] : undefined;
  return <aside className="ai-learning-ta" aria-labelledby="ai-ta-title"><div className="ai-learning-ta__header"><span className="ai-learning-live-dot" aria-hidden="true" /><div><p>CONTEXT-AWARE PROTOTYPE</p><h2 id="ai-ta-title">AI TA</h2></div><span className="ai-learning-status-badge">STATIC</span></div><p className="ai-learning-ta__intro">這一課哪裡還不清楚？先選一個問題，看看課程邊界內的示範回答。</p><div className="ai-learning-ta__questions">{lesson.suggestedQuestions.map((question) => <button type="button" key={question} onClick={() => setSelectedQuestion(question)} aria-pressed={selectedQuestion === question}>{question}<span aria-hidden="true">↗</span></button>)}</div>{response && <div className="ai-learning-ta__response" aria-live="polite"><span>PROTOTYPE RESPONSE</span><p>{response}</p><small>這是預先撰寫的課程示範，不會呼叫外部 AI。</small></div>}<div className="ai-learning-ta__input"><label className="sr-only" htmlFor="ai-ta-question">問這一課的問題</label><input id="ai-ta-question" type="text" placeholder="問這一課的問題..." disabled /><span aria-hidden="true">↵</span></div></aside>;
}

