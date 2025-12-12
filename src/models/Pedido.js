/**
 * Classe que representa um Pedido
 */
export class Pedido {
  constructor(id, localizacao, peso, prioridade = 'media', tempoChegada = null) {
    this.id = id;
    this.localizacao = localizacao; // {x, y}
    this.peso = peso; // em kg
    this.prioridade = prioridade.toLowerCase(); // 'baixa', 'media', 'alta'
    this.tempoChegada = tempoChegada || Date.now(); // timestamp
    this.alocado = false;
    this.droneId = null;
    this.tempoAlocacao = null;
    this.tempoEntrega = null;
    this.tempoEstimadoEntrega = null;
  }

  /**
   * Retorna o valor numérico da prioridade para ordenação
   * @returns {number}
   */
  getPrioridadeNumerica() {
    const prioridades = {
      'alta': 3,
      'media': 2,
      'baixa': 1
    };
    return prioridades[this.prioridade] || 2;
  }

  /**
   * Calcula score de prioridade considerando tempo de espera
   * @returns {number}
   */
  calcularScorePrioridade() {
    const prioridadeBase = this.getPrioridadeNumerica() * 100;
    const tempoEspera = (Date.now() - this.tempoChegada) / 1000 / 60; // minutos
    const bonusTempo = Math.min(tempoEspera * 2, 50); // até 50 pontos de bonus
    return prioridadeBase + bonusTempo;
  }

  /**
   * Marca o pedido como alocado
   * @param {string} droneId - ID do drone que vai entregar
   * @param {number} tempoEstimado - Tempo estimado em minutos
   */
  alocar(droneId, tempoEstimado = null) {
    this.alocado = true;
    this.droneId = droneId;
    this.tempoAlocacao = Date.now();
    this.tempoEstimadoEntrega = tempoEstimado;
  }

  /**
   * Marca o pedido como entregue
   */
  marcarEntregue() {
    this.tempoEntrega = Date.now();
  }

  /**
   * Retorna tempo de espera em minutos
   * @returns {number}
   */
  getTempoEspera() {
    if (this.tempoEntrega) {
      return (this.tempoEntrega - this.tempoChegada) / 1000 / 60;
    }
    if (this.tempoAlocacao) {
      return (this.tempoAlocacao - this.tempoChegada) / 1000 / 60;
    }
    return (Date.now() - this.tempoChegada) / 1000 / 60;
  }

  /**
   * Retorna informações do pedido
   */
  getInfo() {
    return {
      id: this.id,
      localizacao: this.localizacao,
      peso: this.peso,
      prioridade: this.prioridade,
      tempoChegada: this.tempoChegada,
      tempoEspera: Math.round(this.getTempoEspera() * 10) / 10,
      alocado: this.alocado,
      droneId: this.droneId,
      tempoEstimadoEntrega: this.tempoEstimadoEntrega,
      tempoEntrega: this.tempoEntrega,
      scorePrioridade: Math.round(this.calcularScorePrioridade() * 10) / 10
    };
  }
}
