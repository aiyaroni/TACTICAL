import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchMilitaryNews } from "./news";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface PentagonAnalysis {
    score: number;
    justification: string;
}

export async function analyzePentagonActivity(): Promise<PentagonAnalysis> {
    if (!GEMINI_API_KEY) {
        return { score: 10, justification: "AI OFFLINE - MONITORING STANDARD CHANNELS" };
    }

    try {
        // 1. Fetch relevant news
        const articles = await fetchMilitaryNews("Pentagon+Arlington+military+alert");
        const headlines = articles.slice(0, 5).map(a => `- ${a.title} (${a.source.name})`).join("\n");
        const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

        // 2. Prompt Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
        Role: Tactical Intelligence Officer.
        Context: The "Pizza Meter" tracks abnormal activity at the Pentagon (late night food orders, unusual traffic).
        Current Time (DC): ${now}
        
        Recent News Headlines:
        ${headlines}
        
        Task: Analyze these headlines and the time. 
        On a scale of 0-100, how abnormal/critical is the activity?
        0 = Normal/Quiet. 100 = Crisis/War Room Active.
        
        Respond ONLY with a JSON object: { "score": number, "justification": "One short, tactical sentence." }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonStr);

        return {
            score: typeof data.score === 'number' ? data.score : 20,
            justification: data.justification || "ANALYSIS INCONCLUSIVE. MAINTAINING WATCH."
        };

    } catch (error) {
        console.error("Gemini Analysis Failed", error);
        return { score: 25, justification: "DATA STREAM INTERRUPTED. ESTIMATING BASED ON BASELINE." };
    }
}
