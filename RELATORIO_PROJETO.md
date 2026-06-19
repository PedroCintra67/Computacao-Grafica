# Relatório do Projeto: BJJ Customizer (Customização 3D de Kimonos)

Este documento serve como material completo de estudo, documentação e base para a apresentação do trabalho da disciplina de Computação Gráfica.

---

## 1. Visão Geral do Projeto

### Objetivo do Projeto
O projeto **BJJ Customizer** é uma aplicação web interativa em 3D que permite aos usuários visualizar, customizar e montar kimonos (Gis) de Jiu-Jitsu. O usuário começa em uma vista exterior da loja (Vitrine) e, ao entrar, pode orbitar o modelo 3D, alterar cores, tamanhos, marcas, adicionar bordados nas costas e até aplicar um nível de desgaste (sujeira e envelhecimento) no tecido.

### Como funciona em alto nível
O sistema é construído inteiramente sobre tecnologias da Web:
- **HTML/CSS:** Define a interface do usuário (UI), menus laterais, botões e o layout geral (sobrepondo-se ao Canvas).
- **JavaScript (p5.js):** Gerencia a lógica do programa, estado da loja e a renderização 3D (WebGL).
- **GLSL (Shaders):** Programas rodando diretamente na GPU para calcular iluminação avançada (Blinn-Phong), projeção de decalques, efeitos de tecido e desgaste procedural.

### Como os arquivos se relacionam e Fluxo Geral
- **`index.html` / `style.css`**: Interface de usuário e estilo.
- **`main.js`**: Arquivo principal. Possui o fluxo de vida do p5.js (`preload`, `setup`, `draw`). Ele controla os estados da aplicação e inicializa variáveis essenciais.
- **`texturas.js`**: Carrega e processa as imagens e texturas utilizadas (normal maps e imagens estáticas de fundo).
- **`kimono.js`**: Responsável pela modelagem 3D. Gera as malhas (geometria procedural) e desenha cada parte (tronco, braços, calça, lapela, faixa).
- **`ambiente.js`**: Desenha a arquitetura 3D do cenário (paredes, vitrine, luzes de neon, chão, pedestal e vasos estáticos).
- **`camera_eventos.js`**: Lógica de visualização. Ouve interações do mouse (click, drag, wheel) para rodar e atualizar as posições polares da câmera.
- **`ui.js`**: Controlador de interface. Intercepta os cliques nos botões HTML e atualiza o estado interno (cores, carrinho, menus) no JavaScript.
- **`shader.vert` / `shader.frag`**: Nosso Pipeline Gráfico Programável customizado.

---

## 2. Conceitos de Computação Gráfica Utilizados

Abaixo listamos de forma técnica como os conceitos clássicos da matéria se aplicam no código.

### Transformações Geométricas (Translação, Rotação e Escala)
**Onde aparece:** Em quase todo o código (`ambiente.js`, `kimono.js`, `main.js`). Funções de destaque: `translate()`, `rotateX()`, `rotateY()`, `scale()`, encapsuladas em blocos `push()` e `pop()`.
**O que significa:** O uso de matrizes de transformação geométrica afim para deslocar, girar ou redimensionar vértices do sistema de coordenadas local para o sistema global (World Space).
**Como foi implementado:** No p5.js, funções como `translate` multiplicam internamente a Matriz de Transformação (`Model Matrix`) atual. O uso de `push()` salva a matriz atual em uma estrutura de Pilha, e o `pop()` desempilha. Isso nos permite "entrar no mundo" de uma manga do braço esquerdo para desenhar, girar, etc., sem que essa rotação aplique erros ao braço direito (que usa uma matriz paralela nova).
**Na apresentação:** "Usamos translação, rotação e escala exaustivamente para montar a arquitetura da cena e a estrutura do Kimono. Para evitar que a transformação de um objeto afete acidentalmente os demais objetos subsequentes, isolamos rigorosamente todas as operações usando o conceito de Pilha de Matrizes via as funções push e pop da API."

### Sistemas de Coordenadas, Câmera e Viewport
**Onde aparece:** `main.js` (criação do canvas com `WEBGL`), `camera_eventos.js` (função `camera()` e update de posição matemática).
**O que significa:** A construção de um observador (olho da câmera virtual), o que ele está focado (alvo), onde a tela de corte fica posicionada e a qual volume (Frustum) pertence a projeção.
**Como foi implementado:** A câmera foi feita não com métodos mágicos prontos como "orbitControl()", mas usando matemática pesada. Captamos movimentos de delta 2D (`dx` e `dy`) e usamos fórmulas de círculo unitário (Seno para eixo Z, Cosseno para eixo X) para orbitar coordenadas esféricas polares, sendo as mesmas transformadas na Matriz LookAt da câmera via função `camera()`. Para o Modo Vitrine, implementamos equações lineares vetoriais (`lerp()`) para dar fluidez física à troca de câmera.
**Na apresentação:** "Ao invés de depender totalmente do motor de renderização, usamos as equações polares via Seno e Cosseno nos eixos para programar o comportamento e as trajetórias orbitais da nossa câmera 3D com base nos deltas do mouse do usuário."

### Modelagem e Malhas Geométricas (Geometria Procedural)
**Onde aparece:** Arquivo `kimono.js` na superfunção `IniciarGeometriaKimono()` gerando buffers (`p5.Geometry`).
**O que significa:** A matemática necessária para preencher *Buffers* de vértices, conectar esses pontos via faces triangulares (`indices`) para gerar sólidos opacos que reajam à luz, usando também normais corretas e mapeamento UV.
**Como foi implementado:** 
Nós não importamos objetos modelados no Blender (`.obj`). **100% da modelagem do tronco é gerada via código** (Procedural). Usamos loops `for` de linhas e colunas gerando um cilindro distorcido cujos raios X e Z são extrapolados por vetores normais (`nx`, `nz`). Para dar "vida" (dobras do tecido), multiplicamos a posição do vértice por uma onda combinada de `sin(u)` e `sin(v)`. Em seguida, enviamos triângulos no *sentido anti-horário* (`this.faces.push([i0, i2, i1])`). E finalmente, o software roda uma mescla (`lerp`) de normais na área em que o tubo se fecha (`u=0` e `u=1`) para evitar linhas duras visíveis devido a artefatos de iluminação gerados pelas quebras das normais.
**Na apresentação:** "Um dos maiores orgulhos técnicos do projeto é a construção Procedural. A blusa do Kimono não é um arquivo externo de modelagem baixado: geramos sua topologia vértice a vértice pelo próprio código iterando ângulos. Construímos seções cilíndricas dinâmicas para gerar as ondulações nas costas e nobras do pano via ondas de Seno paramétricas sobre o domínio vetorial dos UVs, seguido por algoritmos manuais de cálculo de normais nas áreas de transição."

### Pipeline Gráfico Programável e Shaders Customizados
**Onde aparece:** Arquivos externos `.glsl` (`shader.vert` e `shader.frag`) alimentados no começo da render em `main.js` via a chamada `shader(meu_shader)`.
**O que significa:** Substituição do "Pipeline Fixo" simples, injetando pequenos programas independentes, gravados em código C-like, que compilam para rodar simultaneamente nos milhares de núcleos da placa de vídeo (GPU).
**Como foi implementado:** 
1. `shader.vert` (Vertex Shader): Responsável pelas projeções matemáticas das primitivas. Multiplica vértices locais e normais (`vNormal`) pela Matriz View-Model-Projection, ativando transformações corretas. Passa variáveis espaciais interpoladas ao longo dos triângulos para o Fragment.
2. `shader.frag` (Fragment Shader): Aqui rodam os algoritmos de colorização baseados nos Materiais (`uMaterialType`). Usamos controle de fluxo unificado com uniformes (`uniforms`) lidos da memória do JS.
**Na apresentação:** "Para alcançar fidelidade visual e otimização real-time para a aplicação web, usamos Shaders GLSL 3.0 para implementar shaders totalmente customizados rodando na GPU em paralelo."

### Algoritmos de Iluminação (Modelo Empírico de Blinn-Phong)
**Onde aparece:** No corpo da função `main` do `shader.frag`.
**O que significa:** Como a cor dos materiais reflete luz.
**Como foi implementado:** 
Nós fomos fundo na matemática de cores, codificando os três vetores base `N` (Normal), `L` (Direção da Luz inversa) e `V` (Visão). Calculamos o subcomponente ambiente constante, seguido da reflexão *Difusa* pela Equação de Lambert `max(dot(N,L), 0.0)`. A reflexão *Especular* usada não é a de Phong clássica (Luz refletida R versus Visão), e sim a otimização de Blinn-Phong baseada no *Halfway vector* (Vetor H, bissetriz entre V e L) `pow(max(dot(N,H), 0.0), brilho)`, computacionalmente muito mais estável para ângulos rasantes.
Além disso, foi gerado o efeito de **Rim Lighting** usando as lógicas fundamentais do efeito Fresnel, onde calculamos o inverso do produto escalar de Visão vs Normal `pow(1.0 - dot(N,V), fresnelPower)` para gerar luminosidade difusa nos contornos (silhueta) simulando os felpinhos (fibras do tecido expostas) do material algodão, ou "Peach Fuzz".
**Na apresentação:** "Deixamos de usar os spots pré-programados do frame, preferindo codificar linha a linha o algoritmo de Blinn-Phong diretamente em GLSL. Esse esforço permitiu a adição de Rim Light (Fresnel), responsável por deixar as bordas do modelo estouradas com luz difusa para dar aquela textura típica de algodão fosco do Kimono."

### Texturização e UVs (Projeção Planar e Ruído Procedural)
**Onde aparece:** `shader.frag` e buffers offscreen do p5 em `main.js` para texto de Letreiros.
**O que significa:** Como colar imagens ou informações em 2D na topologia 3D das malhas.
**Como foi implementado:** 
Decidimos que os patches das marcas seriam plotados no kimono **sem** usar desempacotamento explícito (UV Unwrapping). Em vez disso, foi usado um algoritmo de **Projeção Planar Local**, on-the-fly, calculando a distância `vModelPosition - centro_proj` (ponto central flutuante do patch). Se o fragmento em processamento da perna ou ombro estivesse dentro desse volume da "caixa invisível de estêncil", a cor de textura daquele fragmento era plotada respeitando misturas alpha (`mix()` com *Alpha Blending*) baseadas no buffer alfa `.a` da textura Png. Além disso, a textura do Pearl Weave não vem de um mapa de imagem externo de 4k pesado, e sim de matemática de fracionamento Pseudo-Aleatório de `sin() * 43758.5453` baseada nas posições tridimensionais, emulando um *Bump Map* que suja sutilmente as normais em 0.05 units de amplitude, dando as ranhuras do tecido Pearl Weave. 
**Na apresentação:** "Os logos da Atama, Kingz etc não dependem dos UVs da topologia torcida do cilindro 3D! Usamos Projeção Planar Espacial interceptando pixels em regiões isoladas dos eixos Locais, projetando decalques com matemática limpa, permitindo a mistura do Alpha Blending. Isso é muito robusto para geometria paramétrica e nos livrou da dependência excessiva de mapas UV fixos."

---

## 3. Explicação Completa das Funções Principais

### Arquivo: `main.js`
*   **`preload()`**: Chamada apenas 1x pelo Lifecycle. Responsável por travar o loop de evento até que recursos pesados assíncronos (imagens, códigos fonte shader) leiam o EOF da banda de rede.
*   **`setup()`**: Configura a topologia matriz. Solicita um contexto `WEBGL2`, setando `version: 2`. Inicializa canvases em background via `createGraphics` — buffers off-screen invisíveis de memória RAM onde imprimimos fontes OpenType de alta qualidade de texto estático como o Letreiro da Vitrine. Em seguida, aciona a montagem paramétrica densa via `IniciarTexturas()`.
*   **`draw()`**: Loop ininterrupto em frequência de ~60hz. Exerce o pipeline fixo: Limpa os buffers antigos de cor da tela via `background()`. Roda atualização paramétrica espacial `AtualizarPosicaoCamera()`. Despacha estado unificado de matrizes projetivas usando `camera()`. Entra no pipeline shader via `shader(meu_shader)`. Empilha e desempilha as funções matemáticas filhas que enviam *Uniforms* de matrizes para a GPU e disparam comandos assíncronos como as chamadas da OpenGL/WebGL de drawTriangles (implícitas pelas funções).
*   **`RedesenharBordado()`**: Limpa e redesenha o canvas 2D temporário. Chamada toda vez que o input do HTML emite evento via DOM (Input Event). Ela pinta o nome e o time dentro do array de bytes com os tamanhos adequados e salva a instância no Uniform Textural em RAM da placa para o shader projetar nas costas, implementando a customização Live da loja.

### Arquivo: `camera_eventos.js`
*   **`AtualizarPosicaoCamera()`**: Implementa equações vetoriais de Interpolação Linear (LERP) nas grandezas dos vetores `alvo_pos_camera` via `.lerp()` garantindo que os deltas matemáticos brutos traduzam a câmera virtual de forma progressiva simulando Inércia Newtoniana.
*   **`mouseDragged() / mousePressed() / mouseWheel()`**: Funções assíncronas ativadas pelo Contexto do P5js via *Event Delegation*. Elas mapeiam as saídas espaciais do Hardware (ponteiro em pixels de tela `mouseX / Y`) e traduzem em variações numéricas orbitais (Eixo X `dy`, e Eixo Y `dx`) aplicadas nas esferas.
*   **`AoRedimensionarJanela()`**: Garante responsividade recriando o viewport framebuffer matriz para que as bordas da aplicação permaneçam fiéis se o display Resize. (Atualmente desabilitado em favor de janela estática à pedido de plataforma externa).

### Arquivo: `ambiente.js`
*   **`DesenharAmbienteVitrine()`**: Usado para encapsular as matrizes do cenário arquitetural exterior. Contém chamadas para dezenas de primitivas base como Caixas e Planos. Envia flags via `setUniform('uMaterialType')` especificando as regras dos materiais reativos (luz Neon nos vidros vs material opaco na calçada ou asfáltico e tijolos no lintel superior reconfigurado).
*   **`DesenharAmbienteLoja()`**: Arquitetura do Cenário "Estúdio Limpo". Plota chão com shader UV Floor-Grid (`uMaterialType: 11`) simulando cerâmica preta reflexiva via cálculo de subpixels no frag-shader (`fwidth` e `smoothstep` anti-aliasing procedurais das linhas da grade preta sem pixelização à distância).

### Arquivo: `kimono.js`
*   **`IniciarGeometriaKimono()`**: Instancia a factory `new p5.Geometry()`. Iterando for-loops aninhados para coordenadas `U` e `V`. Calcula raios variados. Acumula arrays flat contendo as tuplas de `createVector` da posição espacial 3D e seus pares UV, resultando no Buffer Vertex Array Object final. Processa faces (Triangulação base de polígonos adjacentes) e usa `.computeNormals()` da biblioteca, rodando um pass extra para corrigir *Smooth shading seams* na costura cilíndrica.
*   **`DesenharTroncoKimono()`**: Após setar matrizes, despacha a topologia recém criada para a Pipeline gráfica via comando abstrato `model()`. Em seguida, usa um modelo rudimentar de FK (Forward Kinematics) simples invocando sub-funções para injetar Braços adjacentes de acordo com matrizes parentais ativas (onde X do cotovelo herda o offset translacional do eixo global instanciado via translações encadeadas dos Ombros). 
*   **`DesenharCalca() / DesenharFaixa() / DesenharLapela()`**: Instanciadores secundários responsáveis pela amarração de objetos primitivos paramétricos que formam o cinto toroido (Torus paramétrico) e cilindros re-esculpidos da lapela.

---

## 4. Fluxo de Execução do Programa

O diagrama a seguir exibe o ciclo de vida sistêmico em alto nível, do código ao monitor:

```text
INICIALIZAÇÃO DO MOTOR
 │
 ├─ Navegador processa Arquivo index.html (Árvore DOM CSS+HTML).
 ├─ Executa o script assíncrono P5.JS Core Library.
 ├─ Scripts anexados ao DOM ui.js acoplam Event Listeners em controles (Botões, Dropdowns de loja).
 │
 ├─ p5 invoca -> preload()
 │     └─ I/O assíncrono lê "shader.vert", "shader.frag", "helio.jpg", "carlos.jpg".
 │
 └─ p5 invoca -> setup()
       ├─ Instancia Contexto de GPU WEBGL2 para 900x650 px.
       ├─ Dispara IniciarGeometriaKimono() calculando toda Modelagem Procedural na RAM em arrays Float32.
       ├─ Configura texturas invisíveis Offscreen para letreiros e UI 2D dinâmico do cenário 3D.
       └─ Seta pos_camera para posições polares do modo de Vitrine Extrema.

RENDERING LOOP (TICK DRAW - 60 Hz)
 │
 ├─ EVENTOS HARDWARE: Mouse arrasta? -> mouseDragged() atualiza os radares esféricos Radianos Y e X.
 │
 ├─ AtualizarPosicaoCamera() -> Efetua Lerp no vetor CameraPos e CâmeraLookAt.
 │
 ├─ Limpa Buffer Cores (background azul/cinza dinâmico) e Z-Buffer (Depth Buffer).
 ├─ Dispara comando camera(...) forçando multiplicação de ProjectionMatrix * ViewMatrix atuais.
 │
 ├─ shader(meu_shader) -> Acorda GLSL Shader Program, plugando saídas Vertex->Fragment.
 ├─ setUniform() -> Transfere vetores cruciais da RAM da CPU à Memória estática da GPU VRAM (E.g. uLightDir, Desgastes).
 │
 ├─ MODO DE VISÃO ESTADO LOGICAL SPLIT:
 │    │
 │    ├─ IF Vitrine:
 │    │     └─ DesenharAmbienteVitrine(): Plota ruas, Letreiros UV Offscreen texturizados na Parede 950x2762.
 │    │        DesenharTroncoKimono(): Mostra 3 kimonos clonados via laços for (com translações empilhadas Push/Pop em Array).
 │    │
 │    └─ ELSE (Loja Interna):
 │          ├─ DesenharAmbienteLoja(): Piso reflexivo escuro "Estúdio".
 │          ├─ rotateX/Y(rotacao): Gira a Model Matrix central.
 │          ├─ Consulta HTML Inputs "estado_loja.passoAtual".
 │          └─ Modelos exibidos são re-pintados com `uMaterialType=1`, enviando cor exata do modelo.
 │
 └─ BURACO DE FECHAMENTO (Fim Draw)
      └─ WebGL efetua Call de Double Buffer Swapping, pintando os arrays do Framebuffer no Monitor Fisicamente. Retorna ao início.
```

---

## 5. Guia para Apresentação

Para maximizar sua nota com a banca, não basta mostrar que funciona, é preciso provar o "sangue e o suor" de engenharia, que foi ir além do básico exigido pelas APIs. 

**Abordagem Sugerida (Ordem Lógica da Fala):**

1.  **Introdução Curta do Produto:** Abra com o pitch – "Decidimos não fazer apenas um jogo aleatório, mas um visualizador B2B de roupas e tecidos realistas interativos na web".
2.  **O Elefante na Sala (Por que um shader custom?):** Explique de cara que você achou a luz nativa (Blinn-phong) muito plástica. Para garantir nota alta, diga: *"Nós re-escrevemos o algoritmo de cor inteiro no Fragment Shader. Usamos modelo Blinn-Phong avançado + Fresnel Equation de forma analítica nas normais para dar o Rim Light felpudo típico de pano."*
3.  **Matemática da Geometria Limpa (Sem Blender):** Os professores adoram modelagem algorítmica. Diga: *"Podíamos importar um arquivo OBJ, mas programamos em Javascript a construção paramétrica da malha do Kimono. Geramos buffers de Arrays de faces triângulos anti-horárias, contornando o modelo cilindricamente distorcendo com equações sin/cos, garantindo topologia gerada dinamicamente com as costuras otimizadas matematicamente na GPU."*
4.  **Matemática nas Marcas (Sem UV esticado):** Chegue no problema dos patches. *"Se mapeássemos as texturas das Marcas nas UVs da barriga deformadas pelas equações senoidais, elas ficariam deformadas igual tecido amarrado. Resolvemos inventando um sistema de Projeção Planar e Bounding Boxes espaciais puras dentro do Shader de GPU, operando em Alpha Blending. Isso protege nossos Patches das distorções da malha.*
5.  **A Câmera do Sistema (Trigonometria):** Termine apontando que o sistema reativo que orbita não usa câmera engessada. Usa Coordenadas Esféricas, projetadas analiticamente no plano Cartesiano (vetores X, Y, Z com senos e cossenos combinados com vetores radiais), amarradas via `Lerp` e eventos limpos do sistema na raiz DOM.

## 6. Resumo Rápido

Aqui está uma cola condensada de 1 página de todos os fatos duros técnicos para sabatinas durante a defesa da banca. Estude-os se houver rodada de perguntas curtas.

**Estruturas C-Core Matemáticas Usadas:**
- Modelos Transformacionais: Translação (Mover eixos locais), Rotação, Escala, Multiplicação Encapsulada por Isolamento Hierárquico de Pilhas Afins Push/Pop Matrix. 
- Algoritmos Avançados Shaders: Aproximação Bump Mapping Estocástico Procedural por equações senoidais pseudo-aleatórias para "tecelagem" do tecido (Pearl Weave Bump).
- Interpolação Funcional Câmera e Transição Espacial: LERP Linear Interpolation em vetores de matriz Float32 base.

**Possíveis Perguntas Surpresas do Professor & Respostas Sugeridas:**

*   **P: E se eu quisesse adicionar uma luz focal tipo "Lanterna"?**
    *   *R: "Hoje usamos iluminação Direcional (`uLightDir`) enviando luz global como vetor no fragment shader. Para uma Lanterna (Spotlight), modificaríamos o Shader aceitando Uniforms Positionais de Luz e Raio de cone, inserindo no cálculo de Blinn-Phong atenuação de intensidade atrelada ao cosseno da distância direcional focal."*
*   **P: Como evitou que a calça afetasse a blusa se esticar ela na escala Y?**
    *   *R: "Toda a renderização adota um paradigma de Hierarquia de Estado e pilha. As chamadas como a função de calça e braços abrem o escopo de hardware usando PushMatrix e desenham as geometrias com matrizes independentes, destruindo a matriz derivada final com PopMatrix, protegendo a matriz-mãe."*
*   **P: Há Gimbal Lock? A Câmera sofre com pólos bloqueados?**
    *   *R: "Nós contornamos o perigo bloqueando estaticamente restrições nos ranges numéricos da nossa órbita Y e limitando clamp no eixo X (`constrain`) logo nas variáveis polares do `mouseDragged`. Com restrições do vetor `up(0, -1, 0)` na API do lookAt, impedimos colapso paralelo e o travamento clássico polar de LookAt Vectors."*

---
*Este relatório foi estruturado para consolidar o máximo de clareza do escopo de engenharia do programa BJJ Customizer (2026.1)*
