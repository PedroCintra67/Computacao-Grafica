// kimono.js
// Geração Procedural da Geometria do Kimono de Jiu-Jitsu

let malhaTroncoKimono;
let malhaBracoSuperior;
let malhaAntebraco;
let malhaFaixa;
let malhaLapelaEsquerda;
let malhaLapelaDireita;
let malhaCalca;

function iniciarGeometriaKimono() {
    // Usamos p5.Geometry para construir formas personalizadas com UVs e Normais uma vez, guardando em cache.

    // Use parâmetros detailX/Y únicos para evitar colisões de cache no p5.Geometry!
    malhaTroncoKimono = new p5.Geometry(1, 1, function () {
        let linhas = 40;
        let colunas = 50;

        for (let r = 0; r <= linhas; r++) {
            let v = r / linhas;
            let yBase = 0 + v * (145 - 0);

            for (let c = 0; c <= colunas; c++) {
                let u = c / colunas;
                let angle = u * TWO_PI;

                let nx = cos(angle);
                let nz = sin(angle);

                let rX, rZ;
                let y = yBase;

                if (yBase < 68) {
                    // Saia abaixo da faixa
                    let t = map(yBase, 0, 68, 0, 1);
                    rX = lerp(66, 52.5, t); // abrir mais na parte inferior
                    rZ = lerp(45, 30, t);
                } else {
                    // Tronco acima da faixa
                    let t = map(yBase, 68, 145, 0, 1);
                    
                    if (t < 0.8) {
                        let t2 = t / 0.8;
                        rX = lerp(52.5, 68, t2);
                        rZ = lerp(30, 38, t2);
                    } else {
                        let t2 = (t - 0.8) / 0.2;
                        let smoothT2 = t2 * t2 * (3.0 - 2.0 * t2); 
                        rX = lerp(68, 32, smoothT2); 
                        rZ = lerp(38, 28, smoothT2); 
                    }

                    // Curvar o corpo (volume do peito)
                    let volumePeito = sin(t * PI);
                    rX += volumePeito * 2.0;
                    rZ += volumePeito * 4.0;
                }

                // Decote nas costas (nuca) para um caimento realista
                if (yBase > 130) {
                    let tNeck = map(yBase, 130, 145, 0, 1);
                    if (nz < 0) {
                        y -= tNeck * abs(nz) * 8.0; // Abaixa o colarinho nas costas
                    }
                }

                let px = rX * nx;
                let pz = rZ * nz;

                // Add soft procedural cloth folds (dobras)
                let escalaDobra = map(y, 0, 145, 0.6, 1.0);

                // Suavizar o achatamento na área da faixa para evitar linhas pretas/cortes na malha
                let distFaixa = abs(y - 68.0);
                if (distFaixa < 12.0) {
                    let t = distFaixa / 12.0;
                    let tSmooth = t * t * (3.0 - 2.0 * t); // Smoothstep manual
                    escalaDobra *= tSmooth;
                }

                let dobra = sin(u * TWO_PI * 6.0 + v * 3.0) * sin(v * PI * 3.0) * 1.5;

                px += nx * dobra * escalaDobra;
                pz += nz * dobra * escalaDobra;

                this.vertices.push(createVector(px, y, pz));
                // Mapeamento UV: u dá a volta (0 a 1), v sobe (0 a 1)
                this.uvs.push([u, v * 2.0]);
            }
        }

        // Gerar triângulos com a ordem de enrolamento Anti-Horária correta
        for (let r = 0; r < linhas; r++) {
            for (let c = 0; c < colunas; c++) {
                let i0 = r * (colunas + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (colunas + 1) + c;
                let i3 = i2 + 1;

                // Inverter a ordem de enrolamento para Anti-Horária para consertar normais pretas
                this.faces.push([i0, i2, i1]);
                this.faces.push([i1, i2, i3]);
            }
        }
        this.computeNormals();

        // Corrigir a costura (seam) do tronco fundindo as normais das bordas (u=0 e u=1)
        for (let r = 0; r <= linhas; r++) {
            let i0 = r * (colunas + 1) + 0;
            let i1 = r * (colunas + 1) + colunas;
            let n0 = this.vertexNormals[i0];
            let n1 = this.vertexNormals[i1];
            let avgN = p5.Vector.add(n0, n1).normalize();
            this.vertexNormals[i0] = avgN.copy();
            this.vertexNormals[i1] = avgN.copy();
        }
    });

    // Criar geometrias das mangas de forma semelhante para evitar cilindros duros
    malhaBracoSuperior = criarMalhaSegmentoBraco(48, 16, 13);
    malhaAntebraco = criarMalhaSegmentoBraco(48, 13, 9.5);

    malhaBracoSuperior.id = 'upperArm_geom';
    malhaBracoSuperior.gid = 'upperArm_geom';
    malhaAntebraco.id = 'forearm_geom';
    malhaAntebraco.gid = 'forearm_geom';

    // Criar a faixa procedural que envolve perfeitamente a cintura
    iniciarMalhaFaixa();
    malhaFaixa.id = 'proceduralBelt_geom';
    malhaFaixa.gid = 'proceduralBelt_geom';

    malhaLapelaEsquerda = criarMalhaLapela(true);
    malhaLapelaDireita = criarMalhaLapela(false);
    malhaLapelaEsquerda.id = 'lapelLeft_geom';
    malhaLapelaEsquerda.gid = 'lapelLeft_geom';
    malhaLapelaDireita.id = 'lapelRight_geom';
    malhaLapelaDireita.gid = 'lapelRight_geom';

    // Criar geometria da calça (uma perna, reutilizada esquerda e direita)
    malhaCalca = new p5.Geometry(1, 1, function () {
        let linhas = 40;
        let colunas = 30;
        for (let r = 0; r <= linhas; r++) {
            let v = r / linhas;
            let y = lerp(68, -80, v);
            let radiusX = lerp(28, 18, v);
            let radiusZ = lerp(26, 16, v);

            for (let c = 0; c <= colunas; c++) {
                let u = c / colunas;
                let a = u * TWO_PI;
                let w = sin(u * TWO_PI * 4) * sin(v * PI * 8) * 1.5; // dobras
                this.vertices.push(createVector(cos(a) * radiusX + w, y, sin(a) * radiusZ + w));
                this.uvs.push([u, v]);
            }
        }
        for (let r = 0; r < linhas; r++) {
            for (let c = 0; c < colunas; c++) {
                let i0 = r * (colunas + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (colunas + 1) + c;
                let i3 = i2 + 1;
                this.faces.push([i0, i1, i2]);
                this.faces.push([i1, i3, i2]);
            }
        }
        this.computeNormals();

        // Corrigir a costura (seam) da calça
        for (let r = 0; r <= linhas; r++) {
            let i0 = r * (colunas + 1) + 0;
            let i1 = r * (colunas + 1) + colunas;
            let n0 = this.vertexNormals[i0];
            let n1 = this.vertexNormals[i1];
            let avgN = p5.Vector.add(n0, n1).normalize();
            this.vertexNormals[i0] = avgN.copy();
            this.vertexNormals[i1] = avgN.copy();
        }
    });
    malhaCalca.id = 'pants_geom';
    malhaCalca.gid = 'pants_geom';
}

function iniciarMalhaFaixa() {
    malhaFaixa = new p5.Geometry(1, 1, function () {
        let colunas = 60; // alto detalhe para curva suave
        let linhas = 4;

        // Faixa fica em Y=68, altura=13
        let yStart = 61.5;
        let yEnd = 74.5;

        for (let r = 0; r <= linhas; r++) {
            let v = r / linhas;
            let y = lerp(yStart, yEnd, v);

            // Raio da faixa empurrado mais para fora para liberar totalmente o corpo
            let rX = 56.5;
            let rZ = 34.0;

            for (let c = 0; c <= colunas; c++) {
                let u = c / colunas;
                let angle = u * TWO_PI;

                let nx = cos(angle);
                let nz = sin(angle);

                let px = rX * nx;
                let pz = rZ * nz;

                // Manter a frente levemente aberta ou fechar (o nó cobre)
                // Faremos apenas um tubo contínuo, o nó ficará no topo da frente
                this.vertices.push(createVector(px, y, pz));
                this.uvs.push([u, v]);
            }
        }

        // Gerar Triângulos
        for (let r = 0; r < linhas; r++) {
            for (let c = 0; c < colunas; c++) {
                let i0 = r * (colunas + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (colunas + 1) + c;
                let i3 = i2 + 1;

                // Y vai de 61.5 a 74.5 (aumentando). Então Y sobe.
                // Se +Y é para CIMA, então combina com a ordem de enrolamento do Tronco.
                this.faces.push([i0, i2, i1]);
                this.faces.push([i1, i2, i3]);
            }
        }
        this.computeNormals();

        // Corrigir a costura (seam) do tronco
        for (let j = 0; j <= linhas; j++) {
            let i0 = j * (colunas + 1) + 0;
            let i1 = j * (colunas + 1) + colunas;
            let n0 = this.vertexNormals[i0];
            let n1 = this.vertexNormals[i1];
            let avgN = p5.Vector.add(n0, n1).normalize();
            this.vertexNormals[i0] = avgN.copy();
            this.vertexNormals[i1] = avgN.copy();
        }
    });
}

function criarMalhaSegmentoBraco(length, startRadius, endRadius) {
    return new p5.Geometry(1, 1, function () {
        let linhas = 15;
        let colunas = 30;

        for (let r = 0; r <= linhas; r++) {
            let v = r / linhas;
            let raioAtual = lerp(startRadius, endRadius, v);
            // Y negativo para descer o braço (já que +Y é visualmente para CIMA no p5)
            let y = -v * length;

            for (let c = 0; c <= colunas; c++) {
                let u = c / colunas;
                let angle = u * TWO_PI;

                let nx = cos(angle);
                let nz = sin(angle);

                let px = raioAtual * nx;
                let pz = raioAtual * nz;

                // Adicionar dobras suaves na manga
                let dobra = sin(u * TWO_PI * 5.0) * sin(v * PI * 4.0) * 1.2;
                px += nx * dobra;
                pz += nz * dobra;

                this.vertices.push(createVector(px, y, pz));
                this.uvs.push([u, v]);
            }
        }

        for (let r = 0; r < linhas; r++) {
            for (let c = 0; c < colunas; c++) {
                let i0 = r * (colunas + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (colunas + 1) + c;
                let i3 = i2 + 1;

                // Ordem de enrolamento Anti-Horária para mangas
                this.faces.push([i0, i1, i2]);
                this.faces.push([i1, i3, i2]);
            }
        }
        this.computeNormals();

        // Corrigir a costura (seam) do cilindro fundindo as normais das bordas (u=0 e u=1)
        for (let r = 0; r <= linhas; r++) {
            let i0 = r * (colunas + 1) + 0;
            let i1 = r * (colunas + 1) + colunas;
            let n0 = this.vertexNormals[i0];
            let n1 = this.vertexNormals[i1];
            let avgN = p5.Vector.add(n0, n1).normalize();
            this.vertexNormals[i0] = avgN.copy();
            this.vertexNormals[i1] = avgN.copy();
        }
    });
}

function criarMalhaLapela(ehEsquerdo) {
    return new p5.Geometry(1, 1, function () {
        let linhas = 30;

        for (let r = 0; r <= linhas; r++) {
            let v = r / linhas;
            let y = lerp(145, 60, v); // Estender até 60 para esconder completamente sob a faixa

            // Dimensões do tronco neste Y
            let t = map(y, 60, 145, 0, 1);
            if (t < 0) t = 0;
            let rX = lerp(52.5, 68, t);
            let rZ = lerp(30, 38, t);
            let volumePeito = sin(t * PI);
            rX += volumePeito * 2.0;
            rZ += volumePeito * 4.0;

            // ehEsquerdo means WEARER's left (viewer's right)
            // Fazer a lapela cruzar mais para o lado (como um Kimono real) até -15 e 15
            let xCenter = ehEsquerdo ? lerp(35, -15, v) : lerp(-35, 15, v);
            let angleCenter = acos(constrain(xCenter / rX, -1, 1));

            // Lógica SEPARADA para cada lapela (Esquerda vs Direita)
            let anguloLargura = 0.20; // Largura base no pescoço

            // Sem lógica de afinamento (removido o map para 0.0)
            // Assim a lapela continua grossa até o fim, formando um V perfeito sem bico!

            for (let c = 0; c <= 1; c++) {
                let angle = angleCenter + (c === 0 ? -anguloLargura / 2 : anguloLargura / 2);
                let px = rX * cos(angle);
                let pz = rZ * sin(angle);

                // Lapela esquerda passa POR CIMA da direita.
                // Espessura muito fina para "grudar" no kimono e não criar vão
                let espessura = ehEsquerdo ? 0.8 : 0.4;

                // Prender ambas as lapelas suavemente para dentro do kimono no final
                if (v > 0.6) {
                    espessura -= (v - 0.6) * 10.0;
                }
                px += cos(angle) * espessura;
                pz += sin(angle) * espessura;

                this.vertices.push(createVector(px, y, pz));
                this.uvs.push([c, v]);
            }
        }

        for (let r = 0; r < linhas; r++) {
            let i0 = r * 2;
            let i1 = i0 + 1;
            let i2 = (r + 1) * 2;
            let i3 = i2 + 1;

            // Consertar a ordem de enrolamento para FORA para prevenir normais pretas
            this.faces.push([i0, i1, i2]);
            this.faces.push([i1, i3, i2]);
        }
        this.computeNormals();
    });
}

function desenharTroncoKimono() {
    // Se ainda não foi inicializado, inicializar
    if (!malhaTroncoKimono) {
        iniciarGeometriaKimono();
    }

    // Desativar contornos globalmente para não aparecer wireframes pretos (spheres, collars, etc)
    noStroke();

    // Material Type 1: Tecido Trançado Fosco Procedural
    meuShader.setUniform('uMaterialType', 1);

    let col = [0.95, 0.95, 0.95]; // Branco Padrão
    let giColorStr = 'white';
    if (window.modoApp === 'boutique') {
        giColorStr = window.corKimonoAtual || 'white';
    } else {
        giColorStr = (window.estadoLoja && window.estadoLoja.blusa) ? window.estadoLoja.blusa.cor : 'white';
    }

    if (giColorStr === 'blue') {
        col = [0.08, 0.22, 0.58]; // Azul Royal
    } else if (giColorStr === 'black') {
        col = [0.12, 0.12, 0.14]; // Preto Profundo
    }

    // -----------------------------------------------------------------
    // DESENHO DO CORPO (Torso e Mangas)
    // -----------------------------------------------------------------

    // TRONCO PRINCIPAL DO KIMONO
    // Toda a abertura do peito, rashguard e lapela são desenhados 
    // diretamente via fragment shader (frag.glsl)!
    push();
    meuShader.setUniform('uMaterialType', 1);
    meuShader.setUniform('uBaseColor', col);

    // Configurar o decalque do peito
    meuShader.setUniform('uKimonoPart', 1);
    let brand = (typeof modoApp !== 'undefined' && modoApp === 'ecommerce' && typeof estadoLoja !== 'undefined') ? estadoLoja.blusa.marca : 'Atama';

    let brandId = 0; // Atama
    if (brand === 'Vouk') brandId = 1;
    if (brand === 'Kingz') brandId = 2;
    meuShader.setUniform('uBrandId', brandId);

    let isLightGi = false;
    if (giColorStr && (giColorStr.toLowerCase().includes('white') || giColorStr.toLowerCase().includes('branco') || giColorStr.toLowerCase().includes('fff'))) isLightGi = true;
    
    if (brand === 'Vouk' && typeof texturaVouk !== 'undefined') meuShader.setUniform('texPeito', texturaVouk);
    if (brand === 'Atama' && typeof texturaPeitoAtamaClara !== 'undefined') meuShader.setUniform('texPeito', isLightGi ? texturaPeitoAtamaEscura : texturaPeitoAtamaClara);
    if (brand === 'Kingz' && typeof texturaPeitoKingzClara !== 'undefined') meuShader.setUniform('texPeito', isLightGi ? texturaPeitoKingzEscura : texturaPeitoKingzClara);

    model(malhaTroncoKimono);

    meuShader.setUniform('uKimonoPart', 0); // Reset
    pop();

    // O peito interno (Rashguard) agora é resolvido via Fragment Shader,
    // garantindo que NADA vaze ou trespasse a malha do kimono!

    // RESTAURAR Material e Cor do Kimono para as Mangas!
    meuShader.setUniform('uMaterialType', 1);
    meuShader.setUniform('uBaseColor', col);

    // --- SISTEMA HIERÁRQUICO DE OSSOS (Cinemática Direta) ---
    // A pose agora é estática já que a animação de poses foi removida.
    let p = { lShoulderZ: -20, lShoulderX: 0, lElbowX: -5, rShoulderZ: 20, rShoulderX: 0, rElbowX: -5 };

    // função auxiliar para desenhar um braço
    let drawArm = function (ehEsquerdo) {
        let sign = ehEsquerdo ? -1 : 1;
        let sZ = ehEsquerdo ? p.lShoulderZ : p.rShoulderZ;
        let sX = ehEsquerdo ? p.lShoulderX : p.rShoulderX;
        let eX = ehEsquerdo ? p.lElbowX : p.rElbowX;

        push();
        // 1. Articulação do Ombro (Translação a partir do tronco)
        translate(sign * 54, 125, 0);

        // Capa Esférica do Ombro (achatada para não parecer uma bola)
        meuShader.setUniform('uMaterialType', 1);
        push();
        scale(1.0, 0.35, 1.0); // Achata no eixo Y para virar uma "tampa"
        sphere(16.5);
        pop();

        // 2. Rotação do Ombro
        rotateZ(radians(sZ));
        rotateX(radians(sX));

        // 3. Desenhar Braço Superior
        let brand = (typeof modoApp !== 'undefined' && modoApp === 'ecommerce' && typeof estadoLoja !== 'undefined') ? estadoLoja.blusa.marca : 'Atama';
        if (ehEsquerdo) {
            meuShader.setUniform('uKimonoPart', 2);
        } else {
            meuShader.setUniform('uKimonoPart', 3);
        }
        if (brand === 'Vouk' && typeof texturaOmbroVouk !== 'undefined') meuShader.setUniform('texOmbro', texturaOmbroVouk);
        if (brand === 'Atama' && typeof texturaOmbroAtamaClara !== 'undefined') meuShader.setUniform('texOmbro', isLightGi ? texturaOmbroAtamaEscura : texturaOmbroAtamaClara);
        if (brand === 'Kingz' && typeof texturaOmbroKingz !== 'undefined') meuShader.setUniform('texOmbro', texturaOmbroKingz);

        model(malhaBracoSuperior);
        meuShader.setUniform('uKimonoPart', 0); // Reset

        // 4. Articulação do Cotovelo (Translação para o fim do braço superior)
        translate(0, -48, 0); // Comprimento do braço superior é 48

        // Capa Esférica do Cotovelo (Usa o tecido do kimono para misturar perfeitamente)
        meuShader.setUniform('uMaterialType', 1);
        sphere(11.5);

        // 5. Rotação do Cotovelo (Articulação de Dobradiça)
        rotateX(radians(eX));

        // 6. Desenhar Antebraço
        model(malhaAntebraco);

        pop();
    };

    // Desenhar Braços Esquerdo e Direito Hierarquicamente
    drawArm(true);
    drawArm(false);

    // LAPELAS DA GOLA (Agora no Shader!)
    // As malhas 3D antigas foram removidas para usar a lapela procedural
    // no frag.glsl. Isso permite projeção de decalque sem degraus!


}

function desenharLapela() {
    // LAPELAS DA GOLA (Procedural)
    // Usar material de tecido sólido para as lapelas se destacarem
    meuShader.setUniform('uMaterialType', 4);

    // Tom sutilmente mais escuro (98%) para parecer o mesmo tecido
    let col = [0.95, 0.95, 0.95];
    let giColorStr = 'white';
    if (window.modoApp === 'boutique') {
        giColorStr = window.corKimonoAtual || 'white';
    } else {
        giColorStr = (window.estadoLoja && window.estadoLoja.blusa) ? window.estadoLoja.blusa.cor : 'white';
    }

    if (giColorStr === 'blue') col = [0.08, 0.22, 0.58];
    else if (giColorStr === 'black') col = [0.12, 0.12, 0.14];

    // Estilo personalizado da marca para a Lapela
    let brand = (typeof modoApp !== 'undefined' && modoApp === 'ecommerce' && typeof estadoLoja !== 'undefined') ? estadoLoja.blusa.marca : 'Atama';

    meuShader.setUniform('uBaseColor', [col[0] * 0.98, col[1] * 0.98, col[2] * 0.98]);

    push();

    // ATIVAR PROJEÇÃO DE DECALQUE NO PEITO PARA A LAPELA
    meuShader.setUniform('uKimonoPart', 1);
    isLightGi = false;
    if (giColorStr && (giColorStr.toLowerCase().includes('white') || giColorStr.toLowerCase().includes('branco') || giColorStr.toLowerCase().includes('fff'))) isLightGi = true;

    if (brand === 'Vouk' && typeof texturaVouk !== 'undefined') meuShader.setUniform('texPeito', texturaVouk);
    if (brand === 'Atama' && typeof texturaPeitoAtamaClara !== 'undefined') meuShader.setUniform('texPeito', isLightGi ? texturaPeitoAtamaEscura : texturaPeitoAtamaClara);
    if (brand === 'Kingz' && typeof texturaPeitoKingzClara !== 'undefined') meuShader.setUniform('texPeito', isLightGi ? texturaPeitoKingzEscura : texturaPeitoKingzClara);

    model(malhaLapelaDireita); // Desenhar o de baixo primeiro
    model(malhaLapelaEsquerda);  // Desenhar o de cima

    meuShader.setUniform('uKimonoPart', 0); // reset
    pop();

    // Parte de trás da Gola
    push();
    translate(0, 145, -8);
    rotateX(HALF_PI);
    cylinder(38, 12);
    pop();
}

function desenharCalca() {
    if (!malhaCalca) iniciarGeometriaKimono();

    let pColorStr = 'white';
    if (window.modoApp === 'boutique') {
        // Usar a cor da blusa para a calça no modo clássico
        pColorStr = window.corKimonoAtual || 'white';
    } else {
        pColorStr = (window.estadoLoja && window.estadoLoja.calca) ? window.estadoLoja.calca.cor : 'white';
    }

    let pColor = [0.95, 0.95, 0.95];
    if (pColorStr === 'blue') pColor = [0.08, 0.22, 0.58];
    if (pColorStr === 'black') pColor = [0.12, 0.12, 0.14];

    meuShader.setUniform('uMaterialType', 1);
    meuShader.setUniform('uBaseColor', pColor);
    noStroke();

    // Desenhar perna esquerda
    push();
    translate(-16.5, 0, 0);
    meuShader.setUniform('uKimonoPart', 4);
    let brand = (typeof modoApp !== 'undefined' && modoApp === 'ecommerce' && typeof estadoLoja !== 'undefined') ? estadoLoja.calca.marca : 'Atama';

    let brandId = 0; // Atama
    if (brand === 'Vouk') brandId = 1;
    if (brand === 'Kingz') brandId = 2;
    meuShader.setUniform('uBrandId', brandId);

    let isLightPants = false;
    if (pColorStr && (pColorStr.toLowerCase().includes('white') || pColorStr.toLowerCase().includes('branco') || pColorStr.toLowerCase().includes('fff'))) isLightPants = true;

    if (brand === 'Vouk' && typeof texturaCalcaVouk !== 'undefined') {
        meuShader.setUniform('texCalca', texturaCalcaVouk);
        meuShader.setUniform('uPantsPatchSize', [18.0, 18.0]);
    } else if (brand === 'Atama' && typeof texturaCalcaAtamaClara !== 'undefined') {
        meuShader.setUniform('texCalca', isLightPants ? texturaCalcaAtamaEscura : texturaCalcaAtamaClara);
        meuShader.setUniform('uPantsPatchSize', [18.0, 18.0]);
    } else if (brand === 'Kingz' && typeof texturaCalcaKingz !== 'undefined') {
        meuShader.setUniform('texCalca', texturaCalcaKingz);
        meuShader.setUniform('uPantsPatchSize', [18.0, 18.0]);
    }
    model(malhaCalca);
    meuShader.setUniform('uKimonoPart', 0); // Reset
    pop();

    // Desenhar perna direita
    push();
    translate(16.5, 0, 0);
    // Remove scale(-1, 1, 1) so text doesn't render backwards
    meuShader.setUniform('uKimonoPart', 5); // Right leg

    let isLightPantsR = false;
    if (pColorStr && (pColorStr.toLowerCase().includes('white') || pColorStr.toLowerCase().includes('branco') || pColorStr.toLowerCase().includes('fff'))) isLightPantsR = true;

    if (brand === 'Vouk' && typeof texturaCalcaVouk !== 'undefined') {
        meuShader.setUniform('texCalca', texturaCalcaVouk);
        meuShader.setUniform('uPantsPatchSize', [18.0, 18.0]);
    } else if (brand === 'Atama' && typeof texturaCalcaAtamaClara !== 'undefined') {
        meuShader.setUniform('texCalca', isLightPantsR ? texturaCalcaAtamaEscura : texturaCalcaAtamaClara);
        meuShader.setUniform('uPantsPatchSize', [18.0, 18.0]);
    } else if (brand === 'Kingz' && typeof texturaCalcaKingz !== 'undefined') {
        meuShader.setUniform('texCalca', texturaCalcaKingz);
        meuShader.setUniform('uPantsPatchSize', [18.0, 18.0]);
    }

    model(malhaCalca);
    meuShader.setUniform('uKimonoPart', 0); // Reset
    pop();

    // Preenchimento do Quadril/Virilha
    push();
    translate(0, 60, 0);
    scale(24, 18, 20);
    sphere(1, 16, 16);
    pop();
}


