import json

# Note: B1 teams for 2025-26
B1_TEAMS = {
    "hokkaido": "レバンガ北海道",
    "sendai": "仙台89ERS",
    "ibaraki": "茨城ロボッツ",
    "utsunomiya": "宇都宮ブレックス",
    "gunma": "群馬クレインサンダーズ",
    "koshigaya": "越谷アルファーズ",
    "chiba": "千葉ジェッツ",
    "tokyo": "アルバルク東京",
    "shibuya": "サンロッカーズ渋谷",
    "kawasaki": "川崎ブレイブサンダース",
    "yokohama": "横浜ビー・コルセアーズ",
    "shizuoka": "ベルテックス静岡",
    "sanen": "三遠ネオフェニックス",
    "mikawa": "シーホース三河",
    "nagoya_d": "名古屋ダイヤモンドドルフィンズ",
    "nagoya_f": "ファイティングイーグルス名古屋",
    "shiga": "滋賀レイクス",
    "kyoto": "京都ハンナリーズ",
    "osaka": "大阪エヴェッサ",
    "shimane": "島根スサノオマジック",
    "okayama": "トライフープ岡山", # Mocking promotion for 25-26
    "hiroshima": "広島ドラゴンフライズ",
    "saga": "佐賀バルーナーズ",
    "nagasaki": "長崎ヴェルカ",
    "ryukyu": "琉球ゴールデンキングス"
}

def generate_player(name, pos, foreign=False):
    # Balanced params for a typical B1 player
    return {
        "id": name.lower().replace(" ", "-"),
        "name": name,
        "pos": pos,
        "isForeign": foreign,
        "params": {
            "scoring": 70 + (15 if foreign else 0),
            "playmaking": 60 + (10 if "G" in pos else 0),
            "defense": 65 + (15 if foreign else 0),
            "stamina": 80
        }
    }

teams_data = {}

for key, name in B1_TEAMS.items():
    roster = []
    if key == "kyoto":
        roster = [
            generate_player("岡田 侑大", "PG/SG"),
            generate_player("アンジェロ・カロイアロ", "PF", True),
            generate_player("チャールズ・ジャクソン", "C", True),
            generate_player("ジョーダン・ヒース", "C/PF", True),
            generate_player("前田 悟", "SG/SF"),
            generate_player("澁田 怜音", "PG"),
            generate_player("古川 孝敏", "SG/SF"),
            generate_player("小西 聖也", "PG/SG"),
            generate_player("川島 悠翔", "SF")
        ]
    elif key == "chiba":
        roster = [
            generate_player("富樫 勇樹", "PG"),
            generate_player("渡邊 雄太", "SF"),
            generate_player("ジョン・ムーニー", "C", True),
            generate_player("クリストファー・スミス", "SG/SF", True),
            generate_player("ディー・ジェイ・ステフェンズ", "SF/PF", True),
            generate_player("原 修太", "SG/SF")
        ]
    else:
        # Generate generic roster for other teams
        roster = [
            generate_player(f"{name} 選手A", "PG"),
            generate_player(f"{name} 選手B", "SG"),
            generate_player(f"{name} 選手C", "SF"),
            generate_player(f"{name} 選手D", "PF", True),
            generate_player(f"{name} 選手E", "C", True),
            generate_player(f"{name} 選手F", "PF", True)
        ]
    teams_data[key] = {"name": name, "roster": roster}

with open("/home/obino/.openclaw/workspace/b-league-sim-repo/src/data/players.json", "w", encoding="utf-8") as f:
    json.dump({"teams": teams_data}, f, ensure_ascii=False, indent=2)
