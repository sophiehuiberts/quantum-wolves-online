import { Room } from "colyseus";
const { spawn } = require('child_process')

export class ChatRoom extends Room {
    // this room supports only 4 clients connected
    maxClients = 4;


    onCreate (options) {
        console.log("ChatRoom created!", options);
        const wolves = spawn('/usr/bin/python2.7', ['-u','../bra-ket-wolf/main.py']);

        wolves.stdout.on('data', (data) => {
            var msg = `${data}`;
            if( ! msg.startsWith('admin'))
                this.broadcast("messages", msg);
            console.log(msg);
        });

        this.onMessage("message", (client, message) => {
            console.log("ChatRoom received message from", client.sessionId, ":", message);
            var msg = `${message}`;
            if(msg.startsWith('players'))
                this.broadcast("messages", `(${client.sessionId}) ${message}`);
            wolves.stdin.write(message);
            wolves.stdin.write('\n');
        });
    }

    onJoin (client) {
        this.broadcast("messages", `${ client.sessionId } joined.`);
    }

    onLeave (client) {
        this.broadcast("messages", `${ client.sessionId } left.`);
    }

    onDispose () {
        console.log("Dispose ChatRoom");
    }

}
