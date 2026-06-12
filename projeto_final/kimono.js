// kimono.js
// Procedural Generation of the BJJ Kimono Geometry

let kimonoTorsoGeom;
let kimonoLeftSleeveGeom;
let kimonoRightSleeveGeom;
let proceduralBeltGeom;
let lapelLeftGeom;
let lapelRightGeom;

function initKimonoGeometry() {
    // We use p5.Geometry to build custom shapes with UVs and Normals once, caching them.
    
    // Use unique detailX/Y parameters to avoid p5.Geometry cache collisions!
    kimonoTorsoGeom = new p5.Geometry(1, 1, function() {
        let rows = 40;
        let cols = 50;
        
        for (let r = 0; r <= rows; r++) {
            let v = r / rows;
            // Waist Y=68, Neck Y=145, Skirt Y=0 (touches the pedestal)
            let y = 0 + v * (145 - 0);
            
            let rX, rZ;
            if (y < 68) {
                // Skirt below the belt
                let t = map(y, 0, 68, 0, 1);
                rX = lerp(66, 52.5, t); // flare out more at bottom
                rZ = lerp(45, 30, t);
            } else {
                // Torso above the belt
                let t = map(y, 68, 145, 0, 1);
                rX = lerp(52.5, 68, t);
                rZ = lerp(30, 38, t);
                
                // Curve the body (chest bulge)
                let chestBulge = sin(t * PI);
                rX += chestBulge * 2.0;
                rZ += chestBulge * 4.0;
            }
            
            for (let c = 0; c <= cols; c++) {
                let u = c / cols;
                let angle = u * TWO_PI;
                
                let nx = cos(angle);
                let nz = sin(angle);
                
                let px = rX * nx;
                let pz = rZ * nz;
                
                // Add soft procedural cloth folds (wrinkles)
                let foldScale = map(y, 0, 145, 0.6, 1.0);
                if (y >= 60 && y <= 76) foldScale = 0.0; // tight at the belt
                let wrinkle = sin(u * TWO_PI * 6.0 + v * 3.0) * sin(v * PI * 3.0) * 1.5;
                
                px += nx * wrinkle * foldScale;
                pz += nz * wrinkle * foldScale;
                
                this.vertices.push(createVector(px, y, pz));
                // UV mapping: u goes around (0 to 1), v goes up (0 to 1)
                this.uvs.push([u, v * 2.0]);
            }
        }
        
        // Generate Triangles with correct Counter-Clockwise winding order
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let i0 = r * (cols + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (cols + 1) + c;
                let i3 = i2 + 1;
                
                // Flip winding order to CCW to fix black inward-pointing normals
                this.faces.push([i0, i2, i1]);
                this.faces.push([i1, i2, i3]);
            }
        }
        this.computeNormals();
    });
    
    // Create sleeve geometries similarly to avoid harsh cylinders
    kimonoLeftSleeveGeom = createSleeveGeometry('left');
    kimonoRightSleeveGeom = createSleeveGeometry('right');
    
    // Force unique IDs
    kimonoTorsoGeom.id = 'kimonoTorso_geom';
    kimonoTorsoGeom.gid = 'kimonoTorso_geom';
    kimonoLeftSleeveGeom.id = 'kimonoLeftSleeve_geom';
    kimonoLeftSleeveGeom.gid = 'kimonoLeftSleeve_geom';
    kimonoRightSleeveGeom.id = 'kimonoRightSleeve_geom';
    kimonoRightSleeveGeom.gid = 'kimonoRightSleeve_geom';
    
    // Create the procedural belt that wraps perfectly around the waist
    initBeltGeometry();
    proceduralBeltGeom.id = 'proceduralBelt_geom';
    proceduralBeltGeom.gid = 'proceduralBelt_geom';
    
    lapelLeftGeom = createLapelGeometry(true);
    lapelRightGeom = createLapelGeometry(false);
    lapelLeftGeom.id = 'lapelLeft_geom';
    lapelLeftGeom.gid = 'lapelLeft_geom';
    lapelRightGeom.id = 'lapelRight_geom';
    lapelRightGeom.gid = 'lapelRight_geom';
}

function initBeltGeometry() {
    proceduralBeltGeom = new p5.Geometry(1, 1, function() {
        let cols = 60; // high detail for smooth curve
        let rows = 4;
        
        // Belt sits at Y=68, height=13
        let yStart = 61.5;
        let yEnd = 74.5;
        
        for (let r = 0; r <= rows; r++) {
            let v = r / rows;
            let y = lerp(yStart, yEnd, v);
            
            // Belt radius pushed further out to completely clear the body
            let rX = 56.5;
            let rZ = 34.0;
            
            for (let c = 0; c <= cols; c++) {
                let u = c / cols;
                let angle = u * TWO_PI;
                
                let nx = cos(angle);
                let nz = sin(angle);
                
                let px = rX * nx;
                let pz = rZ * nz;
                
                // Keep the front slightly open or just close it (the knot covers it)
                // We'll just make a continuous tube, the knot will sit on top of the front
                this.vertices.push(createVector(px, y, pz));
                this.uvs.push([u, v]);
            }
        }
        
        // Generate Triangles
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let i0 = r * (cols + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (cols + 1) + c;
                let i3 = i2 + 1;
                
                // Y goes from 61.5 to 74.5 (increasing). So Y goes UP.
                // If +Y is UP, then matches Torso winding order.
                this.faces.push([i0, i2, i1]);
                this.faces.push([i1, i2, i3]);
            }
        }
        this.computeNormals();
    });
}

function createSleeveGeometry(side) {
    return new p5.Geometry(1, 1, function() {
        let rows = 20;
        let cols = 30;
        
        let length = 95; // Longer sleeves, below the belt
        let startRadius = 16; // Much thinner shoulder
        let endRadius = 10; // Much thinner wrist
        
        for (let r = 0; r <= rows; r++) {
            let v = r / rows;
            let currentRadius = lerp(startRadius, endRadius, v);
            // Negative Y to go DOWN the arm (since +Y is visually UP in p5)
            let y = -v * length;
            
            for (let c = 0; c <= cols; c++) {
                let u = c / cols;
                let angle = u * TWO_PI;
                
                let nx = cos(angle);
                let nz = sin(angle);
                
                let px = currentRadius * nx;
                let pz = currentRadius * nz;
                
                // Add soft sleeve folds
                let wrinkle = sin(u * TWO_PI * 5.0) * sin(v * PI * 4.0) * 1.2;
                px += nx * wrinkle;
                pz += nz * wrinkle;
                
                this.vertices.push(createVector(px, y, pz));
                this.uvs.push([u, v]);
            }
        }
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let i0 = r * (cols + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (cols + 1) + c;
                let i3 = i2 + 1;
                
                // CCW winding order for sleeves (since Y goes from 0 down to -85)
                this.faces.push([i0, i1, i2]);
                this.faces.push([i1, i3, i2]);
            }
        }
        this.computeNormals();
    });
}

function createLapelGeometry(isLeft) {
    return new p5.Geometry(1, 1, function() {
        let rows = 30;
        
        for (let r = 0; r <= rows; r++) {
            let v = r / rows;
            let y = lerp(145, 68, v); // Stop exactly at the belt (68) so it doesn't stick out below
            
            // Torso dimensions at this Y
            let t = map(y, 68, 145, 0, 1);
            if (t < 0) t = 0;
            let rX = lerp(52.5, 68, t);
            let rZ = lerp(30, 38, t);
            let chestBulge = sin(t * PI);
            rX += chestBulge * 2.0;
            rZ += chestBulge * 4.0;
            
            // isLeft means WEARER's left (viewer's right)
            // Top lapel goes to -10 (across center). Under lapel goes to 15.
            let xCenter = isLeft ? lerp(35, -10, v) : lerp(-35, 10, v);
            let angleCenter = acos(constrain(xCenter / rX, -1, 1));
            
            let widthAngle = 0.30; // Increased to ensure no gap
            for (let c = 0; c <= 1; c++) {
                let angle = angleCenter + (c === 0 ? -widthAngle/2 : widthAngle/2);
                let px = rX * cos(angle);
                let pz = rZ * sin(angle);
                
                // Left lapel goes OVER right lapel.
                let thickness = isLeft ? 5.5 : 3.0; // Increased thickness to avoid clipping
                
                // Make the under lapel vanish into the chest a bit lower down
                if (!isLeft && v > 0.6) {
                    thickness -= (v - 0.6) * 30.0; 
                }
                
                // Tuck both lapels behind the belt at the very bottom
                if (v > 0.8) {
                    thickness -= (v - 0.8) * 20.0;
                }
                px += cos(angle) * thickness;
                pz += sin(angle) * thickness;
                
                this.vertices.push(createVector(px, y, pz));
                this.uvs.push([c, v]);
            }
        }
        
        for (let r = 0; r < rows; r++) {
            let i0 = r * 2;
            let i1 = i0 + 1;
            let i2 = (r + 1) * 2;
            let i3 = i2 + 1;
            
            // Fix winding order to OUTWARDS to prevent black normals (Lapels are drawn top-down, so Y decreases)
            this.faces.push([i0, i1, i2]);
            this.faces.push([i1, i3, i2]);
        }
        this.computeNormals();
    });
}

function drawKimonoTorso() {
    // If not initialized yet, initialize them
    if (!kimonoTorsoGeom) {
        initKimonoGeometry();
    }
    
    // Globally disable strokes so no black wireframes appear on anything (spheres, collars, etc)
    noStroke();
    
    // Material Type 1: Matte Procedural Pearl Weave Fabric
    myShader.setUniform('uMaterialType', 1);
    
    let col = [0.95, 0.95, 0.95]; // Default White
    if (currentGiColor === 'blue') {
        col = [0.08, 0.22, 0.58]; // Royal blue
    } else if (currentGiColor === 'black') {
        col = [0.12, 0.12, 0.14]; // Pitch Black
    }
    myShader.setUniform('uBaseColor', col);
    
    // Draw the procedural Torso
    push();
    model(kimonoTorsoGeom);
    pop();
    
    // Draw Inner Chest (Rashguard/Shirt) to show behind the V-neck
    // We use a slightly scaled-down Torso so it perfectly hugs the body shape!
    push();
    myShader.setUniform('uMaterialType', 5);
    myShader.setUniform('tex', rashguardTex);
    scale(0.97, 1.0, 0.97); // 3% smaller in X and Z
    model(kimonoTorsoGeom);
    pop();
    
    // RESTORE Kimono Material and Color for the Sleeves!
    myShader.setUniform('uMaterialType', 1);
    myShader.setUniform('uBaseColor', col);
    
    // Draw Left Sleeve
    push();
    // Shoulder attachment point
    translate(-60, 134, 0); // attached at the sphere
    rotateZ(radians(-20)); // Point more DOWNWARDS
    model(kimonoLeftSleeveGeom);
    pop();
    
    // Draw Right Sleeve
    push();
    translate(60, 134, 0); // attached at the sphere
    rotateZ(radians(20)); // Point more DOWNWARDS
    model(kimonoRightSleeveGeom);
    pop();
    
    // Shoulder rounded ends to cap the sleeves smoothly
    // Use solid material so they don't get black Moire patterns
    myShader.setUniform('uMaterialType', 4); 
    push();
    translate(-60, 134, 0);
    sphere(16);
    pop();
    push();
    translate(60, 134, 0);
    sphere(16);
    pop();
    
    // COLLAR LAPELS (Gola do Kimono)
    // Procedural rendering of the lapel as overlapping ribbons
    drawLapel();
    
    // Inside shadow/neck opening
    myShader.setUniform('uMaterialType', 4);
    myShader.setUniform('uBaseColor', [0.08, 0.08, 0.08]);
    push();
    translate(0, 150, 0);
    rotateX(HALF_PI);
    cylinder(24, 20);
    pop();
}

function drawLapel() {    
    // COLLAR LAPELS (Procedural)
    // Use solid fabric material so lapels stand out clearly from the pearl weave torso
    myShader.setUniform('uMaterialType', 4);
    
    // Very subtly darker shade of the kimono color (98%) so it looks like the exact same fabric
    let col = [0.95, 0.95, 0.95]; 
    if (currentGiColor === 'blue') col = [0.08, 0.22, 0.58];
    else if (currentGiColor === 'black') col = [0.12, 0.12, 0.14];
    myShader.setUniform('uBaseColor', [col[0]*0.98, col[1]*0.98, col[2]*0.98]);
    
    push();
    model(lapelRightGeom); // Draw bottom first
    model(lapelLeftGeom);  // Draw top
    pop();
    
    // Collar Back
    push();
    translate(0, 145, -8);
    rotateX(HALF_PI);
    cylinder(38, 12);
    pop();
}
