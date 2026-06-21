// Atualiza posições e mira da câmera com interpolação suave

function AtualizarPosicaoCamera() {
    raio_orbita = lerp(raio_orbita, alvo_raio_orbita, 0.1);
    altura_foco_camera = lerp(altura_foco_camera, alvo_altura_foco_camera, 0.08);

    if (modo_app === 'Vitrine') {
        // Câmera fixa voltada para os pedestais
        alvo_pos_camera.set(-50, altura_foco_camera, raio_orbita);
        alvo_olhar_camera.set(-50, altura_foco_camera, 0);

        rotacao_orbita_x = 0;
        rotacao_orbita_y = 0;
    } else {
        // Retorno suave ao centro quando o mouse é solto
        if (!esta_arrastando) {
          // Volta para a visão frontal de forma otimizada, sem dar voltas
            rotacao_orbita_y = atan2(sin(rotacao_orbita_y), cos(rotacao_orbita_y));
            rotacao_orbita_x = lerp(rotacao_orbita_x, 0.0, 0.04);
            rotacao_orbita_y = lerp(rotacao_orbita_y, 0.0, 0.04);
        }

        // Câmera parada (apenas o modelo 3D gira)
        alvo_pos_camera.set(0, altura_foco_camera, raio_orbita);
        alvo_olhar_camera.set(0, altura_foco_camera, 10);
    }

    pos_camera.lerp(alvo_pos_camera, 0.08);
    olhar_camera.lerp(alvo_olhar_camera, 0.08);
}

function mousePressed() {
    // Interação permitida apenas dentro da área do canvas
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        esta_arrastando = true;
        ultimo_mouse_x = mouseX;
    }
}

function mouseReleased() {
    esta_arrastando = false;
}

function mouseDragged() {
    if (esta_arrastando) {
        let dx = mouseX - ultimo_mouse_x;
        if (modo_app !== 'Vitrine') {
            rotacao_orbita_y += dx * 0.007; // Usa o arrasto horizontal para girar o modelo
        }
        ultimo_mouse_x = mouseX;
    }
}

function mouseWheel(event) {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        alvo_raio_orbita += event.delta * 0.5; // Zoom pelo scroll do mouse

        // Limites de aproximação e afastamento por modo de visualização
        if (modo_app === 'Vitrine') {
            alvo_raio_orbita = constrain(alvo_raio_orbita, 200, 900);
        } else {
            alvo_raio_orbita = constrain(alvo_raio_orbita, 200, 600);
        }

        return false; // Bloqueia a rolagem natural da página inteira
    }
}

function AoRedimensionarJanela() {
    let container = document.getElementById('container-canvas');
    let w = container.clientWidth;
    let h = container.clientHeight;
    resizeCanvas(w, h);
}