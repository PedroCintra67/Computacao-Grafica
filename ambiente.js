// ======================================================
// CENÁRIO — AMBIENTE 3D DA LOJA E DA VITRINE
// ======================================================

// ======================================================
// MODO LOJA — AMBIENTE INTERNO (TATAMI + PAREDES + QUADROS)
// ======================================================

function DesenharAmbienteLoja() {
    noStroke();

    // Tatami (chão principal)
    meu_shader.setUniform('uMaterialType', 11);
    meu_shader.setUniform('uBaseColor', [0.65, 0.45, 0.25]);
    push(); translate(0, -112, 0); box(2000, 10, 2000); pop();

    // Parede dos fundos
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.55, 0.65, 0.50]);
    push(); translate(0, 300, -350); box(2000, 1000, 20); pop();

    // Quadros decorativos nas paredes
    let DesenharQuadro = function (img, x, z) {
        // Moldura (madeira escura)
        meu_shader.setUniform('uMaterialType', 10);
        meu_shader.setUniform('uBaseColor', [0.1, 0.08, 0.05]);
        push(); translate(x, 250, z - 3); box(160, 200, 5); pop();

        // Imagem interna
        if (img) {
            meu_shader.setUniform('uMaterialType', 6);
            meu_shader.setUniform('tex', img);
            push(); translate(x, 250, z); plane(145, 185); pop();
        }
    };

    DesenharQuadro(imagem_carlos, -320, -335);
    DesenharQuadro(imagem_helio,   320, -335);

    // Texto na parede (JIU JITSU)
    meu_shader.setUniform('uMaterialType', 6);
    meu_shader.setUniform('tex', textura_texto_parede);
    push();
    translate(0, 250, -339);
    scale(-1, 1, 1);
    plane(400, 160);
    pop();

    // Vasos decorativos (esquerda e direita)
    DesenharVasoEPlanta(-280, -310);
    DesenharVasoEPlanta(280, -310);
}

// ======================================================
// MODO VITRINE — FACHADA DA LOJA + MANEQUEINS
// ======================================================

function DesenharAmbienteVitrine() {
    noStroke();

    // Calçada (exterior)
    meu_shader.setUniform('uMaterialType', 11);
    meu_shader.setUniform('uBaseColor', [0.65, 0.45, 0.25]);
    push(); translate(0, -112, 100); box(5000, 10, 800); pop();

    // Chão interno da loja (atrás da vitrine)
    meu_shader.setUniform('uMaterialType', 11);
    meu_shader.setUniform('uBaseColor', [0.65, 0.45, 0.25]);
    push(); translate(0, -112, -400); box(5000, 10, 800); pop();

    // Parede dos fundos da loja — fundo em Y=-112, cresce para cima
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.55, 0.65, 0.50]);
    push(); translate(-50, 1444, -300); box(950, 3112, 20); pop();

    // Paredes laterais da loja — fundo em Y=-112, crescem para cima
    push(); translate(-525, 1444, -175); box(20, 3112, 250); pop();
    push(); translate(425,  1444, -175); box(20, 3112, 250); pop();

    // ===== FACHADA =====
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.55, 0.65, 0.50]);
    push();
    translate(0, 0, -50);

    // Parede superior (lintel) — fundo em Y=238 (topo da vitrine), cresce para cima
    push(); translate(-50, 1619, 0); box(950, 2762, 20); pop();

    // Parede lateral esquerda da fachada — fundo em Y=-112, cresce para cima
    push(); translate(-505, 1444, 0); box(40, 3112, 20); pop();

    // Porta fechada (vidro escuro)
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.1, 0.1, 0.12]);
    push(); translate(-410, 63, 0); box(150, 350, 10); pop();

    // Maçaneta da porta (prata)
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.8, 0.8, 0.85]);
    push(); translate(-350, 63, 0); sphere(10); pop();

    // Placa "ABERTO" pendurada na porta
    if (typeof textura_placa_aberto !== 'undefined' && textura_placa_aberto) {
        meu_shader.setUniform('uMaterialType', 6);
        meu_shader.setUniform('tex', textura_placa_aberto);
        push(); translate(-405, 180, 6); scale(-1, 1, 1); plane(90, 30); pop();
    }

    // Restaura cor da parede
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.55, 0.65, 0.50]);

    // Pilar entre porta e vitrine
    push(); translate(-300, 63, 0); box(70, 350, 20); pop();

    // Parede lateral direita da fachada — fundo em Y=-112, cresce para cima
    push(); translate(352.5, 1444, 0); box(145, 3112, 20); pop();

    pop(); // Fecha bloco da fachada (Z=-50)

    // Vaso decorativo na calçada
    DesenharVasoEPlanta(350, -20);

    // Letreiro da loja (agora cobrindo toda a parede verde acima da vitrine)
    if (textura_placa_vitrine) {
        meu_shader.setUniform('uMaterialType', 6);
        meu_shader.setUniform('tex', textura_placa_vitrine);
        push(); translate(-50, 1619, -39); scale(-1, 1, 1); plane(950, 2762); pop();
    }

    // Pedestais internos
    meu_shader.setUniform('uMaterialType', 0);
    meu_shader.setUniform('uBaseColor', [0.15, 0.15, 0.15]);
    push(); translate(0,    -95, -200); box(120, 15, 120); pop();
    push(); translate(0,    -50, -200); box(100, 80, 100); pop();
    push(); translate(-190, -95, -200); box(120, 15, 120); pop();
    push(); translate(-190, -50, -200); box(100, 80, 100); pop();
    push(); translate(200,  -95, -200); box(120, 15, 120); pop();
    push(); translate(200,  -50, -200); box(100, 80, 100); pop();
}

function DesenharManequeinsVitrine() {
    // Salvar estado atual da loja para restaurar após renderizar os manequeins
    let marca_blusa_orig   = estado_loja.blusa.marca;
    let marca_calca_orig   = estado_loja.calca.marca;
    let cor_blusa_orig     = estado_loja.blusa.cor;
    let cor_calca_orig     = estado_loja.calca.cor;
    let cor_faixa_orig     = estado_loja.faixa.cor;
    let tam_blusa_orig     = estado_loja.blusa.tamanho;
    let tam_calca_orig     = estado_loja.calca.tamanho;
    let tam_faixa_orig     = estado_loja.faixa.tamanho;
    let modo_antigo        = window.modo_app;

    window.modo_app = 'loja'; // Força o shader a exibir as marcas

    // Função local para renderizar um manequim completo
    const DesenharManequim = () => {
        let s_blusa  = ObterEscalaTamanho(estado_loja.blusa.tamanho);
        let s_calca  = ObterEscalaTamanho(estado_loja.calca.tamanho, 'calca');
        let s_faixa  = ObterEscalaTamanho(estado_loja.faixa.tamanho);

        push(); scale(s_blusa[0], s_blusa[1], s_blusa[2]); DesenharTroncoKimono(); pop();

        push();
        let dy_calca = 68 * s_blusa[1] - 68 * s_calca[1];
        translate(0, dy_calca, 0);
        scale(s_calca[0], s_calca[1], s_calca[2]);
        DesenharCalca();
        pop();

        push();
        let dy_faixa = 68 * s_blusa[1] - 68 * s_faixa[1];
        translate(0, dy_faixa, 0);
        scale(s_blusa[0], s_faixa[1], s_blusa[2]);
        DesenharFaixaENos();
        pop();
    };

    // Manequim 1 — Vouk Branco + Faixa Azul (A1)
    push();
    translate(-190, 0, -200);
    rotateY(radians(10));
    estado_loja.blusa.cor = 'white'; estado_loja.calca.cor = 'white'; estado_loja.faixa.cor = 'blue';
    estado_loja.blusa.marca = 'Vouk'; estado_loja.calca.marca = 'Vouk';
    estado_loja.blusa.tamanho = 'A1'; estado_loja.calca.tamanho = 'A1'; estado_loja.faixa.tamanho = 'A1';
    DesenharManequim();
    pop();

    // Manequim 2 — Atama Azul + Faixa Roxa (A2)
    push();
    translate(0, 0, -200);
    estado_loja.blusa.cor = 'blue'; estado_loja.calca.cor = 'blue'; estado_loja.faixa.cor = 'purple';
    estado_loja.blusa.marca = 'Atama'; estado_loja.calca.marca = 'Atama';
    estado_loja.blusa.tamanho = 'A2'; estado_loja.calca.tamanho = 'A2'; estado_loja.faixa.tamanho = 'A2';
    DesenharManequim();
    pop();

    // Manequim 3 — Kingz Preto + Faixa Preta (A3)
    push();
    translate(200, 0, -200);
    rotateY(radians(-10));
    estado_loja.blusa.cor = 'black'; estado_loja.calca.cor = 'black'; estado_loja.faixa.cor = 'black';
    estado_loja.blusa.marca = 'Kingz'; estado_loja.calca.marca = 'Kingz';
    estado_loja.blusa.tamanho = 'A3'; estado_loja.calca.tamanho = 'A3'; estado_loja.faixa.tamanho = 'A3';
    DesenharManequim();
    pop();

    // Restaurar estado original
    window.modo_app          = modo_antigo;
    estado_loja.blusa.marca  = marca_blusa_orig;
    estado_loja.calca.marca  = marca_calca_orig;
    estado_loja.blusa.cor    = cor_blusa_orig;
    estado_loja.calca.cor    = cor_calca_orig;
    estado_loja.faixa.cor    = cor_faixa_orig;
    estado_loja.blusa.tamanho = tam_blusa_orig;
    estado_loja.calca.tamanho = tam_calca_orig;
    estado_loja.faixa.tamanho = tam_faixa_orig;
}

function DesenharVidroVitrine() {
    // Desenhado por último (em main.js) para transparência não bugar o Z-buffer dos kimonos atrás
    resetShader();
    push();
    fill(180, 220, 255, 30);
    translate(0, 65, -50);
    box(580, 345, 5);
    pop();
    shader(meu_shader); // Religa o shader para o próximo frame
}

// ======================================================
// AUXILIAR — VASO COM PLANTA
// ======================================================

function DesenharVasoEPlanta(x, z) {
    // Vaso cerâmico fosco
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.12, 0.12, 0.12]);
    push(); translate(x, -67, z); cylinder(30, 80); pop();

    // Planta (cluster de esferas sobrepostas para simular folhagem)
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.15, 0.35, 0.15]);
    push(); translate(x,       -15, z);      sphere(35); pop();
    push(); translate(x,        15, z);      sphere(25); pop();
    push(); translate(x - 25,    0, z + 15); sphere(30); pop();
    push(); translate(x + 25,    0, z - 15); sphere(30); pop();
    push(); translate(x,          0, z + 20); sphere(30); pop();
}
