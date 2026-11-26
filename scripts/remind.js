// Sends the evening push. REMIND_CODE is the code the app shows (base64 JSON {s: subscription, u: UTC hour}).
const webpush = require('web-push');
const PUB = 'BCvwWJO-NXxtY9sIqSm5yqs2vMRxQOGHzDItiT32Qs5atbyclh-bZigpoFjtMuIf25-mlcUUguHa-st0zGSKccY';
if (!process.env.REMIND_CODE || !process.env.VAPID_PRIVATE) { console.log('Not set up yet'); process.exit(0); }
const { s, u } = JSON.parse(Buffer.from(process.env.REMIND_CODE.trim(), 'base64').toString());
// shortcut: GitHub cron can run late, so match the hour rather than the minute
if (process.env.FORCE !== 'true' && new Date().getUTCHours() !== u) { console.log('Not reminder hour'); process.exit(0); }
webpush.setVapidDetails('https://github.com/ridmeister2011-wq/locked-in', PUB, process.env.VAPID_PRIVATE);
webpush.sendNotification(s, '', { TTL: 3600 }).then(() => console.log('Sent'), e => { console.error(e.statusCode, e.body); process.exit(1); });
