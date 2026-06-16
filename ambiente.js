function drawEnvironment() {
    noStroke(); // Remove wireframes from background elements
    // TATAMI FLOOR
    meuShader.setUniform('uMaterialType', 7); // Checkered Pattern Floor
    meuShader.setUniform('uBaseColor', [0.65, 0.45, 0.25]); // Lighter Brown tatami

    // Main tatami floor (huge)
    push();
    translate(0, -112, 0); // Floor is below the pedestal
    box(2000, 10, 2000);
    pop();

    // BACK WALL
    meuShader.setUniform('uMaterialType', 4); // Matte solid material
    meuShader.setUniform('uBaseColor', [0.55, 0.65, 0.50]); // Light Moss/Sage Green wall
    push();
    translate(0, 300, -350); // Wall in the back
    box(2000, 1000, 20);
    pop();

    // HELPER FUNCTION FOR PICTURE FRAMES
    let drawPictureFrame = function (img, x, z) {
        // PICTURE FRAME (Wood/Dark border)
        meuShader.setUniform('uMaterialType', 4);
        meuShader.setUniform('uBaseColor', [0.1, 0.08, 0.05]); // Dark wood
        push();
        translate(x, 250, z - 3);
        box(160, 200, 5);
        pop();

        // PICTURE
        if (img) {
            meuShader.setUniform('uMaterialType', 6);
            meuShader.setUniform('tex', img);
            push();
            translate(x, 250, z);
            plane(145, 185);
            pop();
        }
    };

    // Carlos Gracie on the Left, Helio Gracie on the Right (moved further apart)
    drawPictureFrame(imgCarlos, -320, -335);
    drawPictureFrame(imgHelio, 320, -335);

    // WALL TEXT (JIU JITSU)
    meuShader.setUniform('uMaterialType', 6);
    meuShader.setUniform('tex', texturaTextoParede);
    push();
    translate(0, 250, -339); // Placed slightly off the wall face (-340)
    scale(-1, 1, 1); // Flip horizontally because WebGL planes mirror textures
    plane(400, 160);
    pop();

    // HELPER FUNCTION FOR PLANT VASE
    let drawVaseAndPlant = function(x, z) {
        // VASE (Matte dark grey ceramic)
        meuShader.setUniform('uMaterialType', 4);
        meuShader.setUniform('uBaseColor', [0.12, 0.12, 0.12]); 
        push();
        translate(x, -67, z); // Floor surface is at ~ -107, so cylinder center is at -67 (height 80)
        cylinder(30, 80);
        pop();

        // PLANT (Matte dark green)
        meuShader.setUniform('uMaterialType', 4);
        meuShader.setUniform('uBaseColor', [0.15, 0.35, 0.15]); 
        
        // A cluster of overlapping spheres to simulate a bush/plant
        push(); translate(x, -15, z); sphere(35); pop();
        push(); translate(x, 15, z); sphere(25); pop();
        push(); translate(x - 25, 0, z + 15); sphere(30); pop();
        push(); translate(x + 25, 0, z - 15); sphere(30); pop();
        push(); translate(x, 0, z + 20); sphere(30); pop();
    };

    // Place vases on the left and right sides, directly below the pictures
    drawVaseAndPlant(-280, -310);
    drawVaseAndPlant(280, -310);
}



function desenharAmbienteBoutique() {
    noStroke(); // Remove wireframes from storefront elements
    // 1. Street/Sidewalk Floor (Outside)
    meuShader.setUniform('uMaterialType', 4); // Matte concrete
    meuShader.setUniform('uBaseColor', [0.15, 0.16, 0.18]);
    push();
    translate(0, -112, 100);
    box(2000, 10, 800);
    pop();

    // Store Interior Floor (Behind window)
    meuShader.setUniform('uMaterialType', 0); // Polished floor inside
    meuShader.setUniform('uBaseColor', [0.03, 0.04, 0.05]);
    push();
    translate(0, -112, -400);
    box(2000, 10, 800);
    pop();

    // Store Interior Back Wall
    meuShader.setUniform('uMaterialType', 4); // Matte wall
    meuShader.setUniform('uBaseColor', [0.15, 0.16, 0.18]); // Dark interior wall
    push();
    translate(0, 100, -300);
    box(1000, 500, 20);
    pop();

    // Removed Facade, Door, and Window Frames to leave an open display

    // 6. Neon Store Sign
    if (texturaPlacaBoutique) {
        meuShader.setUniform('uMaterialType', 6);
        meuShader.setUniform('tex', texturaPlacaBoutique);
        push();
        translate(-100, 250, -289); // Placed on the back wall, centered above mannequins
        scale(-1, 1, 1);
        plane(600, 240);
        pop();
    }

    // Draw 3 Pedestals INSIDE the store (Behind the window)
    meuShader.setUniform('uMaterialType', 0);
    meuShader.setUniform('uBaseColor', [0.15, 0.15, 0.15]);

    // Center Pedestal
    push(); translate(-100, -95, -200); box(120, 15, 120); pop();
    push(); translate(-100, -50, -200); box(100, 80, 100); pop();

    // Left Pedestal
    push(); translate(-280, -95, -200); box(120, 15, 120); pop();
    push(); translate(-280, -50, -200); box(100, 80, 100); pop();

    // Right Pedestal
    push(); translate(80, -95, -200); box(120, 15, 120); pop();
    push(); translate(80, -50, -200); box(100, 80, 100); pop();
}

function drawBoutiqueMannequins() {
    let originalBrand = estadoLoja.blusa.marca;
    let originalPantsBrand = estadoLoja.calca.marca;
    let originalTopColor = estadoLoja.blusa.cor;
    let originalPantsColor = estadoLoja.calca.cor;
    let originalBeltColor = estadoLoja.faixa.cor;
    
    let originalTopSize = estadoLoja.blusa.tamanho;
    let originalPantsSize = estadoLoja.calca.tamanho;
    let originalBeltSize = estadoLoja.faixa.tamanho;

    let oldMode = window.modoApp;
    window.modoApp = 'ecommerce'; // Trick shader into drawing brands

    // Helper to draw a full mannequin scaled
    const drawMannequin = () => {
        let sTop = obterEscalaTamanho(estadoLoja.blusa.tamanho);
        let sPants = obterEscalaTamanho(estadoLoja.calca.tamanho, 'calca');
        let sBelt = obterEscalaTamanho(estadoLoja.faixa.tamanho);

        // Draw Top
        push();
        scale(sTop[0], sTop[1], sTop[2]);
        desenharTroncoKimono(texturaRashguard);
        pop();

        // Draw Pants
        push();
        let dy = 68 * sTop[1] - 68 * sPants[1];
        translate(0, dy, 0);
        scale(sPants[0], sPants[1], sPants[2]);
        if (typeof desenharCalcaFunc === 'function') {
            desenharCalcaFunc();
        } else if (typeof desenharCalca === 'function') {
            desenharCalca();
        }
        pop();

        // Draw Belt
        push();
        let dyBelt = 68 * sTop[1] - 68 * sBelt[1];
        translate(0, dyBelt, 0);
        scale(sTop[0], sBelt[1], sTop[2]);
        drawBeltAndKnot();
        pop();
    };

    // Promo 1 (Right Mannequin on screen): Vouk Branco + Faixa Azul (A1)
    push();
    translate(-280, 0, -200);
    rotateY(radians(-12)); // Face camera slightly
    estadoLoja.blusa.cor = 'white'; estadoLoja.calca.cor = 'white'; estadoLoja.faixa.cor = 'blue';
    estadoLoja.blusa.marca = 'Vouk'; estadoLoja.calca.marca = 'Vouk';
    estadoLoja.blusa.tamanho = 'A1'; estadoLoja.calca.tamanho = 'A1'; estadoLoja.faixa.tamanho = 'A1';
    drawMannequin();
    pop();

    // Promo 2 (Center Mannequin): Atama Azul + Faixa Roxa (A2)
    push();
    translate(-100, 0, -200);
    estadoLoja.blusa.cor = 'blue'; estadoLoja.calca.cor = 'blue'; estadoLoja.faixa.cor = 'purple';
    estadoLoja.blusa.marca = 'Atama'; estadoLoja.calca.marca = 'Atama';
    estadoLoja.blusa.tamanho = 'A2'; estadoLoja.calca.tamanho = 'A2'; estadoLoja.faixa.tamanho = 'A2';
    drawMannequin();
    pop();

    // Promo 3 (Left Mannequin on screen): Kingz Preto + Faixa Preta (A3)
    push();
    translate(80, 0, -200);
    rotateY(radians(12)); // Face camera slightly
    estadoLoja.blusa.cor = 'black'; estadoLoja.calca.cor = 'black'; estadoLoja.faixa.cor = 'black';
    estadoLoja.blusa.marca = 'Kingz'; estadoLoja.calca.marca = 'Kingz';
    estadoLoja.blusa.tamanho = 'A3'; estadoLoja.calca.tamanho = 'A3'; estadoLoja.faixa.tamanho = 'A3';
    drawMannequin();
    pop();

    // Restore state
    window.modoApp = oldMode;
    estadoLoja.blusa.marca = originalBrand;
    estadoLoja.calca.marca = originalPantsBrand;
    estadoLoja.blusa.cor = originalTopColor;
    estadoLoja.calca.cor = originalPantsColor;
    estadoLoja.faixa.cor = originalBeltColor;
    
    estadoLoja.blusa.tamanho = originalTopSize;
    estadoLoja.calca.tamanho = originalPantsSize;
    estadoLoja.faixa.tamanho = originalBeltSize;
}
