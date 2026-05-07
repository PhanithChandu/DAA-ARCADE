import { getGeminiClient } from './geminiClient';

export async function explainAlgorithm(gameName: string, stateDescription: string) {
  const ai = getGeminiClient();
  if (!ai) {
    return 'AI features are offline (missing GEMINI_API_KEY).';
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a tactical DAA (Design and Analysis of Algorithms) tutor. 
      Briefly explain the current state of this algorithm simulation: "${gameName}".
      Current Scenario: ${stateDescription}
      
      Keep it high-tech, tactical, and brief (under 50 words). 
      Focus on WHY the algorithm is making its current choice.`,
      config: {
        systemInstruction: "You are a concise AI tutor in a high-tech arcade setting.",
      }
    });

    return response.text?.trim() || "Simulation active. Data processing in progress.";
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return "Tactical data stream interrupted. Proceed with caution.";
  }
}
