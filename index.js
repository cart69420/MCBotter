const prompts = require('prompts');
const mineflayer = require('mineflayer');
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
            validate: value => 
            !value ? true : (
                randomName(value).length > 16 ? 'Username is too long (must be less than 16 characters)' : 
                    (randomName(value).length < 3 ? 'Username is too short (must be at least 3 characters)' : 
                        (!some(["%s", "%S", "%n"], value, true) ? 'Username must contain at least one of the following: %n, %s, %S' : true)))
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: (prev, values) => `Bot:\n -> Amount: ${!values.amount ? 1 : values.amount}\n -> Delay: ${!values.delay ? 5000 : values.delay}ms\n -> Username: ${!values.username ? "randomized" : values.username}\nConfirm?`,
        }
    ], {onCancel});
    
    if (!res.confirm) return getBotInfo();

    if (!res.amount) res.amount = 1;
    if (!res.delay) res.delay = 5000;
    if (!res.username) res.username = 'random';

    return res;
}

async function whatBotDo() {
    var res2
    const res = await prompts([
        {
            type: "select",
            name: "action",
            message: "What do you want the bot to do when it joins?",
            choices: [
                {title: "Nothing", value: "nothing"},
                {title: "Send message", value: "send message"},
                {title: "Spam message", value: "spam message"},
                {title: "DM Others", value: "dm others"},
                {title: "Spam DM", value: "spam dm"}
            ],
        }
    ], {onCancel});

    if (res.action == "spam message" || res.action == "spam dm") {
        res2 = await prompts([
            {
                type: "text",
                name: "message",
                message: "Enter the message to spam [Leave blank for default message (advertise)]:",
            },
            {
                type: "number",
                name: "times",
                message: "Enter the amount of times to spam [Leave blank for infinite]:",
            },
            {
                type: "number",
                name: "delay",
                message: "Enter the delay between each message (in miliseconds) [Leave blank for the default delay (1000ms)]:",
            },
            {
                type: "confirm",
                name: "confirm",
                message: (prev, values) => `Action: (${res.action == "spam message" ? "Spam Message" : "Spam DMs"}):\n -> Message: ${!values.message ? "advertise" : values.message}\n -> Times: ${!values.times ? "infinite" : values.times}\n -> Delay: ${!values.delay ? 1000 : values.delay}ms\nConfirm?`,
            }
        ], {onCancel})
    } else if (res.action == "dm others" || res.action == "send message") {
        res2 = await prompts([
            {
                type: "text",
                name: "message",
                message: "Enter the message to send [Leave blank for default message (advertise)]:",
            },
            {
                type: "confirm",
                name: "confirm",
                message: (prev, values) => `Action: ${res.action == "send message" ? "Send Message" : "DM Others"}:\n -> Message: ${!values.message ? "advertise" : values.message}\nConfirm?`,
            }
        ], {onCancel});
    } else {
        res2 = await prompts([
            {
                type: "confirm",
                name: "confirm",
                message: (prev, values) => `Action: ${res.action == "nothing" ? "Nothing" : "Nothing"}:\nConfirm?`,
            }
        ], {onCancel});
    }

    if (!res2.confirm) return whatBotDo();

    if (res2) {
        if (!res2.message) res2.message = "mcbotter is swag";
        if (!res2.times) res2.times = Infinity;
        if (!res2.delay) res2.delay = 1000;
    }

    return {res:res, res2:res2}
}

function some(array, value, includes = false) {
    for (var i = 0; i < array.length; i++) {
        if (includes ? value.includes(array[i]) : array[i] == value) return true
    }
    return false;
}

function isVersion(version) {
    if (!(new RegExp("^([0-9]+).([0-9]+).([0-9]+)$").test(version))) {
        return true
    } else if (!(new RegExp("^([0-9]+).([0-9]+)$").test(version))) {
        return true
    } else return false
}

function randomName(name) {
    let username = name
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

async function sendBot(username, ip, port) {
    let n = 0;
    for (var i = 0; i < process.botter.bot.amount; i++) {
        setTimeout(async() => {
            n++
            let name = randomName(username)
            if (process.botter.botlist.includes(name)) console.log(`${name} has already logged in, skipping... (${n}/${process.botter.bot.amount})`)
            else {
                const bot = await mineflayer.createBot({
                    host: ip,
                    port: port,
                    username: name,
                    version: process.botter.server.version || false,
                })

                await console.log(`Sending ${name} (${n}/${process.botter.bot.amount})`);
                bot.once("login", () => {
                    process.botter.botlist.push(name)
                })
                bot.once("end", () => {
                    process.botter.botlist.splice(process.botter.botlist.indexOf(name), 1)
                })
                bot.once("kicked", (reason, loggedIn) => {
                    console.log(`Kicked >> ${name} >> ${reason} (Logged In?: ${loggedIn})`)
                })     
            }
        }, i * process.botter.bot.delay);
    }
}

getServerInfo().then(resinfo => {
    getBotInfo().then(resbot => {
        process.botter = {server: resinfo, bot: resbot, botlist: []};
        whatBotDo().then(resaction => {
            sendBot(resbot.username, process.botter.server.ip, process.botter.server.port);
            console.log(resaction)
        })
    })
});

