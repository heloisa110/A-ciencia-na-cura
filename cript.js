// Script JavaScript - Código de Cura

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. SIMULADOR DE RESPOSTA IMUNOLÓGICA (CANVAS)
    // ==========================================
    const canvas = document.getElementById('immuneCanvas');
    const ctx = canvas.getContext('2d');
    const btnSimulate = document.getElementById('btn-simulate');
    const antibodySlider = document.getElementById('antibody-level');
    const antibodyValDisplay = document.getElementById('antibody-val');
    const treatmentSelect = document.getElementById('treatment-type');
    const statusText = document.getElementById('simulation-status');
    const healthBar = document.getElementById('health-bar');

    let particles = [];
    let simulationRunning = false;
    let animationFrameId;
    let health = 100;

    // Atualiza texto do slider
    antibodySlider.addEventListener('input', (e) => {
        antibodyValDisplay.textContent = `${e.target.value}%`;
    });

    class Particle {
        constructor(type) {
            this.type = type; // 'pathogen' ou 'antibody'
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = type === 'pathogen' ? 6 : 4;
            this.speedX = (Math.random() - 0.5) * (type === 'pathogen' ? 2 : 3);
            this.speedY = (Math.random() - 0.5) * (type === 'pathogen' ? 2 : 3);
            this.active = true;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Rebatimento nas bordas
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'pathogen' ? '#f43f5e' : '#38bdf8';
            ctx.fill();
            ctx.closePath();
        }
    }

    function initSimulation() {
        particles = [];
        health = 100;
        updateHealthBar();

        const antibodyCount = parseInt(antibodySlider.value);
        const treatment = treatmentSelect.value;
        let pathogenCount = 40;

        // Ajustes baseados no tratamento
        let speedMultiplier = 1;
        if (treatment === 'vaccine') {
            pathogenCount = 25; // Menos patógenos inicias devido à memória imunológica
        } else if (treatment === 'antibiotic') {
            speedMultiplier = 1.5; // Anticorpos se movem mais rápido
        }

        // Criar Patógenos
        for (let i = 0; i < pathogenCount; i++) {
            particles.push(new Particle('pathogen'));
        }

        // Criar Anticorpos
        for (let i = 0; i < antibodyCount; i++) {
            let p = new Particle('antibody');
            p.speedX *= speedMultiplier;
            p.speedY *= speedMultiplier;
            particles.push(p);
        }

        simulationRunning = true;
        statusText.textContent = "Combate imunológico em andamento...";
        statusText.style.color = "#38bdf8";

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animate();
    }

    function animate() {
        if (!simulationRunning) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let pathogens = particles.filter(p => p.type === 'pathogen' && p.active);
        let antibodies = particles.filter(p => p.type === 'antibody' && p.active);

        // Checar colisões entre anticorpos e patógenos
        antibodies.forEach(ab => {
            pathogens.forEach(pt => {
                if (ab.active && pt.active) {
                    const dist = Math.hypot(ab.x - pt.x, ab.y - pt.y);
                    if (dist < ab.radius + pt.radius + 2) {
                        // Anticorpo neutraliza o patógeno
                        pt.active = false;
                        ab.active = false;
                    }
                }
            });
        });

        // Dano à saúde se houver patógenos ativos acumulados
        if (pathogens.length > 0) {
            health -= pathogens.length * 0.05;
            if (health < 0) health = 0;
            updateHealthBar();
        }

        // Desenhar e atualizar partículas ativas
        particles.forEach(p => {
            if (p.active) {
                p.update();
                p.draw();
            }
        });

        // Condições de término
        if (pathogens.length === 0) {
            simulationRunning = false;
            statusText.textContent = "Sucesso! O sistema imunológico neutralizou a ameaça.";
            statusText.style.color = "#10b981";
        } else if (health <= 0) {
            simulationRunning = false;
            statusText.textContent = "Infecção severa! A resposta imunológica foi insuficiente.";
            statusText.style.color = "#f43f5e";
        } else {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    function updateHealthBar() {
        healthBar.style.width = `${Math.max(0, Math.round(health))}%`;
        healthBar.textContent = `${Math.max(0, Math.round(health))}% Saúde`;
        if (health < 30) {
            healthBar.style.backgroundColor = '#f43f5e';
        } else if (health < 70) {
            healthBar.style.backgroundColor = '#f59e0b';
        } else {
            healthBar.style.backgroundColor = '#10b981';
        }
    }

    btnSimulate.addEventListener('click', initSimulation);


    // ==========================================
    // 2. LINHA DO TEMPO INTERATIVA
    // ==========================================
    const timelineData = {
        "1928": {
            title: "1928 — A Descoberta da Penicilina",
            desc: "Alexander Fleming descobre acidentalmente a penicilina ao observar que o fungo Penicillium notatum inibia o crescimento bacteriano, dando início à era dos antibióticos.",
            impact: "Impacto: Salva milhões de vidas e revoluciona o tratamento de infecções."
        },
        "1953": {
            title: "1953 — A Estrutura da Dupla Hélice do DNA",
            desc: "James Watson, Francis Crick e Rosalind Franklin revelam a estrutura em dupla hélice do DNA, abrindo portas para a biologia molecular moderna.",
            impact: "Impacto: Permite entender a base genética das doenças e o desenvolvimento de bioterapias."
        },
        "1978": {
            title: "1978 — Produção de Insulina Recombinante",
            desc: "Cientistas conseguem sintetizar insulina humana utilizando bactérias modificadas geneticamente via tecnologia de DNA recombinante.",
            impact: "Impacto: Início dos medicamentos biológicos e síntese de hormônios seguros."
        },
        "2020": {
            title: "2020 — Era das Vacinas de RNA Mensageiro (mRNA)",
            desc: "Aprovação e uso em escala global de vacinas de RNAm, que instruem as próprias células do corpo a produzir proteínas defensivas.",
            impact: "Impacto: Nova fronteira para tratamento de vírus, câncer e doenças autoimunes."
        }
    };

    const timelineBtns = document.querySelectorAll('.timeline-btn');
    const titleEl = document.getElementById('timeline-title');
    const descEl = document.getElementById('timeline-desc');
    const impactEl = document.getElementById('timeline-impact');

    timelineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            timelineBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const year = btn.getAttribute('data-year');
            const data = timelineData[year];

            if (data) {
                titleEl.textContent = data.title;
                descEl.textContent = data.desc;
                impactEl.textContent = data.impact;
            }
        });
    });

    // Inicialização do Canvas com tela limpa
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Clique em "Iniciar Simulação" para começar', canvas.width / 2, canvas.height / 2);
});