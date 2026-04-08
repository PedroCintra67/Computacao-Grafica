from run import *; start()
def setup():
    lado = min(windowWidth, windowHeight)
    createCanvas(lado, lado)
    translate(width/2, height/2)
    
    # Fundo
    fill(128, 128, 128, 50) 
    rectMode(CENTER)
    rect(0, 0, width, height)
    
    # Semi círculos maiores
    fill('white')
    arc(0,0, lado, lado, HALF_PI, PI + HALF_PI)
    fill('black')
    arc(0,0, lado, lado, PI + HALF_PI, HALF_PI)
    
    # Círculos das pontas
    fill('white')
    noStroke()
    circle(0, lado/2 - lado/8 , lado/4)
    fill('black')
    circle(0,-lado/2 + lado/8 , lado/4)
    
    # Círculos pequenos das pontas
    total_circulos = 6
    raio_centralizado = lado / 2.7
    
    for i in range(total_circulos):
        pct = i / (total_circulos - 1)
        
        # Lado esquero (Círculos Pretos)
        angulo_esq =  PI + HALF_PI - (pct * PI)
        x_esq = raio_centralizado * cos(angulo_esq)
        y_esq = raio_centralizado * sin(angulo_esq)
        noStroke()
        fill('black')
        circle(x_esq, y_esq, lado/16) 
        
        # Lado direito (Círculos Brancos)
        angulo_dir = HALF_PI - (pct * PI)
        x_dir = raio_centralizado * cos(angulo_dir)
        y_dir = raio_centralizado * sin(angulo_dir)
        noStroke()
        fill('white')
        circle(x_dir, y_dir, lado/16)
    
    # Semi círculos centrais
    fill ('black')
    noStroke()
    strokeWeight(2)
    arc(0, 0, lado/2, lado/2, HALF_PI, PI + HALF_PI)
    fill('white')
    arc(0, 0, lado/2, lado/2, PI + HALF_PI, HALF_PI)
    
    # Círculos centrais
    noStroke()
    fill('white')
    circle(0, -lado/8, lado/4)
    fill('black')
    circle(0, lado/8, lado/4)
    
    # Círculos pequenos centrais
    fill('black')
    circle(0, -lado/8, lado/14)
    fill('white')
    circle(0, lado/8, lado/14)