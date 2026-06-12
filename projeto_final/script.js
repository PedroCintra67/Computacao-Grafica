/* C:\codigos\Computação Gráfica\projeto_final\script.js */

let myShader;
let nameplateGraphics;

// Customization States
let currentBelt = 'white';
let currentGiColor = 'white';
let currentDegrees = 0;
let activeCamMode = 'front';

// Camera position vectors for smooth interpolation (lerping)
let rashguardTex;
let helioImg, carlosImg;
let wallTextTex;
let celShadingMode = 0; // 0 = Blinn-Phong, 1 = Cel/Toon shading

let camPos, camLook;
let targetCamPos, targetCamLook;

// Manual Orbit controls state
let orbitRadius = 700;
let orbitRadiusTarget = 700;
const ORBIT_MIN = 200;
const ORBIT_MAX = 900;
let orbitRotX = 0.1; // elevation angle
let orbitRotY = 0.0; // azimuth angle
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function preload() {
    // Load WebGL shaders
    myShader = loadShader('vert.glsl', 'frag.glsl');
    // Load Helio Gracie picture
    helioImg = loadImage('helio.jpg');
    carlosImg = loadImage('carlos.jpg');
}

function setup() {
    // Mount the WebGL canvas inside the container
    let container = document.getElementById('canvas-container');
    let w = container.clientWidth || 700;
    let h = container.clientHeight || 550;
    let canvas = createCanvas(w, h, WEBGL);
    canvas.parent('canvas-container');
    
    // Create the offscreen 2D buffer for the dynamic nameplate text
    // Dimensions are 512x128 (exact 4:1 aspect ratio)
    nameplateGraphics = createGraphics(512, 128);
    
    // Initialize Rashguard texture
    rashguardTex = createGraphics(1024, 1024);
    rashguardTex.background(20); // Dark grey
    rashguardTex.fill(255);      // White text
    rashguardTex.textAlign(CENTER, CENTER);
    rashguardTex.textSize(60);
    rashguardTex.textStyle(BOLD);
    // Draw on the front chest: U=0.25 -> X=256, V (chest area) is roughly halfway up the top repeat -> Y=256
    rashguardTex.text("JIU\nJITSU", 256, 256); 
    
    // Generate text for the wall (tall canvas: BRAZILIAN on top, JIU JITSU below)
    wallTextTex = createGraphics(800, 320);
    wallTextTex.clear(); // Make background transparent
    wallTextTex.fill(20, 15, 10); // Very dark almost black color
    wallTextTex.textAlign(CENTER, CENTER);
    wallTextTex.textStyle(BOLD);
    wallTextTex.textFont('sans-serif');
    // BRAZILIAN on top — slightly smaller so it fits in one line
    wallTextTex.textSize(100);
    wallTextTex.text('BRAZILIAN', 400, 50);
    // JIU JITSU below
    wallTextTex.textSize(120);
    wallTextTex.text('JIU - JITSU', 400, 180);
    
    // Initialize camera vectors
    camPos = createVector(0, 40, 460);
    camLook = createVector(0, 30, 0);
    targetCamPos = camPos.copy();
    targetCamLook = camLook.copy();
    
    // Register UI control event listeners
    setupControlEvents();
    
    // Render initial nameplate text & graduation
    updateGraduation(0.0);
    
    // Adjust size on window resize
    window.addEventListener('resize', onWindowResize);
}

// Toggle between Blinn-Phong and Cel Shading rendering modes
function setCelShading(mode) {
    celShadingMode = mode;
    document.getElementById('btn-blinnphong').classList.toggle('active', mode === 0);
    document.getElementById('btn-cel').classList.toggle('active', mode === 1);
}

function draw() {
    background(230, 235, 240); // Bright room environment
    
    // Display FPS in HTML panel
    let fps = frameRate();
    document.getElementById('fps-counter').innerText = 'FPS: ' + (fps ? Math.round(fps) : '--');
    
    // 1. CONSTANT LIGHTING DIRECTION
    let uLightDir = [0.45, 0.55, 0.7];
    
    // 2. CAMERA AND ORBIT LOGIC
    updateCameraPosition();
    
    // Apply camera
    camera(camPos.x, camPos.y, camPos.z, camLook.x, camLook.y, camLook.z, 0, -1, 0);
    
    // 3. SET SHADER UNIFORMS
    shader(myShader);
    myShader.setUniform('uLightDir', uLightDir);
    myShader.setUniform('uCelShading', celShadingMode);
    
    // 4. DRAW ENVIRONMENT AND MODEL
    drawEnvironment();
    drawKimonoTorso(rashguardTex);
    drawBeltAndKnot();
}

// -------------------------------------------------------------
// TROPHY GEOMETRY AND PARTS
// -------------------------------------------------------------

// Draw the room environment: large tatami floor, wall, plants, and Helio Gracie picture
function drawEnvironment() {
    // TATAMI FLOOR
    myShader.setUniform('uMaterialType', 5);
    myShader.setUniform('uBaseColor', [0.97, 0.97, 0.95]); // Pure white tatami
    
    // Main tatami floor (huge)
    push();
    translate(0, -112, 0); // Floor is below the pedestal
    box(2000, 10, 2000);
    pop();
    
    // BACK WALL
    myShader.setUniform('uMaterialType', 4); // Matte solid material
    myShader.setUniform('uBaseColor', [0.35, 0.20, 0.10]); // Brown wall
    push();
    translate(0, 300, -350); // Wall in the back
    box(2000, 1000, 20);
    pop();
    
    // HELPER FUNCTION FOR PICTURE FRAMES
    let drawPictureFrame = function(img, x, z) {
        // PICTURE FRAME (Wood/Dark border)
        myShader.setUniform('uMaterialType', 4);
        myShader.setUniform('uBaseColor', [0.1, 0.08, 0.05]); // Dark wood
        push();
        translate(x, 250, z - 3); 
        box(160, 200, 5);
        pop();
        
        // PICTURE
        myShader.setUniform('uMaterialType', 6);
        myShader.setUniform('tex', img);
        push();
        translate(x, 250, z);
        plane(145, 185);
        pop();
    };
    
    // Carlos Gracie on the Left, Helio Gracie on the Right (moved further apart)
    drawPictureFrame(carlosImg, -320, -335);
    drawPictureFrame(helioImg, 320, -335);
    
    // WALL TEXT (JIU JITSU)
    myShader.setUniform('uMaterialType', 6);
    myShader.setUniform('tex', wallTextTex);
    push();
    translate(0, 250, -339); // Placed slightly off the wall face (-340)
    scale(-1, 1, 1); // Flip horizontally because WebGL planes mirror textures
    plane(400, 160);
    pop();
    
    drawPedestalBase();
    drawNameplate();
}

// Draw the stepped trophy base
function drawPedestalBase() {
    // Material Type 0: Polished Black Obsidian/Marble
    myShader.setUniform('uMaterialType', 0);
    myShader.setUniform('uBaseColor', [0.06, 0.07, 0.09]);
    
    // Bottom trim (Box 1)
    push();
    translate(0, -95, 0);
    box(220, 15, 220);
    pop();
    
    // Main block (Box 2)
    push();
    translate(0, -50, 0);
    box(200, 80, 200);
    pop();
    
    // Top trim (Box 3)
    push();
    translate(0, -5, 0);
    box(210, 10, 210);
    pop();
}

// Draw decorative background plants (bamboo pots)
function drawPlants() {
    myShader.setUniform('uMaterialType', 4);
    
    let drawPottedPlant = function(x, z) {
        push();
        translate(x, 0, z);
        
        // Pot
        myShader.setUniform('uBaseColor', [0.8, 0.8, 0.8]); // White concrete pot
        push();
        translate(0, -80, 0);
        rotateX(HALF_PI);
        cylinder(30, 60);
        pop();
        
        // Bamboo stalks
        myShader.setUniform('uBaseColor', [0.2, 0.6, 0.2]); // Green bamboo
        for (let i = -1; i <= 1; i++) {
            push();
            translate(i * 10, -10, i * 5);
            rotateZ(radians(i * 5));
            rotateX(HALF_PI);
            cylinder(4, 250);
            pop();
        }
        
        // Leaves (spheres to represent leaf clusters)
        myShader.setUniform('uBaseColor', [0.15, 0.5, 0.15]); // Darker green leaves
        push();
        translate(0, 90, 0);
        sphere(40);
        translate(-20, -40, 10);
        sphere(30);
        translate(40, 20, -20);
        sphere(35);
        pop();
        
        pop();
    };
    
    // Draw two plants in the background corners
    drawPottedPlant(-250, -250);
    drawPottedPlant(250, -250);
}

// Draw the dynamic metal nameplate
function drawNameplate() {
    // Material Type 3: Dynamic Texture Plaque
    myShader.setUniform('uMaterialType', 3);
    myShader.setUniform('tex', nameplateGraphics);
    
    // Positioned flat on the front face of the main pedestal
    push();
    translate(0, -45, 101.5);
    box(160, 40, 4);
    pop();
}

// Draw the Gi (Kimono) Torso
// drawKimonoTorso is now imported from kimono.js

// Draw the belt around the waist using segments for ALL belt types.
// All belts use box segments rotating around the waist (same visual as coral).
// The front segment (angle ≈ 0) is skipped — replaced by the knot.
// Knot + hanging ends form an X at the FRONT of the body.
function drawBeltAndKnot() {
    myShader.setUniform('uMaterialType', 2);
    
    let beltColor = getBeltColorValue(currentBelt);
    let beltY = 68;       
    let beltRadiusZ = 36; // Match the new belt's Z radius (34) + 2 so knot isn't floating
    let numSeg = 14;       // number of segments for a full wrap
    // Segment arc width: circumference / numSeg, with slight overlap
    let segW = 26;
    let segH = 13;
    let segD = 5;
    
    // Global Belt Transform
    push();
    
    // 1. PROCEDURAL BELT WRAP
    let beltStyle = 0; // Solid
    if (currentBelt === 'coral') beltStyle = 1;
    else if (currentBelt === 'coral-white') beltStyle = 2;
    
    myShader.setUniform('uBeltStyle', beltStyle);
    myShader.setUniform('uBaseColor', beltColor);
    
    push();
    noStroke();
    if (typeof proceduralBeltGeom !== 'undefined' && proceduralBeltGeom) {
        model(proceduralBeltGeom);
    }
    pop();
    
    // Reset style for the knot and hanging ends
    myShader.setUniform('uBeltStyle', 0);
    
    // Apply tilt and push specifically for Knot and Hanging Ends
    translate(0, beltY, 0);
    rotateX(radians(-5)); // Tilt forward
    translate(0, 0, 2);   // Push slightly forward to prevent lapel clipping
    translate(0, -beltY, 0);
    
    // 2. CENTRAL KNOT — placed at the front of the waist (angle=0, Z = +beltRadiusZ)
    // Use the main belt color for knot body
    myShader.setUniform('uBaseColor', beltColor);
    
    // Main knot block
    push();
    translate(0, beltY, beltRadiusZ);
    box(26, 18, 16); // Increased width and depth
    pop();
    
    // Diagonal cross-piece on top of knot (adds dimension)
    push();
    translate(0, beltY + 1, beltRadiusZ + 4);
    rotateY(radians(12));
    box(30, 10, 8);
    pop();
    
    // 3. TWO HANGING ENDS — hang DOWN from the knot in an X shape (like photo)
    let frontZ = beltRadiusZ + 4;  // Push them further forward so they don't clip into body
    
    // ===== RIGHT HANGING END =====
    push();
    translate(0, beltY, frontZ);
    rotateZ(radians(38));    // lean diagonally right-down
    rotateY(radians(-8));    // slight angle so it faces front
    
    if (currentBelt === 'coral' || currentBelt === 'coral-white') {
        myShader.setUniform('uBaseColor', [0.78, 0.08, 0.08]);
    } else {
        myShader.setUniform('uBaseColor', beltColor);
    }
    translate(0, -39, 0);   // center of strip is 39 below the knot
    box(12, 78, 6);
    pop();
    
    // ===== LEFT HANGING END (with rank sleeve + degree stripes) =====
    push();
    translate(0, beltY, frontZ);
    rotateZ(radians(-38));   // lean diagonally left-down
    rotateY(radians(8));
    
    let leftBeltColor = beltColor;
    if (currentBelt === 'coral') {
        leftBeltColor = [0.12, 0.12, 0.12]; // Black hanging end
    } else if (currentBelt === 'coral-white') {
        leftBeltColor = [0.95, 0.92, 0.78]; // White hanging end (off-white to match wrap)
    }
    
    // Upper belt-color section
    myShader.setUniform('uBaseColor', leftBeltColor);
    translate(0, -10, 0);
    box(12, 18, 6);

    // --- RANK SLEEVE ---
    // BJJ official colors for the rank sleeve (tarja):
    //   white/blue/purple/brown → BLACK sleeve, no special ends
    //   black belt              → RED sleeve, no special ends
    //   coral (red/black)       → WHITE sleeve + GRAY ends
    //   coral-white (red/white) → RED sleeve + GRAY ends
    //   red / red-gracie        → RED sleeve + DARK-GOLD ends
    
    let thk = 1.2;   // stripe thickness (thinner to widen gaps)
    let gap = 2.0;   // gap between stripes (not actually used due to slotH math, but kept for reference)
    let n = currentDegrees;
    
    // Sleeve sizes — white-brown raised to 32 to match black belt sleeve size
    // Sleeve sizes 
    let sleeveH;
    let sleeveMainColor;
    let endColor = null;  // null = no special end marks
    
    if (currentBelt === 'white' || currentBelt === 'blue' ||
        currentBelt === 'purple' || currentBelt === 'brown') {
        sleeveH = 50.0; // Increased to match the other belts so length is equal
        sleeveMainColor = [0.10, 0.10, 0.10]; // black sleeve, no ends
    } else if (currentBelt === 'black') {
        sleeveH = 50.0;
        sleeveMainColor = [0.80, 0.08, 0.08]; // red sleeve
        endColor = [0.95, 0.95, 0.95];        // white ends
    } else if (currentBelt === 'coral') {
        sleeveH = 50.0;
        sleeveMainColor = [0.80, 0.08, 0.08]; // RED sleeve
        endColor = [0.95, 0.95, 0.95];        // white ends
    } else if (currentBelt === 'coral-white') {
        sleeveH = 50.0;
        sleeveMainColor = [0.80, 0.08, 0.08]; // red sleeve
        endColor = [0.52, 0.52, 0.56];        // gray ends
    } else {
        // red — red sleeve + dark gold ends
        sleeveH = 50.0;
        sleeveMainColor = [0.80, 0.08, 0.08]; // red sleeve
        endColor = [0.80, 0.65, 0.15];        // dark-gold ends
    }
    
    // Translate from upper-belt center to sleeve center (perfectly flush, no gap)
    let sleeveCenterOffset = -(9 + sleeveH / 2);
    translate(0, sleeveCenterOffset, 0);
    
    // Draw sleeve body
    myShader.setUniform('uBaseColor', sleeveMainColor);
    box(12.5, sleeveH, 6.5);
    
    // Extremity marks at both ends of the sleeve
    if (endColor !== null) {
        myShader.setUniform('uBaseColor', endColor);
        // Tip-side end
        push();
        translate(0, -(sleeveH / 2) + 2.5, 0.6);
        box(12.6, 5, 6.7);
        pop();
        // Center-side end
        push();
        translate(0, (sleeveH / 2) - 2.5, 0.6);
        box(12.6, 5, 6.7);
        pop();
    }
    
    // --- DEGREE STRIPES ---
    // The sleeve is divided into FIXED SLOTS based on the maximum degrees possible.
    // Slot 0 = TIP side, slot (maxN-1) = CENTER side.
    // Earned stripes fill slots 0..n-1 — positions never shift as more degrees are added.
    //
    // slotH = usableH / maxN
    // stripe i center = usableStart + slotH/2 + i * slotH
    if (n > 0) {
        myShader.setUniform('uBaseColor', [0.98, 0.98, 0.98]); // white stripes for all
        
        // Usable area (reserves 5 units at each end if end-marks are present)
        let usableStart = (endColor !== null) ? -(sleeveH / 2) + 5.0 : -(sleeveH / 2);
        let usableH     = (endColor !== null) ? sleeveH - 10.0        : sleeveH;
        
        // Max degrees per belt type → determines slot count
        let maxN;
        if      (currentBelt === 'white' || currentBelt === 'blue' ||
                 currentBelt === 'purple'|| currentBelt === 'brown')  maxN = 4;
        else if (currentBelt === 'black')                              maxN = 6;
        else if (currentBelt === 'coral')                             maxN = 7;
        else if (currentBelt === 'coral-white')                       maxN = 8;
        else                                                          maxN = 9; // red (max 9)
        
        let slotH = usableH / maxN;           // fixed height per slot
        let slot0 = usableStart + slotH / 2;  // center of first slot (tip side)
        
        for (let i = 0; i < n; i++) {
            push();
            translate(0, slot0 + i * slotH, 0.6); // i=0=tip, i=n-1=center
            box(10, thk, 7);
            pop();
        }
    }
    
    // Belt tip just below sleeve (perfectly flush, no gap)
    translate(0, -(sleeveH / 2.0 + 5.0), 0);
    myShader.setUniform('uBaseColor', leftBeltColor);
    box(12, 10, 6);
    
    pop();
}

// Helper function to return colors as [R, G, B] normalized between 0.0 and 1.0

function getBeltColorValue(beltName) {
    switch (beltName) {
        case 'white':        return [0.98, 0.98, 0.98];
        case 'blue':         return [0.08, 0.35, 0.85];
        case 'purple':       return [0.45, 0.18, 0.75];
        case 'brown':        return [0.36, 0.22, 0.15];
        case 'black':        return [0.12, 0.12, 0.12];
        case 'coral':        return [0.78, 0.08, 0.08]; // primary red
        case 'coral-white':  return [0.78, 0.08, 0.08]; // red
        case 'red':          return [0.85, 0.08, 0.08];
        case 'red-gracie':   return [0.85, 0.08, 0.08];
        default:             return [0.98, 0.98, 0.98];
    }
}

// -------------------------------------------------------------
// INTERACTIVE TEXTURE (2D Buffer)
// -------------------------------------------------------------

function updateNameplateText() {
    nameplateGraphics.resetMatrix();
    nameplateGraphics.translate(512, 128);
    nameplateGraphics.scale(-1, -1);

    // Set gold base background
    nameplateGraphics.background(212, 175, 55);
    
    // Frame borders
    nameplateGraphics.stroke(18, 22, 28);
    nameplateGraphics.strokeWeight(8);
    nameplateGraphics.noFill();
    nameplateGraphics.rect(10, 10, 512 - 20, 128 - 20, 10);
    
    nameplateGraphics.stroke(245, 235, 185); // metallic shining border
    nameplateGraphics.strokeWeight(2.5);
    nameplateGraphics.rect(17, 17, 512 - 34, 128 - 34, 8);
    
    // Name text engraving
    nameplateGraphics.noStroke();
    nameplateGraphics.fill(18, 22, 28); // engraved black text
    nameplateGraphics.textAlign(CENTER, CENTER);
    nameplateGraphics.textFont('Georgia');
    
    // Primary Name
    nameplateGraphics.textStyle(BOLD);
    nameplateGraphics.textSize(36);
    let nameText = document.getElementById('input-name').value.toUpperCase();
    nameplateGraphics.text(nameText || "SEU NOME AQUI", 256, 46);
    
    // Subtitle / Rank Description
    nameplateGraphics.textStyle(ITALIC);
    nameplateGraphics.textSize(20);
    let subText = document.getElementById('input-subtitle').value;
    nameplateGraphics.text(subText || "Jiu-Jitsu Champion", 256, 88);
}

// -------------------------------------------------------------
// FORMAT YEARS AS "X anos e Y meses"
// -------------------------------------------------------------

function formatYears(years) {
    let totalMonths = Math.round(years * 12);
    let yrs = Math.floor(totalMonths / 12);
    let months = totalMonths % 12;
    
    if (yrs === 0 && months === 0) return '0 meses';
    if (yrs === 0) return months + (months === 1 ? ' mês' : ' meses');
    if (months === 0) return yrs + (yrs === 1 ? ' ano' : ' anos');
    return yrs + (yrs === 1 ? ' ano' : ' anos') + ' e ' + months + (months === 1 ? ' mês' : ' meses');
}

// -------------------------------------------------------------
// QUERY PANEL: how long to reach a specific belt/degree
// -------------------------------------------------------------

// Returns the minimum years to reach a given belt + degree
function getMinYearsForBeltDegree(belt, degree) {
    // Timeline (in years):
    // White:  0.0  → 2.0  (4 degrees, each 0.4 yr = 4.8 months)
    // Blue:   2.0  → 4.0  (4 degrees, each 0.4 yr)
    // Purple: 4.0  → 5.5  (4 degrees, each 0.375 yr = 4.5 months)
    // Brown:  5.5  → 7.0  (4 degrees, each 0.375 yr)
    // Black:  7.0  → 32.0 (6 degrees, special timing)
    // Coral (7°): 32.0  → 39.0
    // Coral-white (8°): 39.0 → 46.0
    // Red (9°): 46.0 → 56.0
    // Red-Gracie (10°): 56.0+
    
    let beltStarts = {
        'white':       0.0,
        'blue':        2.5,
        'purple':      5.0,
        'brown':       6.5,
        'black':       8.0,
        'coral':       39.0,
        'coral-white': 46.0,
        'red':         56.0
    };
    
    let degreeTimeWithinBelt = 0;
    
    switch(belt) {
        case 'white':
        case 'blue':
            degreeTimeWithinBelt = degree * 0.5; // 4 degrees over 2.5 years (0.5yr step)
            break;
        case 'purple':
        case 'brown':
            degreeTimeWithinBelt = degree * 0.3; // 4 degrees in 1.5 years (0.3yr step)
            break;
        case 'black': {
            // Black belt special timing
            let blackDegreeYears = [0, 3, 6, 9, 14, 19, 24];
            degreeTimeWithinBelt = blackDegreeYears[Math.min(degree, 6)];
            break;
        }
        case 'coral':
        case 'coral-white':
        case 'red':
            degreeTimeWithinBelt = 0; // Fixed degree, no sub-degrees
            break;
        default:
            degreeTimeWithinBelt = 0;
    }
    
    return (beltStarts[belt] || 0) + degreeTimeWithinBelt;
}

function updateQueryPanel() {
    let belt = document.getElementById('query-belt').value;
    let degree = parseInt(document.getElementById('query-degree').value);
    
    let minYears = getMinYearsForBeltDegree(belt, degree);
    
    let beltDisplayNames = {
        'white':       'Branca',
        'blue':        'Azul',
        'purple':      'Roxa',
        'brown':       'Marrom',
        'black':       'Preta',
        'coral':       'Coral (Vermelha/Preta)',
        'coral-white': 'Coral (Vermelha/Branca)',
        'red':         'Vermelha'
    };
    let beltName = beltDisplayNames[belt] || belt;
    let formatted = formatYears(minYears);
    
    document.getElementById('query-result').innerHTML =
        'Faixa <b style="color:#fff;">' + beltName + '</b>' +
        ' · <b style="color:#fff;">' + degree + '° grau</b>' +
        ': mínimo de <b style="color:#d4af37;">' + formatted + '</b> de treino.';
}

// -------------------------------------------------------------
// EVENT LISTENERS & CAMERA PRESETS
// -------------------------------------------------------------

function setupControlEvents() {
    // 1. Name Input listeners
    document.getElementById('input-name').addEventListener('input', updateNameplateText);
    document.getElementById('input-subtitle').addEventListener('input', updateNameplateText);
    
    // 2. Kimono color buttons
    let giBtns = document.querySelectorAll('.gi-btn');
    giBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            giBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentGiColor = this.getAttribute('data-color');
        });
    });
    
    // 3. Belt selection buttons
    let beltBtns = document.querySelectorAll('.belt-btn');
    let beltStartYears = {
        'white':       0.0,
        'blue':        2.5,
        'purple':      5.0,
        'brown':       6.5,
        'black':       8.0,
        'coral':       39.0,
        'coral-white': 46.0,
        'red':         56.0
    };
    
    beltBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            let beltType = this.getAttribute('data-belt');
            let startYear = beltStartYears[beltType] || 0;
            
            // Update slider and trigger update
            let sliderYears = document.getElementById('slider-years');
            sliderYears.value = startYear;
            updateGraduation(startYear);
        });
    });
    
    // 4. Years Timeline slider
    let sliderYears = document.getElementById('slider-years');
    sliderYears.addEventListener('input', function() {
        let years = parseFloat(this.value);
        updateGraduation(years);
    });
    
    // 5. Camera mode buttons — removed from HTML, skip
    
    // 6. Query panel listeners
    document.getElementById('query-belt').addEventListener('change', () => {
        updateQueryDegreeOptions();
        updateQueryPanel();
    });
    document.getElementById('query-degree').addEventListener('change', updateQueryPanel);
    updateQueryDegreeOptions();
}

// Global BJJ Timeline Graduation Logic
function updateGraduation(years) {
    let belt = 'white';
    let degrees = 0;
    let title = 'Iniciante';
    
    // Step size = smallest time unit between any two consecutive degrees
    // White/Blue: 0.5 yr per degree (4 degrees / 2.5 yrs)
    // Purple/Brown: 0.3 yr per degree (4 degrees / 1.5 yrs)
    // Black: special mapping
    
    if (years < 2.5) {
        belt = 'white';
        degrees = Math.min(4, Math.floor(years / 0.5)); // 4 degrees over 2.5 years
        title = 'Iniciante';
    } else if (years < 5.0) {
        belt = 'blue';
        degrees = Math.min(4, Math.floor((years - 2.5) / 0.5)); // 4 degrees over 2.5 years
        title = 'Aluno';
    } else if (years < 6.5) {
        belt = 'purple';
        degrees = Math.min(4, Math.floor((years - 5.0) / 0.3)); // 4 degrees in 1.5 years
        title = 'Instrutor Auxiliar';
    } else if (years < 8.0) {
        belt = 'brown';
        degrees = Math.min(4, Math.floor((years - 6.5) / 0.3)); // 4 degrees in 1.5 years
        title = 'Instrutor';
    } else if (years < 39.0) {
        belt = 'black';
        title = 'Professor';
        
        let blackYears = years - 8.0;
        if (blackYears < 3.0)       degrees = 0;
        else if (blackYears < 6.0)  degrees = 1;
        else if (blackYears < 9.0)  degrees = 2;
        else if (blackYears < 14.0) degrees = 3;
        else if (blackYears < 19.0) degrees = 4;
        else if (blackYears < 24.0) degrees = 5;
        else                        degrees = 6;
    } else if (years < 46.0) {
        belt = 'coral'; // Red/Black coral belt (7º grau)
        degrees = 7;
        title = 'Mestre';
    } else if (years < 56.0) {
        belt = 'coral-white'; // Red/White coral belt (8º grau)
        degrees = 8;
        title = 'Mestre';
    } else {
        belt = 'red'; // Red belt (9º grau) — final graduation
        degrees = 9;
        title = 'Grão-Mestre';
    }
    
    currentBelt = belt;
    currentDegrees = degrees;
    
    // Update HTML Labels with formatted time
    document.getElementById('label-years').innerText = formatYears(years);
    
    let beltDisplayName = getBeltDisplayName(belt);
    
    // Color complement for coral/red belts (shown after the belt name like other belts show degrees)
    let colorComplement = '';
    if (belt === 'coral')       colorComplement = ' · Vermelha/Preta';
    if (belt === 'coral-white') colorComplement = ' · Vermelha/Branca';
    if (belt === 'red') ;
    
    document.getElementById('status-belt').innerText =
        beltDisplayName + colorComplement + ' (' + degrees + (degrees === 1 ? ' Grau)' : ' Graus)');
    document.getElementById('status-title').innerText = title;
    
    // Auto-update Plaqueta subtitle
    let autoSubtitle = beltDisplayName + colorComplement +
        (degrees > 0 ? ' - ' + degrees + (degrees === 1 ? ' Grau' : ' Graus') : '');
    document.getElementById('input-subtitle').value = autoSubtitle;
    
    // Refresh plaque graphics texture
    updateNameplateText();
    
    // Sync Belt Selection buttons active state class — each belt gets its own button now
    let beltBtns = document.querySelectorAll('.belt-btn');
    beltBtns.forEach(btn => {
        if (btn.getAttribute('data-belt') === belt) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function getBeltDisplayName(belt) {
    switch(belt) {
        case 'white':       return 'Faixa Branca';
        case 'blue':        return 'Faixa Azul';
        case 'purple':      return 'Faixa Roxa';
        case 'brown':       return 'Faixa Marrom';
        case 'black':       return 'Faixa Preta';
        case 'coral':       return 'Faixa Coral';
        case 'coral-white': return 'Faixa Coral';
        case 'red':         return 'Faixa Vermelha';
        default:            return 'Faixa Branca';
    }
}

// Update the degree select options based on which belt is selected in the query panel
function updateQueryDegreeOptions() {
    let belt = document.getElementById('query-belt').value;
    let degSelect = document.getElementById('query-degree');
    let currentVal = parseInt(degSelect.value);
    
    // Define valid degree ranges per belt
    let degreeRanges = {
        'white':       [0, 1, 2, 3, 4],
        'blue':        [0, 1, 2, 3, 4],
        'purple':      [0, 1, 2, 3, 4],
        'brown':       [0, 1, 2, 3, 4],
        'black':       [0, 1, 2, 3, 4, 5, 6],
        'coral':       [7],
        'coral-white': [8],
        'red':         [9]
    };
    
    let validDegrees = degreeRanges[belt] || [0];
    
    degSelect.innerHTML = '';
    validDegrees.forEach(d => {
        let opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d + '°';
        if (d === currentVal) opt.selected = true;
        degSelect.appendChild(opt);
    });
    
    // Select first valid option if current is no longer valid
    if (!validDegrees.includes(currentVal)) {
        degSelect.value = validDegrees[0];
    }
}

function updateCameraPosition() {
    // Smoothly approach target orbit radius (scroll zoom)
    orbitRadius = lerp(orbitRadius, orbitRadiusTarget, 0.1);
    
    // No auto-rotation; camera returns gently to front view when not dragging
    if (!isDragging) {
        orbitRotY = atan2(sin(orbitRotY), cos(orbitRotY));
        orbitRotX = lerp(orbitRotX, 0.1, 0.04);
        orbitRotY = lerp(orbitRotY, 0.0, 0.04);
    }
    
    // Both modes share the exact same height and target calculation
    targetCamPos.x = orbitRadius * cos(orbitRotX) * sin(orbitRotY);
    targetCamPos.y = orbitRadius * sin(orbitRotX) + 40;
    targetCamPos.z = orbitRadius * cos(orbitRotX) * cos(orbitRotY);
    targetCamLook.set(0, 35, 0);
    
    // Smoothly interpolate position vectors
    camPos.lerp(targetCamPos, 0.08);
    camLook.lerp(targetCamLook, 0.08);
}

// -------------------------------------------------------------
// MANUAL ORBIT ROTATION (MOUSE INTERACTION)
// -------------------------------------------------------------

function mousePressed() {
    // Check if mouse is inside the WebGL canvas viewport
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        isDragging = true;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }
}

function mouseReleased() {
    isDragging = false;
}

function mouseDragged() {
    if (isDragging) {
        let dx = mouseX - lastMouseX;
        let dy = mouseY - lastMouseY;
        
        orbitRotY += dx * 0.007; // positive = drag right → model rotates right
        orbitRotX = constrain(orbitRotX + dy * 0.007, -HALF_PI + 0.05, HALF_PI - 0.05);
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }
}

// -------------------------------------------------------------
// MOUSE WHEEL SCROLL — ZOOM
// -------------------------------------------------------------

function mouseWheel(event) {
    // Only zoom when mouse is over the canvas
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        orbitRadiusTarget += event.delta * 0.5;
        orbitRadiusTarget = constrain(orbitRadiusTarget, ORBIT_MIN, ORBIT_MAX);
        return false; // prevent page scroll
    }
}

// -------------------------------------------------------------
// RESPONSIVE CANVAS RESIZE
// -------------------------------------------------------------

function onWindowResize() {
    let container = document.getElementById('canvas-container');
    let w = container.clientWidth;
    let h = container.clientHeight;
    resizeCanvas(w, h);
}
