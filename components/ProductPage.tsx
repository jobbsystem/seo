import React from 'react';
import { ArrowRightIcon, CheckCircleIcon, CursorArrowRaysIcon, BoltIcon, RectangleGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface ProductPageProps {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  color: string;
  ctaLabel?: string;
  ctaNote?: string;
  features?: { title: string; desc: string }[];
  secondaryHeading?: string;
  secondaryIntro?: string;
  secondaryCtaTitle?: string;
  secondaryCtaLabel?: string;
  accentClass?: string;
  heroAccentClass?: string;
}

const ProductPage: React.FC<ProductPageProps> = ({
  title,
  subtitle,
  description,
  benefits,
  ctaLabel,
  ctaNote,
  features,
  secondaryHeading,
  secondaryIntro,
  secondaryCtaTitle,
  secondaryCtaLabel,
  accentClass = 'from-accent to-accent',
  heroAccentClass = 'from-accent/20 via-transparent to-transparent'
}) => {
  const defaultFeatures = [
    {
      title: "Målgruppsoptimering",
      desc: "Sluta slösa pengar. Vi når exakt de kunder som är mest benägna att konvertera."
    },
    {
      title: "Konverteringsoptimering",
      desc: "Vi skapar annonser som inte bara får klick, utan som förvandlar besökare till lojala kunder."
    },
    {
      title: "Budstrategier",
      desc: "Genom smarta, datadrivna budstrategier maximerar vi din avkastning."
    },
    {
      title: "Kampanjövervakning",
      desc: "Dina kampanjer övervakas dagligen av våra experter."
    }
  ];
  const featureList = features && features.length > 0 ? features : defaultFeatures;
  const featureIcons = [CursorArrowRaysIcon, BoltIcon, RectangleGroupIcon, ShieldCheckIcon];
  const noteParts = (ctaNote || '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
  const activationNote = noteParts[0] || 'Aktiveras inom 5 arbetsdagar';
  const secondaryNote = noteParts[1] || '';

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 pb-8 animate-fade-in pt-3 sm:pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <GlassCard className="lg:col-span-7 p-4 sm:p-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold mb-3">Tjänst</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            {title} <span className="text-accent">{subtitle}</span>
          </h1>
          <p className="text-slate-600 mt-3 leading-relaxed text-sm sm:text-base">
            {description}
          </p>
        </GlassCard>

        <GlassCard className="lg:col-span-5 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Service Overview</div>
            <Badge className="px-3 py-1 text-[10px] font-semibold uppercase">Aktiv</Badge>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Aktiveras inom</span>
              <span className="text-slate-900 font-medium">{activationNote}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Senast uppdaterad</span>
              <span className="text-slate-900 font-medium">Idag</span>
            </div>
            {secondaryNote && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Uppföljning</span>
                <span className="text-slate-900 font-medium">{secondaryNote}</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Button
              variant="primary"
              className="w-full h-10 sm:h-11 justify-center bg-accent! text-white/95! hover:bg-accent/90!"
            >
              {ctaLabel || 'Aktivera tjänst'} <ArrowRightIcon className="h-4 w-4" />
            </Button>
            {secondaryCtaLabel && (
              <Button
                variant="secondary"
                className="w-full h-10 sm:h-11 justify-center cta-outline text-sm font-semibold"
              >
                {secondaryCtaLabel}
              </Button>
            )}
            {ctaNote && (
              <p className="text-[11px] sm:text-xs text-slate-500 text-center">{ctaNote}</p>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <GlassCard className="p-4 sm:p-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold mb-3">Allt du behöver</div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Allt du behöver för att lyckas</h3>
          <p className="text-slate-600 mb-4 text-sm sm:text-base">Vi kombinerar datadrivna insikter med kreativ kvalitet för att skapa kampanjer som faktiskt fungerar.</p>
          <div className="space-y-2.5 sm:space-y-3">
            {featureList.map((feature, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
                <Feature
                  key={`${feature.title}-${index}`}
                  icon={Icon}
                  title={feature.title}
                  desc={feature.desc}
                />
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold mb-3">Process</div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">{secondaryHeading || 'Varför välja oss?'}</h3>
          <p className="text-slate-600 mb-4 text-sm sm:text-base">{secondaryIntro || 'Vi följer en beprövad process som säkerställer att din investering ger maximal utdelning över tid.'}</p>
          <div className="space-y-2 sm:space-y-2.5">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex gap-3 items-start bg-slate-900/5 p-2 sm:p-2.5 rounded-xl">
                <CheckCircleIcon className="text-accent w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium text-sm sm:text-base">{benefit}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const Feature = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex gap-4">
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] flex items-center justify-center text-accent shrink-0">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
    <div>
      <h4 className="font-semibold text-slate-900 text-sm mb-0.5">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default ProductPage;
