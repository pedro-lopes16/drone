Principais Prompts utilizados com IA:
1- "A ideia principal é a criação de um sistema em Node.js que gerencie entregas feitas por drones e seus respectivos voos, respeitando regras de capacidade, distância e prioridade de entrega. Esse programa contém regras básicas relacionadas a capacidade (cada drone suporta até X kg e pode viajar até Y km por carga), mapeamento (A cidade é uma malha de coordenadas, utilize uma matriz como referência) e um sistema de pedidos que deve conter a locação do cliente (X, Y), peso do pacote e prioridade de entrega (baixa, media, alta). O objetivo principal é alocar pacotes de entrega nos drones com o menor número de viagens possível. Faça a estrutura do projeto de forma organizada, a fim de que cada pasta contenha uma funcionalidade separada e funcional, utilize o package.json para definir scripts para futuras automações de teste." 

2- "Executei o codigo no terminal, porém parece que não tenho node.js instalado. Poderia me explicar passo a passo como fazer a instalação e conseguir iniciar os testes?"

3- "Ótimo, o node.js está funcionando e rodando. Gostaria de implementar mais funcionalidades a essa aplicação, faça o passo a passo de como adicionar a funcionalidade extra de simulação de consumo de bateria do drone (diminuir com o tempo ou distância), especificando exatamente onde devo alterar sem que prejudique as funcionalidades restantes já implementadas."  

4- "Funcionando. Gostaria que me fornecesse o código base de outras funcionalidades também, e quais outras pastas devo criar para que fique organizado. Proximas funcionalidades: 1- inserir obstaculos entre pontos de rota. 2- calcular tempo total de entrega. 3- criar uma fila de entrega por ondem de prioridade. Crie eventuais situações para cada uma dessas funcionalidades, como calculo alternativo de rota em caso de obstaculos, etc. Mostre exatamente onde deve ser alterado nos codigos prévios caso algum comando necessite ser alterado"

5- "Terminei todas alterações. Proximo passo vai ser a melhoria e otimização do sistema de entregas. Agora o sistema deve priorizar entregas com base no peso, prioridade e distancia. O intuito é buscar combinações de pacotes/viagens que maximizem o uso do drone, incluindo a bateria, alcance e capacidade de carga. Utilize um consumo base de 0,5% por km para testes, calcule um consumo adicional baseado no peso da entrega e um sinal de recarga automatica quando a bateria está proximo de 20%~10%, solicitando um retorno forçado."  

6- "Crie uma simulação orientada a eventos, na qual o drone retorna mensagens de status: Idle → Carregando → Em voo → Entregando → Retornando → Idle. Essa parte será voltada para gerenciamento de voo no momento dos testes." 

7- "Sim, finalmente. O ultimo passo hoje vai ser a definição de APIs RESTful, me forneca o codigo base para criar um serviço com endpoints como: POST /pedidos, GET /entregas/rota e GET /drones/status. Além disso, se tiver algum passo a passo a mais para efetivar o funcionamento dessas APIs, favor fornecer." 

8- "Hoje, a fim de finalizar o projeto sobre drones, vamos implementar a validação e analise sobre as entregas. Primeiro, os testes serão automatizados, havendo a cobertura de testes unitários e simulações de carga (como o sistema se comporta com diversos pedidos). Faça um guia detalhado de como posso implementar esses testes no codigo base que estavamos desenvolvendo antes."

9- "Ok. O proximo passo também deve ser feito atraves de um tutorial detalhado, sendo relacionado ao tratamento de erros e validações, como por exemplo rejeitar pacotes que ultrapassem a capacidade do drone e retornar mensagens claras para entradas inválidas. Como posso implementar isso no codigo sem alterar o funcionamento?"

10- "Preciso implementar uma area de relatorios (dashboard), utilizando uma visualização simples com as informações: quantidades de entregas realizadas, tempo medio de entrega, qual drone mais eficiente e um registo do local da entrega. Qual a melhor forma de agregar essas informações ao programa e onde inseri-las?" 

11- "Para finalizar as funcionalidades do sistema, como posso implementar a funcionalidade extra de feedback do cliente em relação ao status da entrega, informando a localização em tempo real para o cliente?"

12-"Agora que finalizamos, faça um documento de texto para preencher o readme de como executar o programa, liste todas as funcionalidades que o sistema possui e como acessá-las individualmente, a estrutura detalhada do projeto, os requisitos básicos de funcionamento e informações da utilização das APIs."

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

## Testes unitários
Consta no arquivo "image.png" presente no repositorio