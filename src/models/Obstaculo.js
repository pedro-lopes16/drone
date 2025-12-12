/**
 * Classe que representa uma Zona de Exclusão Aérea (obstáculo)
 */
export class Obstaculo {
  constructor(id, centro, raio, tipo = 'zona_exclusao', raioSeguro = null) {
    this.id = id;
    this.centro = centro; // {x, y}
    this.raio = raio; // em km
    this.raioSeguro = raioSeguro || raio + 1; // distância mínima de segurança
    this.tipo = tipo; // 'zona_exclusao', 'edificio_alto', 'aeroporto', etc.
    this.ativo = true;
  }

  /**
   * Verifica se um ponto está dentro do obstáculo
   * @param {Object} ponto - {x, y}
   * @returns {boolean}
   */
  contemPonto(ponto) {
    const distancia = this.calcularDistancia(this.centro, ponto);
    return distancia <= this.raio;
  }

  /**
   * Verifica se uma rota passa pelo obstáculo
   * @param {Object} ponto1 - {x, y}
   * @param {Object} ponto2 - {x, y}
   * @returns {boolean}
   */
  interceptaRota(ponto1, ponto2) {
    // Calcula distância do centro do obstáculo até a reta
    const A = ponto2.y - ponto1.y;
    const B = ponto1.x - ponto2.x;
    const C = ponto2.x * ponto1.y - ponto1.x * ponto2.y;
    const distancia = Math.abs(A * this.centro.x + B * this.centro.y + C) / 
                      Math.sqrt(A * A + B * B);
    
    return distancia <= this.raioSeguro;
  }

  /**
   * Calcula distância euclidiana
   * @param {Object} ponto1 - {x, y}
   * @param {Object} ponto2 - {x, y}
   * @returns {number}
   */
  calcularDistancia(ponto1, ponto2) {
    const dx = ponto2.x - ponto1.x;
    const dy = ponto2.y - ponto1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Retorna informações do obstáculo
   */
  getInfo() {
    return {
      id: this.id,
      centro: this.centro,
      raio: this.raio,
      raioSeguro: this.raioSeguro,
      tipo: this.tipo,
      ativo: this.ativo
    };
  }
}


