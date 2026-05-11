import { GlowyWavesHero } from './ui/glowy-waves-hero-shadcnui';
import { CategoryList } from './ui/category-list';
import type { Category } from './ui/category-list';
import GlassButton from './ui/glass-button';
import Footer1 from './ui/footer-1';
import { Blocks, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const features: Category[] = [
  {
    id: 1,
    title: 'Instant Conversion',
    subtitle: 'Paste your logic and watch the flowchart render in real-time. No manual drawing required.',
    icon: <ArrowRight className="w-8 h-8" />,
    featured: true,
  },
  {
    id: 2,
    title: 'Multi-Language Support',
    subtitle: 'Seamlessly interpret Python, JavaScript, Go, and more. Our parser understands your syntax.',
    icon: <ArrowRight className="w-8 h-8" />,
  },
  {
    id: 3,
    title: 'High-Res Export',
    subtitle: 'Export production-ready SVGs or PNGs instantly for documentation and presentations.',
    icon: <ArrowRight className="w-8 h-8" />,
  },
];

export const HomePage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const toggleTheme = useStore(state => state.toggleTheme);
  const theme = useStore(state => state.theme);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col overflow-auto">
      {/* ============ NAVBAR — Clean & Minimal ============ */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-background/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
          {/* Left — Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary via-primary/80 to-foreground/70 bg-clip-text text-transparent transition-all duration-300 group-hover:from-primary group-hover:to-primary/60" style={{ fontFamily: "'Geist', sans-serif" }}>
              FlowZen
            </span>
          </a>

          {/* Right — Theme Toggle + Get Started */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2.5 rounded-full bg-white/[0.06] dark:bg-white/[0.04] border border-white/10 backdrop-blur-sm text-foreground/60 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-outlined text-[18px] block">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Get Started — Glass Button */}
            <GlassButton
              onClick={onGetStarted}
              label="Get Started"
              size="sm"
            />
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      <main className="flex-grow">
        {/* ============ HERO SECTION ============ */}
        <div id="product">
          <GlowyWavesHero onGetStarted={onGetStarted} />
        </div>

        {/* ============ FEATURES SECTION ============ */}
        <div id="features">
          <CategoryList
            title="Explore Our"
            subtitle="Core Features"
            categories={features}
            headerIcon={<Blocks className="w-8 h-8" />}
          />
        </div>

        {/* ============ WORKSPACE SHOWCASE ============ */}
        <section id="workspace" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
              The Workspace
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              A developer-centric environment built for focus and clarity.
            </p>
          </div>

          {/* Code + Flowchart Preview */}
          <div className="rounded-xl border border-border overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[480px] bg-card">
            {/* Code Editor Side */}
            <div className="w-full md:w-1/2 bg-[#0d1117] dark:bg-[#0a0f18] border-b md:border-b-0 md:border-r border-border flex flex-col relative">
              <div className="bg-[#161b22] dark:bg-[#111720] border-b border-border/50 px-4 py-2.5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                <span className="ml-4 text-[#8b949e] text-xs font-mono">logic.js</span>
              </div>
              <div className="p-4 sm:p-6 font-mono text-sm flex-grow overflow-auto flex">
                <div className="text-[#8b949e] select-none pr-4 text-right leading-6">
                  1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9
                </div>
                <div className="flex-grow leading-6">
                  <span className="text-[#ff7b72]">function</span> <span className="text-[#d2a8ff]">authenticate</span><span className="text-[#c9d1d9]">(user) {'{'}</span><br/>
                  <span className="text-[#c9d1d9]">  </span><span className="text-[#ff7b72]">if</span><span className="text-[#c9d1d9]"> (!user) {'{'}</span><br/>
                  <span className="text-[#c9d1d9]">    </span><span className="text-[#ff7b72]">return</span> <span className="text-[#79c0ff]">false</span><span className="text-[#c9d1d9]">;</span><br/>
                  <span className="text-[#c9d1d9]">  {'}'}</span><br/>
                  <span className="text-[#c9d1d9]">  </span><span className="text-[#ff7b72]">if</span><span className="text-[#c9d1d9]"> (user.</span><span className="text-[#d2a8ff]">isValid</span><span className="text-[#c9d1d9]">()) {'{'}</span><br/>
                  <span className="text-[#c9d1d9]">    </span><span className="text-[#ff7b72]">return</span> <span className="text-[#79c0ff]">true</span><span className="text-[#c9d1d9]">;</span><br/>
                  <span className="text-[#c9d1d9]">  {'}'}</span><br/>
                  <span className="text-[#c9d1d9]">  </span><span className="text-[#ff7b72]">return</span> <span className="text-[#ffa657]">error</span><span className="text-[#c9d1d9]">();</span><br/>
                  <span className="text-[#c9d1d9]">{'}'}</span>
                </div>
              </div>
            </div>

            {/* Flowchart Side */}
            <div className="w-full md:w-1/2 bg-card flex items-center justify-center relative p-6 sm:p-8 min-h-[280px]">
              <div className="flex flex-col items-center gap-4">
                <div className="px-6 py-2 rounded-full border border-primary/30 bg-primary/5 text-foreground text-sm font-medium shadow-sm">
                  Start
                </div>
                <div className="w-px h-5 bg-border relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-r border-b border-border rotate-45" />
                </div>
                <div className="px-4 py-3 rounded border-2 border-primary/40 bg-primary/5 text-foreground text-sm rotate-45 w-20 h-20 flex items-center justify-center hover:border-primary transition-colors cursor-pointer">
                  <span className="-rotate-45 block text-center font-medium">!user?</span>
                </div>
                <div className="flex gap-12 sm:gap-16">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-px h-5 bg-border relative">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-r border-b border-border rotate-45" />
                    </div>
                    <div className="px-3 py-1.5 rounded border border-destructive/30 bg-destructive/5 text-foreground text-sm">
                      Return False
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-px h-5 bg-border relative">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-r border-b border-border rotate-45" />
                    </div>
                    <div className="px-3 py-1.5 rounded border border-secondary/30 bg-secondary/5 text-foreground text-sm">
                      Check isValid()
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA SECTION ============ */}
        <section id="cta" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/50 border-t border-border flex flex-col items-center">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Ready to visualize your logic?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl">
              Join thousands of developers using FlowZen to document and understand their codebase faster.
            </p>
            <GlassButton onClick={onGetStarted} label="Launch Workspace" size="lg" />
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <Footer1 />
    </div>
  );
};
