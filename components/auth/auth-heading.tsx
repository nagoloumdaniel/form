export function AuthHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8 space-y-2.5">
      <h1 className="font-serif text-[1.75rem] leading-[1.12] tracking-[-0.015em] text-ink sm:text-[2rem]">
        {title}
      </h1>
      <p className="text-[15px] leading-relaxed text-muted">{description}</p>
    </div>
  );
}
