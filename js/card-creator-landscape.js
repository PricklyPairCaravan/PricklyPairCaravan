/**
 * Starving Artists Custom Card Creator
 * A clean implementation that allows users to create custom cards for the game
 */

// Constants and Configuration
const SCENE_WIDTH = 1725;
const SCENE_HEIGHT = 1125;
const SQUARE_SIZE = 75;
const DAUB_COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Black'];
const DAUB_POS = [0, 125, 225, 340, 450, 565, 680];

// State variables
let artLoaded = false;
let gridSize = 130; // Initial grid size for snap to grid
let stage, backgroundLayer, artLayer, daubLayer, textLayer;
let daubGroup, vitalGroup, artFrame;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add responsiveness when window resizes
window.addEventListener('resize', fitStageIntoParentContainer);

/**
 * Initialize the application
 */
function init() {
    console.log("Starting initialization");
    initializeStage();
    initializeGroups();
    loadImages();
    initializeTextElements();
    setupStageEvents();
    setupFormEvents();
    fitStageIntoParentContainer();
    
    // Force a redraw of all layers after a short delay
    setTimeout(() => {
        redraw();
        verifyFrameImage();
    }, 500);
}

/**
 * Initialize the Konva stage and layers
 */
function initializeStage() {
    // Create the main stage
    stage = new Konva.Stage({
        container: 'portraitCanvas',
        width: SCENE_WIDTH,
        height: SCENE_HEIGHT
    });

    // Create layers in the correct order for proper z-index
    artLayer = new Konva.Layer();         // Bottom layer: artwork and background
    daubLayer = new Konva.Layer();        // Middle layer: daubs/color squares
    backgroundLayer = new Konva.Layer();  // Top layer: frame template
    textLayer = new Konva.Layer();        // Top-most layer: text elements
    
    // Add layers to stage in the correct order
    stage.add(artLayer);
    stage.add(daubLayer);
    stage.add(backgroundLayer);
    stage.add(textLayer);
}

/**
 * Initialize Konva groups used to organize elements
 */
function initializeGroups() {
    // Art frame with clipping for uploaded artwork
    artFrame = new Konva.Group({
        x: 76,
        y: 76,
        stroke: 'blue',
        strokeWidth: 5,
        clip: {
            x: 0,
            y: 0,
            width: 976,
            height: 1500
        }
    });
    artLayer.add(artFrame);
    
    // Daub group for color squares
    daubGroup = new Konva.Group({
        x: 80,
        y: 80,
        width: 970,
        height: 1400
    });
    daubLayer.add(daubGroup);
    
    // Vital group for card information
    vitalGroup = new Konva.Group({
        x: 80,
        y: 1425,
        width: 970,
        height: 160
    });
    textLayer.add(vitalGroup); // Move to textLayer instead of backgroundLayer
    
    // Current pixel indicator
    const currentPixel = new Konva.Rect({
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        stroke: 'Black',
        strokeWidth: 1,
        visible: false,
        shadowColor: '#ffffff',
        shadowOffset: { x: 0, y: 0 },
        shadowEnabled: true,
        shadowOpacity: 0.8,
        shadowBlur: 5,
        name: 'currentPixel'
    });
    daubLayer.add(currentPixel);
}

/**
 * Load background and frame images
 */
function loadImages() {
    // Set up a Promise to track when both images are loaded
    const loadPromises = [];
    
    // Background image
    const bgPromise = new Promise((resolve) => {
        const bgImageObj = new Image();
        bgImageObj.onload = function() {
            const bgImg = new Konva.Image({
                x: 0,
                y: 0,
                image: bgImageObj,
                listening: false
            });
            artLayer.add(bgImg);
            bgImg.moveToBottom();
            resolve();
        };
        bgImageObj.src = '../images/starve/background-landscape.png';
    });
    loadPromises.push(bgPromise);

    // Frame image
    const framePromise = new Promise((resolve) => {
        const frameImageObj = new Image();
        frameImageObj.onload = function() {
            const frameImg = new Konva.Image({
                x: 0,
                y: 0,
                image: frameImageObj,
                name: 'frameImage',
                listening: false
            });
            backgroundLayer.add(frameImg);
            frameImg.cache();
            frameImg.drawHitFromCache();
            resolve();
        };
        frameImageObj.src = '../images/starve/portrait-bar-only.png';
    });
    loadPromises.push(framePromise);

    // When both images are loaded, draw the layers
    Promise.all(loadPromises).then(() => {
        console.log("All images loaded");
        redraw();
    }).catch(error => {
        console.error("Error loading images:", error);
    });
}

/**
 * Initialize text elements on the card
 */
function initializeTextElements() {
    // Create color count texts
    const countGroup = new Konva.Group({
        x: 160,
        y: 1600
    });

    DAUB_COLORS.forEach((color, i) => {
        const textbox = new Konva.Text({
            x: DAUB_POS[i],
            y: 0,
            width: 120,
            height: 70,
            name: 'Txt' + color,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1,
            fontSize: 75,
            text: '0',
            align: 'center',
            fontFamily: 'Ebrima Bold',
    fontStyle: 'bold'  // Add this line to make it bold
        });
        countGroup.add(textbox);
    });
    textLayer.add(countGroup);

    // Title text
    const titleText = new Konva.Text({
        x: 0,
        y: 0,
        width: 590,
        height: 70,
        name: 'TxtTitle',
        fill: 'white',
        fontFamily: 'Ebrima',
        fontStyle: 'bold',
        fontSize: 75,
        text: 'Unidentified artwork (2021)',
        align: 'left'
    });
    vitalGroup.add(titleText);

    // Artist text
    const artistText = new Konva.Text({
        x: 0,
        y: 75,
        width: 590,
        height: 70,
        name: 'TxtArtist',
        fill: 'white',
        fontFamily: 'Ebrima',
        fontStyle: 'normal',
        fontSize: 40,
        text: 'Unknown artist',
        align: 'left'
    });
    vitalGroup.add(artistText);

    // Food reward text
    const foodText = new Konva.Text({
        x: 610,
        y: 50,
        width: 90,
        height: 90,
        name: 'TxtFood',
        fill: '#4b4b4b',
        fontSize: 130,
        text: '1',
        align: 'right'
    });
    vitalGroup.add(foodText);

    // Paint reward text
    const paintText = new Konva.Text({
        x: 775,
        y: 50,
        width: 150,
        height: 90,
        name: 'TxtPaint',
        fill: '#4b4b4b',
        fontSize: 130,
        text: '1',
        align: 'right'
    });
    vitalGroup.add(paintText);

    // Stars/points reward text
    const starsText = new Konva.Text({
        x: 915,
        y: 90,
        width: 110,
        height: 120,
        name: 'TxtStars',
        fill: '#4b4b4b',
        fontSize: 110,
        text: '1',
        align: 'right'
    });
    textLayer.add(starsText); // Move to textLayer
}

/**
 * Set up event listeners for the stage
 */
function setupStageEvents() {
    // Mouse move to update color preview
    stage.on('mousemove touchmove', function(e) {
        if (!artLoaded) return;

        const pos = artLayer.getRelativePointerPosition();
        const ctx = artLayer.getCanvas().getContext();
        const pixelData = ctx.getImageData(
            pos.x * stage.getAbsoluteScale().x,
            pos.y * stage.getAbsoluteScale().y,
            1, 1
        ).data;
        
        const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        const currentPixel = daubLayer.findOne('.currentPixel');
        
        if (currentPixel) {
            currentPixel.fill(hex);
            currentPixel.x(pos.x + 40);
            currentPixel.y(pos.y - 40);
            currentPixel.show();
            daubLayer.draw();
        }
    });

    // Click to add a color square
    stage.on('click tap', function(e) {
        if (!artLoaded || e.target.name()?.includes('daub-')) return;
        
        const pos = artLayer.getRelativePointerPosition();
        const ctx = artLayer.getCanvas().getContext();
        const pixelData = ctx.getImageData(
            pos.x * stage.getAbsoluteScale().x,
            pos.y * stage.getAbsoluteScale().y,
            1, 1
        ).data;
        
        const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        addDaub(nearestColor(hex).name, pos.x - 76, pos.y - 76);
    });

    // Right click to delete a color square
    stage.on('contextmenu dbltap', function(e) {
        e.evt.preventDefault();
        
        if (e.target === stage || !artLoaded) return;
        
        if (e.target.name()?.includes('daub-')) {
            const color = capitalizeFirstLetter(e.target.name().split('-')[1]);
            
            // Remove the daub
            e.target.destroy();
            
            if (color !== 'Wild') {
                // Update count
                const txt = stage.find('.Txt' + color)[0];
                if (txt) {
                    txt.text(stage.find('.daub-' + color).length);
                }
                
                redraw();
            }
        }
    });
}

/**
 * Set up event listeners for form elements
 */
function setupFormEvents() {
    // Source image change
    document.getElementById('sourceImage').addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const artImageObj = new Image();
            artImageObj.onload = function() {
                // Clear existing art and daubs
                artFrame.destroyChildren();
                daubGroup.destroyChildren();
                
                // Create new art image
                const artImg = new Konva.Image({
                    image: artImageObj,
                    draggable: true,
                    name: 'ArtImage'
                });
                
                // Enable saturation filter
                artImg.cache();
                artImg.filters([Konva.Filters.HSL]);
                
                // Add to stage
                artFrame.add(artImg);
                artLoaded = true;
                
                // Set initial scale
                const scaleValue = document.getElementById('ArtScale').value;
                artImg.scaleX(parseFloat(scaleValue) / 100);
                artImg.scaleY(parseFloat(scaleValue) / 100);
                
                redraw();
            };
            artImageObj.src = URL.createObjectURL(this.files[0]);
        }
    });

    // Art scale slider
    document.getElementById('ArtScale').addEventListener('input', updateArtScale);
    
    // Text input fields
    document.getElementById('Title').addEventListener('keyup', function() {
        updateText('TxtTitle', this.value);
    });
    
    document.getElementById('Artist').addEventListener('keyup', function() {
        updateText('TxtArtist', this.value);
    });
    
    // Select dropdowns
    document.getElementById('Food').addEventListener('change', function() {
        updateText('TxtFood', this.value);
    });
    
    document.getElementById('Paints').addEventListener('change', function() {
        updateText('TxtPaint', this.value);
    });
    
    document.getElementById('Points').addEventListener('change', function() {
        updateText('TxtStars', this.value);
    });
    
    // Snap to grid checkbox
    document.getElementById('SnapGrid').addEventListener('change', function() {
        gridSize = this.checked ? 130 : 1;
    });
    
    // Clear button
    document.getElementById('btnClear').addEventListener('click', function() {
        daubGroup.destroyChildren();
        
        DAUB_COLORS.forEach(color => {
            updateText('Txt' + color, '0');
        });
        
        redraw();
    });
    
    // Download button
    document.getElementById('btnDownload').addEventListener('click', function() {
        const dataURL = stage.toDataURL({
            pixelRatio: SCENE_WIDTH / document.querySelector('#stage-parent').offsetWidth
        });
        
        const artist = document.getElementById('Artist').value || 'Unknown';
        const title = document.getElementById('Title').value || 'Untitled';
        downloadURI(dataURL, `${artist} - ${title}.png`);
    });
    
    // Saturation slider
    document.getElementById('saturation').addEventListener('input', function() {
        if (!artLoaded) return;
        
        const artImg = stage.find('.ArtImage')[0];
        artImg.saturation(parseFloat(this.value));
        redraw();
    });
    
    // Saturation reset button
    document.getElementById('saturation-reset').addEventListener('click', function() {
        if (!artLoaded) return;
        
        document.getElementById('saturation').value = 0;
        const artImg = stage.find('.ArtImage')[0];
        artImg.saturation(0);
        redraw();
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!artLoaded) return;
            
            const color = this.getAttribute('data-color');
            
            if (color === 'wild') {
                addWild();
            } else {
                // Add in center of visible canvas
                const container = document.querySelector('#stage-parent');
                const x = container.offsetWidth / 2;
                const y = container.offsetHeight / 2;
                addDaub(capitalizeFirstLetter(color), x - 76, y - 76);
            }
        });
    });
}

/**
 * Add a colored daub (square) to the canvas
 */
function addDaub(color, x, y) {
    if (!artLoaded) return;
    
    // Validate position is within bounds
    if (x > daubGroup.width() || x < 0 || y > daubGroup.height() || y < 0) return;
    
    color = capitalizeFirstLetter(color).trim();
    
    const imageObj = new Image();
    imageObj.onload = function() {
        // Get color from filename
        const imgColor = capitalizeFirstLetter(
            this.src.substring(this.src.lastIndexOf('/') + 1).split('.')[0]
        );
        
        // Create the daub image
        const image = new Konva.Image({
            x: Math.round((x - 40) / gridSize) * gridSize,
            y: Math.round((y - 40) / gridSize) * gridSize,
            opacity: 60,
            image: imageObj,
            draggable: true,
            name: 'daub-' + imgColor
        });
        
        // Setup drag end behavior
        setupDaubDragEnd(image, imgColor);
        
        // Update count if not wild
        if (imgColor !== 'Wild') {
            const txt = stage.find('.Txt' + imgColor)[0];
            if (txt) {
                txt.text(stage.find('.daub-' + imgColor).length + 1);
            }
        }
        
        // Add to stage and redraw
        daubGroup.add(image);
        redraw();
    };
    
    imageObj.src = '../images/starve/' + color.toLowerCase() + '.png';
}

/**
 * Add a wild square to the canvas
 */
function addWild() {
    if (!artLoaded) return;
    
    // Place in center of visible area
    const container = document.querySelector('#stage-parent');
    const x = container.offsetWidth / 2;
    const y = container.offsetHeight / 2;
    
    const imageObj = new Image();
    imageObj.onload = function() {
        const image = new Konva.Image({
            x: Math.round((x) / gridSize) * gridSize - 25,
            y: Math.round((y) / gridSize) * gridSize - 25,
            opacity: 60,
            image: imageObj,
            draggable: true,
            name: 'daub-Wild'
        });
        
        // Setup drag end behavior
        setupDaubDragEnd(image, 'Wild');
        
        daubGroup.add(image);
        redraw();
    };
    
    imageObj.src = '../images/starve/wild.png';
}

/**
 * Setup drag end behavior for daubs
 */
function setupDaubDragEnd(image, color) {
    image.on('dragend', () => {
        // Snap to grid
        image.position({
            x: Math.round(image.x() / gridSize) * gridSize,
            y: Math.round(image.y() / gridSize) * gridSize
        });
        
        // Check if out of bounds
        const container = document.querySelector('#stage-parent');
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const scale = SCENE_WIDTH / containerWidth;
        
        if ((image.x() < 0 || image.x() > containerWidth * scale) ||
            (image.y() < 0 || image.y() > containerHeight * scale)) {
            
            // Destroy if out of bounds
            image.destroy();
            
            // Update count if not wild
            if (color !== 'Wild') {
                const txt = stage.find('.Txt' + color)[0];
                if (txt) {
                    txt.text(stage.find('.daub-' + color).length);
                }
            }
        }
        
        redraw();
    });
}

/**
 * Update the scale of the art image
 */
function updateArtScale() {
    if (!artLoaded) return;
    
    const img = stage.find('.ArtImage')[0];
    if (!img) return;
    
    const value = parseFloat(document.getElementById('ArtScale').value) / 100;
    
    img.scaleX(value);
    img.scaleY(value);
    redraw();
}

/**
 * Update text element by name
 */
function updateText(elementName, value) {
    const textElement = stage.find('.' + elementName)[0];
    if (textElement) {
        textElement.text(value);
        redraw();
    }
}

/**
 * Convert RGB component to hex
 */
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Convert RGB values to hex color string
 */
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Redraw all layers
 */
function redraw() {
    artLayer.draw();
    daubLayer.draw();
    backgroundLayer.draw();
textLayer.moveToTop();
    textLayer.draw(); // Added textLayer to redraw
}

/**
 * Verify that the frame image is loaded
 */
function verifyFrameImage() {
    const frameImage = backgroundLayer.find('.frameImage')[0];
    
    if (!frameImage) {
        console.warn("Frame image not found - attempting to reload");
        loadFrameImageDirectly();
    }
}

/**
 * Fallback function to load frame directly
 */
function loadFrameImageDirectly() {
    const frameImageObj = new Image();
    frameImageObj.onload = function() {
        const frameImg = new Konva.Image({
            x: 0,
            y: 0,
            image: frameImageObj,
            name: 'frameImage',
            listening: false
        });
        backgroundLayer.add(frameImg);
        frameImg.cache();
        frameImg.drawHitFromCache();
        backgroundLayer.draw();
        console.log("Frame reloaded directly");
    };
    frameImageObj.onerror = function() {
        console.error("Failed to load frame image");
    };
    frameImageObj.src = '../images/starve/portrait-bar-only.png';
}

/**
 * Download a data URI as a file
 */
function downloadURI(uri, name) {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Fit the stage into the parent container
 */
function fitStageIntoParentContainer() {
    const container = document.querySelector('#stage-parent');
    const containerWidth = container.offsetWidth;
    const containerHeight = document.querySelector('#controls')?.offsetHeight || window.innerHeight - 200;
    
    // Calculate scale based on both width and height constraints
    const scaleByWidth = containerWidth / SCENE_WIDTH;
    const scaleByHeight = containerHeight / SCENE_HEIGHT;
    
    // Use the smaller scale to ensure it fits both dimensions
    const scale = Math.min(scaleByWidth, scaleByHeight) * 0.9; // 0.9 adds some padding
    
    stage.width(SCENE_WIDTH * scale);
    stage.height(SCENE_HEIGHT * scale);
    stage.scale({ x: scale, y: scale });
    
    redraw();
}