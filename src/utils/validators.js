/**
 * Validações e tratamento de erros
 */

export class Validator {
  /**
   * Valida dados de um drone
   * @param {Object} dados - Dados do drone
   * @returns {Object} {valido: boolean, erros: Array}
   */
  static validarDrone(dados) {
    const erros = [];

    if (!dados.id || typeof dados.id !== 'string' || dados.id.trim() === '') {
      erros.push('ID do drone é obrigatório e deve ser uma string não vazia');
    }

    if (dados.capacidadePeso === undefined || dados.capacidadePeso === null) {
      erros.push('Capacidade de peso é obrigatória');
    } else if (typeof dados.capacidadePeso !== 'number' || dados.capacidadePeso <= 0) {
      erros.push('Capacidade de peso deve ser um número positivo');
    }

    if (dados.capacidadeDistancia === undefined || dados.capacidadeDistancia === null) {
      erros.push('Capacidade de distância é obrigatória');
    } else if (typeof dados.capacidadeDistancia !== 'number' || dados.capacidadeDistancia <= 0) {
      erros.push('Capacidade de distância deve ser um número positivo');
    }

    if (dados.bateriaMaxima !== undefined) {
      if (typeof dados.bateriaMaxima !== 'number' || dados.bateriaMaxima <= 0 || dados.bateriaMaxima > 100) {
        erros.push('Bateria máxima deve ser um número entre 0 e 100');
      }
    }

    if (dados.velocidadeMedia !== undefined) {
      if (typeof dados.velocidadeMedia !== 'number' || dados.velocidadeMedia <= 0) {
        erros.push('Velocidade média deve ser um número positivo');
      }
    }

    return {
      valido: erros.length === 0,
      erros: erros
    };
  }

  /**
   * Valida dados de um pedido
   * @param {Object} dados - Dados do pedido
   * @returns {Object} {valido: boolean, erros: Array}
   */
  static validarPedido(dados) {
    const erros = [];

    if (!dados.id || typeof dados.id !== 'string' || dados.id.trim() === '') {
      erros.push('ID do pedido é obrigatório e deve ser uma string não vazia');
    }

    if (!dados.localizacao) {
      erros.push('Localização é obrigatória');
    } else {
      if (typeof dados.localizacao.x !== 'number' || typeof dados.localizacao.y !== 'number') {
        erros.push('Localização deve ter coordenadas x e y numéricas');
      }
    }

    if (dados.peso === undefined || dados.peso === null) {
      erros.push('Peso é obrigatório');
    } else if (typeof dados.peso !== 'number' || dados.peso <= 0) {
      erros.push('Peso deve ser um número positivo');
    }

    if (dados.prioridade !== undefined) {
      const prioridadesValidas = ['baixa', 'media', 'alta'];
      if (!prioridadesValidas.includes(dados.prioridade.toLowerCase())) {
        erros.push(`Prioridade deve ser uma das seguintes: ${prioridadesValidas.join(', ')}`);
      }
    }

    return {
      valido: erros.length === 0,
      erros: erros
    };
  }

  /**
   * Valida dados de um obstáculo
   * @param {Object} dados - Dados do obstáculo
   * @returns {Object} {valido: boolean, erros: Array}
   */
  static validarObstaculo(dados) {
    const erros = [];

    if (!dados.id || typeof dados.id !== 'string' || dados.id.trim() === '') {
      erros.push('ID do obstáculo é obrigatório e deve ser uma string não vazia');
    }

    if (!dados.centro) {
      erros.push('Centro é obrigatório');
    } else {
      if (typeof dados.centro.x !== 'number' || typeof dados.centro.y !== 'number') {
        erros.push('Centro deve ter coordenadas x e y numéricas');
      }
    }

    if (dados.raio === undefined || dados.raio === null) {
      erros.push('Raio é obrigatório');
    } else if (typeof dados.raio !== 'number' || dados.raio <= 0) {
      erros.push('Raio deve ser um número positivo');
    }

    return {
      valido: erros.length === 0,
      erros: erros
    };
  }

  /**
   * Valida se um pedido pode ser carregado por um drone
   * @param {Object} pedido - Dados do pedido
   * @param {Object} drone - Dados do drone
   * @returns {Object} {pode: boolean, motivo: string}
   */
  static validarCapacidadePedido(pedido, drone) {
    if (pedido.peso > drone.capacidadePeso) {
      return {
        pode: false,
        motivo: `Peso do pedido (${pedido.peso}kg) excede a capacidade do drone (${drone.capacidadePeso}kg)`
      };
    }

    return { pode: true, motivo: 'OK' };
  }
}

/**
 * Classe de erro customizada
 */
export class ErroValidacao extends Error {
  constructor(mensagem, erros = []) {
    super(mensagem);
    this.name = 'ErroValidacao';
    this.erros = erros;
  }
}

export class ErroCapacidade extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroCapacidade';
  }
}


