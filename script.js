const weatherConfig = {
    0: { label: "Céu Limpo", icon: "☀️", color: "#00d2ff" },
    1: { label: "Quase Limpo", icon: "🌤️", color: "#00d2ff" },
    2: { label: "Parcialmente Nublado", icon: "⛅", color: "#00d2ff" },
    3: { label: "Nublado", icon: "☁️", color: "#00d2ff" },
    45: { label: "Névoa", icon: "🌫️", color: "#a8a8b3" },
    61: { label: "Chuva Fraca", icon: "🌧️", color: "#00d2ff" },
    80: { label: "Pancadas", icon: "🌦️", color: "#00d2ff" },
};

// Tempo de expiração em milissegundos (1 hora = 60 * 60 * 1000)
const EXPIRATION_TIME = 60 * 60 * 1000;

document.addEventListener("DOMContentLoaded", carregarMemoriaComFiltro);

document.getElementById("cidadeInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        buscarClimaReal();
    }
});

async function buscarClimaReal() {
    const input = document.getElementById("cidadeInput");
    const notificacao = document.getElementById("notificacao-container");
    
    let busca = input.value
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, " ");

    if (!busca) return;

    notificacao.innerHTML = `<p style="color: #a8a8b3">Buscando localidade...</p>`;

    try {
        let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca)}&count=10&language=pt&format=json`;
        let geoRes = await fetch(geoUrl);
        let geoData = await geoRes.json();

        if ((!geoData.results || geoData.results.length === 0) && busca.includes("-")) {
            const resAlt = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca.replace(/-/g, " "))}&count=10&language=pt&format=json`);
            geoData = await resAlt.json();
        }

        if (!geoData.results || geoData.results.length === 0) throw new Error("Local não encontrado.");

        if (geoData.results.length > 1) {
            notificacao.innerHTML = '<div class="lista-selecao"></div>';
            const lista = notificacao.querySelector(".lista-selecao");
            geoData.results.forEach(local => {
                const item = document.createElement("div");
                item.className = "item-local";
                item.innerHTML = `<strong>${local.name}</strong> <small>(${local.admin1 || local.country})</small>`;
                item.onclick = () => {
                    salvarCidadeNaMemoria(local);
                    adicionarCardAoGrid(local);
                    notificacao.innerHTML = "";
                    input.value = "";
                };
                lista.appendChild(item);
            });
        } else {
            salvarCidadeNaMemoria(geoData.results[0]);
            adicionarCardAoGrid(geoData.results[0]);
            notificacao.innerHTML = "";
            input.value = "";
        }
    } catch (e) {
        notificacao.innerHTML = `<p style="color: #ff5555">${e.message}</p>`;
    }
}

// LÓGICA DE MEMÓRIA COM TIMESTAMP
function salvarCidadeNaMemoria(local) {
    let salvas = JSON.parse(localStorage.getItem("meuClima_comparacao")) || [];
    
    // Adicionamos o horário atual (timestamp) ao objeto da cidade
    const cidadeComTempo = {
        ...local,
        timestamp: new Date().getTime() 
    };

    // Remove duplicata se já existir para atualizar o tempo
    salvas = salvas.filter(c => c.latitude !== local.latitude || c.longitude !== local.longitude);
    
    salvas.push(cidadeComTempo);
    localStorage.setItem("meuClima_comparacao", JSON.stringify(salvas));
    atualizarVisibilidadeBotaoLimpar();
}

function carregarMemoriaComFiltro() {
    let salvas = JSON.parse(localStorage.getItem("meuClima_comparacao")) || [];
    const agora = new Date().getTime();
    
    // FILTRAGEM: Mantém apenas o que foi buscado há menos de 1 hora
    const validas = salvas.filter(cidade => {
        return (agora - cidade.timestamp) < EXPIRATION_TIME;
    });

    // Atualiza o storage apenas com as válidas
    localStorage.setItem("meuClima_comparacao", JSON.stringify(validas));
    
    validas.forEach(local => adicionarCardAoGrid(local));
    atualizarVisibilidadeBotaoLimpar();
}

function removerDaMemoria(latitude, longitude, elementoCard) {
    let salvas = JSON.parse(localStorage.getItem("meuClima_comparacao")) || [];
    salvas = salvas.filter(c => c.latitude !== latitude || c.longitude !== longitude);
    localStorage.setItem("meuClima_comparacao", JSON.stringify(salvas));
    elementoCard.remove();
    atualizarVisibilidadeBotaoLimpar();
}

function limparTodaMemoria() {
    localStorage.removeItem("meuClima_comparacao");
    document.getElementById("weather-container").innerHTML = "";
    atualizarVisibilidadeBotaoLimpar();
}

function atualizarVisibilidadeBotaoLimpar() {
    const btn = document.getElementById("btnLimparTudo");
    const salvas = JSON.parse(localStorage.getItem("meuClima_comparacao")) || [];
    btn.style.display = salvas.length > 0 ? "inline-block" : "none";
}

async function adicionarCardAoGrid(local) {
    const container = document.getElementById("weather-container");
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current_weather=true`);
        const clm = await res.json();
        const data = clm.current_weather;
        const config = weatherConfig[data.weathercode] || { label: "Estável", icon: "🌤️", color: "#00d2ff" };
        const emojiEstado = data.is_day === 1 ? "☀️" : "🌙";

        const card = document.createElement('div');
        card.className = 'weather-box';
        card.style.borderTop = `5px solid ${config.color}`;

        card.innerHTML = `
            <button class="btn-fechar" onclick="removerDaMemoria(${local.latitude}, ${local.longitude}, this.parentElement)">✕</button>
            <h2 style="margin: 0;">${local.name}</h2>
            <small style="color: #a8a8b3;">${local.admin1 || local.country}</small>
            <div style="font-size: 1.8rem; margin: 15px 0;">${emojiEstado}</div>
            <div class="temp-grande" style="color: ${config.color}">${Math.round(data.temperature)}°C</div>
            <p style="font-weight: bold;">${config.label} ${config.icon}</p>
        `;

        container.appendChild(card);
    } catch (e) { console.error("Erro ao carregar card."); }
}