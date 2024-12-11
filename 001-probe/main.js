'use strict';


(() => {
    setupScreencap();
    setupCamera();
    setupAudioOnly();
})();

function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

function setupScreencap() {
    const containerSelector = '#con-screen-cap';

    if (!(navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
        errorMsg('mediaDevices.getDisplayMedia is not supported');
        return;
    }

    async function start(handlerOnSuccess) {
        const hasEchoCancellation = document.querySelector(containerSelector + ' #echoCancellation').checked;
        const micConstraints = {
            audio: {
                echoCancellation: {exact: hasEchoCancellation}
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
            video: true,
            // audio: true,
        };
        console.log('Using constraints:', constraints);

        let screenStream = null;
        try {
            screenStream = await navigator.mediaDevices.getDisplayMedia(constraints)
        } catch (error) {
            console.error('mediaDevices.getDisplayMedia' + ' error:', error);
            errorMsg('mediaDevices.getDisplayMedia' + ` error:${error.toString()}`);
            return;
        }
        if (!screenStream) {
            console.error('Empty screen stream');
            errorMsg('Empty screen stream');
            return;
        }

        const compoStream = screenStream;
        if (micStream) {
            compoStream.addTrack(micStream.getAudioTracks()[0]);
        }

        handlerOnSuccess(compoStream);
    }

    setupRecordable({
        containerSelector: containerSelector,
        streamType: 'video',
        onStartClick: start,
    });
}

function setupCamera() {
    const containerSelector = '#con-camera';

    if (!(navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices)) {
        errorMsg('mediaDevices.' + 'getUserMedia' + ' is not supported');
        return;
    }

    function start(handlerOnSuccess) {
        const hasEchoCancellation = document.querySelector(containerSelector + ' #echoCancellation').checked;
        const constraints = {
            audio: {
                echoCancellation: {exact: hasEchoCancellation}
            },
            video: {
                width: 1280, height: 720
            }
        };
        console.log('Using constraints:', constraints);

        navigator.mediaDevices.getUserMedia(constraints).then(
            handlerOnSuccess,
            error => {
                console.error('mediaDevices.getUserMedia' + ' error:', error);
                errorMsg('mediaDevices.getUserMedia' + ` error:${error.toString()}`);
            }
        );
    }

    setupRecordable({
        containerSelector: containerSelector,
        streamType: 'video',
        onStartClick: start,
    });
}


function setupAudioOnly() {
    const containerSelector = '#con-audio-only';

    if (!(navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices)) {
        errorMsg('mediaDevices.' + 'getUserMedia' + ' is not supported');
        return;
    }

    function start(handlerOnSuccess) {
        const hasEchoCancellation = document.querySelector(containerSelector + ' #echoCancellation').checked;
        const constraints = {
            audio: {
                echoCancellation: {exact: hasEchoCancellation}
            },
            video: false
        };
        console.log('Using constraints:', constraints);

        navigator.mediaDevices.getUserMedia(constraints).then(
            handlerOnSuccess,
            error => {
                console.error('mediaDevices.getUserMedia' + ' error:', error);
                errorMsg('mediaDevices.getUserMedia' + ` error:${error.toString()}`);
            }
        );
    }

    setupRecordable({
        containerSelector: containerSelector,
        streamType: 'audio',
        onStartClick: start,
    });
}


// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function setupRecordable({
    containerSelector,
    streamType,
    onStartClick,
}) {
    const streamHolder = {stream: null};
    let mediaRecorder;
    let recordedBlobs;

    let mimeType = null;
    if (streamType === 'video') {
        mimeType = 'video/webm';
    } else if (streamType === 'audio') {
        mimeType = 'audio/webm';
    }

    const startButton = document.querySelector(containerSelector + ' button#start');
    const recordButton = document.querySelector(containerSelector + ' button#record');
    const playButton = document.querySelector(containerSelector + ' button#play');
    const downloadButton = document.querySelector(containerSelector + ' button#download');

    // START
    startButton.addEventListener('click', async () => {
        onStartClick(handleStream);
    });
    startButton.disabled = false;

    function handleStream(stream) {
        startButton.disabled = true;
        recordButton.disabled = false;
        console.log('Got stream:', stream);
        streamHolder.stream = stream;

        const gumElement = document.querySelector(containerSelector + ' #gum');
        gumElement.srcObject = stream;

        function onStreamEnded() {
            errorMsg('The stream was ended by user');
            startButton.disabled = false;
            stopRecording()
        }

        if (streamType === 'video') {
            stream.getVideoTracks()[0].addEventListener('ended', onStreamEnded);
        } else if (streamType === 'audio') {
            stream.getAudioTracks()[0].addEventListener('ended', onStreamEnded);
        }
    }

    // RECORD
    recordButton.addEventListener('click', () => {
        if (recordButton.textContent === 'Start Recording') {
            startRecording();
        } else {
            stopRecording();
        }
    });

    function startRecording() {
        recordedBlobs = [];

        try {
            mediaRecorder = new MediaRecorder(streamHolder.stream);
        } catch (e) {
            console.error('Exception while creating MediaRecorder:', e);
            errorMsg(`Exception while creating MediaRecorder: ${JSON.stringify(e)}`);
            return;
        }

        console.log('Created MediaRecorder', mediaRecorder);
        mediaRecorder.onstop = (event) => {
            console.log('Recorder stopped: ', event);
            console.log('Recorded Blobs: ', recordedBlobs);
        };
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        console.log('MediaRecorder started', mediaRecorder);

        recordButton.textContent = 'Stop Recording';
        playButton.disabled = true;
        downloadButton.disabled = true;
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        recordButton.textContent = 'Start Recording';
        playButton.disabled = false;
        downloadButton.disabled = false;
    }

    function handleDataAvailable(event) {
        console.log('handleDataAvailable', event);
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }

    // PLAY
    playButton.addEventListener('click', () => {
        const recordShowElement = document.querySelector(containerSelector + ' #recorded');
        const superBuffer = new Blob(recordedBlobs, {type: mimeType});
        recordShowElement.src = null;
        recordShowElement.srcObject = null;
        recordShowElement.src = window.URL.createObjectURL(superBuffer);
        recordShowElement.controls = true;
        recordShowElement.play();
    });

    // DOWNLOAD
    downloadButton.addEventListener('click', () => {
        const blob = new Blob(recordedBlobs, {type: mimeType});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    });
}
