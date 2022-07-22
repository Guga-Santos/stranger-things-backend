require('dotenv').config();

describe("1 - Verifica as variáveis de ambiente", () => {
  const apiPort = process.env.PORT;
  const updasideMode = process.env.UPSIDEDOWN_MODE;

  it('Será validado que a variável da PORT existe', () => {
    expect(apiPort).toBeDefined();
  });

  it('Será validado que a variável de ambiente UPSIDEDOWN_MODE existe e se ela é um boleano', () => {
    expect(updasideMode).toBeDefined();
    expect(['true', 'false']).toContain(updasideMode);
  });
});
