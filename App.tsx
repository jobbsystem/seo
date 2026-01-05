import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SeoPage from './components/SeoPage';
import SupportPage from './components/SupportPage';
import FilesPage from './components/FilesPage';
import NewsPage from './components/NewsPage';
import ProductPage from './components/ProductPage';
import LoginPage from './components/LoginPage';
import InvoicesPage from './components/InvoicesPage';
import SettingsPage from './components/SettingsPage';
import AdminPanel from './components/AdminPanel';
import { View } from './types';
import { CURRENT_USER } from './constants';
import { adminRepo } from './components/api/AdminRepository';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [currentUserName, setCurrentUserName] = useState(CURRENT_USER.name);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRoute, setAdminRoute] = useState<{ page: 'dashboard' | 'drafts' | 'customers' | 'notifications' | 'review' | 'messages'; customerId?: string; month?: string }>({ page: 'dashboard' });

  const deriveNameFromEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return CURRENT_USER.name;
    const localPart = trimmed.split('@')[0] || '';
    const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
    if (!cleaned) return CURRENT_USER.name;
    return cleaned
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  // Simple auth flow handler
  // Simple auth flow handler
  const handleLogin = async (email: string, password?: string) => {
    const isAdminLogin = email.trim().toLowerCase() === 'admin@admin.se';

    // Verify credentials if password is provided (or force for non-admin in future)
    if (password) {
      const isValid = await adminRepo.verifyUser(email, password);
      if (!isValid) {
        alert('Felaktigt lösenord eller användarnamn.');
        return;
      }
    }

    setIsAdmin(isAdminLogin);
    setCurrentUserName(isAdminLogin ? 'Admin' : deriveNameFromEmail(email));
    setCurrentUserEmail(email); // Set email
    setIsLoggedIn(true);
    if (isAdminLogin) {
      setAdminRoute({ page: 'dashboard' });
    } else {
      setCurrentView(View.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUserName('');
    setCurrentUserEmail('');
    setCurrentView(View.LOGIN);
  };

  if (!isLoggedIn) {
    return (
      <LoginPage onLogin={handleLogin} />
    );
  }

  if (isAdmin) {
    return <AdminPanel onLogout={handleLogout} route={adminRoute} onRouteChange={setAdminRoute} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} currentUserName={currentUserName} currentUserEmail={currentUserEmail} />;
      case View.SEO:
        return <SeoPage initialTab="report" />;
      case View.ACTION_PLAN:
        return <SeoPage initialTab="plan" />;
      case View.SUPPORT:
        return <SupportPage />;
      case View.FILES:
        return <FilesPage />;
      case View.NEWS:
        return <NewsPage />;
      case View.INVOICES:
        return <InvoicesPage />;
      case View.SETTINGS:
        return <SettingsPage email={currentUserEmail} />;
      case View.PRODUCT_GOOGLE:
        return (
          <ProductPage
            title="Dominera sökresultaten med"
            subtitle="Google Ads"
            description="Vi maximerar er synlighet precis där era kunder letar. Genom datadriven budgivning och kontinuerlig optimering säkerställer vi lönsam tillväxt och högkvalitativa leads."
            benefits={[
              "Strategi & Analys: Vi kartlägger era mest lönsamma sökord och konkurrenter.",
              "Setup & Struktur: Granulär kontostruktur för maximal kvalitets-score och lägre klickpriser.",
              "Optimering & Skalning: Daglig justering av bud och annonstexter för att öka ROI."
            ]}
            features={[
              {
                title: "Datadriven budgivning",
                desc: "Vi använder avancerad data för att buda smartare än konkurrenterna."
              },
              {
                title: "Säljande annonskopia",
                desc: "Skräddarsydda annonstexter som maximerar klickfrekvens och kvalitet."
              },
              {
                title: "Konverteringsspårning",
                desc: "Vi mäter exakt vad varje krona ger tillbaka i faktisk affärsnytta."
              },
              {
                title: "Proaktiv optimering",
                desc: "Vi jagar ständigt nya möjligheter att sänka er anskaffningskostnad."
              }
            ]}
            ctaLabel="Starta Google Ads"
            ctaNote="Snabb uppstart | Full transparens"
            secondaryHeading="Resultatfokus från dag ett"
            secondaryIntro="Vi arbetar uteslutande med mätbara mål och transparent rapportering."
            accentClass="from-blue-700 to-blue-400"
            heroAccentClass="from-blue-500/20 via-white to-transparent"
            color="bg-blue-500"
          />
        );
      case View.PRODUCT_META:
        return (
          <ProductPage
            title="Skapa ha-begär med"
            subtitle="Meta Ads (Facebook & Instagram)"
            description="Nå er målgrupp där de spenderar sin tid. Vi skapar träffsäkra kampanjer som bygger varumärke och driver direkt försäljning genom avancerad målgruppsstyrning."
            benefits={[
              "Målgruppsprecision: Vi hittar tvillingar till era bästa kunder (Lookalikes).",
              "Kreativ som konverterar: Vi designar annonser som stoppar scrollen och väcker köpintresse.",
              "Retargeting: Fånga upp besökare som inte handlade direkt och gör dem till kunder."
            ]}
            features={[
              {
                title: "Visuell storytelling",
                desc: "Reels, Stories och bilder som kommunicerar ert varumärkes känsla."
              },
              {
                title: "AI-driven targeting",
                desc: "Utnyttja Metas AI för att hitta köpare som är redo att handla."
              },
              {
                title: "Full-funnel strategi",
                desc: "Vi bygger flöden som värmer upp kalla leads till lojala kunder."
              },
              {
                title: "Datadriven kreativitet",
                desc: "Vi testar ständigt nya vinklar för att hitta vinnarna."
              }
            ]}
            ctaLabel="Starta Meta Ads"
            ctaNote="Kreativ produktion ingår | Månadsvis optimering"
            secondaryHeading="Kreativitet möter data"
            secondaryIntro="Vi kombinerar det bästa av två världar: engagerande content och knivskarp analys."
            accentClass="from-purple-700 to-pink-500"
            heroAccentClass="from-purple-500/20 via-white to-transparent"
            color="bg-purple-500"
          />
        );
      case View.PRODUCT_AI_SEO:
        return (
          <ProductPage
            title="Framtidssäkra er synlighet i"
            subtitle="AI-svar"
            description="Bli det självklara svaret när era kunder frågar AI. Vi optimerar ert innehåll för att citeras av ChatGPT, Gemini och Perplexity, vilket bygger maximal auktoritet och fångar den nya tidens sökningar."
            benefits={[
              "Synlighet i AI-erans sök: Var med där besluten fattas innan kunden ens googlar.",
              "Auktoritet & Trust: Att bli citerad av AI stärker ert varumärkes trovärdighet enormt.",
              "Konvertering från svar: Vi utformar innehåll som leder användaren från AI-svaret direkt till er."
            ]}
            features={[
              {
                title: "Frågeanalys & Intent",
                desc: "Vi listar frågorna era kunder ställer till AI och skapar de perfekta svaren."
              },
              {
                title: "Semantisk optimering",
                desc: "Vi strukturerar data så att språkmodeller förstår och prioriterar ert innehåll."
              },
              {
                title: "Entity Authority",
                desc: "Vi bygger ert varumärkes koppling till relevanta ämnen i AI:s kunskapsgraf."
              },
              {
                title: "Bevakning & Rapportering",
                desc: "Vi spårar hur ofta ni nämns i AI-genererade svar (GEO-tracking)."
              }
            ]}
            ctaLabel="Starta AI-SEO-optimering"
            ctaNote="Först till kvarn - ta positionen"
            secondaryHeading="Var först på bollen"
            secondaryIntro="AI-sök växer explosivt. Etablera er som källan nu, innan konkurrenterna vaknar."
            accentClass="from-indigo-700 to-indigo-400"
            heroAccentClass="from-indigo-500/20 via-white to-transparent"
            color="bg-indigo-600"
          />
        );
      case View.PRODUCT_WEBSITE:
        return (
          <ProductPage
            title="En webbplats byggd för"
            subtitle="Konvertering"
            description="Er webbplats är navet i er digitala affär. Vi bygger blixtsnabba, användarvänliga och säljande webbplatser som förvandlar besökare till betalande kunder."
            benefits={[
              "UX & Design: Intuitiva flöden som leder besökaren raka vägen till köpknappen.",
              "Performance: Blixtsnabb laddningstid som rankar högre och säljer mer.",
              "Skalbarhet: En plattform som växer med din affär, utan teknisk skuld."
            ]}
            features={[
              {
                title: "Konverteringsfokus",
                desc: "Varje pixel är designad för att maximera era affärslål."
              },
              {
                title: "Teknisk perfektion",
                desc: "Core Web Vitals i toppklass och 100% SEO-vänlig kod."
              },
              {
                title: "Mobile First",
                desc: "En sömlös upplevelse oavsett om kunden använder mobil, platta eller desktop."
              },
              {
                title: "Enkel administration",
                desc: "Full kontroll över ert innehåll utan att behöva ringa en utvecklare."
              }
            ]}
            ctaLabel="Starta hemsideprojekt"
            ctaNote="Fast pris | Lansering inom 4-6 veckor"
            secondaryHeading="Från skiss till succé"
            secondaryIntro="Vi tar helhetsansvaret – från strategi och design till utveckling och lansering."
            accentClass="from-gray-900 to-gray-600"
            heroAccentClass="from-gray-300/40 via-white to-transparent"
            color="bg-gray-800"
          />
        );
      case View.PRODUCT_CONTENT:
        return (
          <ProductPage
            title="Innehåll som bygger"
            subtitle="Auktoritet & Affär"
            description="Ordet säljer. Vi producerar sökordsoptimerat innehåll som både Google och era kunder älskar – från djupgående guider till säljande produkttexter."
            benefits={[
              "Traffic & Trust: Välskrivet innehåll som rankar högt och skapar förtroende hos besökaren.",
              "Konverterande Copy: Vi vet hur man skriver för att få läsaren att agera.",
              "Kontinuitet: Regelbunden publicering som signalerar att ni är ledande i er bransch."
            ]}
            features={[
              {
                title: "Strategisk planering",
                desc: "Vi tar fram en content-plan baserad på vad era kunder faktiskt söker efter."
              },
              {
                title: "Professionella skribenter",
                desc: "Våra copywriters är experter på att balansera SEO-krav med läsbarhet och sälj."
              },
              {
                title: "Internlänkstruktur",
                desc: "Vi bygger en väv av relevans som stärker hela er webbplats auktoritet."
              },
              {
                title: "Optimering & Revidering",
                desc: "Vi nöjer oss inte. Vi går tillbaka, mäter och förbättrar för maximal effekt."
              }
            ]}
            ctaLabel="Beställ SEO-texter"
            ctaNote="Leverans inom 7-14 dagar | Nöjd-kund-garanti"
            secondaryHeading="Content Marketing som fungerar"
            secondaryIntro="Lämna skrivandet till oss. Du får färdigt material, optimerat och klart för publicering."
            accentClass="from-amber-700 to-orange-400"
            heroAccentClass="from-amber-400/25 via-white to-transparent"
            color="bg-amber-500"
          />
        );
      default:
        return (
          <ProductPage
            title="Utöka din digitala"
            subtitle="Närvaro"
            description="Denna produkt är redo att aktiveras. Kontakta din specialist för att komma igång."
            benefits={["Snabb aktivering.", "Integration med befintlig strategi.", "Dedikerad support."]}
            color="bg-brand"
          />
        );
    }
  };

  return (
    <Layout
      currentView={currentView}
      onChangeView={setCurrentView}
      onLogout={handleLogout}
      currentUserName={currentUserName}
      isAdmin={isAdmin}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
