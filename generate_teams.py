import json

teams = {
    "kyoto": {
        "name": "京都ハンナリーズ",
        "roster": [
            { "id": "k1", "name": "アンジェロ・カロイアロ", "pos": "PF", "isForeign": True, "params": { "scoring": 82, "playmaking": 75, "defense": 78, "stamina": 85 } },
            { "id": "k2", "name": "チャールズ・ジャクソン", "pos": "C", "isForeign": True, "params": { "scoring": 75, "playmaking": 30, "defense": 92, "stamina": 80 } },
            { "id": "k3", "name": "ジョーダン・ヒース", "pos": "C/PF", "isForeign": True, "params": { "scoring": 78, "playmaking": 45, "defense": 95, "stamina": 75 } },
            { "id": "k4", "name": "岡田 侑大", "pos": "PG/SG", "isForeign": False, "params": { "scoring": 88, "playmaking": 92, "defense": 65, "stamina": 85 } },
            { "id": "k5", "name": "前田 悟", "pos": "SG/SF", "isForeign": False, "params": { "scoring": 72, "playmaking": 50, "defense": 68, "stamina": 80 } },
            { "id": "k6", "name": "澁田 怜音", "pos": "PG", "isForeign": False, "params": { "scoring": 65, "playmaking": 78, "defense": 60, "stamina": 75 } },
            { "id": "k7", "name": "古川 孝敏", "pos": "SG/SF", "isForeign": False, "params": { "scoring": 74, "playmaking": 40, "defense": 65, "stamina": 70 } },
            { "id": "k8", "name": "小西 聖也", "pos": "PG/SG", "isForeign": False, "params": { "scoring": 60, "playmaking": 65, "defense": 72, "stamina": 80 } },
            { "id": "k9", "name": "川島 悠翔", "pos": "SF", "isForeign": False, "params": { "scoring": 70, "playmaking": 55, "defense": 68, "stamina": 85 } }
        ]
    },
    "tokyo": {
        "name": "アルバルク東京",
        "roster": [
            { "id": "t1", "name": "セバスチャン・サイズ", "pos": "C/PF", "isForeign": True, "params": { "scoring": 85, "playmaking": 40, "defense": 95, "stamina": 85 } },
            { "id": "t2", "name": "テーブス 海", "pos": "PG", "isForeign": False, "params": { "scoring": 75, "playmaking": 90, "defense": 70, "stamina": 85 } },
            { "id": "t3", "name": "安藤 周人", "pos": "SG", "isForeign": False, "params": { "scoring": 80, "playmaking": 50, "defense": 75, "stamina": 80 } },
            { "id": "t4", "name": "レオナルド・メインデル", "pos": "SF", "isForeign": True, "params": { "scoring": 88, "playmaking": 70, "defense": 82, "stamina": 80 } },
            { "id": "t5", "name": "ライアン・ロシター", "pos": "PF/C", "isForeign": True, "params": { "scoring": 82, "playmaking": 75, "defense": 90, "stamina": 85 } },
            { "id": "t6", "name": "吉井 裕鷹", "pos": "SF", "isForeign": False, "params": { "scoring": 70, "playmaking": 45, "defense": 85, "stamina": 80 } }
        ]
    },
    "utsunomiya": {
        "name": "宇都宮ブレックス",
        "roster": [
            { "id": "u1", "name": "比江島 慎", "pos": "SG", "isForeign": False, "params": { "scoring": 92, "playmaking": 78, "defense": 75, "stamina": 82 } },
            { "id": "u2", "name": "D.J・ニュービル", "pos": "PG/SG", "isForeign": True, "params": { "scoring": 95, "playmaking": 85, "defense": 82, "stamina": 85 } },
            { "id": "u3", "name": "竹内 公輔", "pos": "PF/C", "isForeign": False, "params": { "scoring": 65, "playmaking": 40, "defense": 88, "stamina": 70 } },
            { "id": "u4", "name": "ギャビン・エドワーズ", "pos": "PF/C", "isForeign": True, "params": { "scoring": 78, "playmaking": 50, "defense": 92, "stamina": 80 } },
            { "id": "u5", "name": "遠藤 祐亮", "pos": "SG", "isForeign": False, "params": { "scoring": 75, "playmaking": 45, "defense": 85, "stamina": 80 } }
        ]
    },
    "chiba": {
        "name": "千葉ジェッツ",
        "roster": [
            { "id": "c1", "name": "富樫 勇樹", "pos": "PG", "isForeign": False, "params": { "scoring": 95, "playmaking": 98, "defense": 50, "stamina": 85 } },
            { "id": "c2", "name": "渡邊 雄太", "pos": "SF", "isForeign": False, "params": { "scoring": 98, "playmaking": 80, "defense": 90, "stamina": 90 } },
            { "id": "c3", "name": "ジョン・ムーニー", "pos": "C", "isForeign": True, "params": { "scoring": 85, "playmaking": 40, "defense": 98, "stamina": 85 } },
            { "id": "c4", "name": "クリストファー・スミス", "pos": "SG/SF", "isForeign": True, "params": { "scoring": 90, "playmaking": 60, "defense": 75, "stamina": 80 } }
        ]
    },
    "ryukyu": {
        "name": "琉球ゴールデンキングス",
        "roster": [
            { "id": "r1", "name": "今村 佳太", "pos": "SG/SF", "isForeign": False, "params": { "scoring": 85, "playmaking": 70, "defense": 78, "stamina": 85 } },
            { "id": "r2", "name": "ジャック・クーリー", "pos": "C", "isForeign": True, "params": { "scoring": 80, "playmaking": 30, "defense": 98, "stamina": 85 } },
            { "id": "r3", "name": "ヴィック・ロー", "pos": "SF/PF", "isForeign": True, "params": { "scoring": 90, "playmaking": 75, "defense": 85, "stamina": 85 } },
            { "id": "r4", "name": "岸本 隆一", "pos": "PG/SG", "isForeign": False, "params": { "scoring": 82, "playmaking": 80, "defense": 65, "stamina": 82 } }
        ]
    }
}

with open("/home/obino/.openclaw/workspace/b-league-sim-repo/src/data/players.json", "w", encoding="utf-8") as f:
    json.dump({"teams": teams}, f, ensure_ascii=False, indent=2)
