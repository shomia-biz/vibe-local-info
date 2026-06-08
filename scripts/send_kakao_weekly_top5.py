import json
import os
import requests
from datetime import datetime, timedelta

# ==========================================
# 설정 부분 (GitHub Secrets에서 환경 변수로 받아옴)
# ==========================================
KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")
KAKAO_REFRESH_TOKEN = os.environ.get("KAKAO_REFRESH_TOKEN")

def refresh_access_token():
    """리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다."""
    if not KAKAO_REST_API_KEY or not KAKAO_REFRESH_TOKEN:
        print("⚠️ KAKAO_REST_API_KEY 또는 KAKAO_REFRESH_TOKEN이 설정되지 않았습니다.")
        return None

    url = "https://kauth.kakao.com/oauth/token"
    data = {
        "grant_type": "refresh_token",
        "client_id": KAKAO_REST_API_KEY,
        "refresh_token": KAKAO_REFRESH_TOKEN
    }
    
    response = requests.post(url, data=data)
    if response.status_code == 200:
        tokens = response.json()
        print("🔑 새로운 액세스 토큰 발급 완료!")
        return tokens.get("access_token")
    else:
        print(f"❌ 토큰 갱신 실패: {response.status_code}")
        print(response.text)
        return None

def load_data():
    """local-info.json 파일에서 데이터를 불러옵니다."""
    file_path = os.path.join(os.path.dirname(__file__), "..", "public", "data", "local-info.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"데이터를 불러오는 중 오류 발생: {e}")
        return None

def extract_top5_deadlines(data):
    """모든 공고 중 이번 주 이내에 마감되는 5개를 추출합니다."""
    today = datetime.now()
    next_week = today + timedelta(days=7)
    
    today_str = today.strftime("%Y-%m-%d")
    next_week_str = next_week.strftime("%Y-%m-%d")
    
    upcoming_events = []
    
    # 여러 카테고리의 리스트들을 하나로 합치기
    all_items = []
    for key, items in data.items():
        if isinstance(items, list):
            all_items.extend(items)
            
    for item in all_items:
        end_date = item.get("endDate", "")
        # 상시 공고이거나 날짜 형식이 아닌 경우 제외
        if not end_date or end_date == "상시":
            continue
            
        # 마감일이 오늘부터 7일 이내인 경우만 추가
        if today_str <= end_date <= next_week_str:
            upcoming_events.append(item)
            
    # 마감일이 빠른 순서대로 정렬
    upcoming_events.sort(key=lambda x: x.get("endDate", ""))
    
    # 중복 제거 (이름 기준)
    unique_events = []
    seen = set()
    for ev in upcoming_events:
        if ev["name"] not in seen:
            seen.add(ev["name"])
            unique_events.append(ev)
            
    # 상위 5개 반환
    return unique_events[:5]

def format_message(top5_events):
    """추출된 공고들로 카카오톡 메시지 본문을 만듭니다."""
    if not top5_events:
        return "이번 주 마감되는 새로운 혜택이나 공고가 없습니다. 편안한 한 주 보내세요! 😊"
        
    msg = "🚨 [모아팁스] 이번 주 마감 임박 혜택 TOP 5 🚨\n\n"
    msg += "놓치면 아쉬운 혜택들, 마감 전에 서둘러 신청하세요!\n\n"
    
    for i, event in enumerate(top5_events, 1):
        name = event.get("name", "이름 없음")
        end_date = event.get("endDate", "")
        link = event.get("link", "https://moa-tips.com")
        
        msg += f"{i}. {name}\n"
        msg += f"⏰ 마감: {end_date}\n"
        msg += f"👉 자세히 보기: {link}\n\n"
        
    msg += "더 많은 정보는 모아팁스 홈페이지에서 확인하세요!\n"
    msg += "🌐 https://moa-tips.com"
    return msg

def send_kakao_message(text, access_token):
    """카카오톡 '나에게 보내기' API를 통해 메시지를 전송합니다."""
    if not access_token:
        print("⚠️ 액세스 토큰이 유효하지 않아 메시지 전송을 건너뜁니다.")
        return False
        
    # 카카오톡 메시지 전송 API 주소 (나에게 보내기)
    # 실제 구독자 전체 발송을 위해서는 '알림톡 API (예: 알리고, 비즈뿌리오 등)' 사용 필요
    url = "https://kapi.kakao.com/v2/api/talk/memo/default/send"
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    # 카카오톡 링크(Link) 템플릿 데이터 구성
    template_object = {
        "object_type": "text",
        "text": text,
        "link": {
            "web_url": "https://moa-tips.com",
            "mobile_web_url": "https://moa-tips.com"
        },
        "button_title": "모아팁스 바로가기"
    }
    
    data = {
        "template_object": json.dumps(template_object)
    }
    
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        print("✅ 카카오톡 메시지가 성공적으로 발송되었습니다.")
        return True
    else:
        print(f"❌ 카카오톡 발송 실패: {response.status_code}")
        print(response.text)
        return False

def main():
    print("1. 데이터 불러오기...")
    data = load_data()
    if not data:
        return
        
    print("2. 마감 임박 공고 추출 중...")
    top5 = extract_top5_deadlines(data)
    
    print(f"-> {len(top5)}개의 공고가 추출되었습니다.")
    
    print("3. 카카오톡 메시지 포맷팅...")
    message_text = format_message(top5)
    print("-----------------------------------")
    print(message_text)
    print("-----------------------------------")
    
    print("4. 카카오톡 액세스 토큰 갱신 시도...")
    access_token = refresh_access_token()
    
    if access_token:
        print("5. 카카오톡 발송 시도...")
        send_kakao_message(message_text, access_token)
    else:
        print("⚠️ 발송 실패: 유효한 액세스 토큰을 얻지 못했습니다.")

if __name__ == "__main__":
    main()
