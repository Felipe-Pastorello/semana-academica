import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/servidor.js';

describe('Fatia 1 — Inscrições', () => {
  let servidor;

  before(async () => {
    servidor = await criarServidor();
  });

  after(async () => {
    await servidor.fechar();
  });

  beforeEach(async () => {
    await fetch(`${servidor.url}/_teste/reset`, { method: 'POST' });
  });

  test('(R1) POST /atividades/:id/inscricoes por um usuário organização → 403 SOMENTE_PARTICIPANTE', async () => {
    const resposta = await fetch(`${servidor.url}/atividades/123/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' },
      body: JSON.stringify({})
    });
    assert.equal(resposta.status, 403);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'SOMENTE_PARTICIPANTE');
  });

  test('(R2) POST /atividades/:id/inscricoes com vagas disponíveis → 201 Created e status confirmada', async () => {
    // Inserir atividade de teste via rota de teste ou manipulando se houver suporte
    // Como a api de atividades é da M1, vamos ver como injetar atividades
    const resAtiv = await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'ativ-1', capacidade: 2, status: 'aberta' })
    });
    
    const resposta = await fetch(`${servidor.url}/atividades/ativ-1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resposta.status, 201);
    const corpo = await resposta.json();
    assert.equal(corpo.status, 'confirmada');
  });

  test('(R2) POST /atividades/:id/inscricoes com vagas esgotadas → 201 Created e status em_espera', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'ativ-2', capacidade: 1, status: 'aberta' })
    });
    
    // 1ª inscrição ocupa a vaga
    await fetch(`${servidor.url}/atividades/ativ-2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    // 2ª inscrição vai para a lista de espera
    const resposta = await fetch(`${servidor.url}/atividades/ativ-2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-diego' }
    });
    assert.equal(resposta.status, 201);
    const corpo = await resposta.json();
    assert.equal(corpo.status, 'em_espera');
  });

  test('(R3) POST /atividades/:id/inscricoes com atividade cancelada → 422 ATIVIDADE_CANCELADA', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'ativ-3', capacidade: 10, status: 'cancelada' })
    });

    const resposta = await fetch(`${servidor.url}/atividades/ativ-3/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resposta.status, 422);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'ATIVIDADE_CANCELADA');
  });

  test('(R3) POST /atividades/:id/inscricoes após o encerramento → 422 INSCRICOES_ENCERRADAS', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'ativ-4', capacidade: 10, status: 'encerrada' })
    });

    const resposta = await fetch(`${servidor.url}/atividades/ativ-4/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resposta.status, 422);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'INSCRICOES_ENCERRADAS');
  });

  test('(R3) POST /atividades/:id/inscricoes já estando inscrito → 422 JA_INSCRITO', async () => {
    await fetch(`${servidor.url}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'ativ-5', capacidade: 10, status: 'aberta' })
    });

    await fetch(`${servidor.url}/atividades/ativ-5/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    const resposta = await fetch(`${servidor.url}/atividades/ativ-5/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resposta.status, 422);
    const corpo = await resposta.json();
    assert.equal(corpo.erro, 'JA_INSCRITO');
  });

});
