import { TestRunner } from './test-runner.js';
import { SistemaEntrega } from '../services/SistemaEntrega.js';
import { Drone } from '../models/Drone.js';
import { Pedido } from '../models/Pedido.js';
import { Validator, ErroValidacao, ErroCapacidade } from '../utils/validators.js';

const runner = new TestRunner();

// Testes de Validação
runner.test('Validador: Drone válido', () => {
  const resultado = Validator.validarDrone({
    id: 'DRONE-001',
    capacidadePeso: 10,
    capacidadeDistancia: 50
  });
  runner.assert(resultado.valido, 'Drone válido deve passar na validação');
  runner.assertEquals(resultado.erros.length, 0);
});

runner.test('Validador: Drone inválido - ID vazio', () => {
  const resultado = Validator.validarDrone({
    id: '',
    capacidadePeso: 10,
    capacidadeDistancia: 50
  });
  runner.assert(!resultado.valido, 'Drone com ID vazio deve falhar');
  runner.assert(resultado.erros.length > 0);
});

runner.test('Validador: Drone inválido - Peso negativo', () => {
  const resultado = Validator.validarDrone({
    id: 'DRONE-001',
    capacidadePeso: -10,
    capacidadeDistancia: 50
  });
  runner.assert(!resultado.valido);
});

runner.test('Validador: Pedido válido', () => {
  const resultado = Validator.validarPedido({
    id: 'PED-001',
    localizacao: { x: 5, y: 3 },
    peso: 2,
    prioridade: 'alta'
  });
  runner.assert(resultado.valido);
});

runner.test('Validador: Pedido inválido - Peso zero', () => {
  const resultado = Validator.validarPedido({
    id: 'PED-001',
    localizacao: { x: 5, y: 3 },
    peso: 0
  });
  runner.assert(!resultado.valido);
});

runner.test('Validador: Capacidade - Pedido muito pesado', () => {
  const resultado = Validator.validarCapacidadePedido(
    { peso: 15 },
    { capacidadePeso: 10 }
  );
  runner.assert(!resultado.pode);
  runner.assert(resultado.motivo.includes('excede'));
});

// Testes de Sistema
runner.test('Sistema: Registrar drone válido', () => {
  const sistema = new SistemaEntrega();
  const drone = sistema.registrarDrone('DRONE-001', 10, 50);
  runner.assertEquals(drone.id, 'DRONE-001');
  runner.assertEquals(sistema.drones.length, 1);
});

runner.test('Sistema: Rejeitar drone duplicado', () => {
  const sistema = new SistemaEntrega();
  sistema.registrarDrone('DRONE-001', 10, 50);
  runner.assertThrows(() => {
    sistema.registrarDrone('DRONE-001', 10, 50);
  });
});

runner.test('Sistema: Criar pedido válido', () => {
  const sistema = new SistemaEntrega();
  sistema.registrarDrone('DRONE-001', 10, 50);
  const pedido = sistema.criarPedido('PED-001', { x: 5, y: 3 }, 2, 'alta');
  runner.assertEquals(pedido.id, 'PED-001');
  runner.assertEquals(sistema.pedidos.length, 1);
});

runner.test('Sistema: Rejeitar pedido que excede capacidade', () => {
  const sistema = new SistemaEntrega();
  sistema.registrarDrone('DRONE-001', 10, 50);
  runner.assertThrows(() => {
    sistema.criarPedido('PED-001', { x: 5, y: 3 }, 15, 'alta');
  }, 'Deve rejeitar pedido que excede capacidade');
});

runner.test('Sistema: Processar entregas sem pedidos', () => {
  const sistema = new SistemaEntrega();
  sistema.registrarDrone('DRONE-001', 10, 50);
  const resultado = sistema.processarEntregas();
  runner.assertEquals(resultado.pedidosAlocados, 0);
  runner.assert(resultado.mensagem.includes('Não há pedidos'));
});

runner.test('Sistema: Alocar pedido a drone', () => {
  const sistema = new SistemaEntrega();
  sistema.registrarDrone('DRONE-001', 10, 50);
  sistema.criarPedido('PED-001', { x: 5, y: 3 }, 2, 'alta');
  const resultado = sistema.processarEntregas();
  runner.assert(resultado.pedidosAlocados > 0);
});

// Testes de Drone
runner.test('Drone: Calcular distância', () => {
  const drone = new Drone('DRONE-001', 10, 50);
  const distancia = drone.calcularDistancia({ x: 0, y: 0 }, { x: 3, y: 4 });
  runner.assertApprox(distancia, 5, 0.01);
});

runner.test('Drone: Verificar capacidade de peso', () => {
  const drone = new Drone('DRONE-001', 10, 50);
  const pedido = new Pedido('PED-001', { x: 5, y: 3 }, 5, 'alta');
  const resultado = drone.podeCarregar(pedido, { x: 0, y: 0 }, []);
  runner.assert(resultado.pode);
});

runner.test('Drone: Rejeitar pedido que excede peso', () => {
  const drone = new Drone('DRONE-001', 10, 50);
  const pedido = new Pedido('PED-001', { x: 5, y: 3 }, 15, 'alta');
  const resultado = drone.podeCarregar(pedido, { x: 0, y: 0 }, []);
  runner.assert(!resultado.pode);
  runner.assert(resultado.motivo.includes('peso'));
});

runner.test('Drone: Consumo de bateria', () => {
  const drone = new Drone('DRONE-001', 10, 50, 100);
  const bateriaInicial = drone.bateriaAtual;
  drone.consumirBateria(10); // 10 km
  runner.assert(drone.bateriaAtual < bateriaInicial);
});

// Testes de Pedido
runner.test('Pedido: Calcular score de prioridade', () => {
  const pedido = new Pedido('PED-001', { x: 5, y: 3 }, 2, 'alta');
  const score = pedido.calcularScorePrioridade();
  runner.assert(score >= 300); // Alta prioridade = 300 base
});

runner.test('Pedido: Tempo de espera', () => {
  const tempoChegada = Date.now() - 60000; // 1 minuto atrás
  const pedido = new Pedido('PED-001', { x: 5, y: 3 }, 2, 'alta', tempoChegada);
  const tempoEspera = pedido.getTempoEspera();
  runner.assert(tempoEspera >= 0.9); // Aproximadamente 1 minuto
});

// Executa os testes
runner.run().then(resultados => {
  process.exit(resultados.falhou > 0 ? 1 : 0);
});



