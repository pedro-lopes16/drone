import { Drone } from '../models/Drone.js';
import { Pedido } from '../models/Pedido.js';

/**
 * Otimizador avançado que maximiza o uso dos drones
 */
export class OtimizadorAvancado {
  constructor(origem = { x: 0, y: 0 }) {
    this.origem = origem;
  }

  /**
   * Calcula score de combinação de pedidos para um drone
   * @param {Array<Pedido>} pedidos - Lista de pedidos
   * @param {Drone} drone - Drone
   * @param {Array} obstaculos - Lista de obstáculos
   * @returns {Object} {score: number, rota: Array, distancia: number}
   */
  calcularScoreCombinacao(pedidos, drone, obstaculos = []) {
    if (pedidos.length === 0) {
      return { score: 0, rota: [], distancia: 0 };
    }

    // Calcula rota otimizada (TSP simplificado - nearest neighbor)
    const rota = this.calcularRotaOtimizada(pedidos, obstaculos);
    
    let distanciaTotal = 0;
    let pesoTotal = 0;
    let scorePrioridade = 0;
    let posicaoAtual = this.origem;

    for (const pedido of rota) {
      const distancia = drone.calcularDistanciaComObstaculos(
        posicaoAtual,
        pedido.localizacao,
        obstaculos
      );
      distanciaTotal += distancia;
      pesoTotal += pedido.peso;
      scorePrioridade += pedido.getPrioridadeNumerica();
      posicaoAtual = pedido.localizacao;
    }

    // Distância de retorno
    const distanciaRetorno = drone.calcularDistanciaComObstaculos(
      posicaoAtual,
      this.origem,
      obstaculos
    );
    distanciaTotal += distanciaRetorno;

    // Verifica viabilidade
    if (pesoTotal > drone.capacidadePeso || distanciaTotal > drone.capacidadeDistancia) {
      return { score: -1, rota: [], distancia: distanciaTotal };
    }

    // Calcula score: maximiza uso de capacidade e prioridade
    const usoPeso = (pesoTotal / drone.capacidadePeso) * 100;
    const usoDistancia = (distanciaTotal / drone.capacidadeDistancia) * 100;
    const usoMedio = (usoPeso + usoDistancia) / 2;
    const bonusPrioridade = scorePrioridade * 10;
    const bonusEficiencia = pedidos.length * 5; // Bonus por múltiplos pedidos

    const score = usoMedio + bonusPrioridade + bonusEficiencia;

    return {
      score: score,
      rota: rota,
      distancia: distanciaTotal,
      peso: pesoTotal,
      usoPeso: usoPeso,
      usoDistancia: usoDistancia
    };
  }

  /**
   * Calcula rota otimizada usando algoritmo nearest neighbor
   * @param {Array<Pedido>} pedidos - Lista de pedidos
   * @param {Array} obstaculos - Lista de obstáculos
   * @returns {Array<Pedido>} Rota otimizada
   */
  calcularRotaOtimizada(pedidos, obstaculos = []) {
    if (pedidos.length <= 1) {
      return [...pedidos];
    }

    const rota = [];
    const naoVisitados = [...pedidos];
    let posicaoAtual = this.origem;

    while (naoVisitados.length > 0) {
      let menorDistancia = Infinity;
      let proximoIndice = 0;

      // Encontra o pedido mais próximo
      for (let i = 0; i < naoVisitados.length; i++) {
        const pedido = naoVisitados[i];
        const distancia = this.calcularDistanciaComObstaculos(
          posicaoAtual,
          pedido.localizacao,
          obstaculos
        );

        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          proximoIndice = i;
        }
      }

      const proximo = naoVisitados.splice(proximoIndice, 1)[0];
      rota.push(proximo);
      posicaoAtual = proximo.localizacao;
    }

    return rota;
  }

  /**
   * Calcula distância considerando obstáculos
   */
  calcularDistanciaComObstaculos(ponto1, ponto2, obstaculos) {
    const dx = ponto2.x - ponto1.x;
    const dy = ponto2.y - ponto1.y;
    let distancia = Math.sqrt(dx * dx + dy * dy);

    for (const obstaculo of obstaculos) {
      if (obstaculo.interceptaRota(ponto1, ponto2)) {
        const raioSeguro = obstaculo.raioSeguro || obstaculo.raio + 1;
        const angulo = Math.atan2(ponto2.y - ponto1.y, ponto2.x - ponto1.x);
        const pontoContorno = {
          x: obstaculo.centro.x + Math.cos(angulo + Math.PI / 2) * raioSeguro,
          y: obstaculo.centro.y + Math.sin(angulo + Math.PI / 2) * raioSeguro
        };
        const dist1 = Math.sqrt(
          Math.pow(pontoContorno.x - ponto1.x, 2) +
          Math.pow(pontoContorno.y - ponto1.y, 2)
        );
        const dist2 = Math.sqrt(
          Math.pow(ponto2.x - pontoContorno.x, 2) +
          Math.pow(ponto2.y - pontoContorno.y, 2)
        );
        distancia = Math.max(distancia, dist1 + dist2);
      }
    }

    return distancia;
  }

  /**
   * Encontra melhor combinação de pedidos para um drone
   * @param {Array<Pedido>} pedidos - Lista de pedidos disponíveis
   * @param {Drone} drone - Drone
   * @param {Array} obstaculos - Lista de obstáculos
   * @param {number} maxCombinacoes - Número máximo de combinações a testar
   * @returns {Object} Melhor combinação
   */
  encontrarMelhorCombinacao(pedidos, drone, obstaculos = [], maxCombinacoes = 100) {
    const pedidosDisponiveis = pedidos.filter(p => !p.alocado);
    
    if (pedidosDisponiveis.length === 0) {
      return { score: -1, rota: [], distancia: 0 };
    }

    let melhorCombinacao = null;
    let melhorScore = -1;

    // Testa combinações de 1 até min(4, total) pedidos
    const maxPedidos = Math.min(4, pedidosDisponiveis.length);
    
    for (let tamanho = maxPedidos; tamanho >= 1; tamanho--) {
      const combinacoes = this.gerarCombinacoes(pedidosDisponiveis, tamanho, maxCombinacoes);
      
      for (const combinacao of combinacoes) {
        const resultado = this.calcularScoreCombinacao(combinacao, drone, obstaculos);
        
        if (resultado.score > melhorScore) {
          melhorScore = resultado.score;
          melhorCombinacao = {
            pedidos: resultado.rota,
            score: resultado.score,
            distancia: resultado.distancia,
            peso: resultado.peso,
            usoPeso: resultado.usoPeso,
            usoDistancia: resultado.usoDistancia
          };
        }
      }
    }

    return melhorCombinacao || { score: -1, rota: [], distancia: 0 };
  }

  /**
   * Gera combinações de pedidos (limitado para performance)
   * @param {Array} pedidos - Lista de pedidos
   * @param {number} tamanho - Tamanho da combinação
   * @param {number} max - Número máximo de combinações
   * @returns {Array}
   */
  gerarCombinacoes(pedidos, tamanho, max) {
    if (tamanho === 0 || pedidos.length < tamanho) {
      return [];
    }

    if (tamanho === 1) {
      return pedidos.map(p => [p]);
    }

    // Para performance, limita combinações
    // Prioriza pedidos de maior prioridade
    const pedidosOrdenados = [...pedidos].sort((a, b) => {
      const prioridadeDiff = b.getPrioridadeNumerica() - a.getPrioridadeNumerica();
      if (prioridadeDiff !== 0) return prioridadeDiff;
      return b.peso - a.peso;
    });

    const combinacoes = [];
    const totalCombinacoes = this.fatorial(pedidos.length) / 
                            (this.fatorial(tamanho) * this.fatorial(pedidos.length - tamanho));
    
    if (totalCombinacoes <= max) {
      // Gera todas as combinações
      combinacoes.push(...this.combinacoesRecursivo(pedidosOrdenados, tamanho));
    } else {
      // Gera combinações limitadas (primeiros N pedidos)
      const limitados = pedidosOrdenados.slice(0, Math.min(8, pedidosOrdenados.length));
      combinacoes.push(...this.combinacoesRecursivo(limitados, tamanho));
    }

    return combinacoes.slice(0, max);
  }

  /**
   * Gera combinações recursivamente
   */
  combinacoesRecursivo(arr, tamanho) {
    if (tamanho === 1) {
      return arr.map(x => [x]);
    }

    const combinacoes = [];
    for (let i = 0; i <= arr.length - tamanho; i++) {
      const resto = this.combinacoesRecursivo(arr.slice(i + 1), tamanho - 1);
      for (const comb of resto) {
        combinacoes.push([arr[i], ...comb]);
      }
    }

    return combinacoes;
  }

  /**
   * Calcula fatorial
   */
  fatorial(n) {
    if (n <= 1) return 1;
    return n * this.fatorial(n - 1);
  }
}



