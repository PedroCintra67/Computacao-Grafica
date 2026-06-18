let meuShader;
let texturaPlacavitrine;

var modoApp = 'vitrine';

var estadoLoja = {
    passoAtual: 'blusa',
    blusa: { marca: 'Vouk', cor: 'white', tamanho: 'A2', preco: 330, equipado: false },
    calca: { marca: 'Vouk', cor: 'white', tamanho: 'A2', preco: 170, equipado: false },
    faixa: { cor: 'white', tamanho: 'A2', preco: 100, equipado: false },
    bordadoNome: false,
    bordadoEquipe: false
};

let modoCameraAtiva = 'front';

let texturaRashguard;
let texturaVouk, texturaPeitoKingzClara, texturaPeitoKingzEscura, texturaOmbroKingz;
let texturaPeitoAtamaClara, texturaPeitoAtamaEscura, texturaOmbroAtamaClara, texturaOmbroAtamaEscura, texturaOmbroVouk;
let texturaCalcaVouk, texturaCalcaAtamaClara, texturaCalcaAtamaEscura, texturaCalcaKingz;
let imgHelio, imgCarlos;
let texturaTextoParede;
let texturaPlacaAberto;
let modoCelShading = 0;

let raioOrbita = 900;
let alvoRaioOrbita = 900;
let alturaFocoCamera = 120;
let alvoAlturaFocoCamera = 120;
let posCamera, olharCamera;
let alvoPosCamera, alvoOlharCamera;
let rotacaoOrbitaX = 0.0;
let rotacaoOrbitaY = 0.0;
let estaArrastando = false;
let ultimoMouseX = 0;
let ultimoMouseY = 0;

const ORBIT_MIN = 200;
const ORBIT_MAX = 1200;

let texturaBordado;
let imgBordadoCache = null;
let nivelDesgaste = 0.0;
let atualizarBordadoFrame = false;
let nomeBordadoStr = "";
let equipeBordadoStr = "";

function updateWearLevel(val) {
    nivelDesgaste = val / 6.0;
}

function redrawEmbroidery() {
    let nameStr = document.getElementById('embroidery-name') ? document.getElementById('embroidery-name').value : "";
    let teamStr = document.getElementById('embroidery-team') ? document.getElementById('embroidery-team').value : "";

    if (!estadoLoja.bordadoNome) nameStr = "";
    if (!estadoLoja.bordadoEquipe) teamStr = "";

    // fallback apenas se ativo e vazio
    if (estadoLoja.bordadoNome && !nameStr) nameStr = "SEU NOME";
    if (estadoLoja.bordadoEquipe && !teamStr) teamStr = "SUA EQUIPE";

    texturaBordado.clear();
    texturaBordado.background(0, 0, 0, 0); // Fundo transparente
    
    // Cor preta para kimono claro, branco para escuro
    let giColorStr = 'white';
    if (typeof modoApp !== 'undefined' && modoApp === 'ecommerce' && typeof estadoLoja !== 'undefined') {
        giColorStr = estadoLoja.blusa.cor;
    } else if (typeof window !== 'undefined' && window.corKimonoAtual) {
        giColorStr = window.corKimonoAtual;
    } else if (typeof estadoLoja !== 'undefined' && estadoLoja.blusa) {
        giColorStr = estadoLoja.blusa.cor;
    }
    
    let isLightGi = (giColorStr === 'white' || giColorStr === 'branco' || giColorStr === '');
    if (isLightGi) {
        texturaBordado.fill(20); // Preto escuro
    } else {
        texturaBordado.fill(255); // Branco puro
    }
    
    // Função para diminuir a fonte se for muito longo
    function printFitText(txt, y, startSize) {
        let s = startSize;
        texturaBordado.textSize(s);
        while (texturaBordado.textWidth(txt) > 900 && s > 30) {
            s -= 5;
            texturaBordado.textSize(s);
        }
        texturaBordado.text(txt, 512, y);
    }

    if (nameStr) {
        // Nome nas costas altas (Altura das escápulas) — sem forçar maiúsculas
        printFitText(nameStr, 220, 100); // <-- O '100' é a fonte máxima do Nome
    }
    
    if (teamStr) {
        // Equipe na extremidade inferior da saia do kimono (Abaixo da faixa) — sem forçar maiúsculas
        printFitText(teamStr, 870, 80); // <-- O '80' é a fonte máxima da Equipe
    }
    
    imgBordadoCache = texturaBordado.get();
}

function applyEmbroideryName() {
    estadoLoja.bordadoNome = !estadoLoja.bordadoNome;
    redrawEmbroidery();
    if (typeof atualizarTotalCarrinho === 'function') atualizarTotalCarrinho();
    
    let btn = document.getElementById('btn-apply-name');
    if (btn) {
        if (estadoLoja.bordadoNome) {
            btn.innerText = "✓ Adicionado";
            btn.style.background = "#4ade80";
            btn.style.color = "#0f172a";
        } else {
            btn.innerText = "+R$ 40";
            btn.style.background = "#d4af37";
            btn.style.color = "black";
        }
    }
}

function resetEmbroideryState(type) {
    if (type === 'name' && estadoLoja.bordadoNome) {
        estadoLoja.bordadoNome = false;
        let btn = document.getElementById('btn-apply-name');
        if (btn) {
            btn.innerText = "+R$ 40";
            btn.style.background = "#d4af37";
            btn.style.color = "black";
        }
        redrawEmbroidery();
        if (typeof atualizarTotalCarrinho === 'function') atualizarTotalCarrinho();
    } else if (type === 'team' && estadoLoja.bordadoEquipe) {
        estadoLoja.bordadoEquipe = false;
        let btn = document.getElementById('btn-apply-team');
        if (btn) {
            btn.innerText = "+R$ 40";
            btn.style.background = "#d4af37";
            btn.style.color = "black";
        }
        redrawEmbroidery();
        if (typeof atualizarTotalCarrinho === 'function') atualizarTotalCarrinho();
    }
}

function applyEmbroideryTeam() {
    estadoLoja.bordadoEquipe = !estadoLoja.bordadoEquipe;
    redrawEmbroidery();
    if (typeof atualizarTotalCarrinho === 'function') atualizarTotalCarrinho();
    
    let btn = document.getElementById('btn-apply-team');
    if (btn) {
        if (estadoLoja.bordadoEquipe) {
            btn.innerText = "✓ Adicionado";
            btn.style.background = "#4ade80";
            btn.style.color = "#0f172a";
        } else {
            btn.innerText = "+R$ 40";
            btn.style.background = "#d4af37";
            btn.style.color = "black";
        }
    }
}

function preload() {
    meuShader = loadShader('vert.glsl', 'frag.glsl');
    imgHelio = loadImage('helio.jpg');
    imgCarlos = loadImage('carlos.jpg');
}

function setup() {
    let container = document.getElementById('container-canvas');
    let w = container.clientWidth || 700;
    let h = container.clientHeight || 550;
    let canvas = createCanvas(w, h, WEBGL);
    canvas.parent('container-canvas');

    texturaRashguard = createGraphics(1024, 1024);
    texturaRashguard.background(20);
    texturaRashguard.fill(255);
    texturaRashguard.textAlign(CENTER, CENTER);
    texturaRashguard.textSize(60);
    texturaRashguard.textStyle(BOLD);
    texturaRashguard.text("JIU\nJITSU", 256, 256);

    texturaBordado = createGraphics(1024, 1024);
    texturaBordado.textAlign(CENTER, CENTER);
    texturaBordado.textStyle(BOLD);
    
    // DEBUG: Desenhar um texto estático na inicialização
    texturaBordado.clear();
    texturaBordado.background(0, 0, 0, 0); // Fundo transparente
    texturaBordado.fill(255); // Texto Branco
    texturaBordado.textSize(160); // Aumentado
    texturaBordado.text("TESTE INICIAL", 512, 300);
    imgBordadoCache = texturaBordado.get(); // Extrai imagem real para o WebGL
    
    texturaTextoParede = createGraphics(800, 320);
    texturaTextoParede.clear();
    texturaTextoParede.fill(20, 15, 10);
    texturaTextoParede.textAlign(CENTER, CENTER);
    texturaTextoParede.textStyle(BOLD);
    texturaTextoParede.textFont('sans-serif');
    texturaTextoParede.textSize(120);
    texturaTextoParede.text('JIU - JITSU', 400, 80);

    texturaPlacavitrine = createGraphics(800, 320);
    texturaPlacavitrine.clear();
    texturaPlacavitrine.fill(0);
    texturaPlacavitrine.textAlign(CENTER, CENTER);
    texturaPlacavitrine.textStyle(BOLD);
    texturaPlacavitrine.textFont('sans-serif');
    texturaPlacavitrine.textSize(90);
    texturaPlacavitrine.text('ATACADO BJJ', 350, 100);
    texturaPlacavitrine.textSize(35);
    texturaPlacavitrine.fill(0);
    texturaPlacavitrine.text('A performance começa no conforto', 350, 200);

    texturaPlacaAberto = createGraphics(250, 80);
    texturaPlacaAberto.clear();
    texturaPlacaAberto.fill(255); // Fundo branco
    texturaPlacaAberto.noStroke();
    texturaPlacaAberto.rect(0, 0, 250, 80, 5); // Cantos bem menos arredondados
    texturaPlacaAberto.fill(0); // Verde da placa
    texturaPlacaAberto.textAlign(CENTER, CENTER);
    texturaPlacaAberto.textStyle(BOLD);
    texturaPlacaAberto.textFont('sans-serif');
    texturaPlacaAberto.textSize(45);
    texturaPlacaAberto.text('ABERTO', 128, 40);

    iniciarTexturas();

    posCamera = createVector(-100, 150, 750);
    olharCamera = createVector(-100, 60, 0);
    alvoPosCamera = posCamera.copy();
    alvoOlharCamera = olharCamera.copy();

    atualizarTotalCarrinho();
    window.addEventListener('resize', onWindowResize);
}

function draw() {
    if (modoApp === 'vitrine') {
        background(135, 206, 235);
    } else {
        background(230, 235, 240);
    }

    updateCameraPosition();
    camera(posCamera.x, posCamera.y, posCamera.z, olharCamera.x, olharCamera.y, olharCamera.z, 0, -1, 0);

    let uLightDir = [0.45, 0.55, 0.7];

    shader(meuShader);
    meuShader.setUniform('uLightDir', uLightDir);
    meuShader.setUniform('uCelShading', 0);
    meuShader.setUniform('uWearLevel', nivelDesgaste);
    meuShader.setUniform('uInvitrine', modoApp === 'vitrine' ? 1 : 0);
    meuShader.setUniform('uWireframe', 0);

    noStroke();

    if (modoApp === 'vitrine') {
        desenharAmbientevitrine();
    } else {
        drawEnvironment();
    }

    push();
    translate(0, 25, 0);
    
    // Gira a peça de roupa de acordo com o arrasto do mouse APENAS no Ecommerce
    if (modoApp === 'ecommerce') {
        rotateX(-rotacaoOrbitaX);
        rotateY(-rotacaoOrbitaY);
    }

    if (modoApp === 'ecommerce') {
        let viewportSub = document.getElementById('viewport-subtotal');
        if (viewportSub) viewportSub.style.display = 'block';

        let shouldDrawTop = false;
        let shouldDrawPants = false;
        let shouldDrawBelt = false;

        if (estadoLoja.passoAtual === 'blusa') shouldDrawTop = true;
        if (estadoLoja.passoAtual === 'calca') shouldDrawPants = true;
        if (estadoLoja.passoAtual === 'faixa') shouldDrawBelt = true;

        if (estadoLoja.passoAtual === 'cart') {
            shouldDrawTop = estadoLoja.blusa.equipado;
            shouldDrawPants = estadoLoja.calca.equipado;
            shouldDrawBelt = estadoLoja.faixa.equipado;
        }

        if (shouldDrawTop) {
            push();
            let sTop = obterEscalaTamanho(estadoLoja.blusa.tamanho);
            scale(sTop[0], sTop[1], sTop[2]);
            desenharTroncoKimono(texturaRashguard);
            pop();
        }

        if (shouldDrawPants) {
            push();
            let sPants = obterEscalaTamanho(estadoLoja.calca.tamanho, 'calca');
            let sTop = obterEscalaTamanho(estadoLoja.blusa.tamanho);

            let dy = 68 * sTop[1] - 68 * sPants[1];
            translate(0, dy, 0);

            let squeeze = (estadoLoja.passoAtual === 'cart' && shouldDrawTop) ? 0.65 : 1.0;
            meuShader.setUniform('uSqueezePantsTop', squeeze);

            scale(sPants[0], sPants[1], sPants[2]);
            if (typeof desenharCalcaFunc === 'function') desenharCalcaFunc();
            else if (typeof desenharCalca === 'function') desenharCalca();

            meuShader.setUniform('uSqueezePantsTop', 1.0);
            pop();
        }

        if (shouldDrawBelt) {
            push();
            let sBelt = obterEscalaTamanho(estadoLoja.faixa.tamanho);
            let sTop = obterEscalaTamanho(estadoLoja.blusa.tamanho);

            scale(sTop[0], sBelt[1], sTop[2]);

            let dy = 68 * sTop[1] - 68 * sBelt[1];
            translate(0, dy, 0);

            drawBeltAndKnot();
            pop();
        }
    } else {
        let viewportSub = document.getElementById('viewport-subtotal');
        if (viewportSub) viewportSub.style.display = 'none';

        drawvitrineMannequins();
    }

    pop(); // Restaura matriz antes de desenhar coisas flutuantes que não giram com os objetos

    // Desenha o vidro da vitrine POR ÚLTIMO na vitrine
    // Isso é essencial no WebGL para que a transparência não esconda (Z-buffer) os kimonos que estão atrás!
    if (modoApp === 'vitrine') {
        desenharVidrovitrine();
    }
}
