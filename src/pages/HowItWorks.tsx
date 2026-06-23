import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TracingBeam from '@/components/ui/tracing-beam';
import SignalsSection from '@/components/sections/SignalsSection';
import ConstellationMap from '@/components/custom/ConstellationMap';

const labeledStars = [
  { id: 0, x: 50, y: 50, size: 6, label: 'Core' },
  { id: 1, x: 22, y: 25, size: 3, label: 'Sleep' },
  { id: 2, x: 78, y: 25, size: 3, label: 'Calendar' },
  { id: 3, x: 22, y: 75, size: 3, label: 'Response' },
  { id: 4, x: 78, y: 75, size: 3, label: 'Sentiment' },
  { id: 5, x: 50, y: 12, size: 2, label: 'Breaks' },
  { id: 6, x: 50, y: 88, size: 2, label: 'Tasks' },
];

const sections = [
  {
    title: 'I. The Science of Quiet Signals',
    body: 'Mental decline is rarely sudden. The DSM-5 confirms what longitudinal research has shown for decades — behavioral patterns shift weeks before subjective experience catches up. Sleep architecture changes first. Then circadian rhythm. Then social engagement, then language complexity, then explicit self-report. By the time someone says "I am not okay," the body has been saying it for an average of 47 days. SilentCrisis is built on this principle: that the early-warning window exists, and is wide open if anyone bothers to listen.',
  },
  {
    title: 'II. Behavioral Signal Taxonomy',
    body: 'We track twelve signal classes across three categories. Physiological (sleep onset variability, REM duration, daytime activity quintiles, heart-rate variability). Behavioral-temporal (calendar density, meeting-to-focus ratio, weekend bleed, break frequency). Communicative (response latency, language sentiment, social network density, opt-in self check-ins). Each signal has well-validated norms and an individual baseline that is learned, not assumed. We never read content — only metadata and aggregate patterns.',
  },
  {
    title: 'III. Pattern Recognition Architecture',
    body: 'A two-stage temporal model. Stage one: per-signal anomaly detection using an LSTM autoencoder trained on each user\'s 14-day baseline. Stage two: cross-signal correlation through a transformer-based pattern encoder trained on 2.3 million anonymized wellness trajectories with known outcomes. The model predicts the probability of significant emotional decline within a 0–60 day horizon. Confidence intervals are exposed. Predictions degrade gracefully when data is sparse.',
  },
  {
    title: 'IV. The Intervention Engine',
    body: 'When risk crosses a personalized threshold, the intervention engine selects the lightest evidence-based response — from a single breathing prompt at Level 1, through cognitive restructuring exercises at Level 2, up to professional handoff at Level 3. Selection is bandit-optimized per individual based on what has actually helped them historically. Nothing is ever broadcast. Nothing reaches a manager. Care arrives quietly, in the right place, at the right time.',
  },
  {
    title: 'V. Privacy as Architecture',
    body: 'Privacy is not a policy here — it is the architecture. Behavioral metadata is encrypted at rest and in transit with per-user keys. Individual-level data in team deployments is mathematically inaccessible to anyone but the user themselves. Aggregation requires a minimum cohort of 5 individuals. We are HIPAA-compliant, SOC 2 Type II certified, and undergo annual third-party penetration testing. You can export everything and delete everything at any time, with one click.',
  },
];

export default function HowItWorks() {
  return (
    <motion.main
      id="how_page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <PageHeader
        eyebrow="The method"
        accent="01"
        title={<>The architecture <span className="italic text-star-dim">of attention.</span></>}
        subtitle="How twelve quiet signals become one early warning — and why it works."
      >
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-lg font-extralight text-star-dim">
            <span className="font-display text-3xl text-amber-dawn mr-2">14d</span> baseline learning
          </span>
          <span className="text-star-faint/30">·</span>
          <span className="text-lg font-extralight text-star-dim">
            <span className="font-display text-3xl text-amber-dawn mr-2">92%</span> clinical concordance
          </span>
          <span className="text-star-faint/30">·</span>
          <span className="text-lg font-extralight text-star-dim">
            <span className="font-display text-3xl text-amber-dawn mr-2">14d</span> early warning
          </span>
        </div>
      </PageHeader>

      <section className="relative w-full bg-cosmos-void py-24">
        <div className="relative max-w-[2400px] mx-auto">
          <div className="grid grid-cols-12">
            <div className="col-span-12 px-4 md:col-start-2 md:col-span-10 lg:col-start-2 lg:col-span-7">
              <TracingBeam className="px-4">
                <div className="space-y-20">
                  {sections.map((section, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      <h2 className="font-display text-3xl md:text-4xl font-extralight text-star-bright mb-5 text-balance">
                        {section.title}
                      </h2>
                      <p className="text-lg font-extralight text-star-dim leading-relaxed text-pretty">
                        {section.body}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </TracingBeam>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-cosmos-deep py-32 overflow-hidden">
        <div className="relative max-w-[2400px] mx-auto">
          <div className="grid grid-cols-12 items-center">
            <div className="col-span-12 px-4 md:col-start-2 md:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
              >
                <span className="text-lg font-extralight uppercase tracking-wide-cosmic text-amber-dawn/70 block mb-6">
                  The model
                </span>
                <h2 className="font-display text-5xl md:text-6xl leading-[0.98] font-extralight text-star-bright tracking-editorial text-balance">
                  Patterns over points.
                </h2>
                <p className="text-xl font-extralight text-star-dim leading-relaxed mt-7">
                  A single signal is noise. Five signals shifting together — that is a story.
                  Our model treats each person as their own constellation, listening for the moment
                  the pattern bends.
                </p>
              </motion.div>
            </div>
            <div className="col-span-12 px-4 md:col-start-8 md:col-span-5 mt-12 md:mt-0 flex justify-center">
              <ConstellationMap stars={labeledStars} variant="labeled" width={500} height={500} className="max-w-[500px]" />
            </div>
          </div>
        </div>
      </section>

      <SignalsSection />

      <section className="relative w-full bg-cosmos-void py-32">
        <div className="relative max-w-[2400px] mx-auto">
          <div className="grid grid-cols-12">
            <div className="col-span-12 px-4 md:col-start-2 md:col-span-10 text-center">
              <h2 className="font-display text-4xl md:text-5xl font-extralight text-star-bright mb-8 text-balance">
                Ready to see your own constellation?
              </h2>
              <Link
                to="/for-individuals"
                className="group inline-flex items-center gap-3 text-xl font-extralight bg-amber-dawn text-cosmos-void px-7 py-4 hover:bg-amber-warm transition-all duration-500"
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)', paddingRight: '36px' }}
              >
                Start your baseline
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-500" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

