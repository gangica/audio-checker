import constants from '../utils/constants';

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  const { type, payload } = data;

  sendResponse({ context: 'BACKGROUND', message: type, sender });

  if (type === constants.WORKER_STATE.START) {
    chrome.runtime.sendMessage({
      type: constants.RECORD_STATE.START
    })
  }
});
