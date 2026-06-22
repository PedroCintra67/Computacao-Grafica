// PRINCIPAL — CONFIGURAÇÃO, LOOP DE RENDERIZAÇÃO E BORDADOS
let meu_shader;
let textura_placa_vitrine;

var modo_app = 'Vitrine';

var estado_loja = {
    passoAtual: 'blusa',
    blusa: { marca: 'Vouk', cor: 'white', tamanho: 'A2', preco: 330, equipado: false },
    calca: { marca: 'Vouk', cor: 'white', tamanho: 'A2', preco: 170, equipado: false },
    faixa: { cor: 'white', tamanho: 'A2', preco: 100, equipado: false },
    bordadoNome: false,
    bordadoEquipe: false
};


// Câmera

let raio_orbita = 900;
let alvo_raio_orbita = 900;
let altura_foco_camera = 120;
let alvo_altura_foco_camera = 120;
let pos_camera, olhar_camera;
let alvo_pos_camera, alvo_olhar_camera;
let rotacao_orbita_x = 0.0;
let rotacao_orbita_y = 0.0;
let esta_arrastando = false;
let ultimo_mouse_x = 0;
let ultimo_mouse_y = 0;

const ORBITA_MINIMA = 200;
const ORBITA_MAXIMA = 1200;

// Texturas

let textura_rashguard;
let textura_vouk, textura_peito_kingz_clara, textura_peito_kingz_escura, textura_ombro_kingz;
let textura_peito_atama_clara, textura_peito_atama_escura, textura_ombro_atama_clara, textura_ombro_atama_escura, textura_ombro_vouk;
let textura_calca_vouk, textura_calca_atama_clara, textura_calca_atama_escura, textura_calca_kingz;
let imagem_helio, imagem_carlos;
let textura_texto_parede;
let textura_placa_aberto;

// Bordado e desgaste

let textura_bordado;
let imagem_bordado_cache = null;
let nivel_desgaste = 0.0;

function AtualizarNivelDesgaste(val) {
    nivel_desgaste = val / 6.0;
}

function RedesenharBordado() {
    // Busca os valores digitados no painel. Se a caixa de texto não existir, usa vazio ("")
    let nome_str = document.getElementById('embroidery-name')?.value || "";
    let equipe_str = document.getElementById('embroidery-team')?.value || "";

    if (!estado_loja.bordadoNome) nome_str = "";
    if (!estado_loja.bordadoEquipe) equipe_str = "";

    if (estado_loja.bordadoNome && !nome_str) nome_str = "SEU NOME";
    if (estado_loja.bordadoEquipe && !equipe_str) equipe_str = "SUA EQUIPE";

    textura_bordado.clear();
    textura_bordado.background(0, 0, 0, 0);

    // Cor do texto: preto para kimono claro, branco para escuro
    let cor_gi = estado_loja.blusa.cor;
    let gi_claro = (cor_gi === 'white' || cor_gi === 'branco' || cor_gi === '');
    textura_bordado.fill(gi_claro ? 20 : 255);

    // Reduz a fonte se o texto for muito longo
    function AjustarTextoAoEspaco(txt, y, fonte_maxima) {
        let s = fonte_maxima;
        textura_bordado.textSize(s);
        while (textura_bordado.textWidth(txt) > 900 && s > 30) {
            s -= 5;
            textura_bordado.textSize(s);
        }
        textura_bordado.text(txt, 512, y);
    }

    if (nome_str) AjustarTextoAoEspaco(nome_str, 220, 100);
    if (equipe_str) AjustarTextoAoEspaco(equipe_str, 870, 80);

    imagem_bordado_cache = textura_bordado.get();
}


function AlternarBordado(tipo) {
    let prop = tipo === 'name' ? 'bordadoNome' : 'bordadoEquipe';
    estado_loja[prop] = !estado_loja[prop];
    RedesenharBordado();
    if (typeof AtualizarTotalCarrinho === 'function') AtualizarTotalCarrinho();

    let btn = document.getElementById(`btn-apply-${tipo}`);
    if (btn) {
        if (estado_loja[prop]) {
            btn.innerText = "✓ Adicionado"; btn.style.background = "#4ade80"; btn.style.color = "#0f172a";
        } else {
            btn.innerText = "+R$ 40"; btn.style.background = "#d4af37"; btn.style.color = "black";
        }
    }
}

function ResetarEstadoBordado(tipo) {
    let prop = tipo === 'name' ? 'bordadoNome' : 'bordadoEquipe';
    if (estado_loja[prop]) {
        estado_loja[prop] = false;
        let btn = document.getElementById(`btn-apply-${tipo}`);
        if (btn) { btn.innerText = "+R$ 40"; btn.style.background = "#d4af37"; btn.style.color = "black"; }
        RedesenharBordado();
        if (typeof AtualizarTotalCarrinho === 'function') AtualizarTotalCarrinho();
    }
}

function AplicarBordadoNome() { AlternarBordado('name'); }
function AplicarBordadoEquipe() { AlternarBordado('team'); }

function preload() {
    meu_shader = loadShader('shader.vert', 'shader.frag');
    imagem_helio = loadImage('helio.jpg');
    imagem_carlos = loadImage('carlos.jpg');
}

function setup() {
    setAttributes({ version: 2 });
    let container = document.getElementById('container-canvas');
    let w = container.clientWidth || 700;
    let h = container.clientHeight || 550;
    let canvas = createCanvas(w, h, WEBGL);
    canvas.parent('container-canvas');

    // Rashguard (textura interna da abertura do kimono)
    textura_rashguard = createGraphics(1024, 1024);
    textura_rashguard.background(20);

    // Textura de bordado (transparente por padrão)
    textura_bordado = createGraphics(1024, 1024);
    textura_bordado.textAlign(CENTER, CENTER);
    textura_bordado.textStyle(BOLD);
    textura_bordado.clear();
    textura_bordado.background(0, 0, 0, 0);
    imagem_bordado_cache = textura_bordado.get();

    // Texto decorativo na parede
    textura_texto_parede = createGraphics(800, 320);
    textura_texto_parede.clear();
    textura_texto_parede.fill(20, 15, 10);
    textura_texto_parede.textAlign(CENTER, CENTER);
    textura_texto_parede.textStyle(BOLD);
    textura_texto_parede.textFont('Arial black');
    textura_texto_parede.textSize(120);
    textura_texto_parede.text('JIU - JITSU', 400, 80);

    // Letreiro da fachada da loja (cobrindo toda a parede verde)
    textura_placa_vitrine = createGraphics(950, 2762);
    textura_placa_vitrine.clear();
    textura_placa_vitrine.fill(0);
    textura_placa_vitrine.textAlign(CENTER, CENTER);
    textura_placa_vitrine.textStyle(ITALIC);
    textura_placa_vitrine.textFont('Arial Black');
    textura_placa_vitrine.textSize(100);
    textura_placa_vitrine.text('Delariva BJJ', 400, 2600);
    textura_placa_vitrine.textSize(30);
    textura_placa_vitrine.text('A performance começa no conforto', 410, 2700);

    // Placa "ABERTO" na porta
    textura_placa_aberto = createGraphics(250, 80);
    textura_placa_aberto.clear();
    textura_placa_aberto.fill(255);
    textura_placa_aberto.noStroke();
    textura_placa_aberto.rect(0, 0, 250, 80, 5);
    textura_placa_aberto.fill(0);
    textura_placa_aberto.textAlign(CENTER, CENTER);
    textura_placa_aberto.textStyle(BOLD);
    textura_placa_aberto.textFont('sans-serif');
    textura_placa_aberto.textSize(45);
    textura_placa_aberto.text('ABERTO', 128, 40);

    IniciarTexturas();

    pos_camera = createVector(-100, 150, 750);
    olhar_camera = createVector(-100, 60, 0);
    alvo_pos_camera = pos_camera.copy();
    alvo_olhar_camera = olhar_camera.copy();

    AtualizarTotalCarrinho();
    window.addEventListener('resize', AoRedimensionarJanela);
}

function draw() {
    background(modo_app === 'Vitrine' ? color(135, 206, 235) : color(230, 235, 240));

    AtualizarPosicaoCamera();
    camera(pos_camera.x, pos_camera.y, pos_camera.z, olhar_camera.x, olhar_camera.y, olhar_camera.z, 0, -1, 0);

    shader(meu_shader);
    meu_shader.setUniform('uLightDir', [0.45, 0.55, 0.7]);
    meu_shader.setUniform('uWearLevel', nivel_desgaste);

    noStroke();

    if (modo_app === 'Vitrine') {
        DesenharAmbienteVitrine();
    } else {
        DesenharAmbienteLoja();
    }

    push();
    translate(0, 25, 0);

    // Rotação do objeto e lógica das peças no modo loja
    if (modo_app === 'loja') {
        rotateX(-rotacao_orbita_x);
        rotateY(-rotacao_orbita_y);

        let viewport_sub = document.getElementById('viewport-subtotal');
        if (viewport_sub) viewport_sub.style.display = 'block';

        let desenhar_blusa = (estado_loja.passoAtual === 'blusa') || (estado_loja.passoAtual === 'cart' && estado_loja.blusa.equipado);
        let desenhar_calca = (estado_loja.passoAtual === 'calca') || (estado_loja.passoAtual === 'cart' && estado_loja.calca.equipado);
        let desenhar_faixa = (estado_loja.passoAtual === 'faixa') || (estado_loja.passoAtual === 'cart' && estado_loja.faixa.equipado);

        if (desenhar_blusa) {
            push();
            let s_blusa = ObterEscalaTamanho(estado_loja.blusa.tamanho);
            scale(s_blusa[0], s_blusa[1], s_blusa[2]);
            DesenharTroncoKimono(textura_rashguard);
            pop();
        }

        if (desenhar_calca) {
            push();
            let s_calca = ObterEscalaTamanho(estado_loja.calca.tamanho, 'calca');
            let s_blusa = ObterEscalaTamanho(estado_loja.blusa.tamanho);
            let dy = 68 * s_blusa[1] - 68 * s_calca[1];
            translate(0, dy, 0);

            // Comprime o topo da calça quando o kimono está junto (carrinho)
            let aperto = (estado_loja.passoAtual === 'cart' && desenhar_blusa) ? 0.65 : 1.0;
            meu_shader.setUniform('uSqueezePantsTop', aperto);
            scale(s_calca[0], s_calca[1], s_calca[2]);
            DesenharCalca();
            meu_shader.setUniform('uSqueezePantsTop', 1.0);
            pop();
        }

        if (desenhar_faixa) {
            push();
            let s_faixa = ObterEscalaTamanho(estado_loja.faixa.tamanho);
            let s_blusa = ObterEscalaTamanho(estado_loja.blusa.tamanho);
            scale(s_blusa[0], s_faixa[1], s_blusa[2]);
            let dy = 68 * s_blusa[1] - 68 * s_faixa[1];
            translate(0, dy, 0);
            DesenharFaixaENos();
            pop();
        }

    } else {
        let viewport_sub = document.getElementById('viewport-subtotal');
        if (viewport_sub) viewport_sub.style.display = 'none';
        DesenharManequeinsVitrine();
    }

    pop();

    // Vidro da vitrine sempre desenhado por último
    if (modo_app === 'Vitrine') {
        DesenharVidroVitrine();
    }
}
