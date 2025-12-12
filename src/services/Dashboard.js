/**
 * Sistema de Dashboard e Relatórios
 */
export class Dashboard {
  constructor(sistemaEntrega) {
    this.sistema = sistemaEntrega;
  }

  /**
   * Gera relatório completo do sistema
   * @returns {Object}
   */
  gerarRelatorio() {
    const stats = this.sistema.getEstatisticas();
    const drones = this.sistema.getStatusDrones();
    const pedidos = this.sistema.getStatusPedidos();

    return {
      timestamp: new Date().toISOString(),
      resumo: {
        totalDrones: stats.totalDrones,
        dronesAtivos: stats.dronesAtivos,
        totalPedidos: stats.totalPedidos,
        entregasRealizadas: stats.entregasRealizadas,
        taxaSucesso: stats.taxaSucesso,
        tempoMedioEntrega: stats.tempoMedioEntrega
      },
      drones: drones,
      pedidos: pedidos,
      estatisticas: stats
    };
  }

  /**
   * Gera visualização ASCII do mapa de entregas
   * @param {number} largura - Largura do mapa (padrão: 50)
   * @param {number} altura - Altura do mapa (padrão: 30)
   * @returns {string}
   */
  gerarMapaASCII(largura = 50, altura = 30) {
    const mapa = Array(altura).fill(null).map(() => Array(largura).fill(' '));
    
    // Encontra limites do mapa baseado nas localizações
    const todasLocalizacoes = [
      this.sistema.origem,
      ...this.sistema.pedidos.map(p => p.localizacao),
      ...this.sistema.obstaculos.map(o => o.centro)
    ];

    if (todasLocalizacoes.length === 0) {
      return 'Nenhuma localização para exibir';
    }

    const minX = Math.min(...todasLocalizacoes.map(l => l.x));
    const maxX = Math.max(...todasLocalizacoes.map(l => l.x));
    const minY = Math.min(...todasLocalizacoes.map(l => l.y));
    const maxY = Math.max(...todasLocalizacoes.map(l => l.y));

    const escalaX = largura / (maxX - minX || 1);
    const escalaY = altura / (maxY - minY || 1);

    // Função para converter coordenadas para posição no mapa
    const paraMapa = (x, y) => {
      const mapX = Math.floor((x - minX) * escalaX);
      const mapY = Math.floor((y - minY) * escalaY);
      return {
        x: Math.max(0, Math.min(largura - 1, mapX)),
        y: Math.max(0, Math.min(altura - 1, mapY))
      };
    };

    // Desenha obstáculos
    this.sistema.obstaculos.forEach(obstaculo => {
      const centro = paraMapa(obstaculo.centro.x, obstaculo.centro.y);
      const raioMapa = Math.ceil(obstaculo.raio * Math.min(escalaX, escalaY));
      
      for (let y = Math.max(0, centro.y - raioMapa); y <= Math.min(altura - 1, centro.y + raioMapa); y++) {
        for (let x = Math.max(0, centro.x - raioMapa); x <= Math.min(largura - 1, centro.x + raioMapa); x++) {
          const dist = Math.sqrt(Math.pow(x - centro.x, 2) + Math.pow(y - centro.y, 2));
          if (dist <= raioMapa) {
            mapa[y][x] = '█';
          }
        }
      }
    });

    // Desenha origem (base)
    const origemMapa = paraMapa(this.sistema.origem.x, this.sistema.origem.y);
    mapa[origemMapa.y][origemMapa.x] = 'B';

    // Desenha pedidos
    this.sistema.pedidos.forEach((pedido, index) => {
      const pos = paraMapa(pedido.localizacao.x, pedido.localizacao.y);
      if (mapa[pos.y][pos.x] === ' ') {
        mapa[pos.y][pos.x] = pedido.alocado ? '✓' : 'P';
      }
    });

    // Desenha drones
    this.sistema.drones.forEach(drone => {
      if (drone.localizacaoAtual) {
        const pos = paraMapa(drone.localizacaoAtual.x, drone.localizacaoAtual.y);
        if (mapa[pos.y][pos.x] === ' ' || mapa[pos.y][pos.x] === 'P') {
          mapa[pos.y][pos.x] = 'D';
        }
      }
    });

    // Converte para string
    let resultado = '\n';
    resultado += '═'.repeat(largura + 4) + '\n';
    resultado += '  MAPA DE ENTREGAS\n';
    resultado += '═'.repeat(largura + 4) + '\n';
    
    for (let y = altura - 1; y >= 0; y--) {
      resultado += '│ ';
      for (let x = 0; x < largura; x++) {
        resultado += mapa[y][x];
      }
      resultado += ' │\n';
    }
    
    resultado += '═'.repeat(largura + 4) + '\n';
    resultado += 'Legenda:\n';
    resultado += '  B = Base/Origem\n';
    resultado += '  D = Drone\n';
    resultado += '  P = Pedido Pendente\n';
    resultado += '  ✓ = Pedido Alocado\n';
    resultado += '  █ = Obstáculo/Zona de Exclusão\n';

    return resultado;
  }

  /**
   * Gera dashboard em formato texto
   * @returns {string}
   */
  gerarDashboardTexto() {
    const stats = this.sistema.getEstatisticas();
    const drones = this.sistema.getStatusDrones();
    
    let dashboard = '\n';
    dashboard += '╔═══════════════════════════════════════════════════════════╗\n';
    dashboard += '║           DASHBOARD - SISTEMA DE ENTREGAS                ║\n';
    dashboard += '╚═══════════════════════════════════════════════════════════╝\n\n';

    // Resumo Geral
    dashboard += '📊 RESUMO GERAL\n';
    dashboard += '─'.repeat(55) + '\n';
    dashboard += `  Total de Drones: ${stats.totalDrones}\n`;
    dashboard += `  Drones Ativos: ${stats.dronesAtivos}\n`;
    dashboard += `  Drones Ociosos: ${stats.dronesIdle}\n`;
    dashboard += `  Drones Recarregando: ${stats.dronesRecarregando}\n`;
    dashboard += `  Total de Pedidos: ${stats.totalPedidos}\n`;
    dashboard += `  Pedidos Alocados: ${stats.pedidosAlocados}\n`;
    dashboard += `  Pedidos Pendentes: ${stats.pedidosNaoAlocados}\n`;
    dashboard += `  Entregas Realizadas: ${stats.entregasRealizadas}\n`;
    dashboard += `  Taxa de Sucesso: ${stats.taxaSucesso}\n`;
    dashboard += `  Tempo Médio de Entrega: ${stats.tempoMedioEntrega} minutos\n`;
    dashboard += `  Total de Viagens: ${stats.totalViagens}\n\n`;

    // Drone Mais Eficiente
    if (stats.droneMaisEficiente) {
      dashboard += '🏆 DRONE MAIS EFICIENTE\n';
      dashboard += '─'.repeat(55) + '\n';
      dashboard += `  ID: ${stats.droneMaisEficiente.id}\n`;
      dashboard += `  Viagens Realizadas: ${stats.droneMaisEficiente.viagens}\n`;
      dashboard += `  Distância Total: ${stats.droneMaisEficiente.distanciaTotal} km\n`;
      dashboard += `  Tempo Total de Voo: ${stats.droneMaisEficiente.tempoVoo} minutos\n\n`;
    }

    // Status dos Drones
    dashboard += '🚁 STATUS DOS DRONES\n';
    dashboard += '─'.repeat(55) + '\n';
    drones.forEach(drone => {
      const estadoEmoji = {
        'idle': '💤',
        'carregando': '📦',
        'em_voo': '✈️',
        'entregando': '📮',
        'retornando': '🔙',
        'recarregando': '🔋'
      };
      
      dashboard += `  ${drone.id} ${estadoEmoji[drone.estado] || '❓'} ${drone.estado.toUpperCase()}\n`;
      dashboard += `     Bateria: ${drone.bateriaAtual}% | Pedidos: ${drone.pedidosAtuais} | Viagens: ${drone.viagensRealizadas}\n`;
      dashboard += `     Localização: (${drone.localizacaoAtual.x}, ${drone.localizacaoAtual.y})\n`;
    });
    dashboard += '\n';

    // Fila de Entregas
    if (stats.fila) {
      dashboard += '📋 FILA DE ENTREGAS\n';
      dashboard += '─'.repeat(55) + '\n';
      dashboard += `  Pendentes: ${stats.fila.totalPendentes}\n`;
      dashboard += `  Alta Prioridade: ${stats.fila.porPrioridade.alta}\n`;
      dashboard += `  Média Prioridade: ${stats.fila.porPrioridade.media}\n`;
      dashboard += `  Baixa Prioridade: ${stats.fila.porPrioridade.baixa}\n`;
      dashboard += `  Tempo Médio de Espera: ${stats.fila.tempoMedioEspera} minutos\n`;
      if (stats.fila.proximoPedido) {
        dashboard += `  Próximo Pedido: ${stats.fila.proximoPedido}\n`;
      }
      dashboard += '\n';
    }

    // Mapa
    dashboard += this.gerarMapaASCII(40, 20);

    return dashboard;
  }

  /**
   * Gera relatório JSON
   * @returns {string}
   */
  gerarRelatorioJSON() {
    return JSON.stringify(this.gerarRelatorio(), null, 2);
  }
}


