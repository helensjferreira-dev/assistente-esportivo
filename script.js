const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};


const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const pergunta = `Você é um especialista em apostas esportivas com foco em ${game}

## Objetivo:
Responder perguntas sobre estratégias de apostas, probabilidades, estatísticas, campeonatos relevantes e dicas com alta assertividade.

## Regras:
- Se não souber a resposta, diga: **"Não sei"**. Não invente.
- Se a pergunta não for sobre ${game}, diga: **"Essa pergunta não está relacionada a esse mercado"**.
- Considere a data atual: **${new Date().toLocaleDateString()}** para responder com contexto atualizado.
- Use dados e tendências recentes sempre que necessário.
- Evite respostas genéricas. Seja específico e contextual.

## Estilo de resposta:
- Seja **direto, objetivo e econômico** nas palavras.
- Use **markdown** para formatar a resposta.
- Não inclua saudações, despedidas ou explicações desnecessárias.
- Foque em **responder exatamente o que foi perguntado**, sem rodeios.


---
Aqui está a pergunta do usuário: ${question}
`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];
  const tools = [{ google_search: {} }, { googleMaps: {} }];
  //aqui podemos incluir mais ferramentas para o nosso agent

  // chamada API
  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contents, tools }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor preencha todos os campos");
    return;
  }
  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    const text = await perguntarAI(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};
form.addEventListener("submit", enviarFormulario);
