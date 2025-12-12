/**
 * Funções auxiliares para o sistema de entregas
 */

/**
 * Calcula a distância euclidiana entre dois pontos
 * @param {Object} ponto1 - {x, y}
 * @param {Object} ponto2 - {x, y}
 * @returns {number} Distância em km
 */
export function calcularDistancia(ponto1, ponto2) {
  const dx = ponto2.x - ponto1.x;
  const dy = ponto2.y - ponto1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Valida se um pedido pode ser entregue por um drone
 * @param {Object} pedido - {peso, localizacao}
 * @param {Object} drone - {capacidadePeso, capacidadeDistancia}
 * @param {Object} origem - {x, y}
 * @returns {boolean}
 */
export function validarEntrega(pedido, drone, origem) {
  const distancia = calcularDistancia(origem, pedido.localizacao);
  return pedido.peso <= drone.capacidadePeso && distancia <= drone.capacidadeDistancia;
}

/**
 * Formata um relatório de alocação para exibição
 * @param {Object} resultado - Resultado do processamento
 * @returns {string}
 */
export function formatarRelatorio(resultado) {
  let relatorio = '\n=== RELATÓRIO DE ALOCAÇÃO ===\n\n';
  relatorio += `Viagens Realizadas: ${resultado.viagensRealizadas}\n`;
  relatorio += `Pedidos Alocados: ${resultado.pedidosAlocados}\n`;
  relatorio += `Pedidos Não Alocados: ${resultado.pedidosNaoAlocados.length}\n\n`;

  if (resultado.pedidosNaoAlocados.length > 0) {
    relatorio += 'Pedidos Não Alocados:\n';
    resultado.pedidosNaoAlocados.forEach(pedido => {
      relatorio += `  - ${pedido.id}: ${pedido.peso}kg, prioridade ${pedido.prioridade}\n`;
    });
    relatorio += '\n';
  }

  relatorio += 'Status dos Drones:\n';
  resultado.drones.forEach(drone => {
    relatorio += `  ${drone.id}: ${drone.viagensRealizadas} viagens\n`;
  });

  return relatorio;
}


