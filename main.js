// @ts-check
"use strict";

function getXHRresponce(...Input) {
    return new Promise((resolve, reject) => {
        const fileURL = Input[0];
        const callback = Input[1] || undefined;
        const fileType = Input[2] || "json";

        const xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                if (this.response) {
                    callback ? callback(fileURL) : undefined;
                    resolve(this.response);
                }
            }
        };

        xmlHttpRequest.open("GET", fileURL, true);
        xmlHttpRequest.responseType = fileType;
        xmlHttpRequest.send(null);
    });
}

//awaitを使うため関数として囲む
async function main() {
    console.info("ダウンロード中…");

    const SkillData = await getXHRresponce(
        `https://database.kirafan.cn/database/SkillList_PL.json?${Number(
            new Date()
        )}`
    );

    const TTKlist_filtered = (() => {
        let TTK_list = [];
        for (let i = 0; i < SkillData.length; i++) {
            //\d{8}で 通常攻撃などを除去、0$でTTK抽出、^SEで星3除去
            if (
                /\d{8}0$/.test(SkillData[i]["m_ID"]) &&
                /^SE/.test(SkillData[i]["m_UniqueSkillSeCueSheet"])
            ) {
                TTK_list.push(SkillData[i]);
            }
        }
        return TTK_list;
    })();

    let TTKList_ifEvolutedChangeSap = [];
    for (let i = 0; i < TTKlist_filtered.length; i = i + 2) {
        // TTKlist_filtered[i]["sap"] !== TTKlist_filtered[i+1]["sap"]でなぜか単純比較できないのでStiring変換
        const tmp = (x) => JSON.stringify(TTKlist_filtered[x]["sap"]);

        if (tmp(i) !== tmp(i + 1)) {
            TTKList_ifEvolutedChangeSap.push(TTKlist_filtered[i]);
        }
    }

    const TTKList_ifEvolutedChangeSap_toHTML = (() => {
        let output;
        output = JSON.stringify(TTKList_ifEvolutedChangeSap);
        output = output.replace(/,{"m_ID":/g, ',<br><br>{"m_ID":');
        return output;
    })();

    document
        .querySelector("#output")
        .insertAdjacentHTML("beforeend", TTKList_ifEvolutedChangeSap_toHTML);
    console.log(TTKList_ifEvolutedChangeSap);
}

main();
