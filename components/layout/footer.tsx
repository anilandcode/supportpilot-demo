export function Footer() {
  return (
    <footer
      className="border-t border-border py-8 px-6"
      style={{ background: "var(--surface)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-foreground-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden />
          <span>
            Built by{" "}
            <a
              href="https://anilpervaiz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Anil Pervaiz
            </a>
            {" "}— full-stack AI architect
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/admin" className="hover:text-foreground transition-colors">
            Dashboard
          </a>
          <a
            href="/embed"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Widget
          </a>
          <a
            href="https://github.com/anilandcode/supportpilot-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub →
          </a>
        </div>
      </div>
    </footer>
  );
}
