README - Meu Clima v4: Edição Tempo Real (v2)
Este documento detalha as atualizações e a evolução técnica do projeto Meu Clima da versão 3 para a 4, focando em experiência do usuário (UX), precisão nos dados e design minimalista.

🚀 Visão Geral
A versão 4 traz um refinamento visual e funcional, focando em uma interface limpa e em informações contextuais dinâmicas. O título foi atualizado para "Previsão em Tempo Real", refletindo a natureza instantânea dos dados consumidos via API.
️
O que mudou? (v3 vs v4)
Funcionalidade Versão 3 Versão 4 (Atual)
Título Previsão Realtime Previsão em Tempo Real
Estado Temporal Estático Dinâmico (Detecção de
☀️/🌙 via API)

Posicionamento Ícone isolado Composição Visual (Sol/Lua integrado à box)
Tipografia Padrão Hierarquia Visual (Pesos maiores para temperatura)

🧠 Lógica de Implementação

1. Dinâmica Sol e Lua Integrado diretamente com a API Open-Meteo, o código agora interpreta o parâmetro is_day para fornecer contexto astronômico em tempo real.

● Lógica de Estado: O sistema identifica se na localidade pesquisada é dia ou noite, exibindo o emoji correspondente (☀️ para dia, 🌙 para noite).

● Composição Interna: O emoji de estado foi inserido diretamente dentro do card (box), posicionado logo abaixo do ícone principal da nuvem/condição, criando uma leitura unificada da situação climática.

● Ícones Adaptativos: Mesmo em condições de céu limpo, o sistema substitui
automaticamente os ícones de sol por lua durante o período noturno local.
2. Design Minimalista e Legibilidade.

● Fundo Neutro: A interface utiliza tons de cinza azulado e brancos (#f0f2f5),
eliminando distrações visuais e garantindo que os dados de temperatura sejam o ponto focal.

● Contraste Inteligente: As cores dos textos e títulos são ajustadas para garantir leitura, independentemente da luminosidade do ambiente.

● Estética Glassmorphism: O card principal utiliza efeitos de desfoque e transparência para um aspecto moderno e leve.

📂 Estrutura de Arquivos
● index.html: Estrutura semântica atualizada com o novo título.
● style.css: Estilização neutra com foco em variáveis para manutenção simplificada.
● script.js: Lógica de consumo da API Open-Meteo com a nova integração de estado
temporal.

🔧 Como Rodar o Projeto Clone este repositório: git clone https://github.com/SEU-USUARIO/meu-clima-v4.git

👤 Desenvolvido por: Paulo Dante Coelho Neto
https://github.com/dantekhann