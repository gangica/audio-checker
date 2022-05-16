const encodeSync = (audioData, opts) => {
  opts = opts || {};

  audioData = toAudioData(audioData);

  if (audioData === null) {
    throw new TypeError("Invalid AudioData");
  }

  const floatingPoint = !!(opts.floatingPoint || opts.float);
  const bitDepth = floatingPoint ? 32 : ((opts.bitDepth | 0) || 16);
  const bytes = bitDepth >> 3;
  const length = audioData.length * audioData.numberOfChannels * bytes;
  const dataView = new DataView(new Uint8Array(44 + length).buffer);
  const writer = createWriter(dataView);

  const format = {
    formatId: floatingPoint ? 0x0003 : 0x0001,
    floatingPoint: floatingPoint,
    numberOfChannels: audioData.numberOfChannels,
    sampleRate: audioData.sampleRate,
    bitDepth: bitDepth
  };

  writeHeader(writer, format, dataView.buffer.byteLength - 8);

  const err = writeData(writer, format, length, audioData, opts);

  if (err instanceof Error) {
    throw err;
  }

  return dataView.buffer;
};

const encode = (audioData, opts) => {
  return new Promise(function (resolve) {
    resolve(encodeSync(audioData, opts));
  });
};

const toAudioData = (data) => {
  const audioData = {};

  if (typeof data.sampleRate !== "number") {
    return null;
  }
  if (!Array.isArray(data.channelData)) {
    return null;
  }
  if (!(data.channelData[0] instanceof Float32Array)) {
    return null;
  }

  audioData.numberOfChannels = data.channelData.length;
  audioData.length = data.channelData[0].length | 0;
  audioData.sampleRate = data.sampleRate | 0;
  audioData.channelData = data.channelData;

  return audioData;
};

const writeHeader = (writer, format, length) => {
  const bytes = format.bitDepth >> 3;

  writer.string("RIFF");
  writer.uint32(length);
  writer.string("WAVE");

  writer.string("fmt ");
  writer.uint32(16);
  writer.uint16(format.floatingPoint ? 0x0003 : 0x0001);
  writer.uint16(format.numberOfChannels);
  writer.uint32(format.sampleRate);
  writer.uint32(format.sampleRate * format.numberOfChannels * bytes);
  writer.uint16(format.numberOfChannels * bytes);
  writer.uint16(format.bitDepth);
};

const writeData = (writer, format, length, audioData, opts) => {
  const bitDepth = format.bitDepth;
  const encoderOption = format.floatingPoint ? "f" : opts.symmetric ? "s" : "";
  const methodName = "pcm" + bitDepth + encoderOption;

  if (!writer[methodName]) {
    return new TypeError("Not supported bit depth: " + bitDepth);
  }

  const write = writer[methodName].bind(writer);
  const numberOfChannels = format.numberOfChannels;
  const channelData = audioData.channelData;

  writer.string("data");
  writer.uint32(length);

  for (let i = 0, imax = audioData.length; i < imax; i++) {
    for (let ch = 0; ch < numberOfChannels; ch++) {
      write(channelData[ch][i]);
    }
  }
};

const createWriter = (dataView) => {
  let pos = 0;

  return {
    int16: function (value) {
      dataView.setInt16(pos, value, true);
      pos += 2;
    },
    uint16: function (value) {
      dataView.setUint16(pos, value, true);
      pos += 2;
    },
    uint32: function (value) {
      dataView.setUint32(pos, value, true);
      pos += 4;
    },
    string: function (value) {
      for (let i = 0, imax = value.length; i < imax; i++) {
        dataView.setUint8(pos++, value.charCodeAt(i));
      }
    },
    pcm8: function (value) {
      value = Math.max(-1, Math.min(value, +1));
      value = (value * 0.5 + 0.5) * 255;
      value = Math.round(value) | 0;
      dataView.setUint8(pos, value, true);
      pos += 1;
    },
    pcm8s: function (value) {
      value = Math.round(value * 128) + 128;
      value = Math.max(0, Math.min(value, 255));
      dataView.setUint8(pos, value, true);
      pos += 1;
    },
    pcm16: function (value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 32768 : value * 32767;
      value = Math.round(value) | 0;
      dataView.setInt16(pos, value, true);
      pos += 2;
    },
    pcm16s: function (value) {
      value = Math.round(value * 32768);
      value = Math.max(-32768, Math.min(value, 32767));
      dataView.setInt16(pos, value, true);
      pos += 2;
    },
    pcm24: function (value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? 0x1000000 + value * 8388608 : value * 8388607;
      value = Math.round(value) | 0;

      const x0 = (value >> 0) & 0xFF;
      const x1 = (value >> 8) & 0xFF;
      const x2 = (value >> 16) & 0xFF;

      dataView.setUint8(pos, x0);
      dataView.setUint8(pos + 1, x1);
      dataView.setUint8(pos + 2, x2);
      pos += 3;
    },
    pcm24s: function (value) {
      value = Math.round(value * 8388608);
      value = Math.max(-8388608, Math.min(value, 8388607));

      const x0 = (value >> 0) & 0xFF;
      const x1 = (value >> 8) & 0xFF;
      const x2 = (value >> 16) & 0xFF;

      dataView.setUint8(pos, x0);
      dataView.setUint8(pos + 1, x1);
      dataView.setUint8(pos + 2, x2);
      pos += 3;
    },
    pcm32: function (value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 2147483648 : value * 2147483647;
      value = Math.round(value) | 0;
      dataView.setInt32(pos, value, true);
      pos += 4;
    },
    pcm32s: function (value) {
      value = Math.round(value * 2147483648);
      value = Math.max(-2147483648, Math.min(value, +2147483647));
      dataView.setInt32(pos, value, true);
      pos += 4;
    },
    pcm32f: function (value) {
      dataView.setFloat32(pos, value, true);
      pos += 4;
    }
  };
};

export default {
  encode,
  encodeSync
}
