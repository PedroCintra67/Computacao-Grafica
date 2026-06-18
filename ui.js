function alternarModoApp(mode) {
    modoApp = mode;
    if (mode === 'ecommerce') {
        document.getElementById('vitrine-panel').style.display = 'none';
        document.getElementById('painel-ecommerce').style.display = 'flex';
        
        // Reset rotation to ensure item faces forward
        rotacaoOrbitaX = 0.0;
        rotacaoOrbitaY = 0.0;
        
        setStep('blusa'); // start e-commerce flow
    } else {
        document.getElementById('painel-ecommerce').style.display = 'none';
        document.getElementById('vitrine-panel').style.display = 'flex';
        // Reset camera to default view
        alvoRaioOrbita = 900;
        alvoAlturaFocoCamera = 120;
        rotacaoOrbitaX = 0.0;
        rotacaoOrbitaY = 0.0;
        alvoOlharCamera = createVector(-50, 120, 10);
        alvoPosCamera = createVector(-50, 120, 900);
    }
}

function enterFittingRoom() {
    alternarModoApp('ecommerce');
}

function voltarVitrine() {
    modoApp = 'vitrine';
    document.getElementById('painel-ecommerce').style.display = 'none';
    document.getElementById('vitrine-panel').style.display = 'flex';
    
    // Reset camera to default storefront view
    alvoRaioOrbita = 900;
    alvoAlturaFocoCamera = 120;
    rotacaoOrbitaX = 0.0;
    rotacaoOrbitaY = 0.0;
    alvoOlharCamera = createVector(-50, 120, 10);
    alvoPosCamera = createVector(-50, 120, 900);
}

function loadDropDaSemana(option) {
    estadoLoja.blusa.equipado = true;
    estadoLoja.calca.equipado = true;
    estadoLoja.faixa.equipado = true;

    if (option === 1) {
        estadoLoja.blusa.marca = 'Vouk'; estadoLoja.blusa.cor = 'white'; estadoLoja.blusa.tamanho = 'A1';
        estadoLoja.calca.marca = 'Vouk'; estadoLoja.calca.cor = 'white'; estadoLoja.calca.tamanho = 'A1';
        estadoLoja.faixa.cor = 'blue'; estadoLoja.faixa.tamanho = 'A1';
        estadoLoja.desconto = 121; // Math fix to reach exactly R$ 450
    } else if (option === 2) {
        estadoLoja.blusa.marca = 'Atama'; estadoLoja.blusa.cor = 'blue'; estadoLoja.blusa.tamanho = 'A2';
        estadoLoja.calca.marca = 'Atama'; estadoLoja.calca.cor = 'blue'; estadoLoja.calca.tamanho = 'A2';
        estadoLoja.faixa.cor = 'purple'; estadoLoja.faixa.tamanho = 'A2';
        estadoLoja.desconto = 180; // Promo is 720
    } else if (option === 3) {
        estadoLoja.blusa.marca = 'Kingz'; estadoLoja.blusa.cor = 'black'; estadoLoja.blusa.tamanho = 'A3';
        estadoLoja.calca.marca = 'Kingz'; estadoLoja.calca.cor = 'black'; estadoLoja.calca.tamanho = 'A3';
        estadoLoja.faixa.cor = 'black'; estadoLoja.faixa.tamanho = 'A3';
        estadoLoja.desconto = 285; // Promo is 1080
    }
    
    syncUI();

    atualizarTotalCarrinho();

    // Jump straight to cart overview
    modoApp = 'ecommerce';
    document.getElementById('vitrine-panel').style.display = 'none';
    document.getElementById('painel-ecommerce').style.display = 'flex';
    setStep('cart');
}

function checkout() {
    if (estadoLoja.passoAtual !== 'cart') {
        setStep('cart');
    } else {
        // Populate the checkout overlay
        let beltMap = { 'white': 'Branca', 'blue': 'Azul', 'purple': 'Roxa', 'brown': 'Marrom', 'black': 'Preta', 'coral': 'Coral V/P', 'coral-white': 'Coral V/B', 'red': 'Vermelha' };

        document.getElementById('checkout-top-desc').innerText = `${estadoLoja.blusa.marca} / ${(estadoLoja.blusa.cor === 'white' ? 'Branco' : estadoLoja.blusa.cor === 'blue' ? 'Azul' : 'Preto')} / ${estadoLoja.blusa.tamanho}`;
        document.getElementById('checkout-pants-desc').innerText = `${estadoLoja.calca.marca} / ${(estadoLoja.calca.cor === 'white' ? 'Branco' : estadoLoja.calca.cor === 'blue' ? 'Azul' : 'Preto')} / ${estadoLoja.calca.tamanho}`;
        document.getElementById('checkout-belt-desc').innerText = `${beltMap[estadoLoja.faixa.cor]} / ${estadoLoja.faixa.tamanho}`;

        document.getElementById('checkout-top-price').innerText = `R$ ${estadoLoja.blusa.preco},00`;
        document.getElementById('checkout-pants-price').innerText = `R$ ${estadoLoja.calca.preco},00`;
        document.getElementById('checkout-belt-price').innerText = `R$ ${estadoLoja.faixa.preco},00`;
        
        let total = estadoLoja.blusa.preco + estadoLoja.calca.preco + estadoLoja.faixa.preco;
        
        if (estadoLoja.desconto && estadoLoja.desconto > 0) {
            document.getElementById('checkout-discount-row').style.display = 'flex';
            document.getElementById('checkout-discount-price').innerText = estadoLoja.desconto;
            total -= estadoLoja.desconto;
            if (total < 0) total = 0;
        } else {
            document.getElementById('checkout-discount-row').style.display = 'none';
        }

        document.getElementById('checkout-total-price').innerText = `R$ ${total},00`;

        document.getElementById('checkout-row-top').style.display = estadoLoja.blusa.equipado ? 'flex' : 'none';
        document.getElementById('checkout-row-pants').style.display = estadoLoja.calca.equipado ? 'flex' : 'none';
        document.getElementById('checkout-row-belt').style.display = estadoLoja.faixa.equipado ? 'flex' : 'none';
        
        // Exibir linha de bordado no checkout
        let checkoutEmbRow = document.getElementById('checkout-row-embroidery');
        if (checkoutEmbRow) checkoutEmbRow.style.display = estadoLoja.bordado ? 'flex' : 'none';

        // Show overlay
        document.getElementById('checkout-overlay').style.display = 'flex';
    }
}

function closeCheckout() {
    document.getElementById('checkout-overlay').style.display = 'none';
    alternarModoApp('vitrine'); // Voltar para a loja
}

function setStep(stepName) {
    estadoLoja.passoAtual = stepName;

    // Hide all steps
    document.querySelectorAll('.step-section').forEach(el => el.style.display = 'none');
    let contentId = (stepName === 'cart') ? 'step-cart' : 'passo-' + stepName;
    let stepContent = document.getElementById(contentId);
    if (stepContent) stepContent.style.display = 'block';

    // Reset wear slider whenever switching tabs
    let slider = document.getElementById('wear-slider');
    if (slider && slider.value !== "0") {
        slider.value = 0;
        if (typeof updateWearLevel === 'function') {
            updateWearLevel(0);
        }
    }

    // Update tabs
    document.querySelectorAll('.step-tab, .btn-kimono').forEach(el => {
        if (el.id && (el.id.startsWith('tab-') || el.id.startsWith('aba-'))) el.classList.remove('active');
    });
    let tabId = (stepName === 'cart') ? 'tab-cart' : 'aba-' + stepName;
    let tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');

    // Update checkout button text
    let btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        if (stepName === 'cart') {
            btnCheckout.innerText = 'Realizar Pagamento';
        } else {
            btnCheckout.innerText = 'Finalizar Montagem';
        }
    }

    // Adjust camera targeting based on step
    if (modoApp === 'ecommerce') {
        if (stepName === 'blusa') {
            alvoAlturaFocoCamera = 100; // 70 + 25
            alvoRaioOrbita = 350;
        }
        else if (stepName === 'calca') {
            alvoAlturaFocoCamera = 15; // -10 + 25
            alvoRaioOrbita = 320;
        }
        else if (stepName === 'faixa') {
            alvoAlturaFocoCamera = 65; // 40 + 25
            alvoRaioOrbita = 250;
        }
        else if (stepName === 'cart') {
            alvoAlturaFocoCamera = 60; // 35 + 25
            alvoRaioOrbita = 450;
        }
    }
}

function alternarItemBtn(part) {
    estadoLoja[part].equipado = !estadoLoja[part].equipado;
    estadoLoja.desconto = 0; // Remove promo discount if user removes an item

    let btn = document.getElementById('btn-alternar-' + part);
    if (btn && estadoLoja[part].equipado) {
        btn.innerText = '✅ No Carrinho';
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        btn.style.border = 'none';
    } else {
        btn.innerText = '🛒 Colocar no Carrinho';
        btn.style.background = '#2b5b84';
        btn.style.color = 'white';
        btn.style.border = 'none';
    }

    atualizarTotalCarrinho();
}

function syncUI() {
    let parts = {
        'blusa': { dom: 'top', props: ['marca', 'cor', 'tamanho'] },
        'calca': { dom: 'pants', props: ['marca', 'cor', 'tamanho'] },
        'faixa': { dom: 'belt', props: ['cor', 'tamanho'] }
    };
    
    for (let part in parts) {
        let domPart = parts[part].dom;
        for (let prop of parts[part].props) {
            let val = estadoLoja[part][prop];
            let uiProp = prop === 'marca' ? 'brand' : prop === 'cor' ? 'color' : 'size';
            let btnClass = '.btn-' + uiProp + '-' + domPart;
            document.querySelectorAll(btnClass).forEach(el => el.classList.remove('active'));
            document.querySelectorAll(btnClass).forEach(el => {
                if (uiProp === 'color' && (el.getAttribute('data-color') === val || el.getAttribute('data-belt') === val)) el.classList.add('active');
                if (uiProp === 'brand' && el.getAttribute('data-brand') === val) el.classList.add('active');
                if (uiProp === 'size' && el.getAttribute('data-size') === val) el.classList.add('active');
            });
        }
        let btn = document.getElementById('btn-alternar-' + part);
        if (btn) {
            if (estadoLoja[part].equipado) {
                btn.innerText = "✅ No Carrinho";
                btn.style.background = "#10b981";
            } else {
                btn.innerText = "🛒 Colocar no Carrinho";
                btn.style.background = "#2b5b84";
            }
        }
    }
}

function selectItem(part, property, value) {
    let propMap = { 'brand': 'marca', 'color': 'cor', 'size': 'tamanho' };
    let mappedProp = propMap[property] || property;

    estadoLoja[part][mappedProp] = value;
    estadoLoja.desconto = 0; // Remove promo discount if user manually edits the setup

    let partMap = { 'blusa': 'top', 'calca': 'pants', 'faixa': 'belt' };
    let domPart = partMap[part] || part;

    // Update button visual state
    let btnClass = '.btn-' + property + '-' + domPart;
    document.querySelectorAll(btnClass).forEach(el => el.classList.remove('active'));

    // Find the specific button to activate
    document.querySelectorAll(btnClass).forEach(el => {
        if (property === 'color' && el.getAttribute('data-color') === value) el.classList.add('active');
        if (property === 'color' && el.getAttribute('data-belt') === value) el.classList.add('active'); // For belts
        if (property === 'brand' && el.getAttribute('data-brand') === value) el.classList.add('active');
        if (property === 'size' && el.getAttribute('data-size') === value) el.classList.add('active');
    });



    if (part === 'faixa' && property === 'color') {
        let hex = '#ffffff';
        if (value === 'blue') hex = '#2b5b84';
        if (value === 'purple') hex = '#5e35b1';
        if (value === 'brown') hex = '#5d4037';
        if (value === 'black') hex = '#212121';
        if (value === 'coral' || value === 'coral-white' || value === 'red') hex = '#d32f2f';

        let css = `.btn-size-belt.active .circulo-tamanho { background-color: ${hex} !important; border-color: ${(value === 'white') ? '#ccc' : hex} !important; }`;
        let styleNode = document.getElementById('estilo-dinamico-faixa');
        if (!styleNode) {
            styleNode = document.createElement('style');
            styleNode.id = 'estilo-dinamico-faixa';
            document.head.appendChild(styleNode);
        }
        styleNode.innerHTML = css;
    }
    
    // Atualiza a cor do bordado automaticamente se a cor do kimono mudar
    if ((estadoLoja.bordadoNome || estadoLoja.bordadoEquipe) && part === 'blusa' && property === 'color') {
        if (typeof redrawEmbroidery === 'function') redrawEmbroidery();
    }

    atualizarTotalCarrinho();
}

function getPriceMultiplier(sizeStr) {
    // A2 is the "modelo médio", so it is our base 1.0. 
    let map = { 'A0': 0.90, 'A1': 0.95, 'A2': 1.0, 'A3': 1.05, 'A4': 1.10, 'A5': 1.15 };
    return map[sizeStr] || 1.0;
}

function atualizarTotalCarrinho() {
    let topBase = 0;
    if (estadoLoja.blusa.marca === 'Vouk') topBase = 330;
    else if (estadoLoja.blusa.marca === 'Atama') topBase = 530;
    else if (estadoLoja.blusa.marca === 'Kingz') topBase = 800;

    let pantsBase = 0;
    if (estadoLoja.calca.marca === 'Vouk') pantsBase = 170;
    else if (estadoLoja.calca.marca === 'Atama') pantsBase = 270;
    else if (estadoLoja.calca.marca === 'Kingz') pantsBase = 400;

    let beltBase = 100;

    let topPrice = estadoLoja.blusa.equipado ? Math.round(topBase * getPriceMultiplier(estadoLoja.blusa.tamanho)) : 0;
    let pantsPrice = estadoLoja.calca.equipado ? Math.round(pantsBase * getPriceMultiplier(estadoLoja.calca.tamanho)) : 0;
    let beltPrice = estadoLoja.faixa.equipado ? Math.round(beltBase * getPriceMultiplier(estadoLoja.faixa.tamanho)) : 0;
    
    let embNamePrice = estadoLoja.bordadoNome ? 40 : 0;
    let embTeamPrice = estadoLoja.bordadoEquipe ? 40 : 0;

    let total = topPrice + pantsPrice + beltPrice + embNamePrice + embTeamPrice;

    if (estadoLoja.desconto > 0) {
        total -= estadoLoja.desconto;
        if (total < 0) total = 0;
        document.getElementById('cart-row-discount').style.display = 'flex';
        document.getElementById('cart-price-discount').innerText = estadoLoja.desconto;
    } else {
        let el = document.getElementById('cart-row-discount');
        if (el) el.style.display = 'none';
    }

    estadoLoja.blusa.preco = topPrice;
    estadoLoja.calca.preco = pantsPrice;
    estadoLoja.faixa.preco = beltPrice;

    document.getElementById('total-flutuante').innerText = `R$ ${total},00`;

    let viewportSub = document.getElementById('valor-subtotal-viewport');
    if (viewportSub) {
        viewportSub.innerText = `R$ ${total},00`;
    }

    let corBlusaPt = estadoLoja.blusa.cor === 'white' ? 'Branco' : estadoLoja.blusa.cor === 'blue' ? 'Azul' : 'Preto';
    document.getElementById('cart-desc-top').innerText = `${estadoLoja.blusa.marca} / ${corBlusaPt} / ${estadoLoja.blusa.tamanho}`;
    document.getElementById('cart-price-top').innerText = topPrice;
    document.getElementById('cart-row-top').style.display = estadoLoja.blusa.equipado ? 'block' : 'none';

    let corCalcaPt = estadoLoja.calca.cor === 'white' ? 'Branco' : estadoLoja.calca.cor === 'blue' ? 'Azul' : 'Preto';
    document.getElementById('cart-desc-pants').innerText = `${estadoLoja.calca.marca} / ${corCalcaPt} / ${estadoLoja.calca.tamanho}`;
    document.getElementById('cart-price-pants').innerText = pantsPrice;
    document.getElementById('cart-row-pants').style.display = estadoLoja.calca.equipado ? 'block' : 'none';

    let beltMap = { 'white': 'Branca', 'blue': 'Azul', 'purple': 'Roxa', 'brown': 'Marrom', 'black': 'Preta', 'coral': 'Coral V/P', 'coral-white': 'Coral V/B', 'red': 'Vermelha' };
    document.getElementById('cart-desc-belt').innerText = `${beltMap[estadoLoja.faixa.cor]} / ${estadoLoja.faixa.tamanho}`;
    document.getElementById('cart-price-belt').innerText = beltPrice;
    document.getElementById('cart-row-belt').style.display = estadoLoja.faixa.equipado ? 'block' : 'none';
    
    let embNameRow = document.getElementById('cart-row-emb-name');
    if (embNameRow) embNameRow.style.display = estadoLoja.bordadoNome ? 'block' : 'none';
    
    let embTeamRow = document.getElementById('cart-row-emb-team');
    if (embTeamRow) embTeamRow.style.display = estadoLoja.bordadoEquipe ? 'block' : 'none';
    
    // Atualizar checkout (Modal flutuante)
    let ckNameRow = document.getElementById('checkout-row-emb-name');
    if (ckNameRow) ckNameRow.style.display = estadoLoja.bordadoNome ? 'flex' : 'none';
    
    let ckTeamRow = document.getElementById('checkout-row-emb-team');
    if (ckTeamRow) ckTeamRow.style.display = estadoLoja.bordadoEquipe ? 'flex' : 'none';

    document.getElementById('cart-price-total').innerText = total + ",00";
    document.getElementById('total-flutuante').innerText = "R$ " + total + ",00";
}

function obterEscalaTamanho(sizeStr, type = 'blusa') {
    let map = {
        'A0': [0.85, 0.90, 0.85],
        'A1': [0.90, 0.95, 0.90],
        'A2': [1.00, 1.00, 1.00],
        'A3': [1.05, 1.05, 1.05],
        'A4': [1.10, 1.10, 1.10],
        'A5': [1.15, 1.15, 1.15]
    };

    let scale = map[sizeStr] || [1.0, 1.0, 1.0];

    if (type === 'calca') {
        let pantsMap = {
            'A0': [1.00, 1.00, 0.85], 
            'A1': [1.05, 1.05, 0.90], 
            'A2': [1.10, 1.10, 1.00], 
            'A3': [1.15, 1.15, 1.05], 
            'A4': [1.20, 1.20, 1.10],
            'A5': [1.25, 1.25, 1.15]
        };
        scale = pantsMap[sizeStr] || [1.0, 1.0, 1.0];
    }

    return scale;
}

