import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}', 'onClick={() => { const newPage = Math.max(currentPage - 1, 1); alert("이전 버튼 클릭됨. 변경될 페이지: " + newPage + " / 총 페이지: " + totalEventPages); setCurrentPage(newPage); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}')
content = content.replace('onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalEventPages)); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}', 'onClick={() => { const newPage = Math.min(currentPage + 1, totalEventPages); alert("다음 버튼 클릭됨. 변경될 페이지: " + newPage + " / 총 페이지: " + totalEventPages); setCurrentPage(newPage); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}')
content = content.replace('onClick={() => { setCurrentPage(pageNum); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}', 'onClick={() => { alert("숫자 버튼 클릭됨. 이동할 페이지: " + pageNum + " / 총 페이지: " + totalEventPages); setCurrentPage(pageNum); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}')

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Alerts added")
