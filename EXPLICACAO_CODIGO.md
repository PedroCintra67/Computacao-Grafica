# Explicação Completa do Código — Kimono BJJ 3D

> Guia para entender cada parte do projeto e explicar em apresentações.

---

## Visão Geral do Projeto

O projeto é uma **aplicação WebGL interativa** que renderiza um kimono de BJJ em 3D com iluminação, materiais e texturas customizáveis. É construído sobre **p5.js** (biblioteca JavaScript para gráficos) rodando no modo WebGL, com **shaders GLSL customizados** para os efeitos visuais.

### Arquivos do Projeto

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura da página (layout, painéis de controle, botões) |
| `style.css` | Estilo visual da interface (glassmorphism, cores, animações CSS) |
| `script.js` | Lógica principal: câmera, ambiente, faixa, plaqueta, UI |
| `kimono.js` | Geometria 3D procedural do kimono (torso, mangas, lapela) |
| `vert.glsl` | Vertex Shader — posiciona os vértices na tela |
| `frag.glsl` | Fragment Shader — calcula a cor de cada pixel |
| `helio.jpg` | Foto do Hélio Gracie (quadro na parede) |
| `carlos.jpg` | Foto do Carlos Gracie (quadro na parede) |

---

## 1. `vert.glsl` — Vertex Shader (mais simples)

**O que faz:** Recebe cada vértice da geometria e o transforma para a posição correta na tela.

```
aPosition  →  (multiplicado pelas matrizes)  →  gl_Position (pixel na tela)
```

### Variáveis importantes:
- **`aPosition`**: Coordenada 3D do vértice (enviada pelo p5.js)
- **`aNormal`**: Vetor perpendicular à superfície naquele ponto (para iluminação)
- **`aTexCoord`**: Coordenada UV para mapeamento de textura (u,v de 0 a 1)
- **`uModelViewMatrix`**: Matriz que combina a posição do objeto + posição da câmera
- **`uProjectionMatrix`**: Matriz de projeção perspectiva (objetos distantes ficam menores)
- **`uNormalMatrix`**: Matriz especial para transformar as normais corretamente

### O que o shader "passa adiante" para o Fragment Shader:
- **`vTexCoord`**: A coordenada UV do vértice
- **`vNormal`**: Normal transformada para o espaço da câmera (view space)
- **`vViewPosition`**: Posição do vértice no espaço da câmera
- **`vModelPosition`**: Posição original 3D do vértice (usada para texturas procedurais)

> **Conceito-chave para apresentar:** O vertex shader roda uma vez para cada vértice, e os valores que ele passa para frente são interpolados automaticamente entre os vértices pelo hardware antes de chegarem ao fragment shader.

---

## 2. `frag.glsl` — Fragment Shader (o mais importante)

**O que faz:** Calcula a cor final de **cada pixel** da tela. Roda milhares de vezes por frame (um para cada pixel visível).

### Uniforms recebidos do JavaScript:

| Uniform | Tipo | Função |
|---|---|---|
| `uMaterialType` | int | Define qual material está sendo desenhado (0-6) |
| `uBaseColor` | vec3 | Cor base do material (RGB de 0.0 a 1.0) |
| `uLightDir` | vec3 | Direção da luz (vetor normalizado) |
| `uBeltStyle` | int | Estilo da faixa (0=sólida, 1=coral, 2=coral-branca) |
| `uCelShading` | int | 0=Blinn-Phong normal, 1=Cel Shading |
| `tex` | sampler2D | Textura 2D (foto ou canvas dinâmico) |

### Materiais definidos (`uMaterialType`):

| Tipo | Material | Como funciona |
|---|---|---|
| 0 | **Pedestal preto polido** | Alta especularidade (brilho), shininess=64 |
| 1 | **Tecido kimono (pearl weave)** | Matte, com ruído para simular textura, corte V-neck |
| 2 | **Faixa** | Matte, com listras procedurais para coral |
| 3 | **Plaqueta dourada** | Textura 2D dinâmica (canvas p5.js) |
| 4 | **Material sólido matte** | Sem especularidade, para lapelas, paredes, etc. |
| 5 | **Tatame** | Grid de linhas pretas sobre branco (coordenadas UV) |
| 6 | **Textura unlit + transparência** | Para fotos e texto na parede (descarta pixels transparentes) |

### Modelo de Iluminação — Blinn-Phong:

```
Cor final = Ambiente + Difusa + Especular + Luz de borda (rim light)
```

- **Ambiente (`ambient`)**: Luz base que não depende de ângulo. Simula luz indireta do ambiente.
- **Difusa (`diffuse`)**: `dot(N, L)` — Quanto a superfície "olha" para a luz. Máximo quando perpendicular.
- **Especular (`specular`)**: `pow(dot(N, H), shininess)` — Reflexo brilhante. Usando o vetor **H** (bissetor entre luz e câmera) para Blinn-Phong.
- **Rim Light (luz de borda)**: Efeito Fresnel — superfícies vistas de lado recebem mais luz, criando o halo característico de estúdio fotográfico.

### Cel Shading (quando ativado):

```glsl
float celDiff = floor(diff * 4.0) / 4.0;  // Quantiza em 4 degraus
float outline = step(0.35, dot(N, V));     // Bordas ficam pretas
float celSpec = (spec > 0.7) ? 1.0 : 0.0; // Especular binária
```

Em vez de luz contínua, a iluminação é quantizada em **4 bandas discretas**, criando o efeito de ilustração 2D/anime.

---

## 3. `kimono.js` — Geometria Procedural

**O que faz:** Gera toda a geometria 3D do kimono matematicamente, sem usar modelos externos (.obj/.fbx). Usa a classe `p5.Geometry` para criar malhas personalizadas com vértices, normais e coordenadas UV.

### Por que procedural?
Em vez de baixar um modelo 3D pronto, toda a geometria é **calculada matematicamente em código**. Isso demonstra os conceitos da aula de malhas e superfícies paramétricas.

---

### `initKimonoGeometry()` — Inicializa tudo uma única vez

Chama todas as funções de criação de geometria e guarda os resultados em variáveis globais (`kimonoTorsoGeom`, `kimonoLeftSleeveGeom`, etc.). Isso é importante: a geometria é criada **uma única vez** no início, depois reutilizada em todos os frames.

---

### Torso — `kimonoTorsoGeom` (o mais complexo)

A malha do torso é um **cilindro elíptico paramétrico** com forma variável ao longo do eixo Y:

```
Para cada ponto (u, v) no grid:
  u ∈ [0,1] → angle = u * 2π  (volta completa ao redor)
  v ∈ [0,1] → y = 0 a 145     (da saia até o pescoço)

  Se y < 68 (abaixo da faixa, saia):
    rX varia de 66 → 52.5  (afunila para cima)
    rZ varia de 45 → 30
  
  Se y > 68 (torso):
    rX varia de 52.5 → 68  (ombros mais largos)
    chestBulge = sin(t * π) → volume no peito
```

Adiciona também **vincos de tecido (wrinkles)**:
```javascript
let wrinkle = sin(u * TWO_PI * 6.0 + v * 3.0) * sin(v * PI * 3.0) * 1.5;
```

As UVs são mapeadas para que `u` vá ao redor (0→1) e `v` vá de 0 a 2 (repetindo) para que o shader possa criar o corte V-neck:
```glsl
// No frag.glsl Material 1:
if (vTexCoord.y > 1.25) {
    float vWidth = (vTexCoord.y - 1.25) * 0.10;
    if (abs(vTexCoord.x - 0.25) < vWidth) discard; // descarta pixels do decote
}
```

---

### Mangas — `createSleeveGeometry(side)`

Cilindros cônico simples: raio inicial de 16 (ombro) afunilando para 10 (punho) ao longo de 95 unidades. Também tem vincos procedurais. Posicionados e rotacionados em `drawKimonoTorso()`:

```javascript
translate(-60, 134, 0);  // Ponto de fixação no ombro esquerdo
rotateZ(radians(-20));   // Inclinação do braço
model(kimonoLeftSleeveGeom);
```

---

### Lapelas — `createLapelGeometry(isLeft)`

A lapela é uma **faixa plana paramétrica** que desce do pescoço cruzando o peito. Cada lapela tem 2 colunas de vértices (uma tira de largura constante) que seguem a curvatura do torso.

- **Lapela esquerda** (do ponto de vista do lutador): Passa **por cima** da direita
- **Espessura maior** (5.5) na esquerda vs (3.0) na direita → evita que a direita apareça

O ângulo central da lapela vai de 35° no pescoço até -10° na cintura (cruzando o centro):
```javascript
let xCenter = isLeft ? lerp(35, -10, v) : lerp(-35, 10, v);
let angleCenter = acos(constrain(xCenter / rX, -1, 1));
```

---

### Faixa — `initBeltGeometry()` + `drawBeltAndKnot()`

A faixa é uma geometria separada: um **tubo elíptico** (como o torso mas com espessura fina) posicionado exatamente na altura Y=61.5 a Y=74.5.

O nó e as pontas são construídas com `box()` simples em `drawBeltAndKnot()`:
- **Nó central**: caixa em frente ao torso
- **Ponta direita**: box rotacionado +38° (inclina para baixo-direita)
- **Ponta esquerda**: box rotacionado -38° + a **tarja de graus**

A **tarja** usa lógica de negócio real do BJJ:
- `sleeveH = 50` → tamanho da tarja
- Cor varia por faixa (`sleeveMainColor`)
- Extremidades especiais em faixas avançadas (`endColor`)
- Graus (`currentDegrees`) são desenhados como listras brancas em slots fixos

---

## 4. `script.js` — Lógica Principal

### `preload()` — Carrega recursos antes de começar

```javascript
myShader = loadShader('vert.glsl', 'frag.glsl'); // Compila os shaders
helioImg = loadImage('helio.jpg');  // Carrega fotos
carlosImg = loadImage('carlos.jpg');
```

### `setup()` — Executa uma única vez na inicialização

1. Cria o canvas WebGL dentro do `<div id="canvas-container">`
2. Cria os **canvas offscreen 2D** (p5.Graphics) para texturas dinâmicas
3. Inicializa vetores de câmera
4. Registra os event listeners da UI (`setupControlEvents()`)

### `draw()` — Executa ~60 vezes por segundo (loop principal)

```javascript
function draw() {
    background(230, 235, 240);   // Limpa o frame
    updateCameraPosition();       // Suaviza a câmera (lerp)
    camera(camPos, camLook, ...); // Aplica posição da câmera
    shader(myShader);             // Ativa o shader customizado
    myShader.setUniform(...);     // Envia dados para o shader
    drawEnvironment();            // Chão, parede, quadros, pedestal
    drawKimonoTorso();            // Geometria do kimono
    drawBeltAndKnot();            // Faixa + tarja + graus
}
```

### `drawEnvironment()` — O ambiente do dojô

- **Tatame**: caixa 2000×10×2000, material 5 (grid UV)
- **Parede marrom**: caixa 2000×1000×20 atrás de tudo
- **Quadros**: `drawPictureFrame(img, x, z)` — uma moldura escura (box) + foto (plane com material 6)
- **Texto na parede**: textura transparente com "BRAZILIAN / JIU-JITSU", com `scale(-1,1,1)` para desfazer o espelhamento

### `drawPedestalBase()` — O pedestal preto

3 caixas empilhadas (base, corpo, topo) com material 0 (mármore polido).

### `updateGraduation(years)` — O coração do simulador

Função que recebe `years` (0 a 56) e determina qual faixa e quantos graus correspondem. Usa o protocolo real de graduação do BJJ:

```
0 - 2.5 anos  → Faixa Branca (0-4 graus)
2.5 - 5.0     → Faixa Azul
5.0 - 6.5     → Faixa Roxa
6.5 - 8.0     → Faixa Marrom
8.0 - 39.0    → Faixa Preta (graus especiais)
39.0 - 46.0   → Coral Vermelha/Preta (7º grau)
46.0 - 56.0   → Coral Vermelha/Branca (8º grau)
56.0+         → Vermelha (9º grau)
```

Depois de calcular, atualiza: `currentBelt`, `currentDegrees`, os labels HTML e chama `updateNameplateText()`.

### `updateCameraPosition()` — Câmera com Lerp

A câmera orbita ao redor do modelo em coordenadas esféricas:

```javascript
targetCamPos.x = radius * cos(rotX) * sin(rotY); // Componente X
targetCamPos.y = radius * sin(rotX) + 40;        // Altura
targetCamPos.z = radius * cos(rotX) * cos(rotY); // Profundidade

camPos.lerp(targetCamPos, 0.08); // Suaviza a 8% por frame
```

`orbitRotY` muda ao arrastar o mouse horizontalmente, `orbitRotX` ao arrastar verticalmente. Quando o mouse é solto, a câmera retorna suavemente ao centro.

### Mouse e Scroll

```javascript
mousePressed()  → ativa isDragging
mouseReleased() → desativa isDragging
mouseDragged()  → atualiza orbitRotX e orbitRotY
mouseWheel()    → atualiza orbitRadiusTarget (zoom)
```

### `updateNameplateText()` — Textura Dinâmica

Redesenha o canvas 2D (`nameplateGraphics` de 512×128px) com:
- Fundo dourado
- Bordas decorativas
- Nome e subtítulo em texto

Este canvas 2D é então usado como textura no material 3 (plaqueta).

```javascript
// Truque importante: precisa rotacionar o canvas 2D antes de desenhar
// porque o p5.js WebGL espelha a textura verticalmente
nameplateGraphics.translate(512, 128);
nameplateGraphics.scale(-1, -1);
```

---

## 5. `index.html` + `style.css` — Interface

A interface usa **glassmorphism** (painéis translúcidos com backdrop-filter) e uma paleta de cores escura/dourada.

### Estrutura dos Painéis:
- **Header**: Logo + contador de FPS
- **Canvas central**: Onde o p5.js renderiza o WebGL
- **Painel esquerdo**: Câmeras rápidas (botões que chamam funções JS)
- **Painel direito**: Todos os controles de customização

### Controles disponíveis:
1. Nome e subtítulo da plaqueta (input text → chama `updateNameplateText()`)
2. Cor do kimono (botões → muda `currentGiColor`)
3. Seleção de faixa (botões → muda slider para o ano inicial da faixa)
4. Slider de anos → chama `updateGraduation(years)` em tempo real
5. Modo de renderização (Blinn-Phong / Cel Shading)
6. Consultor de faixa/grau (dropdown → `updateQueryPanel()`)

---

## 6. Pipeline Completo (resumo para apresentação)

```
index.html/style.css
    └── UI: botões, inputs, sliders
           │
           ▼ eventos JS
script.js (draw loop ~60fps)
    │
    ├── updateCameraPosition() → câmera com lerp
    ├── shader(myShader)       → ativa shaders GLSL
    ├── setUniform(...)        → envia dados: cor, luz, modo
    │
    ├── drawEnvironment()
    │     ├── Tatame (box 2000×2000, material 5)
    │     ├── Parede marrom (box)
    │     ├── Quadros Carlos/Hélio (plane + textura)
    │     ├── Texto na parede (plane + canvas transparente)
    │     └── Pedestal preto (3 boxes, material 0)
    │
    ├── drawKimonoTorso()    ←── kimono.js
    │     ├── Torso elíptico (p5.Geometry paramétrico)
    │     ├── Rashguard interno (mesmo geom, escala 0.97)
    │     ├── Manga esquerda (p5.Geometry cônica)
    │     ├── Manga direita
    │     ├── Esferas nos ombros
    │     └── Lapelas (p5.Geometry planares)
    │
    └── drawBeltAndKnot()
          ├── Faixa tubo (p5.Geometry elíptico)
          ├── Nó central (box)
          ├── Ponta direita (box rotacionado)
          └── Ponta esquerda + tarja + graus (boxes + lógica BJJ)
                                │
                                ▼
                       vert.glsl (por vértice)
                       frag.glsl (por pixel)
                           └── Material 0-6
                           └── Blinn-Phong OU Cel Shading
                           └── Rim Light (Fresnel)
                           └── Texturas procedurais
```
