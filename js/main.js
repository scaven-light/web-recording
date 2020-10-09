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

function setup_screencap() {
    let stream_holder = {stream: null}
    window.screenCapStreamHolder = stream_holder;
    let container_selector = '#con-screen-cap';

    function checker() {
        const startButton = document.querySelector(container_selector + ' button#start');
        if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
            startButton.disabled = false;
        } else {
            errorMsg('mediaDevices.getDisplayMedia' + ' is not supported');
        }
    }

    function on_start_func(handle_success_func) {
        const constraints = {
            video: true,
            // audio: true,
        };
        console.log('Using constraints:', constraints);

        navigator.mediaDevices.getDisplayMedia(constraints).then(
            handle_success_func,
            error => {
                console.error('mediaDevices.getDisplayMedia' + ' error:', error);
                errorMsg('mediaDevices.getDisplayMedia' + ` error:${error.toString()}`);
            }
        );

        const hasEchoCancellation = document.querySelector(container_selector + ' #echoCancellation').checked;
        const mic_constraints = {
            audio: {
                echoCancellation: {exact: hasEchoCancellation}
            },
            video: false
        };
        console.log('Using constraints:', mic_constraints);

        navigator.mediaDevices.getUserMedia(mic_constraints).then(
            handle_audio_success_func,
            error => {
                console.error('mediaDevices.getUserMedia' + ' error:', error);
                errorMsg('mediaDevices.getUserMedia' + ` error:${error.toString()}`);
            }
        );

    }

    function handle_audio_success_func(stream) {
        const gumElement = document.querySelector(container_selector + ' audio#gum-audio');
        gumElement.srcObject = stream;

        // AUDIO must be handled AFTER video stream

        let mic_track = stream.getAudioTracks()[0];
        window.screenCapStreamHolder.stream.addTrack(mic_track);
    }

    setup_recordable(
        container_selector,
        'video',
        stream_holder,
        checker,
        on_start_func,
        null
    );

}
setup_screencap();

function setup_camera() {
    let stream_holder = {stream: null}
    window.cameraStreamHolder = stream_holder;
    let container_selector = '#con-camera';

    function checker() {
        const startButton = document.querySelector(container_selector + ' button#start');
        if ((navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices)) {
            startButton.disabled = false;
        } else {
            errorMsg('mediaDevices.' + 'getUserMedia' + ' is not supported');
        }
    }

    function on_start_func(handle_success_func) {
        const hasEchoCancellation = document.querySelector(container_selector + ' #echoCancellation').checked;
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
            handle_success_func,
            error => {
                console.error('mediaDevices.getUserMedia' + ' error:', error);
                errorMsg('mediaDevices.getUserMedia' + ` error:${error.toString()}`);
            }
        );
    }

    setup_recordable(
        container_selector,
        'video',
        stream_holder,
        checker,
        on_start_func,
        null
    );
}
setup_camera();


function setup_audio_only() {
    let stream_holder = {stream: null}
    window.audioOnlyStreamHolder = stream_holder;
    let container_selector = '#con-audio-only';

    function checker() {
        const startButton = document.querySelector(container_selector + ' button#start');
        if ((navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices)) {
            startButton.disabled = false;
        } else {
            errorMsg('mediaDevices.' + 'getUserMedia' + ' is not supported');
        }
    }

    function on_start_func(handle_success_func) {
        const hasEchoCancellation = document.querySelector(container_selector + ' #echoCancellation').checked;
        const constraints = {
            audio: {
                echoCancellation: {exact: hasEchoCancellation}
            },
            video: false
        };
        console.log('Using constraints:', constraints);

        navigator.mediaDevices.getUserMedia(constraints).then(
            handle_success_func,
            error => {
                console.error('mediaDevices.getUserMedia' + ' error:', error);
                errorMsg('mediaDevices.getUserMedia' + ` error:${error.toString()}`);
            }
        );
    }

    setup_recordable(
        container_selector,
        'audio',
        stream_holder,
        checker,
        on_start_func,
        null
    );
}
setup_audio_only();




// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function setup_recordable(
    container_selector,
    stream_type,
    stream_holder,
    checker_func,
    on_start_func,
    on_success_func,
) {
    let mediaRecorder;
    let recordedBlobs;

    let mime_type = null;
    if (stream_type === 'video') {
        mime_type = 'video/webm';
    } else if (stream_type === 'audio') {
        mime_type = 'audio/webm';
    }

    const startButton = document.querySelector(container_selector + ' button#start');
    const recordButton = document.querySelector(container_selector + ' button#record');
    const playButton = document.querySelector(container_selector + ' button#play');
    const downloadButton = document.querySelector(container_selector + ' button#download');

    // CHECK AVAILABILITY
    checker_func();

    // START
    startButton.addEventListener('click', async () => {
        on_start_func(handleSuccess);
    });

    function handleSuccess(stream) {
        if (on_success_func) {
            on_success_func();
        }

        startButton.disabled = true;
        recordButton.disabled = false;
        console.log('Got stream:', stream);
        stream_holder.stream = stream;

        const gumElement = document.querySelector(container_selector + ' #gum');
        gumElement.srcObject = stream;

        function on_stream_ended() {
            errorMsg('The stream was ended by user');
            startButton.disabled = false;
            stopRecording()
        }

        if (stream_type === 'video') {
            // TODO deprecated https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/ended
            stream.getVideoTracks()[0].addEventListener('ended', on_stream_ended);
        } else if (stream_type === 'audio') {
            // TODO same
            stream.getAudioTracks()[0].addEventListener('ended', on_stream_ended);
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

        // let options = get_options();

        try {
            mediaRecorder = new MediaRecorder(stream_holder.stream);
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

    // TODO
    // firefox has problem with ",opus" part for streams without audio (like screencap)
    // chrome is ok though
    //
    // function get_options() {
    //     let options = {mimeType: 'video/webm;codecs=vp9,opus'};
    //     if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    //         console.error(`${options.mimeType} is not supported`);
    //         options = {mimeType: 'video/webm;codecs=vp8,opus'};
    //         if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    //             console.error(`${options.mimeType} is not supported`);
    //             options = {mimeType: 'video/webm'};
    //             if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    //                 console.error(`${options.mimeType} is not supported`);
    //                 options = {mimeType: ''};
    //             }
    //         }
    //     }
    //     return options;
    // }

    function handleDataAvailable(event) {
        console.log('handleDataAvailable', event);
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }

    // PLAY
    playButton.addEventListener('click', () => {
        const recordShowElement = document.querySelector(container_selector + ' #recorded');
        const superBuffer = new Blob(recordedBlobs, {type: mime_type});
        recordShowElement.src = null;
        recordShowElement.srcObject = null;
        recordShowElement.src = window.URL.createObjectURL(superBuffer);
        recordShowElement.controls = true;
        recordShowElement.play();
    });

    // DOWNLOAD
    downloadButton.addEventListener('click', () => {
        const blob = new Blob(recordedBlobs, {type: mime_type});
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
