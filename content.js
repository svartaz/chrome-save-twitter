let urlLastSucceeded = null;

setInterval(() => {
  if (urlLastSucceeded === document.location.href) return;

  const match = document.location.href.match(
    /https:\/\/x.com\/(\w+)\/status\/(\d+)/,
  );
  if (!match) return;

  const [, userName, postId] = match;

  const tweet = document.querySelector("[data-testid='tweet']");
  if (!tweet) return;

  try {
    const html = document.documentElement.outerHTML;
    const text = tweet.querySelector('[data-testid="tweetText"]')?.textContent;
    const time = tweet.querySelector('time').getAttribute('datetime');
    const avatar = tweet
      .querySelector('[data-testid="Tweet-User-Avatar"] img')
      .getAttribute('src');
    const images = [
      ...tweet.querySelectorAll('[data-testid="tweetPhoto"] img'),
    ].map((img) => img.getAttribute('src'));

    chrome.runtime.sendMessage(
      {
        action: 'save',
        data: {
          userName,
          avatar,
          postId,
          html,
          time,
          text,
          images,
        },
      },
      (response) => {
        console.log(response.message);
      },
    );

    urlLastSucceeded = document.location.href;
  } catch (e) {
    console.log(e);
  }
}, 1000 / 5);
