document.addEventListener('DOMContentLoaded', function() {
    // FIXED: Improved dropdown behavior
    const dropdowns = document.querySelectorAll('.brush-dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownContent = dropdown.querySelector('.brush-dropdown-content');
        
        // Show dropdown immediately on hover
        dropdown.addEventListener('mouseenter', function() {
            dropdownContent.style.display = 'block';
        });
        
        // Hide dropdown immediately when leaving
        dropdown.addEventListener('mouseleave', function() {
            dropdownContent.style.display = 'none';
        });
        
        // Keep dropdown open when hovering over content
        dropdownContent.addEventListener('mouseenter', function() {
            dropdownContent.style.display = 'block';
        });
        
        // Hide dropdown immediately when leaving content
        dropdownContent.addEventListener('mouseleave', function() {
            dropdownContent.style.display = 'none';
        });
    });

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
    
    // Zoom state
    let scale = 1;
    let isPinching = false;
    let lastTouchDistance = null;

    // Touch gesture state
    let isTouchPainting = false;
    let touchStartX, touchStartY;
    
    // Mobile scroll state
    let isMobileScrolling = false;
    let scrollStartX, scrollStartY;
    let scrollOffsetX = 0, scrollOffsetY = 0;
    
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
    
    // FIXED: Get mouse position with zoom transformation
    function getMousePos(e) {
        const rect = houseCanvas.getBoundingClientRect();
        
        // Get raw mouse/touch position relative to viewport
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (clientX === undefined || clientY === undefined) return { x: 0, y: 0 };
        
        // Calculate position relative to canvas element
        const x = (clientX - rect.left) / scale;
        const y = (clientY - rect.top) / scale;
        
        // Ensure coordinates are within canvas bounds
        const boundedX = Math.max(0, Math.min(x, houseCanvas.width));
        const boundedY = Math.max(0, Math.min(y, houseCanvas.height));
        
        return { x: boundedX, y: boundedY };
    }
    
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
        });
        
        eraserTool.addEventListener('click', function() {
            setCurrentTool('eraser');
        });
        
        autoSelectTool.addEventListener('click', function() {
            setCurrentTool('autoSelect');
        });
        
        lassoTool.addEventListener('click', function() {
            setCurrentTool('lasso');
        });
        
        // Hide move tool since we're using scroll instead
        moveTool.style.display = 'none';
        
        // Upload image button
        uploadImageBtn.addEventListener('click', function() {
            uploadModal.style.display = 'flex';
        });
        
        // Action buttons
        undoBtn.addEventListener('click', undoAction);
        redoBtn.addEventListener('click', redoAction);
        resetBtn.addEventListener('click', resetCanvas);
        downloadBtn.addEventListener('click', showColorSelectionPopup);
        
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
        
        // Touch events for mobile painting and zoom
        houseCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        houseCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        houseCanvas.addEventListener('touchend', handleTouchEnd);
        
        // Enhanced Auto-Select events
        houseCanvas.addEventListener('mousedown', startDragSelection);
        houseCanvas.addEventListener('mousemove', dragSelection);
        houseCanvas.addEventListener('mouseup', stopDragSelection);
        
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
            setupMobileScroll();
        });
        
        // Load a sample image by default
        loadSampleImage('sample1');
        
        // Hide tolerance control initially
        toleranceSection.style.display = 'none';
        selectionInfo.style.display = 'none';
        
        // Update zoom display
        updateZoomDisplay();
        
        // Setup mobile scroll functionality
        setupMobileScroll();
        
        // Hide scroll hint after user interacts with toolbar
        toolbar.addEventListener('scroll', function() {
            this.classList.add('scrolled');
        });
    }
    
    // NEW: Setup mobile scroll functionality with big touch points
    function setupMobileScroll() {
        // Remove existing scroll handlers if any
        canvasContainer.removeEventListener('touchstart', handleMobileScrollStart);
        canvasContainer.removeEventListener('touchmove', handleMobileScrollMove);
        canvasContainer.removeEventListener('touchend', handleMobileScrollEnd);
        
        // Add mobile scroll handlers
        canvasContainer.addEventListener('touchstart', handleMobileScrollStart, { passive: false });
        canvasContainer.addEventListener('touchmove', handleMobileScrollMove, { passive: false });
        canvasContainer.addEventListener('touchend', handleMobileScrollEnd);
        
        // Update canvas container styles for mobile
        if (isMobileDevice()) {
            canvasContainer.style.overflow = 'auto';
            canvasContainer.style.webkitOverflowScrolling = 'touch';
            canvasContainer.style.cursor = 'grab';
            
            // Add scroll indicators for better UX
            addScrollIndicators();
        }
    }
    
    // NEW: Check if device is mobile
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }
    
    // NEW: Add scroll indicators for mobile
    function addScrollIndicators() {
        // Remove existing indicators
        const existingIndicators = document.querySelectorAll('.scroll-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
        
        // Add horizontal scroll indicator
        const horizontalIndicator = document.createElement('div');
        horizontalIndicator.className = 'scroll-indicator horizontal';
        horizontalIndicator.innerHTML = '← Scroll →';
        horizontalIndicator.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 100;
            pointer-events: none;
            animation: pulse 2s infinite;
        `;
        
        // Add vertical scroll indicator
        const verticalIndicator = document.createElement('div');
        verticalIndicator.className = 'scroll-indicator vertical';
        verticalIndicator.innerHTML = '↑ Scroll ↓';
        verticalIndicator.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%) rotate(-90deg);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 100;
            pointer-events: none;
            animation: pulse 2s infinite;
            transform-origin: center;
        `;
        
        // Add CSS for pulse animation
        if (!document.getElementById('scroll-indicator-styles')) {
            const styles = document.createElement('style');
            styles.id = 'scroll-indicator-styles';
            styles.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }
                .canvas-container::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                .canvas-container::-webkit-scrollbar-thumb {
                    background: rgba(52, 152, 219, 0.8);
                    border-radius: 6px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .canvas-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(41, 128, 185, 0.8);
                    background-clip: content-box;
                }
                .canvas-container::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                    border-radius: 6px;
                }
                .mobile-scroll-handle {
                    position: absolute;
                    background: rgba(52, 152, 219, 0.3);
                    border: 2px solid rgba(52, 152, 219, 0.8);
                    border-radius: 50%;
                    z-index: 50;
                    pointer-events: none;
                    transition: all 0.2s ease;
                }
                .mobile-scroll-handle.active {
                    background: rgba(52, 152, 219, 0.6);
                    transform: scale(1.1);
                }
            `;
            document.head.appendChild(styles);
        }
        
        canvasContainer.appendChild(horizontalIndicator);
        canvasContainer.appendChild(verticalIndicator);
        
        // Remove indicators after 5 seconds
        setTimeout(() => {
            horizontalIndicator.remove();
            verticalIndicator.remove();
        }, 5000);
    }
    
    // NEW: Handle mobile scroll start
    function handleMobileScrollStart(e) {
        if (e.touches.length !== 1 || currentTool === 'brush' || currentTool === 'eraser') return;
        
        e.preventDefault();
        isMobileScrolling = true;
        
        const touch = e.touches[0];
        scrollStartX = touch.clientX;
        scrollStartY = touch.clientY;
        scrollOffsetX = canvasContainer.scrollLeft;
        scrollOffsetY = canvasContainer.scrollTop;
        
        // Show scroll handle
        showScrollHandle(touch.clientX, touch.clientY);
        
        canvasContainer.style.cursor = 'grabbing';
    }
    
    // NEW: Handle mobile scroll move
    function handleMobileScrollMove(e) {
        if (!isMobileScrolling || e.touches.length !== 1) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = scrollStartX - touch.clientX;
        const deltaY = scrollStartY - touch.clientY;
        
        // Update scroll position
        canvasContainer.scrollLeft = scrollOffsetX + deltaX;
        canvasContainer.scrollTop = scrollOffsetY + deltaY;
        
        // Update scroll handle position
        updateScrollHandle(touch.clientX, touch.clientY);
    }
    
    // NEW: Handle mobile scroll end
    function handleMobileScrollEnd() {
        isMobileScrolling = false;
        canvasContainer.style.cursor = 'grab';
        
        // Hide scroll handle
        hideScrollHandle();
    }
    
    // NEW: Show big scroll handle for mobile
    function showScrollHandle(x, y) {
        hideScrollHandle();
        
        const handle = document.createElement('div');
        handle.className = 'mobile-scroll-handle';
        handle.style.cssText = `
            position: fixed;
            left: ${x - 30}px;
            top: ${y - 30}px;
            width: 60px;
            height: 60px;
            background: rgba(52, 152, 219, 0.3);
            border: 3px solid rgba(52, 152, 219, 0.8);
            border-radius: 50%;
            z-index: 1000;
            pointer-events: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(handle);
        
        // Add active state after a delay
        setTimeout(() => {
            handle.style.background = 'rgba(52, 152, 219, 0.6)';
            handle.style.transform = 'scale(1.1)';
        }, 50);
    }
    
    // NEW: Update scroll handle position
    function updateScrollHandle(x, y) {
        const handle = document.querySelector('.mobile-scroll-handle');
        if (handle) {
            handle.style.left = `${x - 30}px`;
            handle.style.top = `${y - 30}px`;
        }
    }
    
    // NEW: Hide scroll handle
    function hideScrollHandle() {
        const handle = document.querySelector('.mobile-scroll-handle');
        if (handle) {
            handle.remove();
        }
    }
    
    // Touch event handlers for mobile
    function handleTouchStart(e) {
        // Handle pinch zoom
        if (e.touches.length === 2) {
            e.preventDefault();
            isPinching = true;
            
            // Calculate initial distance between touches
            lastTouchDistance = getTouchDistance(e.touches[0], e.touches[1]);
            return;
        }
        
        // Handle single touch for painting
        if (currentTool !== 'brush' && currentTool !== 'eraser') return;
        
        e.preventDefault();
        isTouchPainting = true;
        
        // Use the corrected getMousePos function for accurate coordinates
        const pos = getMousePos(e);
        touchStartX = pos.x;
        touchStartY = pos.y;
        
        // Convert touch to mouse event for painting with corrected coordinates
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY
        });
        houseCanvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchMove(e) {
        // Handle pinch zoom
        if (e.touches.length === 2 && isPinching) {
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
            return;
        }
        
        // Handle single touch for painting
        if (!isTouchPainting) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        
        // Convert touch to mouse event for painting with corrected coordinates
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
            lastTouchDistance = null;
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
        updateCanvasTransform();
        // Reset scroll position when zoom is reset
        if (canvasContainer) {
            canvasContainer.scrollLeft = 0;
            canvasContainer.scrollTop = 0;
        }
    }

    function updateCanvasTransform() {
        houseCanvas.style.transform = `scale(${scale})`;
        tempCanvas.style.transform = `scale(${scale})`;
        updateZoomDisplay();
        
        // Force reflow
        houseCanvas.offsetHeight;
        tempCanvas.offsetHeight;
        
        // Update mobile scroll setup when zoom changes
        if (isMobileDevice()) {
            setupMobileScroll();
        }
    }

    function updateZoomDisplay() {
        zoomLevel.textContent = `${Math.round(scale * 100)}%`;
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
        if (currentTool !== 'autoSelect') return;
        
        if (e.shiftKey || e.altKey) {
            isDragging = true;
            dragPath = [];
            dragMode = e.altKey ? 'remove' : 'add';
        }
    }
    
    function dragSelection(e) {
        if (!isDragging || currentTool !== 'autoSelect') return;
        
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
            
            // Reset zoom
            resetZoom();
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
                    
                    // Reset zoom
                    resetZoom();
                    
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
                
                // Reset zoom
                resetZoom();
                
                // Setup mobile scroll for new image
                setupMobileScroll();
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
        
        // Reset zoom
        resetZoom();
        
        // Setup mobile scroll
        setupMobileScroll();
    }
    
    // Draw sample house 1 (for demo purposes) - FIXED: Use clean settings
    function drawSampleHouse1() {
        const containerWidth = canvasContainer.clientWidth - 40;
        const height = containerWidth * 0.75;
        
        // Set canvas size
        houseCanvas.width = containerWidth;
        houseCanvas.height = height;
        tempCanvas.width = containerWidth;
        tempCanvas.height = height;
        
        // Save current settings
        const currentAlpha = ctx.globalAlpha;
        const currentComposite = ctx.globalCompositeOperation;
        
        // Use clean settings for drawing
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
        
        // Clear canvas
        ctx.clearRect(0, 0, containerWidth, height);
        
        // Draw with full opacity
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, containerWidth, height * 0.6);
        
        ctx.fillStyle = '#7CFC00';
        ctx.fillRect(0, height * 0.6, containerWidth, height * 0.4);
        
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
        
        // Restore settings
        ctx.globalAlpha = currentAlpha;
        ctx.globalCompositeOperation = currentComposite;
    }
    
    // Draw sample house 2 (for demo purposes) - FIXED: Use clean settings
    function drawSampleHouse2() {
        const containerWidth = canvasContainer.clientWidth - 40;
        const height = containerWidth * 0.75;
        
        // Set canvas size
        houseCanvas.width = containerWidth;
        houseCanvas.height = height;
        tempCanvas.width = containerWidth;
        tempCanvas.height = height;
        
        // Save current settings
        const currentAlpha = ctx.globalAlpha;
        const currentComposite = ctx.globalCompositeOperation;
        
        // Use clean settings for drawing
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
        
        // Clear canvas
        ctx.clearRect(0, 0, containerWidth, height);
        
        // Draw with full opacity
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, containerWidth, height * 0.6);
        
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
        
        // Restore settings
        ctx.globalAlpha = currentAlpha;
        ctx.globalCompositeOperation = currentComposite;
    }
    
    // Draw the original image to canvas - FIXED: Use clean settings
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
        
        // Update mobile scroll
        setupMobileScroll();
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
    
    // Handle canvas click for tools - FIXED: Use corrected coordinates
    function handleCanvasClick(e) {
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
        if (currentTool !== 'brush' && currentTool !== 'eraser') return;
        isPainting = true;
        paint(e);
    }
    
    // Paint on canvas - UPDATED with corrected coordinates
    function paint(e) {
        if (!isPainting || (currentTool !== 'brush' && currentTool !== 'eraser')) return;
        
        const pos = getMousePos(e); // This now returns corrected coordinates
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
            // Regular painting with corrected coordinates
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
    
    // Save current canvas state to history - FIXED: Save clean state without active context settings
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
    
    // Undo action - FIXED: Don't apply transparency effects multiple times
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
    
    // Redo action - FIXED: Don't apply transparency effects multiple times
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
        
        // Reset zoom
        resetZoom();
        
        // Reset scroll position
        if (canvasContainer) {
            canvasContainer.scrollLeft = 0;
            canvasContainer.scrollTop = 0;
        }
    }
    
    // NEW: Show color selection popup before download (smaller size)
    function showColorSelectionPopup() {
        // Create popup modal
        const popup = document.createElement('div');
        popup.className = 'modal';
        popup.style.display = 'flex';
        popup.style.zIndex = '10000';
        
        const selectedColors = new Set(Array.from(appliedColors));
        
        popup.innerHTML = `
            <div class="modal-content" style="max-width: 500px; max-height: 70vh;">
                <span class="close-modal" id="closeColorPopup">&times;</span>
                <h2 class="modal-title">Select Colors for Image</h2>
                <p style="margin-bottom: 15px; color: #666; font-size: 0.9rem;">Uncheck colors you don't want in the final image</p>
                
                <div class="color-selection-grid" id="colorSelectionGrid" style="
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 10px;
                    margin-bottom: 20px;
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 5px;
                ">
                    <!-- Color options will be populated here -->
                </div>
                
                <div class="selected-count" style="margin-bottom: 15px; font-weight: bold; color: #2c3e50; font-size: 0.9rem;">
                    Selected: <span id="selectedCount">${selectedColors.size}</span> colors
                </div>
                
                <div class="popup-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn btn-secondary" id="cancelDownload" style="padding: 8px 16px; font-size: 0.9rem;">Cancel</button>
                    <button class="btn btn-primary" id="confirmDownload" style="padding: 8px 16px; font-size: 0.9rem;">Download</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Populate color grid
        const colorGrid = document.getElementById('colorSelectionGrid');
        const selectedCount = document.getElementById('selectedCount');
        
        // Convert Set to Array for consistent ordering
        const appliedColorsArray = Array.from(appliedColors);
        
        if (appliedColorsArray.length === 0) {
            colorGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 20px; font-size: 0.9rem;">No colors applied to the image yet.</p>';
            document.getElementById('confirmDownload').disabled = true;
        } else {
            appliedColorsArray.forEach(color => {
                const colorItem = document.createElement('div');
                colorItem.className = 'color-selection-item';
                colorItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    border: 2px solid #3498db;
                    border-radius: 6px;
                    background: #f8f9fa;
                    cursor: pointer;
                    transition: all 0.2s ease;
                `;
                
                const colorName = allColors[color] || 'Custom Color';
                
                colorItem.innerHTML = `
                    <div class="color-checkbox" style="display: flex; align-items: center;">
                        <input type="checkbox" class="color-check" data-color="${color}" checked 
                               style="margin: 0; width: 16px; height: 16px; cursor: pointer;">
                    </div>
                    <div class="color-swatch-large" style="
                        width: 30px;
                        height: 30px;
                        border-radius: 4px;
                        border: 2px solid #ddd;
                        background-color: ${color};
                    "></div>
                    <div class="color-details" style="flex: 1;">
                        <div class="color-name" style="font-weight: bold; color: #2c3e50; margin-bottom: 2px; font-size: 0.9rem;">${colorName}</div>
                        <div class="color-code" style="font-family: monospace; color: #666; font-size: 0.8rem;">${color.toUpperCase()}</div>
                    </div>
                    <div class="remove-color" style="
                        color: #e74c3c;
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 3px;
                        transition: background 0.2s;
                        font-size: 0.8rem;
                    " title="Remove this color">
                        Remove
                    </div>
                `;
                
                colorGrid.appendChild(colorItem);
                
                // Toggle selection on click
                const checkbox = colorItem.querySelector('.color-check');
                colorItem.addEventListener('click', (e) => {
                    if (!e.target.closest('.remove-color')) {
                        checkbox.checked = !checkbox.checked;
                        updateSelectedColors(checkbox, color);
                    }
                });
                
                // Remove color completely
                const removeBtn = colorItem.querySelector('.remove-color');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedColors.delete(color);
                    colorItem.style.display = 'none';
                    updateSelectedCount();
                });
                
                // Update on checkbox change
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    updateSelectedColors(checkbox, color);
                });
            });
        }
        
        function updateSelectedColors(checkbox, color) {
            if (checkbox.checked) {
                selectedColors.add(color);
                checkbox.parentElement.parentElement.style.borderColor = '#3498db';
                checkbox.parentElement.parentElement.style.background = '#f8f9fa';
            } else {
                selectedColors.delete(color);
                checkbox.parentElement.parentElement.style.borderColor = '#e0e0e0';
                checkbox.parentElement.parentElement.style.background = 'white';
            }
            updateSelectedCount();
        }
        
        function updateSelectedCount() {
            selectedCount.textContent = selectedColors.size;
            document.getElementById('confirmDownload').disabled = selectedColors.size === 0;
        }
        
        // Event listeners for popup
        document.getElementById('closeColorPopup').addEventListener('click', () => {
            document.body.removeChild(popup);
        });
        
        document.getElementById('cancelDownload').addEventListener('click', () => {
            document.body.removeChild(popup);
        });
        
        document.getElementById('confirmDownload').addEventListener('click', () => {
            document.body.removeChild(popup);
            downloadImageWithSelectedColors(selectedColors);
        });
        
        // Close popup when clicking outside
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                document.body.removeChild(popup);
            }
        });
    }
    
    // NEW: Download image with only selected colors
    function downloadImageWithSelectedColors(selectedColorsSet) {
        // Create a temporary canvas with higher resolution for better quality
        const scaleFactor = 2; // Double the resolution for better quality
        const tempCanvas = document.createElement('canvas');
        const footerHeight = 150 * scaleFactor; // Reduced height for smaller popup
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
        
        // Draw selected colors with proper spacing
        const startX = 20 * scaleFactor;
        const yPos = (houseCanvas.height * scaleFactor) + (20 * scaleFactor);
        const rowHeight = 35 * scaleFactor;
        const maxColorsPerRow = 3;
        const colorBlockWidth = (tempCanvas.width - (startX * 2)) / maxColorsPerRow;
        
        tempCtx.font = `bold ${11 * scaleFactor}px Arial, sans-serif`;
        tempCtx.fillStyle = '#495057';
        tempCtx.textAlign = 'left';
        tempCtx.fillText('Selected Colors:', startX, yPos - (10 * scaleFactor));
        
        // Display only selected colors
        let colorCount = 0;
        let currentRow = 0;
        
        const selectedColorsArray = Array.from(selectedColorsSet);
        
        for (const color of selectedColorsArray) {
            if (colorCount >= 6) break;
            
            const blockX = startX + (colorCount % maxColorsPerRow) * colorBlockWidth;
            const blockY = yPos + (currentRow * rowHeight);
            
            // Draw color circle
            tempCtx.fillStyle = color;
            tempCtx.beginPath();
            tempCtx.arc(blockX + (15 * scaleFactor), blockY, 10 * scaleFactor, 0, Math.PI * 2);
            tempCtx.fill();
            
            // Draw border around color circle
            tempCtx.strokeStyle = '#dee2e6';
            tempCtx.lineWidth = 1 * scaleFactor;
            tempCtx.stroke();
            
            // Draw color information
            tempCtx.font = `${9 * scaleFactor}px Arial, sans-serif`;
            tempCtx.fillStyle = '#495057';
            
            const colorName = allColors[color] || 'Custom Color';
            const colorCode = color.toUpperCase();
            
            const textStartX = blockX + (30 * scaleFactor);
            const availableWidth = colorBlockWidth - (30 * scaleFactor);
            
            // Draw color code
            tempCtx.font = `bold ${9 * scaleFactor}px Arial, sans-serif`;
            tempCtx.fillText(colorCode, textStartX, blockY - (6 * scaleFactor));
            
            // Draw color name with word wrap
            tempCtx.font = `${8 * scaleFactor}px Arial, sans-serif`;
            tempCtx.fillStyle = '#6c757d';
            
            const words = colorName.split(' ');
            let line = '';
            let lineCount = 0;
            const maxLines = 2;
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const metrics = tempCtx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > availableWidth && i > 0) {
                    tempCtx.fillText(line, textStartX, blockY + (4 * scaleFactor) + (lineCount * 10 * scaleFactor));
                    lineCount++;
                    
                    if (lineCount >= maxLines) {
                        if (i < words.length - 1) {
                            tempCtx.fillText(line + '...', textStartX, blockY + (4 * scaleFactor) + (lineCount * 10 * scaleFactor));
                        }
                        break;
                    }
                    line = words[i] + ' ';
                } else {
                    line = testLine;
                }
            }
            
            if (lineCount < maxLines) {
                tempCtx.fillText(line.trim(), textStartX, blockY + (4 * scaleFactor) + (lineCount * 10 * scaleFactor));
            }
            
            colorCount++;
            if ((colorCount % maxColorsPerRow) === 0) {
                currentRow++;
            }
        }
        
        // Draw watermark
        const watermarkY = (houseCanvas.height * scaleFactor) + footerHeight - (30 * scaleFactor);
        tempCtx.font = `italic ${9 * scaleFactor}px Arial, sans-serif`;
        tempCtx.fillStyle = '#6c757d';
        tempCtx.textAlign = 'center';
        tempCtx.fillText('More colors visit: https://www.apzok.com', tempCanvas.width / 2, watermarkY);
        
        // Draw disclaimer
        const disclaimerY = (houseCanvas.height * scaleFactor) + footerHeight - (15 * scaleFactor);
        tempCtx.font = `${8 * scaleFactor}px Arial, sans-serif`;
        tempCtx.fillStyle = '#868e96';
        tempCtx.fillText('Note: Visualizer colors may vary from actual paint and screen display', tempCanvas.width / 2, disclaimerY);
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'painted-house-with-colors.png';
        
        const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
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
