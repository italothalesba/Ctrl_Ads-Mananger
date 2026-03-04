
import { GoogleGenAI } from "@google/genai";
import { Campaign, Client } from "../types.ts";

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

export const generateConsolidatedReport = async (client: Client): Promise<string> => {
  if (!client.campaigns || client.campaigns.length === 0) return "Sem dados de campanha para analisar.";

  const totalSpend = client.campaigns.reduce((acc, c) => acc + c.metrics.spend, 0);
  const totalRevenue = client.campaigns.reduce((acc, c) => acc + c.metrics.conversionValue, 0);
  const totalConversions = client.campaigns.reduce((acc, c) => acc + c.metrics.conversions, 0);
  
  const campaignsSummary = client.campaigns.map(c => 
    `- ${c.name}: R$ ${c.metrics.spend} gasto, ${c.metrics.conversions} resultados, ROAS ${(c.metrics.conversionValue / (c.metrics.spend || 1)).toFixed(2)}x`
  ).join('\n');

  const prompt = `
    Atue como um Diretor de Estratégia de Performance. 
    Gere um relatório executivo de fim de período para o cliente "${client.name}".
    
    Resumo dos Dados Consolidados:
    - Investimento Total: R$ ${totalSpend.toFixed(2)}
    - Conversão Total (Valor): R$ ${totalRevenue.toFixed(2)}
    - Total de Resultados: ${totalConversions}
    - ROAS Médio: ${(totalRevenue / (totalSpend || 1)).toFixed(2)}x

    Lista de Campanhas Ativas:
    ${campaignsSummary}

    Instruções para o texto:
    1. Comece com um tom profissional e encorajador.
    2. Explique em termos simples o que esses números significam para o negócio (Lucratividade e Escala).
    3. Destaque a melhor campanha.
    4. Sugira o próximo passo estratégico (ex: aumentar verba, trocar criativos, etc).
    5. Use formatação Markdown elegante com títulos e listas.
    6. Seja conciso.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Relatório não gerado.";
  } catch (error) {
    console.error("Gemini Consolidated Report Error:", error);
    return "Erro ao gerar relatório consolidado.";
  }
};
