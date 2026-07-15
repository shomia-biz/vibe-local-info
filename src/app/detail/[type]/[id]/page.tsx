import localData from "../../../../../public/data/local-info.json";
import { notFound } from "next/navigation";
import DetailClient from "./DetailClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ type: string; id: string }> }): Promise<Metadata> {
  const { type, id } = await params;
  const list = (localData as any)[type] || [];
  const itemData = list.find((item: any) => item.id.toString() === id);

  if (!itemData) {
    return { title: '페이지를 찾을 수 없습니다' };
  }

  return {
    title: `${itemData.name} - 모아팁스 상세정보`,
    description: itemData.summary || `${itemData.name}에 대한 상세 정보입니다.`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

// 정적 배포(output: export)를 위해 미리 만들어둘 모든 페이지 주소를 Next.js에게 알려주는 함수입니다.
export function generateStaticParams() {
  const keys = [
    "events", "benefits", "nationalEvents", "seoulEvents", "kyeonggiEvents", "incheonEvents",
    "seoulBenefits", "kyeonggiBenefits", "incheonBenefits", "nationalBenefits",
    "cultureEvents", "seoulCultureEvents", "kyeonggiCultureEvents", "incheonCultureEvents", "nationalCultureEvents",
    "exhibitionEvents", "seoulExhibitionEvents", "kyeonggiExhibitionEvents", "incheonExhibitionEvents", "nationalExhibitionEvents"
  ];
  
  const params: { type: string; id: string }[] = [];
  for (const key of keys) {
    const list = (localData as any)[key] || [];
    for (const item of list) {
      params.push({
        type: key,
        id: item.id.toString()
      });
    }
  }
  return params;
}

interface ItemData {
  id: number | string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  summary: string;
  link: string;
  target?: string;
  blogContent?: string;
  fee?: string;
  transport?: string;
  region?: string;
  imageUrl?: string;
}

// 상세 페이지 화면 그리기 (서버 컴포넌트)
export default async function DetailPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;

  // URL에 따라 데이터를 가져옵니다.
  const list = (localData as any)[type] || [];
  const itemData = list.find((item: any) => item.id.toString() === id) as ItemData | undefined;

  // 만약 주소가 잘못되어서 데이터가 없다면 "페이지를 찾을 수 없습니다(404)"를 보여줍니다.
  if (!itemData) {
    notFound();
  }

  return <DetailClient itemData={itemData} type={type} />;
}
