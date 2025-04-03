/**
 * Color mapping and utilities for the Starving Artists Card Creator
 */

// Define the base colors for the game
const baseColors = [
    { hex: '#000000', name: 'Black' },
    
    // Red variants
    { hex: '#ff0000', name: 'Red' },
    { hex: '#FFA07A', name: 'Red' },
    { hex: '#CC0066', name: 'Red' },
    
    // Orange variants
    { hex: '#ffa500', name: 'Orange' },
    { hex: '#BC8F8F', name: 'Orange' },
    { hex: '#FF4500', name: 'Orange' },
    { hex: '#FFDAB9', name: 'Orange' },
    { hex: '#DAA520', name: 'Orange' },
    
    // Yellow variants
    { hex: '#ffff00', name: 'Yellow' },
    { hex: '#FAFAD2', name: 'Yellow' },
    { hex: '#F5DEB3', name: 'Yellow' },
    
    // Blue variants
    { hex: '#CCE5FF', name: 'Blue' },
    { hex: '#6495ED', name: 'Blue' },
    { hex: '#0000ff', name: 'Blue' },
    { hex: '#1E90FF', name: 'Blue' },
    { hex: '#40E0D0', name: 'Blue' },
    { hex: '#33ffff', name: 'Blue' },
    { hex: '#4b0082', name: 'Blue' },
    
    // Green variants
    { hex: '#32CD32', name: 'Green' },
    { hex: '#008000', name: 'Green' },
    { hex: '#556B2F', name: 'Green' },
    
    // Violet variants
    { hex: '#880088', name: 'Violet' },
    { hex: '#cc99ff', name: 'Violet' },
    { hex: '#ee82ee', name: 'Violet' },
    { hex: '#800080', name: 'Violet' },
    { hex: '#9933ff', name: 'Violet' }
];

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code
 * @returns {object|null} Object with r, g, b values or null if invalid
 */
function hexToRgb(hex) {
    // Handle shorthand hex format (e.g. #ABC instead of #AABBCC)
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    // Parse the hex string to RGB values
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Calculate distance between two RGB colors (Euclidean distance)
 * @param {object} a - First color with r, g, b properties
 * @param {object} b - Second color with r, g, b properties
 * @returns {number} - Distance between the colors
 */
function distance(a, b) {
    return Math.sqrt(
        Math.pow(a.r - b.r, 2) + 
        Math.pow(a.g - b.g, 2) + 
        Math.pow(a.b - b.b, 2)
    );
}

/**
 * Find the nearest color from our base colors
 * @param {string} colorHex - Hex color code to match
 * @returns {object} The nearest base color object with hex and name
 */
function nearestColor(colorHex) {
    // Check for valid input
    const targetRgb = hexToRgb(colorHex);
    if (!targetRgb) return baseColors[0]; // Default to black if invalid
    
    let lowestDistance = Number.POSITIVE_INFINITY;
    let closestColorIndex = 0;
    
    // Find closest color by distance
    baseColors.forEach((color, index) => {
        const colorRgb = hexToRgb(color.hex);
        if (!colorRgb) return; // Skip if color conversion fails
        
        const colorDistance = distance(targetRgb, colorRgb);
        if (colorDistance < lowestDistance) {
            lowestDistance = colorDistance;
            closestColorIndex = index;
        }
    });
    
    return baseColors[closestColorIndex];
}