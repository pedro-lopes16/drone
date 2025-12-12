# Documentação de Testes

## Executando Testes

```bash
# Testes unitários
npm run test:unit

# Testes de carga
npm run test:carga

# Todos os testes
npm run test:all
```

## Cobertura de Testes

### Testes Unitários

Os testes unitários cobrem:

1. **Validações**
   - Validação de dados de drone (ID, capacidade, bateria, velocidade)
   - Validação de dados de pedido (ID, localização, peso, prioridade)
   - Validação de dados de obstáculo
   - Validação de capacidade (peso do pedido vs capacidade do drone)

2. **Sistema de Entrega**
   - Registro de drones
   - Criação de pedidos
   - Rejeição de dados inválidos
   - Processamento de entregas
   - Alocação de pedidos

3. **Modelos**
   - Cálculo de distância
   - Verificação de capacidade
   - Consumo de bateria
   - Score de prioridade
   - Tempo de espera

### Testes de Carga

Os testes de carga verificam o comportamento do sistema com:

1. **100 pedidos simultâneos**
   - Performance de criação
   - Performance de processamento
   - Taxa de alocação

2. **50 drones simultâneos**
   - Performance de criação
   - Gerenciamento de recursos

3. **20 obstáculos**
   - Performance de criação
   - Impacto no cálculo de rotas

4. **Stress test completo**
   - 10 drones
   - 10 obstáculos
   - 200 pedidos
   - Verificação de performance geral

## Framework de Testes

O projeto usa um framework de testes customizado simples e eficiente:

```javascript
import { TestRunner } from './test-runner.js';

const runner = new TestRunner();

runner.test('Nome do teste', () => {
  runner.assertEquals(esperado, atual);
  runner.assert(condicao);
  runner.assertApprox(esperado, atual, tolerancia);
  runner.assertThrows(() => funcaoQueDeveLancarErro());
});

runner.run();
```

## Exemplos de Testes

### Teste de Validação

```javascript
runner.test('Validador: Drone válido', () => {
  const resultado = Validator.validarDrone({
    id: 'DRONE-001',
    capacidadePeso: 10,
    capacidadeDistancia: 50
  });
  runner.assert(resultado.valido);
  runner.assertEquals(resultado.erros.length, 0);
});
```

### Teste de Rejeição

```javascript
runner.test('Sistema: Rejeitar pedido que excede capacidade', () => {
  const sistema = new SistemaEntrega();
  sistema.registrarDrone('DRONE-001', 10, 50);
  runner.assertThrows(() => {
    sistema.criarPedido('PED-001', { x: 5, y: 3 }, 15, 'alta');
  }, 'Deve rejeitar pedido que excede capacidade');
});
```

### Teste de Carga

```javascript
runner.test('Carga: Processar 100 pedidos', () => {
  const sistema = new SistemaEntrega();
  // ... configuração ...
  const inicio = Date.now();
  // ... processamento ...
  const tempo = Date.now() - inicio;
  runner.assert(tempo < 5000, 'Processamento deve ser rápido');
});
```

## Resultados Esperados

Ao executar os testes, você verá:

```
🧪 Executando testes...

════════════════════════════════════════════════════════════
✅ Validador: Drone válido
✅ Validador: Pedido válido
✅ Sistema: Registrar drone válido
✅ Sistema: Alocar pedido a drone
...
════════════════════════════════════════════════════════════

📊 Resumo: 15 passou, 0 falhou
```

## Adicionando Novos Testes

Para adicionar novos testes, edite os arquivos:
- `src/tests/test-unitarios.js` - Para testes unitários
- `src/tests/test-carga.js` - Para testes de carga



