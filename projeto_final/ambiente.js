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
    meuShader.setUniform('uMaterialType', 10); // Matte solid material
    meuShader.setUniform('uBaseColor', [0.55, 0.65, 0.50]); // Light Moss/Sage Green wall
    push();
    translate(0, 300, -350); // Wall in the back
    box(2000, 1000, 20);
    pop();

    // HELPER FUNCTION FOR PICTURE FRAMES
    let drawPictureFrame = function (img, x, z) {
        // PICTURE FRAME (Wood/Dark border)
        meuShader.setUniform('uMaterialType', 10);
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

    // HELPER FUNCTION CALLED BELOW

    // Place vases on the left and right sides, directly below the pictures
    drawVaseAndPlant(-280, -310);
    drawVaseAndPlant(280, -310);
}



function desenharAmbientevitrine() {
    noStroke(); // Remove wireframes from storefront elements
    // 1. Street/Sidewalk Floor (Outside)
    meuShader.setUniform('uMaterialType', 7); // Checkered Pattern Floor
    meuShader.setUniform('uBaseColor', [0.65, 0.45, 0.25]); // Lighter Brown tatami
    push();
    translate(0, -112, 100);
    box(5000, 10, 800);
    pop();

    // Store Interior Floor (Behind window)
    meuShader.setUniform('uMaterialType', 7); // Checkered Pattern Floor
    meuShader.setUniform('uBaseColor', [0.65, 0.45, 0.25]); // Lighter Brown tatami
    push();
    translate(0, -112, -400);
    box(5000, 10, 800);
    pop();

    // Store Interior Back Wall
    meuShader.setUniform('uMaterialType', 10); // Matte wall
    meuShader.setUniform('uBaseColor', [0.55, 0.65, 0.50]); // Light Moss/Sage Green wall
    push();
    translate(-50, 138, -300); // Altura alinhada com a fachada, Centro X=-50
    box(950, 500, 20); // Largura reduzida para 950
    pop();

    // Paredes Laterais da Loja (Fechando o bloco do prédio nos novos limites de 950)
    push(); translate(-525, 138, -175); box(20, 500, 250); pop(); // Lado Direito da Tela (-X)
    push(); translate(425, 138, -175); box(20, 500, 250); pop(); // Lado Esquerdo da Tela (+X)

    // --- STORE FACADE ---
    meuShader.setUniform('uMaterialType', 10); // Matte wall
    meuShader.setUniform('uBaseColor', [0.55, 0.65, 0.50]); // Light Moss/Sage Green wall

    push();
    translate(0, 0, -50); // Posição Z da fachada

    // 1. Parede Superior (Lintel - acima de tudo)
    push(); translate(-50, 313, 0); box(950, 150, 20); pop(); // Largura acompanha o limite da tela

    // 2. Parede ao lado da porta (Preenche o espaço que sobrou até a borda -525)
    push(); translate(-505, 63, 0); box(40, 350, 20); pop();
    
    // Porta Fechada (Vidro escuro / Madeira preta)
    meuShader.setUniform('uMaterialType', 10);
    meuShader.setUniform('uBaseColor', [0.1, 0.1, 0.12]);
    push(); translate(-410, 63, 0); box(150, 350, 10); pop();
    
    // Maçaneta da porta (Prata)
    meuShader.setUniform('uMaterialType', 10); // Brilhante
    meuShader.setUniform('uBaseColor', [0.8, 0.8, 0.85]);
    push(); translate(-350, 63,0); sphere(10); pop();
    
    // Placa Pendurada na Porta (ABERTO)
    if (typeof texturaPlacaAberto !== 'undefined' && texturaPlacaAberto) {
        meuShader.setUniform('uMaterialType', 6);
        meuShader.setUniform('tex', texturaPlacaAberto);
        push();
        translate(-405, 180, 6); // Na altura dos olhos, saltada da porta
        scale(-1, 1, 1);
        plane(90, 30); // Mais larga e mais fina (formato de placa retangular)
        pop();
    }
    
    // Volta cor para o resto da parede
    meuShader.setUniform('uMaterialType', 10); // ESSENCIAL: Resetar para parede fosca!
    meuShader.setUniform('uBaseColor', [0.55, 0.65, 0.50]);
    
    // 3. Pilar (Entre a porta e a vitrine)
    push(); translate(-300, 63, 0); box(70, 350, 20); pop();
    
    // (A Parede Inferior / Peitoril foi removida para dar lugar a uma vitrine de vidro que vai até o chão)
    
    // 5. Parede ao lado do vidro (Preenche o espaço que sobrou até a borda 425)
    push(); translate(352.5, 63, 0); box(145, 350, 20); pop();
    
    // Telhado / Teto (Literalmente um triângulo na parede da frente)
    meuShader.setUniform('uMaterialType', 10);
    // Escurecemos a cor base do telhado porque o chão tem linhas pretas e iluminação diferente que o deixam mais escuro. 
    // Assim a cor visual final fica idêntica.
    meuShader.setUniform('uBaseColor', [0.40, 0.25, 0.12]); 
    push(); 
    // Translada um pouco para frente para alinhar com a face da parede
    translate(0, 0, 10); 
    
    // Desenha um triângulo 2D perfeito ancorado nos novos limites extremos da loja (-525 a 425)
    // E o bico centralizado na câmera (X = -50)
    triangle(-525, 388, 425, 388, -50, 688);

    // Linhas pretas horizontais bem fininhas sobre o telhado inteiro
    meuShader.setUniform('uBaseColor', [0.02, 0.02, 0.02]); // Preto
    for(let y = 390; y <= 680; y += 18) { // Espaçamento bem menor para cobrir o triângulo todo
        let frac = (y - 388) / 300.0; // 300 é a altura total do triângulo (688 - 388)
        let w = 950 * (1.0 - frac) - 8; // Menos 8 para não vazar pelas bordas diagonais
        if (w > 0) {
            push();
            translate(-50, y, 1); // Z=1 à frente do triângulo
            box(w, 1.5, 2); // Caixa super fina (1.5 de altura)
            pop();
        }
    }
    
    pop();
    
    pop();
    
    // Plantas na calçada (Ambiente)
    drawVaseAndPlant(350, -20);
    drawVaseAndPlant(-490, -20);
    // 6. Neon Store Sign
    if (texturaPlacavitrine) {
        meuShader.setUniform('uMaterialType', 6);
        meuShader.setUniform('tex', texturaPlacavitrine);
        push();
        translate(-50, 313, -39); // Centralizado na fachada (X=-50)
        scale(-1, 1, 1);
        plane(600, 140); // Ajustei a altura para caber perfeitamente na parede superior
        pop();
    }

    // Draw 3 Pedestals INSIDE the store (Behind the window)
    meuShader.setUniform('uMaterialType', 0);
    meuShader.setUniform('uBaseColor', [0.15, 0.15, 0.15]);

    // Center Pedestal
    push(); translate(0, -95, -200); box(120, 15, 120); pop();
    push(); translate(0, -50, -200); box(100, 80, 100); pop();

    // Left Pedestal
    push(); translate(-190, -95, -200); box(120, 15, 120); pop();
    push(); translate(-190, -50, -200); box(100, 80, 100); pop();

    // Right Pedestal
    push(); translate(200, -95, -200); box(120, 15, 120); pop();
    push(); translate(200, -50, -200); box(100, 80, 100); pop();
}

function drawvitrineMannequins() {
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
    translate(-190, 0, -200);
    rotateY(radians(10)); // Face camera slightly
    estadoLoja.blusa.cor = 'white'; estadoLoja.calca.cor = 'white'; estadoLoja.faixa.cor = 'blue';
    estadoLoja.blusa.marca = 'Vouk'; estadoLoja.calca.marca = 'Vouk';
    estadoLoja.blusa.tamanho = 'A1'; estadoLoja.calca.tamanho = 'A1'; estadoLoja.faixa.tamanho = 'A1';
    drawMannequin();
    pop();

    // Promo 2 (Center Mannequin): Atama Azul + Faixa Roxa (A2)
    push();
    translate(0, 0, -200);
    estadoLoja.blusa.cor = 'blue'; estadoLoja.calca.cor = 'blue'; estadoLoja.faixa.cor = 'purple';
    estadoLoja.blusa.marca = 'Atama'; estadoLoja.calca.marca = 'Atama';
    estadoLoja.blusa.tamanho = 'A2'; estadoLoja.calca.tamanho = 'A2'; estadoLoja.faixa.tamanho = 'A2';
    drawMannequin();
    pop();

    // Promo 3 (Left Mannequin on screen): Kingz Preto + Faixa Preta (A3)
    push();
    translate(200, 0, -200);
    rotateY(radians(-10)); // Face camera slightly
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

function desenharVidrovitrine() {
    // Vidro no buraco da vitrine (Transparente)
    // Desenhado por último no main.js para não bugar o Z-buffer (transparência na frente dos kimonos)
    resetShader();
    push();
    fill(180, 220, 255, 30); // Azulzinho bem transparente
    translate(0, 65, -50); // Centralizado mais abaixo para cobrir até o chão
    box(580, 345, 5); // Vidro fino que cobre a vitrine (Largura 580 encaixa entre o pilar e a parede)
    pop();
    shader(meuShader); // Religa o shader para o próximo frame
}

// HELPER FUNCTION FOR PLANT VASE
function drawVaseAndPlant(x, z) {
    // VASE (Matte dark grey ceramic)
    meuShader.setUniform('uMaterialType', 10);
    meuShader.setUniform('uBaseColor', [0.12, 0.12, 0.12]);
    push();
    translate(x, -67, z); // Floor surface is at ~ -107, so cylinder center is at -67 (height 80)
    cylinder(30, 80);
    pop();

    // PLANT (Matte dark green)
    meuShader.setUniform('uMaterialType', 10);
    meuShader.setUniform('uBaseColor', [0.15, 0.35, 0.15]);

    // A cluster of overlapping spheres to simulate a bush/plant
    push(); translate(x, -15, z); sphere(35); pop();
    push(); translate(x, 15, z); sphere(25); pop();
    push(); translate(x - 25, 0, z + 15); sphere(30); pop();
    push(); translate(x + 25, 0, z - 15); sphere(30); pop();
    push(); translate(x, 0, z + 20); sphere(30); pop();
}
