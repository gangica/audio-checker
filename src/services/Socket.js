import io from 'socket.io-client';

const noop = () => { };

let sdk;

class Socket {
  static instance() {
    if (!sdk) {
      sdk = new Socket();
    }
    return sdk;
  }

  constructor() {
    this.socket = null;
  }

  connect = (params = {}) => {
    const {
			socketUrl = 'http://localhost:5000',
      cbAfterGetData = noop,
      onTransportError = noop,
    } = params;
		
    if (!this.socket) {
      this.socket = io(socketUrl, {
        transports: ['websocket']
      });

      this.socket.on('connect', async function (event) {
        // console.log('event connect', event)
      });

      this.socket.on('error', async function (event) {
        console.log('socket error', event)
      });

      this.socket.on('disconnect', async function (event) {
        console.log('socket disconnect', event);

        if (event === 'transport error') {
          onTransportError();
        }
      });

			this.socket.on('check-success-client', function (event) {
        console.log('check-success-client', event);

				if (cbAfterGetData) {
          cbAfterGetData({
            eventName: 'check-success-client',
            ...event
          });
        }
      });
    }
  };

  post = ({
    eventName,
    data
  }) => {
    this.socket.emit(eventName, data);
  }

  reconnect = (params) => {
    this.disconnect();

    this.connect(params)
  };

  disconnect = () => {
    if (this.socket) {
      // console.log('disconnect');

      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default Socket;
