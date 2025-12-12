/**
 * Framework simples de testes
 */
export class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  /**
   * Registra um teste
   * @param {string} nome - Nome do teste
   * @param {Function} fn - Função do teste
   */
  test(nome, fn) {
    this.tests.push({ nome, fn });
  }

  /**
   * Executa todos os testes
   * @returns {Object} Resultados
   */
  async run() {
    console.log('\n🧪 Executando testes...\n');
    console.log('═'.repeat(60));

    let passou = 0;
    let falhou = 0;

    for (const { nome, fn } of this.tests) {
      try {
        await fn();
        console.log(`✅ ${nome}`);
        this.results.push({ nome, status: 'passou', erro: null });
        passou++;
      } catch (error) {
        console.log(`❌ ${nome}`);
        console.log(`   Erro: ${error.message}`);
        this.results.push({ nome, status: 'falhou', erro: error.message });
        falhou++;
      }
    }

    console.log('═'.repeat(60));
    console.log(`\n📊 Resumo: ${passou} passou, ${falhou} falhou\n`);

    return {
      total: this.tests.length,
      passou,
      falhou,
      resultados: this.results
    };
  }

  /**
   * Assert que uma condição é verdadeira
   * @param {boolean} condicao - Condição a verificar
   * @param {string} mensagem - Mensagem de erro
   */
  assert(condicao, mensagem = 'Assertion failed') {
    if (!condicao) {
      throw new Error(mensagem);
    }
  }

  /**
   * Assert que dois valores são iguais
   * @param {*} esperado - Valor esperado
   * @param {*} atual - Valor atual
   * @param {string} mensagem - Mensagem de erro
   */
  assertEquals(esperado, atual, mensagem = null) {
    const msg = mensagem || `Esperado ${esperado}, mas obteve ${atual}`;
    if (esperado !== atual) {
      throw new Error(msg);
    }
  }

  /**
   * Assert que um valor é aproximadamente igual (para números)
   * @param {number} esperado - Valor esperado
   * @param {number} atual - Valor atual
   * @param {number} tolerancia - Tolerância
   * @param {string} mensagem - Mensagem de erro
   */
  assertApprox(esperado, atual, tolerancia = 0.01, mensagem = null) {
    const diff = Math.abs(esperado - atual);
    const msg = mensagem || `Esperado aproximadamente ${esperado}, mas obteve ${atual} (diferença: ${diff})`;
    if (diff > tolerancia) {
      throw new Error(msg);
    }
  }

  /**
   * Assert que uma função lança erro
   * @param {Function} fn - Função a executar
   * @param {string} mensagem - Mensagem de erro esperada
   */
  assertThrows(fn, mensagem = null) {
    try {
      fn();
      throw new Error(mensagem || 'Esperava-se que a função lançasse um erro');
    } catch (error) {
      // OK, função lançou erro
      return true;
    }
  }
}



