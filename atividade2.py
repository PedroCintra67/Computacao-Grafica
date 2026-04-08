from run import *; start()
import random 

def setup():
    createCanvas(800, 800, WEBGL)
    noStroke()

def draw():
    background(160, 220, 245) 
    ambientLight(110) 
    directionalLight(255, 255, 220, -1, 1, -1) 
    
    random.seed(42) 
    
    # 1. POSIÇÃO DA CÂMERA (Empurra o mundo todo para trás PRIMEIRO)
    translate(0, height / 2 + 150, -1100)
    
    # 2. DESENHA O SOL
    desenhar_sol()
    
    # 3. PÁSSARO (Fica livre da rotação da árvore)
    desenhar_bando_passaros()
    
    # 4. ROTAÇÃO PELO MOUSE
    # 4. ROTAÇÃO PELO MOUSE (Corrigida)
    # Se for o início do programa (mouseX == 0), centraliza a visão automaticamente
    posicao_mouse = mouseX if mouseX != 0 else width / 2
    rotateY((posicao_mouse - width / 2) * 0.01)
    
    # 5. DESENHA O RESTO DO MUNDO
    desenhar_gramado()
    
    desenhar_flores_chao()
    
    # Bancos simétricos
    # Bancos simétricos (afastados da árvore)
    desenhar_banco(320, -35, 10, 0) 
    desenhar_banco(-320, -35, 10, 0)
    
    desenhar_arvore(280, 105)

def desenhar_gramado():
    push()
    fill(20, 60, 20) 
    
    # Abaixamos um pouquinho (Y = 10) para o topo do gramado ficar na altura dos pés da árvore
    translate(0, 10, 0)
    
    # box(Largura X, Altura Y, Profundidade Z)
    # 4000 garante que ele preencha a tela toda, não importa para onde você gire!
    box(4000, 20, 4000) 
    pop()

def desenhar_arvore(tamanho_base, espessura_base):
    # Desenha as raízes
    desenhar_sistemas_de_raizes(8, 80, 25)
    
    # Desenha o tronco principal e toda a copa (folhas e flores)
    desenhar_galho_recursivo(tamanho_base, espessura_base)

def desenhar_galho_recursivo(tamanho, espessura):
    fill(80 + random.uniform(-5, 5), 55 + random.uniform(-5, 5), 35)
    
    push()
    translate(0, -tamanho / 2, 0)
    cylinder(espessura / 2, tamanho, 6, 1) 
    pop()
    
    translate(0, -tamanho, 0) 
    
    if tamanho > 40: 
        num_galhos = random.choice([2, 3, 3]) 
        angulo_base_y = random.uniform(0, TWO_PI)
        
        for i in range(num_galhos):
            push()
            rotY = angulo_base_y + (TWO_PI / num_galhos) * i + random.uniform(-0.3, 0.3)
            rotZ = random.uniform(PI / 12, PI / 5) 
            
            vento = sin(frameCount * 0.01 + tamanho) * 0.04
            
            rotateY(rotY + vento)
            rotateZ(rotZ + vento)
            
            novo_tamanho = tamanho * random.uniform(0.65, 0.75)
            nova_espessura = espessura * random.uniform(0.5, 0.6)
            
            desenhar_galho_recursivo(novo_tamanho, nova_espessura)
            pop()
    else:
        desenhar_folhagem_e_flores()

def desenhar_folhagem_e_flores():
    for _ in range(3): 
        push()
        translate(random.uniform(-15, 15), random.uniform(-15, 15), random.uniform(-15, 15))
        fill(random.uniform(30, 60), random.uniform(100, 160), 30)
        ellipsoid(random.uniform(25, 45), random.uniform(10, 20), random.uniform(25, 45), 5, 5) 
        pop()
    
    if random.random() > 0.3: 
        push()
        pos_x = random.uniform(-40, 40)
        pos_y = random.uniform(-30, 0) 
        pos_z = random.uniform(-40, 40)
        
        translate(pos_x, pos_y, pos_z)
        
        cor_flor = random.choice([(255, 100, 150), (255, 50, 50), (255, 200, 0)])
        fill(cor_flor[0], cor_flor[1], cor_flor[2])
        sphere(random.uniform(8,12), 6, 6) 
        pop()

def desenhar_sistemas_de_raizes(num_sistemas, comprimento_base, espessura_base):
    for i in range(num_sistemas):
        push()
        rotateY((TWO_PI / num_sistemas) * i + random.uniform(-0.5, 0.5))
        rotateZ(PI / 2.2) 
        desenhar_raiz_recursiva(comprimento_base, espessura_base)
        pop()

def desenhar_raiz_recursiva(tamanho, espessura):
    fill(40, 30, 20)
    push()
    translate(0, tamanho / 2, 0) 
    cylinder(espessura / 2, tamanho, 6, 1)
    pop()

    translate(0, tamanho, 0)

    if tamanho > 30: 
        rotateY(random.uniform(-0.2, 0.2))
        rotateZ(random.uniform(-0.1, 0.1))
        desenhar_raiz_recursiva(tamanho * 0.75, espessura * 0.6)

def desenhar_sol():
    push()
    translate(600, -1500, -600)
    noStroke() 
    
    # 1. NÚCLEO DO SOL (Aumentado para 110)
    fill("yellow") 
    sphere(110, 24, 24)
    
    # 2. AURA / BRILHO (Efeito Glow expandido)
    num_camadas = 6
    pulsar = sin(frameCount * 0.05) * 20
    
    for i in range(num_camadas):
        # Aumentamos o multiplicador de i de 20 para 30 para espalhar mais a luz
        tamanho_glow = 130 + (i * 30) + pulsar
        opacidade = 30 - (i * 4) 
        
        fill(255, 200, 50, opacidade)
        sphere(tamanho_glow, 16, 16) 
    pop()

def desenhar_bando_passaros():
    push()
    num_passaros = 8 
    
    # 1. TEMPO DE VOO (Sem o % aqui!)
    # Adicionamos +1000 para que eles comecem a animação perfeitamente 
    # posicionados fora da tela à esquerda, prontos para entrar.
    tempo_voo = frameCount * 4 + 1000 
    
    random.seed(99)
    
    for i in range(num_passaros):
        cor_corpo = (random.uniform(50, 255), random.uniform(50, 255), random.uniform(50, 255))
        escala = random.uniform(0.8, 1.2)
        
        # --- A MÁGICA DO LOOP INDIVIDUAL ---
        
        # Primeiro, calculamos onde o pássaro estaria em uma linha reta infinita
        posicao_infinita_x = tempo_voo - (i * 80)
        
        # AQUI ESTÁ O SEGREDO: 
        # Usamos um palco gigante de 3000 pixels (-1500 até +1500).
        # Cada pássaro só sofre o "teleporte" pro começo quando ele,
        # individualmente, atinge o +1500 (que fica super escondido fora da tela).
        pos_x = (posicao_infinita_x % 3000) - 1500
        
        # EIXO Y (Onda) e EIXO Z (Profundidade) continuam iguais
        offset_y = sin(frameCount * 0.1 - i * 0.5) * 40 
        offset_z = sin(i * 10) * 15 
        
        pos_y = -350 + offset_y 
        pos_z = 300 + offset_z
        
        # --- DESENHA O PÁSSARO ---
        push()
        translate(pos_x, pos_y, pos_z)
        scale(escala) 
        
        # Inclinação para cima/baixo acompanhando a onda
        inclinacao = cos(frameCount * 0.1 - i * 0.5) * 0.3
        rotateZ(inclinacao)
        
        # Corpo
        fill(cor_corpo[0], cor_corpo[1], cor_corpo[2]) 
        ellipsoid(20, 8, 8, 6, 6) 
        
        # Bico
        push()
        fill(255, 200, 0)
        translate(20, 0, 0) 
        rotateZ(-PI/2) 
        cone(4, 12, 4, 1) 
        pop()
        
        # Asas Batendo
        fill(cor_corpo[0]*0.8, cor_corpo[1]*0.8, cor_corpo[2]*0.8) 
        batida = sin(frameCount * 0.5 + pos_x) * 0.8 
        
        # Asa Direita
        push()
        translate(0, -2, 6) 
        rotateX(batida) 
        translate(0, 0, 10) 
        box(15, 2, 20) 
        pop()
        
        # Asa Esquerda
        push()
        translate(0, -2, -6)
        rotateX(-batida) 
        translate(0, 0, -10)
        box(15, 2, 20)
        pop()
        
        pop() 
        
    pop() 
    
    random.seed(42)

def desenhar_banco(pos_x, pos_y, pos_z, rotacao_y):
    push()
    translate(pos_x, pos_y, pos_z)
    scale(1.8) 
    rotateY(rotacao_y) 
    fill(140, 90, 50) 
    
    # 1. ASSENTO (Esticado: passamos o eixo X de 80 para 200)
    push()
    box(200, 5, 30) 
    pop()
    
    # 2. ENCOSTO (Esticado acompanhando o assento)
    push()
    translate(0, -20, -12) 
    rotateX(PI / 12) 
    box(200, 25, 5)
    pop()
    
    # 3. PERNAS
    # Afastamos as pernas das pontas de 35 para 85
    push(); translate(-85, 10, 10); box(5, 20, 5); pop()  # Frente-Esquerda
    push(); translate(85, 10, 10); box(5, 20, 5); pop()   # Frente-Direita
    push(); translate(-85, 10, -10); box(5, 20, 5); pop() # Trás-Esquerda
    push(); translate(85, 10, -10); box(5, 20, 5); pop()  # Trás-Direita
    
    # Adicionamos pernas extras no centro para suportar o comprimento
    push(); translate(0, 10, 10); box(5, 20, 5); pop()    # Frente-Centro
    push(); translate(0, 10, -10); box(5, 20, 5); pop()   # Trás-Centro
    
    pop()
    
def desenhar_flores_chao():
    push()
    random.seed(88) 
    
    # Aumentamos para 120 aglomerados para preencher bem o campo gigante
    num_aglomerados = 120 
    
    for _ in range(num_aglomerados):
        # Sorteamos posições X e Z diretamente no super retângulo!
        # Vai de -1800 até 1800 para preencher toda a largura da tela e profundidade
        centro_x = random.uniform(-1800, 1800)
        centro_z = random.uniform(-1800, 1800)
        
        num_flores = random.choice([10, 15, 20])
        
        cor_tipo = random.choice([
            (255, 255, 255), 
            (255, 200, 50),  
            (200, 100, 255), 
            (255, 100, 150)  
        ])
        
        for _ in range(num_flores):
            # Espalha as florzinhas ao redor do centro da moita
            offset_x = random.uniform(-40, 40)
            offset_z = random.uniform(-40, 40)
            
            pos_x = centro_x + offset_x
            pos_z = centro_z + offset_z
            
            # Altura das flores encostando certinho no topo do novo gramado retangular
            pos_y = -2 
            
            push()
            translate(pos_x, pos_y, pos_z)
            
            r = max(0, min(255, cor_tipo[0] + random.uniform(-20, 20)))
            g = max(0, min(255, cor_tipo[1] + random.uniform(-20, 20)))
            b = max(0, min(255, cor_tipo[2] + random.uniform(-20, 20)))
            fill(r, g, b)
            
            tamanho = random.uniform(3, 6)
            box(tamanho) 
            pop() 
            
    pop() 
    random.seed(42)
