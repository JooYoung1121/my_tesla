import { NextResponse } from "next/server";
import {
  classifyArrivals,
  myArrivalWindow,
  type CandidateVessel
} from "@/data/shipment";
import { fetchPortArrivals } from "@/lib/portmis";

// 평택항 입항 후보를 디스코드 웹훅으로 알린다.
//  GET  = Vercel Cron용(vercel.json, 매일 09:00 KST). 주목할 후보가 있을 때만 발송.
//  POST = 사이트의 "디스코드로 보내기" 버튼용. 항상 발송.
// 필요 환경변수: DISCORD_WEBHOOK_URL (디스코드 채널 설정 > 연동 > 웹후크에서 발급).
export const preferredRegion = "icn1";
export const dynamic = "force-dynamic";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function fmtDate(iso: string | null) {
  if (!iso) return "미정";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const day = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const time = iso.length >= 16 ? ` ${iso.slice(11, 16)}` : "";
  return `${m}.${d}(${day})${time}`;
}

function dDayLabel(dDay: number | null) {
  if (dDay == null) return "";
  if (dDay === 0) return " · 오늘 입항";
  if (dDay < 0) return ` · ${-dDay}일 전 입항`;
  return ` · D-${dDay}`;
}

const STRENGTH_LABEL = { high: "🔴 가능성 높음", medium: "🟠 가능성 중간", low: "⚪ 참고" } as const;

// 알림 가치가 있는 후보: 내 입항 구간과 겹치거나, 7일 내 입항하는 medium 이상.
function isNotable(v: CandidateVessel) {
  if (v.inMyWindow) return true;
  return v.strength !== "low" && v.dDay != null && v.dDay >= 0 && v.dDay <= 7;
}

function candidateField(v: CandidateVessel) {
  const badges = [v.inMyWindow ? "⭐ 내 차 후보" : null, STRENGTH_LABEL[v.strength]]
    .filter(Boolean)
    .join(" · ");
  const route = [v.fromPort, `평택${v.berth ? ` ${v.berth}` : ""}`].filter(Boolean).join(" → ");
  const lines = [
    `입항 ${fmtDate(v.arrivalAt)}${dDayLabel(v.dDay)}`,
    route,
    v.reasons.length > 0 ? `근거: ${v.reasons.join(" · ")}` : null
  ].filter(Boolean);
  return { name: `🚢 ${v.shipName} — ${badges}`, value: lines.join("\n"), inline: false };
}

async function buildAndSend(force: boolean) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      {
        error: "DISCORD_WEBHOOK_URL이 설정되지 않았습니다.",
        hint: "디스코드 채널 설정 > 연동 > 웹후크에서 URL을 발급받아 환경변수에 넣으세요."
      },
      { status: 500 }
    );
  }

  const result = await fetchPortArrivals({});
  if (!result.ok) {
    const { ok: _ok, ...body } = result;
    return NextResponse.json(body, { status: 502 });
  }

  const nowISO = new Date().toISOString().slice(0, 10);
  const window = myArrivalWindow();
  const candidates = classifyArrivals(result.arrivals, nowISO, window);
  const notable = candidates.filter(isNotable);

  // 크론 호출은 주목할 후보가 없으면 조용히 넘어간다(매일 빈 알림 방지).
  if (!force && notable.length === 0) {
    return NextResponse.json({
      sent: false,
      reason: "주목할 후보 없음(내 구간 겹침 또는 7일 내 medium+ 없음)",
      total: result.arrivals.length,
      candidates: candidates.length
    });
  }

  // 강제 발송이면 상위 후보를, 아니면 주목 후보를 최대 10척까지.
  const toSend = (notable.length > 0 ? notable : candidates).slice(0, 10);

  const embed = {
    title: `⚓ 평택항 테슬라 후보 선박 ${candidates.length}척`,
    description: [
      `**내 차 예상 입항 구간** ${fmtDate(window.from)} ~ ${fmtDate(window.to)} (중앙값 ${fmtDate(window.mid)})`,
      `조회 구간 전체 입항 ${result.arrivals.length}척 중 자동차운반선 후보 ${candidates.length}척`
    ].join("\n"),
    color: 0xe82127,
    fields: toSend.map(candidateField),
    footer: { text: "해양수산부 PORT-MIS 공공데이터 · 마이 테슬라" },
    timestamp: new Date().toISOString()
  };

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "마이 테슬라 입항 알림", embeds: [embed] })
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    return NextResponse.json(
      { error: "디스코드 웹훅 발송 실패", status: res.status, detail },
      { status: 502 }
    );
  }

  return NextResponse.json({
    sent: true,
    notified: toSend.length,
    notable: notable.length,
    candidates: candidates.length
  });
}

// Vercel Cron: CRON_SECRET이 설정돼 있으면 Authorization 헤더를 검증한다.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return buildAndSend(false);
}

// 사이트 버튼(수동 발송): 후보가 없어도 현재 상태를 보낸다.
export async function POST() {
  return buildAndSend(true);
}
