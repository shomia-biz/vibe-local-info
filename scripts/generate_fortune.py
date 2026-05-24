import json
import os
from datetime import datetime

fortune_data = {
    "date": datetime.now().strftime("%Y-%m-%d"),
    "general": "오늘은 비효율을 줄이고 시스템을 정비하기에 아주 좋은 날입니다. 주변의 사소한 변화가 큰 행운을 불러올 수 있으니 주의 깊게 살펴보세요.",
    "lucky_item": "가성비 무선 키보드",
    "coupang_url": "https://link.coupang.com/a/your_id?keyword=무선키보드"
}

# 웹 프로젝트의 public/data 폴더 내에 저장
current_dir = os.path.dirname(os.path.abspath(__file__))
target_dir = os.path.join(current_dir, '..', 'public', 'data')
os.makedirs(target_dir, exist_ok=True)
target_path = os.path.join(target_dir, 'today_fortune.json')

with open(target_path, 'w', encoding='utf-8') as f:
    json.dump(fortune_data, f, ensure_ascii=False, indent=4)

print(f"Successfully generated {target_path}")
