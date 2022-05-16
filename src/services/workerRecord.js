import _throttle from "lodash/throttle";
import WavAudioEncoder from "./WavAudioEncoder";

let channels = [];
let recordingLength = 0;
let sampleRate;
let mimeType = 'audio/m4a';
let bufferSize = 0;
let count = 1;
let waitTime = 2;
let consecutiveCount = 3;
let checkTime = 0;
let maxTime = 0;

const handlePostMessage = _throttle((blob) => {
  // console.log('throttle');
  count += 1;

  if (count >= consecutiveCount) {
    channels = [];
    recordingLength = 0;

    count = 0;
  }

  postMessage({
    type: 'checker',
    payload: {
      blob,
      checkTime
    }
  });

  checkTime += waitTime;
}, waitTime * 1000);

const flattenArray = (channelBuffer, recordingLength) => {
  const result = new Float32Array(recordingLength);
  let offset = 0;

  for (let i = 0; i < channelBuffer.length; i++) {
    const buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }

  return result;
};

const calculatorBuffer = ({ sampleRate, channels, recordingLength }) => {
  const channelBuffer = flattenArray(channels, recordingLength);

  const wavObj = {
    sampleRate,
    channelData: [channelBuffer]
  };

  return WavAudioEncoder.encodeSync(wavObj);
};

const getBlob = ({ sampleRate, channels, recordingLength }) => {
  const audioBuffer = calculatorBuffer({ sampleRate, channels, recordingLength });

  return new Blob([audioBuffer], { type: mimeType })
};

onmessage = (event) => {
  // console.log('onmessage', event);
  const { data } = event;

  const { type, payload } = data;
  // console.log('onmessage', type)

  if (type === 'init') {
    if (payload.mimeType) {
      mimeType = payload.mimeType
    }

    if (payload.sampleRate) {
      sampleRate = payload.sampleRate;
    }

    if (payload.bufferSize) {
      bufferSize = payload.bufferSize;
    }

    if (payload.waitTime) {
      waitTime = payload.waitTime
    }

    if (payload.maxTime) {
      maxTime = payload.maxTime
    }

    if (payload.consecutiveCount) {
      consecutiveCount = payload.consecutiveCount
    }
  }

  if (type === 'buffer') {
    const { buffer } = payload;

    if (payload.mimeType) {
      mimeType = payload.mimeType
    }

    if (payload.sampleRate) {
      sampleRate = payload.sampleRate;
    }

    if (payload.bufferSize) {
      bufferSize = payload.bufferSize;
    }

    recordingLength += bufferSize;

    channels.push(buffer);

    const blob = getBlob({ sampleRate, channels, recordingLength });

    handlePostMessage(blob)
  }

  if (type === 'stop') {
    const blob = getBlob({ sampleRate, channels, recordingLength });

    postMessage({
      type: 'stop',
      payload: {
        blob,
        recordingLength
      }
    });
  }
};
