
export const PROMPT_WHITE_BACKGROUND = "Uma foto de estúdio profissional e ultrarrealista do produto em um fundo perfeitamente branco e infinito (ciclorama). A iluminação deve ser suave, difusa e uniforme, vinda de múltiplos ângulos para eliminar sombras fortes e destacar os detalhes e texturas do produto. Foco nítido em todo o produto. Sem adereços ou distrações.";

export const PROMPT_DIFFERENT_ANGLES = "Uma foto ultrarrealista do produto em um fundo cinza claro, neutro e suavemente desfocado. O produto deve ser exibido em um ângulo de 45 graus, mostrando a frente e a lateral para dar uma clara noção de sua profundidade e forma tridimensional. A iluminação deve acentuar os contornos do produto.";

export const PROMPT_TECHNICAL_INFO = "Crie uma imagem de estilo infográfico, limpa e moderna. O produto deve estar posicionado de forma proeminente contra um fundo minimalista e de cor sólida. Adicione 2 a 3 setas finas e elegantes, com linhas de chamada, apontando para características técnicas ou materiais importantes do produto. Ao final de cada linha de chamada, inclua um texto de placeholder claro e legível, como '[Descrever Característica Chave Aqui]'. O design geral deve ser informativo, profissional e visualmente agradável.";

export const PROMPT_MEASUREMENT_TABLE = "Crie uma imagem de produto com layout dividido. No lado esquerdo, posicione o produto fotografado de frente, de forma clara, contra um fundo neutro. No lado direito, insira uma tabela de medidas (dimensões) com design limpo e minimalista. A tabela deve ter um título claro, como 'Dimensões do Produto', e colunas para 'Medida' e 'Valor (cm)'. Preencha a tabela com 3 linhas de placeholder, como 'Altura', 'Largura' e 'Profundidade', deixando os valores em branco ou com 'XX cm'.";

export const SCENE_GENERATION_PROMPT_TEMPLATE = (productDescription: string, productCategory: string): string => {
    const descriptionContext = `Descrição Textual do Produto (contexto): ${productDescription}`;

    const categoryContext = productCategory
        ? `Categoria do Produto: ${productCategory}`
        : "Nenhuma categoria foi fornecida.";

    return `
**Objetivo**
Você é um diretor de arte e fotógrafo de e-commerce de elite. Sua missão é analisar a imagem de um produto e criar 5 propostas de cenas fotográficas completas e profissionais para gerar imagens com IA.

${descriptionContext}
${categoryContext}

**Regras Essenciais**
1.  **Análise de Texto na Imagem (CRÍTICO):** Antes de tudo, analise a imagem para extrair CUIDADOSAMENTE todo e qualquer texto visível na embalagem, rótulo ou no próprio produto. Estes textos (nomes de marca, slogans, ingredientes, especificações) são essenciais e DEVEM ser integrados de forma natural e precisa no \`detailedPrompt\`.
2.  **Estrutura de Saída:** Sua resposta DEVE ser um objeto JSON com uma chave "scenes", contendo um array de 5 objetos.
3.  **Formato do Objeto de Cena:** Cada objeto no array "scenes" deve ter duas chaves:
    -   \`"summary"\`: Uma string curta (máximo 10 palavras). É um título evocativo e conciso da cena, para ser exibido ao usuário em uma lista de opções. Ex: "Cena de café da manhã aconchegante na cozinha."
    -   \`"detailedPrompt"\`: Uma string longa e extremamente detalhada. Este é o prompt que será usado por outra IA para gerar a imagem. Deve ser uma descrição visual completa, como se estivesse instruindo um fotógrafo profissional. Inclua detalhes sobre:
        -   **Contexto e Ambiente:** Onde o produto está? (ex: em uma mesa de madeira rústica, em um balcão de mármore minimalista, em uma mochila aberta em uma trilha).
        -   **Composição:** Onde o produto está posicionado na cena? (ex: em primeiro plano, ligeiramente fora do centro, ao lado de outros objetos relevantes). Descreva o enquadramento e o ângulo da câmera (ex: close-up, vista de cima, ângulo baixo).
        -   **Iluminação:** Descreva a luz em detalhes (ex: luz natural suave vinda de uma janela à esquerda, luz dourada do final da tarde, iluminação de estúdio brilhante e difusa).
        -   **Adereços e Elementos de Apoio:** Quais outros objetos estão na cena para criar uma história e contexto? (ex: xícaras de café fumegantes, um laptop aberto, folhas de outono espalhadas, ingredientes frescos). Devem complementar, não ofuscar o produto.
        -   **Atmosfera e Emoção (Mood):** Qual sentimento a imagem deve evocar? (ex: aconchegante e relaxante, produtivo e moderno, aventureiro e energético, luxuoso e sofisticado).
        -   **Texto do Produto (Extraído da Imagem):** Incorpore os textos que você extraiu da embalagem/rótulo de forma que a IA de imagem saiba que eles precisam estar visíveis e legíveis no produto final.
4.  **Fidelidade ao Produto:** Todas as cenas devem ser projetadas para destacar o produto original, mantendo 100% de fidelidade à sua forma, cor, texturas e logos, incluindo os textos extraídos. O produto é a estrela.
5.  **Foco no Benefício:** As cenas devem sutilmente comunicar o valor e o benefício do produto em uso, conectando-se com o estilo de vida do cliente.

**Exemplo de um objeto de cena no array:**
{
  "summary": "Garrafa de vinho em uma adega sofisticada.",
  "detailedPrompt": "Foto de uma garrafa de vinho tinto 'Vinho Fictício safra 2022' (texto extraído do rótulo) em uma adega rústica de pedra. A garrafa está em pé sobre um barril de carvalho, com iluminação dramática vinda de cima que realça o brilho do vidro e a textura do rótulo. Ao fundo, prateleiras de madeira com outras garrafas estão suavemente desfocadas. Há um saca-rolhas de prata e duas taças de cristal vazias ao lado da garrafa, sugerindo uma degustação iminente. A atmosfera é de luxo, tradição e exclusividade. A câmera está em um ângulo baixo, fazendo a garrafa parecer imponente."
}
`;
}


export const IMAGE_GENERATION_PROMPT_TEMPLATE = (scenePrompt: string): string => {
    return `Instrução:
Incorpore o produto da imagem original na seguinte cena:
"${scenePrompt}".

Regras Obrigatórias:
- O produto deve ser inserido EXATAMENTE como está na imagem original: Mesma forma, cor, texturas, logos, textos, proporções e detalhes visíveis.
- Nenhum ajuste, invenção ou modificação é permitido. É CRUCIAL que o produto seja idêntico ao original.
- Apenas posicione o produto de forma realista dentro da cena descrita.
- Toda a iluminação, ângulos e contexto devem se adaptar para valorizar o produto, nunca o contrário.
- O produto deve ser o protagonista absoluto da imagem, integrado ao ambiente, sem perder destaque.
- A cena deve parecer uma fotografia realista em alta definição, nunca ilustração, CGI ou desenho.
- Se houver conflito entre a cena e a fidelidade ao produto, a fidelidade ao produto é a PRIORIDADE absoluta.

Qualidade Técnica Fixa (obrigatória no final do prompt):
Ultra-realistic raw photo in 8K, shot with a Nikon D850 and NIKKOR 85mm f/1.4 lens. ISO 100, shutter speed 1/200, aperture f/2.2 for natural bokeh. Professional sharpness, subtle analog film grain. True-to-life colors, natural textures, visible imperfections. Soft natural daylight. No illustration, no CGI, no digital art, no painting, no artificial look. Image ratio always 1:1.`;
}

export const TITLE_GENERATION_PROMPT_TEMPLATE = (currentTitle: string, brand: string, model: string, characteristics: string): string => `
**Tarefa:** Você é um especialista em SEO para e-commerce, focado em otimização de títulos de produtos para o Mercado Livre e Shopee.

**Contexto do Produto:**
- Título Atual: "${currentTitle}"
- Marca: "${brand}"
- Modelo: "${model}"
- Características Principais: "${characteristics}"

**Sua Missão:**
1.  **Análise de Palavras-chave (Passo Crítico):** Com base no seu vasto conhecimento sobre tendências de busca no Google e no Mercado Livre, identifique os termos mais buscados, sinônimos populares e palavras-chave de cauda longa que os consumidores usam para encontrar produtos como este.
2.  **Criação de Títulos Otimizados:** Com base na sua análise e nas informações do produto, crie dois conjuntos de títulos:
    -   **Para o Mercado Livre:** 5 títulos únicos e altamente otimizados. CADA TÍTULO DEVE TER NO MÁXIMO 60 CARACTERES. Eles devem ser diretos, claros e conter as palavras-chave mais importantes no início.
    -   **Para a Shopee:** 5 títulos únicos e otimizados. CADA TÍTULO DEVE TER NO MÁXIMO 100 CARACTERES. Eles podem ser mais descritivos, incluindo mais características e benefícios, aproveitando o espaço extra.
3.  **Formato de Saída (OBRIGATÓRIO):** Sua resposta deve ser ESTRITAMENTE um objeto JSON válido, sem nenhum texto, explicação ou formatação markdown antes ou depois. O objeto JSON deve ter a seguinte estrutura:
    {
      "mercadoLivre": ["titulo1", "titulo2", "titulo3", "titulo4", "titulo5"],
      "shopee": ["titulo1", "titulo2", "titulo3", "titulo4", "titulo5"]
    }

**Exemplo de Saída Esperada (apenas para ilustração da estrutura):**
{
  "mercadoLivre": [
    "Fone Bluetooth XYZ Pro Cancelamento Ruído Original NF",
    "Headset Gamer XYZ Pro Sem Fio P/ PS5 PC Xbox Lacrado"
  ],
  "shopee": [
    "Fone de Ouvido Bluetooth XYZ Pro Gamer com Cancelamento de Ruído Ativo, Microfone e Bateria de Longa Duração",
    "Headset Sem Fio Original XYZ Pro, Áudio de Alta Resolução, Confortável para Jogos e Trabalho - Com Nota Fiscal"
  ]
}

Comece a gerar o JSON agora.
`;

export const DESCRIPTION_GENERATION_PROMPT_TEMPLATE = (productTitle: string, modelDescription: string): string => `
**Tarefa:** Você é um copywriter sênior especialista em e-commerce, com profundo conhecimento em SEO e técnicas de escrita persuasiva.

**Contexto do Produto:**
- Título do Produto: "${productTitle}"
- Descrição Base/Modelo: "${modelDescription}"

**Sua Missão:**
1.  **Pesquisa de Palavras-chave (Passo Crítico):** Usando sua ferramenta de busca, pesquise intensivamente no Google Trends e nas Tendências do Mercado Livre (tendencias.mercadolivre.com.br) para identificar os termos de busca mais relevantes, populares e de cauda longa para este produto.
2.  **Criação da Descrição Otimizada:** Crie uma descrição de produto completa, persuasiva e com excelente formatação, seguindo a estrutura e as regras abaixo.

**Estrutura e Regras Obrigatórias de Formatação:**
1.  **Linha de Keywords (Primeira Parte):** A descrição DEVE começar com uma linha contendo pelo menos 20 das palavras-chave mais importantes que você encontrou. As palavras devem ser separadas por vírgula e apresentadas em uma única linha contínua. Exemplo: "palavra1, palavra2, palavra3, termo de busca 4, sinônimo 5, ..."
2.  **Corpo da Descrição (Segunda Parte):** Após a linha de keywords, desenvolva o texto com as seguintes seções, usando parágrafos curtos e quebras de linha para garantir a legibilidade.
    -   **Apresentação Cativante:** Inicie com um parágrafo que apresenta o produto, capturando a atenção do leitor e conectando-se com suas necessidades ou desejos.
    -   **Diferenciais e Benefícios (Ficha Técnica):** Crie uma lista clara com 3 a 5 características principais do produto, traduzindo cada uma em um benefício direto para o cliente.
        -   **Formato OBRIGATÓRIO:** Use hífens para cada item e coloque CADA item em UMA NOVA LINHA, sem exceções.
        -   **Exemplo de Formato:**
            - Material Premium X: Garante durabilidade e um toque sofisticado.
            - Bateria de Longa Duração: Use por até 20 horas sem se preocupar em recarregar.
    -   **Quebra de Objeções:** Antecipe e responda a 2-3 dúvidas comuns.
        -   **Formato OBRIGATÓRIO:** Formate como Pergunta e Resposta. Coloque a PERGUNTA em uma linha, dê um ENTER, e coloque a RESPOSTA na linha seguinte. Deixe uma linha em branco entre cada par de Pergunta/Resposta.
        -   **Exemplo de Formato:**
            É compatível com meu aparelho?
            Sim, nosso produto oferece compatibilidade universal com sistemas iOS, Android e Windows.

            Qual a garantia do produto?
            Oferecemos uma garantia completa de 12 meses contra defeitos de fabricação.
    -   **Gatilhos de Urgência/Escassez:** Crie um senso de urgência sutil (ex: "Estoque limitado", "Oferta por tempo limitado").
    -   **Chamada para Ação (Call to Action - CTA):** Conclua com uma chamada para ação clara e direta (ex: "Garanta já o seu!", "Clique em 'Comprar agora' e transforme sua experiência!").
3.  **Restrições Gerais de Formato:**
    -   **NÃO use emojis.**
    -   **NÃO use formatação HTML (como <b>, <strong>, <ul>, <li>).** Use apenas texto plano com quebras de linha.
    -   A linguagem deve ser persuasiva, clara e direta.
    -   A resposta final deve ser apenas o texto da descrição, sem nenhum texto ou explicação adicional.
`;

export const VIDEO_SCENE_GENERATION_PROMPT_TEMPLATE = (productTitle: string, productDescription: string): string => `
**Tarefa:** Você é um roteirista de marketing e diretor de vídeos curtos para e-commerce, especialista em criar conteúdo viral para Reels e TikTok.

**Contexto do Produto:**
- Título: "${productTitle}"
- Descrição: "${productDescription}"
- Imagens de Referência: [As imagens serão fornecidas pela API, analise-as visualmente]

**Sua Missão:**
Criar um roteiro detalhado para um vídeo, dividido em 6 cenas de 8 segundos cada. O objetivo é guiar uma IA de geração de vídeo (como VEO) para criar 6 clipes de vídeo curtos, persuasivos e independentes. A narração e textos devem ser em português do Brasil.

**Estrutura do Roteiro (6 Cenas Obrigatórias):**
1.  **Cena 1 - A Dor:** Apresente um problema ou frustração comum que o produto resolve. Crie empatia.
2.  **Cena 2 - A Solução:** Apresente o produto de forma impactante como a solução definitiva para a dor.
3.  **Cena 3 - Os Benefícios:** Mostre os 2 ou 3 principais pontos positivos do produto em ação. Foque nos resultados.
4.  **Cena 4 - Prova Social:** Simule um depoimento rápido e positivo. Pode ser uma cena que sugira aprovação do cliente.
5.  **Cena 5 - Quebra de Objeções:** Aborde uma dúvida comum sobre o produto e responda-a de forma clara e visual.
6.  **Cena 6 - CTA com Urgência:** Crie uma chamada para ação forte com um gatilho de urgência (estoque limitado, oferta especial).

**Formato de Saída (OBRIGATÓRIO):**
Sua resposta deve ser ESTRITAMENTE um objeto JSON válido, sem nenhum texto, explicação ou formatação markdown antes ou depois. O objeto JSON deve ser um array contendo 6 objetos, cada um representando uma cena. Cada objeto de cena deve ter a seguinte estrutura:
{
  "title": "Cena X - [Nome da Cena]",
  "prompt": "Um prompt de texto extremamente detalhado para a IA de vídeo. Descreva a ação, o ambiente, o ângulo da câmera e o estilo visual. Seja cinematográfico. IMPORTANTE: O vídeo NÃO deve conter nenhum texto, legenda ou sobreposição gráfica na tela."
}

**Exemplo de Objeto de Cena:**
{
  "title": "Cena 2 - Apresentando o Produto",
  "prompt": "Close-up extremo do produto [NOME DO PRODUTO] emergindo lentamente de uma sombra para uma luz brilhante e limpa. A câmera gira 360 graus em câmera lenta, revelando cada detalhe e textura. Fundo minimalista e profissional. Música inspiradora começa a crescer em volume."
}

Comece a gerar o array JSON agora.
`;