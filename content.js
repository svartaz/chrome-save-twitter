let urlLastSucceeded = null;
let repeated = 0;

setInterval(() => {
  if (urlLastSucceeded === document.location.href)
    if (2 <= repeated) return;
    else repeated++;
  else {
    repeated = 0;
  }

  const matchPost = document.location.href.match(
    /^https:\/\/x.com\/(\w+)\/status\/(\d+)/
  );
  if (matchPost) {
    const [, userName, postId] = matchPost;

    const tweet = document.querySelector("[data-testid='tweet']");
    if (!tweet) return;

    try {
      const html = document.documentElement.outerHTML;

      const userId =
        document
          .querySelector(`button[aria-describedby][aria-label][role="button"]`)
          ?.dataset.testid.split("-")[0] ??
        JSON.parse(
          document.querySelector('script[data-testid="UserProfileSchema-test"]')
            ?.innerHTML
        ).mainEntity.identifier;

      const text = tweet.querySelector(
        '[data-testid="tweetText"]'
      )?.textContent;

      const date = tweet.querySelector("time").getAttribute("datetime");

      const images = [
        ...tweet.querySelectorAll('[data-testid="tweetPhoto"] > img'),
      ].map((img) => img.getAttribute("src"));

      const bio = [
        ...document.querySelectorAll('li[data-testid="UserCell"] div span'),
      ].findLast(() => true)?.innerText;

      const displayName = document.querySelector(
        'article[data-testid="tweet"] div[data-testid="User-Name"] div'
      ).textContent;

      chrome.runtime.sendMessage(
        {
          action: "status",
          data: {
            userId,
            userName,
            displayName,
            bio,
            postId,
            date,
            text,
            images,
            html,
          },
        },
        (response) => {
          console.log(response);
          urlLastSucceeded = document.location.href;
        }
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

      const userId = document
        .querySelector(`button[aria-describedby][aria-label][role="button"]`)
        .dataset.testid.split("-")[0];

      for (const e of document.querySelectorAll(
        '[data-testid="UserProfileSchema-test"]'
      )) {
        const profile = JSON.parse(e.innerHTML);

        if (profile?.mainEntity?.additionalName === userName)
          chrome.runtime.sendMessage(
            {
              action: "user",
              data: {
                userId,
                userName,
                profile,
                date: new Date().toISOString().replace(/:/g, "-"),
              },
            },
            (response) => {
              console.log(response);
              urlLastSucceeded = document.location.href;
              repeated = Number.MAX_SAFE_INTEGER;
            }
          );
      }
    } catch (e) {
      console.log(e);
    }
  }
}, 3000);
