process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const htmlResp = await fetch('https://haein-schedule-v1.vercel.app');
const html = await htmlResp.text();
const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
if (jsMatch) {
  const jsResp = await fetch('https://haein-schedule-v1.vercel.app' + jsMatch[1]);
  const js = await jsResp.text();
  const keyMatch = js.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g);
  console.log('Found JWTs in JS:', keyMatch ? keyMatch.length : 0);
  const sbMatch = js.match(/sb_publishable_[a-zA-Z0-9_]+/g);
  console.log('Found sb_publishable in JS:', sbMatch ? sbMatch.length : 0);
} else {
  console.log('JS not found');
}
