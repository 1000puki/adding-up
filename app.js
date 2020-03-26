'use strict';

//Node.jsモジュールの読み込み
const fs = require('fs');
const readline = require('readline');

//Streamオブジェクトを作成
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({'input':rs,'output':{}});
const prefectureDataMap = new Map(); //key:都道府県 value: 集計データのオブジェクト

//lineがコールされると、無名関数をコール（1行ずつ読み出し）
rl.on('line',(lineString) => {
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);

    if(year === 2010 || year === 2015){
        let value = prefectureDataMap.get(prefecture);

        if(!value){
            value = {
                popul0: 0,
                popu15: 0,
                change: null
            };
        }
        if(year === 2010){
            value.popul0 = popu;
        }
        if(year === 2015){
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture,value);
    }
});

//全ての行読み込みが終わるとコールされる
rl.on('close',() =>{
    //for-of構文
    //各県の変化率の計算
    for(let [key, value] of prefectureDataMap){
        value.change = value.popu15 / value.popul0;
    }

    //ランキング並び替え
    const rankingArray = Array.from(prefectureDataMap).sort((pair1,pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    //ランキング整理（Map と map()関数は別物）
    const rankingString = rankingArray.map(([key,value]) => {
        //Map型のオブジェクトより、内容を各keyごとに整理する
        return key + ':' + value.popul0 + '=>' + value.popu15 + ' 変化率:' + value.change;
    });

    console.log(rankingString);
});