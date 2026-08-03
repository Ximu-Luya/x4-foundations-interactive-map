import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Analytics } from '@vercel/analytics/react'
import { Link, Redirect, Route, Switch, useLocation, useSearch } from 'wouter'

import { derelictShips, timelineShips, universeData } from '../data'
import { localeMetadata, normalizeLocale, supportedLocales, switchLocale } from '../i18n'
import { MapShell } from '../map/MapShell'
import { FreeShipsPage } from './FreeShipsPage'

const upstream = 'https://veanturverse.com'

type SitePage = 'map' | 'free-ships'

function localPageHref(page: SitePage, locale: string) {
  const search = new URLSearchParams({ lang: locale }).toString()
  return `${page === 'map' ? '/' : '/free-ships/'}?${search}`
}

function guideHref(slug: string, locale: string) {
  return `/free-ships/?lang=${encodeURIComponent(locale)}#ship-${slug}`
}

function ProjectName({ responsive = false }: { responsive?: boolean }) {
  const { t } = useTranslation()
  if (responsive) {
    return (
      <>
        <span className="xl:hidden">{t('site.project_name_short')}</span>
        <span className="hidden xl:inline">{t('site.project_name')}</span>
      </>
    )
  }
  return <>{t('site.project_name')}</>
}

function Header({ page }: { page: SitePage }) {
  const { t, i18n } = useTranslation()
  const [pathname, navigate] = useLocation()
  const searchString = useSearch()
  const [menuOpen, setMenuOpen] = useState(false)
  const activeLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? 'en-US'
  const links = [
    {
      label: t('navigation.universe_map'),
      href: localPageHref('map', activeLocale),
      active: page === 'map',
    },
    {
      label: t('navigation.free_ships_guide'),
      href: localPageHref('free-ships', activeLocale),
      active: page === 'free-ships',
    },
    { label: t('navigation.original_site'), href: upstream, external: true, active: false },
  ]

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-subtle/80 bg-base/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 md:px-8">
        <Link
          href={localPageHref('map', activeLocale)}
          className="whitespace-nowrap font-display text-xs font-black tracking-[0.1em] sm:text-sm sm:tracking-[0.14em] lg:text-base"
        >
          <span className="text-ink">
            <ProjectName responsive />
          </span>
        </Link>
        <nav className="hidden items-center gap-4 font-mono text-sm uppercase tracking-[0.08em] text-mute md:flex">
          {links.map(({ active, external, href, label }) =>
            external ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cyan"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`transition-colors hover:text-cyan ${active ? 'text-cyan2' : ''}`}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              aria-label={t('accessibility.select_language')}
              className="min-w-32 appearance-none border border-line bg-surface py-1.5 pr-8 pl-3 font-mono text-xs tracking-[0.08em] text-ink transition-colors hover:border-cyan/70 focus:border-cyan focus:outline-none"
              value={activeLocale}
              onChange={(event) => {
                const locale = normalizeLocale(event.target.value)
                if (locale && locale !== activeLocale) {
                  void switchLocale(locale)
                  const search = new URLSearchParams(searchString)
                  search.set('lang', locale)
                  navigate(`${pathname}?${search.toString()}${window.location.hash}`, {
                    replace: true,
                  })
                }
              }}
            >
              {supportedLocales.map((locale) => (
                <option key={locale} value={locale}>
                  {localeMetadata[locale].languageName}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2.5 size-3 -translate-y-1/2 text-cyan"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path d="m2.5 4.25 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center border border-line bg-surface text-cyan transition-colors hover:border-cyan/70 md:hidden"
            aria-expanded={menuOpen}
            aria-label={
              menuOpen ? t('accessibility.close_menu') : t('accessibility.open_menu')
            }
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              aria-hidden="true"
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav className="absolute inset-x-0 top-16 flex flex-col gap-4 border-b border-line bg-base p-6 font-mono text-sm uppercase tracking-[0.12em] md:hidden">
          {links.map(({ active, external, href, label }) =>
            external ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={active ? 'text-cyan2' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
      ) : null}
    </header>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan">
      <span className="inline-block h-px w-6 bg-cyan" />
      {children}
    </div>
  )
}

function AboutContent() {
  const { t } = useTranslation()
  return (
    <section className="relative border-t border-subtle/60 py-12 md:py-16">
      <div className="mx-auto max-w-[1000px] px-5 md:px-8">
        <SectionLabel>{t('content.about_label')}</SectionLabel>
        <h1 className="mb-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
          {t('content.about_title')}
        </h1>
        <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-mute">
          <p>{t('content.about_intro')}</p>
          <p>{t('content.about_usage')}</p>
          <p>{t('content.about_lenses')}</p>
        </div>
      </div>
    </section>
  )
}

function ShipSections() {
  const { t, i18n } = useTranslation()
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? 'en-US'
  const sectorName = (name: string) => t(`sectors.${name}`, { defaultValue: name })

  return (
    <>
      <section className="border-t border-subtle/60 py-12 md:py-16">
        <div className="mx-auto max-w-[1000px] px-5 md:px-8">
          <SectionLabel>{t('content.free_ships_label')}</SectionLabel>
          <h2 className="mb-4 font-display text-2xl font-bold md:text-3xl">
            {t('content.free_ships_title')}
          </h2>
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-mute">
            {t('content.free_ships_intro')}
          </p>
          <ol className="grid list-none gap-4 p-0 sm:grid-cols-2">
            {derelictShips.map((ship) => {
              const key = ship.slug.replaceAll('-', '_')
              const sector = universeData.sectors.find((item) => item.name === ship.sector)!
              return (
                <li key={ship.slug} className="border border-line bg-surface p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="bg-cyan2 px-2 py-1 font-mono text-xs font-bold text-base">
                      {ship.cls}
                    </span>
                    <h3 className="font-display text-lg font-bold">
                      {t(`ships.${key}.name`, { defaultValue: ship.name })}
                    </h3>
                  </div>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-cyan2">
                    {t(`ships.${key}.role`, { defaultValue: ship.role })} · {sectorName(ship.sector)} (
                    {t(`factions.${sector.f}.short`, {
                      defaultValue: universeData.factions[sector.f].short,
                    })}
                    )
                  </p>
                  <p className="mb-3 text-[14px] leading-relaxed text-mute">
                    {t(`ships.${key}.find`, { defaultValue: ship.find })}
                  </p>
                  <div className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.16em]">
                    <Link
                      className="text-cyan2 hover:underline"
                      href={`/?lang=${encodeURIComponent(locale)}&ship=${ship.slug}`}
                    >
                      {t('content.show_on_map')}
                    </Link>
                    <Link
                      className="text-mute2 hover:text-cyan"
                      href={guideHref(ship.slug, locale)}
                    >
                      {t('content.full_guide')}
                    </Link>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="border-t border-subtle/60 py-12 md:py-16">
        <div className="mx-auto max-w-[1000px] px-5 md:px-8">
          <SectionLabel>{t('content.timeline_label')}</SectionLabel>
          <h2 className="mb-4 font-display text-2xl font-bold md:text-3xl">
            {t('content.timeline_title')}
          </h2>
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-mute">
            {t('content.timeline_intro')}
          </p>
          <ol className="grid list-none gap-4 p-0 sm:grid-cols-2">
            {timelineShips.map((ship) => {
              const key = ship.slug.replaceAll('-', '_')
              return (
                <li key={ship.slug} className="border border-line bg-surface p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="bg-purple-400 px-2 py-1 font-mono text-xs font-bold text-base">
                      {ship.tl}
                    </span>
                    <span className="bg-orange px-2 py-1 font-mono text-xs font-bold text-base">
                      {ship.cls}
                    </span>
                    <h3 className="font-display text-lg font-bold">
                      {t(`timeline_ships.${key}.name`, { defaultValue: ship.name })}
                    </h3>
                  </div>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-purple-300">
                    {t(`timeline_ships.${key}.role`, { defaultValue: ship.role })} · {sectorName(ship.sector)}
                  </p>
                  <p className="mb-3 text-[14px] leading-relaxed text-mute">
                    {t(`timeline_ships.${key}.find`, { defaultValue: ship.find })}
                  </p>
                  <div className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.16em]">
                    <Link
                      className="text-purple-300 hover:underline"
                      href={`/?lang=${encodeURIComponent(locale)}&tlship=${ship.slug}`}
                    >
                      {t('content.show_on_map')}
                    </Link>
                    <Link
                      className="text-mute2 hover:text-cyan"
                      href={guideHref(ship.slug, locale)}
                    >
                      {t('content.full_guide')}
                    </Link>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </>
  )
}

function Faq() {
  const { t } = useTranslation()
  const items = [
    ['content.faq_free_ships_question', 'content.faq_free_ships_answer'],
    ['content.faq_best_question', 'content.faq_best_answer'],
    ['content.faq_claim_question', 'content.faq_claim_answer'],
    ['content.faq_dlcs_question', 'content.faq_dlcs_answer'],
  ]
  return (
    <section className="border-t border-subtle/60 py-12 md:py-16">
      <div className="mx-auto max-w-[1000px] px-5 md:px-8">
        <SectionLabel>{t('content.faq_label')}</SectionLabel>
        <h2 className="mb-7 font-display text-2xl font-bold md:text-3xl">
          {t('content.faq_title')}
        </h2>
        <div className="flex max-w-2xl flex-col gap-5">
          {items.map(([question, answer]) => (
            <div key={question}>
              <h3 className="mb-1.5 font-display text-lg font-bold">{t(question)}</h3>
              <p className="text-[15px] leading-relaxed text-mute">{t(answer)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-subtle/60 py-14">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center md:px-8">
        <div>
          <div className="mb-2 font-display text-base font-black tracking-[0.22em]">
            <span className="text-ink">
              <ProjectName />
            </span>
          </div>
          <p className="font-mono text-xs tracking-wider text-mute2">{t('content.footer')}</p>
        </div>
        <a className="font-mono text-xs uppercase tracking-widest text-cyan" href={upstream}>
          {t('navigation.original_site')} ↗
        </a>
      </div>
    </footer>
  )
}

function MapPage() {
  const { i18n } = useTranslation()
  const search = useSearch()
  const mapKey = `${search}:${i18n.resolvedLanguage ?? i18n.language}`

  return (
    <>
      <MapShell key={mapKey} />
      <AboutContent />
      <ShipSections />
      <Faq />
    </>
  )
}

function LegacyFreeShipsRedirect() {
  const search = useSearch()
  return <Redirect replace to={`/free-ships/${search ? `?${search}` : ''}${window.location.hash}`} />
}

function ScrollToRoute({ hash }: { hash: string }) {
  useEffect(() => {
    if (hash) return
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [hash])
  return null
}

export function App() {
  const { t, i18n } = useTranslation()
  const [pathname] = useLocation()
  const search = useSearch()
  const hash = window.location.hash
  const page: SitePage = pathname.startsWith('/free-ships') ? 'free-ships' : 'map'

  useEffect(() => {
    const locale = normalizeLocale(new URLSearchParams(search).get('lang'))
    const activeLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language)
    if (locale && locale !== activeLocale) void switchLocale(locale)
  }, [i18n.language, i18n.resolvedLanguage, search])

  useEffect(() => {
    document.documentElement.lang =
      normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? 'en-US'
    const titleKey = page === 'free-ships' ? 'free_ships_page.seo.title' : 'seo.page_title'
    const descriptionKey =
      page === 'free-ships' ? 'free_ships_page.seo.description' : 'seo.description'
    document.title = t(titleKey)
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = t(descriptionKey)
  }, [i18n.language, i18n.resolvedLanguage, page, t])

  return (
    <div className="min-h-screen bg-base text-ink">
      <ScrollToRoute key={pathname} hash={hash} />
      <Header page={page} />
      <main>
        <Switch>
          <Route path="/">
            <MapPage />
          </Route>
          <Route path="/free-ships/index.html">
            <LegacyFreeShipsRedirect />
          </Route>
          <Route path="/free-ships">
            <FreeShipsPage />
          </Route>
          <Route>
            <MapPage />
          </Route>
        </Switch>
      </main>
      <Footer />
      <Analytics />
    </div>
  )
}
