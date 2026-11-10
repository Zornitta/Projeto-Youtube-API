const CHAVE_API = "<SUA-CHAVE-DE-API-AQUI>";
const QUANTIDADE_VIDEOS = 12;

const canais = [
    { nome: "Unoesc", handle: "@unoescoficial" },
    { nome: "Google for Developers", handle: "@GoogleDevelopers" },
    { nome: "NASA", handle: "@NASA" }
];

const selectCanal = document.querySelector("#canal");
const areaVideos = document.querySelector("#videos");
const infoCanal = document.querySelector("#infoCanal");
const mensagem = document.querySelector("#mensagem");

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
    carregarListaCanais();
    selectCanal.addEventListener("change", carregarCanalSelecionado);
    await carregarCanalSelecionado();
}

function carregarListaCanais() {
    canais.forEach((canal, indice) => {
        const option = document.createElement("option");
        option.value = indice;
        option.textContent = canal.nome;
        selectCanal.appendChild(option);
    });
}

async function carregarCanalSelecionado() {
    areaVideos.innerHTML = "";
    infoCanal.innerHTML = "";
    mensagem.textContent = "";

    try {
        const canal = canais[selectCanal.value];
        const dadosCanal = await buscarCanal(canal.handle);
        if (!dadosCanal) {
            mensagem.textContent = "Canal não encontrado.";
            return;
        }

        infoCanal.innerHTML = `
            <h2>${dadosCanal.snippet.title}</h2>
            <p>Últimos vídeos publicados</p>
        `;

        const playlist = dadosCanal.contentDetails.relatedPlaylists.uploads;
        const videos = await buscarVideos(playlist);
        mostrarVideos(videos);
    } catch (erro) {
        console.error(erro);
        mensagem.textContent = "Erro ao acessar a API do YouTube.";
    }
}

async function buscarCanal(handle) {
    const parametros = new URLSearchParams({
        part: "snippet,contentDetails",
        forHandle: handle,
        key: CHAVE_API
    });

    const url = `https://www.googleapis.com/youtube/v3/channels?${parametros}`;
    const resposta = await fetch(url);

    if (!resposta.ok)
        throw new Error(`Erro HTTP: ${resposta.status}`);

    const dados = await resposta.json();
    return dados.items.length ? dados.items[0] : null;
}

async function buscarVideos(playlist) {
    const parametros = new URLSearchParams({
        part: "snippet",
        playlistId: playlist,
        maxResults: QUANTIDADE_VIDEOS,
        key: CHAVE_API
    });

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?${parametros}`;
    const resposta = await fetch(url);

    if (!resposta.ok)
        throw new Error(`Erro HTTP: ${resposta.status}`);

    const dados = await resposta.json();
    return dados.items;
}

function mostrarVideos(videos) {
    areaVideos.innerHTML = "";

    videos.forEach(video => {
        const titulo = video.snippet.title;
        const descricao = video.snippet.description;
        const imagem = video.snippet.thumbnails.medium.url;
        const videoId = video.snippet.resourceId.videoId;
        const data = formatarData(video.snippet.publishedAt);

        areaVideos.innerHTML += `
            <article class="video">
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                    <img src="${imagem}" alt="${titulo}">
                    <div class="video-conteudo">
                        <h3>${titulo}</h3>
                        <p>${limitarTexto(descricao, 150)}</p>
                        <span class="video-data">Publicado em ${data}</span>
                    </div>
                </a>
            </article>
        `;
    });
}

function formatarData(data) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(new Date(data));
}

function limitarTexto(texto, limite) {
    return texto.length <= limite ? texto : texto.substring(0, limite) + "...";
}

