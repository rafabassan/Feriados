
const campoAno = document.getElementById("ano");
const botao = document.getElementById("consultar");
const mensagem = document.getElementById("mensagem");
const total = document.getElementById("total");
const tabela = document.getElementById("lista-feriados");
const proximo = document.getElementById("proximo");

// Preenche o campo com o ano atual
campoAno.value = new Date().getFullYear();

// Eventos do botão e da tecla Enter
botao.addEventListener("click", consultarFeriados);

campoAno.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        consultarFeriados();
    }
});

function consultarFeriados() {
    const ano = Number(campoAno.value);

    mensagem.textContent = "";
    mensagem.className = "";
    total.textContent = "";
    tabela.innerHTML = "";
    proximo.style.display = "none";

    // Valida o ano digitado
    if (
        !campoAno.value.trim() ||
        !Number.isInteger(ano) ||
        ano < 1 ||
        ano > 9999
    ) {
        mensagem.textContent = "Digite um ano válido.";
        mensagem.className = "erro";
        return;
    }

    mensagem.textContent = "Consultando feriados...";

    // Consulta a API
    fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Não foi possível consultar esse ano.");
            }

            return response.json();
        })
        .then(function(feriados) {
            if (!Array.isArray(feriados)) {
                throw new Error("A resposta da API é inválida.");
            }

            mensagem.textContent = "";

            // Mostra a quantidade de feriados
            total.textContent = `Total de feriados: ${feriados.length}`;

            // Organiza os feriados por data
            feriados.sort(function(a, b) {
                return a.date.localeCompare(b.date);
            });

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            let proximoFeriado = null;

            // Percorre todos os feriados
            feriados.forEach(function(feriado) {
                // Converte a data evitando problemas de fuso horário
                const data = new Date(feriado.date + "T12:00:00");

                const dataBR = data.toLocaleDateString("pt-BR");

                const diaSemana = data.toLocaleDateString(
                    "pt-BR",
                    { weekday: "long" }
                );

                // Cria uma linha para a tabela
                const linha = document.createElement("tr");

                // Verifica se é sábado ou domingo
                if (
                    data.getDay() === 0 ||
                    data.getDay() === 6
                ) {
                    linha.classList.add("fim-de-semana");
                }

                // Cria as células
                const colunaData = document.createElement("td");
                colunaData.textContent = dataBR;

                const colunaDia = document.createElement("td");
                colunaDia.textContent = diaSemana;

                const colunaNome = document.createElement("td");
                colunaNome.textContent = feriado.name;

                linha.appendChild(colunaData);
                linha.appendChild(colunaDia);
                linha.appendChild(colunaNome);

                tabela.appendChild(linha);

                // Identifica o próximo feriado
                const dataComparacao = new Date(
                    feriado.date + "T00:00:00"
                );

                if (
                    !proximoFeriado &&
                    dataComparacao >= hoje
                ) {
                    proximoFeriado = {
                        nome: feriado.name,
                        data: dataComparacao,
                        dataBR: dataBR
                    };
                }
            });

            // Exibe o próximo feriado
            if (proximoFeriado) {
                const hojeUTC = Date.UTC(
                    hoje.getFullYear(),
                    hoje.getMonth(),
                    hoje.getDate()
                );

                const feriadoUTC = Date.UTC(
                    proximoFeriado.data.getFullYear(),
                    proximoFeriado.data.getMonth(),
                    proximoFeriado.data.getDate()
                );

                const diasFaltando = Math.round(
                    (feriadoUTC - hojeUTC) / 86400000
                );

                proximo.innerHTML = "";

                const titulo = document.createElement("strong");
                titulo.textContent = "Próximo feriado: ";

                const detalhe = document.createElement("span");

                detalhe.textContent =
                    `${proximoFeriado.nome} — ${proximoFeriado.dataBR} — ` +
                    (diasFaltando === 0
                        ? "É hoje!"
                        : `faltam ${diasFaltando} dia(s).`);

                proximo.appendChild(titulo);
                proximo.appendChild(detalhe);
                proximo.style.display = "block";
            } else {
                proximo.textContent =
                    "Não há mais feriados neste ano a partir de hoje.";

                proximo.style.display = "block";
            }

            if (feriados.length === 0) {
                mensagem.textContent =
                    "Nenhum feriado encontrado para esse ano.";
            }
        })
        .catch(function(erro) {
            mensagem.textContent =
                "Erro: " + erro.message +
                " Verifique o ano e tente novamente.";

            mensagem.className = "erro";
            total.textContent = "";
            tabela.innerHTML = "";
            proximo.style.display = "none";
        });
}

// Consulta automaticamente ao abrir a página
consultarFeriados();
