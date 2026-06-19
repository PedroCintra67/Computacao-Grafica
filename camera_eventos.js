// ======================================================
// CONTROLES DE CÂMERA E EVENTOS DE MOUSE
// ======================================================

function AtualizarPosicaoCamera() {
    raio_orbita = lerp(raio_orbita, alvo_raio_orbita, 0.1);
    altura_foco_camera = lerp(altura_foco_camera, alvo_altura_foco_camera, 0.08);

    if (modo_app === 'Vitrine') {
        // Câmera totalmente fixa no modo Vitrine
        alvo_pos_camera.x = -50;
        alvo_pos_camera.y = altura_foco_camera;
        alvo_pos_camera.z = raio_orbita;
        alvo_olhar_camera.set(-50, altura_foco_camera, 0);

        rotacao_orbita_x = 0;
        rotacao_orbita_y = 0;

    } else {
        // Retorno suave ao centro quando o mouse é solto
        if (!esta_arrastando) {
            rotacao_orbita_y = atan2(sin(rotacao_orbita_y), cos(rotacao_orbita_y));
            rotacao_orbita_x = lerp(rotacao_orbita_x, 0.0, 0.04);
            rotacao_orbita_y = lerp(rotacao_orbita_y, 0.0, 0.04);
        }

        // Câmera parada — apenas o objeto gira
        alvo_pos_camera.x = 0;
        alvo_pos_camera.y = altura_foco_camera;
        alvo_pos_camera.z = raio_orbita;
        alvo_olhar_camera.set(0, altura_foco_camera, 10);
    }

    pos_camera.lerp(alvo_pos_camera, 0.08);
    olhar_camera.lerp(alvo_olhar_camera, 0.08);
}

// p5.js — não pode ser renomeado
function mousePressed() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        esta_arrastando = true;
        ultimo_mouse_x = mouseX;
        ultimo_mouse_y = mouseY;
    }
}

// p5.js — não pode ser renomeado
function mouseReleased() {
    esta_arrastando = false;
}

// p5.js — não pode ser renomeado
function mouseDragged() {
    if (esta_arrastando) {
        let dx = mouseX - ultimo_mouse_x;
        let dy = mouseY - ultimo_mouse_y;

        // Rotação do objeto apenas no modo loja
        if (modo_app !== 'Vitrine') {
            rotacao_orbita_y += dx * 0.007; // Dá a volta (girar pros lados)
            // Rotação cima/baixo removida
            // rotacao_orbita_x = constrain(rotacao_orbita_x + dy * 0.007, -HALF_PI + 0.05, HALF_PI - 0.05);
        }

        ultimo_mouse_x = mouseX;
        ultimo_mouse_y = mouseY;
    }
}

// p5.js — não pode ser renomeado
function mouseWheel(event) {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        alvo_raio_orbita += event.delta * 0.5;

        if (modo_app === 'Vitrine') {
            alvo_raio_orbita = constrain(alvo_raio_orbita, ORBITA_MINIMA, 900);
        } else {
            alvo_raio_orbita = constrain(alvo_raio_orbita, ORBITA_MINIMA, 600);
        }

        return false;
    }
}

function AoRedimensionarJanela() {
    let container = document.getElementById('container-canvas');
    let w = container.clientWidth;
    let h = container.clientHeight;
    resizeCanvas(w, h);
}
