#version 300 es
precision highp float;

// Entradas do vertex shader
in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vViewPosition;
in vec3 vModelPosition;

// Saída final do pixel
out vec4 fragColor;

// Uniforms interface com o JavaScript via p5.js
uniform sampler2D tex;          // Textura dinâmica (placas, texto)
uniform int uBeltStyle;         // Estilo da faixa (0=sólido, 1=coral, 2=coral-branca)
uniform vec3 uLightDir;         // Direção da luz no espaço de visão
uniform int uMaterialType;      // Tipo de material do fragmento atual
uniform vec3 uBaseColor;        // Cor base do material ativo
uniform float uWearLevel;       // Nível de desgaste do tecido (0.0 a 1.0)
uniform float uKimonoPart;      // 0=Nenhum, 1=Peito, 2=BraçoEsq, 3=BraçoDir, 4=PernEsq, 5=PernDir
uniform sampler2D texPeito;     // Textura do patch de peito/marca
uniform sampler2D texOmbro;     // Textura do patch de ombro
uniform sampler2D texCalca;     // Textura do patch da calça
uniform vec2 uPantsPatchSize;   // Tamanho do patch da calça em unidades de modelo
uniform sampler2D texBordado;   // Textura do bordado personalizado
uniform int uHasBordado;        // Flag para habilitar o bordado nas costas
uniform int uBrandId;           // Identificador da marca: 0=Atama, 1=Vouk, 2=Kingz

void main() {
    // Vetores para iluminação Blinn-Phong
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDir);
    vec3 V = normalize(-vViewPosition);
    vec3 H = normalize(L + V);

    // Propriedades padrão do material
    vec3  cor_difusa       = uBaseColor;
    float forca_especular  = 0.5;
    float brilho           = 32.0;
    vec3  cor_especular    = vec3(1.0);

    // DEFINIÇÕES DE MATERIAL EM ORDEM NUMÉRICA
    // Material 0: Pedestal (Plástico/Mármore Preto Polido)
    if (uMaterialType == 0) {
        cor_difusa      = vec3(0.05, 0.06, 0.08);
        forca_especular = 1.3;
        brilho          = 64.0;
        cor_especular   = vec3(0.9, 0.95, 1.0);
    }
    // Material 1: Tecido do Kimono (Pearl Weave Fosco)
    else if (uMaterialType == 1) {
        cor_difusa = uBaseColor;

        float dist_frente = abs(vTexCoord.x - 0.25);

        // Ruído de pérola (pearl weave) para bump sutil
        float ruido     = fract(sin(dot(vModelPosition.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        vec3  bump_tela = vec3(ruido * 0.05);

        // Decote em V, rashguard interno e lapela todos procedurais
        float borda_v      = (vTexCoord.y - 1.25) * 0.10;
        float borda_lapela = (vTexCoord.y - 1.25) * 0.10 + 0.028;

        if (vTexCoord.y > 1.25 && dist_frente < borda_v) {
            // Rashguard interno (Lycra preta)
            cor_difusa      = vec3(0.08, 0.08, 0.09);
            N               = normalize(vNormal);
            forca_especular = 0.02;
            brilho          = 2.0;
        } else if (borda_lapela > 0.0 && dist_frente < borda_lapela) {
            // Faixa da lapela tom levemente escurecido, mantém textura do kimono
            cor_difusa      = uBaseColor * 0.85;
            N               = normalize(N + bump_tela);
            forca_especular = 0.08;
            brilho          = 6.0;
        } else {
            // Tecido principal Pearl Weave
            cor_difusa      = uBaseColor;
            N               = normalize(N + bump_tela);
            forca_especular = 0.08;
            brilho          = 6.0;
        }
    }
    // Material 2: Tecido da Faixa (Fita Fosca com Relevo)
    else if (uMaterialType == 2) {
        vec3 cor_faixa = uBaseColor;

        // Listras procedurais para faixas coral e coral-branca
        if (uBeltStyle == 1 || uBeltStyle == 2) {
            float segmento = floor(vTexCoord.x * 14.0);
            if (mod(segmento, 2.0) == 0.0) {
                cor_faixa = vec3(0.78, 0.08, 0.08); // Vermelho
            } else {
                // Coral: preto alternado; coral-branca: branco-creme alternado
                cor_faixa = (uBeltStyle == 1) ? vec3(0.12, 0.12, 0.12) : vec3(0.95, 0.92, 0.78);
            }
        }

        cor_difusa      = cor_faixa;
        forca_especular = 0.02;
        brilho          = 2.0;
    }
    // Material 3: Placa Dourada com Texto Gravado (Alto Brilho)
    else if (uMaterialType == 3) {
        vec4  cor_tex  = texture(tex, vTexCoord);
        cor_difusa     = cor_tex.rgb;

        float brilho_tex = dot(cor_tex.rgb, vec3(0.299, 0.587, 0.114));
        float mascara    = smoothstep(0.25, 0.55, brilho_tex);

        cor_especular   = vec3(1.0, 0.85, 0.5);   // Ouro quente
        forca_especular = 2.2 * mascara;
        brilho          = 80.0;
    }
    // Material 4: Tecido Fosco Sólido (Lapelas, Esferas Base)
    else if (uMaterialType == 4) {
        cor_difusa      = uBaseColor;
        forca_especular = 0.05;
        brilho          = 2.0;
    }
    // Material 5: Textura Direta Sólida (Rashguard e Interior)
    else if (uMaterialType == 5) {
        vec4 cor_tex    = texture(tex, vTexCoord);
        cor_difusa      = cor_tex.rgb;
        forca_especular = 0.02;
        brilho          = 2.0;
    }
    // Material 6: Textura Não-iluminada (Quadros e Posteres na Parede)
    else if (uMaterialType == 6) {
        // vTexCoord é espelhado verticalmente pelo p5.js para planos
        vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
        vec4 cor_tex = texture(tex, st);

        if (cor_tex.a < 0.1) discard; // Suporta texturas transparentes

        cor_difusa      = cor_tex.rgb;
        forca_especular = 0.1;
        brilho          = 10.0;
    }
    // Material 7: Chão Quadriculado (Grade Procedural com UV)
    else if (uMaterialType == 7) {
        vec2 uv        = vTexCoord * 16.0;
        vec2 grade     = fract(uv);
        vec2 espessura = min(fwidth(uv) * 2.0, 0.5);
        vec2 borda     = smoothstep(1.0 - espessura, 1.0 - espessura * 0.5, grade);
        float e_linha  = max(borda.x, borda.y);

        cor_difusa      = mix(uBaseColor, vec3(0.05), e_linha);
        forca_especular = 0.0;
        brilho          = 1.0;
    }
    // Material 10: Ambiente Fosco Sólido (Paredes, Fundo)
    else if (uMaterialType == 10) {
        cor_difusa      = uBaseColor;
        forca_especular = 0.05;
        brilho          = 2.0;
    }
    // Material 11: Chão Fixo no Mundo (Grade com UV de Mundo)
    else if (uMaterialType == 11) {
        float tam_azulejo = 125.0;
        vec2 uv_mundo     = vModelPosition.xz / tam_azulejo;
        vec2 grade_ws     = fract(uv_mundo);
        vec2 esp_ws       = min(fwidth(uv_mundo) * 2.0, 0.5);
        vec2 borda_ws     = smoothstep(1.0 - esp_ws, 1.0 - esp_ws * 0.5, grade_ws);
        float e_linha_ws  = max(borda_ws.x, borda_ws.y);
        cor_difusa        = mix(uBaseColor, vec3(0.05), e_linha_ws);
        forca_especular   = 0.0;
        brilho            = 1.0;
    }

    // PROJEÇÃO DE DECALQUES (Patches de Marca e Bordado)
    // Aplicado aos materiais 1, 4 e 5
    if (uMaterialType == 1 || uMaterialType == 4 || uMaterialType == 5) {
        vec4  cor_decal   = vec4(0.0);
        float alpha_sombra = 0.0;

        // Macro para suavizar as bordas do decalque (evita linhas de bounding box visíveis)
        #define FADE_BORDA(uv) (smoothstep(0.0, 0.03, uv.x) * smoothstep(1.0, 0.97, uv.x) * smoothstep(0.0, 0.03, uv.y) * smoothstep(1.0, 0.97, uv.y))

        // --- PATCH DE PEITO (parte 1) ---
        if (abs(uKimonoPart - 1.0) < 0.1) {
            vec3 centro_proj;
            vec2 uv;
            vec3 p;

            if (uBrandId == 2) {
                // Kingz: centro do peito, mais largo
                centro_proj = vec3(-40.0, 110.0, 43.0);
                p           = vModelPosition - centro_proj;
                uv          = vec2(1.0 - (p.x / 45.0 + 0.5), -p.y / 18.0 + 0.5);
            } else {
                // Atama / Vouk: barra da saia (lado esquerdo do usuário)
                centro_proj = vec3(-30.0, 45.0, 35.0);
                p           = vModelPosition - centro_proj;
                uv          = vec2(1.0 - (p.x / 36.0 + 0.5), -p.y / 18.0 + 0.5);
            }

            if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && abs(p.z) < 30.0) {
                cor_decal    = texture(texPeito, uv);
                cor_decal.a *= FADE_BORDA(uv);

                vec2 uv_sombra = uv + vec2(-0.015, 0.015);
                if (uBaseColor.r > 0.8 && uv_sombra.x > 0.0 && uv_sombra.x < 1.0 && uv_sombra.y > 0.0 && uv_sombra.y < 1.0) {
                    alpha_sombra = texture(texPeito, uv_sombra).a * FADE_BORDA(uv_sombra);
                }
            }

            // --- BORDADO NAS COSTAS ---
            if (uHasBordado == 1) {
                vec3 p_costas  = vModelPosition - vec3(0.0, 70.0, -30.0);
                vec2 uv_costas = vec2(p_costas.x / 140.0 + 0.5, -p_costas.y / 140.0 + 0.5);

                if (uv_costas.x >= 0.0 && uv_costas.x <= 1.0 && uv_costas.y >= 0.0 && uv_costas.y <= 1.0
                    && p_costas.z < 30.0 && p_costas.z > -40.0 && vModelPosition.z < 0.0) {
                    vec4 cor_bord = texture(texBordado, uv_costas);
                    if (cor_bord.a > 0.1) {
                        cor_decal    = cor_bord;
                        cor_decal.a *= FADE_BORDA(uv_costas);

                        vec2 uv_sombra = uv_costas + vec2(-0.01, 0.01);
                        if (uBaseColor.r > 0.8 && uv_sombra.x > 0.0 && uv_sombra.x < 1.0 && uv_sombra.y > 0.0 && uv_sombra.y < 1.0) {
                            alpha_sombra = texture(texBordado, uv_sombra).a * FADE_BORDA(uv_sombra);
                        }
                    }
                }
            }

        // --- PATCH DE OMBRO (partes 2 e 3) ---
        } else if (abs(uKimonoPart - 2.0) < 0.1 || abs(uKimonoPart - 3.0) < 0.1) {
            float sinal = (abs(uKimonoPart - 2.0) < 0.1) ? 1.0 : -1.0;
            vec3 p  = vModelPosition - vec3(-11.5 * sinal, -24.0, 11.5);
            
            // Rotação inversa do ombro (x: 4 graus, y: 45 graus)
            float cx = cos(0.069 * sinal);  float sx = sin(0.069 * sinal);
            vec3 p1  = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
            float cy = cos(0.785 * sinal);  float sy = sin(0.785 * sinal);
            vec3 p2  = vec3(p1.x * cy + p1.z * sy, p1.y, -p1.x * sy + p1.z * cy);

            vec2 uv = vec2(1.0 - (p2.x / 18.0 + 0.5), -p2.y / 18.0 + 0.5);
            if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && abs(p2.z) < 10.0) {
                cor_decal    = texture(texOmbro, uv);
                cor_decal.a *= FADE_BORDA(uv);

                vec2 uv_sombra = uv + vec2(-0.015, 0.015);
                if (uBaseColor.r > 0.8 && uv_sombra.x > 0.0 && uv_sombra.x < 1.0 && uv_sombra.y > 0.0 && uv_sombra.y < 1.0) {
                    alpha_sombra = texture(texOmbro, uv_sombra).a * FADE_BORDA(uv_sombra);
                }
            }

        // --- PATCH DA CALÇA (partes 4 e 5) ---
        } else if (abs(uKimonoPart - 4.0) < 0.1 || abs(uKimonoPart - 5.0) < 0.1) {
            vec3 centro_proj = vec3(9999.0); // Oculto por padrão

            if (uBrandId == 2 && abs(uKimonoPart - 4.0) < 0.1) {
                centro_proj = vec3(5.0, -5.0, 30.0);   // Kingz perna esquerda
            } else if (uBrandId == 1 && abs(uKimonoPart - 5.0) < 0.1) {
                centro_proj = vec3(5.0, -10.0, 20.0);  // Vouk  perna direita
            } else if (uBrandId == 0 && abs(uKimonoPart - 5.0) < 0.1) {
                centro_proj = vec3(5.0, -30.0, 20.0);  // Atama perna direita
            }

            vec3 p  = vModelPosition - centro_proj;
            vec2 uv = vec2(1.0 - (p.x / uPantsPatchSize.x + 0.5), -p.y / uPantsPatchSize.y + 0.5);

            if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && abs(p.z) < 15.0) {
                cor_decal    = texture(texCalca, uv);
                cor_decal.a *= FADE_BORDA(uv);

                vec2 uv_sombra = uv + vec2(-0.015, 0.015);
                if (uBaseColor.r > 0.8 && uv_sombra.x > 0.0 && uv_sombra.x < 1.0 && uv_sombra.y > 0.0 && uv_sombra.y < 1.0) {
                    alpha_sombra = texture(texCalca, uv_sombra).a * FADE_BORDA(uv_sombra);
                }
            }
        }

        // Drop shadow sutil no kimono branco para que o bordado não desapareça
        if (alpha_sombra > 0.05 && cor_decal.a < 0.8) {
            cor_difusa = mix(cor_difusa, vec3(0.0), alpha_sombra * 0.6);
        }

        // Alpha blending do decalque com o tecido
        if (cor_decal.a > 0.05) {
            cor_difusa = mix(cor_difusa, cor_decal.rgb, cor_decal.a);

            // Efeito de fios de bordado (seda brilhante)
            float fio_x       = sin((vModelPosition.x + vModelPosition.z) * 20.0);
            float fio_y       = sin(vModelPosition.y * 20.0);
            float padrao_fio  = (fio_x * fio_y) * 0.15 * cor_decal.a;
            N = normalize(N + vec3(padrao_fio, padrao_fio, 0.0));

            float brilho_tex = dot(cor_decal.rgb, vec3(0.299, 0.587, 0.114));
            cor_especular    = cor_decal.rgb;
            forca_especular  = mix(forca_especular, 0.8 * brilho_tex, cor_decal.a);
            brilho           = mix(brilho, 15.0, cor_decal.a);
        }
    }

    // DESGASTE DO TECIDO (Amarelamento e Desbotamento)
    // Aplicado apenas aos materiais de tecido: 1, 2, 4, 5
    if (uWearLevel > 0.0 && (uMaterialType == 1 || uMaterialType == 2 || uMaterialType == 4 || uMaterialType == 5)) {
        bool branco = (uBaseColor.r > 0.8 && uBaseColor.g > 0.8 && uBaseColor.b > 0.8);

        if (branco) {
            // Amarelamento: suor e tempo deixam o branco bege/amarelado
            vec3  cor_amarelada = vec3(0.88, 0.84, 0.72);
            float mancha        = sin(vModelPosition.x * 0.02) * cos(vModelPosition.y * 0.015) * sin(vModelPosition.z * 0.02);
            mancha = mancha * 0.5 + 0.5;
            float fator_amarel  = uWearLevel * (0.4 + 0.4 * mancha);
            cor_difusa = mix(cor_difusa, cor_amarelada * cor_difusa, fator_amarel);
        } else {
            // Desbotamento: a cor perde intensidade de forma orgânica
            float mancha       = sin(vModelPosition.x * 0.03) * cos(vModelPosition.y * 0.02) * sin(vModelPosition.z * 0.025);
            mancha = mancha * 0.5 + 0.5;
            vec3  cor_clara    = clamp(cor_difusa + vec3(0.25), 0.0, 1.0);
            float fator_desb   = uWearLevel * (0.4 + 0.5 * mancha);
            cor_difusa = mix(cor_difusa, cor_clara, fator_desb);
        }

        // Tecido velho perde o brilho especular
        forca_especular = mix(forca_especular, forca_especular * 0.2, uWearLevel);
        brilho          = mix(brilho, brilho * 0.4, uWearLevel);
    }

    // MODELO DE ILUMINAÇÃO BLINN-PHONG

    // Luz ambiente
    vec3 ambiente = vec3(0.32, 0.33, 0.38) * cor_difusa;

    // Reflexão difusa (Lambertiano)
    float fator_difuso = max(dot(N, L), 0.0);
    vec3  difuso       = fator_difuso * cor_difusa;

    // Reflexão especular (Blinn-Phong)
    float fator_spec = pow(max(dot(N, H), 0.0), brilho);
    vec3  especular  = fator_spec * forca_especular * cor_especular;

    // Rim light traseiro (efeito Fresnel "peach fuzz" do tecido)
    float potencia_rim  = (uMaterialType == 1) ? 2.5 : 4.0;
    float fresnel       = pow(1.0 - max(dot(N, V), 0.0), potencia_rim);
    float intensidade_rim = (uMaterialType == 1) ? 0.45 : 0.25;
    vec3  rim_light     = vec3(0.5, 0.55, 0.6) * fresnel * intensidade_rim * (0.3 + 0.7 * fator_difuso);

    // Composição final
    vec3 cor_final = ambiente + difuso + especular + rim_light;

    fragColor = vec4(cor_final, 1.0);
}
