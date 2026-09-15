import http from 'node:http';

const USUARIOS_VALIDOS = new Set([
  'org-ana', 'org-bruno', 'p-carla', 'p-diego', 'p-elisa',
  'p-fabio', 'p-gabriela', 'p-heitor', 'p-isadora', 'p-joao'
]);

const SALAS = [
  { id: 'auditorio', nome: 'Auditório Central', capacidade: 200 },
  { id: 'sala-101', nome: 'Sala 101', capacidade: 40 },
  { id: 'sala-102', nome: 'Sala 102', capacidade: 40 },
  { id: 'lab-3', nome: 'Laboratório 3', capacidade: 20 }
];

let atividades = [];

export function tratarRequisicao(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname === '/_teste/reset' && req.method === 'POST') {
    atividades = [];
    res.writeHead(204);
    res.end();
    return;
  }

  if (!pathname.startsWith('/_teste/')) {
    const usuario = req.headers['x-usuario'];
    if (!usuario || !USUARIOS_VALIDOS.has(usuario)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Usuário não fornecido ou inválido' }));
      return;
    }
  }

  if (req.method === 'GET' && pathname === '/salas') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(SALAS));
    return;
  }

  if (req.method === 'GET' && pathname === '/atividades') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(atividades));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erro: 'NAO_ENCONTRADO', mensagem: 'Rota não encontrada' }));
}

export async function criarServidor(opcoes = {}) {
  const modoTeste = opcoes.modoTeste ?? process.env.MODO_TESTE ?? '1';
  process.env.MODO_TESTE = modoTeste;

  const server = http.createServer(tratarRequisicao);
  await new Promise((resolve) => server.listen(0, resolve));
  const porta = server.address().port;
  return {
    url: `http://localhost:${porta}`,
    fechar: () => new Promise((resolve) => server.close(resolve))
  };
}
