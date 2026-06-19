// ======================================================
// INTERFACE — LÓGICA DA UI DA LOJA E VITRINE
// ======================================================

// ======================================================
// NAVEGAÇÃO ENTRE MODOS (VITRINE ↔ LOJA)
// ======================================================

function AlternarModoApp(modo) {
    modo_app = modo;
    if (modo === 'loja') {
        document.getElementById('Vitrine-panel').style.display = 'none';
        document.getElementById('painel-loja').style.display = 'flex';
        rotacao_orbita_x = 0.0;
        rotacao_orbita_y = 0.0;
        DefinirPasso('blusa');
    } else {
        ResetarEstadoInicial();
        document.getElementById('painel-loja').style.display = 'none';
        document.getElementById('Vitrine-panel').style.display = 'flex';
    }
}

function EntrarNaLoja() {
    AlternarModoApp('loja');
}

// ======================================================
// RESET COMPLETO — volta ao estado inicial da loja
// Chamado ao retornar à Vitrine por qualquer caminho
// ======================================================

function ResetarEstadoInicial() {
    modo_app = 'Vitrine';

    // Câmera
    alvo_raio_orbita      = 900;
    alvo_altura_foco_camera = 120;
    rotacao_orbita_x      = 0.0;
    rotacao_orbita_y      = 0.0;
    alvo_olhar_camera     = createVector(-50, 120, 10);
    alvo_pos_camera       = createVector(-50, 120, 900);

    // Desgaste do kimono
    if (typeof nivel_desgaste !== 'undefined') nivel_desgaste = 0.0;
    if (typeof AtualizarNivelDesgaste === 'function') AtualizarNivelDesgaste(0);
    let slider = document.getElementById('wear-slider');
    if (slider) slider.value = 0;

    // Estado do carrinho
    estado_loja.blusa  = { marca: 'Vouk', cor: 'white', tamanho: 'A2', preco: 330, equipado: false };
    estado_loja.calca  = { marca: 'Vouk', cor: 'white', tamanho: 'A2', preco: 170, equipado: false };
    estado_loja.faixa  = { cor: 'white', tamanho: 'A2', preco: 100, equipado: false };
    estado_loja.desconto     = 0;
    estado_loja.passoAtual   = 'blusa';
    estado_loja.bordadoNome  = false;
    estado_loja.bordadoEquipe = false;

    if (typeof imagem_bordado_cache !== 'undefined') imagem_bordado_cache = null;

    // Limpar campos de bordado
    let campo_nome  = document.getElementById('embroidery-name');
    if (campo_nome)  campo_nome.value = '';
    let campo_equipe = document.getElementById('embroidery-team');
    if (campo_equipe) campo_equipe.value = '';

    // Resetar visual dos botões de bordado
    let btn_nome  = document.getElementById('btn-apply-name');
    if (btn_nome)  { btn_nome.innerText = '+R$ 40';  btn_nome.style.background  = '#d4af37'; btn_nome.style.color  = 'black'; }
    let btn_equipe = document.getElementById('btn-apply-team');
    if (btn_equipe) { btn_equipe.innerText = '+R$ 40'; btn_equipe.style.background = '#d4af37'; btn_equipe.style.color = 'black'; }

    // Resetar botões do carrinho
    let btn_blusa = document.getElementById('btn-alternar-blusa');
    if (btn_blusa)  { btn_blusa.innerText  = '🛒 Colocar no Carrinho'; btn_blusa.style.background  = '#2b5b84'; btn_blusa.style.color  = 'white'; }
    let btn_calca = document.getElementById('btn-alternar-calca');
    if (btn_calca)  { btn_calca.innerText  = '🛒 Colocar no Carrinho'; btn_calca.style.background  = '#2b5b84'; btn_calca.style.color  = 'white'; }
    let btn_faixa = document.getElementById('btn-alternar-faixa');
    if (btn_faixa)  { btn_faixa.innerText  = '🛒 Colocar no Carrinho'; btn_faixa.style.background  = '#2b5b84'; btn_faixa.style.color  = 'white'; }

    if (typeof AtualizarTotalCarrinho === 'function') AtualizarTotalCarrinho();
    if (typeof SincronizarInterface   === 'function') SincronizarInterface();
}

function VoltarVitrine() {
    ResetarEstadoInicial();
    document.getElementById('painel-loja').style.display = 'none';
    document.getElementById('Vitrine-panel').style.display = 'flex';
}

// ======================================================
// DROPS E PROMOÇÕES
// ======================================================

function CarregarDropDaSemana(opcao) {
    estado_loja.blusa.equipado  = true;
    estado_loja.calca.equipado  = true;
    estado_loja.faixa.equipado  = true;

    if (opcao === 1) {
        estado_loja.blusa.marca = 'Vouk';  estado_loja.blusa.cor = 'white'; estado_loja.blusa.tamanho = 'A1';
        estado_loja.calca.marca = 'Vouk';  estado_loja.calca.cor = 'white'; estado_loja.calca.tamanho = 'A1';
        estado_loja.faixa.cor = 'blue';    estado_loja.faixa.tamanho = 'A1';
        estado_loja.desconto = 121;
    } else if (opcao === 2) {
        estado_loja.blusa.marca = 'Atama'; estado_loja.blusa.cor = 'blue';  estado_loja.blusa.tamanho = 'A2';
        estado_loja.calca.marca = 'Atama'; estado_loja.calca.cor = 'blue';  estado_loja.calca.tamanho = 'A2';
        estado_loja.faixa.cor = 'purple';  estado_loja.faixa.tamanho = 'A2';
        estado_loja.desconto = 180;
    } else if (opcao === 3) {
        estado_loja.blusa.marca = 'Kingz'; estado_loja.blusa.cor = 'black'; estado_loja.blusa.tamanho = 'A3';
        estado_loja.calca.marca = 'Kingz'; estado_loja.calca.cor = 'black'; estado_loja.calca.tamanho = 'A3';
        estado_loja.faixa.cor = 'black';   estado_loja.faixa.tamanho = 'A3';
        estado_loja.desconto = 285;
    }

    SincronizarInterface();
    AtualizarTotalCarrinho();

    modo_app = 'loja';
    document.getElementById('Vitrine-panel').style.display = 'none';
    document.getElementById('painel-loja').style.display = 'flex';
    DefinirPasso('cart');
}

// ======================================================
// CHECKOUT
// ======================================================

function FinalizarCompra() {
    if (estado_loja.passoAtual !== 'cart') {
        DefinirPasso('cart');
    } else {
        let mapa_faixa = { 'white': 'Branca', 'blue': 'Azul', 'purple': 'Roxa', 'brown': 'Marrom', 'black': 'Preta', 'coral': 'Coral V/P', 'coral-white': 'Coral V/B', 'red': 'Vermelha' };

        document.getElementById('checkout-top-desc').innerText   = `${estado_loja.blusa.marca} / ${NomeCorPortugues(estado_loja.blusa.cor)} / ${estado_loja.blusa.tamanho}`;
        document.getElementById('checkout-pants-desc').innerText = `${estado_loja.calca.marca} / ${NomeCorPortugues(estado_loja.calca.cor)} / ${estado_loja.calca.tamanho}`;
        document.getElementById('checkout-belt-desc').innerText  = `${mapa_faixa[estado_loja.faixa.cor]} / ${estado_loja.faixa.tamanho}`;

        document.getElementById('checkout-top-price').innerText   = `R$ ${estado_loja.blusa.preco},00`;
        document.getElementById('checkout-pants-price').innerText = `R$ ${estado_loja.calca.preco},00`;
        document.getElementById('checkout-belt-price').innerText  = `R$ ${estado_loja.faixa.preco},00`;

        let total = estado_loja.blusa.preco + estado_loja.calca.preco + estado_loja.faixa.preco;

        if (estado_loja.desconto && estado_loja.desconto > 0) {
            document.getElementById('checkout-discount-row').style.display = 'flex';
            document.getElementById('checkout-discount-price').innerText = estado_loja.desconto;
            total -= estado_loja.desconto;
            if (total < 0) total = 0;
        } else {
            document.getElementById('checkout-discount-row').style.display = 'none';
        }

        document.getElementById('checkout-total-price').innerText = `R$ ${total},00`;
        document.getElementById('checkout-row-top').style.display    = estado_loja.blusa.equipado ? 'flex' : 'none';
        document.getElementById('checkout-row-pants').style.display  = estado_loja.calca.equipado ? 'flex' : 'none';
        document.getElementById('checkout-row-belt').style.display   = estado_loja.faixa.equipado ? 'flex' : 'none';

        let linha_emb = document.getElementById('checkout-row-embroidery');
        if (linha_emb) linha_emb.style.display = estado_loja.bordado ? 'flex' : 'none';

        document.getElementById('checkout-overlay').style.display = 'flex';
    }
}

function FecharCheckout() {
    document.getElementById('checkout-overlay').style.display = 'none';
    ResetarEstadoInicial();
    document.getElementById('painel-loja').style.display = 'none';
    document.getElementById('Vitrine-panel').style.display = 'flex';
}

// ======================================================
// NAVEGAÇÃO POR PASSOS
// ======================================================

function DefinirPasso(nome_passo) {
    estado_loja.passoAtual = nome_passo;

    // Ocultar todas as seções e exibir apenas a do passo atual
    document.querySelectorAll('.step-section').forEach(el => el.style.display = 'none');
    let id_conteudo = (nome_passo === 'cart') ? 'step-cart' : 'passo-' + nome_passo;
    let conteudo    = document.getElementById(id_conteudo);
    if (conteudo) conteudo.style.display = 'block';

    // Resetar slider de desgaste ao trocar de aba
    let slider = document.getElementById('wear-slider');
    if (slider && slider.value !== "0") {
        slider.value = 0;
        if (typeof AtualizarNivelDesgaste === 'function') AtualizarNivelDesgaste(0);
    }

    // Atualizar abas ativas
    document.querySelectorAll('.step-tab, .btn-kimono').forEach(el => {
        if (el.id && (el.id.startsWith('tab-') || el.id.startsWith('aba-'))) el.classList.remove('active');
    });
    let id_aba = (nome_passo === 'cart') ? 'tab-cart' : 'aba-' + nome_passo;
    let aba    = document.getElementById(id_aba);
    if (aba) aba.classList.add('active');

    // Texto do botão de checkout
    let btn_checkout = document.getElementById('btn-checkout');
    if (btn_checkout) {
        btn_checkout.innerText = (nome_passo === 'cart') ? 'Realizar Pagamento' : 'Finalizar Montagem';
    }

    // Ajustar câmera conforme o passo
    if (modo_app === 'loja') {
        if      (nome_passo === 'blusa')  { alvo_altura_foco_camera = 100; alvo_raio_orbita = 350; }
        else if (nome_passo === 'calca')  { alvo_altura_foco_camera = 15;  alvo_raio_orbita = 320; }
        else if (nome_passo === 'faixa')  { alvo_altura_foco_camera = 65;  alvo_raio_orbita = 250; }
        else if (nome_passo === 'cart')   { alvo_altura_foco_camera = 60;  alvo_raio_orbita = 450; }
    }
}

// ======================================================
// CARRINHO — SELEÇÃO E ALTERNÂNCIA DE ITENS
// ======================================================

function AlternarItemCarrinho(parte) {
    estado_loja[parte].equipado = !estado_loja[parte].equipado;
    estado_loja.desconto = 0;

    let btn = document.getElementById('btn-alternar-' + parte);
    if (btn && estado_loja[parte].equipado) {
        btn.innerText = '✅ No Carrinho'; btn.style.background = '#10b981'; btn.style.color = 'white'; btn.style.border = 'none';
    } else if (btn) {
        btn.innerText = '🛒 Colocar no Carrinho'; btn.style.background = '#2b5b84'; btn.style.color = 'white'; btn.style.border = 'none';
    }

    AtualizarTotalCarrinho();
}

function SincronizarInterface() {
    let partes = {
        'blusa': { dom: 'top',   props: ['marca', 'cor', 'tamanho'] },
        'calca': { dom: 'pants', props: ['marca', 'cor', 'tamanho'] },
        'faixa': { dom: 'belt',  props: ['cor', 'tamanho'] }
    };

    for (let parte in partes) {
        let dom_parte = partes[parte].dom;
        for (let prop of partes[parte].props) {
            let valor    = estado_loja[parte][prop];
            let ui_prop  = prop === 'marca' ? 'brand' : prop === 'cor' ? 'color' : 'size';
            let classe   = '.btn-' + ui_prop + '-' + dom_parte;
            document.querySelectorAll(classe).forEach(el => el.classList.remove('active'));
            document.querySelectorAll(classe).forEach(el => {
                if (ui_prop === 'color' && (el.getAttribute('data-color') === valor || el.getAttribute('data-belt') === valor)) el.classList.add('active');
                if (ui_prop === 'brand' && el.getAttribute('data-brand') === valor) el.classList.add('active');
                if (ui_prop === 'size'  && el.getAttribute('data-size')  === valor) el.classList.add('active');
            });
        }
        let btn = document.getElementById('btn-alternar-' + parte);
        if (btn) {
            if (estado_loja[parte].equipado) {
                btn.innerText = "✅ No Carrinho"; btn.style.background = "#10b981";
            } else {
                btn.innerText = "🛒 Colocar no Carrinho"; btn.style.background = "#2b5b84";
            }
        }
    }
}

function SelecionarItem(parte, propriedade, valor) {
    let mapa_prop = { 'brand': 'marca', 'color': 'cor', 'size': 'tamanho' };
    let prop_mapeada = mapa_prop[propriedade] || propriedade;

    estado_loja[parte][prop_mapeada] = valor;
    estado_loja.desconto = 0;

    let mapa_dom  = { 'blusa': 'top', 'calca': 'pants', 'faixa': 'belt' };
    let dom_parte = mapa_dom[parte] || parte;

    let classe = '.btn-' + propriedade + '-' + dom_parte;
    document.querySelectorAll(classe).forEach(el => el.classList.remove('active'));
    document.querySelectorAll(classe).forEach(el => {
        if (propriedade === 'color' && el.getAttribute('data-color') === valor) el.classList.add('active');
        if (propriedade === 'color' && el.getAttribute('data-belt')  === valor) el.classList.add('active');
        if (propriedade === 'brand' && el.getAttribute('data-brand') === valor) el.classList.add('active');
        if (propriedade === 'size'  && el.getAttribute('data-size')  === valor) el.classList.add('active');
    });

    // Atualizar cor do círculo de tamanho da faixa dinamicamente
    if (parte === 'faixa' && propriedade === 'color') {
        let hex = '#ffffff';
        if (valor === 'blue')   hex = '#2b5b84';
        if (valor === 'purple') hex = '#5e35b1';
        if (valor === 'brown')  hex = '#5d4037';
        if (valor === 'black')  hex = '#212121';
        if (valor === 'coral' || valor === 'coral-white' || valor === 'red') hex = '#d32f2f';

        let css = `.btn-size-belt.active .circulo-tamanho { background-color: ${hex} !important; border-color: ${(valor === 'white') ? '#ccc' : hex} !important; }`;
        let estilo = document.getElementById('estilo-dinamico-faixa');
        if (!estilo) {
            estilo = document.createElement('style');
            estilo.id = 'estilo-dinamico-faixa';
            document.head.appendChild(estilo);
        }
        estilo.innerHTML = css;
    }

    // Atualizar cor do bordado automaticamente se a cor do kimono mudar
    if ((estado_loja.bordadoNome || estado_loja.bordadoEquipe) && parte === 'blusa' && propriedade === 'color') {
        if (typeof RedesenharBordado === 'function') RedesenharBordado();
    }

    AtualizarTotalCarrinho();
}

// ======================================================
// PREÇOS E TOTAIS
// ======================================================

function ObterMultiplicadorPreco(tamanho_str) {
    let mapa = { 'A0': 0.90, 'A1': 0.95, 'A2': 1.0, 'A3': 1.05, 'A4': 1.10, 'A5': 1.15 };
    return mapa[tamanho_str] || 1.0;
}

function AtualizarTotalCarrinho() {
    let base_blusa  = 0;
    if      (estado_loja.blusa.marca === 'Vouk')  base_blusa = 330;
    else if (estado_loja.blusa.marca === 'Atama') base_blusa = 530;
    else if (estado_loja.blusa.marca === 'Kingz') base_blusa = 800;

    let base_calca  = 0;
    if      (estado_loja.calca.marca === 'Vouk')  base_calca = 170;
    else if (estado_loja.calca.marca === 'Atama') base_calca = 270;
    else if (estado_loja.calca.marca === 'Kingz') base_calca = 400;

    let base_faixa  = 100;

    let preco_blusa  = estado_loja.blusa.equipado  ? Math.round(base_blusa  * ObterMultiplicadorPreco(estado_loja.blusa.tamanho))  : 0;
    let preco_calca  = estado_loja.calca.equipado  ? Math.round(base_calca  * ObterMultiplicadorPreco(estado_loja.calca.tamanho))  : 0;
    let preco_faixa  = estado_loja.faixa.equipado  ? Math.round(base_faixa  * ObterMultiplicadorPreco(estado_loja.faixa.tamanho))  : 0;
    let preco_nome   = estado_loja.bordadoNome   ? 40 : 0;
    let preco_equipe = estado_loja.bordadoEquipe ? 40 : 0;

    let total = preco_blusa + preco_calca + preco_faixa + preco_nome + preco_equipe;

    if (estado_loja.desconto > 0) {
        total -= estado_loja.desconto;
        if (total < 0) total = 0;
        document.getElementById('cart-row-discount').style.display = 'flex';
        document.getElementById('cart-price-discount').innerText = estado_loja.desconto;
    } else {
        let el = document.getElementById('cart-row-discount');
        if (el) el.style.display = 'none';
    }

    estado_loja.blusa.preco = preco_blusa;
    estado_loja.calca.preco = preco_calca;
    estado_loja.faixa.preco = preco_faixa;

    let cor_blusa_pt = NomeCorPortugues(estado_loja.blusa.cor);
    let cor_calca_pt = NomeCorPortugues(estado_loja.calca.cor);
    let mapa_faixa   = { 'white': 'Branca', 'blue': 'Azul', 'purple': 'Roxa', 'brown': 'Marrom', 'black': 'Preta', 'coral': 'Coral V/P', 'coral-white': 'Coral V/B', 'red': 'Vermelha' };

    document.getElementById('cart-desc-top').innerText   = `${estado_loja.blusa.marca} / ${cor_blusa_pt} / ${estado_loja.blusa.tamanho}`;
    document.getElementById('cart-price-top').innerText  = preco_blusa;
    document.getElementById('cart-row-top').style.display = estado_loja.blusa.equipado ? 'block' : 'none';

    document.getElementById('cart-desc-pants').innerText  = `${estado_loja.calca.marca} / ${cor_calca_pt} / ${estado_loja.calca.tamanho}`;
    document.getElementById('cart-price-pants').innerText = preco_calca;
    document.getElementById('cart-row-pants').style.display = estado_loja.calca.equipado ? 'block' : 'none';

    document.getElementById('cart-desc-belt').innerText  = `${mapa_faixa[estado_loja.faixa.cor]} / ${estado_loja.faixa.tamanho}`;
    document.getElementById('cart-price-belt').innerText = preco_faixa;
    document.getElementById('cart-row-belt').style.display = estado_loja.faixa.equipado ? 'block' : 'none';

    let linha_emb_nome  = document.getElementById('cart-row-emb-name');
    if (linha_emb_nome)  linha_emb_nome.style.display  = estado_loja.bordadoNome   ? 'block' : 'none';
    let linha_emb_equipe = document.getElementById('cart-row-emb-team');
    if (linha_emb_equipe) linha_emb_equipe.style.display = estado_loja.bordadoEquipe ? 'block' : 'none';

    let ck_nome  = document.getElementById('checkout-row-emb-name');
    if (ck_nome)  ck_nome.style.display  = estado_loja.bordadoNome   ? 'flex' : 'none';
    let ck_equipe = document.getElementById('checkout-row-emb-team');
    if (ck_equipe) ck_equipe.style.display = estado_loja.bordadoEquipe ? 'flex' : 'none';

    document.getElementById('cart-price-total').innerText  = total + ",00";
    document.getElementById('total-flutuante').innerText   = "R$ " + total + ",00";

    let subtotal_viewport = document.getElementById('valor-subtotal-viewport');
    if (subtotal_viewport) subtotal_viewport.innerText = `R$ ${total},00`;
}

// ======================================================
// UTILITÁRIOS
// ======================================================

function ObterEscalaTamanho(tamanho_str, tipo = 'blusa') {
    if (tipo === 'calca') {
        let mapa_calca = {
            'A0': [1.00, 1.00, 0.85],
            'A1': [1.05, 1.05, 0.90],
            'A2': [1.10, 1.10, 1.00],
            'A3': [1.15, 1.15, 1.05],
            'A4': [1.20, 1.20, 1.10],
            'A5': [1.25, 1.25, 1.15]
        };
        return mapa_calca[tamanho_str] || [1.0, 1.0, 1.0];
    }
    let mapa = {
        'A0': [0.85, 0.90, 0.85],
        'A1': [0.90, 0.95, 0.90],
        'A2': [1.00, 1.00, 1.00],
        'A3': [1.05, 1.05, 1.05],
        'A4': [1.10, 1.10, 1.10],
        'A5': [1.15, 1.15, 1.15]
    };
    return mapa[tamanho_str] || [1.0, 1.0, 1.0];
}

// Converte identificador de cor para nome em português exibível
function NomeCorPortugues(cor) {
    if (cor === 'white') return 'Branco';
    if (cor === 'blue')  return 'Azul';
    if (cor === 'black') return 'Preto';
    return cor;
}
