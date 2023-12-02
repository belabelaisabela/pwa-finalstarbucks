import { openDB } from "idb";

let db;
async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('localizacao', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarLocalizacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasLocalizacoes);
    document.getElementById('btnRemover').addEventListener('click', removerLocalizacao);
    document.getElementById('btnBuscar').addEventListener('click', buscarLocalizacao);
});

async function buscarTodasLocalizacoes(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('localizacao', 'readonly');
    const store = await tx.objectStore('localizacao');
    const localizacoes = await store.getAll();
    if(localizacoes){
        const divLista = localizacoes.map(localizacao => {
            return `<div class="item">
                    <p>Anotação</p>
                    <p>${localizacao.titulo} - ${localizacao.data} </p>
                    <p>${localizacao.pais}</p>
                    <p>${localizacao.descricao}</p>
                    <p>${localizacao.latitude}</p>
                    <p>${localizacao.longitude}</p>
                   </div>`;
        });
        listagem(divLista.join(' '));
    }
}

async function adicionarLocalizacao() {
    let titulo = document.getElementById("titulo").value;
    let pais = document.getElementById("pais").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;
    let latitude = document.getElementById("latitude").value;
    let longitude = document.getElementById("longitude").value;
    const tx = await db.transaction('localizacao', 'readwrite')
    const store = tx.objectStore('localizacao');
    try {
        await store.add({ titulo: titulo, pais: pais, descricao: descricao, data: data, latitude: latitude, longitude: longitude });
        await tx.done;
        limparCampos();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}


async function removerLocalizacao() {
    const tituloRemover = prompt('Qual localizacao deseja excluir:');
    if (!tituloRemover) {
        console.log('Remoção cancelada.');
        return;
    }
    const tx = await db.transaction('localizacao', 'readwrite');
    const store = tx.objectStore('localizacao');
    try {
        await store.delete(tituloRemover);
        await tx.done;
        console.log('Localização excluída com sucesso!');
        buscarTodasLocalizacoes();
    } catch (error) {
        console.error('Erro ao excluir localizacao.', error);
        tx.abort();
    }
}

async function buscarLocalizacao() {
    let busca = document.getElementById("busca").value;
    const tx = await db.transaction('localizacao', 'readonly');
    const store = tx.objectStore('localizacao');
    const index = store.index(titulo);
    const localizacoes = await index.getAll(IDBKeyRange.only(busca));
    if (localizacoes.length > 0) {
        const divLista = localizacoes.map(localizacao => {
            return `<div class="item">
            <p>Starbucks</p>
            <p>Título: ${localizacao.titulo}</p>
            <p>Descrição: ${localizacao.pais}</p>
            <p>Descrição: ${localizacao.descricao}</p>
            <p>Data de cadastro: ${localizacao.data}</p>
            <p>Data de cadastro: ${localizacao.latitude}</p>
            <p>Data de cadastro: ${localizacao.longitude}</p>
            </div>`;
        });
        listagem(divLista.join(''));
    } else {
        listagem(`<p>Nenhuma localização encontrada com esse nome.</p>`);
    }
}


function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}