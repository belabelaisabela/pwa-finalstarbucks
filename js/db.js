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
                    <p>STARBUCKS</p>
                    <p>${localizacao.titulo}</p>
                    <p>${localizacao.pais}</p>
                    <p>${localizacao.endereco}</p>
                    <p>${localizacao.latitudee}</p>
                    <p>${localizacao.longitudee}</p>
                   </div>`;
        });
        listagem(divLista.join(' '));
    }
}

async function adicionarLocalizacao() {
    let titulo = document.getElementById("titulo").value;
    let pais = document.getElementById("pais").value;
    let endereco = document.getElementById("endereco").value;
    let latitudee = document.getElementById("latitudee").value;
    let longitudee = document.getElementById("longitudee").value;
    const tx = await db.transaction('localizacao', 'readwrite')
    const store = tx.objectStore('localizacao');
    try {
        await store.add({ titulo: titulo, pais: pais, endereco: endereco, latitudee: latitudee, longitudee: longitudee });
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

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}