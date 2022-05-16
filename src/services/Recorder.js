import WorkerRecord from "./workerRecord?worker";

import Socket from './Socket';

export const RecordState = Object.freeze({
  START: "start",
  PAUSE: "pause",
  STOP: "stop",
  NONE: "none"
});

const noop = () => {
};

let sdk;

class Recorder {
  static instance(params) {
    if (!sdk) {
      sdk = new Recorder(params);
    }

    return sdk;
  }

  constructor(params = {}) {
    const {
      workletModuleUrl,
      workletNodeName,
      workletOptions,
      mimeType,
      permissionFail = noop,
      UI = {},
      isUseUIStep,
      platform
    } = params;

    this.state = RecordState.NONE;

    this.UI = UI;
    this.isUseUIStep = isUseUIStep;
    this.recorder = null;
    this.recording = false;
    this.success = false;
    this.fail = false;
    this.working = false;
    this.workerRecord = false;
    this.volume = null;
    this.sampleRate = null;
    this.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = null;
    this.stream = null;
    this.source = null;
    this.channels = [];
    this.recordingLength = 0;
    this.bufferSize = 2048;
    this.filename = 0;
    this.maxRecordTimeSecond = null;
    this.workletOptions = {
      ...workletOptions,
      // numberOfInputs: 2,
      // numberOfOutputs: 2,
      // outputChannelCount: 2,
      // processorOptions: {
      //   codec: 'audio/m4a'
      // }
    };

    this.checking = false;
    this.checkingId = null;
    this.checkingTimeout = 1000;

    this.workletModuleUrl = workletModuleUrl || '/assets/js/worklet/Processor.js';

    this.workletNodeName = workletNodeName || 'Processor';

    this.mimeType = mimeType || 'audio/m4a';

    this.permissionFail = permissionFail;

    if (platform) {
      this.platform = platform;
    }
  }

  init = async () => {

  };

  reset = () => {
    this.recording = false;
    this.success = false;
    this.fail = false;
    this.checking = false;
  };

  onWorker = () => {
    if (!this.workerRecord) {
      this.workerRecord = new WorkerRecord();
    }

    this.workerRecord.onmessage = (event) => {
      const { data } = event;

      const { type, payload } = data;

      // console.log('onmessage workerRecord', data);

      if (type === 'checker') {
        const { blob, checkTime } = payload;

        // console.log('blobUrl', window.URL.createObjectURL(blob));

        if (this.recording) {
          this.handleChecker(blob, checkTime);

          if (this.isUseUIStep) {
            this.onUIChecking();
          }
        }
      }

      if (type === 'stop') {
        const { blob } = payload;

        // console.log('blobUrl stop', window.URL.createObjectURL(blob));

        this.setPlayer(blob);
      }
    }
  };

  onUIChecking = () => {
    // console.log('onUIChecking');

    if (!this.checking) {
      this.checkingId = setTimeout(() => {
        // console.log('checking');

        this.checking = true;
        clearTimeout(this.checkingId);

        if (this.UI.checking) {
          this.UI.checking()
        }
      }, this.checkingTimeout)
    }
  };

  handleChecker = async (blob, checkTime) => {
    // console.log('checkTime', checkTime);

    if (this.maxRecordTimeSecond && checkTime >= this.maxRecordTimeSecond) {
      this.fail = true;
      this.working = false;
      if (this.UI.fail) {
        this.UI.fail()
      }

      this.disconnect();
      return;
    }

    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' });

        if (permission.state === 'denied') {
          this.permissionFail({
            name: 'NotAllowedError'
          });

          return
        }
      } else {
        // const media = await this.getStream({ isCheckData: true });
        //
        // if (!media) {
        //   this.permissionFail({
        //     name: 'NotAllowedError'
        //   });
        //
        //   return
        // }
      }
    } catch (err) {
      // if (err.name === "TypeError") {
      //   if (this.UI.corrupted) {
      //     this.UI.corrupted();
      //   }
      // }

      // console.log('microphone err', err, err.name);
    }

    const file = this.getFile({ blob, fileName: `${this.filename}.mp3` });

		console.log('HERE', file, this.filename)
    
		if (this.filename === 5) {
			Socket.instance().post({
				eventName: 'check-success'
			})
		}

    this.filename++;
  };

  getStream = async (params = {}) => {
    let { isCheckData, ...options } = params;

    // console.log('options', options);

    if (Object.keys(options).length === 0) {
      options = { audio: true, video: false };
    }

    try {
      return await navigator.mediaDevices.getUserMedia(options);
    } catch (err) {
      // console.log('isCheckData', isCheckData);
      console.log('getUserMedia err', err);

      if (isCheckData) {
        return null
      }

      return this.permissionFail(err);
    }
  };

  getFile = ({ blob, fileName = 'check-watermark.m4a' }) => {
    return new File([blob], fileName, {
      type: 'audio/mpeg'
    });
  };

  connect = async ({ stream, isDisableMutedTab, streamOptions }) => {
    // console.log('connect', stream);

    this.stream = stream || await this.getStream(streamOptions);

    if (this.stream) {
      this.recording = true;
      if (this.UI.start) {
        this.UI.start();
      }
      // console.log('this.stream', this.stream);

      // console.log('connect', !this.maxRecordTimeSecond, !this.watermarkCheckId)

      if (!this.working) {
        this.context = new this.AudioContext();
        this.sampleRate = this.context.sampleRate;

        this.source = this.context.createMediaStreamSource(this.stream);
      }

      // chỉ dùng cho extension
      if (isDisableMutedTab) {
        this.source.connect(this.context.destination);
      }

      try {
        if (!this.working) {
          // console.log('try', this.workletModuleUrl, this.workletNodeName)
          await this.context.audioWorklet.addModule(this.workletModuleUrl);

          this.audioWorkletNode = new AudioWorkletNode(this.context, this.workletNodeName, this.workletOptions);

          this.source.connect(this.audioWorkletNode).connect(this.context.destination);
					
          this.onWorker();
					
          this.workerRecord.postMessage({
            type: 'init',
            payload: {
              mimeType: this.mimeType,
              sampleRate: this.sampleRate,
              bufferSize: this.bufferSize,
              waitTime: this.recordedTimeSecond,
              maxTime: this.maxRecordTimeSecond,
              consecutiveCount: this.recordedConsecutiveCount
            }
          });
        }

        this.audioWorkletNode.port.onmessage = (e) => {
          // console.log('onmessage', this.recording);
          // console.log('e.data', e.data);
          // console.log('e.data', e.data.toString().length);
          if (this.recording) {
            this.workerRecord.postMessage({
              type: 'buffer',
              payload: {
                buffer: e.data
              }
            });
          }
        };

        this.working = true;
      } catch (err) {
        console.log('addModule err', err, err.name)
      }
    }
  };

  start = async (params = {}) => {
    const { stream, ...options } = params;

    this.reset();

    if (!this.working) {
      // const { watermarkCheckId, maxRecordTimeSecond, recordedTimeSecond, recordedConsecutiveCount } = await this.getWatermarkId();

      this.watermarkCheckId = '999';
      this.maxRecordTimeSecond = 500;
      this.recordedTimeSecond = 60;
      this.recordedConsecutiveCount = 20;

			console.log('STREAM', stream)
      Socket.instance().connect({
        cbAfterGetData: (data) => {
					// console.log('socket', data)
          this.disconnect();
          this.working = false;
          // console.log('success', parent, data);
          this.recording = false;

          this.success = true;
          if (data) {
            if (this.UI.success) {
              this.UI.success(data);
            }
          }
        },
        onTransportError: async () => {
          console.log('onTransportError');
          this.reconnect();

          await this.connect({ stream, ...options })
        }
      });
    }

    await this.connect({ stream, ...options })
  };

  setPlayer = (blob) => {
    // console.log('blobUrl', window.URL.createObjectURL(blob));

    const player = document.getElementById('test-record');

    player.src = window.URL.createObjectURL(blob);
  };

  reconnect = () => {
    this.recording = false;
    this.working = false;
  };

  disconnect = () => {
    this.recording = false;
    this.working = false;

    if (this.workerRecord) {
      this.workerRecord.terminate();

      this.workerRecord = null;
    }

    // if (this.source) {
    //   this.source.disconnect(0);
    // }

    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode.port.close();
    }

    if (this.isUseUIStep) {
      if (this.checkingId) {
        clearTimeout(this.checkingId)
      }
    }
  };

  stop = () => {
    // console.log('stop');
    this.working = false;
    this.workerRecord.postMessage({
      type: 'stop'
    });

    this.recording = false;

    this.disconnect();
  };
}

export default Recorder;
