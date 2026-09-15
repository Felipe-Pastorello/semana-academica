import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/servidor.js';

describe('Fatia 1 — Consulta de Salas e Atividades', () => {
  let servidor;

  before(async () => {
    servidor = await criarServidor();
  });

  after(async () => {
    await servidor.fechar();
  });

  test('recusa GET /salas sem cabeçalho X-Usuario', async () => {
    const resposta = await fetch(`${servidor.url}/salas`);
    assert.equal(resposta.status, 401);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'USUARIO_DESCONHECIDO');
  });

  test('retorna 200 OK e a lista de salas em GET /salas com usuario valido', async () => {
    const resposta = await fetch(`${servidor.url}/salas`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(resposta.status, 200);
    const corpo = await resposta.json();
    assert.deepEqual(corpo, [
      { id: 'auditorio', nome: 'Auditório Central', capacidade: 200 },
      { id: 'sala-101', nome: 'Sala 101', capacidade: 40 },
      { id: 'sala-102', nome: 'Sala 102', capacidade: 40 },
      { id: 'lab-3', nome: 'Laboratório 3', capacidade: 20 }
    ]);
  });

  test('retorna 200 OK e array de atividades em GET /atividades com usuario valido', async () => {
    const resposta = await fetch(`${servidor.url}/atividades`, {
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resposta.status, 200);
    const corpo = await resposta.json();
    assert.ok(Array.isArray(corpo));
  });
});
