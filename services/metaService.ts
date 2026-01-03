
import { Client, Campaign, AdSet, Ad, Metrics, DemographicData, VideoMetrics, DailyStat } from "../types.ts";

export interface MetaAccountInfo {
  id: string;
  name: string;
  currency: string;
}

const getActionValue = (actions: any[], actionType: string): number => {
  if (!actions || !Array.isArray(actions)) return 0;
  const action = actions.find((a: any) => a.action_type === actionType);
  return action ? parseFloat(action.value || action.count || 0) : 0;
};

const mapDatePreset = (preset: string): string => {
  const mapping: Record<string, string> = {
    'maximum': 'maximum',
    'today': 'today',
    'yesterday': 'yesterday',
    'today_and_yesterday': 'last_3d',
    'last_7d': 'last_7d',
    'last_14d': 'last_14d',
    'last_28d': 'last_28d',
    'last_30d': 'last_30d',
    'this_week': 'this_week_mon_today',
    'last_week': 'last_week_mon_sun',
    'this_month': 'this_month',
    'last_month': 'last_month'
  };
  return mapping[preset] || 'this_month';
};

const mapInsightsToMetrics = (insightsData: any, objective: string = ''): Metrics => {
  const insights = insightsData?.data?.[0] || insightsData || {};
  const actions = insights.actions || [];
  const actionValues = insights.action_values || [];
  const spend = parseFloat(insights.spend || 0);

  let mainActionType = 'purchase';
  if (objective.includes('MESSAGES')) mainActionType = 'onsite_conversion.messaging_first_reply';
  else if (objective.includes('LEAD')) mainActionType = 'lead';
  else if (objective.includes('OUTCOME_TRAFFIC')) mainActionType = 'link_click';

  const conversions = getActionValue(actions, mainActionType);
  const conversionValue = getActionValue(actionValues, mainActionType);
  const messages = getActionValue(actions, 'onsite_conversion.messaging_first_reply');

  const metrics: Metrics = {
    spend,
    impressions: parseInt(insights.impressions || 0),
    reach: parseInt(insights.reach || 0),
    frequency: parseFloat(insights.frequency || 0),
    cpm: parseFloat(insights.cpm || 0),
    clicks: parseInt(insights.clicks || 0),
    conversions,
    conversionValue,
  };

  if (messages > 0 || mainActionType.includes('messaging')) {
    metrics.messages = messages || conversions;
    metrics.costPerMessage = spend / (metrics.messages || 1);
  }

  return metrics;
};

export const validateMetaConnection = async (adAccountId: string, accessToken: string): Promise<MetaAccountInfo> => {
  const cleanActId = adAccountId.replace('act_', '').trim();
  const url = `https://graph.facebook.com/v19.0/act_${cleanActId}?fields=name,currency&access_token=${accessToken}`;
  const response = await fetch(url);
  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  return { id: json.id, name: json.name, currency: json.currency };
};

export const syncMetaAdsData = async (
  client: Client, 
  datePreset: string = 'this_month',
  customRange?: { since: string; until: string }
): Promise<Client> => {
  if (!client.adAccountId || !client.accessToken) throw new Error("Credenciais ausentes.");
  
  const accountId = client.adAccountId.startsWith('act_') ? client.adAccountId : `act_${client.adAccountId}`;
  const token = client.accessToken;
  const insightsFields = `spend,impressions,reach,frequency,cpm,clicks,actions,action_values`;
  const preset = mapDatePreset(datePreset);
  
  let dateQuery = '';
  if (datePreset === 'custom' && customRange) {
    const range = JSON.stringify({ since: customRange.since, until: customRange.until });
    dateQuery = `time_range=${range}`;
  } else {
    dateQuery = `date_preset=${preset}`;
  }

  try {
    // A estrutura da query foi corrigida para usar expansão aninhada padrão da Graph API
    const fields = [
      'id',
      'name',
      'status',
      'objective',
      'daily_budget',
      'lifetime_budget',
      `insights.date_preset(${preset}){${insightsFields}}`,
      `adsets{id,name,status,daily_budget,targeting,insights.date_preset(${preset}){${insightsFields}},ads{id,name,status,creative{id,title,image_url,thumbnail_url},insights.date_preset(${preset}){${insightsFields}}}}`
    ].join(',');

    const campUrl = `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=${fields}&access_token=${token}`;
    
    const campResponse = await fetch(campUrl);
    const campJson = await campResponse.json();
    if (campJson.error) throw new Error(campJson.error.message);

    // 2. Buscar Histórico Diário da Conta (Para o Gráfico)
    const historyUrl = `https://graph.facebook.com/v19.0/${accountId}/insights?fields=spend,action_values,date_start&time_increment=1&${dateQuery}&access_token=${token}`;
    const historyResponse = await fetch(historyUrl);
    const historyJson = await historyResponse.json();
    
    const dailyStats: DailyStat[] = (historyJson.data || []).map((day: any) => ({
      date: day.date_start,
      spend: parseFloat(day.spend || 0),
      revenue: getActionValue(day.action_values, 'purchase') || getActionValue(day.action_values, 'lead') || 0
    })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const campaigns: Campaign[] = campJson.data.map((fbCamp: any) => {
      const campObjective = fbCamp.objective || '';
      const campMetrics = mapInsightsToMetrics(fbCamp.insights, campObjective);
      
      const adSets: AdSet[] = (fbCamp.adsets?.data || []).map((fbAdSet: any) => {
        const ads: Ad[] = (fbAdSet.ads?.data || []).map((fbAd: any) => ({
          id: fbAd.id,
          name: fbAd.name,
          status: fbAd.status === 'ACTIVE' ? 'active' : 'paused',
          creative: {
            id: fbAd.creative?.id || '0',
            type: 'image',
            url: fbAd.creative?.image_url || fbAd.creative?.thumbnail_url || 'https://via.placeholder.com/150',
            headline: fbAd.creative?.title || fbAd.name
          },
          metrics: mapInsightsToMetrics(fbAd.insights, campObjective)
        }));
        return {
          id: fbAdSet.id,
          name: fbAdSet.name,
          status: fbAdSet.status === 'ACTIVE' ? 'active' : 'paused',
          budget: parseFloat(fbAdSet.daily_budget || 0) / 100,
          budgetType: 'DAILY',
          audience: JSON.stringify(fbAdSet.targeting || {}),
          metrics: mapInsightsToMetrics(fbAdSet.insights, campObjective),
          ads
        };
      });

      return {
        id: fbCamp.id,
        name: fbCamp.name,
        status: fbCamp.status === 'ACTIVE' ? 'active' : 'paused',
        platform: 'facebook',
        objective: campObjective,
        metrics: campMetrics,
        adSets,
        creative: adSets[0]?.ads[0]?.creative || { id: '0', type: 'image', url: '', headline: fbCamp.name },
        audience: adSets[0]?.name || 'Público Geral'
      };
    });

    return { ...client, lastSync: new Date().toLocaleTimeString(), campaigns, dailyStats };
  } catch (e: any) {
    throw e;
  }
};
