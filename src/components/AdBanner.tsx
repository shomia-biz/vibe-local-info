'use client';

import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (adRef.current) {
      if (!adRef.current.dataset.adLoaded) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          adRef.current.dataset.adLoaded = 'true';
        } catch (err: any) {
          if (err.message && !err.message.includes('already have ads')) {
            console.error('AdSense error:', err);
          }
        }
      }
    }
  }, []);

  return (
    <div className="my-10 w-full overflow-hidden text-center bg-gray-50/50 rounded-2xl py-4 border border-dashed border-gray-200">
      <p className="text-[10px] text-gray-400 mb-2 tracking-widest uppercase">Advertisement</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7299812089029185"
        data-ad-slot="4650996332"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
