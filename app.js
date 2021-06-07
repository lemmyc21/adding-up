'use strict';
// モジュールを読み込んで使えるようにする
const fs = require('fs');  // filesystem
const readline = require('readline');
// csv をファイルとして読み込める状態に準備する
const rs = fs.createReadStream('./popu-pref.csv');
// readline モジュールに rs(csvを読み込む設定ができたfs) を設定する
const rl = readline.createInterface({ input: rs, output: {} });  // output(書き出す)は設定されていない
const prefectureDataMap = new Map();  // key: 都道府県 value: 集計データのオブジェクト
// csv のデータを1行ずつ読み込んで、設定された関数を実行する
rl.on('line', lineString => {  // 1行ごと
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
rl.on('close', () => {  // 全行終了時
    for (const [key, value] of prefectureDataMap) {  // 変化率算出
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return(
            key +
            ': ' +
            value.popu10 +
            '=>' +
            value.popu15 +
            ' 変化率:' +
            value.change
        );
    });
    console.log(rankingStrings);
});