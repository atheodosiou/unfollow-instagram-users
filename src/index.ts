import { Feed, IgApiClient } from "instagram-private-api";
import { config } from "dotenv";

config();

const start = async () => {
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME as string);

  await ig.account.login(
    process.env.IG_USERNAME as string,
    process.env.IG_PASSWORD as string
  );

  const followersFeed = ig.feed.accountFollowers(ig.state.cookieUserId);
  const followingFeed = ig.feed.accountFollowing(ig.state.cookieUserId);

  const followers = await getAllItemsFromFeed(followersFeed);
  const following = await getAllItemsFromFeed(followingFeed);

  // Making a new map of users username that follow you.
  const followersUsername = new Set(followers.map(({ username }) => username));
  // Filtering through the ones who aren't following you.
  const notFollowingYou = following.filter(({ username }) => !followersUsername.has(username));
  // Looping through and unfollowing each user
  for (const user of notFollowingYou) {
    await ig.friendship.destroy(user.pk);
    console.log(`unfollowed ${user.username}`);
    /*
        Time, is the delay which is between 2 second and 12 seconds.
        Creating a promise to stop the loop to avoid api spam
     */
    const time = Math.floor(Math.random() * (12000 - 2000 + 1)) + 2000;
    await new Promise(resolve => setTimeout(resolve, time));
  }
  };
  
  async function getAllItemsFromFeed<T>(feed: Feed<any, T>): Promise<T[]> {
  let items: any[] = [];
  do {
    items = items.concat(await feed.items());
  } while (feed.isMoreAvailable());
  return items;
}

start();
