/*
 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

// Polyfill in Firefox.
// See https://blog.mozilla.org/webrtc/getdisplaymedia-now-available-in-adapter-js/
// if (adapter.browserDetails.browser == 'firefox') {
//     adapter.browserShim.shimGetDisplayMedia(window, 'screen');
// }


function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

setup_screen_cap(
    '#con-screen-cap',
);
setup_camera(
    window.cameraStream,
    '#con-camera',
);




// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function setup_screen_cap(
    container_selector
) {
    const startButton = document.querySelector(container_selector + ' button#start');

    if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
        startButton.disabled = false;
    } else {
        errorMsg('getDisplayMedia is not supported');
    }

    function handleSuccess(stream) {
        startButton.disabled = true;
        const video = document.querySelector(container_selector + ' video#gum');
        video.srcObject = stream;

        // demonstrates how to detect that the user has stopped
        // sharing the screen via the browser UI.
        stream.getVideoTracks()[0].addEventListener('ended', () => {
            errorMsg('The user has ended sharing the screen');
            startButton.disabled = false;
        });
    }
    startButton.addEventListener('click', () => {
        navigator.mediaDevices.getDisplayMedia({video: true}).then(
            handleSuccess,
            error => { errorMsg(`getDisplayMedia error: ${error.name}`, error); }
        );
    });
}



// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function setup_camera(
    stream_holder,
    container_selector
) {
    let mediaRecorder;
    let recordedBlobs;

    const startButton = document.querySelector(container_selector + ' button#start');
    const recordButton = document.querySelector(container_selector + ' button#record');
    const playButton = document.querySelector(container_selector + ' button#play');
    const downloadButton = document.querySelector(container_selector + ' button#download');

    recordButton.addEventListener('click', () => {
        if (recordButton.textContent === 'Start Recording') {
            startRecording();
        } else {
            stopRecording();
        }
    });

    playButton.addEventListener('click', () => {
        const recordedVideo = document.querySelector(container_selector + ' video#recorded');
        const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
        recordedVideo.src = null;
        recordedVideo.srcObject = null;
        recordedVideo.src = window.URL.createObjectURL(superBuffer);
        recordedVideo.controls = true;
        recordedVideo.play();
    });

    downloadButton.addEventListener('click', () => {
        const blob = new Blob(recordedBlobs, {type: 'video/webm'});
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

    function handleDataAvailable(event) {
        console.log('handleDataAvailable', event);
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }

    function get_options() {
        let options = {mimeType: 'video/webm;codecs=vp9,opus'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not supported`);
            options = {mimeType: 'video/webm;codecs=vp8,opus'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.error(`${options.mimeType} is not supported`);
                options = {mimeType: 'video/webm'};
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.error(`${options.mimeType} is not supported`);
                    options = {mimeType: ''};
                }
            }
        }
        return options;
    }

    function startRecording() {
        recordedBlobs = [];

        let options = get_options();

        try {
            mediaRecorder = new MediaRecorder(stream_holder, options);
        } catch (e) {
            console.error('Exception while creating MediaRecorder:', e);
            errorMsg(`Exception while creating MediaRecorder: ${JSON.stringify(e)}`);
            return;
        }

        console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
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
        mediaRecorder.stop();
        recordButton.textContent = 'Start Recording';
        playButton.disabled = false;
        downloadButton.disabled = false;
    }

    function handleSuccess(stream) {
        startButton.disabled = true;
        recordButton.disabled = false;
        console.log('Got stream:', stream);
        stream_holder = stream;

        const gumVideo = document.querySelector(container_selector + ' video#gum');
        gumVideo.srcObject = stream;

        stream.getVideoTracks()[0].addEventListener('ended', () => {
            errorMsg('The user has ended the stream');
            startButton.disabled = false;
            stopRecording()
        });
    }

    startButton.addEventListener('click', async () => {
        const hasEchoCancellation = document.querySelector(container_selector + ' #echoCancellation').checked;
        const constraints = {
            audio: {
                echoCancellation: {exact: hasEchoCancellation}
            },
            video: {
                width: 1280, height: 720
            }
        };
        console.log('Using media constraints:', constraints);

        navigator.mediaDevices.getUserMedia(constraints).then(
            handleSuccess,
            error => {
                console.error('navigator.getUserMedia error:', error);
                errorMsg(`navigator.getUserMedia error:${error.toString()}`);
            }
        );
    });

    if ((navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices)) {
        startButton.disabled = false;
    } else {
        errorMsg('getUserMedia is not supported');
    }
}
