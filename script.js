// Configuration object
const CONFIG = {
    // Map initial settings
    map: {
        center: [23.8859, 45.0792],
        zoom: 6,
        minZoom: 5,
        maxZoom: 18
    },
    // Category colors
    categoryColors: {
    'Historical/Cultural': '#56B4E9',       // Light blue (UNESCO)
    'Natural': '#56B4E9',                   // (UNESCO)
    'Geo-Park': '#e33949',                  // red
    'Heritage Village': '#de937e',          // light orange
    'Hima/Bioreserve': '#ffe119',           // Yellow
    'Inviolable Sanctuary': '#fffac8',      // light Yellow
    'Mountain Area': '#3b210f',             // Brown
    'National Park': '#3f1d75',             // Dark lavander
    'Natural Reserve': '#28e050',           // Brihgt Green
    'Valley': '#051c0d',                    // Dark blue
    'Water Fronts & Islands': '#307cff',    // Blue
    'Wetland': '#7ce9f7',                   // light blue
    'Wildlife Reserve': '#138a2b',         // Green
    'Desert Meadow': '#d36ae6',             // Pink
    'Eco-Park': '#44BB99',                  // Light teal
    'Royal Natural Reserve': '#9966cc',     // Lavander
    'Sand Duns': '#AA8866',                 // Brown
    'Volcanic Crater': '#fa762f',           // Orange
    'Erg / Sand Sea': '#DDAA33',             // Gold
    'Rock Formations': '#91979b'            // gray

    }
};

// Initialize map
const map = L.map('map', {
    center: CONFIG.map.center,
    zoom: CONFIG.map.zoom,
    minZoom: CONFIG.map.minZoom,
    maxZoom: CONFIG.map.maxZoom
});

// Create basemap layers
const basemaps = {
  
   
      "Terrain": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    }),
  
  
    "Antique Map": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    }),
  

    "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    }),

    "Street": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB',
        maxZoom: 19
     }),
};

// Add default basemap
basemaps.Terrain.addTo(map);

// Add layer control
L.control.layers(basemaps, null, {
    position: 'topright',
    collapsed: false
}).addTo(map);

// Store layers and features
const layerGroups = {};
const allFeatures = [];

// Create popup content
function createPopupContent(properties, type) {
    let content = '<div class="popup-content">';
    if (type === 'unesco') {
    content += `
        <h3>${properties.Name || 'UNESCO Site'}</h3>
        <p><strong>Category:</strong> ${properties.Category}</p>
        <p><strong>City:</strong> ${properties.City}</p>
        <p><strong>Best Time to Visit:</strong> ${properties.Best_seaso}</p>
        <p><strong>Date of Inscription:</strong> ${properties.Comments}</p>
        ${properties.Link ? `<a href="${properties.Link}" target="_blank" class="info-button">More Information</a>` : ''}
    `;
}
     else if (type === 'peak') {
        content += `
            <h3>${properties.NAME || 'Mountain Peak'}</h3>
            <p><strong>Category:</strong> ${properties.Category || 'N/A'}</p>
        `;
    } else if (type === 'area') {
        content += `
            <h3>${properties.NAME || 'Protected Area'}</h3>
            <p><strong>Category:</strong> ${properties.Category || 'N/A'}</p>
        `;
    }
    
    content += '</div>';
    return content;
}

// Get unique categories
function getUniqueCategories(features) {
    const categories = new Set();
    features.forEach(feature => {
        if (feature.properties && feature.properties.Category) {
            categories.add(feature.properties.Category);
        }
    });
    return Array.from(categories).sort();
}

// Create legend
// Create legend
function createLegend(categories) {
    const legend = document.getElementById('legend');
    legend.innerHTML = `
        <div class="legend-header">
            <h4>Legend</h4>
        </div>
    `;

    // Add UNESCO site first
    const unescoDiv = document.createElement('div');
    unescoDiv.className = 'legend-item';
    
    const unescoCheckbox = document.createElement('input');
    unescoCheckbox.type = 'checkbox';
    unescoCheckbox.className = 'legend-checkbox';
    unescoCheckbox.checked = true;
    unescoCheckbox.addEventListener('change', (e) => {
        // Toggle both UNESCO categories
        toggleCategory('Historical/Cultural', e.target.checked);
        toggleCategory('Natural', e.target.checked);
    });

    const unescoSymbol = document.createElement('span');
    unescoSymbol.className = 'legend-symbol';
    unescoSymbol.style.width = '12px';
    unescoSymbol.style.height = '12px';
    unescoSymbol.style.backgroundColor = '#56B4E9';
    unescoSymbol.style.border = '2px solid #fff';
    unescoSymbol.style.borderRadius = '50%';
    unescoSymbol.style.display = 'inline-block';
    unescoSymbol.style.marginRight = '8px';

    const unescoLabel = document.createElement('span');
    unescoLabel.textContent = 'UNESCO site';
    unescoLabel.className = 'legend-label';

    unescoDiv.appendChild(unescoCheckbox);
    unescoDiv.appendChild(unescoSymbol);
    unescoDiv.appendChild(unescoLabel);
    legend.appendChild(unescoDiv);

    // Add other categories
    categories.forEach(category => {
        // Skip UNESCO categories as we've already added a combined entry
        if (category === 'Historical/Cultural' || category === 'Natural') {
            return;
        }

        const div = document.createElement('div');
        div.className = 'legend-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'legend-checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            toggleCategory(category, e.target.checked);
        });

        const symbolSpan = document.createElement('span');
        symbolSpan.className = 'legend-symbol';

        if (category === 'Mountain Peak') {
            symbolSpan.innerHTML = `
                <div style="width: 0; height: 0; 
                           border-left: 6px solid transparent;
                           border-right: 6px solid transparent;
                           border-bottom: 12px solid #FF6B1A;
                           display: inline-block;
                           margin-right: 8px;">
                </div>`;
        } else {
            symbolSpan.style.backgroundColor = CONFIG.categoryColors[category];
            symbolSpan.style.width = '16px';
            symbolSpan.style.height = '16px';
            symbolSpan.style.display = 'inline-block';
            symbolSpan.style.marginRight = '8px';
            symbolSpan.style.border = '1px solid rgba(0,0,0,0.2)';
        }

        const label = document.createElement('span');
        label.textContent = category;
        label.className = 'legend-label';

        div.appendChild(checkbox);
        div.appendChild(symbolSpan);
        div.appendChild(label);
        legend.appendChild(div);
    });
}






// Toggle category visibility
function toggleCategory(category, visible) {
    Object.values(layerGroups).forEach(group => {
        group.eachLayer(layer => {
            if (layer.feature && layer.feature.properties.Category === category) {
                if (visible) {
                    if (!map.hasLayer(layer)) {
                        map.addLayer(layer);
                    }
                } else {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                }
            }
        });
    });
}

// Load and process GeoJSON data
async function loadData() {
    try {
        // Load provinces
        const provinceResponse = await fetch('https://assets.codepen.io/13765673/prov_poly.geojson');
        const provinceData = await provinceResponse.json();
        layerGroups.provinces = L.geoJSON(provinceData, {
            style: {
                color: '#244',
                weight: 1,
                fillOpacity: 0.3
            }
        }).addTo(map);

        // Load all other data sources
        const sources = [
            { name: 'area2', url: 'https://assets.codepen.io/13765673/geoArea_2.geojson', type: 'area' },  // Largest areas in back
            { name: 'area1', url: 'https://assets.codepen.io/13765673/geoArea_1.geojson', type: 'area' },  // Medium areas in middle
            { name: 'area0', url: 'https://assets.codepen.io/13765673/geoArea_0.geojson', type: 'area' },  // Smallest areas on top
            { name: 'peaks', url: 'https://assets.codepen.io/13765673/peaks.geojson', type: 'peak' },
            { name: 'unesco', url: 'https://assets.codepen.io/13765673/unesco_time.geojson', type: 'unesco' }
        ];

        for (const source of sources) {
            const response = await fetch(source.url);
            const data = await response.json();
            
            data.features.forEach(feature => {
                if (feature.properties && feature.properties.Category) {
                    allFeatures.push(feature);
                }
            });

            layerGroups[source.name] = L.geoJSON(data, {
                style: feature => ({
                    fillColor: CONFIG.categoryColors[feature.properties.Category] || '#808080',
                    weight: 1,
                    opacity: 1,
                    color: '#fff',
                    fillOpacity: 0.7
                }),
                pointToLayer: function (feature, latlng) {
                    if (feature.properties.Category === 'Historical/Cultural' || 
                        feature.properties.Category === 'Natural') {
                        return L.circleMarker(latlng, {
                            radius: 8,
                            fillColor: '#56B4E9',
                            color: '#ffffff',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.7
                        });
                    } else if (feature.properties.Category === 'Mountain Peak') {
                        const peakIcon = L.divIcon({
                            html: `<div style="width: 0; height: 0; 
                                    border-left: 8px solid transparent;
                                    border-right: 8px solid transparent;
                                    border-bottom: 16px solid #FF6B1A;">
                                </div>`,
                            className: 'peak-marker',
                            iconSize: [16, 16],
                            iconAnchor: [8, 16]
                        });
                        return L.marker(latlng, { icon: peakIcon });
                    } else if (feature.properties.Category === 'Heritage Village') {
                        return L.circleMarker(latlng, {
                            radius: 10,
                            fillColor: '#CD853F',
                            color: '#8B4513',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.7
                        });
                    }
                    return L.marker(latlng);
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        mouseover: function (e) {
                            if (feature.geometry.type !== 'Point') {
                                layer.setStyle({ fillOpacity: 0.9, weight: 2 });
                            }
                            layer.bindPopup(createPopupContent(feature.properties, source.type)).openPopup();
                        },
                        mouseout: function (e) {
                            if (feature.geometry.type !== 'Point') {
                                layer.setStyle({ fillOpacity: 0.7, weight: 1 });
                            }
                        }
                    });
                }
            }).addTo(map);
        }

        // Create legend after all features are loaded
        const uniqueCategories = getUniqueCategories(allFeatures);
        createLegend(uniqueCategories);

         createTimeSlider();
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
       


// Initialize everything
loadData();

// Time slider implementation - improved version with toggle functionality
let timeSliderActive = false; // Track if time slider is active

function createTimeSlider() {
    console.log("Creating time slider...");
    
    // Check if UNESCO layer exists and is loaded
    if (!layerGroups.unesco) {
        console.error("UNESCO layer not found! Will retry in 1 second.");
        setTimeout(createTimeSlider, 1000);
        return;
    }
    
    // Create toggle button first (fixed position in corner)
    createTimeSliderToggle();
    
    try {
        // Find unique start years from UNESCO data
        const unescoFeatures = layerGroups.unesco.toGeoJSON().features;
        
        if (!unescoFeatures || unescoFeatures.length === 0) {
            console.error("No UNESCO features found in the layer!");
            return;
        }
        
        // Check if features have the required time properties
        if (!unescoFeatures[0].properties.hasOwnProperty('start')) {
            console.error("UNESCO features missing start property!");
            return;
        }
        
        // Extract and sort unique start years
        const startYears = [...new Set(unescoFeatures.map(f => f.properties.start))].sort((a, b) => a - b);
        
        if (startYears.length === 0) {
            console.error("No valid start years found!");
            return;
        }
        
        const minYear = startYears[0];
        const maxYear = startYears[startYears.length - 1];
        
        console.log(`Time range found: ${minYear} to ${maxYear}`);
        console.log(`Found ${startYears.length} unique start years`);
        
        // Create slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.id = 'time-slider-container';
        sliderContainer.className = 'time-slider-container';
        document.querySelector('body').appendChild(sliderContainer);
        
        // Create time display
        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'time-display';
        timeDisplay.className = 'time-display';
        timeDisplay.innerHTML = `<span id="year-display">${formatYear(minYear)}</span>`;
        sliderContainer.appendChild(timeDisplay);
        
        // Create slider with discrete steps for each unique year
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = startYears.length - 1;
        slider.value = 0;
        slider.step = 1;
        slider.id = 'time-slider';
        slider.className = 'time-slider';
        sliderContainer.appendChild(slider);
        
        // Create timeline markers (only for years that have sites)
        const timelineMarkers = document.createElement('div');
        timelineMarkers.className = 'timeline-markers';
        
        // Add markers only for years with sites
        startYears.forEach((year, index) => {
            // Only add visual markers if there aren't too many years
            if (startYears.length <= 20 || index % Math.ceil(startYears.length / 10) === 0) {
                const marker = document.createElement('span');
                marker.className = 'timeline-marker';
                marker.style.left = `${(index / (startYears.length - 1)) * 100}%`;
                marker.setAttribute('data-year', year);
                
                const label = document.createElement('span');
                label.className = 'timeline-label';
                label.textContent = formatYear(year);
                marker.appendChild(label);
                
                timelineMarkers.appendChild(marker);
            }
        });
        
        sliderContainer.appendChild(timelineMarkers);
        
        // Add play/pause button
        const playButton = document.createElement('button');
        playButton.id = 'play-button';
        playButton.className = 'play-button';
        playButton.innerHTML = '▶';
        playButton.title = 'Play timeline';
        sliderContainer.appendChild(playButton);
        
        // Time period display
        const periodDisplay = document.createElement('div');
        periodDisplay.id = 'period-display';
        periodDisplay.className = 'period-display';
        sliderContainer.appendChild(periodDisplay);
        
        // Slider count display
        const countDisplay = document.createElement('div');
        countDisplay.id = 'count-display';
        countDisplay.className = 'count-display';
        countDisplay.innerHTML = `Showing site <span id="site-index">1</span> of ${startYears.length}`;
        sliderContainer.appendChild(countDisplay);
        
        // Initialize animation variables
        let isPlaying = false;
        let animationInterval;
        
        // Slide event listener
        slider.addEventListener('input', function() {
            const yearIndex = parseInt(this.value);
            const selectedYear = startYears[yearIndex];
            updateMapTime(selectedYear);
            document.getElementById('site-index').textContent = (yearIndex + 1).toString();
        });
        
        // Play/pause functionality
        playButton.addEventListener('click', function() {
            if (isPlaying) {
                // Pause
                clearInterval(animationInterval);
                this.innerHTML = '▶';
                this.title = 'Play timeline';
            } else {
                // Play
                let currentIndex = parseInt(slider.value);
                
                animationInterval = setInterval(() => {
                    currentIndex++;
                    
                    if (currentIndex >= startYears.length) {
                        currentIndex = 0; // Loop back to beginning
                    }
                    
                    slider.value = currentIndex;
                    const selectedYear = startYears[currentIndex];
                    updateMapTime(selectedYear);
                    document.getElementById('site-index').textContent = (currentIndex + 1).toString();
                }, 2000); // Update every 2 seconds - slower to give time to view sites
                
                this.innerHTML = '❚❚';
                this.title = 'Pause timeline';
            }
            
            isPlaying = !isPlaying;
        });
        
        // Create the time slider container but keep it hidden initially
        sliderContainer.style.display = 'none';
        
        // Don't automatically update map time on creation - will be done when activated
        
    } catch (error) {
        console.error("Error creating time slider:", error);
    }
}

// Create toggle button for time slider
function createTimeSliderToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'time-slider-toggle';
    toggleButton.className = 'time-slider-toggle';
    toggleButton.innerHTML = '<i class="fa fa-clock-o"></i> Time Explorer';
    toggleButton.title = 'Toggle Time Explorer';
    document.querySelector('body').appendChild(toggleButton);
    
    toggleButton.addEventListener('click', function() {
        const sliderContainer = document.getElementById('time-slider-container');
        if (!sliderContainer) return;
        
        if (timeSliderActive) {
            // Deactivate time slider
            sliderContainer.style.display = 'none';
            this.innerHTML = '<i class="fa fa-clock-o"></i> Time Explorer';
            timeSliderActive = false;
            
            // Reset all sites to default appearance
            resetAllSites();
        } else {
            // Activate time slider
            sliderContainer.style.display = 'block';
            this.innerHTML = '<i class="fa fa-times"></i> Close Time Explorer';
            timeSliderActive = true;
            
            // Get the first year from the slider and update map
            const slider = document.getElementById('time-slider');
            if (slider) {
                const yearIndex = parseInt(slider.value);
                const unescoFeatures = layerGroups.unesco.toGeoJSON().features;
                const startYears = [...new Set(unescoFeatures.map(f => f.properties.start))].sort((a, b) => a - b);
                const selectedYear = startYears[yearIndex];
                updateMapTime(selectedYear);
            }
        }
    });
}

// Format year for display (BCE/CE)
function formatYear(year) {
    if (year < 0) {
        return `${Math.abs(year).toLocaleString()} BCE`;
    } else {
        return `${year.toLocaleString()} CE`;
    }
}

// Get time period name
function getTimePeriod(year) {
    if (year < -10000) return "Prehistoric";
    if (year < -1000) return "Neolithic/Bronze Age";
    if (year < 500) return "Iron Age/Classical";
    if (year < 1500) return "Medieval";
    return "Modern";
}

// Updated function to correctly apply pulsing effects
function updateMapTime(year) {
    // Update displays
    const yearDisplay = document.getElementById('year-display');
    const periodDisplay = document.getElementById('period-display');
    
    if (yearDisplay) yearDisplay.textContent = formatYear(year);
    if (periodDisplay) periodDisplay.textContent = getTimePeriod(year);
    
    // Get UNESCO layer
    const unescoLayer = layerGroups.unesco;
    if (!unescoLayer) return;
    
    let sitesForThisYear = [];
    
    // First, stop all animations and reset all UNESCO sites to default state
    unescoLayer.eachLayer(layer => {
        // Skip if layer doesn't have a feature
        if (!layer.feature || !layer.feature.properties) return;
        
        // Make sure all sites are visible
        if (!map.hasLayer(layer)) {
            map.addLayer(layer);
        }
        
        // Stop any existing pulse animations
        if (layer._pulseAnimation) {
            clearInterval(layer._pulseAnimation);
            layer._pulseAnimation = null;
        }
        
        // Reset styling for circle markers
        if (layer.setStyle) {
            layer.setStyle({
                radius: 8,
                fillColor: '#56B4E9',
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            });
        }
        
        // Check if this site started at the current year
        if (layer.feature.properties.start === year) {
            sitesForThisYear.push(layer);
        }
    });
    
    // Now highlight and start pulsing only for relevant sites
    sitesForThisYear.forEach(layer => {
        if (layer.setStyle) {
            applyPulsingEffect(layer);
        }
    });
    
    // Update site info - show all sites that started this year
    updateSiteInfo(sitesForThisYear.map(layer => layer.feature.properties));
}

// Completely revised pulsing effect for active sites
function applyPulsingEffect(layer) {
    // Set initial enhanced appearance
    layer.setStyle({
        radius: 8,
        fillColor: '#FF9500',  // Bright orange for better visibility
        color: '#FFFFFF',      // White border
        weight: 3,             // Thicker border
        opacity: 1,
        fillOpacity: 0.9
    });
    
    // Create pulsing animation
    let growing = true;
    let size = 8;
    const minSize = 8;
    const maxSize = 14;
    const speed = 100; // milliseconds between updates
    
    layer._pulseAnimation = setInterval(() => {
        if (growing) {
            size += 0.5;
            if (size >= maxSize) growing = false;
        } else {
            size -= 0.5;
            if (size <= minSize) growing = true;
        }
        
        layer.setStyle({
            radius: size,
            fillOpacity: 0.9 - ((size - minSize) / (maxSize - minSize) * 0.4),
            weight: 3 - ((size - minSize) / (maxSize - minSize))
        });
    }, speed);
}

// Reset all sites to default appearance (no pulsing)
function resetAllSites() {
    const unescoLayer = layerGroups.unesco;
    if (!unescoLayer) return;
    
    unescoLayer.eachLayer(layer => {
        if (!layer.feature || !layer.feature.properties) return;
        
        // Stop any existing pulse animations
        if (layer._pulseAnimation) {
            clearInterval(layer._pulseAnimation);
            layer._pulseAnimation = null;
        }
        
        // Reset styling
        if (layer.setStyle) {
            layer.setStyle({
                radius: 8,
                fillColor: '#56B4E9',
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            });
        }
    });
}

// Custom historical information for sites
const historicalInfo = {
    // Example format: "Site Name": "Custom historical information"
    "Hegra Archaeological Site (al-Hijr / Madâin Sâlih)": "Once a thriving Nabataean city, Hegra (Mada'in Saleh) served as a major trading hub on ancient caravan routes. The site features remarkable rock-cut tombs similar to those at Petra but in better preservation. The Nabataeans inhabited the area from the 1st century BCE to 1st century CE, creating an impressive civilization in the desert.",
    "Historic Jeddah, the Gate to Makkah": "As the gateway to Mecca, Historic Jeddah (Al-Balad) has welcomed pilgrims for centuries. Its distinctive architecture features multi-story buildings with wooden roshan balconies and coral stone construction, adapted perfectly to the local climate. The area was a crucial commercial hub connecting Africa, Asia, and Europe through Red Sea trade.",
    "At-Turaif District": "The At-Turaif District in ad-Dir'iyah was the first capital of the Saudi dynasty. Founded in the 15th century, it became the center of power for the Saud family by the 18th century. Its distinctive Najdi architectural style used mudbrick construction with beautiful geometric patterns. This site represents the origins of modern Saudi Arabia.",
    "Rock Art in the Hail Region": "The rock art in Hail (Jubbah and Shuwaymis) contains some of the most important Neolithic petroglyphs in the world, dating back to 10,000 BCE. These remarkable images document the transition from hunter-gatherer to pastoral societies in the Arabian Peninsula, depicting humans and animals when the area was lush savanna rather than desert.",
    "Al-Ahsa Oasis": "The Al-Ahsa Oasis, one of the world's largest, has been continuously inhabited for over 6,000 years. This cultural landscape features gardens, canals, springs, wells, and historical buildings that demonstrate remarkable water management in a desert environment. It was a vital stop on ancient trade routes and continues to produce dates and other crops today."
};

// Updated function to display only custom historical information
function updateSiteInfo(sitesProps) {
    // Create or get the site info container
    let infoContainer = document.getElementById('site-info-container');
    
    if (!infoContainer) {
        infoContainer = document.createElement('div');
        infoContainer.id = 'site-info-container';
        infoContainer.className = 'site-info-container';
        document.getElementById('time-slider-container').appendChild(infoContainer);
    }
    
    if (sitesProps && sitesProps.length > 0) {
        let infoHTML = `<h4>${sitesProps.length} site(s) established in ${formatYear(sitesProps[0].start)}</h4>`;
        
        // If there are several sites, create a compact list
        if (sitesProps.length > 1) {
            infoHTML += '<ul class="site-list">';
            sitesProps.forEach(site => {
                // Check if we have custom historical info for this site
                const customInfo = historicalInfo[site.Name] || "";
                
                infoHTML += `
                    <li>
                        <strong>${site.Name}</strong>
                        ${customInfo ? 
                            `<p class="historical-info">${customInfo}</p>` : 
                            '<p class="no-info">Hover over the site for more information</p>'}
                    </li>
                `;
            });
            infoHTML += '</ul>';
        } else {
            // For a single site, show only name and historical info
            const site = sitesProps[0];
            // Check if we have custom historical info for this site
            const customInfo = historicalInfo[site.Name] || "";
            
            infoHTML += `
                <h5>${site.Name}</h5>
                ${customInfo ? 
                    `<div class="historical-section">
                        <p>${customInfo}</p>
                     </div>` : 
                     '<p class="no-info">Hover over the site on the map for more information.</p>'}
            `;
        }
        
        infoContainer.innerHTML = infoHTML;
        infoContainer.style.display = 'block';
    } else {
        infoContainer.style.display = 'none';
    }
}

// Add updated CSS for the time slider
const timeSliderStyles = document.createElement('style');
timeSliderStyles.textContent = `
.time-slider-container {
    position: absolute;
    bottom: 73px;
    left: 20px;
    width: 337px;
    max-width: 300px;
    background-color: rgba(255, 255, 255, 0.95);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.2rem;
}

.time-display {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: left;
    color: #333;
}

.period-display {
    font-size: 14px;
    color: #555;
    margin-top: 3px;
    font-style: italic;
}

.count-display {
    font-size: 12px;
    color: #777;
    margin-top: 8px;
}

.time-slider {
    width: 100%;
    height: 20px;
    -webkit-appearance: none;
    background: transparent;
    margin: 15px 0;
}

.time-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    cursor: pointer;
    background: #e0e0e0;
    border-radius: 4px;
}

.time-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 22px;
    width: 22px;
    border-radius: 50%;
    background: #56B4E9;
    cursor: pointer;
    margin-top: -7px;
    border: 3px solid white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: background 0.2s;
}

.time-slider::-webkit-slider-thumb:hover {
    background: #3498db;
}

.time-slider::-moz-range-track {
    width: 100%;
    height: 8px;
    cursor: pointer;
    background: #e0e0e0;
    border-radius: 4px;
}

.time-slider::-moz-range-thumb {
    height: 22px;
    width: 22px;
    border-radius: 50%;
    background: #56B4E9;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: background 0.2s;
}

.timeline-markers {
    position: relative;
    width: 100%;
    height: 25px;
    margin-top: -10px;
}

.timeline-marker {
    position: absolute;
    width: 2px;
    height: 10px;
    background-color: #666;
    transform: translateX(-50%);
}

.timeline-label {
    position: absolute;
    font-size: 11px;
    white-space: nowrap;
    color: #666;
    transform: translateX(-50%) rotate(-30deg);
    top: 14px;
    left: 0;
    transform-origin: top left;
}

.play-button {
    background-color: #56B4E9;
    color: white;
    border: none;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-top: 15px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    transition: background-color 0.2s, transform 0.1s;
}

.play-button:hover {
    background-color: #3498db;
    transform: scale(1.05);
}

.play-button:active {
    transform: scale(0.95);
}

.site-info-container {
    margin-top: 12px;
    background-color: rgba(240, 248, 255, 0.9);
    border-radius: 6px;
    padding: 10px;
    width: 100%;
    max-height: 150px;
    overflow-y: auto;
    border-left: 3px solid #56B4E9;
    font-size: 0.85rem;
}

.site-info-container h4 {
    margin-top: 0;
    margin-bottom: 6px;
    color: #2c3e50;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
    font-size: 14px;
}

.site-info-container h5 {
    margin-top: 8px;
    margin-bottom: 4px;
    color: #34495e;
    font-size: 13px;
}

.site-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.site-list li {
    padding: 10px 0;
    border-bottom: 1px dashed #eee;
}

.site-list li:last-child {
    border-bottom: none;
}

.historical-info {
    font-style: italic;
    color: #555;
    margin: 8px 0;
    font-size: 13px;
    line-height: 1.4;
    background-color: rgba(255, 248, 220, 0.5);
    padding: 8px;
    border-radius: 4px;
    border-left: 3px solid #e9bc62;
}

.historical-section {
    margin-top: 12px;
    background-color: rgba(255, 248, 220, 0.5);
    padding: 10px;
    border-radius: 6px;
    border-left: 4px solid #e9bc62;
}

.site-location {
    color: #666;
    margin: 4px 0;
}

.site-period {
    font-size: 12px;
    color: #777;
    margin-top: 4px;
}

.no-info {
    font-style: italic;
    color: #888;
    font-size: 13px;
}

/* Time Slider Toggle Button */
.time-slider-toggle {
    position: fixed;
    top: 550px;
    left: 40px;
    background-color: #56B4E9;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    cursor: pointer;
    z-index: 1000;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.time-slider-toggle:hover {
    background-color: #3498db;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.25);
}

.time-slider-toggle:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
    .time-slider-container {
        width: 90%;
        max-width: none;
        padding: 15px;
    }
    
    .time-display {
        font-size: 18px;
    }
    
    .timeline-label {
        display: none;
    }
}
`;


document.head.appendChild(timeSliderStyles);

// Initialize welcome panel
function initWelcomePanel() {
  const welcomePanel = document.getElementById('welcome-panel');
  const closeWelcome = document.getElementById('close-welcome');
  const startExploring = document.getElementById('start-exploring');
  
  // For testing, always show welcome panel
  localStorage.removeItem('sa-geotourism-welcomed');
  
  const hasSeenWelcome = localStorage.getItem('sa-geotourism-welcomed');
  
  if (!hasSeenWelcome) {
    // Add slight delay and make sure it's visible
    setTimeout(() => {
      welcomePanel.style.display = 'block';
      // Force browser to recognize the change
      setTimeout(() => {
        welcomePanel.style.opacity = '1';
        welcomePanel.style.transform = 'translate(-50%, -50%)';
      }, 10);
    }, 1000);
  } else {
    welcomePanel.style.display = 'none';
  }
  
  function hideWelcomePanel() {
    welcomePanel.style.opacity = '0';
    welcomePanel.style.transform = 'translate(-50%, -60%)';
    setTimeout(() => {
      welcomePanel.style.display = 'none';
    }, 500);
    localStorage.setItem('sa-geotourism-welcomed', 'true');
  }
  
  closeWelcome.addEventListener('click', hideWelcomePanel);
  startExploring.addEventListener('click', hideWelcomePanel);
  
  // For debugging
  console.log("Welcome panel initialized");
}

// Call after map initialization
initWelcomePanel();