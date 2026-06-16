let meuShader;
let texturaPlacaBoutique;

var modoApp = 'boutique';

var estadoLoja = {
    passoAtual: 'blusa',
    blusa: { marca: 'Vouk', cor: 'white', tamanho: 'A2', preco: 330, equipado: false },
    calca: { marca: 'Vouk', cor: 'white', tamanho: 'A2', preco: 170, equipado: false },
    faixa: { cor: 'white', tamanho: 'A2', preco: 100, equipado: false }
};

let modoCameraAtiva = 'front';

let texturaRashguard;
let texturaVouk, texturaPeitoKingzClara, texturaPeitoKingzEscura, texturaOmbroKingz;
let texturaPeitoAtamaClara, texturaPeitoAtamaEscura, texturaOmbroAtamaClara, texturaOmbroAtamaEscura, texturaOmbroVouk;
let texturaCalcaVouk, texturaCalcaAtamaClara, texturaCalcaAtamaEscura, texturaCalcaKingz;
let imgHelio, imgCarlos;
let texturaTextoParede;
let modoCelShading = 0;

let alturaFocoCamera = 35;
let alvoAlturaFocoCamera = 35;
let posCamera, olharCamera;
let alvoPosCamera, alvoOlharCamera;

let raioOrbita = 700;
let alvoRaioOrbita = 700;
const ORBIT_MIN = 200;
const ORBIT_MAX = 900;
let rotacaoOrbitaX = 0.1;
let rotacaoOrbitaY = 0.0;
let estaArrastando = false;
let ultimoMouseX = 0;
let ultimoMouseY = 0;



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

    texturaTextoParede = createGraphics(800, 320);
    texturaTextoParede.clear();
    texturaTextoParede.fill(20, 15, 10);
    texturaTextoParede.textAlign(CENTER, CENTER);
    texturaTextoParede.textStyle(BOLD);
    texturaTextoParede.textFont('sans-serif');
    texturaTextoParede.textSize(120);
    texturaTextoParede.text('JIU - JITSU', 400, 80);

    texturaPlacaBoutique = createGraphics(800, 320);
    texturaPlacaBoutique.clear();
    texturaPlacaBoutique.fill(212, 175, 55);
    texturaPlacaBoutique.textAlign(CENTER, CENTER);
    texturaPlacaBoutique.textStyle(BOLD);
    texturaPlacaBoutique.textFont('sans-serif');
    texturaPlacaBoutique.textSize(90);
    texturaPlacaBoutique.text('ATACADO BJJ', 400, 100);
    texturaPlacaBoutique.textSize(35);
    texturaPlacaBoutique.fill(200);
    texturaPlacaBoutique.text('KIMONOS EM ATACADO E VAREJO', 400, 200);

    iniciarTexturas();

    posCamera = createVector(-100, 150, 750);
    olharCamera = createVector(-100, 60, 0);
    alvoPosCamera = posCamera.copy();
    alvoOlharCamera = olharCamera.copy();

    atualizarTotalCarrinho();
    window.addEventListener('resize', onWindowResize);
}

function draw() {
    if (modoApp === 'boutique') {
        background(135, 206, 235);
    } else {
        background(230, 235, 240);
    }



    updateCameraPosition();
    camera(posCamera.x, posCamera.y, posCamera.z, olharCamera.x, olharCamera.y, olharCamera.z, 0, -1, 0);

    let uLightDir = [0.45, 0.55, 0.7];

    shader(meuShader);
    meuShader.setUniform('uLightDir', uLightDir);
    meuShader.setUniform('uCelShading', modoCelShading);

    if (modoApp === 'boutique') {
        desenharAmbienteBoutique();
    } else {
        drawEnvironment();
    }

    push();
    translate(0, 25, 0);

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

        drawBoutiqueMannequins();
    }

    pop();
}
