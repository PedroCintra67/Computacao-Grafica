// Ambiente interno da loja (Dojo)
// Lembrete da Física do Mundo: 
// +Y cresce para CIMA (Teto), -Y desce para o CHÃO.
// +X cresce para a ESQUERDA, -X para a DIREITA.

function DesenharAmbienteLoja() {
    noStroke();

    // Tatame (chao principal)
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
    DesenharQuadro(imagem_helio, 320, -335);

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

// Ambiente externo da vitrine

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

    // Parede dos fundos da loja
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.55, 0.65, 0.50]);
    push(); translate(-50, 1444, -300); box(950, 3112, 20); pop();

    // Paredes laterais da loja — fundo em Y=-112, crescem para cima
    push(); translate(-525, 1444, -175); box(20, 3112, 250); pop();
    push(); translate(425, 1444, -175); box(20, 3112, 250); pop();

    // Fachada da loja
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.55, 0.65, 0.50]);
    push();
    translate(0, 0, -50);

    // Parede superior (lintel)
    push(); translate(-50, 1619, 0); box(950, 2762, 20); pop();

    // Parede lateral esquerda da fachada
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

    // Parede lateral direita da fachada
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
    [0, -190, 200].forEach(x => {
        push(); translate(x, -95, -200); box(120, 15, 120); pop(); // Base
        push(); translate(x, -50, -200); box(100, 80, 100); pop(); // Corpo
    });
}

function DesenharManequeinsVitrine() {
    // Truque de "Salvar e Restaurar Estado"
    // Tiramos uma foto das escolhas do usuário no carrinho para não estragar a customização
    // enquanto desenhamos os 3 manequins fixos no fundo da loja.
    let marca_blusa_orig = estado_loja.blusa.marca;
    let marca_calca_orig = estado_loja.calca.marca;
    let cor_blusa_orig = estado_loja.blusa.cor;
    let cor_calca_orig = estado_loja.calca.cor;
    let cor_faixa_orig = estado_loja.faixa.cor;
    let tam_blusa_orig = estado_loja.blusa.tamanho;
    let tam_calca_orig = estado_loja.calca.tamanho;
    let tam_faixa_orig = estado_loja.faixa.tamanho;
    let modo_antigo = window.modo_app;

    window.modo_app = 'loja'; // Força o shader a exibir as marcas

    // Função local para renderizar um manequim completo (O Lego Geométrico)
    const DesenharManequim = () => {
        let s_blusa = ObterEscalaTamanho(estado_loja.blusa.tamanho); // Ex: A3 -> [1.1, 1.1, 1.1]
        let s_calca = ObterEscalaTamanho(estado_loja.calca.tamanho, 'calca');
        let s_faixa = ObterEscalaTamanho(estado_loja.faixa.tamanho);

        // 1. Desenha a blusa normal pelo centro do boneco
        push(); scale(s_blusa[0], s_blusa[1], s_blusa[2]); DesenharTroncoKimono(); pop();

        // 2. A Matemática da Calça:
        // O Y=68 é a altura padrão da cintura. A fórmula abaixo calcula quantos
        // milímetros a calça precisa subir ou descer para não descolar da blusa
        // caso os tamanhos das peças sejam misturados (ex: Blusa A4, Calça A1).
        push();
        let dy_calca = 68 * s_blusa[1] - 68 * s_calca[1];
        translate(0, dy_calca, 0);
        scale(s_calca[0], s_calca[1], s_calca[2]);
        DesenharCalca();
        pop();

        // 3. A Matemática da Faixa:
        // Assim como a calça, ela sofre compensação na altura (Y) pra achar a cintura.
        // E usamos a LARGURA e PROFUNDIDADE da blusa (s_blusa[0] e [2]) no Scale
        // para que a faixa "abrace" a barriga e não afunde dentro do tecido!
        push();
        let dy_faixa = 68 * s_blusa[1] - 68 * s_faixa[1];
        translate(0, dy_faixa, 0);
        scale(s_blusa[0], s_faixa[1], s_blusa[2]);
        DesenharFaixaENos();
        pop();
    };

    // Função para montar um manequim inteiro em 1 linha
    const MontarManequim = (x, rotZ, marca, corGi, corFaixa, tamanho) => {
        push();
        translate(x, 0, -200);
        if (rotZ !== 0) rotateY(radians(rotZ));

        estado_loja.blusa.cor = corGi; estado_loja.calca.cor = corGi; estado_loja.faixa.cor = corFaixa;
        estado_loja.blusa.marca = marca; estado_loja.calca.marca = marca;
        estado_loja.blusa.tamanho = tamanho; estado_loja.calca.tamanho = tamanho; estado_loja.faixa.tamanho = tamanho;

        DesenharManequim();
        pop();
    };

    MontarManequim(-190, 10, 'Vouk', 'white', 'blue', 'A1');   // Manequim 1
    MontarManequim(0, 0, 'Atama', 'blue', 'purple', 'A2');     // Manequim 2
    MontarManequim(200, -10, 'Kingz', 'black', 'black', 'A3'); // Manequim 3

    // Restaurar estado original
    window.modo_app = modo_antigo;
    estado_loja.blusa.marca = marca_blusa_orig;
    estado_loja.calca.marca = marca_calca_orig;
    estado_loja.blusa.cor = cor_blusa_orig;
    estado_loja.calca.cor = cor_calca_orig;
    estado_loja.faixa.cor = cor_faixa_orig;
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

function DesenharVasoEPlanta(x, z) {
    // Vaso cerâmico fosco
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.12, 0.12, 0.12]);
    push(); translate(x, -67, z); cylinder(30, 80); pop();

    // Planta (cluster de esferas sobrepostas para simular folhagem)
    meu_shader.setUniform('uMaterialType', 10);
    meu_shader.setUniform('uBaseColor', [0.15, 0.35, 0.15]);
    push(); translate(x, -15, z); sphere(35); pop();
    push(); translate(x, 15, z); sphere(25); pop();
    push(); translate(x - 25, 0, z + 15); sphere(30); pop();
    push(); translate(x + 25, 0, z - 15); sphere(30); pop();
    push(); translate(x, 0, z + 20); sphere(30); pop();
}
