# Sistema de Entregas por Drones v2.0

Sistema avançado de simulação de gerenciamento de entregas por drones em áreas urbanas, desenvolvido em Node.js. O sistema inclui otimização inteligente, gerenciamento de bateria, obstáculos, simulação orientada a eventos e API RESTful completa.

## 🚀 Características Principais

### Funcionalidades Básicas
- **Gerenciamento de Drones**: Capacidade de peso (kg), distância (km), bateria e velocidade
- **Sistema de Pedidos**: Localização, peso, prioridade (baixa, média, alta) e tempo de chegada
- **Algoritmo de Otimização**: Minimiza o número de viagens necessárias
- **Priorização Inteligente**: Prioriza pedidos por prioridade e tempo de espera

### Funcionalidades Avançadas ✨
- **Sistema de Bateria**: Bateria diminui com distância e peso carregado
- **Obstáculos/Zonas de Exclusão**: Evita zonas proibidas e calcula rotas alternativas
- **Estados do Drone**: Idle → Carregando → Em voo → Entregando → Retornando → Recarregando
- **Cálculo de Tempo**: Tempo total de entrega baseado em distância e velocidade
- **Fila de Entrega**: Sistema de fila com priorização por score (prioridade + tempo de espera)
- **Otimização Avançada**: Maximiza uso de capacidade e combina múltiplos pedidos por viagem
- **Simulação Orientada a Eventos**: Simulação em tempo real com eventos e callbacks
- **API RESTful**: Endpoints completos para gerenciamento via HTTP

## 📋 Requisitos

- Node.js 14+ (com suporte a ES Modules)
- npm ou yarn (para instalar dependências)

## 🛠️ Instalação

```bash
# Clone o repositório ou navegue até a pasta do projeto
cd drone

# Instale as dependências
npm install

# O projeto está pronto para uso!
```

## 📖 Uso Básico

```javascript
import { SistemaEntrega } from './src/services/SistemaEntrega.js';

// Cria o sistema com ponto de origem
const sistema = new SistemaEntrega({ x: 0, y: 0 });

// Registra drones (com bateria e velocidade)
sistema.registrarDrone('DRONE-001', 10, 50, 100, 30);  // 10kg, 50km, 100% bateria, 30km/h

// Adiciona obstáculos
sistema.adicionarObstaculo('OBST-001', { x: 8, y: 5 }, 2, 'zona_exclusao');

// Cria pedidos
sistema.criarPedido('PED-001', { x: 5, y: 3 }, 2, 'alta');
sistema.criarPedido('PED-002', { x: 10, y: 8 }, 3, 'media');

// Processa entregas com otimização avançada
const resultado = sistema.processarEntregas(true);

console.log(`Viagens realizadas: ${resultado.viagensRealizadas}`);
console.log(`Pedidos alocados: ${resultado.pedidosAlocados}`);
```

## 🎯 Executando Exemplos

```bash
# Executa exemplo básico
npm start

# Executa exemplos completos
npm test

# Executa exemplo avançado (com todas as funcionalidades)
npm run exemplo-avancado

# Inicia servidor API REST
npm run api
```

## 📁 Estrutura do Projeto

```
drone/
├── src/
│   ├── models/
│   │   ├── Drone.js          # Drone com bateria e estados
│   │   ├── Pedido.js         # Pedido com tempo de chegada
│   │   └── Obstaculo.js      # Zonas de exclusão aérea
│   ├── services/
│   │   ├── AlocadorPedidos.js      # Alocação básica
│   │   ├── OtimizadorAvancado.js   # Otimização inteligente
│   │   ├── FilaEntrega.js          # Sistema de fila
│   │   ├── SimuladorEventos.js     # Simulação orientada a eventos
│   │   └── SistemaEntrega.js       # Sistema principal
│   ├── api/
│   │   └── server.js          # Servidor Express com API REST
│   ├── examples/
│   │   ├── example.js         # Exemplos básicos
│   │   └── exemplo-avancado.js # Exemplos avançados
│   ├── utils/
│   │   └── helpers.js         # Funções auxiliares
│   └── index.js               # Exemplo básico
├── package.json
└── README.md
```

## 🔧 API Principal

### SistemaEntrega

#### `registrarDrone(id, capacidadePeso, capacidadeDistancia, bateriaMaxima, velocidadeMedia)`
Registra um novo drone no sistema.

#### `criarPedido(id, localizacao, peso, prioridade, tempoChegada)`
Cria um novo pedido. Prioridade: 'baixa', 'media', 'alta'.

#### `adicionarObstaculo(id, centro, raio, tipo, raioSeguro)`
Adiciona uma zona de exclusão aérea.

#### `processarEntregas(usarOtimizadorAvancado = true)`
Processa todos os pedidos não alocados usando otimização avançada.

#### `calcularRotaEntrega(pedidoId)`
Calcula rota otimizada considerando obstáculos.

#### `getEstatisticas()`
Retorna estatísticas gerais do sistema.

#### `getStatusDrones()`
Retorna status detalhado de todos os drones (incluindo bateria e estado).

#### `getStatusPedidos()`
Retorna status de todos os pedidos (incluindo tempo de espera).

## 🌐 API RESTful

O sistema inclui uma API REST completa. Para iniciar o servidor:

```bash
npm run api
```

### Endpoints Disponíveis

#### Drones
- `GET /drones/status` - Status de todos os drones
- `GET /drones/:id` - Status de um drone específico
- `POST /drones` - Registrar novo drone

#### Pedidos
- `POST /pedidos` - Criar novo pedido
- `GET /pedidos` - Listar todos os pedidos
- `GET /pedidos/:id` - Detalhes de um pedido

#### Entregas
- `GET /entregas/rota/:pedidoId` - Calcular rota de entrega
- `POST /entregas/processar` - Processar entregas pendentes
- `GET /entregas/fila` - Status da fila de entregas

#### Obstáculos
- `POST /obstaculos` - Adicionar obstáculo
- `GET /obstaculos` - Listar obstáculos

#### Sistema
- `GET /estatisticas` - Estatísticas gerais
- `POST /simulacao/iniciar` - Iniciar simulação
- `POST /simulacao/parar` - Parar simulação
- `GET /simulacao/status` - Status da simulação

### Exemplo de Uso da API

```bash
# Criar um drone
curl -X POST http://localhost:3000/drones \
  -H "Content-Type: application/json" \
  -d '{"id":"DRONE-001","capacidadePeso":10,"capacidadeDistancia":50}'

# Criar um pedido
curl -X POST http://localhost:3000/pedidos \
  -H "Content-Type: application/json" \
  -d '{"id":"PED-001","localizacao":{"x":5,"y":3},"peso":2,"prioridade":"alta"}'

# Processar entregas
curl -X POST http://localhost:3000/entregas/processar

# Ver status dos drones
curl http://localhost:3000/drones/status
```

## 🧮 Algoritmos e Otimizações

### Algoritmo de Alocação Básico
1. Ordena pedidos por prioridade (alta > média > baixa) e peso
2. Aloca pedidos aos drones respeitando capacidade
3. Minimiza viagens agrupando múltiplos pedidos
4. Itera até que todos os pedidos sejam alocados

### Otimização Avançada
- **Maximização de Capacidade**: Combina pedidos para maximizar uso de peso e distância
- **Roteamento Otimizado**: Usa algoritmo nearest neighbor para otimizar rotas
- **Score de Combinação**: Calcula score considerando uso de capacidade, prioridade e eficiência
- **Evitação de Obstáculos**: Calcula rotas alternativas quando necessário

### Sistema de Bateria
- Consumo base: 0.5% por km
- Consumo adicional: até 0.3% por km baseado no peso carregado
- Recarga automática quando bateria < 20%
- Retorno forçado quando bateria < 10%

### Estados do Drone
- **Idle**: Ocioso, aguardando pedidos
- **Carregando**: Carregando pacotes (1 minuto)
- **Em voo**: Voando para destino
- **Entregando**: Entregando pacote (2 minutos)
- **Retornando**: Retornando à base
- **Recarregando**: Recarregando bateria (5 minutos)

## 📊 Exemplo de Saída

```
=== Sistema de Entregas por Drones v2.0 ===

1. Registrando drones...
   ✓ 3 drones registrados

2. Adicionando obstáculos...
   ✓ 2 obstáculos adicionados

3. Criando pedidos...
   ✓ 6 pedidos criados

4. Status da Fila de Entregas:
   - Total pendentes: 6
   - Por prioridade: Alta=3, Média=2, Baixa=1
   - Tempo médio de espera: 2.5 minutos

5. Processando entregas...
   ✓ Processamento concluído

Resultado da Alocação:
- Viagens realizadas: 2
- Pedidos alocados: 6
- Pedidos não alocados: 0

Status dos Drones:
  DRONE-001:
    - Estado: em_voo
    - Bateria: 87.5%
    - Localização: (5, 3)
    - Viagens: 1
```

## 🔍 Funcionalidades Detalhadas

### Sistema de Fila
A fila de entregas ordena pedidos por score de prioridade:
- Score = (Prioridade × 100) + (Tempo de espera × 2)
- Prioridades: Alta=3, Média=2, Baixa=1
- Em caso de empate, prioriza pedidos mais antigos

### Simulação Orientada a Eventos
O simulador processa eventos em tempo real:
- Atualiza estados dos drones automaticamente
- Calcula consumo de bateria baseado em distância
- Gera eventos: `estadoMudou`, `entregaCompleta`, `bateriaBaixa`
- Permite velocidade de simulação configurável

### Obstáculos
- Zonas de exclusão aérea com raio configurável
- Cálculo automático de rotas alternativas
- Raio de segurança para evitar colisões
- Tipos: zona_exclusao, edificio_alto, aeroporto, etc.

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
