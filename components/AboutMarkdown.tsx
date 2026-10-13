import { Fragment, type ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<Fragment key={`t-${key++}`}>{text.slice(last, match.index)}</Fragment>)
    }
    nodes.push(
      <strong key={`b-${key++}`} className="font-semibold text-white">
        {match[1]}
      </strong>
    )
    last = match.index + match[0].length
  }

  if (last < text.length) {
    nodes.push(<Fragment key={`t-${key++}`}>{text.slice(last)}</Fragment>)
  }

  return nodes
}

function headingClass(level: number) {
  if (level === 1) return 'text-2xl font-bold tracking-tight text-white mt-8 mb-3 first:mt-0'
  if (level === 2) return 'text-xl font-semibold text-white mt-7 mb-3 first:mt-0'
  return 'text-lg font-medium text-zinc-100 mt-5 mb-2 first:mt-0'
}

export default function AboutMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let listItems: string[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length === 0) return
    blocks.push(
      <ul key={`ul-${key++}`} className="my-4 list-disc space-y-2 pl-5 text-zinc-300">
        {listItems.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    )
    listItems = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const bullet = line.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      listItems.push(bullet[1])
      continue
    }

    flushList()

    if (!line.trim()) continue

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      const Tag = (`h${level}` as 'h1' | 'h2' | 'h3')
      blocks.push(
        <Tag key={`h-${key++}`} className={headingClass(level)}>
          {renderInline(heading[2])}
        </Tag>
      )
      continue
    }

    blocks.push(
      <p key={`p-${key++}`} className="mb-4 text-zinc-300 leading-relaxed">
        {renderInline(line)}
      </p>
    )
  }

  flushList()

  return <div className="about-markdown">{blocks}</div>
}

export function formatAboutUpdated(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
