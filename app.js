/**
 * ============================================================================
 * VECTORLAB | PLANETARY ANALOG MAPPER — NASA SPACE APPS CHALLENGE
 * Module: app.js
 * Description: Production ES6 controller initializing Leaflet.js, custom
 *              pulsing markers, interactive target-body filter tabs, and
 *              dynamic DOM updates for the right-hand scientific info panel.
 * ============================================================================
 */

import { analogLocations } from './locations.js';

/* --------------------------------------------------------------------------
   1. APPLICATION CONFIGURATION & STATE
   -------------------------------------------------------------------------- */
const MAP_CONFIG = {
    initialCenter: [20.0, 0.0],
    initialZoom: 2,
    focusZoom: 5,
    minZoom: 2,
    maxZoom: 17,
    tileLayerUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    tileAttribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> | NASA Space Apps — Vectorlab'
};

const appState = {
    map: null,
    markerLayerGroup: null,
    markersById: new Map(),
    selectedLocationId: null,
    activeFilter: 'ALL' // 'ALL' | 'MARS' | 'MOON'
};

/* --------------------------------------------------------------------------
   2. DOM ELEMENT REFERENCES
   -------------------------------------------------------------------------- */
const dom = {};

function cacheDomElements() {
    dom.mapContainer = document.getElementById('map');
    dom.infoPanel = document.getElementById('info-panel');
    dom.panelHeader = document.getElementById('panel-header');
    dom.panelContent = document.getElementById('panel-content');
    dom.siteTargetBadge = document.getElementById('site-target-badge');
    dom.siteIdCode = document.getElementById('site-id-code');
    dom.siteTitle = document.getElementById('site-title');
    dom.siteCoordinatesText = document.getElementById('site-coordinates-text');
    dom.hudCoords = document.getElementById('hud-coords');
    dom.btnResetMap = document.getElementById('btn-reset-map');
    dom.filterAll = document.getElementById('filter-all');
    dom.filterMars = document.getElementById('filter-mars');
    dom.filterMoon = document.getElementById('filter-moon');
    dom.telemetryTimestamp = document.getElementById('telemetry-timestamp');
}

/* --------------------------------------------------------------------------
   3. LEAFLET MAP INITIALIZATION & MARKER RENDERING
   -------------------------------------------------------------------------- */

/**
 * Initializes the Leaflet map with CartoDB Dark Matter tiles.
 */
function initMap() {
    if (!dom.mapContainer || typeof L === 'undefined') {
        console.error('Vectorlab Error: #map container or Leaflet.js CDN not loaded.');
        return;
    }

    appState.map = L.map('map', {
        center: MAP_CONFIG.initialCenter,
        zoom: MAP_CONFIG.initialZoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        zoomControl: false,
        worldCopyJump: true
    });

    // Place zoom controls on bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(appState.map);

    // Add CartoDB Dark Matter tile layer
    L.tileLayer(MAP_CONFIG.tileLayerUrl, {
        attribution: MAP_CONFIG.tileAttribution,
        subdomains: 'abcd',
        maxZoom: MAP_CONFIG.maxZoom
    }).addTo(appState.map);

    // Layer group for dynamic marker filtering
    appState.markerLayerGroup = L.layerGroup().addTo(appState.map);

    // Ensure Leaflet calculates container dimensions accurately inside CSS Grid
    setTimeout(() => {
        appState.map.invalidateSize();
    }, 100);

    // Live cursor coordinates in HUD
    appState.map.on('mousemove', (event) => {
        if (!dom.hudCoords) return;
        const { lat, lng } = event.latlng;
        dom.hudCoords.textContent = formatCoordinates([lat, lng]);
    });
}

/**
 * Returns locations matching the active filter ('ALL', 'MARS', or 'MOON').
 * @param {string} filter
 * @returns {Array}
 */
function getFilteredLocations(filter = 'ALL') {
    return analogLocations.filter((loc) => {
        const target = loc.targetBody.toLowerCase();
        if (filter === 'MARS') return target.includes('mars');
        if (filter === 'MOON') return target.includes('moon');
        return true;
    });
}

/**
 * Creates a glowing custom Leaflet divIcon for an analog site.
 * @param {Object} location
 * @param {boolean} isActive
 * @returns {L.DivIcon}
 */
function createCustomMarkerIcon(location, isActive = false) {
    const isMarsOnly = location.targetBody === 'Mars';
    const targetVariantClass = isMarsOnly ? 'marker-mars' : 'marker-moon';
    const activeClass = isActive ? 'active' : '';

    return L.divIcon({
        className: 'custom-analog-marker',
        html: `
            <div class="marker-pin-wrapper ${targetVariantClass} ${activeClass}" data-id="${location.id}">
                <div class="marker-pulse-ring"></div>
                <div class="marker-core"></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
}

/**
 * Renders markers on the Leaflet map according to the selected filter tab.
 * @param {string} filter - 'ALL' | 'MARS' | 'MOON'
 */
function renderMarkers(filter = 'ALL') {
    if (!appState.markerLayerGroup) return;

    appState.markerLayerGroup.clearLayers();
    appState.markersById.clear();

    const filteredLocations = getFilteredLocations(filter);

    filteredLocations.forEach((location) => {
        const isSelected = appState.selectedLocationId === location.id;
        const icon = createCustomMarkerIcon(location, isSelected);
        const marker = L.marker(location.coordinates, { icon });

        // Hover Tooltip
        marker.bindTooltip(
            `<div class="font-mono text-xs px-1 py-0.5">
                <span class="text-cyan-400 font-semibold">${location.id}</span> // ${location.name}<br/>
                <span class="text-slate-400">Target Body: ${location.targetBody}</span>
            </div>`,
            {
                direction: 'top',
                offset: [0, -14],
                opacity: 0.95
            }
        );

        // Click Event Listener -> Populate Right Info Panel
        marker.on('click', () => {
            selectLocation(location.id);
        });

        marker.addTo(appState.markerLayerGroup);
        appState.markersById.set(location.id, { marker, location });
    });
}

/* --------------------------------------------------------------------------
   4. LOCATION SELECTION & SIDEBAR DOM UPDATES
   -------------------------------------------------------------------------- */

/**
 * Selects a location by ID, flies the map camera to its coordinates,
 * and populates #info-panel with full scientific details.
 * @param {string} locationId
 */
function selectLocation(locationId) {
    const targetLocation = analogLocations.find((loc) => loc.id === locationId);
    if (!targetLocation) return;

    appState.selectedLocationId = locationId;

    // Highlight active pin on map
    appState.markersById.forEach(({ marker, location }, id) => {
        marker.setIcon(createCustomMarkerIcon(location, id === locationId));
    });

    // Smoothly fly map to location
    if (appState.map) {
        appState.map.flyTo(targetLocation.coordinates, MAP_CONFIG.focusZoom, {
            animate: true,
            duration: 1.5
        });
    }

    // Update HUD coordinates
    if (dom.hudCoords) {
        dom.hudCoords.textContent = formatCoordinates(targetLocation.coordinates);
    }

    // Populate right-hand info panel
    renderLocationDetails(targetLocation);
}

/**
 * Renders the default welcome/standby view in #info-panel before a pin is clicked
 * or when filtering / resetting the orbital view.
 */
function renderWelcomeState() {
    appState.selectedLocationId = null;
    const visibleLocations = getFilteredLocations(appState.activeFilter);

    const filterLabelMap = {
        ALL: 'Orbital Standby // All Analogs',
        MARS: 'Filter Active // Mars Targets',
        MOON: 'Filter Active // Lunar Targets'
    };

    if (dom.siteTargetBadge) {
        dom.siteTargetBadge.className =
            'text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
        dom.siteTargetBadge.textContent = filterLabelMap[appState.activeFilter] || 'Orbital Standby';
    }
    if (dom.siteIdCode) dom.siteIdCode.textContent = `SITES: ${visibleLocations.length}`;
    if (dom.siteTitle) dom.siteTitle.textContent = 'Planetary Analog Telemetry';
    if (dom.siteCoordinatesText) {
        dom.siteCoordinatesText.textContent =
            'Select a glowing marker on the map or choose a testbed below';
    }

    if (!dom.panelContent) return;

    const directoryButtonsHtml = visibleLocations
        .map(
            (loc) => `
            <button type="button" data-select-id="${loc.id}" class="w-full text-left glass-card p-3.5 flex items-center justify-between group cursor-pointer">
                <div class="pr-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] font-mono text-cyan-400 font-semibold">${loc.id}</span>
                        <span class="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition">${loc.name}</span>
                    </div>
                    <span class="text-[11px] font-mono text-slate-400 block mt-1">
                        Target Body: <strong class="text-slate-200">${loc.targetBody}</strong>
                    </span>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 transition"></i>
            </button>
        `
        )
        .join('');

    dom.panelContent.innerHTML = `
        <!-- Welcome Mission Briefing -->
        <div class="glass-card p-5 space-y-3">
            <div class="flex items-center gap-2.5 text-cyan-400">
                <i data-lucide="satellite" class="w-5 h-5"></i>
                <h3 class="text-xs font-mono uppercase tracking-wider font-semibold">Mission Control Briefing</h3>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">
                Welcome to <strong class="text-white">Vectorlab</strong>. Click any pulsing marker on the map or select an analog site below to inspect its geological similarity, environmental conditions, and space agency utility.
            </p>
            <div class="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center font-mono">
                <div class="bg-space-950/60 p-2 rounded border border-slate-800/70">
                    <span class="text-sm font-bold text-cyan-400 block">${visibleLocations.length}</span>
                    <span class="text-[10px] text-slate-400 uppercase">Active Pins</span>
                </div>
                <div class="bg-space-950/60 p-2 rounded border border-slate-800/70">
                    <span class="text-sm font-bold text-orange-400 block">Mars</span>
                    <span class="text-[10px] text-slate-400 uppercase">Arid / Cryo</span>
                </div>
                <div class="bg-space-950/60 p-2 rounded border border-slate-800/70">
                    <span class="text-sm font-bold text-blue-400 block">Moon</span>
                    <span class="text-[10px] text-slate-400 uppercase">Basalt / Crater</span>
                </div>
            </div>
        </div>

        <!-- Interactive Site Directory -->
        <div class="space-y-2.5">
            <h3 class="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <i data-lucide="compass" class="w-4 h-4 text-cyan-400"></i>
                <span>Verified Analog Locations (${visibleLocations.length})</span>
            </h3>
            <div class="space-y-2">
                ${directoryButtonsHtml}
            </div>
        </div>
    `;

    // Bind click listeners to directory cards
    dom.panelContent.querySelectorAll('[data-select-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const siteId = btn.getAttribute('data-select-id');
            selectLocation(siteId);
        });
    });

    refreshIcons();
}

/**
 * Updates #info-panel with the 5 required scientific sections for a selected site.
 * @param {Object} location
 */
function renderLocationDetails(location) {
    if (!dom.panelContent) return;

    const isMarsOnly = location.targetBody === 'Mars';
    const badgeColorClasses = isMarsOnly
        ? 'bg-orange-500/15 text-orange-400 border-orange-500/40'
        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';

    // 1. Header: Name & Target Body (Moon / Mars)
    if (dom.siteTargetBadge) {
        dom.siteTargetBadge.className = `text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border ${badgeColorClasses}`;
        dom.siteTargetBadge.textContent = `Target Body: ${location.targetBody}`;
    }
    if (dom.siteIdCode) {
        dom.siteIdCode.textContent = `ID: ${location.id}`;
    }
    if (dom.siteTitle) {
        dom.siteTitle.textContent = location.name;
    }
    if (dom.siteCoordinatesText) {
        dom.siteCoordinatesText.textContent = formatCoordinates(location.coordinates);
    }

    // Optional soil composition bars if present in locations.js
    const soilBarsHtml = Array.isArray(location.soilComposition)
        ? `<div class="pt-3 border-t border-slate-800/80 space-y-2.5">
               <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                   Regolith Mineralogical Profile
               </span>
               ${location.soilComposition
                   .map(
                       (item) => `
                   <div class="space-y-1">
                       <div class="flex justify-between text-xs font-mono">
                           <span class="text-slate-300">${item.mineral}</span>
                           <span class="text-cyan-400 font-semibold">${item.percentage}%</span>
                       </div>
                       <div class="composition-bar-track">
                           <div class="composition-bar-fill" style="width: ${item.percentage}%"></div>
                       </div>
                   </div>`
                   )
                   .join('')}
           </div>`
        : '';

    // 2-5. Summary, Geological Similarity, Environmental Conditions, Space Agency Utility
    dom.panelContent.innerHTML = `
        <!-- Back to Directory Button -->
        <button id="btn-back-directory" type="button" class="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            <span>BACK TO ALL SITES</span>
        </button>

        <!-- 2. Summary Description -->
        <article class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Site Summary</span>
            </h3>
            <p class="text-sm text-slate-200 leading-relaxed">
                ${location.summary}
            </p>
        </article>

        <!-- 3. Geological Similarity -->
        <article class="glass-card p-4 space-y-3">
            <h3 class="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <i data-lucide="layers" class="w-4 h-4"></i>
                <span>Geological Similarity (Soil & Regolith)</span>
            </h3>
            <p class="text-sm text-slate-300 leading-relaxed">
                ${location.geologicalSimilarity}
            </p>
            ${soilBarsHtml}
        </article>

        <!-- 4. Environmental Conditions -->
        <article class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <i data-lucide="thermometer-snowflake" class="w-4 h-4"></i>
                <span>Environmental Conditions (Climate & Radiation)</span>
            </h3>
            <p class="text-sm text-slate-300 leading-relaxed">
                ${location.environmentalConditions}
            </p>
        </article>

        <!-- 5. Space Agency Utility -->
        <article class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <i data-lucide="rocket" class="w-4 h-4"></i>
                <span>Space Agency Utility (Mission Testing)</span>
            </h3>
            <p class="text-sm text-slate-200 leading-relaxed">
                ${location.spaceAgencyUtility}
            </p>
        </article>
    `;

    // Bind "Back to All Sites" button inside panel
    const backBtn = document.getElementById('btn-back-directory');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            renderWelcomeState();
            renderMarkers(appState.activeFilter);
        });
    }

    if (dom.infoPanel) {
        dom.infoPanel.scrollTo({ top: 0, behavior: 'smooth' });
    }

    refreshIcons();
}

/* --------------------------------------------------------------------------
   5. FILTER TABS, CONTROLS & UTILITIES
   -------------------------------------------------------------------------- */

/**
 * Handles clicking ALL ANALOGS, MARS TARGETS, or LUNAR TARGETS in the navbar.
 * @param {'ALL' | 'MARS' | 'MOON'} filterType
 * @param {HTMLElement} clickedButton
 */
function applyTargetFilter(filterType, clickedButton) {
    appState.activeFilter = filterType;

    // Update active button classes
    const allFilterButtons = [dom.filterAll, dom.filterMars, dom.filterMoon];
    allFilterButtons.forEach((btn) => {
        if (!btn) return;
        btn.classList.remove(
            'active',
            'bg-cyan-500/20',
            'text-cyan-300',
            'border-cyan-500/30'
        );
        btn.classList.add('text-slate-400', 'border-transparent');
    });

    if (clickedButton) {
        clickedButton.classList.remove('text-slate-400', 'border-transparent');
        clickedButton.classList.add(
            'active',
            'bg-cyan-500/20',
            'text-cyan-300',
            'border-cyan-500/30'
        );
    }

    // Re-render filtered markers on the map
    renderMarkers(filterType);

    // Reset map to global overview so user sees all matching pins
    if (appState.map) {
        appState.map.flyTo(MAP_CONFIG.initialCenter, MAP_CONFIG.initialZoom, {
            animate: true,
            duration: 1.2
        });
    }

    // If currently selected site is excluded by the new filter, return to directory view
    const visibleIds = new Set(getFilteredLocations(filterType).map((l) => l.id));
    if (!appState.selectedLocationId || !visibleIds.has(appState.selectedLocationId)) {
        renderWelcomeState();
    }
}

/**
 * Formats [latitude, longitude] into standard aerospace coordinates.
 * @param {number[]} coords
 * @returns {string}
 */
function formatCoordinates([lat, lng]) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Renders Lucide icons safely.
 */
function refreshIcons() {
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

/**
 * Attaches event listeners to navbar tabs, orbital reset button, and UTC clock.
 */
function bindUIEvents() {
    if (dom.filterAll) {
        dom.filterAll.addEventListener('click', () => applyTargetFilter('ALL', dom.filterAll));
    }
    if (dom.filterMars) {
        dom.filterMars.addEventListener('click', () => applyTargetFilter('MARS', dom.filterMars));
    }
    if (dom.filterMoon) {
        dom.filterMoon.addEventListener('click', () => applyTargetFilter('MOON', dom.filterMoon));
    }

    if (dom.btnResetMap) {
        dom.btnResetMap.addEventListener('click', () => {
            if (appState.map) {
                appState.map.flyTo(MAP_CONFIG.initialCenter, MAP_CONFIG.initialZoom, {
                    animate: true,
                    duration: 1.3
                });
            }
            renderWelcomeState();
            renderMarkers(appState.activeFilter);
        });
    }

    // UTC Mission Clock
    const updateClock = () => {
        if (!dom.telemetryTimestamp) return;
        const utcString = new Date().toISOString().slice(11, 19);
        dom.telemetryTimestamp.textContent = `UTC: ${utcString}`;
    };
    updateClock();
    setInterval(updateClock, 1000);
}

/* --------------------------------------------------------------------------
   6. SAFE MODULE BOOTSTRAP
   -------------------------------------------------------------------------- */
function bootstrapVectorlab() {
    cacheDomElements();
    initMap();
    renderMarkers('ALL');
    renderWelcomeState();
    bindUIEvents();
    refreshIcons();
}

// Safely initialize whether DOMContentLoaded has already fired or is still loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapVectorlab);
} else {
    bootstrapVectorlab();
}