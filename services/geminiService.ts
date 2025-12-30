
import { GoogleGenAI } from "@google/genai";
import { Campaign } from "../types.ts";

export const analyzeCampaignPerformance = async (campaign: Campaign): Promise<string> => {
  const { name, metrics, audience, creative, objective } = campaign;
  
  const roas = metrics.spend > 0 ? (metrics.conversionValue / metrics.spend).toFixed(2) : 0;
  const ctr = metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : 0;
  const cpc = metrics.clicks > 0 ? (metrics.spend / metrics.clicks).toFixed(2) : 0;
  const cpa = metrics.conversions > 0 ? (metrics.spend / metrics.conversions).toFixed(2) : 0;

  const prompt = `
    Atue como um especialista sênior em tráfego pago (Media Buyer).
    Analise os dados da seguinte campanha e forneça 3 sugestões táticas curtas e diretas para otimização.
    Responda em Português do Brasil. Use formatação Markdown.

    Dados da Campanha:
    - Nome: ${name}
    - Objetivo: ${objective}
    - Público: ${audience}
    - Headline do Criativo: "${creative.headline}"
    - Gasto: R$ ${metrics.spend}
    - Impressões: ${metrics.impressions}
    - Cliques: ${metrics.clicks}
    - Conversões: ${metrics.conversions}
    - ROAS (Retorno): ${roas}x
    - CTR: ${ctr}%
    - CPC: R$ ${cpc}
    - CPA (Custo por ação): R$ ${cpa}

    Foque em: Criativo, Público e Lance. Seja crítico se os números estiverem ruins.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar análise.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao consultar a IA. Tente novamente mais tarde.";
  }
};
