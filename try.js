const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true }); 
});

client.on('ready', () => {
    console.log('Client is ready!');

    const number = '1234567890'; 
    const message = 'Hello, this is a test message from whatsapp-web.js!';

    client.sendMessage(`${number}@c.us`, message).then(response => {
        console.log('Message sent successfully:', response);
    }).catch(error => {
        console.error('Error sending message:', error);
    });
});

client.initialize();