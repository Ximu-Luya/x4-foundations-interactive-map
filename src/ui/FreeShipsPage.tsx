import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'

import { derelictShips, timelineShips } from '../data'
import type { DerelictShip, TimelineShip } from '../data/types'
import { normalizeLocale, type SupportedLocale } from '../i18n'

const rankedShipSlugs = [
  'odysseus-vanguard',
  'osprey-vanguard',
  'drill-vanguard',
  'elite-vanguard',
  'perseus-vanguard',
  'courier-vanguard',
] as const

const rankedShips = rankedShipSlugs.map((slug) => {
  const ship = derelictShips.find((item) => item.slug === slug)
  if (!ship) throw new Error(`Missing ranked derelict ship: ${slug}`)
  return ship
})

type LightboxImage = {
  alt: string
  src: string
}

function translationKey(slug: string) {
  return slug.replaceAll('-', '_')
}

function activeLocale(language: string | undefined): SupportedLocale {
  return normalizeLocale(language ?? null) ?? 'zh-CN'
}

function mapHref(locale: SupportedLocale, kind?: 'ship' | 'tlship', slug?: string) {
  const search = new URLSearchParams({ lang: locale })
  if (kind && slug) search.set(kind, slug)
  return `../?${search.toString()}`
}

function SectionHeading({
  accent = 'cyan',
  intro,
  label,
  title,
}: {
  accent?: 'cyan' | 'purple'
  intro?: ReactNode
  label: ReactNode
  title: ReactNode
}) {
  const accentClass = accent === 'purple' ? 'text-purple-300' : 'text-cyan'
  const barClass = accent === 'purple' ? 'bg-purple-400' : 'bg-cyan'
  return (
    <div className="mb-8 max-w-3xl">
      <div
        className={`mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] ${accentClass}`}
      >
        <span className={`inline-block h-px w-6 ${barClass}`} />
        {label}
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      {intro ? <div className="mt-4 text-lg leading-relaxed text-mute">{intro}</div> : null}
    </div>
  )
}

function ShipClassBadge({ cls, timeline = false }: { cls: string; timeline?: boolean }) {
  return (
    <span
      className={`border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
        timeline
          ? 'border-purple-400/40 bg-purple-400/[0.08] text-purple-300'
          : cls === 'L'
            ? 'border-orange/50 bg-orange/[0.08] text-orange'
            : 'border-cyan/40 bg-cyan/[0.06] text-cyan2'
      }`}
    >
      {cls}
    </span>
  )
}

function DetailRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <dt className="pt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-mute2">
        {label}
      </dt>
      <dd className="m-0 leading-relaxed text-mute">{children}</dd>
    </>
  )
}

function ShipImages({
  locationAlt,
  name,
  onOpen,
  shipAlt,
  slug,
}: {
  locationAlt: string
  name: string
  onOpen: (event: ReactMouseEvent<HTMLButtonElement>, image: LightboxImage) => void
  shipAlt: string
  slug: string
}) {
  const { t } = useTranslation()
  const shipSrc = `../assets/x4/${slug}-ship.jpg`
  const locationSrc = `../assets/x4/${slug}-location.jpg`
  return (
    <div className="grid grid-cols-1 border-b border-line sm:grid-cols-2">
      <button
        type="button"
        aria-label={shipAlt}
        className="group relative block overflow-hidden bg-base text-left"
        onClick={(event) => onOpen(event, { src: shipSrc, alt: shipAlt })}
      >
        <img
          src={shipSrc}
          alt={shipAlt}
          loading="lazy"
          className="aspect-[16/10] h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute left-3 top-3 border border-cyan/40 bg-black/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">
          {t('free_ships_page.labels.ship_image')}
        </span>
      </button>
      <button
        type="button"
        aria-label={locationAlt}
        className="group relative block overflow-hidden border-t border-line bg-base text-left sm:border-l sm:border-t-0"
        onClick={(event) => onOpen(event, { src: locationSrc, alt: locationAlt })}
      >
        <img
          src={locationSrc}
          alt={locationAlt}
          loading="lazy"
          className="aspect-[16/10] h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute left-3 top-3 border border-cyan/40 bg-black/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">
          {t('free_ships_page.labels.map_location')}
        </span>
      </button>
      <span className="sr-only">{name}</span>
    </div>
  )
}

function DerelictDetailCard({
  index,
  locale,
  onOpen,
  sectorName,
  ship,
}: {
  index: number
  locale: SupportedLocale
  onOpen: (event: ReactMouseEvent<HTMLButtonElement>, image: LightboxImage) => void
  sectorName: (sector: string) => string
  ship: DerelictShip
}) {
  const { t } = useTranslation()
  const key = translationKey(ship.slug)
  const name = t(`ships.${key}.name`, { defaultValue: ship.name })
  const sector = sectorName(ship.sector)
  return (
    <article
      id={`ship-${ship.slug}`}
      className="relative scroll-mt-24 overflow-hidden border border-line bg-surface"
    >
      <span className="corner tl z-10 text-cyan" />
      <span className="corner br z-10 text-cyan" />
      <ShipImages
        slug={ship.slug}
        name={name}
        shipAlt={t('free_ships_page.labels.ship_alt', { ship: name, sector })}
        locationAlt={t('free_ships_page.labels.location_alt', { ship: name, sector })}
        onOpen={onOpen}
      />
      <div className="p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">
              {t('free_ships_page.labels.ship_number', { number: index + 1 })}
              {ship.cls === 'L' ? ` · ${t('free_ships_page.labels.capital_ship')}` : ''}
            </div>
            <h3 className="font-display text-2xl font-bold leading-tight">{name}</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <ShipClassBadge cls={ship.cls} />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                {t(`ships.${key}.role`, { defaultValue: ship.role })}
              </span>
            </div>
            <a
              href={mapHref(locale, 'ship', ship.slug)}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan hover:underline"
            >
              {t('free_ships_page.labels.on_map')} ↗
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-5 gap-y-3 text-[15px] sm:grid-cols-[120px_1fr]">
          <DetailRow label={t('free_ships_page.labels.sector')}>
            <span className="text-ink">{sector}</span>
          </DetailRow>
          {ship.coords ? (
            <DetailRow label={t('free_ships_page.labels.coordinates')}>
              <span className="font-mono text-[13px] text-cyan2">{ship.coords}</span>
            </DetailRow>
          ) : null}
          <DetailRow label={t('free_ships_page.labels.find_it')}>
            {t(`ships.${key}.find`, { defaultValue: ship.find })}
          </DetailRow>
          <DetailRow label={t('free_ships_page.labels.claim')}>
            {t(`ships.${key}.claim`, { defaultValue: ship.claim })}
          </DetailRow>
        </dl>
      </div>
    </article>
  )
}

function TimelineDetailCard({
  locale,
  onOpen,
  sectorName,
  ship,
}: {
  locale: SupportedLocale
  onOpen: (event: ReactMouseEvent<HTMLButtonElement>, image: LightboxImage) => void
  sectorName: (sector: string) => string
  ship: TimelineShip
}) {
  const { t } = useTranslation()
  const key = translationKey(ship.slug)
  const name = t(`timeline_ships.${key}.name`, { defaultValue: ship.name })
  const sector = sectorName(ship.sector)
  return (
    <article
      id={`ship-${ship.slug}`}
      className="relative scroll-mt-24 overflow-hidden border border-line bg-surface"
    >
      <span className="corner tl z-10 text-purple-300" />
      <span className="corner br z-10 text-purple-300" />
      <ShipImages
        slug={ship.slug}
        name={name}
        shipAlt={t('free_ships_page.labels.ship_alt', { ship: name, sector })}
        locationAlt={t('free_ships_page.labels.location_alt', { ship: name, sector })}
        onOpen={onOpen}
      />
      <div className="p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-purple-300">
              {t('free_ships_page.labels.timeline_entry', { timeline: ship.tl })}
              {ship.cls === 'L' ? ` · ${t('free_ships_page.labels.capital_ship')}` : ''}
            </div>
            <h3 className="font-display text-2xl font-bold leading-tight">{name}</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <ShipClassBadge cls={ship.cls} timeline />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-purple-300">
                {t(`timeline_ships.${key}.role`, { defaultValue: ship.role })}
              </span>
            </div>
            <a
              href={mapHref(locale, 'tlship', ship.slug)}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-purple-300 hover:underline"
            >
              {t('free_ships_page.labels.on_map')} ↗
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-5 gap-y-3 text-[15px] sm:grid-cols-[120px_1fr]">
          <DetailRow label={t('free_ships_page.labels.sector')}>
            <span className="text-ink">{sector}</span>
          </DetailRow>
          <DetailRow label={t('free_ships_page.labels.unlock')}>
            {t(`timeline_ships.${key}.unlock`, { defaultValue: ship.req })}
          </DetailRow>
          <DetailRow label={t('free_ships_page.labels.find_it')}>
            {t(`timeline_ships.${key}.find`, { defaultValue: ship.find })}
          </DetailRow>
          <DetailRow label={t('free_ships_page.labels.claim')}>
            {t(`timeline_ships.${key}.claim`, { defaultValue: ship.claim })}
          </DetailRow>
        </dl>
        {ship.danger ? (
          <div className="mt-5 flex gap-3 border border-orange/40 bg-orange/[0.07] p-4">
            <span className="flex-none pt-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-orange">
              ⚠ {t('free_ships_page.labels.warning')}
            </span>
            <p className="m-0 text-[14px] leading-relaxed text-orange/90">
              {t(`timeline_ships.${key}.danger`, { defaultValue: ship.dangerNote })}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function FreeShipsPage() {
  const { t, i18n } = useTranslation()
  const locale = activeLocale(i18n.resolvedLanguage ?? i18n.language)
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const sectorName = useCallback(
    (sector: string) => t(`sectors.${sector}`, { defaultValue: sector }),
    [t],
  )

  const openLightbox = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>, image: LightboxImage) => {
      openerRef.current = event.currentTarget
      setLightbox(image)
    },
    [],
  )

  const closeLightbox = useCallback(() => {
    setLightbox(null)
    requestAnimationFrame(() => openerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeLightbox, lightbox])

  useEffect(() => {
    const scrollToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView?.({ block: 'start' })
      })
    }
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  return (
    <>
      <section className="relative overflow-hidden border-b border-subtle/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(6,182,212,0.16),transparent_38%),radial-gradient(circle_at_78%_60%,rgba(249,115,22,0.10),transparent_35%)]" />
        <div className="relative mx-auto max-w-[1000px] px-5 py-16 md:px-8 md:py-20">
          <div className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mute2">
            <a href={mapHref(locale)} className="text-cyan hover:underline">
              {t('navigation.universe_map')}
            </a>
            <span>/</span>
            <span>{t('free_ships_page.hero.kicker')}</span>
          </div>
          <h1 className="max-w-4xl font-display text-[clamp(32px,5.5vw,60px)] font-black leading-[1.04] tracking-tight">
            {t('free_ships_page.hero.title')}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-mute">
            {t('free_ships_page.hero.intro')}
          </p>
          <a
            href={mapHref(locale)}
            className="mt-7 inline-flex items-center gap-2 border border-cyan/50 bg-cyan/[0.06] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan2 transition-colors hover:bg-cyan/[0.12]"
          >
            {t('free_ships_page.hero.map_cta')} →
          </a>
        </div>
      </section>

      <section className="border-b border-subtle/60 py-14 md:py-18">
        <div className="mx-auto max-w-[1000px] px-5 md:px-8">
          <SectionHeading
            label={t('free_ships_page.ranking.label')}
            title={t('free_ships_page.ranking.title')}
            intro={t('free_ships_page.ranking.intro')}
          />
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {rankedShips.map((ship, index) => {
              const key = translationKey(ship.slug)
              const name = t(`ships.${key}.name`, { defaultValue: ship.name })
              return (
                <li
                  key={ship.slug}
                  className="flex items-start gap-4 border border-line bg-surface p-5"
                >
                  <span className="w-7 flex-none text-center font-display text-2xl font-black text-cyan">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-3">
                      <a
                        href={`#ship-${ship.slug}`}
                        className="font-display text-lg font-bold transition-colors hover:text-cyan"
                      >
                        {name}
                      </a>
                      <ShipClassBadge cls={ship.cls} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute2">
                        {t(`ships.${key}.role`, { defaultValue: ship.role })}
                      </span>
                      {index === 0 ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">
                          ★ {t('free_ships_page.ranking.best_badge')}
                        </span>
                      ) : null}
                      {index === 1 ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan2">
                          {t('free_ships_page.ranking.medium_badge')}
                        </span>
                      ) : null}
                    </div>
                    <p className="m-0 text-[14px] leading-relaxed text-mute">
                      {t(`free_ships_page.ranking.items.${key}`)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="mt-6 text-sm text-mute2">
            {t('free_ships_page.ranking.map_prompt')}{' '}
            <a href={mapHref(locale)} className="text-cyan hover:underline">
              {t('navigation.universe_map')}
            </a>
          </p>
        </div>
      </section>

      <section className="border-b border-subtle/60 py-14 md:py-18">
        <div className="mx-auto max-w-[1000px] px-5 md:px-8">
          <SectionHeading
            accent="purple"
            label={t('free_ships_page.timeline.label')}
            title={t('free_ships_page.timeline.title')}
            intro={t('free_ships_page.timeline.intro')}
          />
          <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
            {timelineShips.map((ship) => {
              const key = translationKey(ship.slug)
              return (
                <li key={ship.slug} className="border border-line bg-surface p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="font-display text-xl font-black text-purple-300">{ship.tl}</span>
                    <a
                      href={`#ship-${ship.slug}`}
                      className="font-display text-lg font-bold hover:text-purple-300"
                    >
                      {t(`timeline_ships.${key}.name`, { defaultValue: ship.name })}
                    </a>
                    <ShipClassBadge cls={ship.cls} timeline />
                  </div>
                  <p className="m-0 text-[14px] leading-relaxed text-mute">
                    {t(`free_ships_page.timeline.items.${key}`)}
                  </p>
                </li>
              )
            })}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-mute2">
            <span>{t('free_ships_page.timeline.note')}</span>
            <a href={mapHref(locale)} className="text-purple-300 hover:underline">
              {t('free_ships_page.timeline.map_cta')}
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-subtle/60 py-14 md:py-18">
        <div className="mx-auto max-w-[1000px] px-5 md:px-8">
          <SectionHeading
            label={t('free_ships_page.claiming.label')}
            title={t('free_ships_page.claiming.title')}
          />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">
                // {t('free_ships_page.claiming.scope')}
              </div>
              <ol className="m-0 flex list-none flex-col gap-4 p-0">
                {[1, 2, 3, 4].map((step) => (
                  <li key={step} className="flex gap-4 border-l border-cyan/40 pl-4 text-mute">
                    <span className="font-mono text-sm font-bold text-cyan">
                      {String(step).padStart(2, '0')} ·
                    </span>
                    <span className="leading-relaxed">
                      {t(`free_ships_page.claiming.steps.${step}`)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-4 border border-line bg-surface p-6 text-[15px] leading-relaxed text-mute">
              <p className="m-0">
                <strong className="text-ink">{t('free_ships_page.claiming.how_title')}：</strong>{' '}
                {t('free_ships_page.claiming.how_body')}
              </p>
              <p className="m-0">
                <strong className="text-ink">{t('free_ships_page.claiming.reset_title')}：</strong>{' '}
                {t('free_ships_page.claiming.reset_body')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="mx-auto max-w-[1000px] px-5 md:px-8">
          <SectionHeading
            label={t('free_ships_page.locations.label')}
            title={t('free_ships_page.locations.title')}
            intro={t('free_ships_page.locations.intro')}
          />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <h3 className="font-display text-lg font-bold tracking-wide">
              {t('free_ships_page.locations.base_group')}
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
              {t('free_ships_page.labels.ship_count', { count: derelictShips.length })}
            </span>
          </div>
          <div className="flex flex-col gap-8">
            {derelictShips.map((ship, index) => (
              <DerelictDetailCard
                key={ship.slug}
                ship={ship}
                index={index}
                locale={locale}
                sectorName={sectorName}
                onOpen={openLightbox}
              />
            ))}
          </div>

          <div className="mb-4 mt-14 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <h3 className="font-display text-lg font-bold tracking-wide text-purple-300">
              {t('free_ships_page.locations.timeline_group')}
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-purple-300">
              {t('free_ships_page.labels.ship_count', { count: timelineShips.length })}
            </span>
          </div>
          <p className="mb-6 max-w-3xl text-[15px] leading-relaxed text-mute">
            {t('free_ships_page.locations.timeline_intro')}
          </p>
          <div className="flex flex-col gap-8">
            {timelineShips.map((ship) => (
              <TimelineDetailCard
                key={ship.slug}
                ship={ship}
                locale={locale}
                sectorName={sectorName}
                onOpen={openLightbox}
              />
            ))}
          </div>
        </div>
      </section>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('accessibility.ship_image')}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/[0.92] p-4 backdrop-blur-sm sm:p-8"
          onClick={(event) => event.target === event.currentTarget && closeLightbox()}
        >
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-h-full max-w-full cursor-default border border-cyan/30 object-contain shadow-2xl"
          />
          <button
            ref={closeButtonRef}
            type="button"
            className="absolute right-5 top-4 border border-cyan/40 bg-black/60 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-cyan hover:bg-cyan/10"
            onClick={closeLightbox}
          >
            × {t('accessibility.close')}
          </button>
        </div>
      ) : null}
    </>
  )
}
