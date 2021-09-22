const readline = require("readline");
const https = require("https");

const minify_text = async (s) => {
    return s.replaceAll("\n", "").replaceAll("\t", "").replaceAll(" ", "");
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
            }
            var body = [];
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
    return await minify_text(res);
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
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    console.log("I was lazy this time so this will only give you the links and you will have to download them by hand haha.")
    rl.question("Enter anime or episode url: ", async (url) => {
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
                console.log("Episode " + i + ": " + episode_url);
            }
        } else {
            let episode_url = await get_episode_url(url);
            console.log(episode_url);
        }
        rl.close();
    });
};

run();
