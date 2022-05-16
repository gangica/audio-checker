export default {
  RECORD_STATE: {
    START: 'start',
    PAUSE: 'pause',
    STOP: 'stop',
    NONE: 'none'
  },
  STATE: {
    AUDIBLE: 'audible',
    SILENCE: 'silence'
  },
  WORKER_STATE: {
    START: 'start'
  },
  STEP_CHECKER: {
    START: 0,
    CHECKING: 1,
    RESULT: 2,
    FAIL: 3,
    SILENCE: 4,
    NO_STREAM: 5
  },
  SOCKET_EVENT: {
    CONFIRM_ADD_WATERMARK: 'confirm-add-watermark',
    ADD_WATERMARK: 'add-watermark',
    CHECK_WATERMARK: 'check-watermark'
  },
}
