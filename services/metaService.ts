
import { Client, Campaign, AdSet, Ad, Metrics, DemographicData, VideoMetrics } from "../types.ts";

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

const mapInsightsToMetrics = (insightsData: any): Metrics => {
  const insights = insightsData?.data?.[0] || {};
  const actions = insights.actions || [];
  const messages = getActionValue(actions, 'onsite_conversion.messaging_first_reply');
  const spend = parseFloat(insights.spend || 0);

  const videoPlays = getActionValue(actions, 'video_play');
  let video: VideoMetrics | undefined = undefined;

  if (videoPlays > 0) {
    video = {
      plays: videoPlays,
      avgTime: parseFloat(insights.video_avg_time_watched_actions?.[0]?.value || 0),
      retention25: getActionValue(actions, 'video_p25_watched_actions'),
      retention50: getActionValue(actions, 'video_p50_watched_actions'),
      retention75: getActionValue(actions, 'video_p75_watched_actions'),
      retention100: getActionValue(actions, 'video_p100_watched_actions'),
    };
  }

  const metrics: Metrics = {
    spend,
    impressions: parseInt(insights.impressions || 0),
    reach: parseInt(insights.reach || 0),
    frequency: parseFloat(insights.frequency || 0),
    cpm: parseFloat(insights.cpm || 0),
    clicks: parseInt(insights.clicks || 0),
    conversions: getActionValue(actions, 'purchase'),
    conversionValue: getActionValue(insights.action_values, 'purchase'),
  };

  if (messages > 0) {
    metrics.messages = messages;
    metrics.costPerMessage = spend / messages;
  }

  if (video) {
    metrics.video = video;
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

export const syncMetaAdsData = async (client: Client, datePreset: string = 'this_month'): Promise<Client> => {
  if (!client.adAccountId || !client.accessToken) throw new Error("Credenciais ausentes.");
  const metaPreset = mapDatePreset(datePreset);
  const accountId = client.adAccountId.startsWith('act_') ? client.adAccountId : `act_${client.adAccountId}`;
  const token = client.accessToken;
  const insightsFields = `spend,impressions,reach,frequency,cpm,clicks,actions,action_values,video_avg_time_watched_actions`;
  const insightsParams = `.date_preset(${metaPreset})`;
  
  try {
    const url = `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,insights${insightsParams}{${insightsFields}},adsets{id,name,status,daily_budget,lifetime_budget,targeting,insights${insightsParams}{${insightsFields}},ads{id,name,status,creative{id,title,image_url,thumbnail_url},insights${insightsParams}{${insightsFields}}}}&date_preset=${metaPreset}&access_token=${token}`;
    const response = await fetch(url);
    const json = await response.json();
    if (json.error) throw new Error(json.error.message);

    const campaigns: Campaign[] = await Promise.all(json.data.map(async (fbCamp: any) => {
      const demoUrl = `https://graph.facebook.com/v19.0/${fbCamp.id}/insights?breakdowns=age,gender&fields=spend,actions&date_preset=${metaPreset}&access_token=${token}`;
      const demoRes = await fetch(demoUrl);
      const demoJson = await demoRes.json();
      const demographics: DemographicData[] = (demoJson.data || []).map((d: any) => ({
        age: d.age,
        gender: d.gender,
        spend: parseFloat(d.spend || 0),
        results: getActionValue(d.actions, fbCamp.objective === 'MESSAGES' ? 'onsite_conversion.messaging_first_reply' : 'purchase')
      }));

      const campMetrics = { ...mapInsightsToMetrics(fbCamp.insights), demographics };
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
          metrics: mapInsightsToMetrics(fbAd.insights)
        }));
        return {
          id: fbAdSet.id,
          name: fbAdSet.name,
          status: fbAdSet.status === 'ACTIVE' ? 'active' : 'paused',
          budget: parseFloat(fbAdSet.daily_budget || fbAdSet.lifetime_budget || 0) / 100,
          budgetType: fbAdSet.daily_budget ? 'DAILY' : 'LIFETIME',
          audience: JSON.stringify(fbAdSet.targeting || {}),
          metrics: mapInsightsToMetrics(fbAdSet.insights),
          ads
        };
      });
      return {
        id: fbCamp.id,
        name: fbCamp.name,
        status: fbCamp.status === 'ACTIVE' ? 'active' : 'paused',
        platform: 'facebook',
        objective: fbCamp.objective,
        metrics: campMetrics,
        budget: parseFloat(fbCamp.daily_budget || fbCamp.lifetime_budget || 0) / 100,
        budgetType: fbCamp.daily_budget ? 'DAILY' : 'LIFETIME',
        startTime: fbCamp.start_time || null,
        endTime: fbCamp.stop_time || null,
        adSets,
        creative: adSets[0]?.ads[0]?.creative || { id: '0', type: 'image', url: '', headline: fbCamp.name },
        audience: adSets[0]?.name || 'Público Geral' // Usando o nome do primeiro conjunto como fallback de audiência
      };
    }));
    return { ...client, lastSync: new Date().toLocaleTimeString(), campaigns };
  } catch (e: any) {
    throw e;
  }
};
