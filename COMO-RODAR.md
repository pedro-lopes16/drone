# 🚀 Como Rodar o Código

## Pré-requisitos

1. **Node.js instalado** (versão 14 ou superior)
   - Verifique se está instalado: `node --version`
   - Se não tiver, baixe em: https://nodejs.org/

2. **npm** (geralmente vem com Node.js)
   - Verifique: `npm --version`

## Passo 1: Instalar Dependências

Primeiro, instale as dependências do projeto:

```bash
npm install
```

Isso instalará o Express (necessário para a API REST).

## Passo 2: Executar o Código

Você tem várias opções para rodar o projeto:

### Opção 1: Exemplo Básico (Recomendado para começar)

```bash
npm start
```

Executa um exemplo simples mostrando:
- Criação de drones
- Criação de pedidos
- Processamento de entregas
- Resultados

### Opção 2: Exemplo Avançado

```bash
npm run exemplo-avancado
```

Demonstra todas as funcionalidades avançadas:
- Sistema de bateria
- Obstáculos
- Estados dos drones
- Simulação de eventos
- Feedback do cliente

### Opção 3: Dashboard e Relatórios

```bash
npm run dashboard
```

Exibe um dashboard completo com:
- Estatísticas detalhadas
- Mapa ASCII das entregas
- Relatório JSON
- Feedback do cliente

### Opção 4: API REST (Servidor Web)

```bash
npm run api
```

Inicia um servidor na porta 3000. Depois acesse:
- http://localhost:3000 - Documentação da API
- http://localhost:3000/drones/status - Status dos drones
- http://localhost:3000/estatisticas - Estatísticas

### Opção 5: Testes

```bash
# Testes unitários
npm run test:unit

# Testes de carga
npm run test:carga

# Todos os testes
npm run test:all
```

## Exemplos de Uso da API

Se você rodou `npm run api`, pode testar com:

### Criar um drone:
```bash
curl -X POST http://localhost:3000/drones \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"DRONE-001\",\"capacidadePeso\":10,\"capacidadeDistancia\":50}"
```

### Criar um pedido:
```bash
curl -X POST http://localhost:3000/pedidos \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"PED-001\",\"localizacao\":{\"x\":5,\"y\":3},\"peso\":2,\"prioridade\":\"alta\"}"
```

### Ver dashboard:
```bash
curl http://localhost:3000/dashboard
```

## Resolução de Problemas

### Erro: "Cannot find module"
**Solução:** Execute `npm install` novamente

### Erro: "Port 3000 already in use"
**Solução:** Pare o processo que está usando a porta 3000 ou mude a porta no arquivo `src/api/server.js`

### Erro: "node: command not found"
**Solução:** Instale o Node.js em https://nodejs.org/

## Estrutura de Comandos

| Comando | Descrição |
|---------|-----------|
| `npm start` | Exemplo básico |
| `npm run exemplo-avancado` | Exemplo com todas funcionalidades |
| `npm run dashboard` | Dashboard completo |
| `npm run api` | Inicia servidor API REST |
| `npm run test:unit` | Testes unitários |
| `npm run test:carga` | Testes de carga |
| `npm run test:all` | Todos os testes |

## Próximos Passos

1. Comece com `npm start` para ver o básico
2. Experimente `npm run exemplo-avancado` para ver funcionalidades avançadas
3. Use `npm run api` para testar a API REST
4. Explore o código em `src/` para entender como funciona

## Dúvidas?

Consulte a documentação:
- `README.md` - Documentação completa
- `API.md` - Documentação da API REST
- `TESTES.md` - Documentação de testes

