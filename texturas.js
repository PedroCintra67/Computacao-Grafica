// Funções de desenho de símbolo por marca

function DesenharSimboloAtama(g, x, y, s, cor_texto, logo_completo = true) {
    g.push();
    g.translate(x, y);
    g.scale(s);

    if (logo_completo) {
        g.noFill();
        g.stroke(cor_texto);
        g.strokeWeight(12);
        g.circle(0, 0, 110);
    }

    g.fill(cor_texto);
    g.noStroke();
    g.textAlign(CENTER, CENTER);
    g.textSize(70);
    g.textStyle(NORMAL);
    g.text("頭", 0, 0);

    if (logo_completo) {
        // Ornamentos laterais vermelhos (estilo clã)
        g.fill(220, 50, 30);
        g.noStroke();
        g.beginShape(); g.vertex(-68, 50); g.bezierVertex(-83, 30, -93, 0, -83, -30); g.bezierVertex(-88, -10, -78, 10, -68, 30); g.bezierVertex(-73, 10, -63, -10, -58, -20); g.bezierVertex(-63, 10, -68, 30, -58, 50); g.endShape(CLOSE);
        g.beginShape(); g.vertex(68, 50); g.bezierVertex(83, 30, 93, 0, 83, -30); g.bezierVertex(88, -10, 78, 10, 68, 30); g.bezierVertex(73, 10, 63, -10, 58, -20); g.bezierVertex(63, 10, 68, 30, 58, 50); g.endShape(CLOSE);
    }

    g.pop();
}

function DesenharSimboloVouk(g, x, y, s) {
    let verde_agua = color(69, 181, 170);
    let verde_escuro = color(40, 140, 130);
    let verde_claro = color(100, 210, 200);

    g.push();
    g.translate(x, y);
    g.scale(s);
    g.stroke(20, 100, 90);
    g.strokeWeight(3);

    // Geometria do lobo (pirâmide abstrata)
    g.fill(verde_agua); g.triangle(-30, -50, -15, -20, -45, -10);
    g.fill(verde_escuro); g.triangle(-30, -50, -10, -40, -15, -20);
    g.fill(verde_agua); g.triangle(30, -50, 15, -20, 45, -10);
    g.fill(verde_escuro); g.triangle(30, -50, 10, -40, 15, -20);
    g.fill(verde_claro); g.triangle(-15, -20, 15, -20, 0, 0);
    g.fill(verde_escuro); g.triangle(-15, -20, -45, -10, -30, 20);
    g.fill(verde_agua); g.triangle(-15, -20, -30, 20, 0, 0);
    g.fill(verde_escuro); g.triangle(15, -20, 45, -10, 30, 20);
    g.fill(verde_agua); g.triangle(15, -20, 30, 20, 0, 0);
    g.fill(verde_claro); g.triangle(-30, 20, 0, 0, 0, 40);
    g.fill(verde_agua); g.triangle(30, 20, 0, 0, 0, 40);
    g.fill(verde_escuro); g.triangle(-30, 20, 0, 40, -15, 50);
    g.fill(verde_agua); g.triangle(30, 20, 0, 40, 15, 50);
    g.fill(verde_claro); g.triangle(-15, 50, 15, 50, 0, 40);

    g.pop();
}

function DesenharSimboloKingz(g, x, y, s) {
    g.push();
    g.translate(x, y);
    g.scale(s);
    g.stroke(40, 160, 80);
    g.strokeWeight(8);
    g.fill(220, 200, 50); // Dourado

    // Coroa
    g.beginShape();
    g.vertex(-40, -30);
    g.vertex(-25, 10);
    g.vertex(0, -20);
    g.vertex(25, 10);
    g.vertex(40, -30);
    g.vertex(30, 40);
    g.vertex(0, 55);
    g.vertex(-30, 40);
    g.endShape(CLOSE);

    // Linha interna do chevron
    g.noFill();
    g.stroke(220, 220, 220);
    g.strokeWeight(4);
    g.beginShape();
    g.vertex(-22, 30);
    g.vertex(0, 45);
    g.vertex(22, 30);
    g.endShape();

    g.pop();
}

// Inicialização e atualização de texturas

function IniciarTexturas() {
    textura_vouk = createGraphics(256, 128);
    textura_peito_kingz_clara = createGraphics(256, 128);
    textura_peito_kingz_escura = createGraphics(256, 128);
    textura_ombro_kingz = createGraphics(256, 256);
    textura_peito_atama_clara = createGraphics(256, 128);
    textura_peito_atama_escura = createGraphics(256, 128);
    textura_ombro_atama_clara = createGraphics(256, 256);
    textura_ombro_atama_escura = createGraphics(256, 256);
    textura_ombro_vouk = createGraphics(256, 256);
    textura_calca_vouk = createGraphics(256, 256);
    textura_calca_atama_clara = createGraphics(256, 256);
    textura_calca_atama_escura = createGraphics(256, 256);
    textura_calca_kingz = createGraphics(256, 256);
    AtualizarCorTexturas();
}

function AtualizarCorTexturas() {
    let cor_clara = color(240);
    let cor_escura = color(20);

    // Funções auxiliares para evitar repetição de código
    const gerarPeitoAtama = (tex, cor) => {
        tex.clear();
        DesenharSimboloAtama(tex, 35, 64, 0.75, cor, false);
        tex.fill(cor);
        tex.noStroke();
        tex.textAlign(LEFT, CENTER);
        tex.textSize(50);
        tex.textStyle(BOLD);
        tex.text("ATAMA", 65, 64);
    };

    const gerarPeitoKingz = (tex, cor) => {
        tex.clear();
        tex.fill(cor);
        tex.noStroke();
        tex.textAlign(CENTER, CENTER);
        tex.textSize(55);
        tex.textStyle(ITALIC);
        tex.textFont('sans-serif');
        tex.text("KINGZ", 128, 64);
    };

    // Peito Vouk
    textura_vouk.clear();
    DesenharSimboloVouk(textura_vouk, 45, 90, 0.6);
    textura_vouk.fill(69, 181, 170);
    textura_vouk.noStroke();
    textura_vouk.textAlign(LEFT, CENTER);
    textura_vouk.textSize(55);
    textura_vouk.textStyle(BOLD);
    textura_vouk.text("VOUK", 85, 90);

    // Peito Atama
    gerarPeitoAtama(textura_peito_atama_clara, cor_clara);
    gerarPeitoAtama(textura_peito_atama_escura, cor_escura);

    // Peito Kingz
    gerarPeitoKingz(textura_peito_kingz_clara, cor_clara);
    gerarPeitoKingz(textura_peito_kingz_escura, cor_escura);

    // Ombros das marcas
    textura_ombro_atama_clara.clear();
    DesenharSimboloAtama(textura_ombro_atama_clara, 128, 128, 1.05, cor_clara);

    textura_ombro_atama_escura.clear();
    DesenharSimboloAtama(textura_ombro_atama_escura, 128, 128, 1.05, cor_escura);

    textura_ombro_kingz.clear();
    DesenharSimboloKingz(textura_ombro_kingz, 128, 128, 1.35);

    textura_ombro_vouk.clear();
    DesenharSimboloVouk(textura_ombro_vouk, 128, 128, 1.2);

    // Calças das marcas
    textura_calca_vouk.clear();
    DesenharSimboloVouk(textura_calca_vouk, 128, 128, 1.2);

    textura_calca_atama_clara.clear();
    DesenharSimboloAtama(textura_calca_atama_clara, 128, 128, 1.05, cor_clara);

    textura_calca_atama_escura.clear();
    DesenharSimboloAtama(textura_calca_atama_escura, 128, 128, 1.05, cor_escura);

    textura_calca_kingz.clear();
    DesenharSimboloKingz(textura_calca_kingz, 128, 128, 1.35);
}
