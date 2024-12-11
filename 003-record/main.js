'use strict';


function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

async function getScreencapStream() {
  const micConstraints = {
    audio: {
      // echoCancellation: {exact: hasEchoCancellation}
    },
    video: false
  };
  console.log('Microphone constraints:', micConstraints);
  let micStream = null;
  try {
    micStream = await navigator.mediaDevices.getUserMedia(micConstraints);
  } catch (error) {
    console.error('mediaDevices.getUserMedia' + ' error:', error);
    errorMsg('mediaDevices.getUserMedia' + ` error:${error.toString()}`);
  }

  const constraints = {
    video: {
      displaySurface: 'monitor',
      // height: {
      //     max: videoHeightMax,
      // },
    },
    // audio: true,
  };
  console.log('Using constraints:', constraints);
  let screenStream = null;
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia(constraints)
  } catch (error) {
    console.error('mediaDevices.getDisplayMedia' + ' error:', error);
    errorMsg('mediaDevices.getDisplayMedia' + ` error:${error.toString()}`);
  }

  if (!screenStream) {
    console.error('No screen stream');
    return false;
  }

  const compoStream = screenStream;
  if (micStream) {
    compoStream.addTrack(micStream.getAudioTracks()[0]);
  }
  return compoStream;
}

const screenrec = {
  mainStream: null,
  mediaRecorder: null,
  recordedBlobs: null,

  startButton: null,
  playButton: null,
  recordButton: null,
  downloadButton: null,

  containerSelector: '#con-screen-cap',
  blobMimeType: 'video/webm',

  async onStartButtonClick() {
    const compoStream = await getScreencapStream();
    if (!compoStream) {
      return;
    }
    this.handleScreencapStream(compoStream);
  },
  onPlayButtonClick() {
    const recordShowElement = document.querySelector(this.containerSelector + ' #recorded');
    const superBuffer = new Blob(this.recordedBlobs, {type: this.blobMimeType});
    recordShowElement.src = null;
    recordShowElement.srcObject = null;
    recordShowElement.src = URL.createObjectURL(superBuffer);
    recordShowElement.controls = true;
    recordShowElement.play();
  },
  onRecordButtonClick() {
    if (this.recordButton.textContent === 'Start Recording') {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  },
  onDownloadButtonClick() {
    const blob = new Blob(this.recordedBlobs, {type: this.blobMimeType});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  handleScreencapStream(stream) {
    this.mainStream = stream;
    this.startButton.disabled = true;
    this.recordButton.disabled = false;
    console.log('Got stream:', stream);

    const gumElement = document.querySelector(this.containerSelector + ' #gum');
    gumElement.srcObject = stream;

    const onStreamEnded = () => {
      errorMsg('Stream was ended by user');
      this.startButton.disabled = false;
      this.stopRecording();
    };

    stream.getVideoTracks()[0].addEventListener('ended', onStreamEnded);
  },

  startRecording() {
    this.recordedBlobs = [];

    let recorderMimeType = document.querySelector(this.containerSelector + ' #recorderMimeType')?.value || null;
    try {
      let options = {};
      if (recorderMimeType) {
        options.mimeType = recorderMimeType;
      }
      console.log('mediaRecorder options:', options);

      this.mediaRecorder = new MediaRecorder(
        this.mainStream,
        options,
      );
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      errorMsg(`Exception while creating MediaRecorder: ${JSON.stringify(e)}`);
      return;
    }

    console.log('Created MediaRecorder', this.mediaRecorder);
    this.mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped:', event, 'Blobs recorded:', this.recordedBlobs);
    };
    this.mediaRecorder.ondataavailable = this.handleDataAvailable;
    this.mediaRecorder.start(5000);
    console.log('MediaRecorder started', this.mediaRecorder);

    this.recordButton.textContent = 'Stop Recording';
    this.playButton.disabled = true;
    this.downloadButton.disabled = true;
  },

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.recordButton.textContent = 'Start Recording';
    this.playButton.disabled = false;
    this.downloadButton.disabled = false;
  },

  handleDataAvailable(event) {
    console.log('handleDataAvailable', event);
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data);
    }
  },

  setup() {
    this.startButton = document.querySelector(this.containerSelector + ' button#start');
    this.playButton = document.querySelector(this.containerSelector + ' button#play');
    this.recordButton = document.querySelector(this.containerSelector + ' button#record');
    this.downloadButton = document.querySelector(this.containerSelector + ' button#download');

    if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
      this.startButton.disabled = false;
    } else {
      errorMsg('mediaDevices.getDisplayMedia is not supported');
      return;
    }

    this.startButton.addEventListener('click', () => {
      this.onStartButtonClick()
    });
    this.playButton.addEventListener('click', () => {
      this.onPlayButtonClick()
    });
    this.recordButton.addEventListener('click', () => {
      this.onRecordButtonClick()
    });
    this.downloadButton.addEventListener('click', () => {
      this.onDownloadButtonClick()
    });
  },
};


document.addEventListener('DOMContentLoaded', () => {
  screenrec.setup();
});
