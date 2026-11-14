/**
 * ============================================================================
 * VECTORLAB | PLANETARY ANALOG MAPPER — NASA SPACE APPS CHALLENGE
 * Module: app.js
 * Description: Core application controller managing the Leaflet.js orbital GIS
 *              interface, custom telemetry markers, target filtering, and
 *              dynamic DOM updates for the scientific information panel.
 * ============================================================================
 */

import { analogLocations } from './locations.js';

/* --------------------------------------------------------------------------
   1. APPLICATION STATE & CONFIGURATION
   -------------------------------------------------------------------------- */
const MAP_CONFIG = {
    initialCenter: [20.0, 0.0],
    initialZoom: 2,
    focusZoom: 6,
    minZoom: 2,
    maxZoom: 17,
    tileLayerUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> | NASA Space Apps — Vectorlab'
};

const appState = {
    map: null,
    markerLayerGroup: null,
    markersById: new Map(),
    selectedLocationId: null,
    activeFilter: 'ALL'
};

/* --------------------------------------------------------------------------
   2. DOM ELEMENT REFERENCES
   -------------------------------------------------------------------------- */
const dom = {
    mapContainer: document.getElementById('map'),
    infoPanel: document.getElementById('info-panel'),
    panelHeader: document.getElementById('panel-header'),
    panelContent: document.getElementById('panel-content'),
    siteTargetBadge: document.getElementById('site-target-badge'),
    siteIdCode: document.getElementById('site-id-code'),
    siteTitle: document.getElementById('site-title'),
    siteCoordinatesText: document.getElementById('site-coordinates-text'),
    hudCoords: document.getElementById('hud-coords'),
    btnResetMap: document.getElementById('btn-reset-map'),
    filterAll: document.getElementById('filter-all'),
    filterMars: document.getElementById('filter-mars'),
    filterMoon: document.getElementById('filter-moon'),
    telemetryTimestamp: document.getElementById('telemetry-timestamp')
};

/* --------------------------------------------------------------------------
   3. MAP INITIALIZATION & CUSTOM MARKER GENERATION
   -------------------------------------------------------------------------- */

/**
 * Initializes the Leaflet.js map with CartoDB Dark Matter tiles and HUD controls.
 */
function initMap() {
    if (!dom.mapContainer || typeof L === 'undefined') {
        console.error('Vectorlab Error: Map container or Leaflet.js library is missing.');
        return;
    }

    // Create Leaflet map instance with zoom controls positioned bottom-right
    appState.map = L.map('map', {
        center: MAP_CONFIG.initialCenter,
        zoom: MAP_CONFIG.initialZoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        zoomControl: false,
        worldCopyJump: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(appState.map);

    // Load Dark-Themed CartoDB Dark Matter Tile Layer
    L.tileLayer(MAP_CONFIG.tileLayerUrl, {
        attribution: MAP_CONFIG.tileAttribution,
        subdomains: 'abcd',
        maxZoom: MAP_CONFIG.maxZoom
    }).addTo(appState.map);

    // Layer group to manage analog pins dynamically
    appState.markerLayerGroup = L.layerGroup().addTo(appState.map);

    // Bind live cursor coordinate telemetry in top-left HUD
    appState.map.on('mousemove', (event) => {
        if (!dom.hudCoords) return;
        const { lat, lng } = event.latlng;
        dom.hudCoords.textContent = formatCoordinates([lat, lng]);
    });
}

/**
 * Builds a custom glowing Leaflet divIcon styled via style.css.
 * @param {Object} location - Analog location object.
 * @param {boolean} isActive - Whether this marker is currently selected.
 * @returns {L.DivIcon}
 */
function createCustomMarkerIcon(location, isActive = false) {
    const isMarsOnly = location.targetBody === 'Mars';
    const targetVariantClass = isMarsOnly ? 'marker-mars' : 'marker-moon';
    const activeClass = isActive ? 'active' : '';

    return L.divIcon({
        className: 'custom-analog-marker',
        html: `
            <div class="marker-pin-wrapper ${targetVariantClass} ${activeClass}" data-id="${location.id}" title="${location.name} (${location.targetBody})">
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
 * Loops through analogLocations and places interactive pins on the map.
 * @param {string} filter - 'ALL', 'MARS', or 'MOON'
 */
function renderMarkers(filter = 'ALL') {
    if (!appState.markerLayerGroup) return;

    appState.markerLayerGroup.clearLayers();
    appState.markersById.clear();

    const filteredLocations = analogLocations.filter((loc) => {
        if (filter === 'MARS') return loc.targetBody.toLowerCase().includes('mars');
        if (filter === 'MOON') return loc.targetBody.toLowerCase().includes('moon');
        return true;
    });

    filteredLocations.forEach((location) => {
        const isSelected = appState.selectedLocationId === location.id;
        const icon = createCustomMarkerIcon(location, isSelected);

        const marker = L.marker(location.coordinates, { icon });

        // Bind sleek hover tooltip for quick orbital identification
        marker.bindTooltip(
            `<div class="font-mono text-xs">
                <span class="text-cyan-400 font-semibold">${location.id}</span> // ${location.name}<br/>
                <span class="text-slate-400">Target: ${location.targetBody}</span>
            </div>`,
            {
                direction: 'top',
                offset: [0, -12],
                opacity: 0.95,
                className: 'leaflet-popup-content-wrapper'
            }
        );

        // Attach click listener to populate the right-side info panel
        marker.on('click', () => {
            selectLocation(location.id);
        });

        marker.addTo(appState.markerLayerGroup);
        appState.markersById.set(location.id, { marker, location });
    });
}

/* --------------------------------------------------------------------------
   4. LOCATION SELECTION & DYNAMIC INFO PANEL UPDATES
   -------------------------------------------------------------------------- */

/**
 * Handles marker selection, camera flyTo animation, and sidebar rendering.
 * @param {string} locationId - Unique ID of the selected analog location.
 */
function selectLocation(locationId) {
    const targetLocation = analogLocations.find((loc) => loc.id === locationId);
    if (!targetLocation) return;

    appState.selectedLocationId = locationId;

    // Update active state on map markers
    appState.markersById.forEach(({ marker, location }, id) => {
        const isCurrent = id === locationId;
        marker.setIcon(createCustomMarkerIcon(location, isCurrent));
    });

    // Smoothly fly orbital camera to selected coordinates
    if (appState.map) {
        appState.map.flyTo(targetLocation.coordinates, MAP_CONFIG.focusZoom, {
            animate: true,
            duration: 1.6
        });
    }

    // Update top-left HUD coordinates
    if (dom.hudCoords) {
        dom.hudCoords.textContent = formatCoordinates(targetLocation.coordinates);
    }

    // Populate the right-hand info panel with scientific details
    renderLocationDetails(targetLocation);
}

/**
 * Populates #info-panel with the default welcome/standby state on initial load.
 */
function renderWelcomeState() {
    appState.selectedLocationId = null;

    // Update Header
    if (dom.siteTargetBadge) {
        dom.siteTargetBadge.className =
            'text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
        dom.siteTargetBadge.textContent = 'Orbital Standby // Select Pin';
    }
    if (dom.siteIdCode) dom.siteIdCode.textContent = 'ID: VL-SYS';
    if (dom.siteTitle) dom.siteTitle.textContent = 'Planetary Analog Telemetry';
    if (dom.siteCoordinatesText) {
        dom.siteCoordinatesText.textContent = 'Click any glowing marker on the map to inspect site data';
    }

    // Populate Standby Body with Quick-Select Directory
    if (dom.panelContent) {
        const quickLinksHtml = analogLocations
            .map(
                (loc) => `
                <button type="button" data-select-id="${loc.id}" class="w-full text-left glass-card p-3 flex items-center justify-between group cursor-pointer">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-[11px] font-mono text-cyan-400">${loc.id}</span>
                            <span class="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition">${loc.name}</span>
                        </div>
                        <span class="text-[11px] font-mono text-slate-400 block mt-0.5">Target: ${loc.targetBody}</span>
                    </div>
                    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition"></i>
                </button>
            `
            )
            .join('');

        dom.panelContent.innerHTML = `
            <!-- Welcome Mission Briefing Card -->
            <div class="glass-card p-5 space-y-3">
                <div class="flex items-center gap-2.5 text-cyan-400">
                    <i data-lucide="satellite" class="w-5 h-5"></i>
                    <h3 class="text-xs font-mono uppercase tracking-wider font-semibold">Mission Control Briefing</h3>
                </div>
                <p class="text-sm text-slate-300 leading-relaxed">
                    Welcome to <strong class="text-white">Vectorlab</strong>. This operational GIS tool maps extreme terrestrial environments that serve as geological, mineralogical, and climatic analogs for permanent <span class="text-cyan-300">Lunar bases</span> and <span class="text-orange-400">Martian surface missions</span>.
                </p>
                <div class="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center font-mono">
                    <div class="bg-space-950/60 p-2 rounded border border-slate-800/70">
                        <span class="text-sm font-bold text-cyan-400 block">${analogLocations.length}</span>
                        <span class="text-[10px] text-slate-400 uppercase">Verified Sites</span>
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

            <!-- Interactive Quick-Access Directory -->
            <div class="space-y-2.5">
                <h3 class="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <i data-lucide="compass" class="w-4 h-4 text-cyan-400"></i>
                    <span>Active Analog Testbeds (Quick Select)</span>
                </h3>
                <div class="space-y-2">
                    ${quickLinksHtml}
                </div>
            </div>
        `;

        // Attach click listeners to quick-select directory buttons
        dom.panelContent.querySelectorAll('[data-select-id]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-select-id');
                selectLocation(id);
            });
        });

        refreshIcons();
    }
}

/**
 * Dynamically populates #info-panel with the selected location's scientific data.
 * @param {Object} location - Selected location object from locations.js.
 */
function renderLocationDetails(location) {
    if (!dom.panelContent) return;

    const isMarsOnly = location.targetBody === 'Mars';
    const badgeColorClasses = isMarsOnly
        ? 'bg-orange-500/15 text-orange-400 border-orange-500/40'
        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';

    // 1. Update Header: Name, Target Body Badge, ID & Coordinates
    if (dom.siteTargetBadge) {
        dom.siteTargetBadge.className = `text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border ${badgeColorClasses}`;
        dom.siteTargetBadge.textContent = `Target: ${location.targetBody}`;
    }
    if (dom.siteIdCode) {
        dom.siteIdCode.textContent = `ID: ${location.id}`;
    }
    if (dom.siteTitle) {
        dom.siteTitle.textContent = location.name;
    }
    if (dom.siteCoordinatesText) {
        const subtitle = location.targetSubtitle ? `${location.targetSubtitle} • ` : '';
        dom.siteCoordinatesText.textContent = `${subtitle}${formatCoordinates(location.coordinates)}`;
    }

    // Build Soil Composition Progress Bars if available
    const soilBarsHtml = Array.isArray(location.soilComposition)
        ? location.soilComposition
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
                </div>
            `
              )
              .join('')
        : '';

    // Extract optional structured telemetry metrics with safe fallbacks
    const telemetry = location.telemetry || {
        tempEarth: 'Extreme Regime',
        tempTarget: `Target: ${location.targetBody}`,
        aridityEarth: 'Hyper-Arid / Cryo',
        aridityTarget: 'Low Water Activity',
        soilSimilarity: 'High Fidelity',
        soilType: 'Planetary Regolith Simulant',
        uvFluxEarth: 'Elevated Surface Flux',
        uvFluxTarget: 'Unfiltered Solar Radiation'
    };

    // 2–5. Render Summary, Geological Similarity, Environmental Conditions & Space Agency Utility
    dom.panelContent.innerHTML = `
        <!-- 2. Summary Description -->
        <article id="card-overview" class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Executive Site Summary</span>
            </h3>
            <p id="site-description" class="text-sm text-slate-200 leading-relaxed">
                ${location.summary}
            </p>
        </article>

        <!-- 3. Geological Similarity (Soil / Regolith Details) -->
        <article id="card-soil-composition" class="glass-card p-4 space-y-3">
            <h3 class="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <i data-lucide="layers" class="w-4 h-4"></i>
                <span>Geological Similarity & Regolith</span>
            </h3>
            <p class="text-sm text-slate-300 leading-relaxed">
                ${location.geologicalSimilarity}
            </p>
            ${
                soilBarsHtml
                    ? `<div class="pt-3 border-t border-slate-800/80 space-y-2.5">
                           <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                               Mineralogical Breakdown (Fidelity: ${telemetry.soilSimilarity})
                           </span>
                           ${soilBarsHtml}
                       </div>`
                    : ''
            }
        </article>

        <!-- 4. Environmental Conditions (Climate, Radiation & Telemetry) -->
        <article id="card-metrics" class="glass-card p-4 space-y-3">
            <h3 class="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <i data-lucide="thermometer-snowflake" class="w-4 h-4"></i>
                <span>Environmental Conditions & Climate</span>
            </h3>
            <p class="text-sm text-slate-300 leading-relaxed">
                ${location.environmentalConditions}
            </p>
            <div id="metrics-grid" class="grid grid-cols-2 gap-2.5 pt-2">
                <div class="bg-space-950/70 border border-slate-800/80 rounded-lg p-2.5">
                    <span class="text-[10px] font-mono text-slate-400 block uppercase">Surface Temp</span>
                    <span id="metric-temp-earth" class="text-xs font-mono font-semibold text-white mt-1 block">${telemetry.tempEarth}</span>
                    <span id="metric-temp-target" class="text-[10px] font-mono text-cyan-400 mt-0.5 block">${telemetry.tempTarget}</span>
                </div>
                <div class="bg-space-950/70 border border-slate-800/80 rounded-lg p-2.5">
                    <span class="text-[10px] font-mono text-slate-400 block uppercase">Hydrology / Aridity</span>
                    <span id="metric-arid-earth" class="text-xs font-mono font-semibold text-white mt-1 block">${telemetry.aridityEarth}</span>
                    <span id="metric-arid-target" class="text-[10px] font-mono text-cyan-400 mt-0.5 block">${telemetry.aridityTarget}</span>
                </div>
                <div class="bg-space-950/70 border border-slate-800/80 rounded-lg p-2.5">
                    <span class="text-[10px] font-mono text-slate-400 block uppercase">Regolith Match</span>
                    <span id="metric-soil-score" class="text-xs font-mono font-semibold text-white mt-1 block">${telemetry.soilSimilarity}</span>
                    <span id="metric-soil-type" class="text-[10px] font-mono text-cyan-400 mt-0.5 block">${telemetry.soilType}</span>
                </div>
                <div class="bg-space-950/70 border border-slate-800/80 rounded-lg p-2.5">
                    <span class="text-[10px] font-mono text-slate-400 block uppercase">Radiation / UV Flux</span>
                    <span id="metric-uv-earth" class="text-xs font-mono font-semibold text-white mt-1 block">${telemetry.uvFluxEarth}</span>
                    <span id="metric-uv-target" class="text-[10px] font-mono text-cyan-400 mt-0.5 block">${telemetry.uvFluxTarget}</span>
                </div>
            </div>
        </article>

        <!-- 5. Space Agency Utility (Mission Testing Relevance) -->
        <article id="card-mission-relevance" class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <i data-lucide="rocket" class="w-4 h-4"></i>
                <span>Space Agency Utility & Field Testing</span>
            </h3>
            <p class="text-sm text-slate-200 leading-relaxed">
                ${location.spaceAgencyUtility}
            </p>
        </article>
    `;

    // Scroll info panel smoothly to top on new selection
    if (dom.infoPanel) {
        dom.infoPanel.scrollTo({ top: 0, behavior: 'smooth' });
    }

    refreshIcons();
}

/* --------------------------------------------------------------------------
   5. UI CONTROLS, FILTERS & HELPER UTILITIES
   -------------------------------------------------------------------------- */

/**
 * Formats [latitude, longitude] array into standard aerospace coordinate notation.
 * @param {number[]} coords - [lat, lng]
 * @returns {string}
 */
function formatCoordinates([lat, lng]) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Re-initializes Lucide vector icons after dynamic DOM updates.
 */
function refreshIcons() {
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

/**
 * Updates active styling on the top navigation bar filter buttons.
 * @param {HTMLElement} activeBtn
 */
function setActiveFilterButton(activeBtn) {
    const buttons = [dom.filterAll, dom.filterMars, dom.filterMoon];
    buttons.forEach((btn) => {
        if (!btn) return;
        btn.classList.remove(
            'active',
            'bg-cyan-500/20',
            'text-cyan-300',
            'border',
            'border-cyan-500/30'
        );
        btn.classList.add('text-slate-400');
    });

    if (activeBtn) {
        activeBtn.classList.remove('text-slate-400');
        activeBtn.classList.add('active');
    }
}

/**
 * Binds event listeners for orbital view reset, target body filters, and UTC telemetry clock.
 */
function bindUIEvents() {
    // Reset Orbital View Button
    if (dom.btnResetMap) {
        dom.btnResetMap.addEventListener('click', () => {
            if (appState.map) {
                appState.map.flyTo(MAP_CONFIG.initialCenter, MAP_CONFIG.initialZoom, {
                    animate: true,
                    duration: 1.4
                });
            }
            renderWelcomeState();
            renderMarkers(appState.activeFilter);
        });
    }

    // Target Body Filter Buttons (ALL / MARS / MOON)
    if (dom.filterAll) {
        dom.filterAll.addEventListener('click', () => {
            appState.activeFilter = 'ALL';
            setActiveFilterButton(dom.filterAll);
            renderMarkers('ALL');
        });
    }

    if (dom.filterMars) {
        dom.filterMars.addEventListener('click', () => {
            appState.activeFilter = 'MARS';
            setActiveFilterButton(dom.filterMars);
            renderMarkers('MARS');
        });
    }

    if (dom.filterMoon) {
        dom.filterMoon.addEventListener('click', () => {
            appState.activeFilter = 'MOON';
            setActiveFilterButton(dom.filterMoon);
            renderMarkers('MOON');
        });
    }

    // Live UTC Mission Clock in Panel Footer
    const updateClock = () => {
        if (!dom.telemetryTimestamp) return;
        const now = new Date();
        const utcString = now.toISOString().slice(11, 19);
        dom.telemetryTimestamp.textContent = `UTC: ${utcString}`;
    };
    updateClock();
    setInterval(updateClock, 1000);
}

/* --------------------------------------------------------------------------
   6. APPLICATION BOOTSTRAP
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderMarkers('ALL');
    renderWelcomeState();
    bindUIEvents();
    refreshIcons();
});