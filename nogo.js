const getopts = require('getopts');
const https = require("https");

const minify_text = (s) => {
    return s.replace(/\s/g, "");
};

const p_dl_one = async (s) => {
    let re = new RegExp('dowloads"><ahref="(.*?)"target');
    let res = re.exec(s);
    return res[1];
};

const p_dl_two = async (s) => {
    let re = new RegExp('"dowload"><ahref="(.*?)"download');
    let res = re.exec(s);
    return res[1];
};

const p_anime_url = async (s) => {
    let re = new RegExp("https://gogoanime.pe/category/(.*?)$");
    let res = re.exec(s);
    return res[1];
};

const httprequest = async (url) => {
    return await new Promise((resolve, reject) => {
        const req = https.request(url, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error("statusCode=" + res.statusCode));
            };
            var body = [];
            let count = 0;
            res.on("data", function (chunk) {
                body.push(chunk);
            });
            res.on("end", function () {
                resolve(Buffer.concat(body).toString());
            });
        });
        req.on("error", (e) => {
            reject(e.message);
        });
        req.end();
    });
};
const get = async (url) => {
    let res = await httprequest(url);
    return minify_text(res);
};

const get_episode_url = async (url) => {
    let s = await get(url);
    if (s.includes(">404</h1>")) return null;
    let dl_one = await p_dl_one(s);
    let ss = await get(dl_one);
    let dl_two = await p_dl_two(ss);
    return dl_two;
};

const run = async () => {
    const opts = getopts(process.argv.slice(2));
    if (!(opts.url || opts.u)) {
        throw new Error('Provide an anime url.');
    };
    const url = opts.url || opts.u;
    const urls = new Array();
    if (url.includes("category")) {
        let anime_id = await p_anime_url(url);
        let i = 0;
        while (i++ || true) {
            let episode_url = await get_episode_url(
                "https://gogoanime.pe/" + anime_id + "-episode-" + i
            );
            if (!episode_url) {
                break;
            }
            urls.push(episode_url);
        }
    } else {
        let episode_url = await get_episode_url(url);
        urls.push(episode_url);
    };
    console.log(urls.join(','));
};

run();
