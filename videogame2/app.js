const canvas = document.querySelector('canvas');
const ctx1 = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scorEl = document.querySelector('#scorEl');
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        ctx1.beginPath()
        ctx1.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx1.fillStyle = this.color;
        ctx1.fill()
        
    }    
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx1.beginPath()
        ctx1.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx1.fillStyle = this.color;
        ctx1.fill()
        
    } 
    
    update() {
        this.draw()
        this.x = this.x +this.velocity.x
        this.y = this.y +this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx1.beginPath()
        ctx1.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx1.fillStyle = this.color;
        ctx1.fill()
        
    } 
    
    update() {
        this.draw()
        this.x = this.x +this.velocity.x
        this.y = this.y +this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1
    }

    draw() {
        ctx1.save()
        ctx1.globalAlpha = 0.1
        ctx1.beginPath()
        ctx1.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx1.fillStyle = this.color;
        ctx1.fill()
        ctx1.restore()
        
    } 
    
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x +this.velocity.x
        this.y = this.y +this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let players = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
    players = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scorEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

function spawnEnemies(){
    setInterval(() =>{
        const radius = Math.random() * (30 - 4) + 4

        let x
        let y

      if (Math.random() < 0.5) {
         x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
         y = Math.random() * canvas.height
    } else {
        x = Math.random() * canvas.width
         y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2( canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}


let animationId
let score = 0
function animate(){
    animationId = requestAnimationFrame(animate);
    ctx1.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx1.fillRect(0, 0, canvas.width, canvas.height)
    players.draw()
    particles.forEach((particle, pardex) =>{
        if (particle.alpha <= 0) {
            particles.splice(pardex, 1)
        }
        particle.update()
    });
   projectiles.forEach((projectile, indexe) =>{
       projectile.update()

       if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height){
        setTimeout(() => {
            
         projectiles.splice(indexe, 1)
        }, 0);
       }
   })
    
   enemies.forEach((enemy, index) => {
     enemy.update()

     const dist = Math.hypot(players.x - enemy.x, players.y - enemy.y)
     if (dist - enemy.radius - players.radius < 1) {
     cancelAnimationFrame(animationId)
     modalEl.style.display = 'flex'
     bigScoreEl.innerHTML = score
     }

     projectiles.forEach((projectile, prondex) => {
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
     
    if (dist - enemy.radius - projectile.radius < 1){
     
        for (let i = 0; i < enemy.radius * 2; i++) {
              particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6)}))  
        }
        if(enemy.radius - 10 > 5) {
            score += 100
            scorEl.innerHTML = score
            
            gsap.to(enemy, {
                radius: enemy.radius - 10
            })
            setTimeout(() => {
              
             projectiles.splice(prondex, 1)
            }, 0)
        } else{
            score += 250
            scorEl.innerHTML = score
            setTimeout(() => {
                enemies.splice(index, 1)
             projectiles.splice(prondex, 1)
            }, 0);
        }
      
        
    }
    })
   })

}



addEventListener('click', (event) =>{
    
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

startGameBtn.addEventListener('click', () =>{
    init()
    animate()
spawnEnemies()
modalEl.style.display = 'none'

})