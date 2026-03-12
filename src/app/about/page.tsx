'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';

// ── Bullet point item ──────────────────────────────────────────────────
function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-slate-300 text-[15px] leading-relaxed">
      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_2px_rgba(34,211,238,0.6)]" />
      {children}
    </li>
  );
}

// ── Fade-in animation variants ─────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.11, duration: 0.55, ease: 'easeOut' as const },
  }),
};

export default function AboutPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: '#0b0f19' }}
    >
      {/* ── Grid background ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Radial glow blobs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6d28d9 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-5 py-20 max-w-3xl">

        {/* ── Heading ── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase text-cyan-400 mb-3 block">
            Creator &amp; Developer
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            About{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #38bdf8 100%)' }}
            >
              Me
            </span>
          </h1>
          {/* glowing divider */}
          <div className="mt-4 h-px w-48"
            style={{
              background: 'linear-gradient(90deg, #6d28d9, #0ea5e9, transparent)',
              boxShadow: '0 0 12px 2px rgba(99,102,241,0.5)',
            }} />
        </motion.div>

        {/* ── Text content ── */}
        <div className="flex flex-col gap-6">
          <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-slate-300 text-[15px] leading-relaxed">
            Hi, I&apos;m{' '}
            <span className="text-white font-semibold">Amit</span>, the creator of{' '}
            <span className="text-indigo-400 font-semibold">AIMLVerse</span>
            {' '}— a space where curiosity about Artificial Intelligence turns into experiments, models,
            and real understanding.
          </motion.p>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="text-slate-300 text-[15px] leading-relaxed">
            I&apos;m a{' '}
            <span className="text-white font-semibold">Computer Science student</span>{' '}
            with a deep interest in{' '}
            <span className="text-cyan-400 font-medium">Artificial Intelligence, Machine Learning, Deep Learning,
            mathematics, and the algorithms that shape intelligent systems</span>.
            While many people see AI as a trend, I see it as a{' '}
            <span className="text-white font-semibold">discipline that combines logic, mathematics,
            and creativity to build systems that can reason, learn, and adapt</span>.
          </motion.p>

          <motion.p custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="text-slate-300 text-[15px] leading-relaxed">
            <span className="text-indigo-400 font-semibold">AIMLVerse</span> started as my personal
            project — a place to document what I build, what I learn, and what I question. Over time
            it evolved into something bigger: a platform where complex AI ideas are explored,
            broken down, and rebuilt through experimentation.
          </motion.p>

          <motion.p custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="text-slate-300 text-[15px] leading-relaxed">
            My focus is not just on using AI tools but on{' '}
            <span className="text-white font-semibold">understanding how they actually work
            beneath the surface</span>{' '}— from neural networks and transformers to
            optimization, representation learning, and model behavior.
          </motion.p>

          {/* ── Bullet section ── */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <p className="text-slate-400 text-sm mb-3">You will often find me experimenting with:</p>
            <ul className="flex flex-col gap-2.5 pl-0">
              <BulletItem>Neural network architectures</BulletItem>
              <BulletItem>Transformer-based language models</BulletItem>
              <BulletItem>Computer vision systems</BulletItem>
              <BulletItem>Model interpretability and reasoning</BulletItem>
              <BulletItem>AI experiments and technical breakdowns</BulletItem>
            </ul>
          </motion.div>

          {/* ── Philosophy quote ── */}
          <motion.blockquote custom={6} variants={fadeUp} initial="hidden" animate="visible"
            className="border-l-2 pl-4 py-1" style={{ borderColor: '#6d28d9' }}>
            <p className="text-slate-300 text-[15px] leading-relaxed italic">
              For me, AI is not magic. It is{' '}
              <span className="text-white font-semibold not-italic">mathematics, structure,
              and carefully engineered intelligence</span>.
            </p>
          </motion.blockquote>

          {/* ── Developer Note ── */}
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl border border-indigo-500/20 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(17,24,39,0.9) 100%)',
              boxShadow: '0 0 32px rgba(109,40,217,0.12)',
            }}
          >
            {/* Terminal header bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/60"
              style={{ background: 'rgba(30,41,59,0.6)' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs text-slate-500 font-mono">developer_note.md</span>
            </div>
            {/* Note content */}
            <div className="px-5 py-5 flex flex-col gap-3">
              <p className="text-xs font-mono text-cyan-400/70 uppercase tracking-widest">// Developer Note</p>
              <p className="text-slate-300 text-[14px] leading-relaxed">
                If you&apos;re reading this, you&apos;re probably someone who cares about how things
                actually work{' '}<span className="text-indigo-400">..... not just how to use them.</span>
              </p>
              <p className="text-slate-300 text-[14px] leading-relaxed font-medium">
                That&apos;s exactly who AIMLVerse is built for.
              </p>
              <p className="text-slate-300 text-[14px] leading-relaxed">
                Every page, visual, and experiment here is built from scratch. No shortcuts.
                No recycled tutorials. Just genuine exploration of ideas, mathematics,
                and the systems that make{' '}
                <span className="text-indigo-400 font-medium">intelligence possible</span>.
              </p>
              <p className="text-slate-400 text-[13px] font-mono mt-2">
                — Amit<br/>
                <span className="text-cyan-500">Computer Science Student · AI Researcher · Builder</span>
              </p>
            </div>
          </motion.div>

          {/* ── Contact Me button ── */}
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible"
            className="flex justify-start pt-2">
            <a
              href="https://mail.google.com/mail/?view=cm&to=1amit23verma@gmail.com"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(14,165,233,0.2) 100%)',
                border: '1px solid rgba(99,102,241,0.4)',
                boxShadow: '0 0 24px rgba(109,40,217,0.2)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 36px rgba(109,40,217,0.45), 0 0 12px rgba(56,189,248,0.2)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(129,140,248,0.7)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 24px rgba(109,40,217,0.2)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(99,102,241,0.4)';
              }}
            >
              {/* icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Contact Me
              {/* arrow */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-indigo-400 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </motion.div>
        </div>

        {/* ── Bottom section ── */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-16 flex flex-col gap-5 text-center">
          <div className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(56,189,248,0.5), transparent)' }} />

          <p className="text-slate-300 text-[15px] leading-relaxed">
            <span className="text-indigo-400 font-semibold">AIMLVerse</span> is where I share that
            journey — the experiments, the insights, the failures, and the breakthroughs that come
            from trying to understand machines that learn.
          </p>

          <p className="text-slate-300 text-[15px] leading-relaxed">
            I believe the most exciting discoveries in AI are not made by people who only consume
            technology, but by those who{' '}
            <span className="text-white font-semibold">build, question, and challenge it</span>.
          </p>

          <p className="text-slate-300 text-[15px] leading-relaxed">
            So if you&apos;re interested in{' '}
            <span className="text-cyan-400 font-medium">AI, machine learning, deep learning,
            and the mathematics behind intelligence</span>, AIMLVerse is a place where
            those ideas are explored without shortcuts.
          </p>

          {/* ── Final statement card ── */}
          <div
            className="mt-6 p-6 rounded-2xl border border-indigo-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(109,40,217,0.08) 0%, rgba(14,165,233,0.06) 100%)',
              boxShadow: '0 0 40px rgba(109,40,217,0.15), inset 0 0 40px rgba(14,165,233,0.04)',
            }}
          >
            <p className="text-slate-400 text-sm mb-1">This is not just a blog.</p>
            <p className="text-xl font-bold text-white mb-4">
              This is a{' '}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #38bdf8)' }}>
                lab for ideas about intelligent machines
              </span>.
            </p>
            <p className="text-slate-300 text-base">
              Welcome to{' '}
              <span className="text-white font-extrabold tracking-tight text-lg">AIMLVerse</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
