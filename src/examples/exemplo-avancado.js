import { SistemaEntrega } from '../services/SistemaEntrega.js';
import { EstadoDrone } from '../models/Drone.js';

/**
 * Exemplo completo demonstrando todas as funcionalidades avançadas
 */
async function exemploAvancado() {
  console.log('='.repeat(70));
  console.log('EXEMPLO AVANÇADO - Sistema de Entregas por Drones v2.0');
  console.log('='.repeat(70));
  console.log();

  // Cria o sistema
  const sistema = new SistemaEntrega({ x: 0, y: 0 });

  // 1. Registra drones com bateria e velocidade
  console.log('1. Registrando drones...');
  sistema.registrarDrone('DRONE-001', 10, 50, 100, 30);  // 10kg, 50km, 100% bateria, 30km/h
  sistema.registrarDrone('DRONE-002', 8, 40, 100, 25);   // 8kg, 40km, 100% bateria, 25km/h
  sistema.registrarDrone('DRONE-003', 12, 60, 100, 35); // 12kg, 60km, 100% bateria, 35km/h
  console.log(`   ✓ ${sistema.drones.length} drones registrados\n`);

  // 2. Adiciona obstáculos (zonas de exclusão aérea)
  console.log('2. Adicionando obstáculos...');
  sistema.adicionarObstaculo('OBST-001', { x: 8, y: 5 }, 2, 'zona_exclusao', 3);
  sistema.adicionarObstaculo('OBST-002', { x: 15, y: 12 }, 1.5, 'edificio_alto', 2.5);
  console.log(`   ✓ ${sistema.obstaculos.length} obstáculos adicionados\n`);

  // 3. Cria pedidos com diferentes prioridades e tempos
  console.log('3. Criando pedidos...');
  const pedidos = [
    { id: 'PED-001', localizacao: { x: 5, y: 3 }, peso: 2, prioridade: 'alta' },
    { id: 'PED-002', localizacao: { x: 10, y: 8 }, peso: 3, prioridade: 'media' },
    { id: 'PED-003', localizacao: { x: 15, y: 12 }, peso: 1.5, prioridade: 'alta' },
    { id: 'PED-004', localizacao: { x: 8, y: 6 }, peso: 4, prioridade: 'baixa' },
    { id: 'PED-005', localizacao: { x: 20, y: 15 }, peso: 5, prioridade: 'media' },
    { id: 'PED-006', localizacao: { x: 12, y: 10 }, peso: 2.5, prioridade: 'alta' },
  ];

  pedidos.forEach((p, index) => {
    // Simula pedidos chegando em momentos diferentes
    const tempoChegada = Date.now() - (index * 60000); // 1 minuto de diferença
    sistema.criarPedido(p.id, p.localizacao, p.peso, p.prioridade, tempoChegada);
  });
  console.log(`   ✓ ${pedidos.length} pedidos criados\n`);

  // 4. Exibe status da fila
  console.log('4. Status da Fila de Entregas:');
  const statsFila = sistema.filaEntrega.getEstatisticas();
  console.log(`   - Total pendentes: ${statsFila.totalPendentes}`);
  console.log(`   - Por prioridade: Alta=${statsFila.porPrioridade.alta}, Média=${statsFila.porPrioridade.media}, Baixa=${statsFila.porPrioridade.baixa}`);
  console.log(`   - Tempo médio de espera: ${statsFila.tempoMedioEspera} minutos`);
  console.log(`   - Próximo pedido: ${statsFila.proximoPedido}\n`);

  // 5. Calcula rotas considerando obstáculos
  console.log('5. Calculando rotas com obstáculos:');
  const rota1 = sistema.calcularRotaEntrega('PED-003');
  if (rota1) {
    console.log(`   Rota para ${rota1.pedidoId}:`);
    console.log(`     - Distância direta: ${rota1.distanciaDireta} km`);
    console.log(`     - Distância com obstáculos: ${rota1.distanciaComObstaculos} km`);
    console.log(`     - Obstáculos encontrados: ${rota1.obstaculosEncontrados.length}`);
    console.log(`     - Tempo estimado: ${rota1.tempoEstimado} minutos\n`);
  }

  // 6. Processa entregas com otimização avançada
  console.log('6. Processando entregas (otimização avançada)...');
  const resultado = sistema.processarEntregas(true);
  console.log(`   ✓ Processamento concluído\n`);

  // 7. Exibe resultados
  console.log('7. Resultados da Alocação:');
  console.log(`   - Viagens realizadas: ${resultado.viagensRealizadas}`);
  console.log(`   - Pedidos alocados: ${resultado.pedidosAlocados}/${sistema.pedidos.length}`);
  console.log(`   - Pedidos não alocados: ${resultado.pedidosNaoAlocados.length}\n`);

  // 8. Status detalhado dos drones
  console.log('8. Status Detalhado dos Drones:');
  sistema.getStatusDrones().forEach(drone => {
    console.log(`   ${drone.id}:`);
    console.log(`     - Estado: ${drone.estado}`);
    console.log(`     - Bateria: ${drone.bateriaAtual}%`);
    console.log(`     - Localização: (${drone.localizacaoAtual.x}, ${drone.localizacaoAtual.y})`);
    console.log(`     - Viagens: ${drone.viagensRealizadas}`);
    console.log(`     - Pedidos atuais: ${drone.pedidosAtuais.length}`);
    console.log(`     - Distância percorrida: ${drone.distanciaPercorrida} km`);
    console.log(`     - Tempo total de voo: ${drone.tempoTotalVoo} minutos`);
  });
  console.log();

  // 9. Configura listeners do simulador
  console.log('9. Configurando simulador de eventos...');
  sistema.simulador.on('estadoMudou', (dados) => {
    console.log(`   [EVENTO] Drone ${dados.drone} mudou para estado: ${dados.estado}`);
  });

  sistema.simulador.on('entregaCompleta', (dados) => {
    console.log(`   [EVENTO] Entrega completada pelo drone ${dados.drone}`);
  });

  sistema.simulador.on('bateriaBaixa', (dados) => {
    console.log(`   [ALERTA] Drone ${dados.drone} com bateria baixa: ${dados.bateria.toFixed(1)}%`);
  });

  // 10. Inicia simulação
  console.log('\n10. Iniciando simulação (velocidade 60x)...');
  sistema.simulador.iniciar(60);
  console.log('   ✓ Simulação iniciada\n');

  // Simula alguns segundos
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 11. Status da simulação
  const statsSim = sistema.simulador.getEstatisticas();
  console.log('11. Status da Simulação:');
  console.log(`   - Ativa: ${statsSim.ativo}`);
  console.log(`   - Tempo simulado: ${statsSim.tempoSimulacao} minutos`);
  console.log(`   - Drones ativos: ${statsSim.dronesAtivos}\n`);

  // 12. Estatísticas finais
  console.log('12. Estatísticas Finais do Sistema:');
  const stats = sistema.getEstatisticas();
  Object.entries(stats).forEach(([key, value]) => {
    if (typeof value === 'object') {
      console.log(`   ${key}:`);
      Object.entries(value).forEach(([k, v]) => {
        console.log(`     ${k}: ${v}`);
      });
    } else {
      console.log(`   ${key}: ${value}`);
    }
  });
  console.log();

  // Para a simulação
  sistema.simulador.parar();
  console.log('13. Simulação finalizada\n');

  console.log('='.repeat(70));
  console.log('Exemplo concluído!');
  console.log('='.repeat(70));
}

// Executa o exemplo
exemploAvancado().catch(console.error);

