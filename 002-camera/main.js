(async () => {
  const mainDiv = document.createElement('div');
  document.body.appendChild(mainDiv);

  ///// //// //// //// //// ////
  const div1 = document.createElement('div');
  div1.style.backgroundColor = '#CC8888';
  mainDiv.appendChild(div1);

  div1.innerText = 'VIDEO 1:'
  const vid1 = document.createElement('video');
  vid1.autoplay = true;
  vid1.playsinline = true;
  vid1.muted = true;
  vid1.style.height = '40vh';

  div1.appendChild(vid1);

  const s1 = await navigator.mediaDevices.getUserMedia({audio: false, video: true});

  vid1.srcObject = s1;
  ///// //// //// //// //// ////
  mainDiv.appendChild( document.createElement('hr'));
  ///// //// //// //// //// ////
  const div2 = document.createElement('div');
  div2.style.backgroundColor = '#88CC88';
  mainDiv.appendChild(div2);

  div2.innerText = 'VIDEO 2:'
  const vid2 = document.createElement('video');
  vid2.autoplay = true;
  vid2.playsinline = true;
  vid2.muted = true;
  vid2.style.height = '40vh';

  div2.appendChild(vid2);

  const s2 = await navigator.mediaDevices.getUserMedia({audio: false, video: {frameRate:{ideal:30,max:30},width:{ideal:1280,max:1280},height:{ideal:720,max:720}}});

  vid2.srcObject = s2;
})();
