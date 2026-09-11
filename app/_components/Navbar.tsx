import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-secondary/40 bg-background/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          <span className="w-7 h-7 rounded-lg bg-primary text-foreground flex items-center justify-center text-sm font-black shadow-sm shadow-primary/30">
            L
          </span>
          <span className="hover:text-primary transition-colors">
            Libre<span className="text-primary hover:text-accent transition-colors">.</span>
          </span>
        </Link>

        {/* Navigation & Auth Links */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Home
          </Link>

          <span className="h-4 w-px bg-secondary/50" aria-hidden="true" />

          <Link
            href="/auth/login"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/auth/register"
            className="text-sm font-semibold px-4 py-1.5 rounded-full bg-primary hover:bg-accent text-foreground shadow-sm hover:shadow transition-all"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

