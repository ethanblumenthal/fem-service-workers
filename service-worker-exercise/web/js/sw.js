'use strict';

const version = 2;
isOnline = true;
isLoggedIn = false;

self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate);
self.addEventListener('message', onMessage);

main().catch(console.error);

async function main() {
  await sendMessage({ requestStatusUpdate: true });
}

async function onInstall(evt) {
  console.log(`Service worker ${version} is installed.`);
  self.skipWaiting();
}

async function sendMessage(msg) {
  var allClients = await clients.matchAll({ includeUncontrolled: true });
  return Promise.all(
    allClients.map(function clientMsg(client) {
      var chan = new MessageChannel();
      chan.port1.onmessage = onMessage;
      return client.postMessage(msg, [chan.port2]);
    })
  );
}

function onMessage({ data }) {
  if (data.statusUpdate) {
    ({ isOnline, isLoggedIn } = data.statusUpdate);
    console.log(`Service Worker v${version} status update`);
  }
}

function onActivate(evt) {
  evt.waitUntil(handleActivation());
}

async function handleActivation() {
  await clients.claim();
  console.log(`Service worker ${version} is activated.`);
}
