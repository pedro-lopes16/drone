import { EstadoDrone } from '../models/Drone.js';

/**
 * Simulador orientado a eventos para gerenciar estados dos drones
 */
export class SimuladorEventos {
  constructor(sistemaEntrega) {
    this.sistemaEntrega = sistemaEntrega;
    this.eventos = [];
    this.tempoSimulacao = 0; // em minutos
    this.ativo = false;
    this.intervalo = null;
    this.listeners = {
      estadoMudou: [],
      entregaCompleta: [],
      bateriaBaixa: []
    };
  }

  /**
   * Inicia a simulação
   * @param {number} velocidade - Velocidade da simulação (1 = tempo real)
   */
  iniciar(velocidade = 60) {
    if (this.ativo) {
      return;
    }

    this.ativo = true;
    this.tempoSimulacao = 0;
    
    // Atualiza simulação a cada segundo (simulado)
    this.intervalo = setInterval(() => {
      this.processarEventos();
      this.tempoSimulacao += (1 / 60) * velocidade; // minutos
    }, 1000);
  }

  /**
   * Para a simulação
   */
  parar() {
    this.ativo = false;
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  /**
   * Processa eventos da simulação
   */
  processarEventos() {
    const drones = this.sistemaEntrega.drones;

    for (const drone of drones) {
      this.processarDrone(drone);
    }
  }

  /**
   * Processa estado de um drone
   * @param {Drone} drone - Drone a processar
   */
  processarDrone(drone) {
    const tempoNoEstado = (Date.now() - drone.tempoInicioEstado) / 1000 / 60;

    switch (drone.estado) {
      case EstadoDrone.CARREGANDO:
        if (tempoNoEstado >= 1) { // 1 minuto para carregar
          drone.mudarEstado(EstadoDrone.EM_VOO);
          this.notificar('estadoMudou', { drone: drone.id, estado: EstadoDrone.EM_VOO });
        }
        break;

      case EstadoDrone.EM_VOO:
        if (drone.pedidosAtuais.length > 0) {
          const pedido = drone.pedidosAtuais[0];
          const distancia = drone.calcularDistancia(drone.localizacaoAtual, pedido.localizacao);
          const tempoNecessario = (distancia / drone.velocidadeMedia) * 60; // minutos

          if (tempoNoEstado >= tempoNecessario) {
            drone.localizacaoAtual = { ...pedido.localizacao };
            drone.consumirBateria(distancia);
            drone.mudarEstado(EstadoDrone.ENTREGANDO);
            this.notificar('estadoMudou', { drone: drone.id, estado: EstadoDrone.ENTREGANDO });
          }
        }
        break;

      case EstadoDrone.ENTREGANDO:
        if (tempoNoEstado >= 2) { // 2 minutos para entregar
          // Pega pedido antes de finalizar
          const pedidoEntregue = drone.pedidosAtuais.length > 0 ? drone.pedidosAtuais[0] : null;
          
          drone.finalizarEntrega();
          
          if (drone.pedidosAtuais.length > 0) {
            // Ainda tem mais pedidos, continua voando
            drone.mudarEstado(EstadoDrone.EM_VOO);
            this.notificar('estadoMudou', { drone: drone.id, estado: EstadoDrone.EM_VOO });
          } else {
            // Retorna à base
            drone.mudarEstado(EstadoDrone.RETORNANDO);
            this.notificar('estadoMudou', { drone: drone.id, estado: EstadoDrone.RETORNANDO });
          }

          // Registra entrega completa
          if (pedidoEntregue) {
            pedidoEntregue.marcarEntregue();
            const tempoEntrega = pedidoEntregue.getTempoEspera();
            this.sistemaEntrega.entregasRealizadas.push({
              pedidoId: pedidoEntregue.id,
              droneId: drone.id,
              tempoEntrega: tempoEntrega,
              timestamp: Date.now()
            });
            // Atualiza feedback do cliente
            this.sistemaEntrega.atualizarFeedbackCliente(
              pedidoEntregue.id,
              'Pedido entregue com sucesso!',
              drone.id
            );
          }
          
          this.notificar('entregaCompleta', { drone: drone.id, pedidoId: pedidoEntregue?.id });
        }
        break;

      case EstadoDrone.RETORNANDO:
        const distanciaBase = drone.calcularDistancia(
          drone.localizacaoAtual,
          this.sistemaEntrega.origem
        );
        const tempoRetorno = (distanciaBase / drone.velocidadeMedia) * 60;

        if (tempoNoEstado >= tempoRetorno) {
          drone.localizacaoAtual = { ...this.sistemaEntrega.origem };
          drone.consumirBateria(distanciaBase);
          drone.finalizarViagem();

          if (drone.bateriaAtual < 20) {
            drone.mudarEstado(EstadoDrone.RECARREGANDO);
            this.notificar('bateriaBaixa', { drone: drone.id, bateria: drone.bateriaAtual });
          } else {
            drone.mudarEstado(EstadoDrone.IDLE);
          }
          
          this.notificar('estadoMudou', { drone: drone.id, estado: drone.estado });
        }
        break;

      case EstadoDrone.RECARREGANDO:
        if (tempoNoEstado >= 5) { // 5 minutos para recarregar
          drone.bateriaAtual = drone.bateriaMaxima;
          drone.mudarEstado(EstadoDrone.IDLE);
          this.notificar('estadoMudou', { drone: drone.id, estado: EstadoDrone.IDLE });
        }
        break;
    }

    // Verifica bateria crítica durante voo
    if ((drone.estado === EstadoDrone.EM_VOO || drone.estado === EstadoDrone.RETORNANDO) &&
        drone.bateriaAtual < 10) {
      // Força retorno imediato
      drone.mudarEstado(EstadoDrone.RETORNANDO);
      this.notificar('bateriaBaixa', { drone: drone.id, bateria: drone.bateriaAtual });
    }
  }

  /**
   * Adiciona listener para eventos
   * @param {string} evento - Nome do evento
   * @param {Function} callback - Função callback
   */
  on(evento, callback) {
    if (this.listeners[evento]) {
      this.listeners[evento].push(callback);
    }
  }

  /**
   * Remove listener
   * @param {string} evento - Nome do evento
   * @param {Function} callback - Função callback
   */
  off(evento, callback) {
    if (this.listeners[evento]) {
      this.listeners[evento] = this.listeners[evento].filter(cb => cb !== callback);
    }
  }

  /**
   * Notifica listeners sobre um evento
   * @param {string} evento - Nome do evento
   * @param {Object} dados - Dados do evento
   */
  notificar(evento, dados) {
    if (this.listeners[evento]) {
      this.listeners[evento].forEach(callback => {
        try {
          callback(dados);
        } catch (error) {
          console.error(`Erro no listener de ${evento}:`, error);
        }
      });
    }
  }

  /**
   * Retorna estatísticas da simulação
   * @returns {Object}
   */
  getEstatisticas() {
    return {
      ativo: this.ativo,
      tempoSimulacao: Math.round(this.tempoSimulacao * 10) / 10,
      dronesAtivos: this.sistemaEntrega.drones.filter(
        d => d.estado !== EstadoDrone.IDLE && d.estado !== EstadoDrone.RECARREGANDO
      ).length
    };
  }
}

