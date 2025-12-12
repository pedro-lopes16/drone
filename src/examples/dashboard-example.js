import { SistemaEntrega } from '../services/SistemaEntrega.js';
import { Dashboard } from '../services/Dashboard.js';

/**
 * Exemplo de uso do Dashboard
 */
async function exemploDashboard() {
  console.log('='.repeat(70));
  console.log('EXEMPLO - Dashboard e Relatórios');
  console.log('='.repeat(70));
  console.log();

  const sistema = new SistemaEntrega({ x: 0, y: 0 });

  // Configura sistema
  sistema.registrarDrone('DRONE-001', 10, 50, 100, 30);
  sistema.registrarDrone('DRONE-002', 8, 40, 100, 25);
  sistema.registrarDrone('DRONE-003', 12, 60, 100, 35);

  sistema.adicionarObstaculo('OBST-001', { x: 8, y: 5 }, 2, 'zona_exclusao');
  sistema.adicionarObstaculo('OBST-002', { x: 15, y: 12 }, 1.5, 'edificio_alto');

  // Cria pedidos
  const pedidos = [
    { id: 'PED-001', localizacao: { x: 5, y: 3 }, peso: 2, prioridade: 'alta' },
    { id: 'PED-002', localizacao: { x: 10, y: 8 }, peso: 3, prioridade: 'media' },
    { id: 'PED-003', localizacao: { x: 15, y: 12 }, peso: 1.5, prioridade: 'alta' },
    { id: 'PED-004', localizacao: { x: 8, y: 6 }, peso: 4, prioridade: 'baixa' },
    { id: 'PED-005', localizacao: { x: 20, y: 15 }, peso: 5, prioridade: 'media' },
    { id: 'PED-006', localizacao: { x: 12, y: 10 }, peso: 2.5, prioridade: 'alta' },
  ];

  pedidos.forEach(p => {
    sistema.criarPedido(p.id, p.localizacao, p.peso, p.prioridade);
  });

  // Processa entregas
  sistema.processarEntregas(true);

  // Simula algumas entregas completas
  sistema.entregasRealizadas.push({
    pedidoId: 'PED-001',
    droneId: 'DRONE-001',
    tempoEntrega: 15.5,
    timestamp: Date.now()
  });

  // Cria dashboard
  const dashboard = new Dashboard(sistema);

  // Exibe dashboard em texto
  console.log(dashboard.gerarDashboardTexto());

  // Exibe relatório JSON
  console.log('\n📄 RELATÓRIO JSON:\n');
  console.log(dashboard.gerarRelatorioJSON());

  // Testa feedback do cliente
  console.log('\n📱 FEEDBACK DO CLIENTE:\n');
  const pedido = sistema.pedidos.find(p => p.id === 'PED-001');
  if (pedido && pedido.alocado) {
    sistema.atualizarFeedbackCliente('PED-001', 'Pedido em trânsito', pedido.droneId);
    const feedback = sistema.getFeedbackCliente('PED-001');
    if (feedback) {
      console.log(`Pedido: ${feedback.pedidoId}`);
      console.log(`Status: ${feedback.mensagem}`);
      if (feedback.mensagemAmigavel) {
        console.log(`Mensagem: ${feedback.mensagemAmigavel}`);
      }
      if (feedback.distancia !== null) {
        console.log(`Distância: ${feedback.distancia} km`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
}

exemploDashboard().catch(console.error);

