function iniciarTexturas() {
    texturaVouk = createGraphics(256, 128);
    texturaPeitoKingzClara = createGraphics(256, 128); // White text
    texturaPeitoKingzEscura = createGraphics(256, 128); // Black text
    texturaOmbroKingz = createGraphics(256, 256); // Square for plane
    texturaPeitoAtamaClara = createGraphics(256, 128); // White text
    texturaPeitoAtamaEscura = createGraphics(256, 128); // Black text
    texturaOmbroAtamaClara = createGraphics(256, 256);
    texturaOmbroAtamaEscura = createGraphics(256, 256);
    texturaOmbroVouk = createGraphics(256, 256);
    texturaCalcaVouk = createGraphics(256, 256);
    texturaCalcaAtamaClara = createGraphics(256, 256);
    texturaCalcaAtamaEscura = createGraphics(256, 256);
    texturaCalcaKingz = createGraphics(256, 256);
    atualizarCorTexturas();
}

function drawAtamaSymbol(g, x, y, s, txtColor, fullLogo = true) {
    g.push(); g.translate(x, y); g.scale(s);
    if (fullLogo) {
        g.noFill(); g.stroke(txtColor); g.strokeWeight(12); g.circle(0, 0, 110);
    }
    g.fill(txtColor); g.noStroke(); g.textAlign(CENTER, CENTER); g.textSize(70); g.textStyle(NORMAL); g.text("頭", 0, 0);
    if (fullLogo) {
        g.fill(220, 50, 30); g.noStroke();
        g.beginShape(); g.vertex(-68, 50); g.bezierVertex(-83, 30, -93, 0, -83, -30); g.bezierVertex(-88, -10, -78, 10, -68, 30); g.bezierVertex(-73, 10, -63, -10, -58, -20); g.bezierVertex(-63, 10, -68, 30, -58, 50); g.endShape(CLOSE);
        g.beginShape(); g.vertex(68, 50); g.bezierVertex(83, 30, 93, 0, 83, -30); g.bezierVertex(88, -10, 78, 10, 68, 30); g.bezierVertex(73, 10, 63, -10, 58, -20); g.bezierVertex(63, 10, 68, 30, 58, 50); g.endShape(CLOSE);
    }
    g.pop();
}

function drawVoukSymbol(g, x, y, s) {
    let tealColor = color(69, 181, 170); let darkTeal = color(40, 140, 130); let lightTeal = color(100, 210, 200);
    g.push(); g.translate(x, y); g.scale(s); g.stroke(20, 100, 90); g.strokeWeight(3);
    g.fill(tealColor); g.triangle(-30, -50, -15, -20, -45, -10); g.fill(darkTeal); g.triangle(-30, -50, -10, -40, -15, -20); g.fill(tealColor); g.triangle(30, -50, 15, -20, 45, -10); g.fill(darkTeal); g.triangle(30, -50, 10, -40, 15, -20); g.fill(lightTeal); g.triangle(-15, -20, 15, -20, 0, 0); g.fill(darkTeal); g.triangle(-15, -20, -45, -10, -30, 20); g.fill(tealColor); g.triangle(-15, -20, -30, 20, 0, 0); g.fill(darkTeal); g.triangle(15, -20, 45, -10, 30, 20); g.fill(tealColor); g.triangle(15, -20, 30, 20, 0, 0); g.fill(lightTeal); g.triangle(-30, 20, 0, 0, 0, 40); g.fill(tealColor); g.triangle(30, 20, 0, 0, 0, 40); g.fill(darkTeal); g.triangle(-30, 20, 0, 40, -15, 50); g.fill(tealColor); g.triangle(30, 20, 0, 40, 15, 50); g.fill(lightTeal); g.triangle(-15, 50, 15, 50, 0, 40);
    g.pop();
}

function drawKingzSymbol(g, x, y, s) {
    g.push();
    g.translate(x, y); // Center in square
    g.scale(s); // Make it slightly larger
    g.stroke(40, 160, 80); // Green edge
    g.strokeWeight(8);
    g.fill(220, 200, 50); // Yellow/Gold
    g.beginShape();
    g.vertex(-40, -30); // Top left point
    g.vertex(-25, 10);  // inner left
    g.vertex(0, -20);   // top center point
    g.vertex(25, 10);   // inner right
    g.vertex(40, -30);  // top right point
    g.vertex(30, 40);   // bottom right
    g.vertex(0, 55);    // bottom center (chevron)
    g.vertex(-30, 40);  // bottom left
    g.endShape(CLOSE);
    // Draw an inner line at the bottom chevron
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

function atualizarCorTexturas() {
    let whiteText = color(240);
    let blackText = color(20);

    // Vouk Chest (Symbol + Text lower on chest)
    texturaVouk.clear();
    drawVoukSymbol(texturaVouk, 45, 90, 0.6); // Movido para a esquerda para o texto caber
    texturaVouk.fill(69, 181, 170); // Verde igual do símbolo
    texturaVouk.noStroke(); texturaVouk.textAlign(LEFT, CENTER); texturaVouk.textSize(55); texturaVouk.textStyle(BOLD);
    texturaVouk.text("VOUK", 85, 90);

    // Atama Chest (Symbol + Text) - Clara
    texturaPeitoAtamaClara.clear();
    drawAtamaSymbol(texturaPeitoAtamaClara, 35, 64, 0.75, whiteText, false);
    texturaPeitoAtamaClara.fill(whiteText);
    texturaPeitoAtamaClara.noStroke(); texturaPeitoAtamaClara.textAlign(LEFT, CENTER); texturaPeitoAtamaClara.textSize(50); texturaPeitoAtamaClara.textStyle(BOLD);
    texturaPeitoAtamaClara.text("ATAMA", 65, 64);

    // Atama Chest (Symbol + Text) - Escura
    texturaPeitoAtamaEscura.clear();
    drawAtamaSymbol(texturaPeitoAtamaEscura, 35, 64, 0.75, blackText, false);
    texturaPeitoAtamaEscura.fill(blackText);
    texturaPeitoAtamaEscura.noStroke(); texturaPeitoAtamaEscura.textAlign(LEFT, CENTER); texturaPeitoAtamaEscura.textSize(50); texturaPeitoAtamaEscura.textStyle(BOLD);
    texturaPeitoAtamaEscura.text("ATAMA", 65, 64);

    // Atama Shoulder (Only Symbol)
    texturaOmbroAtamaClara.clear();
    drawAtamaSymbol(texturaOmbroAtamaClara, 128, 128, 1.05, whiteText);

    texturaOmbroAtamaEscura.clear();
    drawAtamaSymbol(texturaOmbroAtamaEscura, 128, 128, 1.05, blackText);

    // Kingz Shoulder (Crown)
    texturaOmbroKingz.clear();
    drawKingzSymbol(texturaOmbroKingz, 128, 128, 1.35);

    // Vouk Shoulder (Only Geometric Wolf)
    texturaOmbroVouk.clear();
    drawVoukSymbol(texturaOmbroVouk, 128, 128, 1.2);

    // Kingz Chest/Lapel (KINGZ) - Clara
    texturaPeitoKingzClara.clear();
    texturaPeitoKingzClara.fill(whiteText);
    texturaPeitoKingzClara.noStroke();
    texturaPeitoKingzClara.textAlign(CENTER, CENTER);
    texturaPeitoKingzClara.textSize(55); 
    texturaPeitoKingzClara.textStyle(ITALIC);
    texturaPeitoKingzClara.textFont('sans-serif');
    texturaPeitoKingzClara.text("KINGZ", 128, 64);

    // Kingz Chest/Lapel (KINGZ) - Escura
    texturaPeitoKingzEscura.clear();
    texturaPeitoKingzEscura.fill(blackText);
    texturaPeitoKingzEscura.noStroke();
    texturaPeitoKingzEscura.textAlign(CENTER, CENTER);
    texturaPeitoKingzEscura.textSize(55); 
    texturaPeitoKingzEscura.textStyle(ITALIC);
    texturaPeitoKingzEscura.textFont('sans-serif');
    texturaPeitoKingzEscura.text("KINGZ", 128, 64);

    // --- TEXTURAS EXCLUSIVAS PARA AS CALÇAS ---
    texturaCalcaVouk.clear();
    drawVoukSymbol(texturaCalcaVouk, 128, 128, 1.2);

    texturaCalcaAtamaClara.clear();
    drawAtamaSymbol(texturaCalcaAtamaClara, 128, 128, 1.05, whiteText);

    texturaCalcaAtamaEscura.clear();
    drawAtamaSymbol(texturaCalcaAtamaEscura, 128, 128, 1.05, blackText);

    texturaCalcaKingz.clear();
    drawKingzSymbol(texturaCalcaKingz, 128, 128, 1.35);
}
