// 1. ATUALIZAÇÃO DO SLIDER
const slider = document.getElementById('antibody-slider');
const sliderVal = document.getElementById('slider-val');

slider.addEventListener('input', function() {
    sliderVal.textContent = slider.value + '%';
});

// 2. SIMULADOR COM CANVAS
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status-text');
const treatmentSelect = document.getElementById('treatment-select');

let particles = [];
let animId = null;

class Particle {
    constructor(type) {
        this.type = type; // 'pathogen' (vermelho) ou 'antibody' (azul)
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.radius = type === 'pathogen' ? 6 : 4;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'pathogen' ? '#f43f5e' : '#38bdf8';
        ctx.fill();
        ctx.closePath();
    }
}

function startSimulation() {
    particles = [];
    const immunity = parseInt(slider.value);
    const treatment = treatmentSelect.value;

    let pathogenCount = 30;
    let antibodyCount = immunity;

    if (treatment === 'vaccine') pathogenCount = 15;
    if (treatment === 'meds') antibodyCount += 20;

    for (let i = 0; i < pathogenCount; i++) {
        particles.push(new Particle('pathogen'));
    }

    for (let i = 0; i < antibodyCount; i++) {
        particles.push(new Particle('antibody'));
    }

    statusText.textContent = "Status: Combate em andamento...";
    statusText.style.color = "#38bdf8";

    if (animId) cancelAnimationFrame(animId);
    runLoop();
}

function runLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activePathogens = particles.filter(p => p.type === 'pathogen' && p.active);
    let activeAntibodies = particles.filter(p => p.type === 'antibody' && p.active);

    // Colisão
    activeAntibodies.forEach(ab => {
        activePathogens.forEach(pt => {
            if (ab.active && pt.active) {
                let dx = ab.x - pt.x;
                let dy = ab.y - pt.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < ab.radius + pt.radius) {
                    ab.active = false;
                    pt.active = false;
                }
            }
        });
    });

    particles.forEach(p => {
        if (p.active) {
            p.update();
            p.draw();
        }
    });

    if (activePathogens.length === 0) {
        statusText.textContent = "Status: Infecção debelada com sucesso!";
        statusText.style.color = "#10b981";
    } else if (activeAntibodies.length === 0 && activePathogens.length > 0) {
        statusText.textContent = "Status: Anticorpos insuficientes!";
        statusText.style.color = "#f43f5e";
    } else {
        animId = requestAnimationFrame(runLoop);
    }
}

startBtn.addEventListener('click', startSimulation);

// Desenho inicial do Canvas
ctx.fillStyle = '#94a3b8';
ctx.font = '14px Arial';
ctx.textAlign = 'center';
ctx.fillText('Clique em "Iniciar Simulação"', canvas.width / 2, canvas.height / 2);

// 3. LINHA DO TEMPO
const events = {
    1928: {
        title: "1928 — A Descoberta da Penicilina",
        desc: "Alexander Fleming descobre acidentalmente a penicilina, abrindo caminho para o combate às infecções bacterianas com antibióticos."
    },
    1953: {
        title: "1953 — A Estrutura do DNA",
        desc: "A revelação da estrutura em dupla hélice do DNA por Watson, Crick e Franklin revolucionou a genômica e a medicina molecular."
    },
    1978: {
        title: "1978 — Insulina Recombinante",
        desc: "A primeira síntese de insulina humana em laboratório permitiu tratamentos seguros para milhões de diabéticos no mundo todo."
    },
    2020: {
        title: "2020 — Vacinas de mRNA",
        desc: "A criação rápida de vacinas com RNA mensageiro inaugurou uma nova era na imunização contra vírus e possíveis terapias contra o câncer."
    }
};

function showEvent(year, btnElement) {
    document.getElementById('event-title').textContent = events[year].title;
    document.getElementById('event-desc').textContent = events[year].desc;

    let buttons = document.querySelectorAll('.t-btn');
    buttons.forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
}
