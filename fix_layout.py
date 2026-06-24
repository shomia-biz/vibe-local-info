import re

with open('src/app/HomeContent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to make sure `</div>` is properly placed before `<WeatherModal`.
# Wait, let's just find the rogue `</div>` that is in the wrong place.
# It's currently at the end of the `benefits_block`, right before `ads_block`.
# The ads_block starts with `{/* 중앙 광고 영역 */}`.
# So look for `</div>\n\n        {/* 중앙 광고 영역 */}` or similar.

# Actually, the easiest way is to extract the `</div>` and move it to the right place.
# Let's see the context around `{/* 중앙 광고 영역 */}`.
idx_ads = content.find('{/* 중앙 광고 영역 */}')
snippet_before_ads = content[idx_ads-50:idx_ads]
print("Before ads:\n", snippet_before_ads)

idx_weather = content.find('<WeatherModal')
snippet_before_weather = content[idx_weather-50:idx_weather]
print("Before weather:\n", snippet_before_weather)

