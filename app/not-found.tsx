import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center text-white overflow-hidden"
      style={{
        backgroundImage: "url('/hero-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 bg-[#0a0a1a]/80" />

      <div className="relative z-10 text-center px-6 max-w-lg">
        <p className="text-7xl font-extrabold font-[family-name:var(--font-heading)] tracking-tight mb-4">
          404
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-white/70 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved. Let us
          help you find your way back.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/" variant="fill" size="lg">
            Back to Home
          </Button>
          <Button href="/shop" variant="ghost" size="lg" className="border-white text-white hover:bg-white hover:text-[#0b3d7a]">
            Browse Shop
          </Button>
        </div>
      </div>
    </section>
  );
}
