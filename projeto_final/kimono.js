// Variáveis globais malhas geométricas

let malha_tronco_kimono;
let malha_braco_superior;
let malha_antebraco;
let malha_faixa;
let malha_lapela_esquerda;
let malha_lapela_direita;
let malha_calca;

// Inicialização da geometria

function SuavizarCosturaCilindro(geom, linhas, colunas) {
    for (let r = 0; r <= linhas; r++) {
        let i0   = r * (colunas + 1) + 0;
        let i1   = r * (colunas + 1) + colunas;
        let avg_n = p5.Vector.add(geom.vertexNormals[i0], geom.vertexNormals[i1]).normalize();
        geom.vertexNormals[i0] = avg_n.copy();
        geom.vertexNormals[i1] = avg_n.copy();
    }
}

function ObterCorKimono(parte) {
    let cor_str = 'white';
    if (window.modo_app === 'Vitrine') cor_str = window.corKimonoAtual || 'white';
    else if (window.estado_loja && window.estado_loja[parte]) cor_str = window.estado_loja[parte].cor;

    let rgb = [0.95, 0.95, 0.95];
    if (cor_str === 'blue') rgb = [0.08, 0.22, 0.58];
    if (cor_str === 'black') rgb = [0.12, 0.12, 0.14];

    return { rgb: rgb, is_claro: (cor_str.toLowerCase().includes('white') || cor_str.toLowerCase().includes('branco')) };
}

function AplicarTexturaPeito(marca, gi_claro) {
    if (marca === 'Vouk'  && typeof textura_vouk !== 'undefined') meu_shader.setUniform('texPeito', textura_vouk);
    if (marca === 'Atama' && typeof textura_peito_atama_clara !== 'undefined') meu_shader.setUniform('texPeito', gi_claro ? textura_peito_atama_escura : textura_peito_atama_clara);
    if (marca === 'Kingz' && typeof textura_peito_kingz_clara !== 'undefined') meu_shader.setUniform('texPeito', gi_claro ? textura_peito_kingz_escura : textura_peito_kingz_clara);
}

function IniciarGeometriaKimono() {
    // p5.Geometry constrói e armazena em cache as malhas personalizadas com UVs e normais.
    // Cada chamada com detailX/Y únicos evita colisões de cache no p5.Geometry.

    malha_tronco_kimono = new p5.Geometry(1, 1, function () {
        let linhas  = 40;
        let colunas = 50;

        for (let r = 0; r <= linhas; r++) {
            let v     = r / linhas;
            let y_base = v * 145;

            for (let c = 0; c <= colunas; c++) {
                let u      = c / colunas;
                let angulo = u * TWO_PI;
                let nx     = cos(angulo);
                let nz     = sin(angulo);
                let rX, rZ;
                let y = y_base;

                if (y_base < 68) {
          // Saia abaixo da faixa abre progressivamente para baixo
                    let t = map(y_base, 0, 68, 0, 1);
                    rX = lerp(66, 52.5, t);
                    rZ = lerp(45, 30, t);
                } else {
                    // Tronco acima da faixa
                    let t = map(y_base, 68, 145, 0, 1);
                    if (t < 0.8) {
                        let t2 = t / 0.8;
                        rX = lerp(52.5, 68, t2);
                        rZ = lerp(30, 38, t2);
                    } else {
                        let t2 = (t - 0.8) / 0.2;
                        let suave_t2 = t2 * t2 * (3.0 - 2.0 * t2); // Smoothstep
                        rX = lerp(68, 32, suave_t2);
                        rZ = lerp(38, 28, suave_t2);
                    }
                    // Volume do peito
                    let volume_peito = sin(t * PI);
                    rX += volume_peito * 2.0;
                    rZ += volume_peito * 4.0;
                }

                // Decote nas costas (nuca) para caimento realista
                if (y_base > 130) {
                    let t_nuca = map(y_base, 130, 145, 0, 1);
                    if (nz < 0) {
                        y -= t_nuca * abs(nz) * 8.0;
                    }
                }

                let px = rX * nx;
                let pz = rZ * nz;

                // Dobras procedurais do tecido
                let escala_dobra = map(y, 0, 145, 0.6, 1.0);

                // Suavizar dobras na área da faixa para evitar cortes na malha
                let dist_faixa = abs(y - 68.0);
                if (dist_faixa < 12.0) {
                    let t_s = dist_faixa / 12.0;
                    let t_smooth = t_s * t_s * (3.0 - 2.0 * t_s);
                    escala_dobra *= t_smooth;
                }

                let dobra = sin(u * TWO_PI * 6.0 + v * 3.0) * sin(v * PI * 3.0) * 1.5;
                px += nx * dobra * escala_dobra;
                pz += nz * dobra * escala_dobra;

                this.vertices.push(createVector(px, y, pz));
                this.uvs.push([u, v * 2.0]);
            }
        }

        // Triângulos com ordem Anti-Horária para normais corretas
        for (let r = 0; r < linhas; r++) {
            for (let c = 0; c < colunas; c++) {
                let i0 = r * (colunas + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (colunas + 1) + c;
                let i3 = i2 + 1;
                this.faces.push([i0, i2, i1]);
                this.faces.push([i1, i2, i3]);
            }
        }
        this.computeNormals();

        // Fundir normais na costura (u=0 e u=1) para eliminar a linha de junção
        SuavizarCosturaCilindro(this, linhas, colunas);
    });

  // Mangas segmentos cilíndricos com dobras suaves
    malha_braco_superior = CriarMalhaSegmentoBraco(48, 16, 13);
    malha_antebraco      = CriarMalhaSegmentoBraco(48, 13, 9.5);
    malha_braco_superior.id  = 'upperArm_geom';
    malha_braco_superior.gid = 'upperArm_geom';
    malha_antebraco.id       = 'forearm_geom';
    malha_antebraco.gid      = 'forearm_geom';

    // Faixa procedural que envolve a cintura
    IniciarMalhaFaixa();
    malha_faixa.id  = 'proceduralBelt_geom';
    malha_faixa.gid = 'proceduralBelt_geom';

    // Lapelas do kimono (faixas diagonais do peito)
    malha_lapela_esquerda     = CriarMalhaLapela(true);
    malha_lapela_direita      = CriarMalhaLapela(false);
    malha_lapela_esquerda.id  = 'lapelLeft_geom';
    malha_lapela_esquerda.gid = 'lapelLeft_geom';
    malha_lapela_direita.id   = 'lapelRight_geom';
    malha_lapela_direita.gid  = 'lapelRight_geom';

  // Calça perna única com deslocamento lateral crescente (+X), espelhada para a perna esquerda
    malha_calca = new p5.Geometry(1, 1, function () {
        let linhas   = 40;
        let colunas  = 30;
        let spread_x = 14; // Deslocamento lateral cresce conforme desce

        for (let r = 0; r <= linhas; r++) {
            let v         = r / linhas;
            let y         = lerp(68, -80, v);
            let raio_x    = lerp(26, 16, v);
            let raio_z    = lerp(24, 15, v);
            let x_centro  = lerp(0, spread_x, v);

            for (let c = 0; c <= colunas; c++) {
                let u = c / colunas;
                let a = u * TWO_PI;
                let w = sin(u * TWO_PI * 4) * sin(v * PI * 8) * 1.5; // Relevo do tecido
                this.vertices.push(createVector(x_centro + cos(a) * raio_x + w, y, sin(a) * raio_z + w));
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

        SuavizarCosturaCilindro(this, linhas, colunas);
    });
    malha_calca.id  = 'pants_geom';
    malha_calca.gid = 'pants_geom';
}

// Geometria auxiliar faixa e segmentos de braço

function IniciarMalhaFaixa() {
    malha_faixa = new p5.Geometry(1, 1, function () {
        let colunas = 60;
        let linhas  = 4;
        let y_inicio = 61.5;
        let y_fim    = 74.5;
        let raio_x   = 56.5;
        let raio_z   = 34.0;

        for (let r = 0; r <= linhas; r++) {
            let v = r / linhas;
            let y = lerp(y_inicio, y_fim, v);
            for (let c = 0; c <= colunas; c++) {
                let u      = c / colunas;
                let angulo = u * TWO_PI;
                this.vertices.push(createVector(raio_x * cos(angulo), y, raio_z * sin(angulo)));
                this.uvs.push([u, v]);
            }
        }

        for (let r = 0; r < linhas; r++) {
            for (let c = 0; c < colunas; c++) {
                let i0 = r * (colunas + 1) + c;
                let i1 = i0 + 1;
                let i2 = (r + 1) * (colunas + 1) + c;
                let i3 = i2 + 1;
                this.faces.push([i0, i2, i1]);
                this.faces.push([i1, i2, i3]);
            }
        }
        this.computeNormals();

        SuavizarCosturaCilindro(this, linhas, colunas);
    });
}

function CriarMalhaSegmentoBraco(comprimento, raio_inicio, raio_fim) {
    return new p5.Geometry(1, 1, function () {
        let linhas  = 15;
        let colunas = 30;

        for (let r = 0; r <= linhas; r++) {
            let v           = r / linhas;
            let raio_atual  = lerp(raio_inicio, raio_fim, v);
            let y           = -v * comprimento; // Y negativo = braço desce

            for (let c = 0; c <= colunas; c++) {
                let u      = c / colunas;
                let angulo = u * TWO_PI;
                let nx     = cos(angulo);
                let nz     = sin(angulo);
                let px     = raio_atual * nx;
                let pz     = raio_atual * nz;

                // Dobras suaves na manga
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
                this.faces.push([i0, i1, i2]);
                this.faces.push([i1, i3, i2]);
            }
        }
        this.computeNormals();

        SuavizarCosturaCilindro(this, linhas, colunas);
    });
}

function CriarMalhaLapela(eh_esquerdo) {
    return new p5.Geometry(1, 1, function () {
        let linhas = 30;

        for (let r = 0; r <= linhas; r++) {
            let v = r / linhas;
            let y = lerp(145, 60, v);

            // Dimensões do tronco nesta altura
            let t = map(y, 60, 145, 0, 1);
            if (t < 0) t = 0;
            let rX = lerp(52.5, 68, t);
            let rZ = lerp(30, 38, t);
            let volume_peito = sin(t * PI);
            rX += volume_peito * 2.0;
            rZ += volume_peito * 4.0;

            // eh_esquerdo = lado do usador (direito para o espectador)
            let x_centro      = eh_esquerdo ? lerp(35, -15, v) : lerp(-35, 15, v);
            let angulo_centro  = acos(constrain(x_centro / rX, -1, 1));
            let angulo_largura = 0.20;

            for (let c = 0; c <= 1; c++) {
                let angulo = angulo_centro + (c === 0 ? -angulo_largura / 2 : angulo_largura / 2);
                let px     = rX * cos(angulo);
                let pz     = rZ * sin(angulo);

                // Lapela esquerda passa por cima da direita
                let espessura = eh_esquerdo ? 0.8 : 0.4;
                if (v > 0.6) {
                    espessura -= (v - 0.6) * 10.0;
                }
                px += cos(angulo) * espessura;
                pz += sin(angulo) * espessura;

                this.vertices.push(createVector(px, y, pz));
                this.uvs.push([c, v]);
            }
        }

        for (let r = 0; r < linhas; r++) {
            let i0 = r * 2;
            let i1 = i0 + 1;
            let i2 = (r + 1) * 2;
            let i3 = i2 + 1;
            this.faces.push([i0, i1, i2]);
            this.faces.push([i1, i3, i2]);
        }
        this.computeNormals();
    });
}

// Renderização tronco, mangas e lapelas

function DesenharTroncoKimono() {
    if (!malha_tronco_kimono) IniciarGeometriaKimono();

    noStroke();
    meu_shader.setUniform('uMaterialType', 1);

    // Determinar a cor base do kimono conforme o modo atual
    let corObj = ObterCorKimono('blusa');
    let cor = corObj.rgb;
    let gi_claro = corObj.is_claro;

    // Identificar a marca selecionada
    let marca   = (typeof modo_app !== 'undefined' && modo_app === 'loja' && typeof estado_loja !== 'undefined') ? estado_loja.blusa.marca : 'Atama';
    let id_marca = 0;
    if (marca === 'Vouk')  id_marca = 1;
    if (marca === 'Kingz') id_marca = 2;

    // Tronco principal com projeção de decalque de peito
    push();
    meu_shader.setUniform('uMaterialType', 1);
    meu_shader.setUniform('uBaseColor', cor);
    meu_shader.setUniform('uKimonoPart', 1);
    meu_shader.setUniform('uBrandId', id_marca);

    // Bordado nas costas (quando ativo)
    if (typeof estado_loja !== 'undefined' && (estado_loja.bordadoNome || estado_loja.bordadoEquipe)
        && typeof imagem_bordado_cache !== 'undefined' && imagem_bordado_cache !== null) {
        meu_shader.setUniform('uHasBordado', 1);
        meu_shader.setUniform('texBordado', imagem_bordado_cache);
    } else {
        meu_shader.setUniform('uHasBordado', 0);
    }

    // Textura de peito da marca
    AplicarTexturaPeito(marca, gi_claro);

    model(malha_tronco_kimono);
    meu_shader.setUniform('uKimonoPart', 0);
    pop();

    // Restaurar material e cor para as mangas
    meu_shader.setUniform('uMaterialType', 1);
    meu_shader.setUniform('uBaseColor', cor);

    // Pose estática dos braços (cinemática direta simplificada)
    let pose = { ombroZEsq: -20, ombroXEsq: 0, cotoveloPEsq: -5, ombroZDir: 20, ombroXDir: 0, cotoveloDir: -5 };

    // Função local para desenhar um braço (esquerdo ou direito)
    let DesenharBraco = function (eh_esquerdo) {
        let sinal = eh_esquerdo ? -1 : 1;
        let sZ    = eh_esquerdo ? pose.ombroZEsq : pose.ombroZDir;
        let sX    = eh_esquerdo ? pose.ombroXEsq : pose.ombroXDir;
        let eX    = eh_esquerdo ? pose.cotoveloPEsq : pose.cotoveloDir;

        push();
        translate(sinal * 54, 125, 0);

        // Tampa esférica do ombro (achatada para não parecer uma bola)
        meu_shader.setUniform('uMaterialType', 1);
        push();
        scale(1.0, 0.35, 1.0);
        sphere(16.5);
        pop();

        rotateZ(radians(sZ));
        rotateX(radians(sX));

        // Decalque de ombro da marca
        let marca_braco = (typeof modo_app !== 'undefined' && modo_app === 'loja' && typeof estado_loja !== 'undefined') ? estado_loja.blusa.marca : 'Atama';
        meu_shader.setUniform('uKimonoPart', eh_esquerdo ? 2 : 3);

        if (marca_braco === 'Vouk'  && typeof textura_ombro_vouk        !== 'undefined') meu_shader.setUniform('texOmbro', textura_ombro_vouk);
        if (marca_braco === 'Atama' && typeof textura_ombro_atama_clara !== 'undefined') meu_shader.setUniform('texOmbro', gi_claro ? textura_ombro_atama_escura : textura_ombro_atama_clara);
        if (marca_braco === 'Kingz' && typeof textura_ombro_kingz       !== 'undefined') meu_shader.setUniform('texOmbro', textura_ombro_kingz);

        model(malha_braco_superior);
        meu_shader.setUniform('uKimonoPart', 0);

        // Cotovelo esférico e antebraço
        translate(0, -48, 0);
        meu_shader.setUniform('uMaterialType', 1);
        sphere(11.5);
        rotateX(radians(eX));
        model(malha_antebraco);

        pop();
    };

    DesenharBraco(true);
    DesenharBraco(false);
}

function DesenharLapela() {
    meu_shader.setUniform('uMaterialType', 4);

    let corObj = ObterCorKimono('blusa');
    let cor = corObj.rgb;
    let gi_claro = corObj.is_claro;
    let marca    = (typeof modo_app !== 'undefined' && modo_app === 'loja' && typeof estado_loja !== 'undefined') ? estado_loja.blusa.marca : 'Atama';

    meu_shader.setUniform('uBaseColor', [cor[0] * 0.98, cor[1] * 0.98, cor[2] * 0.98]);

    push();
    meu_shader.setUniform('uKimonoPart', 1);

    AplicarTexturaPeito(marca, gi_claro);

    model(malha_lapela_direita);   // Baixo (por baixo da esquerda)
    model(malha_lapela_esquerda);  // Cima (passa por cima)
    meu_shader.setUniform('uKimonoPart', 0);
    pop();

    // Gola traseira
    push();
    translate(0, 145, -8);
    rotateX(HALF_PI);
    cylinder(38, 12);
    pop();
}

// Renderização calça

function DesenharCalca() {
    if (!malha_calca) IniciarGeometriaKimono();

    let corObj = ObterCorKimono('calca');
    let cor = corObj.rgb;
    let calca_clara = corObj.is_claro;

    let marca    = (typeof modo_app !== 'undefined' && modo_app === 'loja' && typeof estado_loja !== 'undefined') ? estado_loja.calca.marca : 'Atama';
    let id_marca = 0;
    if (marca === 'Vouk')  id_marca = 1;
    if (marca === 'Kingz') id_marca = 2;


    meu_shader.setUniform('uMaterialType', 1);
    meu_shader.setUniform('uBaseColor', cor);
    meu_shader.setUniform('uBrandId', id_marca);
    noStroke();

    // Aplicar textura do patch da calça
    function AplicarTexturaPatch() {
        if (marca === 'Vouk' && typeof textura_calca_vouk !== 'undefined') {
            meu_shader.setUniform('texCalca', textura_calca_vouk);
            meu_shader.setUniform('uPantsPatchSize', [18.0, 18.0]);
        } else if (marca === 'Atama' && typeof textura_calca_atama_clara !== 'undefined') {
            meu_shader.setUniform('texCalca', calca_clara ? textura_calca_atama_escura : textura_calca_atama_clara);
            meu_shader.setUniform('uPantsPatchSize', [18.0, 18.0]);
        } else if (marca === 'Kingz' && typeof textura_calca_kingz !== 'undefined') {
            meu_shader.setUniform('texCalca', textura_calca_kingz);
            meu_shader.setUniform('uPantsPatchSize', [18.0, 18.0]);
        }
    }

  // Perna direita spread em +X
    push();
    translate(16.5, 0, 0);
    meu_shader.setUniform('uKimonoPart', 5);
    AplicarTexturaPatch();
    model(malha_calca);
    meu_shader.setUniform('uKimonoPart', 0);
    pop();

  // Perna esquerda espelhada para spread em -X
    push();
    translate(-16.5, 0, 0);
    scale(-1, 1, 1);
    meu_shader.setUniform('uKimonoPart', 4);
    AplicarTexturaPatch();
    model(malha_calca);
    meu_shader.setUniform('uKimonoPart', 0);
    pop();
}
