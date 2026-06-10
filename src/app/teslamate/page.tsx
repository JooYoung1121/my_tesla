import {
  ArrowLeft,
  BatteryCharging,
  Database,
  Gauge,
  LockKeyhole,
  Server,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    icon: Database,
    title: "무엇을 저장하나",
    text: "주행, 충전, 배터리 잔량, 효율, 위치, 소프트웨어 업데이트, 차량 수면 상태를 PostgreSQL에 계속 쌓는다."
  },
  {
    icon: Gauge,
    title: "어디서 보나",
    text: "기본 분석 화면은 Grafana가 맡는다. 우리 앱은 나중에 월간 충전비와 효율 같은 쉬운 요약만 가져오면 된다."
  },
  {
    icon: LockKeyhole,
    title: "왜 조심해야 하나",
    text: "테슬라 계정 토큰과 차량 위치 데이터가 들어가므로 외부 공개보다 VPN, Tailscale, Cloudflare Tunnel 같은 접근이 안전하다."
  },
  {
    icon: Server,
    title: "어디에 설치하나",
    text: "항상 켜져 있는 집 PC, NAS, 미니 PC, 개인 VPS에 Docker Compose로 설치하는 방식이 일반적이다."
  }
];

export default function TeslaMatePage() {
  return (
    <main className="doc-page">
      <div className="doc-shell">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} aria-hidden="true" />
          대시보드로
        </Link>

        <header className="doc-hero">
          <p className="eyebrow">차량 인수 후 검토</p>
          <h1>TeslaMate는 내 차의 장기 기록 저장소다.</h1>
          <p>
            공식 Tesla 앱은 차량 제어에 쓰고, TeslaMate는 인수 후 실제 주행과
            충전 데이터가 생겼을 때 별도 서버에서 운영한다.
          </p>
        </header>

        <section className="doc-grid" aria-label="TeslaMate 핵심 설명">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <article className="doc-card" key={section.title}>
                <Icon size={24} aria-hidden="true" />
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </article>
            );
          })}
        </section>

        <section className="doc-band">
          <div>
            <BatteryCharging size={26} aria-hidden="true" />
            <h2>도입 시점</h2>
          </div>
          <p>
            지금은 차가 없어서 쌓을 데이터도 없다. 8월 인수 후 2주에서 1개월
            정도 공식 앱만 써보고, 충전비와 효율, 배터리 추세를 계속 보고
            싶어지면 그때 설치한다.
          </p>
        </section>

        <section className="doc-band warning">
          <div>
            <ShieldAlert size={26} aria-hidden="true" />
            <h2>운영 조건</h2>
          </div>
          <p>
            항상 켜진 장비, Docker, 백업, 안전한 접속 방식이 필요하다. 인터넷에
            그대로 포트를 열어두는 운영은 피한다.
          </p>
        </section>
      </div>
    </main>
  );
}
