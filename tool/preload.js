// All of the Node.js APIs are available in the preload process.
window.electron = require("electron");
window.fs = require('fs');
window.Papa = require('papaparse')

// Import ES6 way
window.getMainWindow = require('electron-main-window').getMainWindow;

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  } 
  
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
});
