const fs = require('fs');
const yml = require('js-yaml');

describe('4 - Verifica as configurações da Action de linter', () => {
  const file = yml.safeLoad(fs.readFileSync('./actions/project.yml', 'utf8'));
  it('Será validado que o arquivo `project.yml` existe na pasta `actions`', () => {
    const fileExists = fs.existsSync('./actions/project.yml');

    expect(fileExists).toBeTruthy();
  });

  it('Será validado que a Action será executada somente em pull requests', () => {
    expect(
      file.on === 'pull_request' || 
      !!file.on.pull_request || 
      file.on['pull_request']
    ).toBe(true);
  });

  it('Será validado que o job foi nomeado como `eslint`', () => {
    expect(file.jobs).toHaveProperty('eslint');
  });

  it('Será validado que o eslint será executado na versão 20.04', () => {
    expect(file.jobs.eslint['runs-on']).toBe('ubuntu-20.04');
  });

  it('Será validado que o primeiro passo do job `eslint` usa a action de checkout', () => {
    expect(file.jobs.eslint.steps[0].uses.includes('actions/checkout')).toBe(true);
  });

  it('Será validado que o segundo passo do job `eslint` usa a action setup-node e sua versão é a 12', () => {
    expect(
      file.jobs.eslint.steps[1].uses.includes('actions/setup-node') &&
      file.jobs.eslint.steps[1].with['node-version'] == 12
    ).toBe(true);
  });

  it('Será validado que no terceiro passo do job `eslint` executa a instalação das dependências', () => {
    expect(file.jobs.eslint.steps[2].run.includes('npm i')).toBe(true);
  });

  it('Será validado que no quarto passo do job `eslint` executa o pacote `eslint` via `npx`', () => {
    expect(file.jobs.eslint.steps[3].run.includes('npx eslint')).toBe(true);
  });
});
