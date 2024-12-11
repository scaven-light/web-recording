'use strict';

function addPreviewTest(link, name, thumbnailUrl, type = 1) {

  let html = '';
  let backgroundColor = 'grey';

  if (type == 1) {
    backgroundColor = '#FFF1F0';
    // Space between title and link
    html = '<p>' +
      name +
      ' <a target="_blank" href="' + link + '">Watch Video</a>' +
      '</p>' + '<a class="komodo-gmail-thumbnail" target="_blank" href="' + link + '">' +
      '<img style="width: 300px;" src="' + thumbnailUrl + '">' +
      '</a>';
  } else if (type == 2) {
    backgroundColor = '#F1FFF0';
    // Flex container
    html = '<p style="display: flex; flex-wrap: wrap; justify-content: space-between; width: 300px; ">' +
      name +
      '  <a target="_blank" href="' + link + '">Watch Video</a>' +
      '</p>' + '<a class="komodo-gmail-thumbnail" target="_blank" href="' + link + '">' +
      '<img style="width: 300px;" src="' + thumbnailUrl + '">' +
      '</a>';
  } else {
    backgroundColor = '#F1F0FF';
    // New line between title and link
    html = '<p>' +
      name +
      '<br>' +
      '<a target="_blank" href="' + link + '">Watch Video</a>' +
      '</p>' + '<a class="komodo-gmail-thumbnail" target="_blank" href="' + link + '">' +
      '<img style="width: 300px;" src="' + thumbnailUrl + '">' +
      '</a>';
  }

  const preview = document.createElement('div');
  preview.setAttribute("class", "komodo-preview");
  preview.style.backgroundColor = backgroundColor;

  const previewWrapper = document.createElement('div');
  previewWrapper.setAttribute("class", "komodo-embeded-wrapper");
  previewWrapper.innerHTML = html;
  preview.appendChild(previewWrapper);

  preview.appendChild(document.createElement('hr'));

  const copyBtn = document.createElement('button');
  copyBtn.innerText = 'Copy link';
  preview.appendChild(copyBtn);

  copyBtn.onclick = () => {
    try {
      const blobHTML = new Blob([html], {type: 'text/html'});
      const blobText = new Blob([link], {type: 'text/plain'});
      const clipboardItem = new ClipboardItem({'text/html': blobHTML, 'text/plain': blobText});
      navigator.clipboard.write([clipboardItem]);
    } catch (e) {
      document.oncopy = (event) => {
        event.clipboardData.setData('text/plain', link);
        event.preventDefault();
      };
      document.execCommand('copy');
      document.oncopy = null;
    }
  };

  return preview
}

document.addEventListener('DOMContentLoaded', () => {

  const mainList = document.createElement('div');
  mainList.setAttribute("class", "komodo-previews-list");
  document.body.appendChild(mainList);

  for (let type = 1; type <= 3; type++) {
    const preview1 = addPreviewTest(
      'https://komododecks.com/recordings/GTqgoz9kzFi998xfjUFz',
      'Komodo Hello World Introduction!',
      'https://storage.googleapis.com/komodo-280e0.appspot.com/f0tZfLY6wQSl1F15zC8lhsJJYsZ2/B9ObDzs6jrNF6YKxkdow/preview-1bfad33edb967387cf0815c7e341f01861f0728f53b90da6306403168e77313f.gif',
      type
    );
    mainList.appendChild(preview1);
  }

  for (let type = 1; type <= 3; type++) {
    const preview2 = addPreviewTest(
      'https://komododecks.com/recordings/tgE4xK4IVgg6axieG6Gz',
      'Intro to Komodo\'s Video Editor',
      'https://storage.googleapis.com/komodo-280e0.appspot.com/lZvoYBrdONWLHSy8BtxRkv4x5vA3/KHKoOYXK523oERRwJNgj/preview-43fe05927fc80e49d01807e3281bfbd410f7ba0ab0969d59d408a1b9c0b0759d.jpg',
      type
    );
    mainList.appendChild(preview2);
  }

  for (let type = 1; type <= 3; type++) {
    const preview3 = addPreviewTest(
      'https://komododecks.com/recordings/toPsWxrmqfmf2Unm7xdH',
      'Mic and Camera',
      'https://storage.googleapis.com/komodo-280e0.appspot.com/1KDAFJ49MwOGJMrkl69sEiKvQg53/toPsWxrmqfmf2Unm7xdH/preview-900d0d097b872054a3b4b7e9ce56ec89eac81e4e6401bbe1a4434a33afd9f043.gif',
      type
    );
    mainList.appendChild(preview3);
  }

  for (let type = 1; type <= 3; type++) {
    const preview1 = addPreviewTest(
      'https://komododecks.com/recordings/GTqgoz9kzFi998xfjUFz',
      'Komodo Hello World Introduction but a long long loooooooooong looooooooooooooooong title!',
      'https://storage.googleapis.com/komodo-280e0.appspot.com/f0tZfLY6wQSl1F15zC8lhsJJYsZ2/B9ObDzs6jrNF6YKxkdow/preview-1bfad33edb967387cf0815c7e341f01861f0728f53b90da6306403168e77313f.gif',
      type
    );
    mainList.appendChild(preview1);
  }
});
