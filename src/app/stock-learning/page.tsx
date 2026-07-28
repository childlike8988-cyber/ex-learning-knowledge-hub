import { LearningAppPage } from "@/components/LearningAppPage";
import { getLearningApp } from "@/data/learning-apps";

export default function Page() { return <LearningAppPage app={getLearningApp("stock")} />; }
