const { promisify } = require('util');

const { evalId, containerWorkDir } = require('./constants');

const DOCKER_FILE_IMAGE_NAME = 'dockerfile-image';
const BASE_IMAGE_NAME = 'node:14-alpine';
const LAYERS_INSPECT_FORMAT = '.RootFS.Layers';
const CMD_INSPECT_FORMAT = '.Config.Cmd';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const exec = promisify(require("child_process").exec);

const execInDocker = async (command) => exec(`docker exec ${evalId} /bin/sh -c '${command}'`);

const inspectImage = (imageName, inspectFormat) => `docker inspect ${imageName} -f "{{json ${inspectFormat}}}"`;

const formatLayersToArray = ({ stdout }) => stdout.split('\n')[0]
  .split("\"").filter(string => String(string).includes('sha256'));

const pullImage = async (imageName) => {
  const pullCommand = `docker pull ${imageName}`;

  await execInDocker(pullCommand);
};

const buildImage = async (imageName) => {
  const buildDockerfileImage = `docker build ${containerWorkDir}${evalId} -t ${imageName}`;

  await execInDocker(buildDockerfileImage);
};

const inspectImageWithFormat = (imageName, format) => execInDocker(
  inspectImage(imageName, format)
);

const getLayers = async (imageName) => inspectImageWithFormat(imageName, LAYERS_INSPECT_FORMAT);

const getDockerfileImageCmd = async (imageName) =>
  inspectImageWithFormat(imageName, CMD_INSPECT_FORMAT);

const setupImageForTest = async () => {
  await pullImage(BASE_IMAGE_NAME);
  await buildImage(DOCKER_FILE_IMAGE_NAME);
  await buildImage(BASE_IMAGE_NAME);
  const baseLayers = await getLayers(BASE_IMAGE_NAME);
  const dockerfileImageLayers = await getLayers(DOCKER_FILE_IMAGE_NAME);
  const dockerfileImageCmd = await getDockerfileImageCmd(DOCKER_FILE_IMAGE_NAME);
  return [
    baseLayers,
    dockerfileImageLayers,
    dockerfileImageCmd
  ];
};

const validateBaseLayersInDockerfileImage = (baseLayers, layerToCompare) => {
  const nodeLayers = formatLayersToArray(baseLayers);

  const dockerImageFileLayers = formatLayersToArray(layerToCompare);

  return nodeLayers.every(nodeLayer => dockerImageFileLayers.includes(nodeLayer));
};

const validateCmdInput = ({ stdout: configCmd }) => configCmd.includes('npm') && configCmd.includes('start');

module.exports = {
  delay,
  exec,
  validateBaseLayersInDockerfileImage,
  validateCmdInput,
  setupImageForTest,
};
