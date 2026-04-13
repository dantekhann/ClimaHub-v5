const weatherConfig = {
    0: { label: "Céu Limpo", icon: "☀️", color: "#00d2ff" },
    1: { label: "Quase Limpo", icon: "🌤️", color: "#00d2ff" },
    2: { label: "Parcialmente Nublado", icon: "⛅", color: "#00d2ff" },
    3: { label: "Nublado", icon: "☁️", color: "#00d2ff" },
    45: { label: "Névoa", icon: "🌫️", color: "#a8a8b3" },
    61: { label: "Chuva Fraca", icon: "🌧️", color: "#00d2ff" },
    80: { label: "Pancadas", icon: "🌦️", color: "#00d2ff" },
};

document.getElementById("cidadeInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        buscarClimaReal();
    }
});

async function buscarClimaReal() {
    const input = document.getElementById("cidadeInput");
    const notificacao = document.getElementById("notificacao-container");
    const btn = document.getElementById("btnVerificar");

    // Limpeza Regex: Permite letras, números, espaços e hífens. Remove emojis/símbolos.
    let busca = input.value
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, " ");

    if (!busca) return;

    btn.disabled = true;
    notificacao.innerHTML = `<p style="color: #a8a8b3">Procurando localidade...</p>`;

    try {
        let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca)}&count=10&language=pt&format=json`;
        let geoRes = await fetch(geoUrl);
        let geoData = await geoRes.json();

        // Fallback para nomes compostos com hífen
        if ((!geoData.results || geoData.results.length === 0) && busca.includes("-")) {
            const resAlt = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca.replace(/-/g, " "))}&count=10&language=pt&format=json`);
            geoData = await resAlt.json();
        }

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`"${busca}" não encontrado.`);
        }

        // SEMPRE exibe a lista se houver múltiplos resultados para garantir a escolha correta
        if (geoData.results.length > 1) {
            notificacao.innerHTML = '<p style="font-size:0.85rem; color:#a8a8b3; margin-bottom:12px;">Vários locais encontrados. Clique para adicionar:</p>';
            const lista = document.createElement("div");
            lista.className = "lista-selecao";

            geoData.results.forEach((local) => {
                const item = document.createElement("div");
                item.className = "item-local";
                item.innerHTML = `<strong>${local.name}</strong> <small style="color:#666">(${local.admin1 || ""} - ${local.country})</small>`;
                item.onclick = () => {
                    adicionarCardComparacao(local);
                    notificacao.innerHTML = "";
                    input.value = "";
                };
                lista.appendChild(item);
            });
            notificacao.appendChild(lista);
        } else {
            adicionarCardComparacao(geoData.results[0]);
            notificacao.innerHTML = "";
            input.value = "";
        }
    } catch (erro) {
        notificacao.innerHTML = `<p style="color: #ff5555; padding: 10px;">${erro.message}</p>`;
    } finally {
        btn.disabled = false;
    }
}

async function adicionarCardComparacao(local) {
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
            <button class="btn-fechar" title="Remover" onclick="this.parentElement.remove()">✕</button>
            <h2 style="margin: 0; font-size: 1.4rem;">${local.name}</h2>
            <small style="color: #a8a8b3;">${local.admin1 || local.country}</small>
            <div style="font-size: 1.8rem; margin: 15px 0;">${emojiEstado}</div>
            <div class="temp-grande" style="color: ${config.color}">${Math.round(data.temperature)}°C</div>
            <p style="font-weight: bold; margin: 5px 0;">${config.label} ${config.icon}</p>
            <p style="font-size: 0.8rem; color: #666; margin-top: 10px;">Vento: ${data.windspeed} km/h</p>
        `;

        container.appendChild(card);
    } catch (e) {
        console.error("Falha ao obter dados meteorológicos.");
    }
}