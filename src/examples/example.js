import { SistemaEntrega } from '../services/SistemaEntrega.js';

/**
 * Exemplo completo de uso do sistema de entregas por drones
 */
function exemploCompleto() {
  console.log('='.repeat(60));
  console.log('EXEMPLO COMPLETO - Sistema de Entregas por Drones');
  console.log('='.repeat(60));
  console.log();

  // Cria o sistema com ponto de origem
  const sistema = new SistemaEntrega({ x: 0, y: 0 });

  // Registra drones com diferentes capacidades
  console.log('1. Registrando drones...');
  sistema.registrarDrone('DRONE-001', 10, 50);  // 10kg, 50km
  sistema.registrarDrone('DRONE-002', 8, 40);   // 8kg, 40km
  sistema.registrarDrone('DRONE-003', 12, 60);  // 12kg, 60km
  sistema.registrarDrone('DRONE-004', 15, 70);   // 15kg, 70km
  console.log(`   ✓ ${sistema.drones.length} drones registrados\n`);

  // Cria pedidos variados
  console.log('2. Criando pedidos...');
  const pedidos = [
    { id: 'PED-001', localizacao: { x: 5, y: 3 }, peso: 2, prioridade: 'alta' },
    { id: 'PED-002', localizacao: { x: 10, y: 8 }, peso: 3, prioridade: 'media' },
    { id: 'PED-003', localizacao: { x: 15, y: 12 }, peso: 1.5, prioridade: 'alta' },
    { id: 'PED-004', localizacao: { x: 8, y: 6 }, peso: 4, prioridade: 'baixa' },
    { id: 'PED-005', localizacao: { x: 20, y: 15 }, peso: 5, prioridade: 'media' },
    { id: 'PED-006', localizacao: { x: 12, y: 10 }, peso: 2.5, prioridade: 'alta' },
    { id: 'PED-007', localizacao: { x: 25, y: 20 }, peso: 6, prioridade: 'baixa' },
    { id: 'PED-008', localizacao: { x: 7, y: 4 }, peso: 1, prioridade: 'media' },
  ];

  pedidos.forEach(p => {
    sistema.criarPedido(p.id, p.localizacao, p.peso, p.prioridade);
  });
  console.log(`   ✓ ${pedidos.length} pedidos criados\n`);

  // Processa entregas
  console.log('3. Processando entregas (algoritmo otimizado)...');
  const resultado = sistema.processarEntregas(true);
  console.log(`   ✓ Processamento concluído\n`);

  // Exibe resultados
  console.log('4. Resultados da Alocação:');
  console.log(`   - Viagens realizadas: ${resultado.viagensRealizadas}`);
  console.log(`   - Pedidos alocados: ${resultado.pedidosAlocados}/${sistema.pedidos.length}`);
  console.log(`   - Pedidos não alocados: ${resultado.pedidosNaoAlocados.length}\n`);

  // Detalhes dos drones
  console.log('5. Detalhes dos Drones:');
  resultado.drones.forEach(drone => {
    console.log(`   ${drone.id}:`);
    console.log(`     - Viagens: ${drone.viagensRealizadas}`);
    console.log(`     - Capacidade: ${drone.capacidadePeso}kg / ${drone.capacidadeDistancia}km`);
  });
  console.log();

  // Pedidos não alocados
  if (resultado.pedidosNaoAlocados.length > 0) {
    console.log('6. Pedidos não alocados:');
    resultado.pedidosNaoAlocados.forEach(pedido => {
      const distancia = Math.sqrt(
        Math.pow(pedido.localizacao.x - sistema.origem.x, 2) +
        Math.pow(pedido.localizacao.y - sistema.origem.y, 2)
      );
      console.log(`   - ${pedido.id}: ${pedido.peso}kg, prioridade ${pedido.prioridade}, distância ${distancia.toFixed(2)}km`);
    });
    console.log();
  }

  // Estatísticas finais
  console.log('7. Estatísticas do Sistema:');
  const stats = sistema.getEstatisticas();
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  console.log();

  // Detalhes de alocação por pedido
  console.log('8. Detalhes de Alocação por Pedido:');
  sistema.getStatusPedidos().forEach(pedido => {
    const status = pedido.alocado ? `✓ Alocado ao ${pedido.droneId}` : '✗ Não alocado';
    console.log(`   ${pedido.id}: ${pedido.peso}kg, ${pedido.prioridade} - ${status}`);
  });
  console.log();

  console.log('='.repeat(60));
}

/**
 * Exemplo comparando algoritmos otimizado vs first-fit
 */
function exemploComparacao() {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('EXEMPLO - Comparação de Algoritmos');
  console.log('='.repeat(60));
  console.log();

  const pedidos = [
    { id: 'PED-001', localizacao: { x: 5, y: 3 }, peso: 2, prioridade: 'alta' },
    { id: 'PED-002', localizacao: { x: 10, y: 8 }, peso: 3, prioridade: 'media' },
    { id: 'PED-003', localizacao: { x: 15, y: 12 }, peso: 1.5, prioridade: 'alta' },
    { id: 'PED-004', localizacao: { x: 8, y: 6 }, peso: 4, prioridade: 'baixa' },
    { id: 'PED-005', localizacao: { x: 20, y: 15 }, peso: 5, prioridade: 'media' },
  ];

  // Teste com algoritmo otimizado
  console.log('Teste 1: Algoritmo Otimizado');
  const sistema1 = new SistemaEntrega({ x: 0, y: 0 });
  sistema1.registrarDrone('DRONE-001', 10, 50);
  sistema1.registrarDrone('DRONE-002', 8, 40);
  pedidos.forEach(p => sistema1.criarPedido(p.id, p.localizacao, p.peso, p.prioridade));
  const resultado1 = sistema1.processarEntregas(true);
  console.log(`   Viagens: ${resultado1.viagensRealizadas}, Alocados: ${resultado1.pedidosAlocados}\n`);

  // Teste com algoritmo first-fit
  console.log('Teste 2: Algoritmo First-Fit');
  const sistema2 = new SistemaEntrega({ x: 0, y: 0 });
  sistema2.registrarDrone('DRONE-001', 10, 50);
  sistema2.registrarDrone('DRONE-002', 8, 40);
  pedidos.forEach(p => sistema2.criarPedido(p.id, p.localizacao, p.peso, p.prioridade));
  const resultado2 = sistema2.processarEntregas(false);
  console.log(`   Viagens: ${resultado2.viagensRealizadas}, Alocados: ${resultado2.pedidosAlocados}\n`);

  console.log('='.repeat(60));
}

// Executa os exemplos
exemploCompleto();
exemploComparacao();



