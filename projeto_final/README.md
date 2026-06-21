# Loja 3D de Kimonos

## Sobre o Projeto
Uma aplicação interativa de e-commerce 3D dedicada a kimonos de Jiu-Jitsu. O projeto simula um ambiente virtual onde o usuário pode visualizar modelos em uma vitrine realista, inspecioná-los em 360 graus e personalizar cada parte do traje. Tudo é renderizado em tempo real diretamente no navegador, unindo usabilidade e computação gráfica de alta fidelidade técnica.

## Conceitos de Computação Gráfica Aplicados
Este software foi desenvolvido aplicando na prática diversos fundamentos teóricos da área de Computação Gráfica:
* **Modelagem Procedural:** Geração matemática da malha 3D (costuras, dobras e mangas da calça/blusa) em tempo real, calculando centenas de vértices através de funções senoidais, curvas de Bezier e interpolação.
* **Pipelines de Renderização (Shaders GLSL):** Substituição do material padrão do p5.js por um Fragment Shader construído do zero, otimizado para lidar com diferentes materiais numa única passagem (Uber Shader).
* **Modelos de Iluminação Clássicos:** Implementação nativa do algoritmo de **Blinn-Phong** para tratar luz ambiente, difusa e reflexos especulares reluzentes (como os dos pedestais e placa dourada), além de cálculo de **Fresnel** para simular o comportamento de tecidos macios (peach fuzz).
* **Renderização Não-Fotorrealista (NPR):** Alternativa implementada via Shader do modo visual **Cel Shading** (Toon Shading), quantizando as sombras para criar um efeito flat 2D estilo anime.
* **Texturização Mapeada (UV Mapping):** Projeção de decalques (logos), estampas de patrocínio, "Pearl Weave" do tecido e bordados customizados via cálculo procedural de coordenadas UV, lidando com fusão de opacidade e projeção frontal.
* **Transformações Geométricas Espaciais:** Uso constante das matrizes de Transformação (Translação, Rotação e Escala) para controle de Câmera Orbital, movimentação do mouse (Arcball) e hierarquia de objetos (nós da faixa relativos à cintura).

## Como Instalar e Rodar
1. Baixe os arquivos do projeto.
2. Como se trata de arquivos locais carregando texturas, é obrigatório rodar através de um Servidor Local por questões de CORS do navegador. 
3. Recomenda-se utilizar a extensão **Live Server** (do VS Code) no arquivo `index.html`. Alternativamente, você pode rodar `npx http-server` ou `python -m http.server` no diretório principal.
4. O projeto rodará na sua porta padrão (ex: `http://localhost:5500/`).

## Como Interagir na Loja
* **Modo Vitrine:** A página inicial inicia com um passeio panorâmico em três pedestais exibindo os modelos clássicos (Atama, Vouk e Kingz). Clique em "Entrar na Loja" na marca desejada.
* **Câmera 3D:** Quando estiver customizando o Kimono, **Clique e Arraste** o mouse na tela para girar a câmera em 360 graus. Use o **Scroll (rodinha do mouse)** para dar Zoom e ver os detalhes de costura.
* **Customização de Peças:** No painel lateral, você tem total liberdade. Misture a cor de sua calça com a da sua blusa, mude o tipo de tecido e até adicione faixas tricolores (Corais).
* **Bordado Personalizado:** Habilite e escreva seu próprio nome no painel de Patch; a engine irá gerar uma textura com efeito de linha de seda diretamente na malha 3D das costas do kimono.
* **Desgaste (Idade):** Aumente a Idade do Kimono no painel lateral esquerdo. As texturas vão amarelar, sujar procedualmente e o tecido perderá gradualmente o brilho reluzente, simulando uso intenso.
