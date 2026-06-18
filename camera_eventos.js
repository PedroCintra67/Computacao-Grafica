function updateCameraPosition() {
    // Smoothly approach target orbit radius and focus height
    raioOrbita = lerp(raioOrbita, alvoRaioOrbita, 0.1);
    alturaFocoCamera = lerp(alturaFocoCamera, alvoAlturaFocoCamera, 0.08);

    if (modoApp === 'vitrine') {
        // Câmera Totalmente Fixa na vitrine
        alvoPosCamera.x = -50;
        alvoPosCamera.y = alturaFocoCamera;
        alvoPosCamera.z = raioOrbita;
        alvoOlharCamera.set(-50, alturaFocoCamera, 0);
        
        // Zera rotações para não dar problema se mudar pro ecommerce
        rotacaoOrbitaX = 0;
        rotacaoOrbitaY = 0;

    } else {
        // Lógica do Ecommerce
        if (!estaArrastando) {
            rotacaoOrbitaY = atan2(sin(rotacaoOrbitaY), cos(rotacaoOrbitaY)); // Normaliza
            rotacaoOrbitaX = lerp(rotacaoOrbitaX, 0.0, 0.04);
            rotacaoOrbitaY = lerp(rotacaoOrbitaY, 0.0, 0.04);
        }
        
        // Câmera Fixa (Nova): Câmera parada, gira só o objeto
        alvoPosCamera.x = 0;
        alvoPosCamera.y = alturaFocoCamera;
        alvoPosCamera.z = raioOrbita;
        alvoOlharCamera.set(0, alturaFocoCamera, 10);
    }

    // Smoothly interpolate position vectors
    posCamera.lerp(alvoPosCamera, 0.08);
    olharCamera.lerp(alvoOlharCamera, 0.08);
}

function mousePressed() {
    // Check if mouse is inside the WebGL canvas viewport
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        estaArrastando = true;
        ultimoMouseX = mouseX;
        ultimoMouseY = mouseY;
    }
}

function mouseReleased() {
    estaArrastando = false;
}

function mouseDragged() {
    if (estaArrastando) {
        let dx = mouseX - ultimoMouseX;
        let dy = mouseY - ultimoMouseY;

        // Permite girar o objeto apenas no modo ecommerce
        if (modoApp !== 'vitrine') {
            rotacaoOrbitaY += dx * 0.007;
            rotacaoOrbitaX = constrain(rotacaoOrbitaX + dy * 0.007, -HALF_PI + 0.05, HALF_PI - 0.05);
        }

        ultimoMouseX = mouseX;
        ultimoMouseY = mouseY;
    }
}

function mouseWheel(event) {
    // Only zoom when mouse is over the canvas
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        alvoRaioOrbita += event.delta * 0.5;

        if (modoApp === 'vitrine') {
            // No modo vitrine, o limite de zoom out é 900 (não afasta mais que a rua)
            alvoRaioOrbita = constrain(alvoRaioOrbita, ORBIT_MIN, 900);
        } else {
            // No ecommerce, o limite de zoom out é 800 para não perder o foco na peça
            alvoRaioOrbita = constrain(alvoRaioOrbita, ORBIT_MIN, 600);
        }

        return false; // prevent page scroll
    }
}

function onWindowResize() {
    let container = document.getElementById('container-canvas');
    let w = container.clientWidth;
    let h = container.clientHeight;
    resizeCanvas(w, h);
}
