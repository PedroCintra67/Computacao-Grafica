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
    else if (uMaterialType == 1) {
        diffuseColor = uBaseColor;
        
        // V-Neck Cutout for Kimono Torso
        // vTexCoord.y goes 0.0 to 2.0. Neck is 2.0. Cross is ~1.0. Front center is x=0.25.
        if (vTexCoord.y > 1.25) {
            float vWidth = (vTexCoord.y - 1.25) * 0.10; 
            if (abs(vTexCoord.x - 0.25) < vWidth) {
                discard; // Creates the physical opening on the chest!
            }
        }
        
        // Soft Noise Texture to prevent Moire aliasing (ondulações)
        float noise = fract(sin(dot(vModelPosition.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        vec3 weaveBump = vec3(noise * 0.05); // Very subtle noise
        
        N = normalize(N + weaveBump);
        
        // Fabric is very matte but has slight thread scattering
        specularStrength = 0.08;
        shininess = 6.0;
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
        float beltWeave = sin(vModelPosition.x * 4.0 + vModelPosition.y * 4.0 + vModelPosition.z * 4.0) * 0.08;
        N = normalize(N + vec3(beltWeave));
        
        specularStrength = 0.02; // Very matte
        shininess = 2.0;
    }
    
    // Material 4: Solid Matte Fabric (Lapels, Spheres, Collar)
    else if (uMaterialType == 4) {
        diffuseColor = uBaseColor;
        specularStrength = 0.05;
        shininess = 2.0;
    }
    
    // Material 5: Textured Matte (Rashguard inner shirt)
    else if (uMaterialType == 5) {
        vec4 texColor = texture(tex, vTexCoord);
        diffuseColor = texColor.rgb;
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
    
    // Material 4: Metallic Gold details
    else if (uMaterialType == 4) {
        diffuseColor = vec3(0.85, 0.68, 0.22); // Solid gold base
        specularColor = vec3(1.0, 0.9, 0.6);
        specularStrength = 2.5;
        shininess = 90.0;
    }
    
    // Material 5: White BJJ Tatami Floor with black safety border
    else if (uMaterialType == 5) {
        float absX = abs(vModelPosition.x);
        float absZ = abs(vModelPosition.z);
        
        diffuseColor = uBaseColor;
        
        // Tatami checkerboard/grid pattern (Black lines)
        float scale = 40.0; // 40 squares across the texture map (matches ~50 units per square)
        float gridX = step(0.96, fract(vTexCoord.x * scale));
        float gridY = step(0.96, fract(vTexCoord.y * scale));
        float isLine = max(gridX, gridY);
        
        // Mix between white base and black lines
        diffuseColor = mix(uBaseColor, vec3(0.05, 0.05, 0.05), isLine);
        
        specularStrength = 0.25; // Rubbery vinyl specularity
        shininess = 20.0;
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
    
    if (uCelShading == 1 && uMaterialType != 6) {
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
