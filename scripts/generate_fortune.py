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

def generate_fortune_with_gemini():
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
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        너는 매일 사람들에게 긍정적인 에너지를 주는 다정한 점성술사야.
        방문자가 3장의 미스터리 타로 카드 중 하나를 선택하는 게임을 진행할 거야.
        너는 3개의 서로 다른 매력적인 운세(예: 금전운 폭발, 연애운 상승, 평온한 힐링 등)를 1~2문장으로 긍정적으로 작성해주고,
        각 운세에 어울리는 '행운 아이템'을 일상 생활에서 쉽게 살 수 있는 구체적인 상품(예: 무드등, 비타민, 디퓨저, 텀블러 등)으로 각각 1개씩 추천해줘.
        
        반드시 아래 JSON 배열 형식에 맞춰서 답변해줘. 다른 말은 절대 하지마.
        [
            {
                "type": "행운의 달빛 카드",
                "general": "첫 번째 운세 내용",
                "lucky_item": "아이템1"
            },
            {
                "type": "신비한 별빛 카드",
                "general": "두 번째 운세 내용",
                "lucky_item": "아이템2"
            },
            {
                "type": "따뜻한 햇살 카드",
                "general": "세 번째 운세 내용",
                "lucky_item": "아이템3"
            }
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
                card["coupang_url"] = f"https://link.coupang.com/a/your_id?keyword={item}"
            
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
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "cards": [
            {
                "type": "금전운 상승 카드",
                "general": "오늘은 뜻밖의 이익이 생기거나 좋은 소식을 들을 수 있는 날입니다. 작은 행운을 놓치지 마세요!",
                "lucky_item": "가성비 무선 키보드",
                "coupang_url": "https://link.coupang.com/a/your_id?keyword=무선키보드"
            },
            {
                "type": "연애운 폭발 카드",
                "general": "새로운 인연이나 반가운 연락이 올 수 있습니다. 주변 사람들에게 따뜻한 미소를 지어보세요.",
                "lucky_item": "향기로운 디퓨저",
                "coupang_url": "https://link.coupang.com/a/your_id?keyword=디퓨저"
            },
            {
                "type": "평온한 힐링 카드",
                "general": "바쁜 일상 속에서 나만을 위한 휴식이 필요한 날입니다. 커피 한 잔의 여유가 큰 힘이 될 것입니다.",
                "lucky_item": "감성 무드등",
                "coupang_url": "https://link.coupang.com/a/your_id?keyword=무드등"
            }
        ]
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
