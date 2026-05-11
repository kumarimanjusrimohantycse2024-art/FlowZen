export default function Footer1() {
  return (
    <footer className="w-full bg-muted/80 dark:bg-[#030d1a] border-t border-border text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-foreground tracking-tight mb-4">
            FlowZen
          </div>

          {/* Description */}
          <p className="max-w-xl text-sm text-muted-foreground leading-relaxed mb-8">
            Empowering developers worldwide with intelligent code-to-flowchart conversion.
            Transform your logic into visual clarity with FlowZen.
          </p>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-8">
            <a href="#product" className="hover:text-foreground transition-colors">Documentation</a>
            <a href="#features" className="hover:text-foreground transition-colors">Changelog</a>
            <a href="#" className="hover:text-foreground transition-colors">Status</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>FlowZen</span>
          <span>© 2025 FlowZen Inc. Built for architects.</span>
        </div>
      </div>
    </footer>
  );
}
