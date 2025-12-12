import { TestRunner } from './test-runner.js';
import { SistemaEntrega } from '../services/SistemaEntrega.js';

const runner = new TestRunner();

/**
 * Teste de carga: Muitos pedidos
 */
runner.test('Carga: Processar 100 pedidos', () => {
  const sistema = new SistemaEntrega();
  
  // Cria 5 drones
  for (let i = 1; i <= 5; i++) {
    sistema.registrarDrone(`DRONE-${String(i).padStart(3, '0')}`, 10, 50);
  }

  // Cria 100 pedidos
  const inicio = Date.now();
  for (let i = 1; i <= 100; i++) {
    const x = Math.random() * 50;
    const y = Math.random() * 50;
    const peso = Math.random() * 8 + 1; // 1-9 kg
    const prioridades = ['baixa', 'media', 'alta'];
    const prioridade = prioridades[Math.floor(Math.random() * 3)];
    
    sistema.criarPedido(
      `PED-${String(i).padStart(3, '0')}`,
      { x, y },
      peso,
      prioridade
    );
  }
  const tempoCriacao = Date.now() - inicio;

  // Processa entregas
  const inicioProcessamento = Date.now();
  const resultado = sistema.processarEntregas(true);
  const tempoProcessamento = Date.now() - inicioProcessamento;

  runner.assert(resultado.pedidosAlocados > 0, 'Deve alocar pelo menos alguns pedidos');
  runner.assert(tempoCriacao < 1000, `Criação deve ser rápida (< 1s), levou ${tempoCriacao}ms`);
  runner.assert(tempoProcessamento < 5000, `Processamento deve ser razoável (< 5s), levou ${tempoProcessamento}ms`);
  
  console.log(`   ✅ Criados 100 pedidos em ${tempoCriacao}ms`);
  console.log(`   ✅ Processados em ${tempoProcessamento}ms`);
  console.log(`   ✅ Alocados: ${resultado.pedidosAlocados}/100`);
});

/**
 * Teste de carga: Muitos drones
 */
runner.test('Carga: Sistema com 50 drones', () => {
  const sistema = new SistemaEntrega();
  const inicio = Date.now();

  for (let i = 1; i <= 50; i++) {
    sistema.registrarDrone(
      `DRONE-${String(i).padStart(3, '0')}`,
      10 + Math.random() * 5,
      50 + Math.random() * 20
    );
  }

  const tempo = Date.now() - inicio;
  runner.assertEquals(sistema.drones.length, 50);
  runner.assert(tempo < 100, `Criação de 50 drones deve ser rápida (< 100ms), levou ${tempo}ms`);
  
  console.log(`   ✅ 50 drones criados em ${tempo}ms`);
});

/**
 * Teste de carga: Muitos obstáculos
 */
runner.test('Carga: Sistema com 20 obstáculos', () => {
  const sistema = new SistemaEntrega();
  const inicio = Date.now();

  for (let i = 1; i <= 20; i++) {
    sistema.adicionarObstaculo(
      `OBST-${String(i).padStart(3, '0')}`,
      { x: Math.random() * 50, y: Math.random() * 50 },
      1 + Math.random() * 2
    );
  }

  const tempo = Date.now() - inicio;
  runner.assertEquals(sistema.obstaculos.length, 20);
  runner.assert(tempo < 100, `Criação de 20 obstáculos deve ser rápida (< 100ms), levou ${tempo}ms`);
  
  console.log(`   ✅ 20 obstáculos criados em ${tempo}ms`);
});

/**
 * Teste de carga: Stress test completo
 */
runner.test('Carga: Stress test completo', () => {
  const sistema = new SistemaEntrega();
  
  // Cria 10 drones
  for (let i = 1; i <= 10; i++) {
    sistema.registrarDrone(`DRONE-${String(i).padStart(3, '0')}`, 10, 50);
  }

  // Cria 10 obstáculos
  for (let i = 1; i <= 10; i++) {
    sistema.adicionarObstaculo(
      `OBST-${String(i).padStart(3, '0')}`,
      { x: Math.random() * 30, y: Math.random() * 30 },
      2
    );
  }

  // Cria 200 pedidos
  for (let i = 1; i <= 200; i++) {
    const x = Math.random() * 30;
    const y = Math.random() * 30;
    const peso = Math.random() * 8 + 1;
    const prioridades = ['baixa', 'media', 'alta'];
    const prioridade = prioridades[Math.floor(Math.random() * 3)];
    
    try {
      sistema.criarPedido(
        `PED-${String(i).padStart(3, '0')}`,
        { x, y },
        peso,
        prioridade
      );
    } catch (error) {
      // Alguns podem ser rejeitados por capacidade
    }
  }

  const inicio = Date.now();
  const resultado = sistema.processarEntregas(true);
  const tempo = Date.now() - inicio;

  runner.assert(resultado.pedidosAlocados > 0);
  runner.assert(tempo < 10000, `Processamento deve ser razoável (< 10s), levou ${tempo}ms`);
  
  const stats = sistema.getEstatisticas();
  console.log(`   ✅ Processados ${sistema.pedidos.length} pedidos em ${tempo}ms`);
  console.log(`   ✅ Taxa de sucesso: ${stats.taxaSucesso}`);
});

// Executa os testes
runner.run().then(resultados => {
  process.exit(resultados.falhou > 0 ? 1 : 0);
});

