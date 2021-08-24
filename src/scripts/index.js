/**
 * STYLE
**/

import '../styles/index.scss';

/**
 * TEMPLATE
**/

if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

/**
 * SCRIPT
**/

import axios from 'axios';
import * as faceapi from 'face-api.js';

const expressionsName = ['angry', 'disgusted', 'fearful', 'happy', 'sad', 'surprised'];
let expressionsGifs = {};
let expressionCurrent = undefined;
let expressionOld = undefined;

const modelsName = ['tinyFaceDetector', 'faceExpressionNet'];

const cTopRight = document.querySelector('.c-top-right');
const cBottomLeft = document.querySelector('.c-bottom-left');
const cBottomRight = document.querySelector('.c-bottom-right');

function getGifsExpression(expression) {
  const giphy = {
    url: 'http://api.giphy.com/v1/gifs/random',
    api_key: 'UQvlbVGf0BGAcrLMT98Vy0PtQ5rQw86F',
    limit: 3
  };
  const requestsExpression = [];
  for (let i = 0; i < giphy.limit; i++) {
    const requestExpression = axios
      .get(`${giphy.url}?tag=${expression}&api_key=${giphy.api_key}`);
    requestsExpression.push(requestExpression);
  }
  const responseExpression = axios.all(requestsExpression)
    .then(axios.spread((...responses) => {
      const responseExpression = [];
      for (const response of responses) {
        const image = new Image();
        image.src = response.data.data.image_original_url;
        image.crossOrigin = "anonymous";
        responseExpression.push(image);
      }
      return responseExpression;
    }))
    .catch(e => {
        return { error: e };
    });
  return responseExpression;
}
async function getGifsExpressions(expressions) {
  const gifsExpressions = {};
  for (const expression of expressions) {
    gifsExpressions[expression] = await getGifsExpression(expression);
  }
  return gifsExpressions;
}

async function getModel(model) {
  await faceapi.nets[model].loadFromUri('../../public/models');
}
async function getModels(models) {
  for (const model of models) {
    await getModel(model);
  }
}

function addGifsExpression(expression, expressionGifs) {
  const eImages = document.querySelectorAll(`.e-${expression}`);
  for (const eImage of eImages) {
    eImage.parentNode.removeChild(eImage);
  }
  for (const expressionGif of expressionGifs) {
    expressionGif.classList.add(`e-${expression}`);
  }
  cTopRight.appendChild(expressionGifs[0]);
  cBottomLeft.appendChild(expressionGifs[1]);
  cBottomRight.appendChild(expressionGifs[2]);
}
function addGifsExpressions(expressionsGifs) {
  for (const expressionGifs in expressionsGifs) {
    addGifsExpression(expressionGifs, expressionsGifs[expressionGifs]);
  }
}

function getWebcam(video) {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("can't found your camera :(", err));
}

function getCurrentExpression(expressions) {
  const maxValue = Math.max(
    ...Object.values(expressions).filter(
      value => value <= 1
    )
  );
  const expressionsKeys = Object.keys(expressions);
  const expression = expressionsKeys.filter(
    expression => expressions[expression] === maxValue
  );
  return expression[0];
}
async function getExpression(media) {
  const detections = await faceapi
    .detectAllFaces(media, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();
  if (detections && detections[0] && detections[0].expressions) {
    return getCurrentExpression(detections[0].expressions);
  } else {
    return null;
  }
}

async function mounted() {
  expressionsGifs = await getGifsExpressions(expressionsName);
  await addGifsExpressions(expressionsGifs);
  await getModels(modelsName);
  const media = document.querySelector("video");
  await getWebcam(media);
  const eExpression = document.querySelector('h1');
  eExpression.innerHTML = "Make an expression during few seconds ...";
  setInterval(async () => {
    const expression = await getExpression(media);
    if (expression !== "neutral") {
      expressionCurrent = expression;
    }
    if (expressionCurrent) {
      if (expressionCurrent !== expressionOld) {
        document.body.classList.remove(expressionOld);
        eExpression.innerHTML = expressionCurrent;
        expressionsGifs[expressionOld] = await getGifsExpression(expressionOld);
        addGifsExpression(expressionOld, expressionsGifs[expressionOld]);
        document.body.classList.add(expressionCurrent);
        expressionOld = expressionCurrent;
      }
    }
  }, 500)
}

mounted()

// import '../styles/index.scss';

// if (process.env.NODE_ENV === 'development') {
//   require('../index.html');
// }

// console.log('tfjs-face_detection');

// import * as faceapi from 'face-api.js';
// import axios from 'axios';

// const video = document.querySelector("video");
// const container = document.querySelector('.result');
// let GifsExpressions

// /** 
//  * Launch the whole process following those steps
//  * - Preload models from faceapi
//  * - Scan the media from faceapi
// **/
// async function launch() {
//   await faceapi.nets.tinyFaceDetector.loadFromUri('../../public/models');
//   await faceapi.nets.faceExpressionNet.loadFromUri('../../public/models');
//   GifsExpressions = await getAllGifs();
//   await setupVideo()
//   refreshState()
// }

// async function setupVideo() {
//   navigator.mediaDevices
//     .getUserMedia({ video: true, audio: false })
//     .then(stream => {
//       video.srcObject = stream;
//     })
//     .catch(err => console.error("can't found your camera :(", err));
// }

// function getAllGifs() {
//   const tagsExpressions = ['angry', 'disgusted', 'fearful', 'happy', 'neutral', 'sad', 'surprised'];
//   const requestsExpressions = [];
//   const keyAPIGif = 'UQvlbVGf0BGAcrLMT98Vy0PtQ5rQw86F';
//   const numberGifs = 3;
//   tagsExpressions.forEach(tagExpression => {
//     requestsExpressions.push(
//       axios.get(`http://api.giphy.com/v1/Gifs/search?q=${tagExpression}&api_key=${keyAPIGif}&limit=${numberGifs}`)
//     );
//   });
//   return axios.all(requestsExpressions)
//     .then(axios.spread((...responses) => {
//       const resultGifs = {};
//       responses.forEach((response, i) => {
//         const arrayGifs = [];
//         response.data.data.forEach(Gif => {
//           const image = new Image();
//           image.src = Gif.images.original.url;
//           arrayGifs.push(image);
//         });
//         resultGifs[tagsExpressions[i]] = arrayGifs
//       });
//       return resultGifs;
//     }))
//     .catch(e => {
//         return { error: e };
//     });
// }

// /**
//  * Get the mot likely current expression using the faceapi detection object.
//  * Build a array to iterate on each possibilityand pick the most likely.
//  * @param {Object} expresssions object of expressions
//  * @return {String}
// **/
// function getCurrentExpression(expressions) {
//   const maxValue = Math.max(
//     ...Object.values(expressions).filter(
//       value => value <= 1
//     )
//   );
//   const expressionsKeys = Object.keys(expressions);
//   const mostLikely = expressionsKeys.filter(
//     expression => expressions[expression] === maxValue
//   );
//   return mostLikely[0];
// }

// function updateHtml(expression) {
//   container.innerHTML += `
//     <p>${expression}</p>
//   `;
//   // console.log(GifsExpressions)
//   // console.log(expression)
//   GifsExpressions[expression].forEach(GifsExpression => {
//     container.appendChild(GifsExpression)
//   });
//   console.log('ok')
// }

// /** 
//  * Set an refresh interval where the faceapi will scan the face of the suject
//  * and return an object of the most likely expressions.
//  * @async
// **/
// async function refreshState() {
//   setInterval(async () => {
//     const detections = await faceapi
//       .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//       .withFaceExpressions();
//     if (detections) {
//       detections.forEach(detection => {
//         updateHtml(getCurrentExpression(detection.expressions));
//       });
//     }
//   }, 500)
// }

// launch();
