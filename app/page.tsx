import Image from "next/image";
import Link from "next/link";
import bgImage from "./assets/images/Bg.jpg";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section with Background Image */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center text-center px-4 sm:px-6 overflow-hidden">
        {/* Background Image */}
        <Image
          src={bgImage}
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center -z-10"
          quality={90}
        />

        {/* Overlay to ensure text readability and blend with background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background -z-10" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto space-y-6 py-16">
          <span className="inline-block px-3.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-secondary/40 text-foreground border border-secondary/60">
            Welcome to Libre
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Read, Write & Share <br />
            <span className="text-primary">Whatever you want</span>
          </h1>

          <p className="text-base sm:text-lg text-foreground/80 max-w-xl mx-auto leading-relaxed">
            Enter the chaos. Share your ideas, swap stories, and discover a
            community where imagination runs wild. Whether you're deep in the
            lore, building your next character, or just here for the vibes,
            there's always something new to explore.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-full bg-primary hover:bg-accent text-foreground font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </Link>

            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-full border border-secondary/70 bg-background/60 backdrop-blur-sm text-foreground hover:bg-secondary/20 font-medium transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
