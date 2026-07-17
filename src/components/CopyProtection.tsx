"use client";

import { useEffect } from 'react';

export default function CopyProtection() {
  useEffect(() => {
    // 1. 우클릭 방지
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. 텍스트 선택(드래그) 방지 (입력창 제외)
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // input이나 textarea에서는 텍스트 선택 허용 (챗봇 등)
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
    };

    // 3. 콘텐츠 끌어가기(드래그) 방지
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 4. 복사(Ctrl+C) 및 전체선택(Ctrl+A) 단축키 방지
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // 입력창에서는 단축키 허용
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      // Ctrl+C, Ctrl+A 차단
      if (cmdOrCtrl && (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거 (클린업)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // UI 요소 없이 백그라운드에서 스크립트만 동작하므로 null 반환
  return null;
}
