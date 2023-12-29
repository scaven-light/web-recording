'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const preview = document.createElement('div');
  preview.setAttribute("class", "komodo-embeded-wrapper");
  preview.style.backgroundColor = 'lightgrey';
  document.body.appendChild(preview);

  const html = '<p style="display: flex; flex-wrap: wrap; justify-content: space-between; width: 300px; ">' +
    'Komodo Hello World Introduction!' +
    '  <a target="_blank" href="' + 'https://komododecks.com/recordings/GTqgoz9kzFi998xfjUFz' +'">Watch Video</a>' +
    '</p>' + '<a class="komodo-gmail-thumbnail" target="_blank" href="' + 'https://komododecks.com/recordings/GTqgoz9kzFi998xfjUFz' +'">' +
    '<img style="width: 300px;" src="' + 'https://storage.googleapis.com/komodo-280e0.appspot.com/f0tZfLY6wQSl1F15zC8lhsJJYsZ2/B9ObDzs6jrNF6YKxkdow/preview-1bfad33edb967387cf0815c7e341f01861f0728f53b90da6306403168e77313f.gif' +'">' +
    '</a>';

  preview.innerHTML = html;

  document.body.appendChild(document.createElement('hr'));

  const copyBtn = document.createElement('button');
  copyBtn.innerText = 'Copy HTML preview';
  document.body.appendChild(copyBtn);

  copyBtn.onclick = () => {
    const blobHTML = new Blob([html], {type: 'text/html'});
    const clipboardItemInput = new ClipboardItem({'text/html': blobHTML});
    navigator.clipboard.write([clipboardItemInput]);
  };
});
