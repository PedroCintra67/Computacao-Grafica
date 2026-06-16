function updateCameraPosition() {
    // Smoothly approach target orbit radius and focus height
    raioOrbita = lerp(raioOrbita, alvoRaioOrbita, 0.1);
    alturaFocoCamera = lerp(alturaFocoCamera, alvoAlturaFocoCamera, 0.08);

    // No auto-rotation; camera returns gently to front view when not dragging
    if (!estaArrastando) {
        rotacaoOrbitaY = atan2(sin(rotacaoOrbitaY), cos(rotacaoOrbitaY));
        rotacaoOrbitaX = lerp(rotacaoOrbitaX, 0.1, 0.04);
        rotacaoOrbitaY = lerp(rotacaoOrbitaY, 0.0, 0.04);
    }

    // Both modes share the exact same height and target calculation
    alvoPosCamera.x = raioOrbita * cos(rotacaoOrbitaX) * sin(rotacaoOrbitaY);
    alvoPosCamera.y = raioOrbita * sin(rotacaoOrbitaX) + alturaFocoCamera;
    alvoPosCamera.z = raioOrbita * cos(rotacaoOrbitaX) * cos(rotacaoOrbitaY);
    alvoOlharCamera.set(0, alturaFocoCamera, 10);

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

        rotacaoOrbitaY += dx * 0.007; // positive = drag right → model rotates right
        rotacaoOrbitaX = constrain(rotacaoOrbitaX + dy * 0.007, -HALF_PI + 0.05, HALF_PI - 0.05);

        ultimoMouseX = mouseX;
        ultimoMouseY = mouseY;
    }
}

function mouseWheel(event) {
    // Only zoom when mouse is over the canvas
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        alvoRaioOrbita += event.delta * 0.5;
        alvoRaioOrbita = constrain(alvoRaioOrbita, ORBIT_MIN, ORBIT_MAX);
        return false; // prevent page scroll
    }
}

function onWindowResize() {
    let container = document.getElementById('container-canvas');
    let w = container.clientWidth;
    let h = container.clientHeight;
    resizeCanvas(w, h);
}
