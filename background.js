const getFormat = (url) => url.match(/(?<=format=)[a-z0-9]+/) ?? 'jpg';

const directory = 'twitter-save';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'post') {
      const { userName, postId, html, time, text, images } = request.data;

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
    } else if (request.action === 'user') {
      const { userName, date, profile } = request.data;

      for (const filename of [
        `${directory}/`,
        `${directory}/${userName}/`,
        `${directory}/${userName}/profile/`,
      ])
        chrome.downloads.download({
          url: 'data:text/plain;charset=utf-8,',
          filename,
          conflictAction: 'overwrite',
        });

      chrome.downloads.download({
        url:
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(profile, null, 2)),
        filename: `${directory}/${userName}/profile/${date}.json`,
        conflictAction: 'overwrite',
      });

      sendResponse({ message: `saved ${userName}` });
    }
  } catch (e) {
    console.error(e.message);
  }
});
