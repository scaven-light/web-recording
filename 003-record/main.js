/*
 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';


document.addEventListener('DOMContentLoaded', () => {
    setup_screencap();
});

function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

function setup_screencap() {
    const stream_holder = {stream: null}
    const container_selector = '#con-screen-cap';

    function checker() {
        const startButton = document.querySelector(container_selector + ' button#start');
        if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
            startButton.disabled = false;
        } else {
            errorMsg('mediaDevices.getDisplayMedia is not supported');
        }
    }

    async function on_start_func(handle_success_func) {
        // const hasEchoCancellation = document.querySelector(container_selector + ' #echoCancellation').checked;
        const mic_constraints = {
            audio: {
                // echoCancellation: {exact: hasEchoCancellation}
            },
            video: false
        };
        console.log('Microphone constraints:', mic_constraints);

        let mic_stream = null;
        try {
            mic_stream = await navigator.mediaDevices.getUserMedia(mic_constraints);
        } catch (error) {
            console.error('mediaDevices.getUserMedia' + ' error:', error);
            errorMsg('mediaDevices.getUserMedia' + ` error:${error.toString()}`);
        }

        const constraints = {
            video: true,
            // audio: true,
        };
        console.log('Using constraints:', constraints);

        let screen_stream = null;
        try {
            screen_stream = await navigator.mediaDevices.getDisplayMedia(constraints)
        } catch (error) {
            console.error('mediaDevices.getDisplayMedia' + ' error:', error);
            errorMsg('mediaDevices.getDisplayMedia' + ` error:${error.toString()}`);
        }

        if (!screen_stream) {
            console.error('No screen stream');
            return;
        }

        stream_holder.stream = screen_stream;

        if (mic_stream) {
            const mic_track = mic_stream.getAudioTracks()[0];
            stream_holder.stream.addTrack(mic_track);
        }

        handle_success_func(screen_stream);
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

    let blob_mime_type = null;
    if (stream_type === 'video') {
        blob_mime_type = 'video/webm';
    } else if (stream_type === 'audio') {
        blob_mime_type = 'audio/webm';
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

        let recorder_mime_type = document.querySelector(container_selector + ' #recorderMimeType')?.value || null;
        try {
            let options = {};
            if (recorder_mime_type) {
                options.mimeType = recorder_mime_type;
            }
            console.log('mediaRecorder options:', options);

            mediaRecorder = new MediaRecorder(
                stream_holder.stream,
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
        const recordShowElement = document.querySelector(container_selector + ' #recorded');
        const superBuffer = new Blob(recordedBlobs, {type: blob_mime_type});
        recordShowElement.src = null;
        recordShowElement.srcObject = null;
        recordShowElement.src = window.URL.createObjectURL(superBuffer);
        recordShowElement.controls = true;
        recordShowElement.play();
    });

    // DOWNLOAD
    downloadButton.addEventListener('click', () => {
        const blob = new Blob(recordedBlobs, {type: blob_mime_type});
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
