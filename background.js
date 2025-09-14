const getFormat = (url) => url.match(/(?<=format=)[a-z0-9]+/) ?? 'jpg';

const directory = 'twitter.com';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'post') {
      const {
        id,
        userName,
        displayName,
        bio,
        postId,
        html,
        date,
        text,
        images,
      } = request.data;

      for (const filename of [
        `${directory}/`,
        `${directory}/${id}/`,
        `${directory}/${id}/${postId}/`,
      ])
        chrome.downloads.download({
          url: 'data:text/plain;charset=utf-8,',
          filename,
          conflictAction: 'uniquify',
        });

      chrome.downloads.download({
        url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html),
        filename: `${directory}/${id}/${postId}/index.html`,
        conflictAction: 'uniquify',
      });

      chrome.downloads.download({
        url:
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(
            JSON.stringify(
              {
                id: postId,
                user: {
                  id,
                  name: userName,
                  displayName,
                  bio,
                },
                date,
                text,
                save: {
                  version: '2025-03-17',
                  date: new Date().toISOString(),
                },
              },
              null,
              2,
            ),
          ),
        filename: `${directory}/${id}/${postId}/data.json`,
        conflictAction: 'uniquify',
      });

      images.forEach((url, i) => {
        chrome.downloads.download({
          url,
          filename: `${directory}/${id}/${postId}/photo-${i}.${getFormat(url)}`,
          conflictAction: 'uniquify',
        });
      });

      sendResponse({ message: `saved ${userName}/${postId}` });
    } else if (request.action === 'user') {
      const { id, userName, date, profile } = request.data;

      for (const filename of [
        `${directory}/`,
        `${directory}/${id}/`,
        `${directory}/${id}/profile/`,
      ])
        chrome.downloads.download({
          url: 'data:text/plain;charset=utf-8,',
          filename,
          conflictAction: 'uniquify',
        });

      chrome.downloads.download({
        url:
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(profile, null, 2)),
        filename: `${directory}/${id}/profile/${date}.json`,
        conflictAction: 'uniquify',
      });

      sendResponse({ message: `saved ${userName}` });
    }
  } catch (e) {
    console.error(e.message);
  }
});
