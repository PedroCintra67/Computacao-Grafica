// ======================================================
// FAIXA E NÓS — GEOMETRIA E RENDERIZAÇÃO
// ======================================================

function DesenharFaixaENos() {
    let cor_str = 'white';
    let graus = 0;

    if (typeof modo_app !== 'undefined' && modo_app === 'classic') {
        cor_str = (typeof currentBelt !== 'undefined') ? currentBelt : 'white';
        graus   = (typeof currentDegrees !== 'undefined') ? currentDegrees : 0;
    } else {
        cor_str = (typeof estado_loja !== 'undefined') ? estado_loja.faixa.cor : 'white';
        graus   = 0;
    }

    let cor_faixa   = [1, 1, 1];
    let e_coral      = false;
    let e_coral_branca = false;

    if      (cor_str === 'white')       cor_faixa = [0.95, 0.95, 0.95];
    else if (cor_str === 'blue')        cor_faixa = [0.1, 0.2, 0.6];
    else if (cor_str === 'purple')      cor_faixa = [0.4, 0.1, 0.5];
    else if (cor_str === 'brown')       cor_faixa = [0.35, 0.20, 0.05];
    else if (cor_str === 'black')       cor_faixa = [0.1, 0.1, 0.1];
    else if (cor_str === 'coral')       { cor_faixa = [0.8, 0.1, 0.1]; e_coral = true; }
    else if (cor_str === 'coral-white') { cor_faixa = [0.8, 0.1, 0.1]; e_coral_branca = true; }
    else if (cor_str === 'red')         cor_faixa = [0.8, 0.1, 0.1];

    let y_faixa   = 68;
    let raio_z    = 36;

    // ===== MALHA DA FAIXA =====
    let estilo_faixa = 0; // Sólido por padrão
    if (cor_str === 'coral')       estilo_faixa = 1;
    else if (cor_str === 'coral-white') estilo_faixa = 2;

    push();

    meu_shader.setUniform('uMaterialType', 5);
    meu_shader.setUniform('uBeltStyle', estilo_faixa);
    meu_shader.setUniform('uBaseColor', cor_faixa);
    meu_shader.setUniform('uMaterialType', 2);

    push();
    noStroke();
    if (typeof malha_faixa !== 'undefined' && malha_faixa) {
        model(malha_faixa);
    }
    pop();

    // Reset estilo para nó e pontas
    meu_shader.setUniform('uBeltStyle', 0);
    meu_shader.setUniform('uMaterialType', 2);

    // Inclina levemente para frente e avança na fachada para evitar clipping
    translate(0, y_faixa, 0);
    rotateX(radians(-5));
    translate(0, 0, 2);
    translate(0, -y_faixa, 0);

    // ===== NÓ CENTRAL =====
    meu_shader.setUniform('uBaseColor', cor_faixa);
    noStroke();

    push();
    translate(0, y_faixa, raio_z);
    box(26, 18, 16);
    pop();

    // ===== PONTAS PENDENTES =====
    let z_frente = raio_z + 4;

    // --- Ponta Direita ---
    push();
    translate(0, y_faixa, z_frente);
    rotateZ(radians(38));
    rotateY(radians(-8));

    if (cor_str === 'coral' || cor_str === 'coral-white') {
        meu_shader.setUniform('uBaseColor', [0.78, 0.08, 0.08]);
    } else {
        meu_shader.setUniform('uBaseColor', cor_faixa);
    }

    translate(0, -39, 0);
    box(12, 78, 6);
    pop();

    // --- Ponta Esquerda (com tarja de grau) ---
    push();
    translate(0, y_faixa, z_frente);
    rotateZ(radians(-38));
    rotateY(radians(8));

    let cor_ponta_esq = cor_faixa;
    if      (cor_str === 'coral')       cor_ponta_esq = [0.12, 0.12, 0.12]; // Preto
    else if (cor_str === 'coral-white') cor_ponta_esq = [0.95, 0.92, 0.78]; // Branco-creme

    // Trecho superior da ponta
    meu_shader.setUniform('uBaseColor', cor_ponta_esq);
    translate(0, -15, 0);
    box(12, 30, 6);

    // --- TARJA DE GRADUAÇÃO ---
    let espessura_listra = 1.2;
    let n_graus = graus;

    let altura_tarja;
    let cor_tarja_principal;
    let cor_extremidade = null;

    if (cor_str === 'white' || cor_str === 'blue' || cor_str === 'purple' || cor_str === 'brown') {
        altura_tarja       = 36.0;
        cor_tarja_principal = [0.10, 0.10, 0.10]; // Preta
    } else if (cor_str === 'black') {
        altura_tarja       = 36.0;
        cor_tarja_principal = [0.80, 0.08, 0.08]; // Vermelha
        cor_extremidade     = [0.95, 0.95, 0.95]; // Branca
    } else if (cor_str === 'coral') {
        altura_tarja       = 36.0;
        cor_tarja_principal = [0.80, 0.08, 0.08];
        cor_extremidade     = [0.95, 0.95, 0.95];
    } else if (cor_str === 'coral-white') {
        altura_tarja       = 36.0;
        cor_tarja_principal = [0.80, 0.08, 0.08];
        cor_extremidade     = [0.52, 0.52, 0.56]; // Cinza
    } else {
        altura_tarja       = 36.0;
        cor_tarja_principal = [0.80, 0.08, 0.08];
        cor_extremidade     = [0.80, 0.65, 0.15]; // Ouro
    }

    let deslocamento_centro_tarja = -(15.0 + altura_tarja / 2.0);
    translate(0, deslocamento_centro_tarja, 0);

    // Corpo da tarja
    meu_shader.setUniform('uBaseColor', cor_tarja_principal);
    box(12.5, altura_tarja, 6.5);

    // Marcas de extremidade
    if (cor_extremidade !== null) {
        meu_shader.setUniform('uBaseColor', cor_extremidade);

        push();
        translate(0, -(altura_tarja / 2) + 2.5, 0.6);
        box(12.6, 5, 6.7);
        pop();

        push();
        translate(0, (altura_tarja / 2) - 2.5, 0.6);
        box(12.6, 5, 6.7);
        pop();
    }

    // --- LISTRAS DE GRAU ---
    if (n_graus > 0) {
        meu_shader.setUniform('uBaseColor', [0.98, 0.98, 0.98]);

        let inicio_utilizavel = (cor_extremidade !== null) ? -(altura_tarja / 2) + 5.0 : -(altura_tarja / 2);
        let altura_utilizavel = (cor_extremidade !== null) ? altura_tarja - 10.0 : altura_tarja;

        let max_graus;
        if      (cor_str === 'white' || cor_str === 'blue' || cor_str === 'purple' || cor_str === 'brown') max_graus = 4;
        else if (cor_str === 'black')       max_graus = 6;
        else if (cor_str === 'coral')       max_graus = 7;
        else if (cor_str === 'coral-white') max_graus = 8;
        else                                max_graus = 9;

        let altura_slot   = altura_utilizavel / max_graus;
        let centro_slot_0 = inicio_utilizavel + altura_slot / 2;

        for (let i = 0; i < n_graus; i++) {
            push();
            translate(0, centro_slot_0 + i * altura_slot, 0.6);
            box(10, espessura_listra, 7);
            pop();
        }
    }

    // Ponta inferior (abaixo da tarja)
    translate(0, -(altura_tarja / 2.0 + 6.0), 0);
    meu_shader.setUniform('uBaseColor', cor_ponta_esq);
    box(12, 12, 6);

    pop(); // Fecha ponta esquerda
    pop(); // Fecha transformação global da faixa
}

// ======================================================
// AUXILIAR — retorna cor da faixa como [R, G, B] (não usada internamente, mantida para compatibilidade)
// ======================================================
function ObterCorFaixa(nome_faixa) {
    switch (nome_faixa) {
        case 'white':       return [0.98, 0.98, 0.98];
        case 'blue':        return [0.08, 0.35, 0.85];
        case 'purple':      return [0.45, 0.18, 0.75];
        case 'brown':       return [0.36, 0.22, 0.15];
        case 'black':       return [0.12, 0.12, 0.12];
        case 'coral':       return [0.78, 0.08, 0.08];
        case 'coral-white': return [0.78, 0.08, 0.08];
        case 'red':         return [0.85, 0.08, 0.08];
        case 'red-gracie':  return [0.85, 0.08, 0.08];
        default:            return [0.98, 0.98, 0.98];
    }
}
