import json

B1_TEAMS = {
    "utsunomiya": {"name": "宇都宮ブレックス", "id": "703"},
    "chiba": {"name": "千葉ジェッツ", "id": "704"},
    "hokkaido": {"name": "レバンガ北海道", "id": "702"},
    "tokyo": {"name": "アルバルク東京", "id": "706"},
    "gunma": {"name": "群馬クレインサンダーズ", "id": "713"},
    "sendai": {"name": "仙台89ERS", "id": "692"},
    "shibuya": {"name": "サンロッカーズ渋谷", "id": "726"},
    "koshigaya": {"name": "越谷アルファーズ", "id": "745"},
    "yokohama": {"name": "横浜ビー・コルセアーズ", "id": "694"},
    "a_chiba": {"name": "アルティーリ千葉", "id": "2486"},
    "ibaraki": {"name": "茨城ロボッツ", "id": "712"},
    "kawasaki": {"name": "川崎ブレイブサンダース", "id": "727"},
    "akita": {"name": "秋田ノーザンハピネッツ", "id": "693"},
    "nagasaki": {"name": "長崎ヴェルカ", "id": "2488"},
    "nagoya_d": {"name": "名古屋ダイヤモンドドルフィンズ", "id": "729"},
    "mikawa": {"name": "シーホース三河", "id": "728"},
    "ryukyu": {"name": "琉球ゴールデンキングス", "id": "701"},
    "hiroshima": {"name": "広島ドラゴンフライズ", "id": "721"},
    "saga": {"name": "佐賀バルーナーズ", "id": "1638"},
    "shimane": {"name": "島根スサノオマジック", "id": "720"},
    "sanen": {"name": "三遠ネオフェニックス", "id": "697"},
    "osaka": {"name": "大阪エヴェッサ", "id": "700"},
    "nagoya_f": {"name": "ファイティングイーグルス名古屋", "id": "717"},
    "shiga": {"name": "滋賀レイクス", "id": "698"},
    "kyoto": {"name": "京都ハンナリーズ", "id": "699"},
    "toyama": {"name": "富山グラウジーズ", "id": "696"}
}

def generate_player(name, pos, is_foreign, pts, ast, reb, stl, blk):
    # Parameter normalization (Roughly based on stats)
    scoring = min(99, int(pts * 3.5 + 20))
    playmaking = min(99, int(ast * 10 + 30))
    defense = min(99, int((reb * 4 + stl * 10 + blk * 15) / 1.5 + 20))
    
    return {
        "id": name.replace(" ", "-"),
        "name": name,
        "pos": pos,
        "isForeign": is_foreign,
        "params": {
            "scoring": scoring,
            "playmaking": playmaking,
            "defense": defense,
            "stamina": 85
        }
    }

# Mocking a few real players per team based on the 2025-26 start (data observed above)
# This is a simplified version. Real automation would crawl all 26 pages.
real_data = {
    "tokyo": [
        generate_player("セバスチャン・サイズ", "C/PF", True, 17.9, 1.6, 7.3, 0.7, 1.0),
        generate_player("テーブス 海", "PG", False, 11.2, 5.4, 2.3, 0.7, 0.2),
        generate_player("安藤 周人", "SG", False, 10.9, 1.6, 3.1, 0.9, 0.1),
        generate_player("マーカス・フォスター", "SG", True, 16.0, 3.7, 3.4, 0.6, 0.2),
        generate_player("ライアン・ロシター", "C/PF", True, 8.5, 5.2, 11.5, 0.8, 0.7),
        generate_player("小酒部 泰暉", "SG", False, 6.6, 2.9, 2.0, 0.7, 0.0),
        generate_player("大倉 颯太", "PG/SG", False, 4.3, 2.1, 1.0, 0.3, 0.0),
    ],
    "kyoto": [
        generate_player("アンジェロ・カロイアロ", "SF/PF", True, 20.1, 4.2, 6.5, 1.5, 0.2),
        generate_player("チャールズ・ジャクソン", "C", True, 13.2, 2.4, 10.8, 1.3, 0.6),
        generate_player("ジョーダン・ヒース", "C/PF", True, 9.4, 1.4, 6.5, 0.8, 1.1),
        generate_player("小川 麻斗", "PG", False, 9.6, 2.8, 1.8, 1.0, 0.1),
        generate_player("前田 悟", "SG", False, 9.1, 1.5, 1.6, 1.1, 0.0),
        generate_player("澁田 怜音", "PG", False, 7.5, 2.4, 0.8, 0.4, 0.0),
        generate_player("古川 孝敏", "SG/SF", False, 7.5, 1.1, 1.6, 0.2, 0.0),
    ],
    "utsunomiya": [
        generate_player("比江島 慎", "SG", False, 13.5, 3.8, 2.5, 1.2, 0.3),
        generate_player("D.J・ニュービル", "PG/SG", True, 16.5, 6.5, 4.5, 1.5, 0.5),
        generate_player("竹内 公輔", "PF/C", False, 4.0, 0.5, 5.0, 0.3, 0.5),
        generate_player("ギャビン・エドワーズ", "PF/C", True, 8.0, 1.0, 6.0, 0.5, 0.8),
        generate_player("遠藤 祐亮", "SG", False, 7.0, 1.5, 2.0, 0.8, 0.1),
    ]
}

teams_final = {}
for key, info in B1_TEAMS.items():
    roster = real_data.get(key, [])
    if not roster:
        # Generic for others until full crawl
        roster = [
            generate_player(f"{info['name']} 選手A", "PG", False, 10, 5, 2, 1, 0),
            generate_player(f"{info['name']} 選手B", "SG", False, 12, 2, 2, 1, 0),
            generate_player(f"{info['name']} 選手C", "SF", False, 8, 1, 4, 1, 0),
            generate_player(f"{info['name']} 選手D", "PF", True, 15, 2, 8, 1, 1),
            generate_player(f"{info['name']} 選手E", "C", True, 14, 1, 10, 0, 2),
        ]
    teams_final[key] = {"name": info['name'], "roster": roster}

with open("/home/obino/.openclaw/workspace/b-league-sim-repo/src/data/players.json", "w", encoding="utf-8") as f:
    json.dump({"teams": teams_final}, f, ensure_ascii=False, indent=2)
