import { SistemaEntrega } from './services/SistemaEntrega.js';

// Exemplo de uso básico
const sistema = new SistemaEntrega({ x: 0, y: 0 });

// Registra alguns drones
sistema.registrarDrone('DRONE-001', 10, 50); // 10kg, 50km
sistema.registrarDrone('DRONE-002', 8, 40);   // 8kg, 40km
sistema.registrarDrone('DRONE-003', 12, 60); // 12kg, 60km

// Cria alguns pedidos
sistema.criarPedido('PED-001', { x: 5, y: 3 }, 2, 'alta');
sistema.criarPedido('PED-002', { x: 10, y: 8 }, 3, 'media');
sistema.criarPedido('PED-003', { x: 15, y: 12 }, 1.5, 'alta');
sistema.criarPedido('PED-004', { x: 8, y: 6 }, 4, 'baixa');
sistema.criarPedido('PED-005', { x: 20, y: 15 }, 5, 'media');

// Processa as entregas
console.log('=== Sistema de Entregas por Drones ===\n');
console.log('Processando entregas...\n');

const resultado = sistema.processarEntregas(true);

console.log('Resultado da Alocação:');
console.log(`- Viagens realizadas: ${resultado.viagensRealizadas}`);
console.log(`- Pedidos alocados: ${resultado.pedidosAlocados}`);
console.log(`- Pedidos não alocados: ${resultado.pedidosNaoAlocados.length}\n`);

if (resultado.pedidosNaoAlocados.length > 0) {
  console.log('Pedidos não alocados:');
  resultado.pedidosNaoAlocados.forEach(pedido => {
    console.log(`  - ${pedido.id}: ${pedido.peso}kg, prioridade ${pedido.prioridade}, localização (${pedido.localizacao.x}, ${pedido.localizacao.y})`);
  });
  console.log();
}

console.log('Status dos Drones:');
resultado.drones.forEach(drone => {
  console.log(`  ${drone.id}: ${drone.viagensRealizadas} viagens realizadas`);
});

console.log('\nEstatísticas do Sistema:');
const stats = sistema.getEstatisticas();
console.log(JSON.stringify(stats, null, 2));



