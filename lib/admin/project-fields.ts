/** Allowed values aligned with projects table check constraints / app usage. */

export const PROJECT_CATEGORIES = [
  'Gateway',
  'Off-ramp',
  'Payments',
  'DeFi',
  'Gaming',
  'Social Commerce',
  'Creator Economy',
  'Infrastructure',
  'Security',
  'Analytics',
  'AI+Crypto',
  'RWA',
  'Education',
  'Prediction Markets',
  'Other',
] as const

export const PROJECT_STATUSES = ['Live', 'Beta', 'Coming Soon'] as const

export const DATA_SOURCES = ['onchain_verified', 'reported', 'estimated', 'mock'] as const

export const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'] as const

export type EditableProjectPayload = {
  name: string
  slug: string
  description: string | null
  logo: string | null
  country: string | null
  category: string | null
  status: string | null
  website: string | null
  x_link: string | null
  github_url: string | null
  program_address: string | null
  wallet_address: string | null
  data_source: string | null
  verification_status: string | null
  social_verified: boolean
  product_verified: boolean
  ecosystem_verified: boolean
  onchain_verified: boolean
  is_doxxed: boolean
  has_audit: boolean
  is_active: boolean
  about: string | null
  about_updated: string | null
}

function includesValue<T extends readonly string[]>(list: T, value: string): value is T[number] {
  return (list as readonly string[]).includes(value)
}

export function validateEditableProjectPayload(body: Record<string, unknown>): {
  data?: EditableProjectPayload
  error?: string
} {
  if (typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Name is required.' }
  }
  if (typeof body.slug !== 'string' || !body.slug.trim()) {
    return { error: 'Slug is required.' }
  }

  const category = body.category == null || body.category === '' ? null : String(body.category)
  if (category && !includesValue(PROJECT_CATEGORIES, category)) {
    return { error: `Invalid category. Allowed: ${PROJECT_CATEGORIES.join(', ')}` }
  }

  const status = body.status == null || body.status === '' ? null : String(body.status)
  if (status && !includesValue(PROJECT_STATUSES, status)) {
    return { error: `Invalid status. Allowed: ${PROJECT_STATUSES.join(', ')}` }
  }

  const dataSource =
    body.data_source == null || body.data_source === '' ? null : String(body.data_source)
  if (dataSource && !includesValue(DATA_SOURCES, dataSource)) {
    return { error: `Invalid data_source. Allowed: ${DATA_SOURCES.join(', ')}` }
  }

  const verificationStatus =
    body.verification_status == null || body.verification_status === ''
      ? null
      : String(body.verification_status)
  if (verificationStatus && !includesValue(VERIFICATION_STATUSES, verificationStatus)) {
    return {
      error: `Invalid verification_status. Allowed: ${VERIFICATION_STATUSES.join(', ')}`,
    }
  }

  const asNullableString = (value: unknown) => {
    if (value == null) return null
    const str = String(value).trim()
    return str === '' ? null : str
  }

  const asBoolean = (value: unknown) => Boolean(value)

  return {
    data: {
      name: body.name.trim(),
      slug: body.slug.trim(),
      description: asNullableString(body.description),
      logo: asNullableString(body.logo),
      country: asNullableString(body.country),
      category,
      status,
      website: asNullableString(body.website),
      x_link: asNullableString(body.x_link),
      github_url: asNullableString(body.github_url),
      program_address: asNullableString(body.program_address),
      wallet_address: asNullableString(body.wallet_address),
      data_source: dataSource,
      verification_status: verificationStatus,
      social_verified: asBoolean(body.social_verified),
      product_verified: asBoolean(body.product_verified),
      ecosystem_verified: asBoolean(body.ecosystem_verified),
      onchain_verified: asBoolean(body.onchain_verified),
      is_doxxed: asBoolean(body.is_doxxed),
      has_audit: asBoolean(body.has_audit),
      is_active: asBoolean(body.is_active),
      about: asNullableString(body.about),
      about_updated: asNullableString(body.about_updated),
    },
  }
}
