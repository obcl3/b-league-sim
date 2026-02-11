import json

# 2025-26 B1 Teams from official standings
B1_TEAMS = {
    "utsunomiya": "宇都宮ブレックス",
    "chiba": "千葉ジェッツ",
    "hokkaido": "レバンガ北海道",
    "tokyo": "アルバルク東京",
    "gunma": "群馬クレインサンダーズ",
    "sendai": "仙台89ERS",
    "shibuya": "サンロッカーズ渋谷",
    "koshigaya": "越谷アルファーズ",
    "yokohama": "横浜ビー・コルセアーズ",
    "a_chiba": "アルティーリ千葉",
    "ibaraki": "茨城ロボッツ",
    "kawasaki": "川崎ブレイブサンダース",
    "akita": "秋田ノーザンハピネッツ",
    "nagasaki": "長崎ヴェルカ",
    "nagoya_d": "名古屋ダイヤモンドドルフィンズ",
    "mikawa": "シーホース三河",
    "ryukyu": "琉球ゴールデンキングス",
    "hiroshima": "広島ドラゴンフライズ",
    "saga": "佐賀バルーナーズ",
    "shimane": "島根スサノオマジック",
    "sanen": "三遠ネオフェニックス",
    "osaka": "大阪エヴェッサ",
    "nagoya_f": "ファイティングイーグルス名古屋",
    "shiga": "滋賀レイクス",
    "kyoto": "京都ハンナリーズ",
    "toyama": "富山グラウジーズ"
}

def generate_player(name, pos, foreign=False, base_scoring=70, base_playmaking=60, base_defense=65):
    return {
        "id": name.lower().replace(" ", "-").replace("・", "-"),
        "name": name,
        "pos": pos,
        "isForeign": foreign,
        "params": {
            "scoring": base_scoring + (15 if foreign else 0),
            "playmaking": base_playmaking + (10 if "G" in pos else 0),
            "defense": base_defense + (15 if foreign else 0),
            "stamina": 80
        }
    }

teams_data = {}

for key, name in B1_TEAMS.items():
    roster = []
    if key == "kyoto":
        roster = [
            generate_player("岡田 侑大", "PG/SG", False, 88, 92, 60),
            generate_player("アンジェロ・カロイアロ", "PF", True, 82, 75, 78),
            generate_player("チャールズ・ジャクソン", "C", True, 75, 30, 92),
            generate_player("ジョーダン・ヒース", "C/PF", True, 78, 45, 95),
            generate_player("前田 悟", "SG/SF", False, 72, 50, 68),
            generate_player("澁田 怜音", "PG", False, 65, 78, 60),
            generate_player("古川 孝敏", "SG/SF", False, 74, 40, 65),
            generate_player("小西 聖也", "PG/SG", False, 60, 65, 72),
            generate_player("川島 悠翔", "SF", False, 70, 55, 68)
        ]
    elif key == "chiba":
        roster = [
            generate_player("富樫 勇樹", "PG", False, 95, 98, 50),
            generate_player("渡邊 雄太", "SF", False, 98, 80, 90),
            generate_player("ジョン・ムーニー", "C", True, 85, 40, 98),
            generate_player("クリストファー・スミス", "SG/SF", True, 90, 60, 75),
            generate_player("ディー・ジェイ・ステフェンズ", "SF/PF", True, 82, 45, 88),
            generate_player("原 修太", "SG/SF", False, 78, 45, 85)
        ]
    elif key == "utsunomiya":
        roster = [
            generate_player("比江島 慎", "SG", False, 92, 78, 75),
            generate_player("D.J・ニュービル", "PG/SG", True, 95, 85, 82),
            generate_player("竹内 公輔", "PF/C", False, 65, 40, 88),
            generate_player("ギャビン・エドワーズ", "PF/C", True, 78, 50, 92),
            generate_player("遠藤 祐亮", "SG", False, 75, 45, 85)
        ]
    else:
        # Generic roster based on team name to avoid empty teams
        roster = [
            generate_player(f"{name} 選手A", "PG", False, 75, 80, 65),
            generate_player(f"{name} 選手B", "SG", False, 78, 60, 68),
            generate_player(f"{name} 選手C", "SF", False, 80, 55, 72),
            generate_player(f"{name} 選手D", "PF", True, 85, 45, 88),
            generate_player(f"{name} 選手E", "C", True, 82, 35, 92),
            generate_player(f"{name} 選手F", "PF", True, 84, 40, 90),
            generate_player(f"{name} 選手G", "G", False, 70, 75, 60),
            generate_player(f"{name} 選手H", "F", False, 72, 50, 70)
        ]
    teams_data[key] = {"name": name, "roster": roster}

with open("/home/obino/.openclaw/workspace/b-league-sim-repo/src/data/players.json", "w", encoding="utf-8") as f:
    json.dump({"teams": teams_data}, f, ensure_ascii=False, indent=2)
