/*
 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';


document.addEventListener('DOMContentLoaded', () => {
    setup();
});

function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

function setup() {
    let mainStream = null;
    let mediaRecorder;
    let recordedBlobs;

    const containerSelector = '#con-screen-cap';
    const blobMimeType = 'video/webm';

    const startButton = document.querySelector(containerSelector + ' button#start');
    const playButton = document.querySelector(containerSelector + ' button#play');
    const recordButton = document.querySelector(containerSelector + ' button#record');
    const downloadButton = document.querySelector(containerSelector + ' button#download');

    const onStartButtonClick = async () => {
        const compoStream = await getScreencapStream();
        if (!compoStream) {
            return;
        }
        handleScreencapStream(compoStream);
    };
    const onPlayButtonClick = () => {
        const recordShowElement = document.querySelector(containerSelector + ' #recorded');
        const superBuffer = new Blob(recordedBlobs, {type: blobMimeType});
        recordShowElement.src = null;
        recordShowElement.srcObject = null;
        recordShowElement.src = window.URL.createObjectURL(superBuffer);
        recordShowElement.controls = true;
        recordShowElement.play();
    };
    const onRecordButtonClick = () => {
        if (recordButton.textContent === 'Start Recording') {
            startRecording();
        } else {
            stopRecording();
        }
    };
    const onDownloadButtonClick = () => {
        const blob = new Blob(recordedBlobs, {type: blobMimeType});
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
    };

    startButton.addEventListener('click', onStartButtonClick);
    playButton.addEventListener('click', onPlayButtonClick);
    recordButton.addEventListener('click', onRecordButtonClick);
    downloadButton.addEventListener('click', onDownloadButtonClick);

    if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
        const startButton = document.querySelector(containerSelector + ' button#start');
        startButton.disabled = false;
    } else {
        errorMsg('mediaDevices.getDisplayMedia is not supported');
        return;
    }

    async function getScreencapStream() {
        // const hasEchoCancellation = document.querySelector(containerSelector + ' #echoCancellation').checked;
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

    function handleScreencapStream(stream) {
        mainStream = stream;
        startButton.disabled = true;
        recordButton.disabled = false;
        console.log('Got stream:', stream);

        const gumElement = document.querySelector(containerSelector + ' #gum');
        gumElement.srcObject = stream;

        function onStreamEnded() {
            errorMsg('Stream was ended by user');
            startButton.disabled = false;
            stopRecording();
        }

        stream.getVideoTracks()[0].addEventListener('ended', onStreamEnded);
    }

    function startRecording() {
        recordedBlobs = [];

        let recorderMimeType = document.querySelector(containerSelector + ' #recorderMimeType')?.value || null;
        try {
            let options = {};
            if (recorderMimeType) {
                options.mimeType = recorderMimeType;
            }
            console.log('mediaRecorder options:', options);

            mediaRecorder = new MediaRecorder(
              mainStream,
              options,
            );
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
        mediaRecorder.start(5000);
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
}
