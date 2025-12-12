import { Drone } from '../models/Drone.js';
import { Pedido } from '../models/Pedido.js';

/**
 * Serviço responsável por alocar pedidos aos drones de forma otimizada
 */
export class AlocadorPedidos {
  constructor(origem = { x: 0, y: 0 }) {
    this.origem = origem;
  }

  /**
   * Aloca pedidos aos drones minimizando o número de viagens
   * @param {Array<Drone>} drones - Lista de drones disponíveis
   * @param {Array<Pedido>} pedidos - Lista de pedidos a serem alocados
   * @returns {Object} Relatório de alocação
   */
  alocarPedidos(drones, pedidos) {
    // Ordena pedidos por prioridade (alta > média > baixa) e depois por peso (maior primeiro)
    const pedidosOrdenados = [...pedidos].sort((a, b) => {
      const prioridadeDiff = b.getPrioridadeNumerica() - a.getPrioridadeNumerica();
      if (prioridadeDiff !== 0) return prioridadeDiff;
      return b.peso - a.peso; // Maior peso primeiro
    });

    const pedidosNaoAlocados = [];
    let viagemAtual = 0;

    // Processa pedidos até que todos sejam alocados ou não haja mais possibilidade
    while (pedidosOrdenados.some(p => !p.alocado)) {
      viagemAtual++;
      
      // Reseta drones para nova viagem
      drones.forEach(drone => drone.finalizarViagem());

      // Tenta alocar cada pedido não alocado
      for (const pedido of pedidosOrdenados) {
        if (pedido.alocado) continue;

        let alocado = false;

        // Tenta alocar em cada drone disponível
        for (const drone of drones) {
          const verificacao = drone.podeCarregar(pedido, this.origem, []);
          if (verificacao.pode) {
            drone.adicionarPedido(pedido, this.origem, []);
            pedido.alocar(drone.id);
            alocado = true;
            break;
          }
        }

        if (!alocado) {
          pedidosNaoAlocados.push(pedido);
        }
      }

      // Se não conseguiu alocar nenhum novo pedido, para o loop
      if (pedidosNaoAlocados.length === pedidosOrdenados.filter(p => !p.alocado).length) {
        break;
      }

      // Limpa lista de não alocados para próxima tentativa
      pedidosNaoAlocados.length = 0;
    }

    return {
      viagensRealizadas: viagemAtual,
      pedidosAlocados: pedidos.filter(p => p.alocado).length,
      pedidosNaoAlocados: pedidos.filter(p => !p.alocado),
      drones: drones.map(d => d.getInfo())
    };
  }

  /**
   * Aloca pedidos usando estratégia de primeiro ajuste (First Fit)
   * Útil para alocações rápidas sem otimização completa
   * @param {Array<Drone>} drones - Lista de drones disponíveis
   * @param {Array<Pedido>} pedidos - Lista de pedidos a serem alocados
   * @returns {Object} Relatório de alocação
   */
  alocarPedidosFirstFit(drones, pedidos) {
    const pedidosOrdenados = [...pedidos].sort((a, b) => {
      const prioridadeDiff = b.getPrioridadeNumerica() - a.getPrioridadeNumerica();
      if (prioridadeDiff !== 0) return prioridadeDiff;
      return b.peso - a.peso;
    });

    const pedidosNaoAlocados = [];

    for (const pedido of pedidosOrdenados) {
      let alocado = false;

      for (const drone of drones) {
        const verificacao = drone.podeCarregar(pedido, this.origem, []);
        if (verificacao.pode) {
          drone.adicionarPedido(pedido, this.origem, []);
          pedido.alocar(drone.id);
          alocado = true;
          break;
        }
      }

      if (!alocado) {
        pedidosNaoAlocados.push(pedido);
      }
    }

    // Calcula número de viagens necessárias
    const maxViagens = Math.max(...drones.map(d => d.viagensRealizadas + (d.pedidosAtuais.length > 0 ? 1 : 0)));

    return {
      viagensRealizadas: maxViagens,
      pedidosAlocados: pedidos.filter(p => p.alocado).length,
      pedidosNaoAlocados: pedidosNaoAlocados,
      drones: drones.map(d => d.getInfo())
    };
  }
}

