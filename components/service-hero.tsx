interface ServiceHeroProps {
  title: string
  description: string
  backgroundImage: string
}

export function ServiceHero({ title, description, backgroundImage }: ServiceHeroProps) {
  return (
    <section
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
          {title}
        </h1>
        <p className="text-lg text-white/90 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {description}
        </p>
      </div>
    </section>
  )
}
