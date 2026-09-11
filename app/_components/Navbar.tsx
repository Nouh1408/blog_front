import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-90 transition-opacity"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-sm shadow-blue-500/30 ">
            L
          </span>
          <span className="hover:text-blue-600 hover:scale-110 transition-all">
            Libre<span className="hover:animate-bounce hover:text-blue-600 hover:scale-110 transition-all">.</span>
          </span>
        </Link>

        {/* Minimal Navigation & Auth Links */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            Home
          </Link>

          <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

          <Link
            href="/auth/login"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50 transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/auth/register"
            className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

