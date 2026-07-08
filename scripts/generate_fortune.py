import json
import os
import re
from datetime import datetime

try:
    # pyrefly: ignore [missing-import]
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

def load_env():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        env_path = os.path.join(current_dir, '..', '.env.local')
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        parts = line.split('=', 1)
                        if len(parts) == 2:
                            key = parts[0].strip()
                            value = parts[1].strip()
                            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                                value = value[1:-1]
                            os.environ[key] = value
    except Exception:
        pass

def generate_fortune_with_gemini():
    load_env()
    if not GEMINI_AVAILABLE:
        print("Warning: google-generativeai module is not installed. Using fallback fortune.")
        return get_fallback_fortune()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY is not set. Using fallback fortune.")
        return get_fallback_fortune()
        
    try:
        genai.configure(api_key=api_key)
        # 추천: 최신 텍스트 모델인 gemini-1.5-flash 사용 (gemini-pro도 가능)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = """
        너는 매일 사람들에게 긍정적인 에너지를 주는 다정한 점성술사야.
        방문자가 자신의 띠를 선택하면 오늘의 운세를 알려주는 띠별 운세 서비스를 제공할 거야.
        12가지 띠(쥐띠, 소띠, 호랑이띠, 토끼띠, 용띠, 뱀띠, 말띠, 양띠, 원숭이띠, 닭띠, 개띠, 돼지띠) 각각에 대해
        긍정적이고 희망찬 운세(1~2문장)를 작성해주고,
        각 띠별 운세에 어울리는 '행운 아이템'을 일상 생활에서 쉽게 살 수 있는 구체적인 상품(예: 무드등, 비타민, 디퓨저, 텀블러 등)으로 각각 1개씩 추천해줘.
        
        반드시 아래 JSON 배열 형식에 맞춰서 답변해줘. 다른 말은 절대 하지마.
        [
            {
                "type": "쥐띠",
                "general": "오늘의 운세 내용",
                "lucky_item": "아이템1"
            },
            {
                "type": "소띠",
                "general": "오늘의 운세 내용",
                "lucky_item": "아이템2"
            },
            ... (나머지 10개 띠도 동일한 형식으로 전부 포함하여 총 12개의 아이템을 만들어야 함)
        ]
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # JSON 배열 부분만 추출
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            cards = json.loads(match.group(0))
            
            # 각 카드에 쿠팡 링크 추가
            for card in cards:
                item = card.get("lucky_item", "행운의 머그컵")
                card["coupang_url"] = f"https://link.coupang.com/a/AF8906554?keyword={item}"
            
            return {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "cards": cards
            }
        else:
            print("Failed to parse JSON from Gemini response. Using fallback.")
            return get_fallback_fortune()
            
    except Exception as e:
        print(f"Error calling Gemini API: {e}. Using fallback fortune.")
        return get_fallback_fortune()

def get_fallback_fortune():
    zodiacs = ["쥐띠", "소띠", "호랑이띠", "토끼띠", "용띠", "뱀띠", "말띠", "양띠", "원숭이띠", "닭띠", "개띠", "돼지띠"]
    cards = []
    for z in zodiacs:
        cards.append({
            "type": z,
            "general": f"오늘은 {z}를 위한 특별하고 좋은 에너지가 가득한 날입니다. 작은 행운을 놓치지 마세요!",
            "lucky_item": "감성 무드등",
            "coupang_url": "https://link.coupang.com/a/AF8906554?keyword=무드등"
        })
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "cards": cards
    }

if __name__ == "__main__":
    print("Generating fortune data...")
    fortune_data = generate_fortune_with_gemini()

    # 웹 프로젝트의 public/data 폴더 내에 저장
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = os.path.join(current_dir, '..', 'public', 'data')
    os.makedirs(target_dir, exist_ok=True)
    target_path = os.path.join(target_dir, 'today_fortune.json')

    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(fortune_data, f, ensure_ascii=False, indent=4)

    print(f"Successfully generated {target_path}")
