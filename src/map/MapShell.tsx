import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'wouter'

import { createMap } from './createMap'
import { useMapKeyboard } from './keyboard'
import type { X4MapApi } from '../types/window'

export function MapShell() {
  const { t } = useTranslation()
  const [, navigate] = useLocation()
  const rootRef = useRef<HTMLElement>(null)
  const apiRef = useRef<X4MapApi | null>(null)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const [mobileLegendOpen, setMobileLegendOpen] = useState(false)

  useMapKeyboard(rootRef, apiRef)

  useEffect(() => {
    const api = createMap({ t, navigate }) ?? null
    apiRef.current = api
    return () => {
      api?.destroy()
      apiRef.current = null
    }
  }, [navigate, t])

  return (
    <section
      ref={rootRef}
      id="mapRoot"
      aria-label={t('accessibility.interactive_map')}
      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight W A S D"
      tabIndex={0}
    >
      <svg id="mapSvg" xmlns="http://www.w3.org/2000/svg">
        <g id="gViewport">
          <g id="gEdges" />
          <g id="gHex" />
          <g id="gNode" />
          <g id="gLabel" />
        </g>
      </svg>

      <div id="mapPins" />
      <div id="mapPinsTl" />
      <div id="routeHint" className="ov">
        ◎ {t('map.route_pick_hint')}
      </div>
      <div id="khaakNote" className="ov panelbox" />
      <div id="terraformNote" className="ov panelbox" />
      <div id="hoverInfo" />

      <div id="imgLightbox" role="dialog" aria-modal="true" aria-label={t('accessibility.ship_image')}>
        <button className="lb-close" aria-label={t('accessibility.close_image')}>
          ×
        </button>
        <img alt="" />
        <div className="lb-cap" />
      </div>

      <div id="mapTopL" className={`ov ${mobileToolsOpen ? 'mobile-tools-open' : ''}`}>
        <button
          id="mobileToolsToggle"
          className="mobile-map-toggle panelbox"
          type="button"
          aria-controls="mapMobileTools"
          aria-expanded={mobileToolsOpen}
          onClick={() => {
            setMobileToolsOpen((open) => !open)
            setMobileLegendOpen(false)
          }}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeLinecap="round" />
            <circle cx="7" cy="5" r="1.5" fill="currentColor" />
            <circle cx="13" cy="10" r="1.5" fill="currentColor" />
            <circle cx="9" cy="15" r="1.5" fill="currentColor" />
          </svg>
          <span>{t('map.mobile_tools')}</span>
        </button>

        <div id="mapMobileTools" className="map-top-left">
          <div className="map-toolbar-actions">
            <div className="mt-title panelbox relative">
              <span className="corner tl text-cyan" />
              <span className="corner br text-cyan" />
              <div className="mt-kicker">{t('map.kicker')}</div>
            </div>
            <button
              id="lensShips"
              className="lens-toggle panelbox"
              aria-pressed="false"
              title={t('map.toggle_derelicts_title')}
            >
              <span className="lens-ic">◆</span> {t('map.derelict_ships')}
            </button>
            <button
              id="lensTimeline"
              className="lens-toggle tl panelbox"
              aria-pressed="false"
              title={t('map.toggle_timeline_title')}
              hidden
            >
              <span className="lens-ic">✦</span> {t('map.timeline_ships')}
            </button>
            <button
              id="lensKhaak"
              className="lens-toggle kk panelbox"
              aria-pressed="false"
              title={t('map.toggle_khaak_title')}
              hidden
            >
              <span className="lens-ic">⬡</span> {t('map.khaak_safe')}
            </button>
            <button
              id="lensTerraform"
              className="lens-toggle tf panelbox"
              aria-pressed="false"
              title={t('map.toggle_terraform_title')}
              hidden
            >
              <span className="lens-ic">⊕</span> {t('map.terraforming')}
            </button>
            <button
              id="routePlanBtn"
              className="lens-toggle panelbox"
              aria-pressed="false"
              title={t('map.toggle_route_title')}
            >
              <span className="lens-ic">▸</span> {t('map.plan_route')}
            </button>
            <div id="mapOptions" className="panelbox">
              <label className="opt">
                <span>{t('map.recenter_on_click')}</span>
                <input type="checkbox" id="optCenter" />
                <span className="opt-switch" aria-hidden="true" />
              </label>
            </div>
          </div>

          <div id="routePlanner" className="panelbox">
            <div className="rp-row">
              <span className="rp-lbl rp-from">{t('map.from')}</span>
              <input
                id="rpFrom"
                type="text"
                placeholder={t('map.start_sector_placeholder')}
                autoComplete="off"
                spellCheck={false}
              />
              <ul id="rpFromResults" className="rp-results" />
            </div>
            <div className="rp-row">
              <span className="rp-lbl rp-to">{t('map.to')}</span>
              <input
                id="rpTo"
                type="text"
                placeholder={t('map.destination_sector_placeholder')}
                autoComplete="off"
                spellCheck={false}
              />
              <ul id="rpToResults" className="rp-results" />
            </div>
            <div className="rp-actions">
              <button id="rpGo" className="rp-btn">
                {t('map.plot_route')}
              </button>
              <button id="rpClear" className="rp-btn ghost">
                {t('map.clear')}
              </button>
            </div>
            <div id="rpMsg" className="rp-msg" />
          </div>

          <div id="stationFinder" className="panelbox" />
        </div>

        <div className="map-top-right">
          <div className="searchwrap">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="m11 11 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              id="mapSearch"
              type="text"
              placeholder={t('map.search_sector_placeholder')}
              autoComplete="off"
              spellCheck={false}
            />
            <ul id="searchResults" className="panelbox" />
          </div>
        </div>
      </div>

      <div id="shipsPanels" className="ov">
        <div id="shipsIndex" className="panelbox" />
        <div id="timelineIndex" className="panelbox" />
      </div>
      <button
        id="mobileLegendToggle"
        className="ov mobile-map-toggle panelbox"
        type="button"
        aria-controls="mapLegend"
        aria-expanded={mobileLegendOpen}
        onClick={() => {
          setMobileLegendOpen((open) => !open)
          setMobileToolsOpen(false)
        }}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m10 3 7 4-7 4-7-4 7-4Z" stroke="currentColor" strokeLinejoin="round" />
          <path d="m3 11 7 4 7-4M3 15l7 4 7-4" stroke="currentColor" strokeLinejoin="round" />
        </svg>
        <span>{t('map.legend')}</span>
      </button>
      <div
        id="mapLegend"
        className={`ov panelbox ${mobileLegendOpen ? 'mobile-open' : ''}`}
      />

      <div id="mapZoom" className="ov">
        <button id="zoomIn" className="panelbox" aria-label={t('accessibility.zoom_in')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
        <button id="zoomOut" className="panelbox" aria-label={t('accessibility.zoom_out')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
        <button id="zoomFit" className="panelbox" aria-label={t('accessibility.reset_view')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div id="mapHint" className="ov">
        {t('map.drag_zoom_hint')}
      </div>
      <aside id="mapPanel" className="panelbox" aria-live="polite" />
    </section>
  )
}
