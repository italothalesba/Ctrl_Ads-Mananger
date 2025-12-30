
import { Client, DemographicData } from './types';

const MOCK_DEMOGRAPHICS_1: DemographicData[] = [
  { age: '18-24', gender: 'male', spend: 150, results: 25 },
  { age: '18-24', gender: 'female', spend: 200, results: 40 },
  { age: '25-34', gender: 'male', spend: 400, results: 85 },
  { age: '25-34', gender: 'female', spend: 350, results: 70 },
  { age: '35-44', gender: 'male', spend: 200, results: 30 },
  { age: '35-44', gender: 'female', spend: 180, results: 28 },
  { age: '45-54', gender: 'male', spend: 100, results: 12 },
  { age: '45-54', gender: 'female', spend: 90, results: 15 },
];

const MOCK_DEMOGRAPHICS_2: DemographicData[] = [
  { age: '18-24', gender: 'female', spend: 1200, results: 110 },
  { age: '25-34', gender: 'female', spend: 2500, results: 180 },
  { age: '35-44', gender: 'female', spend: 800, results: 45 },
  { age: '45-54', gender: 'female', spend: 300, results: 12 },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'TechStart Solutions',
    industry: 'SaaS B2B',
    avatar: 'https://picsum.photos/id/1/200/200',
    adAccountId: 'act_123456789',
    accessToken: '',
    lastSync: '10 min atrás',
    campaigns: [
      {
        id: 'cmp1',
        name: 'Leads Q1 - Ebook Download',
        status: 'active',
        platform: 'facebook',
        objective: 'Lead Generation',
        audience: 'Interests: Marketing, Startup, SaaS. Age: 25-45. Geo: Brazil.',
        creative: {
          id: 'cr1',
          type: 'image',
          url: 'https://picsum.photos/id/48/800/800',
          headline: 'Escale seu SaaS com automação inteligente.'
        },
        metrics: {
          spend: 1250.50,
          impressions: 45000,
          clicks: 850,
          conversions: 120,
          conversionValue: 0,
          demographics: MOCK_DEMOGRAPHICS_1
        },
        adSets: [
          {
            id: 'as1',
            name: 'Principal - Interesses Marketing',
            status: 'active',
            budget: 1250.50,
            budgetType: 'DAILY',
            audience: 'Interests: Marketing, Startup, SaaS. Age: 25-45. Geo: Brazil.',
            metrics: {
              spend: 1250.50,
              impressions: 45000,
              clicks: 850,
              conversions: 120,
              conversionValue: 0
            },
            ads: [
              {
                id: 'ad1',
                name: 'Banner Ebook 01',
                status: 'active',
                creative: {
                  id: 'cr1',
                  type: 'image',
                  url: 'https://picsum.photos/id/48/800/800',
                  headline: 'Escale seu SaaS com automação inteligente.'
                },
                metrics: {
                  spend: 1250.50,
                  impressions: 45000,
                  clicks: 850,
                  conversions: 120,
                  conversionValue: 0
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cmp2',
        name: 'Retargeting - Demo Request',
        status: 'active',
        platform: 'google',
        objective: 'Conversions',
        audience: 'Visitors 30D, Exclude Clients.',
        creative: {
          id: 'cr2',
          type: 'image',
          url: 'https://picsum.photos/id/60/800/450',
          headline: 'Ainda com dúvidas? Agende uma demo.'
        },
        metrics: {
          spend: 500.20,
          impressions: 12000,
          clicks: 300,
          conversions: 15,
          conversionValue: 0,
          demographics: MOCK_DEMOGRAPHICS_1
        },
        adSets: [
          {
            id: 'as2',
            name: 'Retargeting Visitors',
            status: 'active',
            budget: 500.20,
            budgetType: 'DAILY',
            audience: 'Visitors 30D, Exclude Clients.',
            metrics: {
              spend: 500.20,
              impressions: 12000,
              clicks: 300,
              conversions: 15,
              conversionValue: 0
            },
            ads: [
              {
                id: 'ad2',
                name: 'Banner Demo 01',
                status: 'active',
                creative: {
                  id: 'cr2',
                  type: 'image',
                  url: 'https://picsum.photos/id/60/800/450',
                  headline: 'Ainda com dúvidas? Agende uma demo.'
                },
                metrics: {
                  spend: 500.20,
                  impressions: 12000,
                  clicks: 300,
                  conversions: 15,
                  conversionValue: 0
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    name: 'Moda Vital',
    industry: 'E-commerce',
    avatar: 'https://picsum.photos/id/64/200/200',
    adAccountId: '',
    accessToken: '',
    lastSync: '2 horas atrás',
    campaigns: [
      {
        id: 'cmp3',
        name: 'Coleção Verão - Conversão',
        status: 'active',
        platform: 'tiktok',
        objective: 'Sales',
        audience: 'Fem, 18-34, Interests: Fashion, Zara, Shein.',
        creative: {
          id: 'cr3',
          type: 'image',
          url: 'https://picsum.photos/id/325/400/600',
          headline: 'O verão chegou! 30% OFF na nova coleção.'
        },
        metrics: {
          spend: 4500.00,
          impressions: 150000,
          clicks: 4500,
          conversions: 200,
          conversionValue: 18000.00,
          demographics: MOCK_DEMOGRAPHICS_2
        },
        adSets: [
          {
            id: 'as3',
            name: 'Interesses em Moda Feminina',
            status: 'active',
            budget: 4500,
            budgetType: 'DAILY',
            audience: 'Fem, 18-34, Interests: Fashion, Zara, Shein.',
            metrics: {
              spend: 4500,
              impressions: 150000,
              clicks: 4500,
              conversions: 200,
              conversionValue: 18000
            },
            ads: [
              {
                id: 'ad3',
                name: 'Video Lookbook 01',
                status: 'active',
                creative: {
                  id: 'cr3',
                  type: 'image',
                  url: 'https://picsum.photos/id/325/400/600',
                  headline: 'O verão chegou! 30% OFF na nova coleção.'
                },
                metrics: {
                  spend: 4500,
                  impressions: 150000,
                  clicks: 4500,
                  conversions: 200,
                  conversionValue: 18000
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cmp4',
        name: 'LAL 5% - Compradores',
        status: 'paused',
        platform: 'facebook',
        objective: 'Sales',
        audience: 'Lookalike 5% Purchasers 180D',
        creative: {
          id: 'cr4',
          type: 'image',
          url: 'https://picsum.photos/id/447/800/800',
          headline: 'Elegância e conforto para seus pés.'
        },
        metrics: {
          spend: 800.00,
          impressions: 25000,
          clicks: 200,
          conversions: 8,
          conversionValue: 1200.00,
          demographics: MOCK_DEMOGRAPHICS_2
        },
        adSets: [
          {
            id: 'as4',
            name: 'Público Semelhante 5%',
            status: 'paused',
            budget: 800,
            budgetType: 'DAILY',
            audience: 'Lookalike 5% Purchasers 180D',
            metrics: {
              spend: 800,
              impressions: 25000,
              clicks: 200,
              conversions: 8,
              conversionValue: 1200
            },
            ads: [
              {
                id: 'ad4',
                name: 'Carrossel de Produtos 01',
                status: 'paused',
                creative: {
                  id: 'cr4',
                  type: 'image',
                  url: 'https://picsum.photos/id/447/800/800',
                  headline: 'Elegância e conforto para seus pés.'
                },
                metrics: {
                  spend: 800,
                  impressions: 25000,
                  clicks: 200,
                  conversions: 8,
                  conversionValue: 1200
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'c3',
    name: 'Burger King Local',
    industry: 'Food & Beverage',
    avatar: 'https://picsum.photos/id/292/200/200',
    adAccountId: '',
    accessToken: '',
    lastSync: '1 dia atrás',
    campaigns: [
      {
        id: 'cmp5',
        name: 'Delivery - Fim de Semana',
        status: 'active',
        platform: 'facebook',
        objective: 'Messages',
        audience: 'Radius 5km, Interest: Fast Food, Burgers.',
        creative: {
          id: 'cr5',
          type: 'image',
          url: 'https://picsum.photos/id/225/800/800',
          headline: 'Fome de hambúrguer? Peça agora!'
        },
        metrics: {
          spend: 250.00,
          impressions: 15000,
          clicks: 600,
          conversions: 45,
          conversionValue: 1350.00,
          demographics: MOCK_DEMOGRAPHICS_1
        },
        adSets: [
          {
            id: 'as5',
            name: 'Local Radius 5km',
            status: 'active',
            budget: 250,
            budgetType: 'DAILY',
            audience: 'Radius 5km, Interest: Fast Food, Burgers.',
            metrics: {
              spend: 250,
              impressions: 15000,
              clicks: 600,
              conversions: 45,
              conversionValue: 1350
            },
            ads: [
              {
                id: 'ad5',
                name: 'Anúncio Messenger 01',
                status: 'active',
                creative: {
                  id: 'cr5',
                  type: 'image',
                  url: 'https://picsum.photos/id/225/800/800',
                  headline: 'Fome de hambúrguer? Peça agora!'
                },
                metrics: {
                  spend: 250,
                  impressions: 15000,
                  clicks: 600,
                  conversions: 45,
                  conversionValue: 1350
                }
              }
            ]
          }
        ]
      }
    ]
  }
];
