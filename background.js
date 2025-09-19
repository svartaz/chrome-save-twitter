const version = "2025-09-19";

const getFormat = (url) => url.match(/(?<=format=)[a-z0-9]+/) ?? "jpg";

const directory = "twitter.com";

const listener = async (request, sender, sendResponse) => {
  if (request.action === "status") {
    const {
      userId,
      userName,
      displayName,
      bio,
      postId,
      html,
      date,
      text,
      images,
    } = request.data;

    await chrome.downloads.download({
      url: "data:text/html;charset=utf-8," + encodeURIComponent(html),
      filename: `${directory}/${userId}/${postId}/index.html`,
      conflictAction: "uniquify",
    });

    console.log("2");
    await chrome.downloads.download({
      url:
        "data:text/json;charset=utf-8," +
        encodeURIComponent(
          JSON.stringify(
            {
              id: postId,
              user: {
                id: userId,
                name: userName,
                displayName,
                bio,
              },
              date,
              text,
              save: {
                version,
                date: new Date().toISOString(),
              },
            },
            null,
            2
          )
        ),
      filename: `${directory}/${userId}/${postId}/data.json`,
      conflictAction: "uniquify",
    });

    console.log("3");
    for (const [i, url] of images.entries()) {
      await chrome.downloads.download({
        url,
        filename: `${directory}/${userId}/${postId}/photo-${i}.${getFormat(
          url
        )}`,
        conflictAction: "uniquify",
      });
    }

    console.log("background sendResponse status");
    sendResponse(`saved ${userName}/${postId}`);
  } else if (request.action === "user") {
    const { userId, userName, date, profile } = request.data;

    await chrome.downloads.download({
      url:
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(profile, null, 2)),
      filename: `${directory}/${userId}/profile/${date}.json`,
      conflictAction: "uniquify",
    });

    console.log("background sendResponse user");
    sendResponse(`saved ${userName}`);
  }
};

chrome.runtime.onMessage.addListener(listener);
