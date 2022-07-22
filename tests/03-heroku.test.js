const fs = require('fs');
const yml = require('js-yaml');

describe("3 - Verifica o arquivo heroku.yml", () => {
  const file = yml.safeLoad(fs.readFileSync('./heroku.yml', 'utf8'));
  it('Será validado que o arquivo "heroku.yml" existe', () => {   
    const fileExists = fs.existsSync('./heroku.yml');
    
    expect(fileExists).toBeTruthy();  
  });

  it('Será validado que um serviço web será executado', () => {
    expect(file.build).toHaveProperty('docker');
    expect(file.build.docker).toHaveProperty('web');
  });
  
  it('Será validado que o node será responsável por iniciar o servidor', () => {
    expect(file.run).toHaveProperty('web');
    expect(file.run.web).toContain('node');
  });
});