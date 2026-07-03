import { NextResponse } from "next/server";
import { PORTMIS, classifyArrivals, myArrivalWindow } from "@/data/shipment";
import { fetchPortArrivals } from "@/lib/portmis";

// PORT-MIS(해수부)가 한국에 있어 Vercel 기본 리전(미국)에서는 왕복이 느리다.
export const preferredRegion = "icn1";
export const revalidate = 1800; // 30분

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";
  const prtAgCd = searchParams.get("prtAgCd") ?? PORTMIS.prtAgCd;
  const days = Number(searchParams.get("days") ?? 21);
  const sde = searchParams.get("sde") ?? undefined;
  const ede = searchParams.get("ede") ?? undefined;

  const result = await fetchPortArrivals({ prtAgCd, days, sde, ede });
  if (!result.ok) {
    const { ok: _ok, status, ...body } = result;
    return NextResponse.json(body, { status: status && status >= 400 ? 502 : 500 });
  }

  if (debug) {
    return NextResponse.json({
      endpoint: `${PORTMIS.baseUrl}/${PORTMIS.operation}`,
      params: { prtAgCd: result.prtAgCd, ...result.range, deGb: "I" },
      rawSample: result.firstPageRaw.slice(0, 4000)
    });
  }

  const now = new Date();
  const nowISO = now.toISOString().slice(0, 10);
  const window = myArrivalWindow();
  const candidates = classifyArrivals(result.arrivals, nowISO, window);

  return NextResponse.json(
    {
      port: result.port,
      prtAgCd: result.prtAgCd,
      range: result.range,
      fetchedAt: now.toISOString(),
      window,
      total: result.arrivals.length,
      returned: candidates.length,
      candidates
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400"
      }
    }
  );
}
