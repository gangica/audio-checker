chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // console.log(message, 'CONTENT')
  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //   console.log('CAPTURING')
  //   // audioCapture()
  // })
  if (message === "TOCLIENT") {
    console.log(message, 'CONTENT')
    sendResponse({ context: 'CONTENT', message, sender, tab: chrome.tabCapture })
  }
})