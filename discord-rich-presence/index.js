'use strict';

const Discord = require('discord-rpc');
const EventEmitter = require('events');

const browser = typeof window !== 'undefined';

function makeClient(clientId) {
  var rpc = new Discord.Client({ transport: browser ? 'websocket' : 'ipc' });

  let connected = false;
  let activityCache = null;

  const instance = new class RP extends EventEmitter {
    updatePresence(d) {
      if(!d) {
        rpc.clearActivity().catch((e) => this.emit('error', e));
        return
      }
      if (connected) {
        rpc.setActivity(d).catch((e) => this.emit('error', e));
      } else {
        activityCache = d;
      }
    }

    reply(user, response) {
      const handle = (e) => this.emit('error', e);
      switch (response) {
        case 'YES':
          rpc.sendJoinInvite(user).catch(handle);
          break;
        case 'NO':
        case 'IGNORE':
          rpc.closeJoinRequest(user).catch(handle);
          break;
        default:
          throw new RangeError('unknown response');
      }
    }

    disconnect() {
      rpc.destroy().catch((e) => this.emit('error', e));
    }
  }();

  rpc.on('error', (e) => instance.emit('error', e));

  function login(resolve) {
    rpc.login({ clientId })
    .then(() => {
      instance.emit('connected');
      instance.__connected = true;
      connected = true;

      rpc.subscribe('ACTIVITY_JOIN', ({ secret }) => {
        instance.emit('join', secret);
      });
      rpc.subscribe('ACTIVITY_SPECTATE', ({ secret }) => {
        instance.emit('spectate', secret);
      });
      rpc.subscribe('ACTIVITY_JOIN_REQUEST', (user) => {
        instance.emit('joinRequest', user);
      });

      if (activityCache) {
        rpc.setActivity(activityCache).catch((e) => instance.emit('error', e));
        activityCache = null;
      }
      resolve(instance);
    })
    .catch((e) => {
      console.log("Connected to Discord: false")
      rpc = new Discord.Client({ transport: browser ? 'websocket' : 'ipc' });
      setTimeout( () => {
        login(resolve);
      }, 10000);
    });
  }

  return new Promise((resolve, reject) => {
    login(resolve);
  });

}

module.exports = makeClient;
