import express from 'express';
import { SistemaEntrega } from '../services/SistemaEntrega.js';
import { Dashboard } from '../services/Dashboard.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Instância do sistema (singleton)
const sistema = new SistemaEntrega({ x: 0, y: 0 });

// ==================== ROTAS DE DRONES ====================

/**
 * GET /drones/status
 * Retorna status de todos os drones
 */
app.get('/drones/status', (req, res) => {
  try {
    const status = sistema.getStatusDrones();
    res.json({
      success: true,
      total: status.length,
      drones: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /drones/:id
 * Retorna status de um drone específico
 */
app.get('/drones/:id', (req, res) => {
  try {
    const drone = sistema.drones.find(d => d.id === req.params.id);
    if (!drone) {
      return res.status(404).json({
        success: false,
        error: 'Drone não encontrado'
      });
    }
    res.json({
      success: true,
      drone: drone.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /drones
 * Registra um novo drone
 */
app.post('/drones', (req, res) => {
  try {
    const { id, capacidadePeso, capacidadeDistancia, bateriaMaxima, velocidadeMedia } = req.body;

    if (!id || !capacidadePeso || !capacidadeDistancia) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id, capacidadePeso, capacidadeDistancia'
      });
    }

    const drone = sistema.registrarDrone(
      id,
      capacidadePeso,
      capacidadeDistancia,
      bateriaMaxima || 100,
      velocidadeMedia || 30
    );

    res.status(201).json({
      success: true,
      message: 'Drone registrado com sucesso',
      drone: drone.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROTAS DE PEDIDOS ====================

/**
 * POST /pedidos
 * Cria um novo pedido
 */
app.post('/pedidos', (req, res) => {
  try {
    const { id, localizacao, peso, prioridade, tempoChegada } = req.body;

    if (!id || !localizacao || !peso) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id, localizacao {x, y}, peso'
      });
    }

    const pedido = sistema.criarPedido(
      id,
      localizacao,
      peso,
      prioridade || 'media',
      tempoChegada || null
    );

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      pedido: pedido.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /pedidos
 * Retorna todos os pedidos
 */
app.get('/pedidos', (req, res) => {
  try {
    const pedidos = sistema.getStatusPedidos();
    res.json({
      success: true,
      total: pedidos.length,
      pedidos: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /pedidos/:id
 * Retorna um pedido específico
 */
app.get('/pedidos/:id', (req, res) => {
  try {
    const pedido = sistema.pedidos.find(p => p.id === req.params.id);
    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
    res.json({
      success: true,
      pedido: pedido.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROTAS DE ENTREGAS ====================

/**
 * GET /entregas/rota/:pedidoId
 * Calcula rota otimizada para uma entrega
 */
app.get('/entregas/rota/:pedidoId', (req, res) => {
  try {
    const rota = sistema.calcularRotaEntrega(req.params.pedidoId);
    if (!rota) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
    res.json({
      success: true,
      rota: rota
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /entregas/processar
 * Processa entregas pendentes
 */
app.post('/entregas/processar', (req, res) => {
  try {
    const { usarOtimizadorAvancado = true } = req.body;
    const resultado = sistema.processarEntregas(usarOtimizadorAvancado);
    
    res.json({
      success: true,
      resultado: resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /entregas/fila
 * Retorna informações da fila de entregas
 */
app.get('/entregas/fila', (req, res) => {
  try {
    const estatisticas = sistema.filaEntrega.getEstatisticas();
    res.json({
      success: true,
      fila: estatisticas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROTAS DE OBSTÁCULOS ====================

/**
 * POST /obstaculos
 * Adiciona um obstáculo
 */
app.post('/obstaculos', (req, res) => {
  try {
    const { id, centro, raio, tipo, raioSeguro } = req.body;

    if (!id || !centro || !raio) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id, centro {x, y}, raio'
      });
    }

    const obstaculo = sistema.adicionarObstaculo(id, centro, raio, tipo, raioSeguro);

    res.status(201).json({
      success: true,
      message: 'Obstáculo adicionado com sucesso',
      obstaculo: obstaculo.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /obstaculos
 * Retorna todos os obstáculos
 */
app.get('/obstaculos', (req, res) => {
  try {
    const obstaculos = sistema.getStatusObstaculos();
    res.json({
      success: true,
      total: obstaculos.length,
      obstaculos: obstaculos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROTAS DE ESTATÍSTICAS ====================

/**
 * GET /estatisticas
 * Retorna estatísticas gerais do sistema
 */
app.get('/estatisticas', (req, res) => {
  try {
    const stats = sistema.getEstatisticas();
    res.json({
      success: true,
      estatisticas: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROTAS DE SIMULAÇÃO ====================

/**
 * POST /simulacao/iniciar
 * Inicia a simulação
 */
app.post('/simulacao/iniciar', (req, res) => {
  try {
    const { velocidade = 60 } = req.body;
    sistema.simulador.iniciar(velocidade);
    res.json({
      success: true,
      message: 'Simulação iniciada',
      velocidade: velocidade
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /simulacao/parar
 * Para a simulação
 */
app.post('/simulacao/parar', (req, res) => {
  try {
    sistema.simulador.parar();
    res.json({
      success: true,
      message: 'Simulação parada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /simulacao/status
 * Retorna status da simulação
 */
app.get('/simulacao/status', (req, res) => {
  try {
    const status = sistema.simulador.getEstatisticas();
    res.json({
      success: true,
      simulacao: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROTAS DE DASHBOARD ====================

/**
 * GET /dashboard
 * Retorna dashboard completo
 */
app.get('/dashboard', (req, res) => {
  try {
    const dashboard = new Dashboard(sistema);
    const relatorio = dashboard.gerarRelatorio();
    res.json({
      success: true,
      dashboard: relatorio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /dashboard/mapa
 * Retorna mapa ASCII
 */
app.get('/dashboard/mapa', (req, res) => {
  try {
    const dashboard = new Dashboard(sistema);
    const mapa = dashboard.gerarMapaASCII(50, 30);
    res.json({
      success: true,
      mapa: mapa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /dashboard/texto
 * Retorna dashboard em formato texto
 */
app.get('/dashboard/texto', (req, res) => {
  try {
    const dashboard = new Dashboard(sistema);
    const texto = dashboard.gerarDashboardTexto();
    res.set('Content-Type', 'text/plain');
    res.send(texto);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROTAS DE FEEDBACK ====================

/**
 * GET /feedback/:pedidoId
 * Retorna feedback do cliente sobre um pedido
 */
app.get('/feedback/:pedidoId', (req, res) => {
  try {
    const feedback = sistema.getFeedbackCliente(req.params.pedidoId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback não encontrado para este pedido'
      });
    }
    res.json({
      success: true,
      feedback: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROTA RAIZ ====================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API do Sistema de Entregas por Drones',
    version: '2.0.0',
    endpoints: {
      drones: {
        'GET /drones/status': 'Status de todos os drones',
        'GET /drones/:id': 'Status de um drone específico',
        'POST /drones': 'Registrar novo drone'
      },
      pedidos: {
        'POST /pedidos': 'Criar novo pedido',
        'GET /pedidos': 'Listar todos os pedidos',
        'GET /pedidos/:id': 'Detalhes de um pedido'
      },
      entregas: {
        'GET /entregas/rota/:pedidoId': 'Calcular rota de entrega',
        'POST /entregas/processar': 'Processar entregas pendentes',
        'GET /entregas/fila': 'Status da fila de entregas'
      },
      obstaculos: {
        'POST /obstaculos': 'Adicionar obstáculo',
        'GET /obstaculos': 'Listar obstáculos'
      },
      sistema: {
        'GET /estatisticas': 'Estatísticas gerais',
        'POST /simulacao/iniciar': 'Iniciar simulação',
        'POST /simulacao/parar': 'Parar simulação',
        'GET /simulacao/status': 'Status da simulação'
      },
      dashboard: {
        'GET /dashboard': 'Dashboard completo (JSON)',
        'GET /dashboard/mapa': 'Mapa ASCII das entregas',
        'GET /dashboard/texto': 'Dashboard em formato texto'
      },
      feedback: {
        'GET /feedback/:pedidoId': 'Feedback do cliente sobre pedido'
      }
    }
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/`);
});

export default app;

