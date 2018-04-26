const Discord = require("discord.js");
const SpiderBot = new Discord.Client();

var cron = require('node-cron');
var cheerio = require('cheerio-httpcli');
var urlType = require('url');
var fs = require('fs');
var symbols = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;

if (!fs.existsSync('token.txt')) {
    fs.writeFileSync('token.txt', '\ufeff' + '이 글을 지우고 토큰을 써주세요', { encoding: 'utf8' });
}
var token_string = fs.readFileSync('token.txt').toString().replace('\ufeff', "")
SpiderBot.on('ready', () => {
    SpiderBot.user.setGame('거미 목록')
});

if (!fs.existsSync('baloney01.txt')) {
    fs.writeFileSync('baloney01.txt', '\ufeff' + '헛소리를 적어주세요.', { encoding: 'utf8' });
}
if (!fs.existsSync('baloney02.txt')) {
    fs.writeFileSync('baloney02.txt', '\ufeff' + '헛소리 반응을 적어주세요.', { encoding: 'utf8' });
}
if (!fs.existsSync('channels.txt')) {
    fs.writeFileSync('channels.txt', '\ufeff' + '거미가 무료게임을 알려줄 체널 ID를 적어주세요.', { encoding: 'utf8' });
}
var chat_channel = fs.readFileSync('channels.txt').toString().replace('\ufeff', "")

SpiderBot.on('message', msg => {

    var baloney01 = fs.readFileSync('baloney01.txt').toString().replace('\ufeff', "").split('\r\n');
    var baloney02 = fs.readFileSync('baloney02.txt').toString().replace('\ufeff', "").split('\r\n');

    if (!msg.author.bot) {
        if (msg.content == '거미 목록') {
            msg.channel.send({
                embed: {
                    color: 3447003,
                    description: '**잡소리 목록** \n\n - ' + baloney01.toString().replace(/,/g, "\n - ")
                }
            }
            );
        } else if (-1 != baloney01.indexOf(msg.content)) {
            msg.channel.send(baloney02[baloney01.indexOf(msg.content)].replace('\\n', "\n"));
        } else if (msg.content.endsWith(' 기억해')) {
            var remember_baloney = msg.content.replace(' 기억해', "").split(' + ')
            if (2 != remember_baloney.length) {
                msg.channel.send('\' + \'로 구분되는 문장을 입력해주세요.')
            } else if (remember_baloney.find(function (element) { return element.match(',') })) {
                msg.channel.send('지랄은 거기까지다, ' + msg.author + '!');
            } else if (baloney01.find(function (element) { return element.match(remember_baloney[0]) })) {
                msg.channel.send('그거에 관해선 이미 기억하고 있는거 같은데?');
            } else {
                msg.channel.send('기억하겠습니다.');
                baloney01[baloney01.length] = remember_baloney[0]
                fs.writeFileSync('baloney01.txt', '\ufeff' + baloney01.toString().replace(/,/g, "\r\n"), { encoding: 'utf8' })
                baloney02[baloney02.length] = remember_baloney[1]
                fs.writeFileSync('baloney02.txt', '\ufeff' + baloney02.toString().replace(/,/g, "\r\n"), { encoding: 'utf8' })
            }
        } else if (msg.content.endsWith(' 잊어')) {
            var delete_baloney = msg.content.replace(' 잊어', "")
            if (delete_baloney.match(',')) {
                msg.channel.send('지랄은 거기까지다, ' + msg.author + '!');
            } else {
                var delete_baloney_number = baloney01.indexOf(delete_baloney, 0)
                if (-1 != delete_baloney_number) {
                    baloney01.splice(delete_baloney_number, 1)
                    baloney02.splice(delete_baloney_number, 1)
                    fs.writeFileSync('baloney01.txt', '\ufeff' + baloney01.toString().replace(/,/g, "\r\n"), { encoding: 'utf8' })
                    fs.writeFileSync('baloney02.txt', '\ufeff' + baloney02.toString().replace(/,/g, "\r\n"), { encoding: 'utf8' })
                    msg.channel.send('까먹었습니다.');
                } else {
                    msg.channel.send('그런건 진짜로 모르겠는데요?');
                }
            }
        } else if (msg.content === '거미야 넌 어떻게 생각해?' || msg.content === '거미야 너는 어떻게 생각해?' || msg.content === '거미 판단' || msg.content === '<@426405283233923082> 판단') {
            if (Math.round(Math.random()) == 0) {
                msg.channel.send('나도 니 말이 맞다고 생각해.');
            } else {
                msg.channel.send('그건 아니야.');
            }
        } else if (!(msg.content.replace(symbols, "").lastIndexOf(' 희생해') == 1) && msg.content.replace(symbols, "").endsWith('가 희생해') || !(msg.content.lastIndexOf(' 희생해') == 1) && msg.content.replace(symbols, "").endsWith('이 희생해')) {
            if (msg.content.replace(symbols, "") == '새오리가 희생해') {
                msg.channel.send('맞아, <@293262318744240128>가 희생해');
            } else {
                msg.channel.send('희생이 뭔지 알기나 해요?');
            }
        } else if (msg.content.replace(symbols, "").endsWith('노')) {
            msg.channel.send('노? 일베충이십니까?');
        }
    }
});

cron.schedule('*/3 * * * *', function () {
    var url = 'https://twitter.com/freegame_kr';
    var param = {};

    if (!fs.existsSync("lastest.txt")) {
        fs.writeFileSync("lastest.txt", "UTF8");
    }

    cheerio.fetch(url, param, function (err, $, res, body) {
        if (err) {
            if (!fs.existsSync("error.txt")) {
                fs.writeFileSync("error.txt", err);
            }
        }

        var web_string = ($('.stream-container  ').attr('data-max-position'));
        var txt_string = fs.readFileSync("lastest.txt").toString();

        if (!(web_string === txt_string)) {
            SpiderBot.channels.get(chat_channel).send('무료게임 소식을 들고 왔습니다\n\n주소 : https://twitter.com/freegame_kr/status/' + web_string);
            fs.writeFileSync("lastest.txt", web_string);
        }
    });
});

SpiderBot.login(token_string);