const canvas = document.getElementById('fireworksCanvas');
        const ctx = canvas.getContext('2d');
        
        // Ajuster la taille du canvas à la fenêtre
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Variables pour les feux d'artifice
        let fireworks = [];
        let particles = [];
        let intensity = 2; // 1: faible, 2: moyen, 3: élevé
        let colorSets = [
            ['#FFD700', '#FF8C00', '#FF1493'], // Or, orange, rose vif
            ['#00BFFF', '#32CD32', '#FFD700'], // Bleu ciel, vert, or
            ['#FF1493', '#9370DB', '#00FFFF'], // Rose, violet, cyan
            ['#FF4500', '#FFD700', '#00FA9A']  // Orange rouge, or, vert printemps
        ];
        let currentColorSet = 0;
        
        // Classe pour les feux d'artifice
        class Firework {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.targetY = y;
                this.speed = 4;
                this.velocity = {
                    x: Math.random() * 6 - 3,
                    y: Math.random() * 3 + 4
                };
                this.gravity = 0.05;
                this.hue = this.getRandomColor();
                this.brightness = Math.random() * 20 + 70;
                this.alpha = 1;
                this.decay = Math.random() * 0.015 + 0.005;
                this.trail = [];
                this.trailLength = 5;
                this.exploded = false;
            }
            
            getRandomColor() {
                const colors = colorSets[currentColorSet];
                return colors[Math.floor(Math.random() * colors.length)];
            }
            
            update() {
                this.trail.push({x: this.x, y: this.y});
                if (this.trail.length > this.trailLength) {
                    this.trail.shift();
                }
                
                this.velocity.y += this.gravity;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                
                this.alpha -= this.decay;
                
                if (this.alpha <= 0.1 && !this.exploded) {
                    this.explode();
                }
                
                if (this.y >= this.targetY && !this.exploded) {
                    this.explode();
                }
            }
            
            explode() {
                this.exploded = true;
                const particleCount = intensity === 1 ? 50 : intensity === 2 ? 100 : 200;
                
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle(
                        this.x, 
                        this.y, 
                        this.hue
                    ));
                }
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = this.hue;
                ctx.fill();
                
                // Dessiner la traînée
                for (let i = 0; i < this.trail.length; i++) {
                    const point = this.trail[i];
                    const alpha = i / this.trail.length * 0.5;
                    
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
                    ctx.fillStyle = this.hue.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                    ctx.fill();
                }
            }
        }
        
        // Classe pour les particules d'explosion
        class Particle {
            constructor(x, y, hue) {
                this.x = x;
                this.y = y;
                this.hue = hue;
                this.size = Math.random() * 2 + 1;
                this.speed = Math.random() * 3 + 1;
                this.velocity = {
                    x: Math.random() * 6 - 3,
                    y: Math.random() * 6 - 3
                };
                this.gravity = 0.05;
                this.decay = Math.random() * 0.015 + 0.005;
                this.alpha = 1;
                this.brightness = Math.random() * 20 + 70;
            }
            
            update() {
                this.velocity.y += this.gravity;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.alpha -= this.decay;
                this.size -= 0.01;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.hue.replace(')', `, ${this.alpha})`).replace('rgb', 'rgba');
                ctx.fill();
                
                // Ajouter un effet de brillance
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
                ctx.fill();
            }
        }
        
        // Fonction pour créer un nouveau feu d'artifice
        function createFirework() {
            const x = Math.random() * canvas.width;
            const y = canvas.height;
            const targetY = Math.random() * canvas.height * 0.5;
            
            const firework = new Firework(x, y);
            firework.targetY = targetY;
            fireworks.push(firework);
        }
        
        // Fonction d'animation
        function animate() {
            // Effacer le canvas avec un effet de fondu pour des traînées
            ctx.fillStyle = 'rgba(10, 10, 42, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculer le nombre de feux d'artifice à créer en fonction de l'intensité
            const fireworksCount = intensity === 1 ? 0.3 : intensity === 2 ? 0.8 : 1.5;
            if (Math.random() < fireworksCount) {
                createFirework();
            }
            
            // Mettre à jour et dessiner les feux d'artifice
            for (let i = fireworks.length - 1; i >= 0; i--) {
                fireworks[i].update();
                fireworks[i].draw();
                
                if (fireworks[i].alpha <= 0) {
                    fireworks.splice(i, 1);
                }
            }
            
            // Mettre à jour et dessiner les particules
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();
                
                if (particles[i].alpha <= 0 || particles[i].size <= 0) {
                    particles.splice(i, 1);
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        // Démarrer l'animation
        animate();
        
        // Contrôles interactifs
        document.getElementById('moreFireworks').addEventListener('click', function() {
            if (intensity < 3) {
                intensity++;
                updateIntensityDisplay();
                
                // Ajouter quelques feux d'artifice supplémentaires
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => createFirework(), i * 100);
                }
            }
        });
        
        document.getElementById('lessFireworks').addEventListener('click', function() {
            if (intensity > 1) {
                intensity--;
                updateIntensityDisplay();
            }
        });
        
        document.getElementById('changeColors').addEventListener('click', function() {
            currentColorSet = (currentColorSet + 1) % colorSets.length;
            
            // Effet visuel de changement de couleurs
            for (let i = 0; i < 10; i++) {
                setTimeout(() => createFirework(), i * 50);
            }
            
            // Mettre à jour la couleur du bouton brièvement
            const btn = document.getElementById('changeColors');
            const originalColor = btn.style.color;
            btn.style.color = colorSets[currentColorSet][0];
            setTimeout(() => {
                btn.style.color = originalColor;
            }, 500);
        });
        
        function updateIntensityDisplay() {
            const intensityText = document.getElementById('intensityValue');
            if (intensity === 1) {
                intensityText.textContent = 'Faible';
                intensityText.style.color = '#FF8C00';
            } else if (intensity === 2) {
                intensityText.textContent = 'Moyenne';
                intensityText.style.color = '#FFD700';
            } else {
                intensityText.textContent = 'Élevée';
                intensityText.style.color = '#FF1493';
            }
        }
        
        // Ajouter des feux d'artifice au clic
        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Créer un feu d'artifice à la position du clic
            const firework = new Firework(x, canvas.height);
            firework.targetY = y;
            fireworks.push(firework);
        });
        
        // Effet de confettis au chargement
        window.addEventListener('load', function() {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => createFirework(), i * 100);
            }
        });
        
        // Message de bienvenue dans la console
        console.log("%c✨ Bonne Année 2026 ! ✨", "color: #FFD700; font-size: 20px; font-weight: bold;");
        console.log("%cQue cette année soit remplie de joie, de succès et de moments inoubliables!", "color: #00BFFF; font-size: 14px;");
    