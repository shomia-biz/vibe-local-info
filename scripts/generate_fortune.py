import json
import os
import re
from datetime import datetime
import google.generativeai as genai

def generate_fortune_with_gemini():
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
        오늘 하루를 활기차게 보낼 수 있도록 전체적인 운세를 1~2문장으로 긍정적이고 따뜻하게 작성해주고,
        오늘 하루 행운을 가져다줄 '행운 아이템'을 일상 생활에서 쿠팡 등에서 쉽게 살 수 있는 구체적인 상품(예: 텀블러, 비타민, 디퓨저, 무선마우스 등)으로 딱 1개만 추천해줘.
        
        반드시 아래 JSON 형식에 맞춰서 답변해줘. 다른 말은 절대 하지마.
        {
            "general": "오늘의 운세 내용",
            "lucky_item": "행운 아이템 이름"
        }
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # JSON 부분만 추출 (마크다운 ```json ... ``` 등 제거)
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            parsed = json.loads(match.group(0))
            item = parsed.get("lucky_item", "행운의 머그컵")
            # 쿠팡 검색 링크로 연결
            coupang_url = f"https://link.coupang.com/a/your_id?keyword={item}" 
            
            return {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "general": parsed.get("general", "오늘은 뜻밖의 기분 좋은 일이 생길 것 같아요!"),
                "lucky_item": item,
                "coupang_url": coupang_url
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
        "general": "오늘은 주변의 사소한 변화가 큰 행운을 불러올 수 있으니 주의 깊게 살펴보세요.",
        "lucky_item": "가성비 무선 키보드",
        "coupang_url": "https://link.coupang.com/a/your_id?keyword=무선키보드"
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
