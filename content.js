let urlLastSucceeded = null;
let repeated = 0;

setInterval(() => {
  if (urlLastSucceeded === document.location.href)
    if (3 <= repeated) return;
    else repeated++;
  else {
    repeated = 0;
  }

  const matchPost = document.location.href.match(
    /^https:\/\/x.com\/(\w+)\/status\/(\d+)/,
  );
  if (matchPost) {
    const [, userName, postId] = matchPost;

    const tweet = document.querySelector("[data-testid='tweet']");
    if (!tweet) return;

    try {
      const html = document.documentElement.outerHTML;
      const text = tweet.querySelector(
        '[data-testid="tweetText"]',
      )?.textContent;
      const time = tweet.querySelector('time').getAttribute('datetime');
      const images = [
        ...tweet.querySelectorAll('[data-testid="tweetPhoto"] img'),
      ].map((img) => img.getAttribute('src'));

      chrome.runtime.sendMessage(
        {
          action: 'post',
          data: {
            userName,
            postId,
            html,
            time,
            text,
            images,
          },
        },
        (response) => {
          console.log(response);
          urlLastSucceeded = document.location.href;
        },
      );

      return;
    } catch (e) {
      console.log(e);
    }
  }

  const matchUser = document.location.href.match(/^https:\/\/x.com\/(\w+)$/);
  if (matchUser) {
    try {
      const [, userName] = matchUser;
      for (const e of document.querySelectorAll(
        '[data-testid="UserProfileSchema-test"]',
      )) {
        const profile = JSON.parse(e.innerHTML);
        if (profile?.mainEntity?.additionalName === userName)
          chrome.runtime.sendMessage(
            {
              action: 'user',
              data: {
                userName,
                profile,
                date: new Date().toISOString().replace(/:/g, '-'),
              },
            },
            (response) => {
              console.log(response);
              urlLastSucceeded = document.location.href;
              repeated = Number.MAX_SAFE_INTEGER;
            },
          );
      }
    } catch (e) {
      console.log(e);
    }
  }
}, 1000 / 1.5);
