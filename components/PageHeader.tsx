interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <section className="py-4 md:py-6 border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        <div className="w-16 h-1 bg-accent mt-2 rounded-full" />
      </div>
    </section>
  )
}
