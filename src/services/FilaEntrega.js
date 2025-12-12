import { Pedido } from '../models/Pedido.js';

/**
 * Sistema de fila de entregas com priorização inteligente
 */
export class FilaEntrega {
  constructor() {
    this.fila = [];
    this.pedidosProcessados = [];
  }

  /**
   * Adiciona um pedido à fila
   * @param {Pedido} pedido - Pedido a ser adicionado
   */
  adicionar(pedido) {
    this.fila.push(pedido);
    this.ordenarFila();
  }

  /**
   * Adiciona múltiplos pedidos
   * @param {Array<Pedido>} pedidos - Lista de pedidos
   */
  adicionarVarios(pedidos) {
    this.fila.push(...pedidos);
    this.ordenarFila();
  }

  /**
   * Ordena a fila por prioridade (score)
   */
  ordenarFila() {
    this.fila.sort((a, b) => {
      const scoreA = a.calcularScorePrioridade();
      const scoreB = b.calcularScorePrioridade();
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Maior score primeiro
      }
      
      // Em caso de empate, prioriza por tempo de chegada (mais antigo primeiro)
      return a.tempoChegada - b.tempoChegada;
    });
  }

  /**
   * Remove e retorna o próximo pedido da fila
   * @returns {Pedido|null}
   */
  proximo() {
    if (this.fila.length === 0) {
      return null;
    }
    return this.fila.shift();
  }

  /**
   * Retorna o próximo pedido sem removê-lo
   * @returns {Pedido|null}
   */
  verProximo() {
    if (this.fila.length === 0) {
      return null;
    }
    return this.fila[0];
  }

  /**
   * Retorna todos os pedidos não alocados
   * @returns {Array<Pedido>}
   */
  getPedidosPendentes() {
    return this.fila.filter(p => !p.alocado);
  }

  /**
   * Retorna estatísticas da fila
   * @returns {Object}
   */
  getEstatisticas() {
    const pendentes = this.fila.filter(p => !p.alocado);
    const porPrioridade = {
      alta: pendentes.filter(p => p.prioridade === 'alta').length,
      media: pendentes.filter(p => p.prioridade === 'media').length,
      baixa: pendentes.filter(p => p.prioridade === 'baixa').length
    };

    const tempoMedioEspera = pendentes.length > 0
      ? pendentes.reduce((sum, p) => sum + p.getTempoEspera(), 0) / pendentes.length
      : 0;

    return {
      totalPendentes: pendentes.length,
      porPrioridade: porPrioridade,
      tempoMedioEspera: Math.round(tempoMedioEspera * 10) / 10,
      proximoPedido: this.verProximo()?.id || null
    };
  }

  /**
   * Limpa a fila
   */
  limpar() {
    this.fila = [];
    this.pedidosProcessados = [];
  }

  /**
   * Retorna tamanho da fila
   * @returns {number}
   */
  tamanho() {
    return this.fila.length;
  }
}


