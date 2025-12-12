/**
 * Estados possíveis do drone
 */
export const EstadoDrone = {
  IDLE: 'idle',              // Ocioso, aguardando
  CARREGANDO: 'carregando',   // Carregando pacotes
  EM_VOO: 'em_voo',          // Em voo para destino
  ENTREGANDO: 'entregando',   // Entregando pacote
  RETORNANDO: 'retornando',   // Retornando à base
  RECARREGANDO: 'recarregando' // Recarregando bateria
};

/**
 * Classe que representa um Drone com sistema de bateria e estados
 */
export class Drone {
  constructor(id, capacidadePeso, capacidadeDistancia, bateriaMaxima = 100, velocidadeMedia = 30) {
    this.id = id;
    this.capacidadePeso = capacidadePeso; // em kg
    this.capacidadeDistancia = capacidadeDistancia; // em km
    this.bateriaMaxima = bateriaMaxima; // porcentagem (0-100)
    this.bateriaAtual = bateriaMaxima;
    this.velocidadeMedia = velocidadeMedia; // km/h
    this.pedidosAtuais = [];
    this.pesoAtual = 0;
    this.distanciaTotal = 0;
    this.viagensRealizadas = 0;
    this.estado = EstadoDrone.IDLE;
    this.localizacaoAtual = { x: 0, y: 0 }; // Posição atual do drone
    this.destinoAtual = null;
    this.tempoInicioEstado = Date.now();
    this.historicoEstados = [];
    this.tempoTotalVoo = 0; // em minutos
    this.distanciaPercorrida = 0; // em km
  }

  /**
   * Calcula o consumo de bateria por km (considera peso)
   * @param {number} distancia - Distância em km
   * @param {number} pesoTotal - Peso total carregado em kg
   * @returns {number} Consumo de bateria em porcentagem
   */
  calcularConsumoBateria(distancia, pesoTotal = 0) {
    const consumoBase = 0.5; // 0.5% por km sem carga
    const consumoPeso = (pesoTotal / this.capacidadePeso) * 0.3; // até 0.3% extra por km
    return (consumoBase + consumoPeso) * distancia;
  }

  /**
   * Verifica se o drone tem bateria suficiente para uma viagem
   * @param {number} distancia - Distância em km
   * @param {number} pesoTotal - Peso total em kg
   * @returns {boolean}
   */
  temBateriaSuficiente(distancia, pesoTotal = 0) {
    const consumo = this.calcularConsumoBateria(distancia, pesoTotal);
    // Precisa de bateria para ida e volta
    return this.bateriaAtual >= (consumo * 2);
  }

  /**
   * Verifica se o drone pode carregar um pedido adicional
   * @param {Pedido} pedido - O pedido a ser verificado
   * @param {Object} origem - Coordenadas de origem {x, y}
   * @param {Array} obstaculos - Lista de obstáculos a evitar
   * @returns {Object} {pode: boolean, motivo: string, distancia: number}
   */
  podeCarregar(pedido, origem = { x: 0, y: 0 }, obstaculos = []) {
    const novoPeso = this.pesoAtual + pedido.peso;
    
    // Calcula distância considerando obstáculos
    const distancia = this.calcularDistanciaComObstaculos(
      origem, 
      pedido.localizacao, 
      obstaculos
    );
    
    const novaDistancia = this.distanciaTotal + distancia;
    const distanciaRetorno = this.calcularDistanciaComObstaculos(
      pedido.localizacao,
      origem,
      obstaculos
    );
    const distanciaTotalViagem = distancia + distanciaRetorno;

    // Verifica capacidade de peso
    if (novoPeso > this.capacidadePeso) {
      return {
        pode: false,
        motivo: 'Capacidade de peso excedida',
        distancia: distancia
      };
    }

    // Verifica capacidade de distância
    if (novaDistancia > this.capacidadeDistancia) {
      return {
        pode: false,
        motivo: 'Capacidade de distância excedida',
        distancia: distancia
      };
    }

    // Verifica bateria
    if (!this.temBateriaSuficiente(distanciaTotalViagem, novoPeso)) {
      return {
        pode: false,
        motivo: 'Bateria insuficiente',
        distancia: distancia
      };
    }

    // Verifica se está disponível
    if (this.estado !== EstadoDrone.IDLE && this.estado !== EstadoDrone.RECARREGANDO) {
      return {
        pode: false,
        motivo: 'Drone não está disponível',
        distancia: distancia
      };
    }

    return {
      pode: true,
      motivo: 'OK',
      distancia: distancia
    };
  }

  /**
   * Adiciona um pedido ao drone
   * @param {Pedido} pedido - O pedido a ser adicionado
   * @param {Object} origem - Coordenadas de origem {x, y}
   * @param {Array} obstaculos - Lista de obstáculos
   */
  adicionarPedido(pedido, origem = { x: 0, y: 0 }, obstaculos = []) {
    const verificacao = this.podeCarregar(pedido, origem, obstaculos);
    if (!verificacao.pode) {
      throw new Error(`Drone ${this.id} não pode carregar o pedido ${pedido.id}: ${verificacao.motivo}`);
    }

    const distanciaPedido = verificacao.distancia;
    this.pedidosAtuais.push(pedido);
    this.pesoAtual += pedido.peso;
    this.distanciaTotal += distanciaPedido;
  }

  /**
   * Muda o estado do drone
   * @param {string} novoEstado - Novo estado
   */
  mudarEstado(novoEstado) {
    if (this.estado !== novoEstado) {
      const tempoNoEstado = (Date.now() - this.tempoInicioEstado) / 1000 / 60; // em minutos
      
      this.historicoEstados.push({
        estado: this.estado,
        inicio: this.tempoInicioEstado,
        fim: Date.now(),
        duracao: tempoNoEstado
      });

      if (this.estado === EstadoDrone.EM_VOO || this.estado === EstadoDrone.RETORNANDO) {
        this.tempoTotalVoo += tempoNoEstado;
      }

      this.estado = novoEstado;
      this.tempoInicioEstado = Date.now();
    }
  }

  /**
   * Inicia uma viagem
   * @param {Object} destino - Coordenadas de destino {x, y}
   */
  iniciarViagem(destino) {
    this.destinoAtual = destino;
    this.mudarEstado(EstadoDrone.CARREGANDO);
    
    // Simula tempo de carregamento (1 minuto)
    setTimeout(() => {
      this.mudarEstado(EstadoDrone.EM_VOO);
    }, 1000);
  }

  /**
   * Simula o consumo de bateria durante o voo
   * @param {number} distancia - Distância percorrida em km
   */
  consumirBateria(distancia) {
    const consumo = this.calcularConsumoBateria(distancia, this.pesoAtual);
    this.bateriaAtual = Math.max(0, this.bateriaAtual - consumo);
    this.distanciaPercorrida += distancia;
  }

  /**
   * Finaliza uma entrega
   */
  finalizarEntrega() {
    if (this.pedidosAtuais.length > 0) {
      const pedido = this.pedidosAtuais.shift();
      const distancia = this.calcularDistancia(this.localizacaoAtual, pedido.localizacao);
      this.consumirBateria(distancia);
      this.localizacaoAtual = { ...pedido.localizacao };
      this.pesoAtual -= pedido.peso;
      this.distanciaTotal -= distancia;
    }
  }

  /**
   * Retorna à base
   * @param {Object} base - Coordenadas da base {x, y}
   */
  retornarBase(base) {
    this.destinoAtual = base;
    this.mudarEstado(EstadoDrone.RETORNANDO);
    
    const distancia = this.calcularDistancia(this.localizacaoAtual, base);
    this.consumirBateria(distancia);
    this.localizacaoAtual = { ...base };
    
    // Se bateria baixa, recarrega
    if (this.bateriaAtual < 20) {
      this.recarregar();
    } else {
      this.mudarEstado(EstadoDrone.IDLE);
    }
  }

  /**
   * Recarrega a bateria
   */
  recarregar() {
    this.mudarEstado(EstadoDrone.RECARREGANDO);
    // Simula recarga (5 minutos)
    setTimeout(() => {
      this.bateriaAtual = this.bateriaMaxima;
      this.mudarEstado(EstadoDrone.IDLE);
    }, 5000);
  }

  /**
   * Remove todos os pedidos e prepara para nova viagem
   */
  finalizarViagem() {
    this.pedidosAtuais = [];
    this.pesoAtual = 0;
    this.distanciaTotal = 0;
    this.viagensRealizadas++;
    this.destinoAtual = null;
  }

  /**
   * Calcula a distância euclidiana entre dois pontos
   * @param {Object} ponto1 - {x, y}
   * @param {Object} ponto2 - {x, y}
   * @returns {number} Distância em km
   */
  calcularDistancia(ponto1, ponto2) {
    const dx = ponto2.x - ponto1.x;
    const dy = ponto2.y - ponto1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calcula distância considerando obstáculos (rota alternativa)
   * @param {Object} ponto1 - {x, y}
   * @param {Object} ponto2 - {x, y}
   * @param {Array} obstaculos - Lista de obstáculos
   * @returns {number} Distância em km
   */
  calcularDistanciaComObstaculos(ponto1, ponto2, obstaculos = []) {
    // Verifica se a rota direta passa por algum obstáculo
    const rotaDireta = this.calcularDistancia(ponto1, ponto2);
    let distanciaFinal = rotaDireta;

    for (const obstaculo of obstaculos) {
      if (this.rotaPassaPorObstaculo(ponto1, ponto2, obstaculo)) {
        // Calcula rota alternativa contornando o obstáculo
        const distanciaAlternativa = this.calcularRotaAlternativa(ponto1, ponto2, obstaculo);
        distanciaFinal = Math.max(distanciaFinal, distanciaAlternativa);
      }
    }

    return distanciaFinal;
  }

  /**
   * Verifica se a rota passa por um obstáculo
   * @param {Object} ponto1 - {x, y}
   * @param {Object} ponto2 - {x, y}
   * @param {Object} obstaculo - Obstáculo {centro: {x, y}, raio: number}
   * @returns {boolean}
   */
  rotaPassaPorObstaculo(ponto1, ponto2, obstaculo) {
    const distancia = this.distanciaPontoReta(ponto1, ponto2, obstaculo.centro);
    return distancia <= obstaculo.raio;
  }

  /**
   * Calcula distância de um ponto até uma reta
   * @param {Object} ponto1 - {x, y} da reta
   * @param {Object} ponto2 - {x, y} da reta
   * @param {Object} ponto - {x, y} do ponto
   * @returns {number}
   */
  distanciaPontoReta(ponto1, ponto2, ponto) {
    const A = ponto2.y - ponto1.y;
    const B = ponto1.x - ponto2.x;
    const C = ponto2.x * ponto1.y - ponto1.x * ponto2.y;
    return Math.abs(A * ponto.x + B * ponto.y + C) / Math.sqrt(A * A + B * B);
  }

  /**
   * Calcula rota alternativa contornando obstáculo
   * @param {Object} ponto1 - {x, y}
   * @param {Object} ponto2 - {x, y}
   * @param {Object} obstaculo - Obstáculo
   * @returns {number} Distância da rota alternativa
   */
  calcularRotaAlternativa(ponto1, ponto2, obstaculo) {
    // Estratégia simples: contorna pelo ponto mais próximo do obstáculo
    const raioSeguro = obstaculo.raioseguro || obstaculo.raio + 1;
    const angulo = Math.atan2(ponto2.y - ponto1.y, ponto2.x - ponto1.x);
    
    // Ponto de contorno
    const pontoContorno = {
      x: obstaculo.centro.x + Math.cos(angulo + Math.PI / 2) * raioSeguro,
      y: obstaculo.centro.y + Math.sin(angulo + Math.PI / 2) * raioSeguro
    };

    const dist1 = this.calcularDistancia(ponto1, pontoContorno);
    const dist2 = this.calcularDistancia(pontoContorno, ponto2);
    
    return dist1 + dist2;
  }

  /**
   * Calcula tempo estimado de entrega
   * @param {Object} destino - Coordenadas de destino {x, y}
   * @returns {number} Tempo em minutos
   */
  calcularTempoEntrega(destino) {
    const distancia = this.calcularDistancia(this.localizacaoAtual, destino);
    const tempoVoo = (distancia / this.velocidadeMedia) * 60; // em minutos
    const tempoEntrega = 2; // 2 minutos para entregar
    return tempoVoo + tempoEntrega;
  }

  /**
   * Retorna informações do drone
   */
  getInfo() {
    return {
      id: this.id,
      capacidadePeso: this.capacidadePeso,
      capacidadeDistancia: this.capacidadeDistancia,
      bateriaAtual: Math.round(this.bateriaAtual * 10) / 10,
      bateriaMaxima: this.bateriaMaxima,
      estado: this.estado,
      localizacaoAtual: this.localizacaoAtual,
      viagensRealizadas: this.viagensRealizadas,
      pedidosAtuais: this.pedidosAtuais.length,
      pesoAtual: this.pesoAtual,
      distanciaTotal: this.distanciaTotal,
      tempoTotalVoo: Math.round(this.tempoTotalVoo * 10) / 10,
      distanciaPercorrida: Math.round(this.distanciaPercorrida * 10) / 10,
      velocidadeMedia: this.velocidadeMedia
    };
  }
}
