const getFormat = (url) => url.match(/(?<=format=)[a-z0-9]+/) ?? 'jpg';

const directory = 'twitter-save';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'save') {
    const { userName, avatar, postId, html, time, text, images } = request.data;

    for (const filename of [
      `${directory}/`,
      `${directory}/${userName}/`,
      `${directory}/${userName}/${postId}/`,
    ])
      chrome.downloads.download({
        url: 'data:text/plain;charset=utf-8,',
        filename,
        conflictAction: 'overwrite',
      });

    chrome.downloads.download({
      url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html),
      filename: `${directory}/${userName}/${postId}/index.html`,
      conflictAction: 'overwrite',
    });

    chrome.downloads.download({
      url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(time),
      filename: `${directory}/${userName}/${postId}/time.txt`,
      conflictAction: 'overwrite',
    });

    if (text)
      chrome.downloads.download({
        url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
        filename: `${directory}/${userName}/${postId}/text.txt`,
        conflictAction: 'overwrite',
      });

    chrome.downloads.download({
      url: avatar,
      filename: `${directory}/${userName}/${postId}/avatar.${getFormat(
        avatar,
      )}`,
      conflictAction: 'overwrite',
    });

    images.forEach((url, i) => {
      chrome.downloads.download({
        url,
        filename: `${directory}/${userName}/${postId}/photo-${i}.${getFormat(
          url,
        )}`,
        conflictAction: 'overwrite',
      });
    });

    sendResponse({ message: `saved ${userName}/${postId}` });
  }
});
