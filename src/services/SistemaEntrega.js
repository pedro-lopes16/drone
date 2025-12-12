import { Drone } from '../models/Drone.js';
import { Pedido } from '../models/Pedido.js';
import { Obstaculo } from '../models/Obstaculo.js';
import { AlocadorPedidos } from './AlocadorPedidos.js';
import { FilaEntrega } from './FilaEntrega.js';
import { OtimizadorAvancado } from './OtimizadorAvancado.js';
import { SimuladorEventos } from './SimuladorEventos.js';
import { Validator, ErroValidacao, ErroCapacidade } from '../utils/validators.js';

/**
 * Sistema principal de gerenciamento de entregas por drones
 */
export class SistemaEntrega {
  constructor(origem = { x: 0, y: 0 }) {
    this.origem = origem;
    this.drones = [];
    this.pedidos = [];
    this.obstaculos = [];
    this.historicoViagens = [];
    this.alocador = new AlocadorPedidos(origem);
    this.filaEntrega = new FilaEntrega();
    this.otimizador = new OtimizadorAvancado(origem);
    this.simulador = new SimuladorEventos(this);
    this.entregasRealizadas = [];
    this.feedbacksClientes = new Map(); // Map<pedidoId, feedback>
  }

  /**
   * Registra um novo drone no sistema
   * @param {string} id - Identificador único do drone
   * @param {number} capacidadePeso - Capacidade máxima de peso em kg
   * @param {number} capacidadeDistancia - Capacidade máxima de distância em km
   * @param {number} bateriaMaxima - Bateria máxima em porcentagem
   * @param {number} velocidadeMedia - Velocidade média em km/h
   * @returns {Drone}
   * @throws {ErroValidacao}
   */
  registrarDrone(id, capacidadePeso, capacidadeDistancia, bateriaMaxima = 100, velocidadeMedia = 30) {
    const validacao = Validator.validarDrone({
      id,
      capacidadePeso,
      capacidadeDistancia,
      bateriaMaxima,
      velocidadeMedia
    });

    if (!validacao.valido) {
      throw new ErroValidacao('Dados do drone inválidos', validacao.erros);
    }

    // Verifica se já existe drone com mesmo ID
    if (this.drones.find(d => d.id === id)) {
      throw new ErroValidacao(`Drone com ID ${id} já está registrado`);
    }

    const drone = new Drone(id, capacidadePeso, capacidadeDistancia, bateriaMaxima, velocidadeMedia);
    drone.localizacaoAtual = { ...this.origem };
    this.drones.push(drone);
    return drone;
  }

  /**
   * Cria um novo pedido no sistema
   * @param {string} id - Identificador único do pedido
   * @param {Object} localizacao - Coordenadas {x, y}
   * @param {number} peso - Peso do pacote em kg
   * @param {string} prioridade - Prioridade: 'baixa', 'media', 'alta'
   * @param {number} tempoChegada - Timestamp de chegada (opcional)
   * @returns {Pedido}
   * @throws {ErroValidacao}
   */
  criarPedido(id, localizacao, peso, prioridade = 'media', tempoChegada = null) {
    const validacao = Validator.validarPedido({
      id,
      localizacao,
      peso,
      prioridade
    });

    if (!validacao.valido) {
      throw new ErroValidacao('Dados do pedido inválidos', validacao.erros);
    }

    // Verifica se já existe pedido com mesmo ID
    if (this.pedidos.find(p => p.id === id)) {
      throw new ErroValidacao(`Pedido com ID ${id} já existe`);
    }

    // Valida capacidade máxima dos drones disponíveis
    const droneComMaiorCapacidade = this.drones.reduce((max, d) => 
      d.capacidadePeso > (max?.capacidadePeso || 0) ? d : max, null
    );

    if (droneComMaiorCapacidade) {
      const validacaoCapacidade = Validator.validarCapacidadePedido(
        { peso },
        droneComMaiorCapacidade
      );
      if (!validacaoCapacidade.pode) {
        throw new ErroCapacidade(validacaoCapacidade.motivo);
      }
    }

    const pedido = new Pedido(id, localizacao, peso, prioridade, tempoChegada);
    this.pedidos.push(pedido);
    this.filaEntrega.adicionar(pedido);
    return pedido;
  }

  /**
   * Adiciona um obstáculo ao sistema
   * @param {string} id - Identificador único do obstáculo
   * @param {Object} centro - Coordenadas do centro {x, y}
   * @param {number} raio - Raio em km
   * @param {string} tipo - Tipo de obstáculo
   * @param {number} raioSeguro - Raio de segurança (opcional)
   * @returns {Obstaculo}
   * @throws {ErroValidacao}
   */
  adicionarObstaculo(id, centro, raio, tipo = 'zona_exclusao', raioSeguro = null) {
    const validacao = Validator.validarObstaculo({
      id,
      centro,
      raio,
      tipo
    });

    if (!validacao.valido) {
      throw new ErroValidacao('Dados do obstáculo inválidos', validacao.erros);
    }

    // Verifica se já existe obstáculo com mesmo ID
    if (this.obstaculos.find(o => o.id === id)) {
      throw new ErroValidacao(`Obstáculo com ID ${id} já existe`);
    }

    const obstaculo = new Obstaculo(id, centro, raio, tipo, raioSeguro);
    this.obstaculos.push(obstaculo);
    return obstaculo;
  }

  /**
   * Processa todos os pedidos não alocados usando otimização avançada
   * @param {boolean} usarOtimizadorAvancado - Se true, usa otimizador avançado
   * @returns {Object} Relatório de alocação
   */
  processarEntregas(usarOtimizadorAvancado = true) {
    const pedidosPendentes = this.filaEntrega.getPedidosPendentes();
    
    if (pedidosPendentes.length === 0) {
      return {
        mensagem: 'Não há pedidos pendentes para processar',
        viagensRealizadas: 0,
        pedidosAlocados: 0,
        pedidosNaoAlocados: []
      };
    }

    if (usarOtimizadorAvancado) {
      return this.processarComOtimizadorAvancado(pedidosPendentes);
    } else {
      return this.alocador.alocarPedidos(this.drones, pedidosPendentes);
    }
  }

  /**
   * Processa entregas usando otimizador avançado
   * @param {Array<Pedido>} pedidos - Lista de pedidos
   * @returns {Object} Relatório
   */
  processarComOtimizadorAvancado(pedidos) {
    const dronesDisponiveis = this.drones.filter(
      d => d.estado === 'idle' || d.estado === 'recarregando'
    );
    
    let pedidosAlocados = 0;
    let viagensRealizadas = 0;
    const pedidosNaoAlocados = [];

    // Processa cada drone disponível
    for (const drone of dronesDisponiveis) {
      if (drone.bateriaAtual < 20) {
        continue; // Pula drones com bateria baixa
      }

      const pedidosDisponiveis = pedidos.filter(p => !p.alocado);
      if (pedidosDisponiveis.length === 0) {
        break;
      }

      // Encontra melhor combinação para este drone
      const melhorCombinacao = this.otimizador.encontrarMelhorCombinacao(
        pedidosDisponiveis,
        drone,
        this.obstaculos,
        50 // Limita combinações para performance
      );

      if (melhorCombinacao.score > 0 && melhorCombinacao.pedidos.length > 0) {
        // Aloca os pedidos ao drone
        for (const pedido of melhorCombinacao.pedidos) {
          try {
            drone.adicionarPedido(pedido, this.origem, this.obstaculos);
            const tempoEstimado = drone.calcularTempoEntrega(pedido.localizacao);
            pedido.alocar(drone.id, tempoEstimado);
            pedidosAlocados++;
            
            // Cria feedback inicial
            this.atualizarFeedbackCliente(pedido.id, 'Pedido alocado ao drone', drone.id);
          } catch (error) {
            console.error(`Erro ao alocar pedido ${pedido.id}:`, error.message);
            pedidosNaoAlocados.push(pedido);
          }
        }

        if (melhorCombinacao.pedidos.length > 0) {
          drone.iniciarViagem(melhorCombinacao.pedidos[0].localizacao);
          viagensRealizadas++;
        }
      }
    }

    // Marca pedidos não alocados
    pedidos.forEach(p => {
      if (!p.alocado) {
        pedidosNaoAlocados.push(p);
      }
    });

    // Registra no histórico
    this.historicoViagens.push({
      timestamp: new Date(),
      resultado: {
        viagensRealizadas,
        pedidosAlocados,
        pedidosNaoAlocados: pedidosNaoAlocados.length
      }
    });

    return {
      viagensRealizadas,
      pedidosAlocados,
      pedidosNaoAlocados,
      drones: this.drones.map(d => d.getInfo())
    };
  }

  /**
   * Atualiza feedback do cliente sobre status da entrega
   * @param {string} pedidoId - ID do pedido
   * @param {string} mensagem - Mensagem de status
   * @param {string} droneId - ID do drone (opcional)
   */
  atualizarFeedbackCliente(pedidoId, mensagem, droneId = null) {
    const pedido = this.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    const drone = droneId ? this.drones.find(d => d.id === droneId) : null;
    let distancia = null;

    if (drone && pedido.alocado) {
      distancia = drone.calcularDistancia(drone.localizacaoAtual, pedido.localizacao);
    }

    const feedback = {
      pedidoId,
      mensagem,
      timestamp: Date.now(),
      distancia: distancia ? Math.round(distancia * 100) / 100 : null,
      estado: pedido.alocado ? (drone?.estado || 'desconhecido') : 'pendente'
    };

    this.feedbacksClientes.set(pedidoId, feedback);

    // Gera mensagem amigável baseada na distância
    if (distancia !== null) {
      if (distancia < 0.5) {
        feedback.mensagemAmigavel = 'Seu pacote está quase chegando! A poucos metros de distância.';
      } else if (distancia < 1) {
        feedback.mensagemAmigavel = `Seu pacote está a aproximadamente ${Math.round(distancia * 1000)} metros de distância.`;
      } else if (distancia < 5) {
        feedback.mensagemAmigavel = `Seu pacote está a ${Math.round(distancia)} km de distância.`;
      } else {
        feedback.mensagemAmigavel = `Seu pacote está em trânsito, a ${Math.round(distancia)} km de distância.`;
      }
    }
  }

  /**
   * Obtém feedback do cliente
   * @param {string} pedidoId - ID do pedido
   * @returns {Object|null}
   */
  getFeedbackCliente(pedidoId) {
    return this.feedbacksClientes.get(pedidoId) || null;
  }

  /**
   * Calcula rota otimizada para uma entrega
   * @param {string} pedidoId - ID do pedido
   * @returns {Object} Informações da rota
   */
  calcularRotaEntrega(pedidoId) {
    const pedido = this.pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      return null;
    }

    const distancia = this.otimizador.calcularDistanciaComObstaculos(
      this.origem,
      pedido.localizacao,
      this.obstaculos
    );

    const distanciaDireta = Math.sqrt(
      Math.pow(pedido.localizacao.x - this.origem.x, 2) +
      Math.pow(pedido.localizacao.y - this.origem.y, 2)
    );

    return {
      pedidoId: pedido.id,
      origem: this.origem,
      destino: pedido.localizacao,
      distanciaDireta: Math.round(distanciaDireta * 100) / 100,
      distanciaComObstaculos: Math.round(distancia * 100) / 100,
      obstaculosEncontrados: this.obstaculos.filter(o => 
        o.interceptaRota(this.origem, pedido.localizacao)
      ).map(o => o.getInfo()),
      tempoEstimado: Math.round((distancia / 30) * 60 * 10) / 10 // minutos (assumindo 30 km/h)
    };
  }

  /**
   * Retorna estatísticas do sistema
   * @returns {Object}
   */
  getEstatisticas() {
    const pedidosAlocados = this.pedidos.filter(p => p.alocado).length;
    const pedidosNaoAlocados = this.pedidos.filter(p => !p.alocado).length;
    const totalViagens = this.drones.reduce((sum, d) => sum + d.viagensRealizadas, 0);
    const dronesAtivos = this.drones.filter(
      d => d.estado !== 'idle' && d.estado !== 'recarregando'
    ).length;

    const statsFila = this.filaEntrega.getEstatisticas();
    const statsSimulacao = this.simulador.getEstatisticas();

    // Calcula tempo médio de entrega
    const entregasCompletas = this.entregasRealizadas.filter(e => e.tempoEntrega);
    const tempoMedioEntrega = entregasCompletas.length > 0
      ? entregasCompletas.reduce((sum, e) => sum + e.tempoEntrega, 0) / entregasCompletas.length
      : 0;

    // Drone mais eficiente
    const droneMaisEficiente = this.drones.reduce((max, d) => {
      const eficiencia = d.viagensRealizadas > 0 
        ? (d.viagensRealizadas / (d.tempoTotalVoo || 1)) * (d.distanciaPercorrida || 0)
        : 0;
      const eficienciaMax = max ? 
        (max.viagensRealizadas / (max.tempoTotalVoo || 1)) * (max.distanciaPercorrida || 0)
        : 0;
      return eficiencia > eficienciaMax ? d : max;
    }, null);

    return {
      totalDrones: this.drones.length,
      dronesAtivos: dronesAtivos,
      dronesIdle: this.drones.filter(d => d.estado === 'idle').length,
      dronesRecarregando: this.drones.filter(d => d.estado === 'recarregando').length,
      totalPedidos: this.pedidos.length,
      pedidosAlocados: pedidosAlocados,
      pedidosNaoAlocados: pedidosNaoAlocados,
      totalViagens: totalViagens,
      entregasRealizadas: this.entregasRealizadas.length,
      tempoMedioEntrega: Math.round(tempoMedioEntrega * 10) / 10,
      droneMaisEficiente: droneMaisEficiente ? {
        id: droneMaisEficiente.id,
        viagens: droneMaisEficiente.viagensRealizadas,
        distanciaTotal: Math.round(droneMaisEficiente.distanciaPercorrida * 10) / 10,
        tempoVoo: Math.round(droneMaisEficiente.tempoTotalVoo * 10) / 10
      } : null,
      taxaSucesso: this.pedidos.length > 0 
        ? (pedidosAlocados / this.pedidos.length * 100).toFixed(2) + '%' 
        : '0%',
      totalObstaculos: this.obstaculos.length,
      fila: statsFila,
      simulacao: statsSimulacao
    };
  }

  /**
   * Retorna informações detalhadas de todos os drones
   * @returns {Array}
   */
  getStatusDrones() {
    return this.drones.map(drone => drone.getInfo());
  }

  /**
   * Retorna informações de todos os pedidos
   * @returns {Array}
   */
  getStatusPedidos() {
    return this.pedidos.map(pedido => pedido.getInfo());
  }

  /**
   * Retorna informações de todos os obstáculos
   * @returns {Array}
   */
  getStatusObstaculos() {
    return this.obstaculos.map(obstaculo => obstaculo.getInfo());
  }

  /**
   * Limpa o sistema (reseta todos os drones e pedidos)
   */
  limparSistema() {
    this.drones.forEach(drone => drone.finalizarViagem());
    this.pedidos.forEach(pedido => {
      pedido.alocado = false;
      pedido.droneId = null;
    });
    this.historicoViagens = [];
    this.filaEntrega.limpar();
    this.entregasRealizadas = [];
  }

  /**
   * Reseta completamente o sistema (remove drones e pedidos)
   */
  resetarSistema() {
    this.drones = [];
    this.pedidos = [];
    this.obstaculos = [];
    this.historicoViagens = [];
    this.filaEntrega.limpar();
    this.simulador.parar();
    this.entregasRealizadas = [];
    this.feedbacksClientes.clear();
  }
}
