import { ProviderDefinition } from "../types/agency";

export const PROVIDER_CATALOG: ProviderDefinition[] = [
    {
        id: 'google_search_console',
        name: 'Google Search Console',
        subtitle: 'Sökord, klick och organisk synlighet',
        authType: 'oauth',
        icon: 'https://www.google.com/s2/favicons?domain=search.google.com&sz=128',
        requiredMetaFields: [
            { key: 'gscProperty', label: 'Egendom (Property)', placeholder: 'sc-domain:example.com', helperText: 'Välj egendom från listan efter inloggning.' }
        ]
    },
    {
        id: 'google_analytics_4',
        name: 'Google Analytics 4',
        subtitle: 'Trafik, händelser och konverteringar',
        authType: 'oauth',
        icon: 'https://www.google.com/s2/favicons?domain=analytics.google.com&sz=128',
        requiredMetaFields: [
            { key: 'ga4PropertyId', label: 'Property ID', placeholder: '123456789', helperText: 'Det numeriska ID:t för GA4-egendomen.' }
        ]
    },
    {
        id: 'semrush',
        name: 'Semrush',
        subtitle: 'Konkurrentanalys och sökordspositioner',
        authType: 'apiKey',
        icon: 'https://www.google.com/s2/favicons?domain=semrush.com&sz=128',
        requiredMetaFields: [
            { key: 'projectId', label: 'Project ID', placeholder: '123456', helperText: 'ID för Tracking-kampanjen i Semrush API.' },
            { key: 'domain', label: 'Tracking Domain', placeholder: 'example.com', helperText: 'Domänen som bevakas (valfritt, för verifiering).' }
        ],
        testEndpointHint: 'V3/keywords_database'
    },
    {
        id: 'pagespeed_insights',
        name: 'PageSpeed Insights',
        subtitle: 'Prestandamätning (Core Web Vitals)',
        authType: 'apiKey',
        icon: 'https://www.google.com/s2/favicons?domain=pagespeed.web.dev&sz=128',
        requiredMetaFields: [
            { key: 'targetUrl', label: 'Mål-URL', placeholder: 'https://www.example.com', helperText: 'Lämna tomt för att använda kundens huvuddomän.' },
            { key: 'strategy', label: 'Enhet', placeholder: 'mobile', helperText: 'mobile eller desktop (standard: mobile)' }
        ],
        testEndpointHint: 'runPagespeed'
    },
    {
        id: 'looker_studio',
        name: 'Looker Studio',
        subtitle: 'Visualisera data och rapporter',
        authType: 'apiKey',
        icon: 'https://cdn.simpleicons.org/looker/4285F4',
        requiredMetaFields: [
            { key: 'embedUrl', label: 'Embed URL', placeholder: 'https://lookerstudio.google.com/embed/reporting/...', helperText: 'Klistra in Embed URL för kundens rapport.' }
        ]
    },
    {
        id: 'seranking',
        name: 'SE Ranking',
        subtitle: 'Rank tracking och SEO audit',
        authType: 'apiKey',
        icon: 'https://www.google.com/s2/favicons?domain=seranking.com&sz=128',
        requiredMetaFields: [
            { key: 'projectId', label: 'SE Ranking Project ID', placeholder: '123456', helperText: 'ID för det specifika projektet i SE Ranking (hittas i URLen).' }
        ]
    }
];

export const OTHER_PROVIDERS: ProviderDefinition[] = [
    {
        id: 'ahrefs', // Note: Not in primary list but often requested, kept for future or mapped to 'moz'/'majestic' if needed
        name: 'Ahrefs',
        subtitle: 'Backlinks och keyword research',
        authType: 'apiKey',
        icon: 'https://www.google.com/s2/favicons?domain=ahrefs.com&sz=128',
        requiredMetaFields: []
    } as any,
    // Using 'as any' temporarily if ID not in main union or adding more later
    {
        id: 'majestic',
        name: 'Majestic',
        subtitle: 'Backlink intelligence',
        authType: 'apiKey',
        icon: 'https://www.google.com/s2/favicons?domain=majestic.com&sz=128',
        requiredMetaFields: []
    },
    {
        id: 'moz',
        name: 'Moz',
        subtitle: 'Domain Authority och länkar',
        authType: 'apiKey',
        icon: 'https://www.google.com/s2/favicons?domain=moz.com&sz=128',
        requiredMetaFields: []
    }
];
