import AboutMarkdown, { formatAboutUpdated } from '@/components/AboutMarkdown'

type ProjectAboutSectionProps = {
  about?: string | null
  aboutUpdated?: string | null
  className?: string
}

export default function ProjectAboutSection({
  about,
  aboutUpdated,
  className = '',
}: ProjectAboutSectionProps) {
  if (typeof about !== 'string' || about.trim() === '') return null

  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold mb-8 text-white">About</h2>
      <div className="max-w-3xl rounded-2xl border border-white/5 bg-zinc-900/40 p-6 md:p-8">
        <AboutMarkdown markdown={about} />
        <p className="mt-8 pt-5 border-t border-white/5 text-xs text-zinc-500 leading-relaxed">
          Last updated: {formatAboutUpdated(aboutUpdated) ?? '—'}. Figures marked
          &apos;reported&apos; come from the project and are not verified by TRÆCERA.
        </p>
      </div>
    </section>
  )
}
