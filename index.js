const prompts = require('prompts');

const onCancel = prompt => {
    console.log("Cancelled");
    process.exit(0);
}

async function getServerInfo() {
    const res = await prompts([
        {
            type: 'text',
            name: 'ip',
            message: 'Enter the IP address of the server (IPv4 or domain) [Leave blank for localhost]:',
        },
        {
            type: 'number',
            name: 'port',
            message: 'Enter the port of the server [Leave blank for default port (25565)]:',
        },
        {
            type: 'text',
            name: 'version',
            message: 'Enter the version of the server [Leave blank for all versions]:',
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: (prev, values) => `Server:\n -> IP: ${!values.ip ? "localhost" : values.ip}\n -> Port: ${!values.port ? 25565 : values.port}\n -> Version: ${!values.version ? "all" : (!isVersion(values.version) ? "all" : values.version)}\nConfirm?`,
        }
    ], {onCancel});
    
    if (!res.confirm) return getServerInfo();
    if (!res.ip) res.ip = 'localhost';
    if (!res.port) res.port = 25565;
    if (!res.version || !isVersion(res.version)) res.version = false;


    return res;
}

async function getBotInfo() {
    const res = await prompts([
        {
            type: 'number',
            name: 'amount',
            message: 'Enter the preferred amount of bots to join:',
        },
        {
            type: 'number',
            name: 'delay',
            message: 'Enter the preferred delay between each bot being sent (in miliseconds) [Leave blank for the default delay (5000ms)]:',
            validate: value => Number.isNaN(value) ? 'Please enter a number' : true
        },
        {
            type: 'text',
            name: 'username',
            message: 'Enter bot username (use %n for a random number from 0 to 9, %s for a random letter in the alphabet, %S for a random CAPITAL letter)\n[Leave blank for randomized username]:',
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: (prev, values) => `Bot:\n -> Amount: ${!values.amount ? 1 : values.amount}\n -> Delay: ${!values.delay ? 5000 : values.delay}ms -> Username: ${!values.username ? "randomized" : values.username}\nConfirm?`,
        }
    ], {onCancel});
    
    if (!res.confirm) return getBotInfo();

    if (!res.amount) res.amount = 1;
    if (!res.delay) res.delay = 5000;
    if (!res.username) res.username = 'random';

    return res;
}

function isVersion(version) {
    if (!(new RegExp("^([0-9]+).([0-9]+).([0-9]+)$").test(version))) {
        return true
    } else if (!(new RegExp("^([0-9]+).([0-9]+)$").test(version))) {
        return true
    } else return false
}

function randomName() {
    let username = process.botter.bot.username
    if (username == 'random') {
        username = ''
        let list = ["%n", "%s", "%S"]
        for (var i = 0; i < 10; i++) {
            username += list[Math.floor(Math.random() * list.length)]
        }
    }
    //replace every %n in the username with a random number from 0 to 9
    username = username.replace(/%n/g, () => Math.floor(Math.random() * 10));
    //replace every %s in the username with a random letter in the alphabet
    username = username.replace(/%s/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97));
    //replace every %S in the username with a random CAPITAL letter in the alphabet
    username = username.replace(/%S/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65));

    return username
}

async function sendBot() {
    let n = 0;
    for (var i = 0; i < process.botter.bot.amount; i++) {
        setTimeout(async() => {
            n++
            await console.log("Sending bot " + n + " of " + process.botter.bot.amount + " > " + randomName());
        }, i * process.botter.bot.delay);
    }
}

getServerInfo().then(resinfo => {
    getBotInfo().then(resbot => {
        process.botter = {server: resinfo, bot: resbot};
        sendBot();
    })
});

