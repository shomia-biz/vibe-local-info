'use client';

import { useEffect } from 'react';

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export default function AdBanner() {
  useEffect(() => {
    if (ADSENSE_ID && ADSENSE_ID !== '나중에_입력') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  if (!ADSENSE_ID || ADSENSE_ID === '나중에_입력') {
    return null;
  }

  return (
    <div className="my-10 w-full overflow-hidden text-center bg-gray-50/50 rounded-2xl py-4 border border-dashed border-gray-200">
      <p className="text-[10px] text-gray-400 mb-2 tracking-widest uppercase">Advertisement</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={`ca-pub-${ADSENSE_ID}`}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
