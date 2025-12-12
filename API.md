# Documentação da API REST

## Base URL
```
http://localhost:3000
```

## Endpoints

### Drones

#### GET /drones/status
Retorna status de todos os drones.

**Resposta:**
```json
{
  "success": true,
  "total": 3,
  "drones": [
    {
      "id": "DRONE-001",
      "capacidadePeso": 10,
      "capacidadeDistancia": 50,
      "bateriaAtual": 87.5,
      "bateriaMaxima": 100,
      "estado": "em_voo",
      "localizacaoAtual": { "x": 5, "y": 3 },
      "viagensRealizadas": 1,
      "pedidosAtuais": 2,
      "pesoAtual": 5.5,
      "distanciaTotal": 12.3,
      "tempoTotalVoo": 15.2,
      "distanciaPercorrida": 8.5,
      "velocidadeMedia": 30
    }
  ]
}
```

#### GET /drones/:id
Retorna status de um drone específico.

**Parâmetros:**
- `id` (path): ID do drone

**Resposta:**
```json
{
  "success": true,
  "drone": { ... }
}
```

#### POST /drones
Registra um novo drone.

**Body:**
```json
{
  "id": "DRONE-001",
  "capacidadePeso": 10,
  "capacidadeDistancia": 50,
  "bateriaMaxima": 100,
  "velocidadeMedia": 30
}
```

**Campos obrigatórios:** `id`, `capacidadePeso`, `capacidadeDistancia`

**Resposta:**
```json
{
  "success": true,
  "message": "Drone registrado com sucesso",
  "drone": { ... }
}
```

### Pedidos

#### POST /pedidos
Cria um novo pedido.

**Body:**
```json
{
  "id": "PED-001",
  "localizacao": { "x": 5, "y": 3 },
  "peso": 2,
  "prioridade": "alta",
  "tempoChegada": 1234567890
}
```

**Campos obrigatórios:** `id`, `localizacao`, `peso`

**Resposta:**
```json
{
  "success": true,
  "message": "Pedido criado com sucesso",
  "pedido": {
    "id": "PED-001",
    "localizacao": { "x": 5, "y": 3 },
    "peso": 2,
    "prioridade": "alta",
    "tempoChegada": 1234567890,
    "tempoEspera": 0,
    "alocado": false,
    "droneId": null,
    "scorePrioridade": 300
  }
}
```

#### GET /pedidos
Lista todos os pedidos.

**Resposta:**
```json
{
  "success": true,
  "total": 5,
  "pedidos": [ ... ]
}
```

#### GET /pedidos/:id
Retorna detalhes de um pedido específico.

**Parâmetros:**
- `id` (path): ID do pedido

### Entregas

#### GET /entregas/rota/:pedidoId
Calcula rota otimizada para uma entrega, considerando obstáculos.

**Parâmetros:**
- `pedidoId` (path): ID do pedido

**Resposta:**
```json
{
  "success": true,
  "rota": {
    "pedidoId": "PED-001",
    "origem": { "x": 0, "y": 0 },
    "destino": { "x": 5, "y": 3 },
    "distanciaDireta": 5.83,
    "distanciaComObstaculos": 7.2,
    "obstaculosEncontrados": [
      {
        "id": "OBST-001",
        "centro": { "x": 8, "y": 5 },
        "raio": 2,
        "raioSeguro": 3,
        "tipo": "zona_exclusao",
        "ativo": true
      }
    ],
    "tempoEstimado": 14.4
  }
}
```

#### POST /entregas/processar
Processa entregas pendentes.

**Body (opcional):**
```json
{
  "usarOtimizadorAvancado": true
}
```

**Resposta:**
```json
{
  "success": true,
  "resultado": {
    "viagensRealizadas": 2,
    "pedidosAlocados": 5,
    "pedidosNaoAlocados": [],
    "drones": [ ... ]
  }
}
```

#### GET /entregas/fila
Retorna informações da fila de entregas.

**Resposta:**
```json
{
  "success": true,
  "fila": {
    "totalPendentes": 3,
    "porPrioridade": {
      "alta": 2,
      "media": 1,
      "baixa": 0
    },
    "tempoMedioEspera": 5.2,
    "proximoPedido": "PED-001"
  }
}
```

### Obstáculos

#### POST /obstaculos
Adiciona um obstáculo.

**Body:**
```json
{
  "id": "OBST-001",
  "centro": { "x": 8, "y": 5 },
  "raio": 2,
  "tipo": "zona_exclusao",
  "raioSeguro": 3
}
```

**Campos obrigatórios:** `id`, `centro`, `raio`

**Resposta:**
```json
{
  "success": true,
  "message": "Obstáculo adicionado com sucesso",
  "obstaculo": { ... }
}
```

#### GET /obstaculos
Lista todos os obstáculos.

### Estatísticas

#### GET /estatisticas
Retorna estatísticas gerais do sistema.

**Resposta:**
```json
{
  "success": true,
  "estatisticas": {
    "totalDrones": 3,
    "dronesAtivos": 2,
    "dronesIdle": 1,
    "dronesRecarregando": 0,
    "totalPedidos": 10,
    "pedidosAlocados": 8,
    "pedidosNaoAlocados": 2,
    "totalViagens": 5,
    "taxaSucesso": "80.00%",
    "totalObstaculos": 2,
    "fila": {
      "totalPendentes": 2,
      "porPrioridade": { ... },
      "tempoMedioEspera": 3.5
    },
    "simulacao": {
      "ativo": true,
      "tempoSimulacao": 15.3,
      "dronesAtivos": 2
    }
  }
}
```

### Simulação

#### POST /simulacao/iniciar
Inicia a simulação.

**Body (opcional):**
```json
{
  "velocidade": 60
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Simulação iniciada",
  "velocidade": 60
}
```

#### POST /simulacao/parar
Para a simulação.

#### GET /simulacao/status
Retorna status da simulação.

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro no servidor

## Exemplos de Uso

### Criar drone e pedido, processar entrega

```bash
# 1. Criar drone
curl -X POST http://localhost:3000/drones \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DRONE-001",
    "capacidadePeso": 10,
    "capacidadeDistancia": 50
  }'

# 2. Criar pedido
curl -X POST http://localhost:3000/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "id": "PED-001",
    "localizacao": {"x": 5, "y": 3},
    "peso": 2,
    "prioridade": "alta"
  }'

# 3. Processar entregas
curl -X POST http://localhost:3000/entregas/processar

# 4. Ver status
curl http://localhost:3000/drones/status
```

### Adicionar obstáculo e calcular rota

```bash
# 1. Adicionar obstáculo
curl -X POST http://localhost:3000/obstaculos \
  -H "Content-Type: application/json" \
  -d '{
    "id": "OBST-001",
    "centro": {"x": 8, "y": 5},
    "raio": 2,
    "tipo": "zona_exclusao"
  }'

# 2. Calcular rota
curl http://localhost:3000/entregas/rota/PED-001
```



