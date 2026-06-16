function drawBeltAndKnot() {
    meuShader.setUniform('uMaterialType', 2);
    meuShader.setUniform('uMaterialType', 5);

    let bColorStr = 'white';
    let deg = 0;
    if (typeof modoApp !== 'undefined' && modoApp === 'classic') {
        bColorStr = (typeof currentBelt !== 'undefined') ? currentBelt : 'white';
        deg = (typeof currentDegrees !== 'undefined') ? currentDegrees : 0;
    } else {
        bColorStr = (typeof estadoLoja !== 'undefined') ? estadoLoja.faixa.cor : 'white';
        deg = 0;
    }

    // We will inline the logic of getBeltColorValue since the exact function might be structured differently
    let beltColor = [1, 1, 1];
    let isCoral = false;
    let isCoralWhite = false;

    if (bColorStr === 'white') beltColor = [0.95, 0.95, 0.95];
    else if (bColorStr === 'blue') beltColor = [0.1, 0.2, 0.6];
    else if (bColorStr === 'purple') beltColor = [0.4, 0.1, 0.5];
    else if (bColorStr === 'brown') beltColor = [0.35, 0.20, 0.05];
    else if (bColorStr === 'black') beltColor = [0.1, 0.1, 0.1];
    else if (bColorStr === 'coral') { beltColor = [0.8, 0.1, 0.1]; isCoral = true; }
    else if (bColorStr === 'coral-white') { beltColor = [0.8, 0.1, 0.1]; isCoralWhite = true; }
    else if (bColorStr === 'red') beltColor = [0.8, 0.1, 0.1];
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
    if (bColorStr === 'coral') beltStyle = 1;
    else if (bColorStr === 'coral-white') beltStyle = 2;

    meuShader.setUniform('uBeltStyle', beltStyle);
    meuShader.setUniform('uBaseColor', beltColor);
    meuShader.setUniform('uMaterialType', 2); // Material correto para a faixa

    push();
    noStroke();
    if (typeof malhaFaixa !== 'undefined' && malhaFaixa) {
        model(malhaFaixa);
    }
    pop();

    // Reset style for the knot and hanging ends
    meuShader.setUniform('uBeltStyle', 0);
    meuShader.setUniform('uMaterialType', 2); // Material da faixa (sólido) para nó e pontas

    // Apply tilt and push specifically for Knot and Hanging Ends
    translate(0, beltY, 0);
    rotateX(radians(-5)); // Tilt forward
    translate(0, 0, 2);   // Push slightly forward to prevent lapel clipping
    translate(0, -beltY, 0);

    // 2. CENTRAL KNOT — placed at the front of the waist (angle=0, Z = +beltRadiusZ)
    // Use the main belt color for knot body
    meuShader.setUniform('uBaseColor', beltColor);
    noStroke(); // Ensure no wireframe lines are drawn on the knot box

    // Main knot block
    push();
    translate(0, beltY, beltRadiusZ);
    box(26, 18, 16); // Increased width and depth
    pop();

    // 3. TWO HANGING ENDS — hang DOWN from the knot in an X shape (like photo)
    let frontZ = beltRadiusZ + 4;  // Push them further forward so they don't clip into body

    // ===== RIGHT HANGING END =====
    push();
    translate(0, beltY, frontZ);
    rotateZ(radians(38));    // lean diagonally right-down
    rotateY(radians(-8));    // slight angle so it faces front

    if (bColorStr === 'coral' || bColorStr === 'coral-white') {
        meuShader.setUniform('uBaseColor', [0.78, 0.08, 0.08]);
    } else {
        meuShader.setUniform('uBaseColor', beltColor);
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
    if (bColorStr === 'coral') {
        leftBeltColor = [0.12, 0.12, 0.12]; // Black hanging end
    } else if (bColorStr === 'coral-white') {
        leftBeltColor = [0.95, 0.92, 0.78]; // White hanging end (off-white to match wrap)
    }

    // Upper belt-color section
    meuShader.setUniform('uBaseColor', leftBeltColor);
    translate(0, -15, 0); // Upper piece length is 30, center is 15 below the knot
    box(12, 30, 6);

    // --- RANK SLEEVE ---
    // BJJ official colors for the rank sleeve (tarja):
    //   white/blue/purple/brown → BLACK sleeve, no special ends
    //   black belt              → RED sleeve, no special ends
    //   coral (red/black)       → WHITE sleeve + GRAY ends
    //   coral-white (red/white) → RED sleeve + GRAY ends
    //   red / red-gracie        → RED sleeve + DARK-GOLD ends

    let thk = 1.2;   // stripe thickness (thinner to widen gaps)
    let gap = 2.0;   // gap between stripes (not actually used due to slotH math, but kept for reference)
    let n = deg;

    // Sleeve sizes — white-brown raised to 32 to match black belt sleeve size
    // Sleeve sizes 
    let sleeveH;
    let sleeveMainColor;
    let endColor = null;  // null = no special end marks

    if (bColorStr === 'white' || bColorStr === 'blue' ||
        bColorStr === 'purple' || bColorStr === 'brown') {
        sleeveH = 36.0; // Proportional size
        sleeveMainColor = [0.10, 0.10, 0.10]; // black sleeve, no ends
    } else if (bColorStr === 'black') {
        sleeveH = 36.0;
        sleeveMainColor = [0.80, 0.08, 0.08]; // red sleeve
        endColor = [0.95, 0.95, 0.95];        // white ends
    } else if (bColorStr === 'coral') {
        sleeveH = 36.0;
        sleeveMainColor = [0.80, 0.08, 0.08]; // RED sleeve
        endColor = [0.95, 0.95, 0.95];        // white ends
    } else if (bColorStr === 'coral-white') {
        sleeveH = 36.0;
        sleeveMainColor = [0.80, 0.08, 0.08]; // red sleeve
        endColor = [0.52, 0.52, 0.56];        // gray ends
    } else {
        // red — red sleeve + dark gold ends
        sleeveH = 36.0;
        sleeveMainColor = [0.80, 0.08, 0.08]; // red sleeve
        endColor = [0.80, 0.65, 0.15];        // dark-gold ends
    }

    // Translate from upper-belt center to sleeve center (perfectly flush, no gap)
    let sleeveCenterOffset = -(15.0 + sleeveH / 2.0); // 15 is half of the upper piece (30)
    translate(0, sleeveCenterOffset, 0);

    // Draw sleeve body
    meuShader.setUniform('uBaseColor', sleeveMainColor);
    box(12.5, sleeveH, 6.5);

    // Extremity marks at both ends of the sleeve
    if (endColor !== null) {
        meuShader.setUniform('uBaseColor', endColor);
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
    if (n > 0) {
        meuShader.setUniform('uBaseColor', [0.98, 0.98, 0.98]); // white stripes for all

        // Usable area (reserves 5 units at each end if end-marks are present)
        let usableStart = (endColor !== null) ? -(sleeveH / 2) + 5.0 : -(sleeveH / 2);
        let usableH = (endColor !== null) ? sleeveH - 10.0 : sleeveH;

        // Max degrees per belt type → determines slot count
        let maxN;
        if (bColorStr === 'white' || bColorStr === 'blue' ||
            bColorStr === 'purple' || bColorStr === 'brown') maxN = 4;
        else if (bColorStr === 'black') maxN = 6;
        else if (bColorStr === 'coral') maxN = 7;
        else if (bColorStr === 'coral-white') maxN = 8;
        else maxN = 9; // red (max 9)

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
    translate(0, -(sleeveH / 2.0 + 6.0), 0); // half of tip length (12) is 6
    meuShader.setUniform('uBaseColor', leftBeltColor);
    box(12, 12, 6);

    pop(); // pop for the Left Hanging End
    pop(); // Final POP for the Global Belt Transform from line 1036
}

// Helper function to return colors as [R, G, B] normalized between 0.0 and 1.0
function getBeltColorValue(beltName) {
    switch (beltName) {
        case 'white': return [0.98, 0.98, 0.98];
        case 'blue': return [0.08, 0.35, 0.85];
        case 'purple': return [0.45, 0.18, 0.75];
        case 'brown': return [0.36, 0.22, 0.15];
        case 'black': return [0.12, 0.12, 0.12];
        case 'coral': return [0.78, 0.08, 0.08]; // primary red
        case 'coral-white': return [0.78, 0.08, 0.08]; // red
        case 'red': return [0.85, 0.08, 0.08];
        case 'red-gracie': return [0.85, 0.08, 0.08];
        default: return [0.98, 0.98, 0.98];
    }
}
