document.addEventListener('DOMContentLoaded', function() {
            // FIXED: Improved dropdown behavior
            const dropdowns = document.querySelectorAll('.brush-dropdown');
            
            dropdowns.forEach(dropdown => {
    const dropdownContent = dropdown.querySelector('.brush-dropdown-content');
    const toolBtn = dropdown.querySelector('.tool-btn');
    
    // Show dropdown on click for mobile, hover for desktop
    toolBtn.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            // Mobile: Toggle dropdown on click
            e.stopPropagation();
            const isVisible = dropdownContent.style.display === 'block';
            
            // Close all other dropdowns first
            document.querySelectorAll('.brush-dropdown-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Toggle current dropdown
            dropdownContent.style.display = isVisible ? 'none' : 'block';
            
            // Position dropdown near the parent button for mobile
            if (!isVisible) {
                const rect = toolBtn.getBoundingClientRect();
                dropdownContent.style.position = 'fixed';
                dropdownContent.style.left = rect.left + 'px';
                dropdownContent.style.top = (rect.bottom + 5) + 'px';
            }
        }
    });
    
    // Desktop hover behavior
    dropdown.addEventListener('mouseenter', function() {
        if (window.innerWidth > 768) {
            dropdownContent.style.display = 'block';
            dropdownContent.style.position = 'absolute';
            dropdownContent.style.left = '0';
            dropdownContent.style.top = '45px';
        }
    });
    
    dropdown.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            dropdownContent.style.display = 'none';
        }
    });
    
    // Keep dropdown open when hovering over content (desktop)
    dropdownContent.addEventListener('mouseenter', function() {
        if (window.innerWidth > 768) {
            dropdownContent.style.display = 'block';
        }
    });
    
    dropdownContent.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            dropdownContent.style.display = 'none';
        }
    });
});

            // The rest of your JavaScript code remains the same
            // DOM Elements
            const fileInput = document.getElementById('fileInput');
            const houseCanvas = document.getElementById('houseCanvas');
            const tempCanvas = document.getElementById('tempCanvas');
            const canvasContainer = document.getElementById('canvasContainer');
            const ctx = houseCanvas.getContext('2d');
            const tempCtx = tempCanvas.getContext('2d');
            const colorPalette = document.getElementById('colorPalette');
            const customColorPicker = document.getElementById('customColorPicker');
            const opacitySlider = document.getElementById('opacity');
            const opacityValue = document.getElementById('opacityValue');
            const brushSize = document.getElementById('brushSize');
            const brushSizeValue = document.getElementById('brushSizeValue');
            const tolerance = document.getElementById('tolerance');
            const toleranceValue = document.getElementById('toleranceValue');
            const toleranceSection = document.getElementById('toleranceSection');
            const selectionInfo = document.getElementById('selectionInfo');
            const saveProjectBtn = document.getElementById('saveProjectBtn');
            const loadProjectBtn = document.getElementById('loadProjectBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            
            // Color search elements
            const colorSearchInput = document.getElementById('colorSearchInput');
            const colorSearchResults = document.getElementById('colorSearchResults');
            
            // Zoom elements
            const zoomInBtn = document.getElementById('zoomInBtn');
            const zoomOutBtn = document.getElementById('zoomOutBtn');
            const resetZoomBtn = document.getElementById('resetZoomBtn');
            const zoomLevel = document.getElementById('zoomLevel');
            
            // Toolbar buttons
            const brushTool = document.getElementById('brushTool');
            const eraserTool = document.getElementById('eraserTool');
            const autoSelectTool = document.getElementById('autoSelectTool');
            const lassoTool = document.getElementById('lassoTool');
            const moveTool = document.getElementById('moveTool');
            const undoBtn = document.getElementById('undoBtn');
            const redoBtn = document.getElementById('redoBtn');
            const resetBtn = document.getElementById('resetBtn');
            const uploadImageBtn = document.getElementById('uploadImageBtn');
            
            // Toolbar element
            const toolbar = document.getElementById('mainToolbar');
            
            // Modals
            const uploadModal = document.getElementById('uploadModal');
            const closeUploadModal = document.getElementById('closeUploadModal');
            const uploadFromComputer = document.getElementById('uploadFromComputer');
            const useSample1 = document.getElementById('useSample1');
            const useSample2 = document.getElementById('useSample2');
            
            // Application State
            let currentColor = '#3498db';
            let currentOpacity = 0.8; // 80% default
            let currentShape = 'circle';
            let currentEraser = 'circle';
            let isPainting = false;
            let currentTool = 'brush'; // 'brush', 'autoSelect', 'lasso', 'eraser'
            let originalImage = null;
            let originalImageData = null;
            let history = [];
            let historyIndex = -1;
            let maxHistorySize = 50;
            
            // Zoom and pan state
            let scale = 1;
            let panning = false;
            let startX, startY;
            let offsetX = 0, offsetY = 0;
            let moveMode = false; // Toggle for move mode
            
            // Touch gesture state
            let lastTouchDistance = null;
            let initialTouches = [];
            let isPinching = false;
            let isTwoFingerMoving = false;
            let lastTwoFingerX = 0;
            let lastTwoFingerY = 0;
            
            // Project state
            let currentProject = {
                name: 'Untitled',
                createdAt: new Date(),
                lastSaved: null,
                originalImage: null,
                history: [],
                settings: {
                    currentColor: '#3498db',
                    currentOpacity: 0.8,
                    currentShape: 'circle',
                    brushSize: 20,
                    tolerance: 30
                }
            };
            
            // Lasso tool state
            let isLassoActive = false;
            let lassoPoints = [];
            let isDrawingLasso = false;
            
            // Enhanced Auto-Select state
            let selectedPixels = new Set();
            let isDragging = false;
            let dragPath = [];
            let dragMode = 'add'; // 'add' or 'remove'
            
            // Applied colors tracking
            let appliedColors = new Set();
            
            // Touch state for preventing scroll
            let isTouchPainting = false;
            let touchStartX, touchStartY;
            
            // Paint brand colors
            const asianPaintsColors = {
                '#EBC0DE': 'AP 9425 OUTDOOR PINK',
                '#ECBED9': 'AP 9417 ROSE ESSENCE',
                '#EEE0E3': 'AP 8172 ROSY VIEW',
                '#EDE2E4': 'AP 7115 PURPLE DYE',
                '#F5C4B1': 'AP 4068 PINK GUAVA',
                '#F1B097': 'AP 4069 PETITE PEACH',
                '#E3D11E': 'AP 2048 BRIGHT LIME',
                '#F4D303': 'AP 2049 SHOCKING YELLOW',
                '#F3C02B': 'AP 2050 JESTER YELLOW'
            };

            const bergerPaintsColors = {
                '#BAC9E4': '5T2907 NYLON BLUE',
                '#5BAFE0': '5T2904 Jet Ski Blue',
                '#946F45': '3A0248 Brownish',
                '#E0AD4F': '3A0244 Golden Tower',
                '#F7EBDC': '23YY 86/081',
                '#EDE1D0': '25YY 77/087',
                '#3F3E3E': '60RR 07/002',
                '#CBCCCB': '88BG 62/005'
            };

            const opusPaintsColors = {
                '#C4C8E0': 'Opus Paint BB 5000 Into the light',
                '#ACB8E3': 'Opus Paint BB 5001 Little Lilac',
                '#FEBF25': 'Opus Paint YY 1802 Aam Ras',
                '#E0AE43': 'Opus Paint YY 1803 English Mustard',
                '#FFD959': 'Opus Paint 5011 Surprise Surprise',
                '#FFD735': 'Opus Paint 5012 Sunshiny Day',
                '#5C6B51': 'Opus Paint 4397 Green Earth',
                '#44533D': 'Opus Paint 4398 Black Pool'
            };

            const duluxPaintsColors = {
                '#F7EBDC': '23YY 86/081',
                '#EDE1D0': '25YY 77/087',
                '#3F3E3E': '60RR 07/002',
                '#CBCCCB': '88BG 62/005',
                '#E9CBA2': 'YO 1255 Sunstraw',
                '#FDE0B0': 'YO 1256 Palest Glow',
                '#F5EDCA': 'SUNNY LEMON 2001',
                '#F6EAAE': 'BANANA CREAM 2010'
            };

            const jswPaintsColors = {
                '#FFD959': 'Surprise Surprise(5011)',
                '#FFD735': 'Sunshiny Day(5012)',
                '#5C6B51': 'Green Earth(4397)',
                '#44533D': 'Black Pool(4398)',
                '#D79380': 'PANAMA ROSE 2130',
                '#F5C4B1': 'PINK GUAVA 4068',
                '#F1B097': 'PETITE PEACH 4069'
            };

            const nerolacPaintsColors = {
                '#F5EDCA': 'Nerolac SUNNY LEMON 2001',
                '#F6EAAE': 'Nerolac BANANA CREAM 2010',
                '#D79380': 'Nerolac PANAMA ROSE 2130',
                '#F5C4B1': 'Nerolac PINK GUAVA 4068',
                '#F1B097': 'Nerolac PETITE PEACH 4069',
                '#E3D11E': 'Nerolac BRIGHT LIME 2048',
                '#F4D303': 'Nerolac SHOCKING YELLOW 2049'
            };

            const nipponPaintsColors = {
                '#E3D11E': 'NP AC 2048 A Bright Lime Accents',
                '#F4D303': 'NP AC 2049 A Shocking Yellow Accents',
                '#F3C02B': 'NP AC 2050 A Jester Yellow Accents',
                '#E9CBA2': 'NP YO 1255 P Sunstraw',
                '#FDE0B0': 'NP YO 1256 P Palest Glow',
                '#BAC9E4': 'NP 5T2907 Nylon Blue',
                '#5BAFE0': 'NP 5T2904 Jet Ski Blue'
            };

            // Combine all colors into one searchable object
            const allColors = {
                ...asianPaintsColors,
                ...bergerPaintsColors,
                ...opusPaintsColors,
                ...duluxPaintsColors,
                ...jswPaintsColors,
                ...nerolacPaintsColors,
                ...nipponPaintsColors
            };
            
            // Predefined color palette (for quick access)
            const colors = [
                '#ffffff', '#f1f1f1', '#e0e0e0', '#bdbdbd', '#9e9e9e', // Grays
                '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', // Reds/Purples/Blues
                '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', // Blues/Teals/Greens
                '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', // Yellows/Oranges
                '#ff5722', '#795548', '#607d8b' // Oranges/Browns
            ];
            
            // Initialize the application
            function init() {
                // Set up color palette
                colors.forEach(color => {
                    const colorOption = document.createElement('div');
                    colorOption.className = 'color-option';
                    colorOption.style.backgroundColor = color;
                    colorOption.dataset.color = color;
                    colorOption.addEventListener('click', function() {
                        setCurrentColor(color);
                    });
                    colorPalette.appendChild(colorOption);
                });
                
                // Set initial active color
                setCurrentColor(currentColor);
                
                // Set up event listeners
                customColorPicker.addEventListener('input', function() {
                    setCurrentColor(this.value);
                });
                
                opacitySlider.addEventListener('input', function() {
                    currentOpacity = parseInt(this.value) / 100;
                    opacityValue.textContent = this.value;
                    currentProject.settings.currentOpacity = currentOpacity;
                });
                
                brushSize.addEventListener('input', function() {
                    brushSizeValue.textContent = this.value;
                    currentProject.settings.brushSize = parseInt(this.value);
                });
                
                tolerance.addEventListener('input', function() {
                    toleranceValue.textContent = this.value;
                    currentProject.settings.tolerance = parseInt(this.value);
                });
                
                // Color search functionality
                colorSearchInput.addEventListener('input', handleColorSearch);
                colorSearchInput.addEventListener('focus', handleColorSearch);
                
                // Close search results when clicking outside
                document.addEventListener('click', function(e) {
                    if (!colorSearchInput.contains(e.target) && !colorSearchResults.contains(e.target)) {
                        colorSearchResults.style.display = 'none';
                    }
                });
                
                // Brush dropdown options
                document.querySelectorAll('.brush-option').forEach(option => {
                    option.addEventListener('click', function() {
                        document.querySelectorAll('.brush-option').forEach(opt => {
                            opt.classList.remove('active');
                        });
                        this.classList.add('active');
                        currentShape = this.dataset.shape;
                        currentProject.settings.currentShape = currentShape;
                        // Disable move mode when selecting brush shape
                        disableMoveMode();
                    });
                });
                
                // Eraser dropdown options
                document.querySelectorAll('.brush-option[data-eraser]').forEach(option => {
                    option.addEventListener('click', function() {
                        document.querySelectorAll('.brush-option[data-eraser]').forEach(opt => {
                            opt.classList.remove('active');
                        });
                        this.classList.add('active');
                        currentEraser = this.dataset.eraser;
                    });
                });
                
                // Tool buttons
                brushTool.addEventListener('click', function() {
                    setCurrentTool('brush');
                    disableMoveMode();
                });
                
                eraserTool.addEventListener('click', function() {
                    setCurrentTool('eraser');
                    disableMoveMode();
                });
                
                autoSelectTool.addEventListener('click', function() {
                    setCurrentTool('autoSelect');
                    disableMoveMode();
                });
                
                lassoTool.addEventListener('click', function() {
                    setCurrentTool('lasso');
                    disableMoveMode();
                });
                
                // Move tool button
                moveTool.addEventListener('click', function() {
                    toggleMoveMode();
                });
                
                // Upload image button
                uploadImageBtn.addEventListener('click', function() {
                    uploadModal.style.display = 'flex';
                });
                
                // Action buttons
                undoBtn.addEventListener('click', undoAction);
                redoBtn.addEventListener('click', redoAction);
                resetBtn.addEventListener('click', resetCanvas);
                downloadBtn.addEventListener('click', downloadImage);
                
                // Project buttons
                saveProjectBtn.addEventListener('click', saveProject);
                loadProjectBtn.addEventListener('click', loadProject);
                
                // Zoom controls
                zoomInBtn.addEventListener('click', zoomIn);
                zoomOutBtn.addEventListener('click', zoomOut);
                resetZoomBtn.addEventListener('click', resetZoom);
                
                // Canvas painting events
                houseCanvas.addEventListener('mousedown', startPainting);
                houseCanvas.addEventListener('mousemove', paint);
                houseCanvas.addEventListener('mouseup', stopPainting);
                houseCanvas.addEventListener('mouseleave', stopPainting);
                houseCanvas.addEventListener('click', handleCanvasClick);
                houseCanvas.addEventListener('dblclick', handleCanvasDoubleClick);
                
                // Touch events for mobile painting and gestures
                houseCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
                houseCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
                houseCanvas.addEventListener('touchend', handleTouchEnd);
                
                // Enhanced Auto-Select events
                houseCanvas.addEventListener('mousedown', startDragSelection);
                houseCanvas.addEventListener('mousemove', dragSelection);
                houseCanvas.addEventListener('mouseup', stopDragSelection);
                
                // Panning events (only when move mode is active)
                canvasContainer.addEventListener('mousedown', startPanning);
                canvasContainer.addEventListener('mousemove', doPanning);
                canvasContainer.addEventListener('mouseup', stopPanning);
                canvasContainer.addEventListener('mouseleave', stopPanning);
                
                // Upload events
                uploadFromComputer.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', handleFileSelect);
                useSample1.addEventListener('click', () => loadSampleImage('sample1'));
                useSample2.addEventListener('click', () => loadSampleImage('sample2'));
                
                
                // Add this event listener for closing the upload modal
                closeUploadModal.addEventListener('click', function() {
                    uploadModal.style.display = 'none';
                });
                
                // Close modals when clicking outside
                window.addEventListener('click', (e) => {
                if (e.target === uploadModal) {
                    uploadModal.style.display = 'none';
                }
                });
                
                // Set initial canvas size
                resizeCanvas();
                window.addEventListener('resize', () => {
                    resizeCanvas();
                    alignTempCanvas();
                });
                
                // Load a sample image by default
                loadSampleImage('sample1');
                
                // Hide tolerance control initially
                toleranceSection.style.display = 'none';
                selectionInfo.style.display = 'none';
                
                // Update zoom display
                updateZoomDisplay();
                
                // Hide scroll hint after user interacts with toolbar
                toolbar.addEventListener('scroll', function() {
                    this.classList.add('scrolled');
                });
            }
            
            // Touch event handlers for mobile
            function handleTouchStart(e) {
                // Handle pinch and two-finger gestures
                if (e.touches.length === 2) {
                    e.preventDefault();
                    isPinching = true;
                    isTwoFingerMoving = true;
                    
                    // Store initial touch positions
                    initialTouches = [
                        { x: e.touches[0].clientX, y: e.touches[0].clientY },
                        { x: e.touches[1].clientX, y: e.touches[1].clientY }
                    ];
                    
                    // Calculate initial distance between touches
                    lastTouchDistance = getTouchDistance(e.touches[0], e.touches[1]);
                    
                    // Store initial position for two-finger move
                    lastTwoFingerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    lastTwoFingerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    
                    return;
                }
                
                // Handle single touch for painting
                if (moveMode || currentTool !== 'brush' && currentTool !== 'eraser') return;
                
                e.preventDefault();
                isTouchPainting = true;
                
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                
                // Convert touch to mouse event for painting
                const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                houseCanvas.dispatchEvent(mouseEvent);
            }
            
            function handleTouchMove(e) {
                // Handle pinch zoom and two-finger move
                if (e.touches.length === 2) {
                    e.preventDefault();
                    
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    
                    // Calculate current distance between touches
                    const currentDistance = getTouchDistance(touch1, touch2);
                    
                    // Handle pinch zoom
                    if (lastTouchDistance !== null) {
                        const scaleChange = currentDistance / lastTouchDistance;
                        scale = Math.max(0.2, Math.min(5, scale * scaleChange));
                        updateCanvasTransform();
                        lastTouchDistance = currentDistance;
                    }
                    
                    // Handle two-finger move
                    const currentTwoFingerX = (touch1.clientX + touch2.clientX) / 2;
                    const currentTwoFingerY = (touch1.clientY + touch2.clientY) / 2;
                    
                    offsetX += (currentTwoFingerX - lastTwoFingerX) / scale;
                    offsetY += (currentTwoFingerY - lastTwoFingerY) / scale;
                    
                    lastTwoFingerX = currentTwoFingerX;
                    lastTwoFingerY = currentTwoFingerY;
                    
                    updateCanvasTransform();
                    return;
                }
                
                // Handle single touch for painting
                if (!isTouchPainting) return;
                
                e.preventDefault();
                
                const touch = e.touches[0];
                
                // Convert touch to mouse event for painting
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                houseCanvas.dispatchEvent(mouseEvent);
            }
            
            function handleTouchEnd(e) {
                // Reset gesture states
                if (e.touches.length < 2) {
                    isPinching = false;
                    isTwoFingerMoving = false;
                    lastTouchDistance = null;
                    initialTouches = [];
                }
                
                // Handle single touch end
                if (!isTouchPainting) return;
                
                e.preventDefault();
                isTouchPainting = false;
                
                // Convert touch to mouse event for painting
                const mouseEvent = new MouseEvent('mouseup');
                houseCanvas.dispatchEvent(mouseEvent);
            }
            
            // Calculate distance between two touch points
            function getTouchDistance(touch1, touch2) {
                const dx = touch1.clientX - touch2.clientX;
                const dy = touch1.clientY - touch2.clientY;
                return Math.sqrt(dx * dx + dy * dy);
            }
            
            // Handle color search
            function handleColorSearch() {
                const query = colorSearchInput.value.toLowerCase().trim();
                
                if (query.length === 0) {
                    colorSearchResults.style.display = 'none';
                    return;
                }
                
                // Filter colors based on query
                const results = [];
                
                for (const [hex, name] of Object.entries(allColors)) {
                    if (name.toLowerCase().includes(query) || hex.toLowerCase().includes(query)) {
                        results.push({ hex, name });
                    }
                }
                
                // Also search in predefined colors
                colors.forEach(color => {
                    if (color.toLowerCase().includes(query)) {
                        results.push({ hex: color, name: 'Custom Color' });
                    }
                });
                
                // Display results
                displaySearchResults(results);
            }
            
            // Display search results
            function displaySearchResults(results) {
                colorSearchResults.innerHTML = '';
                
                if (results.length === 0) {
                    const noResult = document.createElement('div');
                    noResult.className = 'color-search-result';
                    noResult.textContent = 'No colors found';
                    colorSearchResults.appendChild(noResult);
                } else {
                    results.slice(0, 10).forEach(result => {
                        const resultElement = document.createElement('div');
                        resultElement.className = 'color-search-result';
                        
                        const colorPreview = document.createElement('div');
                        colorPreview.className = 'color-preview';
                        colorPreview.style.backgroundColor = result.hex;
                        
                        const colorDetails = document.createElement('div');
                        colorDetails.className = 'color-details';
                        
                        const colorCode = document.createElement('div');
                        colorCode.className = 'color-code';
                        colorCode.textContent = result.hex;
                        
                        const colorName = document.createElement('div');
                        colorName.className = 'color-name';
                        colorName.textContent = result.name;
                        
                        colorDetails.appendChild(colorCode);
                        colorDetails.appendChild(colorName);
                        
                        // Determine brand for tag
                        let brand = 'Custom';
                        if (asianPaintsColors[result.hex]) brand = 'Asian Paints';
                        else if (bergerPaintsColors[result.hex]) brand = 'Berger';
                        else if (opusPaintsColors[result.hex]) brand = 'Opus';
                        else if (duluxPaintsColors[result.hex]) brand = 'Dulux';
                        else if (jswPaintsColors[result.hex]) brand = 'JSW';
                        else if (nerolacPaintsColors[result.hex]) brand = 'Nerolac';
                        else if (nipponPaintsColors[result.hex]) brand = 'Nippon';
                        
                        const brandTag = document.createElement('span');
                        brandTag.className = 'brand-tag';
                        brandTag.textContent = brand;
                        
                        resultElement.appendChild(colorPreview);
                        resultElement.appendChild(colorDetails);
                        resultElement.appendChild(brandTag);
                        
                        resultElement.addEventListener('click', function() {
                            setCurrentColor(result.hex);
                            colorSearchInput.value = '';
                            colorSearchResults.style.display = 'none';
                        });
                        
                        colorSearchResults.appendChild(resultElement);
                    });
                }
                
                colorSearchResults.style.display = 'block';
            }
            
            // Enhanced Auto-Select Functions
            function startDragSelection(e) {
                if (moveMode || currentTool !== 'autoSelect') return;
                
                if (e.shiftKey || e.altKey) {
                    isDragging = true;
                    dragPath = [];
                    dragMode = e.altKey ? 'remove' : 'add';
                }
            }
            
            function dragSelection(e) {
                if (moveMode || !isDragging || currentTool !== 'autoSelect') return;
                
                const pos = getMousePos(e);
                const x = Math.floor(pos.x);
                const y = Math.floor(pos.y);
                
                dragPath.push([x, y]);
                
                if (dragPath.length % 5 === 0) {
                    const imageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                    const data = imageData.data;
                    const toleranceValue = parseInt(tolerance.value);
                    const [sx, sy] = dragPath[dragPath.length - 1];
                    const i = (sy * houseCanvas.width + sx) * 4;
                    const targetColor = [data[i], data[i + 1], data[i + 2]];
                    const region = floodFill(sx, sy, targetColor, toleranceValue, data, houseCanvas.width, houseCanvas.height, 50);
                    
                    if (dragMode === 'add') {
                        for (const key of region) selectedPixels.add(key);
                    } else {
                        for (const key of region) selectedPixels.delete(key);
                    }
                    
                    drawZigZagOutline(selectedPixels);
                }
            }
            
            function stopDragSelection(e) {
                if (isDragging) {
                    isDragging = false;
                    drawZigZagOutline(selectedPixels);
                }
            }
            
            function drawZigZagOutline(pixelSet) {
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                const edges = [];
                
                for (const key of pixelSet) {
                    const [x, y] = key.split(',').map(Number);
                    const neighbors = [
                        `${x + 1},${y}`, `${x - 1},${y}`,
                        `${x},${y + 1}`, `${x},${y - 1}`
                    ];
                    if (neighbors.some(n => !pixelSet.has(n))) {
                        edges.push([x, y]);
                    }
                }
                
                tempCtx.beginPath();
                tempCtx.setLineDash([4, 2]);
                tempCtx.strokeStyle = 'black';
                tempCtx.lineWidth = 1;
                
                for (const [x, y] of edges) {
                    tempCtx.moveTo(x, y);
                    tempCtx.lineTo(x + 1, y + 1);
                }
                
                tempCtx.stroke();
                tempCtx.setLineDash([]);
            }
            
            // Get mouse position with correct alignment to canvas pixels
            function getMousePos(e) {
                const rect = houseCanvas.getBoundingClientRect();
                
                // Calculate the actual canvas position considering transform
                const transform = houseCanvas.style.transform;
                let scaleX = 1;
                let scaleY = 1;
                let translateX = 0;
                let translateY = 0;
                
                if (transform) {
                    // Parse transform values - format is "scale(s) translate(xpx, ypx)"
                    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
                    const translateMatch = transform.match(/translate\(([^)]+)\)/);
                    
                    if (scaleMatch) {
                        scaleX = parseFloat(scaleMatch[1]);
                        scaleY = scaleX;
                    }
                    
                    if (translateMatch) {
                        const translateParts = translateMatch[1].split(',');
                        translateX = parseFloat(translateParts[0]);
                        translateY = parseFloat(translateParts[1]);
                    }
                }
                
                // Calculate mouse position relative to transformed canvas
                const mouseX = (e.clientX - rect.left - translateX) / scaleX;
                const mouseY = (e.clientY - rect.top - translateY) / scaleY;
                
                // Ensure coordinates are within canvas bounds
                const x = Math.max(0, Math.min(mouseX, houseCanvas.width));
                const y = Math.max(0, Math.min(mouseY, houseCanvas.height));
                
                return { x, y };
            }
            
            // Toggle move mode on/off
            function toggleMoveMode() {
                moveMode = !moveMode;
                
                if (moveMode) {
                    // Enable move mode
                    moveTool.classList.add('move-active');
                    canvasContainer.classList.add('move-mode');
                    canvasContainer.style.cursor = 'grab';
                    
                    // Disable other tools temporarily
                    setCurrentTool(null);
                } else {
                    // Disable move mode
                    disableMoveMode();
                    // Set brush as default tool when exiting move mode
                    setCurrentTool('brush');
                }
            }
            
            // Disable move mode
            function disableMoveMode() {
                moveMode = false;
                moveTool.classList.remove('move-active');
                canvasContainer.classList.remove('move-mode');
                canvasContainer.style.cursor = 'default';
                
                // Stop any active panning
                stopPanning();
            }
            
            // Zoom functions
            function zoomIn() {
                scale = Math.min(scale * 1.2, 5);
                updateCanvasTransform();
            }
            
            function zoomOut() {
                scale = Math.max(scale / 1.2, 0.2);
                updateCanvasTransform();
            }
            
            function resetZoom() {
                scale = 1;
                offsetX = 0;
                offsetY = 0;
                updateCanvasTransform();
            }
            
            function updateCanvasTransform() {
                houseCanvas.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
                tempCanvas.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
                updateZoomDisplay();
            }
            
            function updateZoomDisplay() {
                zoomLevel.textContent = `${Math.round(scale * 100)}%`;
            }
            
            function startPanning(e) {
                if (!moveMode || e.button !== 0) return; // Only in move mode and left mouse button
                panning = true;
                startX = e.clientX - offsetX;
                startY = e.clientY - offsetY;
                canvasContainer.style.cursor = 'grabbing';
            }
            
            function doPanning(e) {
                if (!moveMode || !panning) return;
                e.preventDefault();
                offsetX = e.clientX - startX;
                offsetY = e.clientY - startY;
                updateCanvasTransform();
            }
            
            function stopPanning() {
                panning = false;
                if (moveMode) {
                    canvasContainer.style.cursor = 'grab';
                } else {
                    canvasContainer.style.cursor = 'default';
                }
            }
            
            // Create a new project
            function newProject() {
                if (confirm('Start a new project? Any unsaved changes will be lost.')) {
                    currentProject = {
                        name: 'Untitled',
                        createdAt: new Date(),
                        lastSaved: null,
                        originalImage: null,
                        history: [],
                        settings: {
                            currentColor: '#3498db',
                            currentOpacity: 0.8,
                            currentShape: 'circle',
                            brushSize: 20,
                            tolerance: 30
                        }
                    };
                    
                    // Reset canvas
                    resetCanvas();
                    
                    // Reset settings
                    setCurrentColor('#3498db');
                    currentOpacity = 0.8;
                    opacitySlider.value = 80;
                    opacityValue.textContent = '80';
                    
                    currentShape = 'circle';
                    document.querySelectorAll('.brush-option').forEach(b => {
                        b.classList.remove('active');
                        if (b.dataset.shape === 'circle') b.classList.add('active');
                    });
                    
                    brushSize.value = 20;
                    brushSizeValue.textContent = '20';
                    
                    tolerance.value = 30;
                    toleranceValue.textContent = '30';
                    
                    // Reset applied colors
                    appliedColors.clear();
                    
                    // Reset zoom and disable move mode
                    resetZoom();
                    disableMoveMode();
                }
            }
            
            // Save project to .apz file
            function saveProject() {
                // Update project state
                currentProject.lastSaved = new Date();
                currentProject.history = [...history];
                currentProject.settings = {
                    currentColor: currentColor,
                    currentOpacity: currentOpacity,
                    currentShape: currentShape,
                    brushSize: parseInt(brushSize.value),
                    tolerance: parseInt(tolerance.value)
                };
                
                // Get current canvas state
                const currentState = houseCanvas.toDataURL();
                currentProject.currentState = currentState;
                
                // If there's an original image, include it
                if (originalImage) {
                    currentProject.originalImage = originalImage.src;
                }
                
                // Create blob and download
                const projectData = JSON.stringify(currentProject, null, 2);
                const blob = new Blob([projectData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentProject.name || 'house-design'}.apz`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            // Load project from .apz file
            function loadProject() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.apz';
                
                input.onchange = e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        try {
                            const projectData = JSON.parse(event.target.result);
                            
                            // Validate project file
                            if (!projectData.history || !projectData.settings) {
                                throw new Error('Invalid project file');
                            }
                            
                            // Load project data
                            currentProject = projectData;
                            
                            // Restore settings
                            setCurrentColor(projectData.settings.currentColor || '#3498db');
                            currentOpacity = projectData.settings.currentOpacity || 0.8;
                            opacitySlider.value = (currentOpacity * 100);
                            opacityValue.textContent = (currentOpacity * 100).toString();
                            
                            currentShape = projectData.settings.currentShape || 'circle';
                            document.querySelectorAll('.brush-option').forEach(b => {
                                b.classList.remove('active');
                                if (b.dataset.shape === currentShape) b.classList.add('active');
                            });
                            
                            brushSize.value = projectData.settings.brushSize || 20;
                            brushSizeValue.textContent = (projectData.settings.brushSize || 20).toString();
                            
                            tolerance.value = projectData.settings.tolerance || 30;
                            toleranceValue.textContent = (projectData.settings.tolerance || 30).toString();
                            
                            // Restore history
                            history = [...projectData.history];
                            historyIndex = history.length - 1;
                            
                            // Load the last state from history
                            if (history.length > 0) {
                                const lastState = history[historyIndex];
                                const img = new Image();
                                img.onload = function() {
                                    ctx.clearRect(0, 0, houseCanvas.width, houseCanvas.height);
                                    ctx.drawImage(img, 0, 0, houseCanvas.width, houseCanvas.height);
                                };
                                img.src = lastState;
                            }
                            
                            // Reset applied colors
                            appliedColors.clear();
                            
                            // Reset zoom and disable move mode
                            resetZoom();
                            disableMoveMode();
                            
                            // Update undo/redo buttons
                            updateUndoRedoButtons();
                        } catch (error) {
                            console.error('Error loading project:', error);
                            alert('Error loading project file. The file may be corrupted or in an invalid format.');
                        }
                    };
                    reader.readAsText(file);
                };
                
                input.click();
            }
            
            // Set the current tool
            function setCurrentTool(tool) {
                currentTool = tool;
                
                // Update UI
                brushTool.classList.remove('active');
                eraserTool.classList.remove('active');
                autoSelectTool.classList.remove('active');
                lassoTool.classList.remove('active');
                
                if (tool === 'brush') {
                    brushTool.classList.add('active');
                    houseCanvas.style.cursor = 'crosshair';
                    toleranceSection.style.display = 'none';
                    selectionInfo.style.display = 'none';
                    resetLasso();
                    clearSelection();
                } else if (tool === 'eraser') {
                    eraserTool.classList.add('active');
                    houseCanvas.style.cursor = 'crosshair';
                    toleranceSection.style.display = 'none';
                    selectionInfo.style.display = 'none';
                    resetLasso();
                    clearSelection();
                } else if (tool === 'autoSelect') {
                    autoSelectTool.classList.add('active');
                    houseCanvas.style.cursor = 'crosshair';
                    toleranceSection.style.display = 'block';
                    selectionInfo.style.display = 'block';
                    resetLasso();
                } else if (tool === 'lasso') {
                    lassoTool.classList.add('active');
                    houseCanvas.style.cursor = 'crosshair';
                    toleranceSection.style.display = 'none';
                    selectionInfo.style.display = 'none';
                    clearSelection();
                } else if (tool === null) {
                    // No tool selected (move mode active)
                    houseCanvas.style.cursor = 'default';
                    toleranceSection.style.display = 'none';
                    selectionInfo.style.display = 'none';
                    resetLasso();
                    clearSelection();
                }
            }
            
            // Clear selection
            function clearSelection() {
                selectedPixels.clear();
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            
            // Set the current color
            function setCurrentColor(color) {
                currentColor = color;
                customColorPicker.value = color;
                
                // Update active state in palette
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('active');
                    if (option.dataset.color === color) {
                        option.classList.add('active');
                    }
                });
            }
            
            // Handle file selection
            function handleFileSelect(e) {
                const file = e.target.files[0];
                if (file) {
                    loadImageFromFile(file);
                    uploadModal.style.display = 'none';
                }
            }
            
            // Load image from file
            function loadImageFromFile(file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        originalImage = img;
                        
                        // Set canvas size to match image dimensions for maximum quality
                        // But limit to container width with padding
                        const containerWidth = canvasContainer.clientWidth - 40; // 20px padding on each side
                        const aspectRatio = img.height / img.width;
                        
                        houseCanvas.width = containerWidth;
                        houseCanvas.height = containerWidth * aspectRatio;
                        tempCanvas.width = containerWidth;
                        tempCanvas.height = containerWidth * aspectRatio;
                        
                        drawImageToCanvas();
                        alignTempCanvas(); // ensure overlay canvas aligns exactly
                        // Store the original image data for eraser functionality
                        originalImageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                        saveToHistory();
                        
                        // Reset applied colors
                        appliedColors.clear();
                        
                        // Reset zoom and disable move mode
                        resetZoom();
                        disableMoveMode();
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
            
            // Load sample image
            function loadSampleImage(type) {
                originalImage = null;
                if (type === 'sample1') {
                    drawSampleHouse1();
                } else {
                    drawSampleHouse2();
                }
                // Store the original image data for eraser functionality
                originalImageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                uploadModal.style.display = 'none';
                alignTempCanvas();
                saveToHistory();
                
                // Reset applied colors
                appliedColors.clear();
                
                // Reset zoom and disable move mode
                resetZoom();
                disableMoveMode();
            }
            
            // Draw sample house 1 (for demo purposes)
            function drawSampleHouse1() {
                const containerWidth = canvasContainer.clientWidth - 40; // 20px padding on each side
                const height = containerWidth * 0.75; // 4:3 aspect ratio
                
                // Set canvas size
                houseCanvas.width = containerWidth;
                houseCanvas.height = height;
                tempCanvas.width = containerWidth;
                tempCanvas.height = height;
                
                // Clear canvas
                ctx.clearRect(0, 0, containerWidth, height);
                
                // Draw sky
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, containerWidth, height * 0.6);
                
                // Draw grass
                ctx.fillStyle = '#7CFC00';
                ctx.fillRect(0, height * 0.6, containerWidth, height * 0.4);
                
                // Draw house body
                ctx.fillStyle = '#F5F5DC';
                ctx.fillRect(containerWidth * 0.3, height * 0.3, containerWidth * 0.4, height * 0.3);
                
                // Draw roof
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.moveTo(containerWidth * 0.25, height * 0.3);
                ctx.lineTo(containerWidth * 0.5, height * 0.15);
                ctx.lineTo(containerWidth * 0.75, height * 0.3);
                ctx.closePath();
                ctx.fill();
                
                // Draw door
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(containerWidth * 0.45, height * 0.45, containerWidth * 0.1, height * 0.15);
                
                // Draw windows
                ctx.fillStyle = '#ADD8E6';
                ctx.fillRect(containerWidth * 0.35, height * 0.35, containerWidth * 0.08, height * 0.08);
                ctx.fillRect(containerWidth * 0.57, height * 0.35, containerWidth * 0.08, height * 0.08);
                
                // Draw window frames
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.strokeRect(containerWidth * 0.35, height * 0.35, containerWidth * 0.08, height * 0.08);
                ctx.strokeRect(containerWidth * 0.57, height * 0.35, containerWidth * 0.08, height * 0.08);
                
                // Draw window cross
                ctx.beginPath();
                ctx.moveTo(containerWidth * 0.39, height * 0.35);
                ctx.lineTo(containerWidth * 0.39, height * 0.43);
                ctx.moveTo(containerWidth * 0.35, height * 0.39);
                ctx.lineTo(containerWidth * 0.43, height * 0.39);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(containerWidth * 0.61, height * 0.35);
                ctx.lineTo(containerWidth * 0.61, height * 0.43);
                ctx.moveTo(containerWidth * 0.57, height * 0.39);
                ctx.lineTo(containerWidth * 0.65, height * 0.39);
                ctx.stroke();
            }
            
            // Draw sample house 2 (for demo purposes)
            function drawSampleHouse2() {
                const containerWidth = canvasContainer.clientWidth - 40; // 20px padding on each side
                const height = containerWidth * 0.75; // 4:3 aspect ratio
                
                // Set canvas size
                houseCanvas.width = containerWidth;
                houseCanvas.height = height;
                tempCanvas.width = containerWidth;
                tempCanvas.height = height;
                
                // Clear canvas
                ctx.clearRect(0, 0, containerWidth, height);
                
                // Draw sky
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, containerWidth, height * 0.6);
                
                // Draw grass
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(0, height * 0.6, containerWidth, height * 0.4);
                
                // Draw modern house body
                ctx.fillStyle = '#E0E0E0';
                ctx.fillRect(containerWidth * 0.2, height * 0.25, containerWidth * 0.6, height * 0.35);
                
                // Draw flat roof
                ctx.fillStyle = '#2C3E50';
                ctx.fillRect(containerWidth * 0.18, height * 0.25, containerWidth * 0.64, height * 0.05);
                
                // Draw large window
                ctx.fillStyle = '#34495E';
                ctx.fillRect(containerWidth * 0.3, height * 0.3, containerWidth * 0.4, height * 0.15);
                
                // Draw door
                ctx.fillStyle = '#16A085';
                ctx.fillRect(containerWidth * 0.45, height * 0.45, containerWidth * 0.1, height * 0.15);
                
                // Draw side panel
                ctx.fillStyle = '#BDC3C7';
                ctx.fillRect(containerWidth * 0.2, height * 0.4, containerWidth * 0.1, height * 0.2);
            }
            
            // Draw the original image to canvas
            function drawImageToCanvas() {
				if (!originalImage) return;
				
				// Save current settings
				const currentAlpha = ctx.globalAlpha;
				const currentComposite = ctx.globalCompositeOperation;
				
				// Use clean settings for drawing
				ctx.globalAlpha = 1.0;
				ctx.globalCompositeOperation = 'source-over';
				
				// Clear and draw
				ctx.clearRect(0, 0, houseCanvas.width, houseCanvas.height);
				ctx.drawImage(originalImage, 0, 0, houseCanvas.width, houseCanvas.height);
				
				// Restore settings
				ctx.globalAlpha = currentAlpha;
				ctx.globalCompositeOperation = currentComposite;
				
				// Update original image data
				originalImageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
			}
            
            // Resize canvas container to fit available space
            function resizeCanvas() {
                const container = canvasContainer;
                const maxWidth = container.parentElement.clientWidth - 50; // Account for padding
                const maxHeight = window.innerHeight * 0.6;
                
                // Set container dimensions
                container.style.width = `${maxWidth}px`;
                container.style.height = `${maxHeight}px`;
                
                // If we have an image, redraw it to fit the new container size
                if (originalImage) {
                    const aspectRatio = originalImage.height / originalImage.width;
                    houseCanvas.width = maxWidth - 40; // Account for padding
                    houseCanvas.height = (maxWidth - 40) * aspectRatio;
                    tempCanvas.width = maxWidth - 40;
                    tempCanvas.height = (maxWidth - 40) * aspectRatio;
                    drawImageToCanvas();
                    originalImageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                }
                alignTempCanvas(); // ensure overlay alignment after resize
            }
            
            // Align tempCanvas position/size so overlay drawing matches houseCanvas exactly
            function alignTempCanvas() {
                // Make tempCanvas the same displayed position as houseCanvas inside the container
                const containerRect = canvasContainer.getBoundingClientRect();
                const canvasRect = houseCanvas.getBoundingClientRect();
                const left = canvasRect.left - containerRect.left;
                const top = canvasRect.top - containerRect.top;
                
                tempCanvas.style.left = `${left}px`;
                tempCanvas.style.top = `${top}px`;
                
                // Ensure the temp canvas internal size matches the main canvas (already set where needed)
                // If not set, set to match
                if (tempCanvas.width !== houseCanvas.width || tempCanvas.height !== houseCanvas.height) {
                    tempCanvas.width = houseCanvas.width;
                    tempCanvas.height = houseCanvas.height;
                }
            }
            
            // Handle canvas click for tools
            function handleCanvasClick(e) {
                // Don't process clicks if in move mode
                if (moveMode) return;
                
                const pos = getMousePos(e);
                const x = pos.x;
                const y = pos.y;
                
                if (currentTool === 'autoSelect') {
                    // Enhanced auto-select with Shift and Alt functionality
                    if (isDragging) return; // Skip if we're in the middle of a drag operation
                   
                    const imageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                    const data = imageData.data;
                    const index = (Math.floor(y) * houseCanvas.width + Math.floor(x)) * 4;
                    const targetColor = [data[index], data[index + 1], data[index + 2]];
                    const toleranceValue = parseInt(tolerance.value);
                    const region = floodFill(Math.floor(x), Math.floor(y), targetColor, toleranceValue, data, houseCanvas.width, houseCanvas.height);
                    
                    if (e.altKey) {
                        for (const key of region) selectedPixels.delete(key);
                    } else {
                        if (!e.shiftKey) selectedPixels.clear();
                        for (const key of region) selectedPixels.add(key);
                    }
                    
                    drawZigZagOutline(selectedPixels);
                    
                    // Apply color immediately if not using modifier keys
                    if (!e.shiftKey && !e.altKey) {
                        applyColorToSelection();
                    }
                } else if (currentTool === 'lasso') {
                    if (!isDrawingLasso) {
                        // Start new lasso selection
                        lassoPoints = [{x, y}];
                        isDrawingLasso = true;
                        drawLassoPreview();
                    } else {
                        // Add point to existing lasso
                        lassoPoints.push({x, y});
                        drawLassoPreview();
                    }
                }
            }
            
            // Apply current color to selection
            function applyColorToSelection() {
                if (selectedPixels.size === 0) return;
                
                const imageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                const data = imageData.data;
                const rgb = hexToRgb(currentColor);
                
                for (const key of selectedPixels) {
                    const [x, y] = key.split(',').map(Number);
                    const i = (y * houseCanvas.width + x) * 4;
                    
                    // Blend the new color with the existing pixel using opacity
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    data[i] = r * (1 - currentOpacity) + rgb[0] * currentOpacity;
                    data[i + 1] = g * (1 - currentOpacity) + rgb[1] * currentOpacity;
                    data[i + 2] = b * (1 - currentOpacity) + rgb[2] * currentOpacity;
                }
                
                ctx.putImageData(imageData, 0, 0);
                selectedPixels.clear();
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Track applied color
                appliedColors.add(currentColor);
                
                saveToHistory();
            }
            
            // Handle canvas double click for lasso tool
            function handleCanvasDoubleClick(e) {
                // Don't process double clicks if in move mode
                if (moveMode) return;
                
                if (currentTool === 'lasso' && isDrawingLasso && lassoPoints.length > 2) {
                    // Complete the lasso selection and fill it
                    fillLassoSelection();
                    resetLasso();
                    
                    // Track applied color
                    appliedColors.add(currentColor);
                    
                    saveToHistory();
                }
            }
            
            // Draw lasso preview
            function drawLassoPreview() {
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                if (lassoPoints.length > 0) {
                    tempCtx.strokeStyle = '#FF0000';
                    tempCtx.lineWidth = 2;
                    tempCtx.setLineDash([5, 5]);
                    tempCtx.beginPath();
                    tempCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
                    
                    for (let i = 1; i < lassoPoints.length; i++) {
                        tempCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
                    }
                    
                    // Draw back to the first point if we have at least 2 points
                    if (lassoPoints.length > 1) {
                        tempCtx.lineTo(lassoPoints[0].x, lassoPoints[0].y);
                    }
                    
                    tempCtx.stroke();
                    tempCtx.setLineDash([]);
                    
                    // Draw points
                    lassoPoints.forEach(point => {
                        tempCtx.fillStyle = '#FF0000';
                        tempCtx.beginPath();
                        tempCtx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                        tempCtx.fill();
                    });
                }
            }
            
            // Fill the lasso selection
            function fillLassoSelection() {
                if (lassoPoints.length < 3) return;
                
                // Create a temporary canvas for the selection
                const selectionCanvas = document.createElement('canvas');
                selectionCanvas.width = houseCanvas.width;
                selectionCanvas.height = houseCanvas.height;
                const selectionCtx = selectionCanvas.getContext('2d');
                
                // Draw the polygon on the temporary canvas
                selectionCtx.fillStyle = '#000';
                selectionCtx.beginPath();
                selectionCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
                for (let i = 1; i < lassoPoints.length; i++) {
                    selectionCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
                }
                selectionCtx.closePath();
                selectionCtx.fill();
                
                // Get the image data from the main canvas
                const imageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                const selectionData = selectionCtx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                
                // Apply the color only to the selected area with opacity
                const rgb = hexToRgb(currentColor);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    if (selectionData.data[i + 3] > 0) { // If pixel is in the selection
                        // Blend the new color with the existing pixel using opacity
                        const r = imageData.data[i];
                        const g = imageData.data[i + 1];
                        const b = imageData.data[i + 2];
                        
                        imageData.data[i] = r * (1 - currentOpacity) + rgb[0] * currentOpacity;
                        imageData.data[i + 1] = g * (1 - currentOpacity) + rgb[1] * currentOpacity;
                        imageData.data[i + 2] = b * (1 - currentOpacity) + rgb[2] * currentOpacity;
                    }
                }
                
                // Put the modified image data back to canvas
                ctx.putImageData(imageData, 0, 0);
                
                // Clear the temporary canvas
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            
            // Reset lasso tool
            function resetLasso() {
                isDrawingLasso = false;
                lassoPoints = [];
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            
            // Get color at a specific pixel
            function getColorAtPixel(imageData, x, y) {
                const { width, height, data } = imageData;
                if (x < 0 || y < 0 || x >= width || y >= height) {
                    return [-1, -1, -1, -1]; // Impossible color
                }
                
                const offset = (y * width + x) * 4;
                return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
            }
            
            // Convert hex color to RGB
            function hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? [
                    parseInt(result[1], 16),
                    parseInt(result[2], 16),
                    parseInt(result[3], 16)
                ] : [0, 0, 0];
            }
            
            // Check if two colors are similar within tolerance
            function colorsMatch(color1, color2, tolerance) {
                return (
                    Math.abs(color1[0] - color2[0]) <= tolerance &&
                    Math.abs(color1[1] - color2[1]) <= tolerance &&
                    Math.abs(color1[2] - color2[2]) <= tolerance
                );
            }
            
            // Flood fill algorithm for auto-select
            function floodFill(startX, startY, targetColor, tolerance, data, width, height, maxDistance = Infinity) {
                const visited = new Set();
                const stack = [[startX, startY]];
                const result = new Set();
                
                function matchColor(i) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    return Math.abs(r - targetColor[0]) <= tolerance &&
                           Math.abs(g - targetColor[1]) <= tolerance &&
                           Math.abs(b - targetColor[2]) <= tolerance;
                }
                
                while (stack.length) {
                    const [cx, cy] = stack.pop();
                    const dx = cx - startX, dy = cy - startY;
                    if (dx * dx + dy * dy > maxDistance * maxDistance) continue;
                    
                    const key = `${cx},${cy}`;
                    if (visited.has(key)) continue;
                    visited.add(key);
                    
                    if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
                    
                    const i = (cy * width + cx) * 4;
                    if (matchColor(i)) {
                        result.add(key);
                        
                        stack.push([cx + 1, cy]);
                        stack.push([cx - 1, cy]);
                        stack.push([cx, cy + 1]);
                        stack.push([cx, cy - 1]);
                        stack.push([cx + 1, cy + 1]);
                        stack.push([cx - 1, cy - 1]);
                        stack.push([cx + 1, cy - 1]);
                        stack.push([cx - 1, cy + 1]);
                    }
                }
                
                return result;
            }
            
            // Start painting
            function startPainting(e) {
                // Don't start painting if in move mode
                if (moveMode || currentTool !== 'brush' && currentTool !== 'eraser') return;
                isPainting = true;
                paint(e);
            }
            
            // Paint on canvas - UPDATED with new brush shapes
            function paint(e) {
                if (moveMode || !isPainting || (currentTool !== 'brush' && currentTool !== 'eraser')) return;
                
                const pos = getMousePos(e);
                const x = pos.x;
                const y = pos.y;
                
                if (currentTool === 'eraser') {
                    // Erase by restoring original image data
                    const size = parseInt(brushSize.value);
                    const imageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
                    
                    if (currentEraser === 'circle') {
                        // Circle eraser
                        for (let i = -size/2; i < size/2; i++) {
                            for (let j = -size/2; j < size/2; j++) {
                                const px = Math.floor(x + i);
                                const py = Math.floor(y + j);
                                
                                // Check if point is within circle
                                if (Math.sqrt(i*i + j*j) <= size/2) {
                                    if (px >= 0 && px < houseCanvas.width && py >= 0 && py < houseCanvas.height) {
                                        const offset = (py * houseCanvas.width + px) * 4;
                                        
                                        // Restore original pixel data
                                        if (originalImageData) {
                                            imageData.data[offset] = originalImageData.data[offset];
                                            imageData.data[offset + 1] = originalImageData.data[offset + 1];
                                            imageData.data[offset + 2] = originalImageData.data[offset + 2];
                                            imageData.data[offset + 3] = originalImageData.data[offset + 3];
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // Square eraser
                        for (let i = -size/2; i < size/2; i++) {
                            for (let j = -size/2; j < size/2; j++) {
                                const px = Math.floor(x + i);
                                const py = Math.floor(y + j);
                                
                                if (px >= 0 && px < houseCanvas.width && py >= 0 && py < houseCanvas.height) {
                                    const offset = (py * houseCanvas.width + px) * 4;
                                    
                                    // Restore original pixel data
                                    if (originalImageData) {
                                        imageData.data[offset] = originalImageData.data[offset];
                                        imageData.data[offset + 1] = originalImageData.data[offset + 1];
                                        imageData.data[offset + 2] = originalImageData.data[offset + 2];
                                        imageData.data[offset + 3] = originalImageData.data[offset + 3];
                                    }
                                }
                            }
                        }
                    }
                    
                    ctx.putImageData(imageData, 0, 0);
                } else {
                    // Regular painting
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = currentColor;
                    ctx.globalAlpha = currentOpacity;
                    
                    // Different brush shapes
                    const size = parseInt(brushSize.value);
                    
                    switch(currentShape) {
                        case 'circle':
                            ctx.beginPath();
                            ctx.arc(x, y, size/2, 0, Math.PI * 2);
                            ctx.fill();
                            break;
                        case 'square':
                            ctx.fillRect(x - size/2, y - size/2, size, size);
                            break;
                        case 'line':
                            ctx.lineWidth = size;
                            ctx.lineCap = 'round';
                            ctx.beginPath();
                            if (e.type === 'mousedown' || e.type === 'touchstart') {
                                ctx.moveTo(x, y);
                            } else {
                                // For mousemove, we need to draw a line from the previous position
                                // This is a simplified version - a full implementation would track the previous position
                                ctx.moveTo(x - 1, y - 1);
                                ctx.lineTo(x, y);
                            }
                            ctx.strokeStyle = currentColor;
                            ctx.stroke();
                            break;
                        case 'triangle':
                            ctx.beginPath();
                            ctx.moveTo(x, y - size/2);
                            ctx.lineTo(x - size/2, y + size/2);
                            ctx.lineTo(x + size/2, y + size/2);
                            ctx.closePath();
                            ctx.fill();
                            break;
                        case 'line45': // 45-degree line brush
                            ctx.lineWidth = size;
                            ctx.lineCap = 'round';
                            ctx.beginPath();
                            const length45 = size * 2;
                            ctx.moveTo(x - length45/2, y - length45/2);
                            ctx.lineTo(x + length45/2, y + length45/2);
                            ctx.strokeStyle = currentColor;
                            ctx.stroke();
                            break;
                        case 'line135': // 135-degree line brush
                            ctx.lineWidth = size;
                            ctx.lineCap = 'round';
                            ctx.beginPath();
                            const length135 = size * 2;
                            ctx.moveTo(x + length135/2, y - length135/2);
                            ctx.lineTo(x - length135/2, y + length135/2);
                            ctx.strokeStyle = currentColor;
                            ctx.stroke();
                            break;
                    }
                    
                    // Track applied color
                    appliedColors.add(currentColor);
                }
            }
            
            // Stop painting
            function stopPainting() {
                if (isPainting && (currentTool === 'brush' || currentTool === 'eraser')) {
                    isPainting = false;
                    saveToHistory();
                }
            }
            
            // Save current canvas state to history
            function saveToHistory() {
    // If we're not at the end of history, remove future states
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    
    // Save current context settings
    const currentAlpha = ctx.globalAlpha;
    const currentComposite = ctx.globalCompositeOperation;
    
    // Temporarily reset to default settings for saving
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    
    // Get image data with default settings
    const imageData = houseCanvas.toDataURL();
    
    // Restore context settings
    ctx.globalAlpha = currentAlpha;
    ctx.globalCompositeOperation = currentComposite;
    
    history.push(imageData);
    historyIndex = history.length - 1;
    
    // Limit history size
    if (history.length > maxHistorySize) {
        history.shift();
        historyIndex--;
    }
    
    updateUndoRedoButtons();
}
            
            // Update undo/redo buttons state
            function updateUndoRedoButtons() {
                undoBtn.disabled = historyIndex <= 0;
                redoBtn.disabled = historyIndex >= history.length - 1;
            }
            
            // Undo action
           function undoAction() {
				if (historyIndex > 0) {
					historyIndex--;
					const state = history[historyIndex];
					const img = new Image();
					img.onload = function() {
						// Clear canvas completely before redrawing
						ctx.clearRect(0, 0, houseCanvas.width, houseCanvas.height);
						
						// Draw the saved state without any additional effects
						ctx.globalAlpha = 1.0; // Reset to full opacity
						ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
						ctx.drawImage(img, 0, 0, houseCanvas.width, houseCanvas.height);
						
						// Reset context settings to current painting settings
						ctx.globalAlpha = currentOpacity;
						ctx.globalCompositeOperation = 'source-over';
					};
					img.src = state;
					updateUndoRedoButtons();
				}
			}
            
            // Redo action
            function redoAction() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const state = history[historyIndex];
        const img = new Image();
        img.onload = function() {
            // Clear canvas completely before redrawing
            ctx.clearRect(0, 0, houseCanvas.width, houseCanvas.height);
            
            // Draw the saved state without any additional effects
            ctx.globalAlpha = 1.0; // Reset to full opacity
            ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
            ctx.drawImage(img, 0, 0, houseCanvas.width, houseCanvas.height);
            
            // Reset context settings to current painting settings
            ctx.globalAlpha = currentOpacity;
            ctx.globalCompositeOperation = 'source-over';
        };
        img.src = state;
        updateUndoRedoButtons();
    }
}
            
            // Reset canvas to original image
           // Reset canvas to original image - FIXED: Completely clean reset without confirmation
			function resetCanvas() {
				// Completely clear the canvas
				ctx.clearRect(0, 0, houseCanvas.width, houseCanvas.height);
				
				if (originalImage) {
					// Save current context settings
					const currentAlpha = ctx.globalAlpha;
					const currentComposite = ctx.globalCompositeOperation;
					
					// Reset to full opacity for clean drawing
					ctx.globalAlpha = 1.0;
					ctx.globalCompositeOperation = 'source-over';
					
					// Draw original image with full opacity
					ctx.drawImage(originalImage, 0, 0, houseCanvas.width, houseCanvas.height);
					
					// Restore current settings for future painting
					ctx.globalAlpha = currentAlpha;
					ctx.globalCompositeOperation = currentComposite;
				} else if (history.length > 0) {
					// Load the very first state from history (clean state)
					const firstState = history[0];
					const img = new Image();
					img.onload = function() {
						// Save current context settings
						const currentAlpha = ctx.globalAlpha;
						const currentComposite = ctx.globalCompositeOperation;
						
						// Reset to full opacity for clean drawing
						ctx.globalAlpha = 1.0;
						ctx.globalCompositeOperation = 'source-over';
						
						// Clear and draw with full opacity
						ctx.clearRect(0, 0, houseCanvas.width, houseCanvas.height);
						ctx.drawImage(img, 0, 0, houseCanvas.width, houseCanvas.height);
						
						// Restore current settings for future painting
						ctx.globalAlpha = currentAlpha;
						ctx.globalCompositeOperation = currentComposite;
					};
					img.src = firstState;
				} else {
					// If no original image or history, draw sample with clean settings
					const currentAlpha = ctx.globalAlpha;
					const currentComposite = ctx.globalCompositeOperation;
					
					ctx.globalAlpha = 1.0;
					ctx.globalCompositeOperation = 'source-over';
					
					drawSampleHouse1();
					
					ctx.globalAlpha = currentAlpha;
					ctx.globalCompositeOperation = currentComposite;
				}
				
				// Store the clean image data for eraser functionality
				originalImageData = ctx.getImageData(0, 0, houseCanvas.width, houseCanvas.height);
				
				resetLasso();
				clearSelection();
				
				// Reset applied colors
				appliedColors.clear();
				
				// Save the clean state to history
				saveToHistory();
				
				// Reset zoom and disable move mode
				resetZoom();
				disableMoveMode();
			}
            
            // Download the painted image with footer
            function downloadImage() {
                // Create a temporary canvas with higher resolution for better quality
                const scaleFactor = 2; // Double the resolution for better quality
                const tempCanvas = document.createElement('canvas');
                const footerHeight = 180 * scaleFactor; // Increased height for longer text
                tempCanvas.width = houseCanvas.width * scaleFactor;
                tempCanvas.height = (houseCanvas.height * scaleFactor) + footerHeight;
                
                const tempCtx = tempCanvas.getContext('2d');
                
                // Enable high-quality rendering
                tempCtx.imageSmoothingEnabled = true;
                tempCtx.imageSmoothingQuality = 'high';
                
                // Draw the main image (scaled up for better quality)
                tempCtx.drawImage(
                    houseCanvas, 
                    0, 0, houseCanvas.width, houseCanvas.height,
                    0, 0, tempCanvas.width, houseCanvas.height * scaleFactor
                );
                
                // Draw footer background
                tempCtx.fillStyle = '#f8f9fa';
                tempCtx.fillRect(0, houseCanvas.height * scaleFactor, tempCanvas.width, footerHeight);
                
                // Draw footer border
                tempCtx.strokeStyle = '#dee2e6';
                tempCtx.lineWidth = 1 * scaleFactor;
                tempCtx.beginPath();
                tempCtx.moveTo(0, houseCanvas.height * scaleFactor);
                tempCtx.lineTo(tempCanvas.width, houseCanvas.height * scaleFactor);
                tempCtx.stroke();
                
                // Draw applied colors with proper spacing and full text
                const startX = 30 * scaleFactor;
                let xPos = startX;
                const yPos = (houseCanvas.height * scaleFactor) + (30 * scaleFactor);
                const rowHeight = 45 * scaleFactor; // Increased row height for multi-line text
                const maxColorsPerRow = 3; // Reduced to 3 per row for wider columns
                const colorBlockWidth = (tempCanvas.width - (startX * 2)) / maxColorsPerRow;
                
                tempCtx.font = `bold ${12 * scaleFactor}px Arial, sans-serif`;
                tempCtx.fillStyle = '#495057';
                tempCtx.textAlign = 'left';
                tempCtx.fillText('', startX, yPos - (15 * scaleFactor));
                
                // Display colors in organized rows with full text
                let colorCount = 0;
                let currentRow = 0;
                
                // Convert Set to Array for consistent ordering
                const appliedColorsArray = Array.from(appliedColors);
                
                for (const color of appliedColorsArray) {
                    if (colorCount >= 6) break; // Limit to 6 colors total for better readability
                    
                    // Calculate position for this color block
                    const blockX = startX + (colorCount % maxColorsPerRow) * colorBlockWidth;
                    const blockY = yPos + (currentRow * rowHeight);
                    
                    // Draw color circle
                    tempCtx.fillStyle = color;
                    tempCtx.beginPath();
                    tempCtx.arc(blockX + (20 * scaleFactor), blockY, 12 * scaleFactor, 0, Math.PI * 2);
                    tempCtx.fill();
                    
                    // Draw border around color circle for better visibility
                    tempCtx.strokeStyle = '#dee2e6';
                    tempCtx.lineWidth = 1 * scaleFactor;
                    tempCtx.stroke();
                    
                    // Draw color information with full text
                    tempCtx.font = `${10 * scaleFactor}px Arial, sans-serif`;
                    tempCtx.fillStyle = '#495057';
                    
                    const colorName = allColors[color] || 'Custom Color';
                    const colorCode = color.toUpperCase();
                    
                    // Calculate available width for text
                    const textStartX = blockX + (40 * scaleFactor);
                    const availableWidth = colorBlockWidth - (40 * scaleFactor);
                    
                    // Draw color code (bold)
                    tempCtx.font = `bold ${10 * scaleFactor}px Arial, sans-serif`;
                    tempCtx.fillText(colorCode, textStartX, blockY - (8 * scaleFactor));
                    
                    // Draw color name (regular) - handle long names with word wrap
                    tempCtx.font = `${9 * scaleFactor}px Arial, sans-serif`;
                    tempCtx.fillStyle = '#6c757d';
                    
                    // Word wrap function for long color names
                    const words = colorName.split(' ');
                    let line = '';
                    let lineCount = 0;
                    const maxLines = 2; // Maximum 2 lines for color name
                    
                    for (let i = 0; i < words.length; i++) {
                        const testLine = line + words[i] + ' ';
                        const metrics = tempCtx.measureText(testLine);
                        const testWidth = metrics.width;
                        
                        if (testWidth > availableWidth && i > 0) {
                            // Draw the current line
                            tempCtx.fillText(line, textStartX, blockY + (5 * scaleFactor) + (lineCount * 12 * scaleFactor));
                            lineCount++;
                            
                            // Stop if we've reached max lines
                            if (lineCount >= maxLines) {
                                // Add ellipsis if there are more words
                                if (i < words.length - 1) {
                                    tempCtx.fillText(line + '...', textStartX, blockY + (5 * scaleFactor) + (lineCount * 12 * scaleFactor));
                                }
                                break;
                            }
                            
                            // Start new line with current word
                            line = words[i] + ' ';
                        } else {
                            line = testLine;
                        }
                    }
                    
                    // Draw the last line if we haven't reached max lines
                    if (lineCount < maxLines) {
                        tempCtx.fillText(line.trim(), textStartX, blockY + (5 * scaleFactor) + (lineCount * 12 * scaleFactor));
                    }
                    
                    colorCount++;
                    
                    // Move to next row if current row is full
                    if ((colorCount % maxColorsPerRow) === 0) {
                        currentRow++;
                    }
                }
                
                // Draw watermark with better positioning
                const watermarkY = (houseCanvas.height * scaleFactor) + footerHeight - (40 * scaleFactor);
                tempCtx.font = `italic ${10 * scaleFactor}px Arial, sans-serif`;
                tempCtx.fillStyle = '#6c757d';
                tempCtx.textAlign = 'center';
                tempCtx.fillText('More colors visit: https://www.apzok.com', tempCanvas.width / 2, watermarkY);
                
                // Draw disclaimer with better positioning
                const disclaimerY = (houseCanvas.height * scaleFactor) + footerHeight - (20 * scaleFactor);
                tempCtx.font = `${9 * scaleFactor}px Arial, sans-serif`;
                tempCtx.fillStyle = '#868e96';
                tempCtx.fillText('Note: Visualizer colors may vary from actual paint and screen display', tempCanvas.width / 2, disclaimerY);
                
                // Create download link with high quality
                const link = document.createElement('a');
                link.download = 'painted-house-with-colors.png';
                
                // Use higher quality PNG settings
                const dataUrl = tempCanvas.toDataURL('image/png', 1.0); // Maximum quality
                link.href = dataUrl;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            // Initialize the application
            init();
            
            // Make paint databases globally available for color combinations
            window.asianPaintsColors = asianPaintsColors;
            window.bergerPaintsColors = bergerPaintsColors;
            window.opusPaintsColors = opusPaintsColors;
            window.duluxPaintsColors = duluxPaintsColors;
            window.jswPaintsColors = jswPaintsColors;
            window.nerolacPaintsColors = nerolacPaintsColors;
            window.nipponPaintsColors = nipponPaintsColors;
            window.allColors = allColors;

            // Make main app functions available globally for color combinations
            window.setCurrentColor = setCurrentColor;
            window.currentColor = currentColor;
            window.currentOpacity = currentOpacity;
            window.currentProject = currentProject;
            window.ctx = ctx;
        });