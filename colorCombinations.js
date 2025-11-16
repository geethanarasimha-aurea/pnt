// Color Combinations Generator
class ColorCombinations {
    constructor() {
        this.combinationTypes = {
            complementary: 'Complementary',
            analogous: 'Analogous',
            triadic: 'Triadic',
            splitComplementary: 'Split Complementary',
            tetradic: 'Tetradic',
            square: 'Square',
            monochromatic: 'Monochromatic'
        };
        
        this.initialized = false;
        this.currentBaseColor = '#3498db';
        this.autoUpdateEnabled = true;
        this.isUpdatingFromCombination = false;
    }

    // Convert HEX to HSL
    hexToHsl(hex) {
        hex = hex.replace('#', '');
        
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        let r = parseInt(hex.substring(0, 2), 16) / 255;
        let g = parseInt(hex.substring(2, 4), 16) / 255;
        let b = parseInt(hex.substring(4, 6), 16) / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    // Convert HSL to HEX
    hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    // Clamp values to prevent invalid HSL values
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Validate and remove duplicate colors
    validateAndDeduplicateColors(colors) {
        const validColors = [];
        const seenColors = new Set();
        
        for (const color of colors) {
            if (color && /^#[0-9A-F]{6}$/i.test(color)) {
                const normalizedColor = color.toUpperCase();
                if (!seenColors.has(normalizedColor)) {
                    validColors.push(normalizedColor);
                    seenColors.add(normalizedColor);
                }
            }
        }
        
        return validColors.length > 0 ? validColors : [colors[0] || '#3498DB'];
    }

    // Generate color combinations - FIXED ANALOGOUS WITH BASE IN CENTER
    generateCombinations(baseColor, type) {
        const [h, s, l] = this.hexToHsl(baseColor);
        let combinations = [];

        switch (type) {
            case 'complementary':
                combinations = [
                    baseColor,
                    this.hslToHex((h + 180) % 360, s, l)
                ];
                break;

            case 'analogous':
                // Analogous colors with base color ALWAYS in center position
                combinations = [
                    this.hslToHex((h - 30 + 360) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80)),
                    this.hslToHex((h - 15 + 360) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80)),
                    baseColor, // BASE COLOR IN CENTER
                    this.hslToHex((h + 15) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80)),
                    this.hslToHex((h + 30) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80))
                ];
                break;

            case 'triadic':
                combinations = [
                    baseColor,
                    this.hslToHex((h + 120) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80)),
                    this.hslToHex((h + 240) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80))
                ];
                break;

            case 'splitComplementary':
                combinations = [
                    baseColor,
                    this.hslToHex((h + 150) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80)),
                    this.hslToHex((h + 210) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80))
                ];
                break;

            case 'tetradic':
                combinations = [
                    baseColor,
                    this.hslToHex((h + 60) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80)),
                    this.hslToHex((h + 180) % 360, s, l),
                    this.hslToHex((h + 240) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80))
                ];
                break;

            case 'square':
                combinations = [
                    baseColor,
                    this.hslToHex((h + 90) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80)),
                    this.hslToHex((h + 180) % 360, s, l),
                    this.hslToHex((h + 270) % 360, this.clamp(s, 20, 100), this.clamp(l, 30, 80))
                ];
                break;

            case 'monochromatic':
                combinations = [
                    this.hslToHex(h, this.clamp(s + 20, 10, 100), this.clamp(l - 30, 10, 90)),
                    this.hslToHex(h, this.clamp(s + 10, 10, 100), this.clamp(l - 15, 10, 90)),
                    baseColor, // BASE COLOR IN CENTER
                    this.hslToHex(h, this.clamp(s - 10, 10, 100), this.clamp(l + 15, 10, 90)),
                    this.hslToHex(h, this.clamp(s - 20, 10, 100), this.clamp(l + 30, 10, 90))
                ];
                break;

            default:
                combinations = [baseColor];
        }

        return this.validateAndDeduplicateColors(combinations);
    }

    // Calculate color distance (0 = same color, higher = more different)
    colorDistance(color1, color2) {
        const [h1, s1, l1] = this.hexToHsl(color1);
        const [h2, s2, l2] = this.hexToHsl(color2);
        
        // Weighted distance calculation
        const hueDistance = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
        const satDistance = Math.abs(s1 - s2) / 100;
        const lightDistance = Math.abs(l1 - l2) / 100;
        
        // Hue is most important, then saturation, then lightness
        return (hueDistance * 0.6) + (satDistance * 0.3) + (lightDistance * 0.1);
    }

    // Get nearest paint brand codes for a color
    getNearestPaintBrandCodes(hexColor, limit = 8) {
        const allPaintColors = [];
        
        // Collect all paint colors from all brands
        const brands = [
            { name: 'Asian Paints', colors: window.asianPaintsColors },
            { name: 'Berger Paints', colors: window.bergerPaintsColors },
            { name: 'Opus Paints', colors: window.opusPaintsColors },
            { name: 'Dulux Paints', colors: window.duluxPaintsColors },
            { name: 'JSW Paints', colors: window.jswPaintsColors },
            { name: 'Nerolac Paints', colors: window.nerolacPaintsColors },
            { name: 'Nippon Paints', colors: window.nipponPaintsColors }
        ];
        
        brands.forEach(brand => {
            if (brand.colors) {
                Object.entries(brand.colors).forEach(([colorHex, colorName]) => {
                    allPaintColors.push({
                        brand: brand.name,
                        hex: colorHex.toUpperCase(),
                        name: colorName,
                        distance: this.colorDistance(hexColor, colorHex)
                    });
                });
            }
        });
        
        // Sort by distance and return top matches
        return allPaintColors
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
    }

    // Show paint brand codes popup with nearest colors
    showPaintCodesPopup(hexColor, event) {
        const nearestColors = this.getNearestPaintBrandCodes(hexColor, 8);
        
        // Remove existing popup if any
        const existingPopup = document.querySelector('.paint-codes-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup
        const popup = document.createElement('div');
        popup.className = 'paint-codes-popup';
        popup.innerHTML = `
            <div class="paint-codes-content">
                <div class="paint-codes-header">
                    <h4>Nearest Paint Colors</h4>
                    <span class="close-popup">&times;</span>
                </div>
                
                <div class="brand-codes-list">
                    ${nearestColors.length > 0 ? 
                        nearestColors.map((paintColor, index) => `
                            <div class="brand-code-item" data-color="${paintColor.hex}" data-brand="${paintColor.brand}" data-name="${paintColor.name}">
                                <div class="paint-color-info">
                                    <div class="paint-swatch" style="background-color: ${paintColor.hex}"></div>
                                    <div class="paint-details">
                                        <span class="brand-name">${paintColor.brand}</span>
                                        <span class="brand-code">${paintColor.name}</span>
                                        <span class="color-hex-small">${paintColor.hex}</span>
                                    </div>
                                </div>
                                <div class="similarity-indicator">
                                    <span class="similarity-score">${Math.round((1 - paintColor.distance) * 100)}% match</span>
                                    <div class="similarity-bar">
                                        <div class="similarity-fill" style="width: ${(1 - paintColor.distance) * 100}%"></div>
                                    </div>
                                </div>
                                <button class="select-paint-color" title="Select this paint color">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                                    </svg>
                                </button>
                            </div>
                        `).join('') : 
                        '<div class="no-codes">No paint colors found in database</div>'
                    }
                </div>
            </div>
        `;
        
        // Smart positioning logic
        const rect = event.target.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const popupWidth = 350;
        const popupHeight = 400; // Estimated height
        
        let left = rect.left - (popupWidth / 2) + (rect.width / 2);
        let top = rect.bottom + 5;
        
        // Check if popup would go off-screen bottom
        if (top + popupHeight > viewportHeight - 10) {
            // Position above the element instead
            top = rect.top - popupHeight - 5;
            popup.classList.add('bottom-up');
        }
        
        // Check if popup would go off-screen right
        if (left + popupWidth > viewportWidth - 10) {
            left = viewportWidth - popupWidth - 10;
            popup.classList.add('right-align');
        }
        
        // Check if popup would go off-screen left
        if (left < 10) {
            left = 10;
            popup.classList.add('left-align');
        }
        
        // Ensure popup stays within the tools section area
        const toolsSection = document.querySelector('.tools-section');
        if (toolsSection) {
            const toolsRect = toolsSection.getBoundingClientRect();
            
            // If popup would go outside tools section horizontally, align to tools section
            if (left < toolsRect.left) {
                left = toolsRect.left + 10;
            }
            if (left + popupWidth > toolsRect.right) {
                left = toolsRect.right - popupWidth - 10;
            }
        }
        
        popup.style.position = 'fixed';
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
        popup.style.zIndex = '10000';
        
        document.body.appendChild(popup);
        
        // Add event listeners for selecting paint colors
        const selectButtons = popup.querySelectorAll('.select-paint-color');
        selectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const brandItem = e.target.closest('.brand-code-item');
                const colorHex = brandItem.getAttribute('data-color');
                const brandName = brandItem.getAttribute('data-brand');
                const colorName = brandItem.getAttribute('data-name');
                
                // Set the selected paint color as brush color
                this.setColorAsBrush(colorHex);
                
                // Show feedback
                this.showFeedback(`Selected: ${brandName} - ${colorName}`);
                
                // Close popup
                popup.remove();
            });
        });
        
        // Also make the entire brand item clickable
        const brandItems = popup.querySelectorAll('.brand-code-item');
        brandItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.select-paint-color')) {
                    const colorHex = item.getAttribute('data-color');
                    const brandName = item.getAttribute('data-brand');
                    const colorName = item.getAttribute('data-name');
                    
                    this.setColorAsBrush(colorHex);
                    this.showFeedback(`Selected: ${brandName} - ${colorName}`);
                    popup.remove();
                }
            });
        });
        
        // Close popup when clicking close button
        const closeBtn = popup.querySelector('.close-popup');
        closeBtn.addEventListener('click', () => {
            popup.remove();
        });
        
        // Close popup when clicking outside
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
        
        // Close popup on escape key
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                popup.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
    }

    // Initialize color combinations in the tools section
    initColorCombinations() {
        if (this.initialized) {
            return;
        }
        
        const combinationsContainer = document.getElementById('colorCombinationsContainer');
        
        if (!combinationsContainer) {
            console.error('Color combinations container not found');
            return;
        }
        
        if (document.getElementById('combinationType')) {
            return;
        }

        // Create color combinations content
        combinationsContainer.innerHTML = `
            <h3 class="section-subtitle">Color Combinations</h3>
            <div class="combination-controls">
                <select id="combinationType" class="combination-select">
                    ${Object.entries(this.combinationTypes).map(([key, value]) => 
                        `<option value="${key}">${value}</option>`
                    ).join('')}
                </select>
                <button id="generateCombinations" class="btn btn-primary">Generate</button>
                <button id="autoSuggest" class="btn btn-secondary" title="Auto-suggest based on current color">Auto</button>
                <label class="auto-update-toggle">
                    <input type="checkbox" id="autoUpdateToggle" checked> Auto-update
                </label>
            </div>
            <div class="current-color-display">
                <span>Base Color: </span>
                <div class="current-color-preview" id="currentColorPreview"></div>
                <span id="currentColorHex">#3498DB</span>
            </div>
            <div class="combination-palette" id="combinationPalette">
                <div class="combination-placeholder">Color combinations will update automatically</div>
            </div>
        `;

        // Add CSS for popup if not already added
        this.addPopupStyles();

        // Add event listeners
        this.setupEventListeners();
        this.initialized = true;
        
        // Initialize with current color
        this.syncWithCurrentColor();
    }

    // Add CSS styles for the popup
    addPopupStyles() {
        if (document.getElementById('paint-codes-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'paint-codes-styles';
        styles.textContent = `
            .paint-codes-popup {
                position: fixed;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border: 1px solid #e0e0e0;
                min-width: 320px;
                max-width: 400px;
                z-index: 10000;
                animation: popupFadeIn 0.2s ease-out;
                max-height: 80vh;
                overflow: hidden;
            }
            
            @keyframes popupFadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .paint-codes-content {
                padding: 0;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .paint-codes-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid #e0e0e0;
                background: #f8f9fa;
                border-radius: 8px 8px 0 0;
            }
            
            .paint-codes-header h4 {
                margin: 0;
                font-size: 0.9rem;
                color: #2c3e50;
                font-weight: 600;
            }
            
            .close-popup {
                cursor: pointer;
                font-size: 1.2rem;
                color: #7f8c8d;
                background: none;
                border: none;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 3px;
            }
            
            .close-popup:hover {
                background: #e74c3c;
                color: white;
            }
            
            .color-preview {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid #f0f0f0;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .color-swatch {
                width: 20px;
                height: 20px;
                border-radius: 4px;
                border: 1px solid #ddd;
            }
            
            .color-hex {
                font-family: monospace;
                font-weight: bold;
                color: #2c3e50;
                font-size: 0.9rem;
            }
            
            .similarity-note {
                font-size: 0.7rem;
                color: #7f8c8d;
                font-style: italic;
                margin-left: auto;
            }
            
            .brand-codes-list {
                padding: 8px 0;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .brand-code-item {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                border-bottom: 1px solid #f8f9fa;
                cursor: pointer;
                transition: background-color 0.2s ease;
                gap: 10px;
            }
            
            .brand-code-item:hover {
                background-color: #f8f9fa;
            }
            
            .brand-code-item:last-child {
                border-bottom: none;
            }
            
            .paint-color-info {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .paint-swatch {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                border: 1px solid #ddd;
                flex-shrink: 0;
            }
            
            .paint-details {
                display: flex;
                flex-direction: column;
                gap: 2px;
                flex: 1;
            }
            
            .brand-name {
                font-weight: 600;
                color: #34495e;
                font-size: 0.8rem;
            }
            
            .brand-code {
                font-family: monospace;
                color: #7f8c8d;
                font-size: 0.75rem;
            }
            
            .color-hex-small {
                font-family: monospace;
                color: #95a5a6;
                font-size: 0.7rem;
            }
            
            .similarity-indicator {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 4px;
                min-width: 80px;
            }
            
            .similarity-score {
                font-size: 0.7rem;
                color: #27ae60;
                font-weight: 600;
            }
            
            .similarity-bar {
                width: 60px;
                height: 4px;
                background: #ecf0f1;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .similarity-fill {
                height: 100%;
                background: #27ae60;
                border-radius: 2px;
                transition: width 0.3s ease;
            }
            
            .select-paint-color {
                background: #3498db;
                border: none;
                border-radius: 4px;
                color: white;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                flex-shrink: 0;
                transition: background-color 0.2s ease;
            }
            
            .select-paint-color:hover {
                background: #2980b9;
            }
            
            .select-paint-color svg {
                width: 14px;
                height: 14px;
            }
            
            .no-codes {
                text-align: center;
                color: #95a5a6;
                font-style: italic;
                padding: 20px 0;
                font-size: 0.8rem;
            }
            
            .code-label {
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                background: #3498db;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 0.6rem;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s ease;
                border: none;
                font-family: inherit;
            }
            
            .code-label:hover {
                background: #2980b9;
                transform: translateX(-50%) scale(1.05);
            }

            .combination-color-wrapper {
                position: relative;
                display: inline-block;
                margin: 0 8px 25px 8px;
            }

            .combination-color {
                width: 50px;
                height: 50px;
                border-radius: 6px;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            }

            .combination-color:hover {
                transform: scale(1.1);
                border-color: #2c3e50;
                z-index: 2;
            }

            .combination-color-label {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0,0,0,0.7);
                color: white;
                font-size: 0.6rem;
                padding: 2px;
                text-align: center;
                transform: translateY(100%);
                transition: transform 0.2s ease;
                font-family: monospace;
            }

            .combination-color:hover .combination-color-label {
                transform: translateY(0);
            }

            .base-color-indicator {
                position: absolute;
                top: 2px;
                right: 2px;
                background: #3498db;
                color: white;
                font-size: 0.5rem;
                padding: 1px 3px;
                border-radius: 3px;
                font-weight: bold;
            }

            .base-color-indicator.center-indicator {
                background: #e74c3c;
            }

            .base-color-indicator.first-indicator {
                background: #2ecc71;
            }

            .combination-placeholder {
                text-align: center;
                color: #6c757d;
                font-style: italic;
                padding: 20px;
                width: 100%;
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Sync with the current brush color
    syncWithCurrentColor() {
        const customColorPicker = document.getElementById('customColorPicker');
        if (customColorPicker && customColorPicker.value) {
            this.currentBaseColor = customColorPicker.value.toUpperCase();
        }
        else if (window.currentColor) {
            this.currentBaseColor = window.currentColor;
        }
        
        this.updateCurrentColorDisplay();
        this.generateAndDisplayCombinations();
    }

    // Setup event listeners for color combinations
    setupEventListeners() {
        const generateBtn = document.getElementById('generateCombinations');
        const autoSuggestBtn = document.getElementById('autoSuggest');
        const combinationType = document.getElementById('combinationType');
        const autoUpdateToggle = document.getElementById('autoUpdateToggle');

        generateBtn.addEventListener('click', () => {
            this.generateAndDisplayCombinations();
        });

        autoSuggestBtn.addEventListener('click', () => {
            this.autoSuggestCombination();
        });

        combinationType.addEventListener('change', () => {
            if (this.autoUpdateEnabled) {
                this.generateAndDisplayCombinations();
            }
        });

        autoUpdateToggle.addEventListener('change', (e) => {
            this.autoUpdateEnabled = e.target.checked;
        });

        this.setupColorMonitoring();
    }

    // Setup monitoring for all color sources
    setupColorMonitoring() {
        this.monitorCustomColorPicker();
        this.monitorColorPalette();
        this.monitorPaintBrandColors();
        this.monitorGlobalColor();
    }

    // Monitor custom color picker - FIXED: Only update base color from allowed sources
    monitorCustomColorPicker() {
        const customColorPicker = document.getElementById('customColorPicker');
        
        if (!customColorPicker) {
            setTimeout(() => this.monitorCustomColorPicker(), 500);
            return;
        }

        customColorPicker.removeEventListener('input', this.handleCustomColorChange);
        customColorPicker.removeEventListener('change', this.handleCustomColorChange);

        this.handleCustomColorChange = (e) => {
            if (this.autoUpdateEnabled && !this.isUpdatingFromCombination) {
                // This is an allowed source for base color change
                this.updateBaseColorFromAllowedSources(e.target.value);
                this.updateBrushColor(this.currentBaseColor);
            }
        };

        customColorPicker.addEventListener('input', this.handleCustomColorChange);
        customColorPicker.addEventListener('change', this.handleCustomColorChange);
    }

    // Monitor color palette (predefined colors) - FIXED: Only update base color from allowed sources
    monitorColorPalette() {
        const colorPalette = document.getElementById('colorPalette');
        if (!colorPalette) {
            setTimeout(() => this.monitorColorPalette(), 500);
            return;
        }

        colorPalette.addEventListener('click', (e) => {
            const colorOption = e.target.closest('.color-option');
            if (colorOption && colorOption.dataset.color) {
                if (this.autoUpdateEnabled && !this.isUpdatingFromCombination) {
                    // This is an allowed source for base color change
                    this.updateBaseColorFromAllowedSources(colorOption.dataset.color);
                    this.updateCustomColorPicker(this.currentBaseColor);
                    this.updateBrushColor(this.currentBaseColor);
                }
            }
        });
    }

    // Monitor paint brand colors from search results - FIXED: Only update base color from allowed sources
    monitorPaintBrandColors() {
        const colorSearchResults = document.getElementById('colorSearchResults');
        if (colorSearchResults) {
            colorSearchResults.addEventListener('click', (e) => {
                const searchResult = e.target.closest('.color-search-result');
                if (searchResult) {
                    const colorPreview = searchResult.querySelector('.color-preview');
                    if (colorPreview && colorPreview.style.backgroundColor) {
                        const rgbColor = colorPreview.style.backgroundColor;
                        const hexColor = this.rgbToHex(rgbColor);
                        
                        if (hexColor && this.autoUpdateEnabled && !this.isUpdatingFromCombination) {
                            // This is an allowed source for base color change
                            this.updateBaseColorFromAllowedSources(hexColor);
                            this.updateCustomColorPicker(this.currentBaseColor);
                            this.updateBrushColor(this.currentBaseColor);
                        }
                    }
                }
            });
        }
    }

    // Convert RGB to HEX
    rgbToHex(rgb) {
        if (!rgb) return null;
        
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }
        return null;
    }

    // Monitor global currentColor variable - FIXED: Don't update base color from global changes
    monitorGlobalColor() {
        if (!window.currentColor) return;

        let lastColor = window.currentColor;
        
        const checkColorChange = () => {
            if (window.currentColor && window.currentColor !== lastColor && this.autoUpdateEnabled && !this.isUpdatingFromCombination) {
                // Only sync if the change came from an allowed source (detected by other monitors)
                // Don't automatically update base color from global changes
                lastColor = window.currentColor;
            }
            setTimeout(checkColorChange, 200);
        };
        
        checkColorChange();
    }

    // Update custom color picker
    updateCustomColorPicker(color) {
        const customColorPicker = document.getElementById('customColorPicker');
        if (customColorPicker && customColorPicker.value !== color.toLowerCase()) {
            customColorPicker.value = color.toLowerCase();
        }
    }

    // Update brush color in main application - FIXED: Don't change base color
    updateBrushColor(color) {
        // Update global currentColor
        window.currentColor = color;
        
        // Update custom color picker (display only)
        const customColorPicker = document.getElementById('customColorPicker');
        if (customColorPicker) {
            customColorPicker.value = color.toLowerCase();
        }
        
        // Call main app's setCurrentColor function if it exists
        if (typeof window.setCurrentColor === 'function') {
            window.setCurrentColor(color);
        }
        
        // Update color palette active state
        this.updateColorPaletteActiveState(color);
        
        // Update project settings if they exist
        if (window.currentProject && window.currentProject.settings) {
            window.currentProject.settings.currentColor = color;
        }
        
        // Update canvas context directly if available
        this.updateCanvasContextColor(color);
        
        console.log('Brush color updated to:', color);
    }

    // Update color palette active state
    updateColorPaletteActiveState(color) {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.color && option.dataset.color.toUpperCase() === color.toUpperCase()) {
                option.classList.add('active');
            }
        });
    }

    // Update canvas context color directly
    updateCanvasContextColor(color) {
        // If the main app uses a global ctx object, update its stroke/fill style
        if (window.ctx) {
            const rgb = this.hexToRgb(color);
            if (rgb) {
                const opacity = window.currentOpacity || 0.8;
                const rgba = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
                window.ctx.strokeStyle = rgba;
                window.ctx.fillStyle = rgba;
            }
        }
    }

    // Convert HEX to RGB for canvas context
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return [r, g, b];
    }

    // Force color update in the main application - FIXED: Don't change base color
    forceColorUpdateInMainApp(color) {
        // Method 1: Update global currentColor variable for painting
        window.currentColor = color;
        
        // Method 2: Update custom color picker for display only (don't trigger base color change)
        const customColorPicker = document.getElementById('customColorPicker');
        if (customColorPicker) {
            customColorPicker.value = color.toLowerCase();
        }
        
        // Method 3: Update color palette active state
        this.updateColorPaletteActiveState(color);
        
        // Method 4: If main app has a setCurrentColor function, call it for painting only
        if (typeof window.setCurrentColor === 'function') {
            window.setCurrentColor(color);
        }
        
        // Method 5: Direct canvas context update
        this.updateCanvasContextColor(color);
    }

    // NEW: Update base color only from allowed sources (palette, search, custom picker)
    updateBaseColorFromAllowedSources(color) {
        this.currentBaseColor = color.toUpperCase();
        this.updateCurrentColorDisplay();
        this.generateAndDisplayCombinations();
    }

    // Update current color display
    updateCurrentColorDisplay() {
        const preview = document.getElementById('currentColorPreview');
        const hexDisplay = document.getElementById('currentColorHex');
        
        if (preview) {
            preview.style.backgroundColor = this.currentBaseColor;
        }
        if (hexDisplay) {
            hexDisplay.textContent = this.currentBaseColor;
        }
    }

    // Generate and display combinations
    generateAndDisplayCombinations() {
        const combinationType = document.getElementById('combinationType');
        const combinationPalette = document.getElementById('combinationPalette');
        
        if (!combinationType || !combinationPalette) {
            return;
        }

        const type = combinationType.value;
        const combinations = this.generateCombinations(this.currentBaseColor, type);
        
        this.displayCombinations(combinations, combinationPalette, type);
    }

    // Auto-suggest combination type
    autoSuggestCombination() {
        const suggestedType = this.suggestBestCombination(this.currentBaseColor);
        const combinationType = document.getElementById('combinationType');
        
        if (combinationType) {
            combinationType.value = suggestedType;
            this.generateAndDisplayCombinations();
            this.showFeedback(`Suggested: ${this.combinationTypes[suggestedType]}`);
        }
    }

    // Show feedback message
    showFeedback(message) {
        const existingFeedback = document.querySelector('.combination-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const feedback = document.createElement('div');
        feedback.className = 'combination-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: absolute;
            background: #2c3e50;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            z-index: 1000;
            margin-top: 5px;
        `;

        const autoBtn = document.getElementById('autoSuggest');
        if (autoBtn) {
            autoBtn.parentNode.appendChild(feedback);
            
            setTimeout(() => {
                feedback.remove();
            }, 2000);
        }
    }

    // Display color combinations in the palette with CODE labels - FIXED: Don't change base color when clicking
    displayCombinations(combinations, container, type) {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (combinations.length === 0) {
            container.innerHTML = '<div class="combination-placeholder">No colors generated</div>';
            return;
        }
        
        combinations.forEach((color, index) => {
            const colorWrapper = document.createElement('div');
            colorWrapper.className = 'combination-color-wrapper';
            colorWrapper.style.position = 'relative';
            colorWrapper.style.display = 'inline-block';
            colorWrapper.style.margin = '0 8px 25px 8px';
            
            const colorElement = document.createElement('div');
            colorElement.className = 'combination-color';
            colorElement.style.backgroundColor = color;
            colorElement.setAttribute('data-color', color);
            
            // Set different titles based on position and type
            if (type === 'analogous' || type === 'monochromatic') {
                if (index === 2) { // Center position for 5-color schemes
                    colorElement.title = `${color}\nBase Color (Center)`;
                    colorElement.classList.add('base-color-center');
                } else if (index < 2) {
                    colorElement.title = `${color}\nLeft Color ${index + 1}`;
                } else {
                    colorElement.title = `${color}\nRight Color ${index - 1}`;
                }
            } else {
                if (index === 0) {
                    colorElement.title = `${color}\nBase Color`;
                    colorElement.classList.add('base-color-first');
                } else {
                    colorElement.title = `${color}\nComplementary Color ${index}`;
                }
            }
            
            // FIXED: Only set as brush color, don't update base color
            colorElement.addEventListener('click', () => {
                this.setColorAsBrush(color);
            });
            
            const colorLabel = document.createElement('div');
            colorLabel.className = 'combination-color-label';
            colorLabel.textContent = color;
            colorElement.appendChild(colorLabel);
            
            // Add CODE label below the color
            const codeLabel = document.createElement('button');
            codeLabel.className = 'code-label';
            codeLabel.textContent = 'CODE';
            codeLabel.title = 'Click to view nearest paint colors';
            codeLabel.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent color selection when clicking CODE
                this.showPaintCodesPopup(color, e);
            });
            
            // Add position indicators for better UX
            if ((type === 'analogous' || type === 'monochromatic') && index === 2) {
                const baseIndicator = document.createElement('div');
                baseIndicator.className = 'base-color-indicator center-indicator';
                baseIndicator.textContent = 'Base';
                baseIndicator.title = 'Your selected base color';
                colorElement.appendChild(baseIndicator);
            } else if (index === 0 && (type === 'complementary' || type === 'triadic' || type === 'splitComplementary' || type === 'tetradic' || type === 'square')) {
                const baseIndicator = document.createElement('div');
                baseIndicator.className = 'base-color-indicator first-indicator';
                baseIndicator.textContent = 'Base';
                baseIndicator.title = 'Your selected base color';
                colorElement.appendChild(baseIndicator);
            }
            
            colorWrapper.appendChild(colorElement);
            colorWrapper.appendChild(codeLabel);
            container.appendChild(colorWrapper);
        });
    }

    // Set color as brush color - FIXED: Don't change base color when clicking combination colors
    setColorAsBrush(color) {
        this.isUpdatingFromCombination = true;
        
        console.log('Setting brush color to:', color);
        
        // Use the comprehensive update method but DON'T update base color
        this.forceColorUpdateInMainApp(color);
        
        this.showFeedback(`Brush color set to: ${color}`);
        
        setTimeout(() => {
            this.isUpdatingFromCombination = false;
        }, 100);
    }

    // Analyze color and suggest best combination type
    suggestBestCombination(hexColor) {
        const [h, s, l] = this.hexToHsl(hexColor);
        
        if (s < 20) {
            return 'monochromatic';
        } else if (s > 70 && l > 60) {
            return Math.random() > 0.5 ? 'complementary' : 'triadic';
        } else if (l < 30) {
            return 'analogous';
        } else if (l > 70) {
            return 'splitComplementary';
        } else {
            const types = ['analogous', 'triadic', 'splitComplementary', 'tetradic'];
            return types[Math.floor(Math.random() * types.length)];
        }
    }
}

// Global instance
let colorCombinationsInstance = null;

// Initialize color combinations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    colorCombinationsInstance = new ColorCombinations();
    
    const initInterval = setInterval(() => {
        const combinationsContainer = document.getElementById('colorCombinationsContainer');
        
        if (combinationsContainer) {
            colorCombinationsInstance.initColorCombinations();
            clearInterval(initInterval);
        }
    }, 100);
    
    setTimeout(() => {
        clearInterval(initInterval);
        if (colorCombinationsInstance && !colorCombinationsInstance.initialized) {
            colorCombinationsInstance.initColorCombinations();
        }
    }, 5000);
});

// Make it available globally
window.ColorCombinations = ColorCombinations;
window.colorCombinationsInstance = colorCombinationsInstance;