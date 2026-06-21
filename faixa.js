// Faixa e nós

function DesenharFaixaENos() {
    // Pega a cor diretamente do estado da loja 
    let cor_str = estado_loja.faixa.cor;

    let cor_faixa = [0.95, 0.95, 0.95]; // Branco padrão
    let e_coral = false;
    let e_coral_branca = false;

    if (cor_str === 'blue') cor_faixa = [0.1, 0.2, 0.6];
    else if (cor_str === 'purple') cor_faixa = [0.4, 0.1, 0.5];
    else if (cor_str === 'brown') cor_faixa = [0.35, 0.20, 0.05];
    else if (cor_str === 'black') cor_faixa = [0.1, 0.1, 0.1];
    else if (cor_str === 'coral') { cor_faixa = [0.8, 0.1, 0.1]; e_coral = true; }
    else if (cor_str === 'coral-white') { cor_faixa = [0.8, 0.1, 0.1]; e_coral_branca = true; }
    else if (cor_str === 'red') cor_faixa = [0.8, 0.1, 0.1];

    let y_faixa = 68;
    let raio_z = 36;

    // Malha da faixa (Em volta da cintura) 
    let estilo_faixa = 0;
    if (cor_str === 'coral') estilo_faixa = 1;
    else if (cor_str === 'coral-white') estilo_faixa = 2;

    push();

    meu_shader.setUniform('uBeltStyle', estilo_faixa);
    meu_shader.setUniform('uBaseColor', cor_faixa);
    meu_shader.setUniform('uMaterialType', 2);

    noStroke();

    if (typeof malha_faixa !== 'undefined' && malha_faixa) {
        model(malha_faixa); // Desenha a volta da faixa
    }
    pop();

    // Reset estilo para as pontas e nós (não queremos listras corais neles)
    meu_shader.setUniform('uBeltStyle', 0);
    meu_shader.setUniform('uMaterialType', 2);

    // Inclina levemente todo o nó para frente para não entrar dentro da barriga
    translate(0, y_faixa, 0);
    rotateX(radians(-5));
    translate(0, 0, 2);
    translate(0, -y_faixa, 0);

    // Nó central
    meu_shader.setUniform('uBaseColor', cor_faixa);
    noStroke();

    push();
    translate(0, y_faixa, raio_z);
    box(26, 18, 16);
    pop();

    // Pontas restantes
    let z_frente = raio_z + 4;

    // Ponta Direita 
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

    // Ponta Esquerda (com tarja de grau)
    push();
    translate(0, y_faixa, z_frente);
    rotateZ(radians(-38));
    rotateY(radians(8));

    let cor_ponta_esq = cor_faixa;
    if (cor_str === 'coral') cor_ponta_esq = [0.12, 0.12, 0.12]; // Preto
    else if (cor_str === 'coral-white') cor_ponta_esq = [0.95, 0.92, 0.78]; // Branco-creme

    // Trecho superior da ponta antes da tarja preta
    meu_shader.setUniform('uBaseColor', cor_ponta_esq);
    translate(0, -15, 0);
    box(12, 30, 6);

    // Tarja de graduação
    let espessura_listra = 1.2;

    let altura_tarja;
    let cor_tarja_principal;
    let cor_extremidade = null;

    if (cor_str === 'white' || cor_str === 'blue' || cor_str === 'purple' || cor_str === 'brown') {
        altura_tarja = 36.0;
        cor_tarja_principal = [0.10, 0.10, 0.10]; // Preta
    } else if (cor_str === 'black') {
        altura_tarja = 36.0;
        cor_tarja_principal = [0.80, 0.08, 0.08]; // Vermelha
        cor_extremidade = [0.95, 0.95, 0.95];     // Branca
    } else if (cor_str === 'coral') {
        altura_tarja = 36.0;
        cor_tarja_principal = [0.80, 0.08, 0.08];
        cor_extremidade = [0.95, 0.95, 0.95];
    } else if (cor_str === 'coral-white') {
        altura_tarja = 36.0;
        cor_tarja_principal = [0.80, 0.08, 0.08];
        cor_extremidade = [0.52, 0.52, 0.56];     // Cinza
    } else {
        altura_tarja = 36.0;
        cor_tarja_principal = [0.80, 0.08, 0.08];
        cor_extremidade = [0.80, 0.65, 0.15];     // Ouro
    }

    let deslocamento_centro_tarja = -(15.0 + altura_tarja / 2.0);
    translate(0, deslocamento_centro_tarja, 0);

    // Corpo central da tarja
    meu_shader.setUniform('uBaseColor', cor_tarja_principal);
    box(12.5, altura_tarja, 6.5);

    // Marcas brancas nas extremidades da tarja vermelha (apenas na faixa preta/coral)
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

    // Ponta inferior que sobra embaixo da tarja preta
    translate(0, -(altura_tarja / 2.0 + 6.0), 0);
    meu_shader.setUniform('uBaseColor', cor_ponta_esq);
    box(12, 12, 6);

    pop();
}
