#version 300 es
precision highp float;

// Inputs from vertex shader
in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vViewPosition;
in vec3 vModelPosition;

// Outputs
out vec4 fragColor;

// Uniforms
uniform sampler2D tex;          // Dynamic nameplate texture
uniform int uBeltStyle;         // Style of the belt (0=solid, 1=coral, 2=coral-white)
uniform vec3 uLightDir;         // View-space light direction
uniform int uMaterialType;      // Material flag
uniform vec3 uBaseColor;        // Base color for the active material
uniform int uCelShading;        // 0=normal Blinn-Phong, 1=Cel/Toon shading
uniform float uKimonoPart;      // 0=None, 1=Chest, 2=LeftArm, 3=RightArm, 4=LeftPants, 5=RightPants
uniform sampler2D texPeito;
uniform sampler2D texOmbro;
uniform sampler2D texCalca;
uniform vec2 uPantsPatchSize;
uniform int uBrandId;

void main() {
    // Vectors for lighting
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDir);
    vec3 V = normalize(-vViewPosition);
    vec3 H = normalize(L + V);

    // Default Material properties
    vec3 diffuseColor = uBaseColor;
    float specularStrength = 0.5;
    float shininess = 32.0;
    vec3 specularColor = vec3(1.0); // white highlight

    // -------------------------------------------------------------
    // MATERIAL DEFINITIONS
    // -------------------------------------------------------------

    // Material 0: Pedestal Base (Polished Black Marble/Plastic)
    if (uMaterialType == 0) {
        diffuseColor = vec3(0.05, 0.06, 0.08); // Shiny deep charcoal
        specularStrength = 1.3;
        shininess = 64.0;
        specularColor = vec3(0.9, 0.95, 1.0); // sharp blueish-white highlight
    }
    
    // Material 1: Kimono Fabric (Matte Pearl Weave)
    if (uMaterialType == 1) {
        diffuseColor = uBaseColor;
        
        float distFront = abs(vTexCoord.x - 0.25);
        
        // Soft Noise Texture (Pearl Weave)
        float noise = fract(sin(dot(vModelPosition.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        vec3 weaveBump = vec3(noise * 0.05);
        
        // --- V-NECK, RASHGUARD E LAPELA TOTALMENTE PROCEDURAIS ---
        float vCutoutEdge = (vTexCoord.y - 1.25) * 0.10; // Borda interna do V
        float lapelEdge = (vTexCoord.y - 1.25) * 0.10 + 0.028; // Borda externa da lapela (reduzido para ficar mais fina)
        
        if (vTexCoord.y > 1.25 && distFront < vCutoutEdge) {
            // Rashguard Interna (Lycra Preta) - Sem bump de kimono
            diffuseColor = vec3(0.08, 0.08, 0.09);
            N = normalize(vNormal); 
            specularStrength = 0.02;
            shininess = 2.0;
        } else if (lapelEdge > 0.0 && distFront < lapelEdge) {
            // Faixa da Lapela (Escurecida) - Mantém a textura do kimono
            diffuseColor = uBaseColor * 0.85; 
            N = normalize(N + weaveBump);
            specularStrength = 0.08;
            shininess = 6.0;
        } else {
            // Tecido Principal (Pearl Weave)
            diffuseColor = uBaseColor;
            N = normalize(N + weaveBump);
            specularStrength = 0.08;
            shininess = 6.0;
        }
    }
        
    // Material 4: Solid Matte Fabric (Lapels, Spheres, Collar)
    else if (uMaterialType == 4) {
        diffuseColor = uBaseColor;
        specularStrength = 0.05;
        shininess = 2.0;
    }
    
    // --- GLOBAL DECAL PROJECTION MAPPING (Bordado Direto na Malha) ---
    // Apply to any fabric (Material 1, 4, etc.)
    if (uMaterialType == 1 || uMaterialType == 4 || uMaterialType == 5) {
        vec4 decalColor = vec4(0.0);
        float shadowAlpha = 0.0;
        
        // Função para apagar bordas do decalque e evitar linhas de bounding box
        #define FADE_EDGE(uv) (smoothstep(0.0, 0.03, uv.x) * smoothstep(1.0, 0.97, uv.x) * smoothstep(0.0, 0.03, uv.y) * smoothstep(1.0, 0.97, uv.y))
        
        if (abs(uKimonoPart - 1.0) < 0.1) {
            vec3 projCenter;
            vec2 uv;
            vec3 p;
            if (uBrandId == 2) {
                // Kingz: Centro do Peito, mais largo
                projCenter = vec3(-40.0, 110.0, 43.0);
                p = vModelPosition - projCenter;
                uv = vec2(1.0 - (p.x / 45.0 + 0.5), -p.y / 18.0 + 0.5);
            } else {
                // Atama/Vouk: Barra da saia (Esquerda do usuário)
                projCenter = vec3(-30.0, 45.0, 35.0);
                p = vModelPosition - projCenter;
                uv = vec2(1.0 - (p.x / 36.0 + 0.5), -p.y / 18.0 + 0.5);
            }
            
            if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && abs(p.z) < 30.0) {
                decalColor = texture(texPeito, uv);
                decalColor.a *= FADE_EDGE(uv);
                
                vec2 shadowUv = uv + vec2(-0.015, 0.015);
                if (uBaseColor.r > 0.8 && shadowUv.x > 0.0 && shadowUv.x < 1.0 && shadowUv.y > 0.0 && shadowUv.y < 1.0) {
                    shadowAlpha = texture(texPeito, shadowUv).a * FADE_EDGE(shadowUv);
                }
            }
        } else if (abs(uKimonoPart - 2.0) < 0.1) {
            // Left Sleeve Patch Projection
            vec3 p = vModelPosition - vec3(-11.5, -24.0, 11.5);
            float cx = cos(0.069); float sx = sin(0.069); // Inverse rotX(-4 deg)
            vec3 p1 = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
            float cy = cos(0.785); float sy = sin(0.785); // Inverse rotY(45 deg)
            vec3 p2 = vec3(p1.x * cy + p1.z * sy, p1.y, -p1.x * sy + p1.z * cy);
            
            vec2 uv = vec2(1.0 - (p2.x / 18.0 + 0.5), -p2.y / 18.0 + 0.5);
            if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && abs(p2.z) < 10.0) {
                decalColor = texture(texOmbro, uv);
                decalColor.a *= FADE_EDGE(uv);
                
                vec2 shadowUv = uv + vec2(-0.015, 0.015);
                if (uBaseColor.r > 0.8 && shadowUv.x > 0.0 && shadowUv.x < 1.0 && shadowUv.y > 0.0 && shadowUv.y < 1.0) {
                    shadowAlpha = texture(texOmbro, shadowUv).a * FADE_EDGE(shadowUv);
                }
            }
        } else if (abs(uKimonoPart - 3.0) < 0.1) {
            // Right Sleeve Patch Projection
            vec3 p = vModelPosition - vec3(11.5, -24.0, 11.5);
            float cx = cos(-0.069); float sx = sin(-0.069); // Inverse rotX(4 deg)
            vec3 p1 = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
            float cy = cos(-0.785); float sy = sin(-0.785); // Inverse rotY(-45 deg)
            vec3 p2 = vec3(p1.x * cy + p1.z * sy, p1.y, -p1.x * sy + p1.z * cy);
            
            vec2 uv = vec2(1.0 - (p2.x / 18.0 + 0.5), -p2.y / 18.0 + 0.5);
            if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && abs(p2.z) < 10.0) {
                decalColor = texture(texOmbro, uv);
                decalColor.a *= FADE_EDGE(uv);
                
                vec2 shadowUv = uv + vec2(-0.015, 0.015);
                if (uBaseColor.r > 0.8 && shadowUv.x > 0.0 && shadowUv.x < 1.0 && shadowUv.y > 0.0 && shadowUv.y < 1.0) {
                    shadowAlpha = texture(texOmbro, shadowUv).a * FADE_EDGE(shadowUv);
                }
            }
        } else if (abs(uKimonoPart - 4.0) < 0.1 || abs(uKimonoPart - 5.0) < 0.1) {
            // Pants Patch Projection (4.0 = Left, 5.0 = Right)
            vec3 projCenter = vec3(9999.0); // Hidden by default
            
            if (uBrandId == 2 && abs(uKimonoPart - 4.0) < 0.1) {
                // Kingz: Projeção APENAS na perna esquerda
                projCenter = vec3(-5.0, -10.0, 20.0);
            } else if (uBrandId == 1 && abs(uKimonoPart - 5.0) < 0.1) {
                // Vouk: Projeção APENAS na perna direita
                projCenter = vec3(0.0, -10.0, 20.0);
            } else if (uBrandId == 0 && abs(uKimonoPart - 5.0) < 0.1) {
                // Atama: Projeção APENAS na perna direita
                projCenter = vec3(5.0, -30.0, 20.0);
            }
            vec3 p = vModelPosition - projCenter;
            vec2 uv = vec2(1.0 - (p.x / uPantsPatchSize.x + 0.5), -p.y / uPantsPatchSize.y + 0.5);
            if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && abs(p.z) < 15.0) {
                decalColor = texture(texCalca, uv);
                decalColor.a *= FADE_EDGE(uv);
                
                vec2 shadowUv = uv + vec2(-0.015, 0.015);
                if (uBaseColor.r > 0.8 && shadowUv.x > 0.0 && shadowUv.x < 1.0 && shadowUv.y > 0.0 && shadowUv.y < 1.0) {
                    shadowAlpha = texture(texCalca, shadowUv).a * FADE_EDGE(shadowUv);
                }
            }
        }
        
        // Se estivermos em um kimono branco, adiciona um leve drop shadow para o amarelo não sumir
        if (shadowAlpha > 0.05 && decalColor.a < 0.8) {
            diffuseColor = mix(diffuseColor, vec3(0.0), shadowAlpha * 0.6);
        }
        
        // Se a textura acertou um pixel opaco, aplique a cor e o efeito de bordado usando Alpha Blending!
        if (decalColor.a > 0.05) {
            // Mistura suave do bordado com a cor do kimono (resolve bordas escuras e melhora leitura)
            diffuseColor = mix(diffuseColor, decalColor.rgb, decalColor.a);
            
            // Efeito de linha de bordado (fios de seda brilhantes)
            float threadX = sin((vModelPosition.x + vModelPosition.z) * 20.0);
            float threadY = sin(vModelPosition.y * 20.0);
            float threadPattern = (threadX * threadY) * 0.15 * decalColor.a;
            N = normalize(N + vec3(threadPattern, threadPattern, 0.0));
            
            float brightness = dot(decalColor.rgb, vec3(0.299, 0.587, 0.114));
            specularColor = decalColor.rgb;
            
            // O brilho do bordado depende do alpha
            specularStrength = mix(specularStrength, 0.8 * brightness, decalColor.a); 
            shininess = mix(shininess, 15.0, decalColor.a); 
        }
    }
    
    // Material 5: Textured Matte (Rashguard inner shirt)
    else if (uMaterialType == 5) {
        vec4 texColor = texture(tex, vTexCoord);
        diffuseColor = texColor.rgb;
        specularStrength = 0.02; // Very matte
        shininess = 2.0;
    }
    
    // Material 2: Belt Fabric (Matte Ribbon)
    else if (uMaterialType == 2) {
        vec3 beltColor = uBaseColor;
        
        // Procedural stripes for Coral and Coral-White belts using UV wrapping
        if (uBeltStyle == 1 || uBeltStyle == 2) {
            // vTexCoord.x goes 0.0 to 1.0 around the belt circumference.
            // 14 segments total.
            float segment = floor(vTexCoord.x * 14.0);
            if (mod(segment, 2.0) == 0.0) {
                beltColor = vec3(0.78, 0.08, 0.08); // Red
            } else {
                // For coral-white, use an off-white/slightly yellowish tint
                beltColor = (uBeltStyle == 1) ? vec3(0.12, 0.12, 0.12) : vec3(0.95, 0.92, 0.78);
            }
        }
        
        diffuseColor = beltColor;
        
        // Fine linear texture for the belt weave
        // float beltWeave = sin(vModelPosition.x * 4.0 + vModelPosition.y * 4.0 + vModelPosition.z * 4.0) * 0.08;
        // N = normalize(N + vec3(beltWeave));
        
        specularStrength = 0.02; // Very matte
        shininess = 2.0;
    }
    
    // Material 3: Dynamic Nameplate (Gold Plaque with Engraved Text)
    else if (uMaterialType == 3) {
        vec4 texColor = texture(tex, vTexCoord);
        diffuseColor = texColor.rgb;
        
        // The text on the plaque is black/dark, the metal is bright gold.
        // We calculate brightness of the texture to selectively dim specular highlights on the text
        float brightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        float specMask = smoothstep(0.25, 0.55, brightness);
        
        specularColor = vec3(1.0, 0.85, 0.5); // Warm gold highlight
        specularStrength = 2.2 * specMask;    // Metallic shining on gold plate, matte on text
        shininess = 80.0;
    }
    
    // Material 7: Large Grid/Quadriculado Tatami Floor
    else if (uMaterialType == 7) {
        vec2 uv = vTexCoord * 16.0;
        vec2 grid = fract(uv);
        
        // Usar derivadas (fwidth) para manter as linhas pretas sempre com 2 pixels de espessura
        // na tela, independentemente do zoom. Isso elimina o serrilhado e o "flicker" de Moiré.
        vec2 lineThickness = min(fwidth(uv) * 2.0, 0.5); 
        
        vec2 edge = smoothstep(1.0 - lineThickness, 1.0 - lineThickness * 0.5, grid);
        float isLine = max(edge.x, edge.y);
        
        vec3 color1 = uBaseColor; // Base color from JS
        vec3 color2 = vec3(0.05, 0.05, 0.05); // Black lines
        
        diffuseColor = mix(color1, color2, isLine);
        
        specularStrength = 0.0; 
        shininess = 1.0;
    }

    
    // Material 6: Unlit/Basic Texture (Picture Frame and Wall Text)
    else if (uMaterialType == 6) {
        // vTexCoord is flipped vertically in p5 for planes
        vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
        vec4 texColor = texture(tex, st);
        
        if (texColor.a < 0.1) {
            discard; // Support transparent textures like the text graphic
        }
        
        diffuseColor = texColor.rgb;
        specularStrength = 0.1; // Slight reflection
        shininess = 10.0;
    }

    // -------------------------------------------------------------
    // BLINN-PHONG LIGHTING MODEL
    // -------------------------------------------------------------
    
    // Ambient Light (increased for brighter tatami/scene)
    vec3 ambient = vec3(0.32, 0.33, 0.38) * diffuseColor;
    
    // Diffuse Reflection (Lambertian)
    float diff = max(dot(N, L), 0.0);
    vec3 diffuse = diff * diffuseColor;
    
    // Specular Reflection (Blinn-Phong)
    float spec = pow(max(dot(N, H), 0.0), shininess);
    vec3 specular = spec * specularStrength * specularColor;
    
    // Backside rim light for premium presentation (Fresnel effect - 'peach fuzz')
    float rimPower = (uMaterialType == 1) ? 2.5 : 4.0; // fabric scatters more light at edges
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), rimPower);
    float rimIntensity = (uMaterialType == 1) ? 0.45 : 0.25;
    vec3 rimLight = vec3(0.5, 0.55, 0.6) * fresnel * rimIntensity * (0.3 + 0.7 * diff);
    
    // Final color composition
    vec3 finalColor;
    if (uCelShading == 1 && uMaterialType == 1) {
        // CEL / TOON SHADING
        // Quantize diffuse into 4 discrete steps
        float celDiff = floor(diff * 4.0) / 4.0;
        vec3 celDiffuse = celDiff * diffuseColor;
        
        // Hard outline: if normal is nearly perpendicular to view, draw black edge
        float outline = step(0.35, max(dot(N, V), 0.0));
        
        // Cartoon specular: binary on/off
        float celSpec = (spec > 0.7) ? 1.0 : 0.0;
        vec3 celSpecular = celSpec * specularStrength * 0.5 * specularColor;
        
        // Warm ambient for cel look
        vec3 celAmbient = vec3(0.28, 0.28, 0.35) * diffuseColor;
        
        finalColor = (celAmbient + celDiffuse + celSpecular) * outline;
    } else {
        // BLINN-PHONG (standard)
        finalColor = ambient + diffuse + specular + rimLight;
    }
    
    
    fragColor = vec4(finalColor, 1.0);
}
