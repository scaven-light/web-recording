'use strict';

function addPreviewTest(link, name, thumbnailUrl) {
  const html = '<p style="display: flex; flex-wrap: wrap; justify-content: space-between; width: 300px; ">' +
    name +
    '  <a target="_blank" href="' + link +'">Watch Video</a>' +
    '</p>' + '<a class="komodo-gmail-thumbnail" target="_blank" href="' + link +'">' +
    '<img style="width: 300px;" src="' + thumbnailUrl + '">' +
    '</a>';

  const mainPreview = document.createElement('div');
  mainPreview.style.width = '400px';
  mainPreview.style.backgroundColor = '#F1FFF0';
  mainPreview.style.border = '#39BE32 0.1em solid';
  mainPreview.style.margin = '0.2em';
  mainPreview.style.padding = '0.2em';

  const previewWrapper = document.createElement('div');
  previewWrapper.setAttribute("class", "komodo-embeded-wrapper");
  previewWrapper.style.backgroundColor = 'white';
  previewWrapper.style.border = 'white';
  previewWrapper.innerHTML = html;
  mainPreview.appendChild(previewWrapper);

  mainPreview.appendChild(document.createElement('hr'));

  const copyBtn = document.createElement('button');
  copyBtn.innerText = 'Copy link';
  mainPreview.appendChild(copyBtn);

  copyBtn.onclick = () => {
    const blobHTML = new Blob([html], {type: 'text/html'});
    const blobText = new Blob([link], {type: 'text/plain'});
    const clipboardItem = new ClipboardItem({ 'text/html': blobHTML, 'text/plain': blobText });
    navigator.clipboard.write([clipboardItem]);
  };

  return mainPreview
}

document.addEventListener('DOMContentLoaded', () => {

  const main = document.createElement('div');
  main.style.display = 'flex';
  main.style.flexWrap = 'wrap';
  main.style.alignContent = 'space-around';
  main.style.justifyContent = 'space-evenly';

  document.body.appendChild(main);

  const preview1 = addPreviewTest('https://komododecks.com/recordings/GTqgoz9kzFi998xfjUFz','Komodo Hello World Introduction!', 'https://storage.googleapis.com/komodo-280e0.appspot.com/f0tZfLY6wQSl1F15zC8lhsJJYsZ2/B9ObDzs6jrNF6YKxkdow/preview-1bfad33edb967387cf0815c7e341f01861f0728f53b90da6306403168e77313f.gif');
  main.appendChild(preview1);
  const preview2 = addPreviewTest('https://komododecks.com/recordings/tgE4xK4IVgg6axieG6Gz','Intro to Komodo\'s Video Editor', 'https://storage.googleapis.com/komodo-280e0.appspot.com/lZvoYBrdONWLHSy8BtxRkv4x5vA3/KHKoOYXK523oERRwJNgj/preview-43fe05927fc80e49d01807e3281bfbd410f7ba0ab0969d59d408a1b9c0b0759d.jpg');
  main.appendChild(preview2);
  const preview3 = addPreviewTest('https://komododecks.com/recordings/toPsWxrmqfmf2Unm7xdH','Mic and Camera', 'https://storage.googleapis.com/komodo-280e0.appspot.com/1KDAFJ49MwOGJMrkl69sEiKvQg53/toPsWxrmqfmf2Unm7xdH/preview-900d0d097b872054a3b4b7e9ce56ec89eac81e4e6401bbe1a4434a33afd9f043.gif');
  main.appendChild(preview3);

});
