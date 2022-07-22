const { resolve } = require('path');
const fs = require('fs');

const { evalId, containerWorkDir, defaultDelay } = require('./constants');
const {
  exec,
  delay,
  validateBaseLayersInDockerfileImage,
  validateCmdInput,
  setupImageForTest
} = require('./util');

describe('2 - Verifica o arquivo Dockerfile', () => {
  let baseLayers, dockerfileImageLayers, dockerfileImageCmd;
  beforeAll(async () => {
    const workDir = `${containerWorkDir}${evalId}`;
    const volume = `-v ${resolve(evalId)}:${workDir}`;

    await exec(`rm -rf ${resolve('trybe-stranger-things-backend-*')}`).catch(
      () => true
    );
    await exec(
      'docker rm -fv $(docker ps -a -f name=trybe-stranger-things-backend- -q)'
    ).catch(() => true);

    await exec(`mkdir ${resolve(evalId)}`);
    await exec(
      `cp ${resolve('./Dockerfile')} ${resolve('./package.json')} ${resolve(
        './package-lock.json'
      )} ${resolve(evalId)}`
    );
    await exec(
      `docker run --privileged -d --name ${evalId} -w ${workDir} ${volume} mjgargani/docker:dind-trybe1.0`
    );
    await delay(defaultDelay);

    [baseLayers, dockerfileImageLayers, dockerfileImageCmd] = await setupImageForTest();
  });

  afterAll(async () => {
    await exec(`docker rm -fv ${evalId}`);
    await exec(`rm -rf ${resolve(evalId)}`);
  });

  it('Será validado que o arquivo "Dockerfile" existe', () => {
    const dockerfilePath = resolve('./Dockerfile');

    const fileExists = fs.existsSync(dockerfilePath);

    expect(fileExists).toBeTruthy();
  });

  it('Será validado que as Layers da Dockerfile incluem às Layers da Imagem pedida', async () => {
    const validateLayers = await validateBaseLayersInDockerfileImage(
      baseLayers,
      dockerfileImageLayers,
    );

    expect(validateLayers).toBeTruthy();
  });

  it('Será validado que da "Dockerfile" executa "npm start" no CMD', async () => {
    const isDockerfileCmdNpmStart = validateCmdInput(
      dockerfileImageCmd,
    );
    expect(isDockerfileCmdNpmStart).toBeTruthy();
  });
});