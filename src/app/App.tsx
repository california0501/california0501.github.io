import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import {
  ShoppingCart,
  Menu,
  X,
  Star,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Edit3,
  Map,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import img04 from "figma:asset/8991c840d9df5274fe4b0498aeb10c2942249d71.png";
import img03 from "figma:asset/16a876601533299372f06aa1971137679be7881b.png";
import img02 from "figma:asset/0198af004e91cd62196ab979d8b238b0c95c6399.png";
import img01 from "figma:asset/db362161db1ce858e4f085edbc23e4ede334ce32.png";
import Cursor from "./imports/Cursor";

function HeaderText() {
  return (
    <>
      {/* INITIATION CEREMONY — 좌상단 */}
      <div
        className="absolute top-[52px] left-4 select-none font-black leading-none tracking-tight text-[#33BBFF] uppercase"
        style={{ fontSize: "clamp(18px, 4vw, 38px)", letterSpacing: "-0.02em" }}
      >
        INITIATION CEREMONY
      </div>
      {/* 입문식에 초대합니다 — 우하단 */}
      <div
        className="absolute bottom-4 right-4 select-none font-black leading-none text-[#33BBFF] text-right"
        style={{ fontSize: "clamp(28px, 7vw, 64px)", letterSpacing: "-0.03em" }}
      >
        입문식에<br />초대합니다
      </div>
    </>
  );
}

/* ─── types ─── */
interface RevealedSquare {
  x: number;
  y: number;
  id: string;
  timeoutId: ReturnType<typeof setTimeout>;
}
interface Review {
  name: string;
  date: string;
  text: string;
  id?: string;
}

/* ─── constants ─── */
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzd1aIkH8c6YEX5_3RJ52OLxwAdXjRfQXVkO7488xASgZiGl7c-Sabyq3fK5k9p7eFDQw/exec";

const SQUARE_SIZE = 108;
const REVEAL_DISTANCE = 25;
const IMAGE_H = 800;
const IMAGE_W = 600;
const DISAPPEAR_MS = 1000;

/* ─── helpers ─── */
const StarRow = ({ size = "sm" }: { size?: "sm" | "xs" }) => (
  <div className="flex gap-0.5 text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`fill-current ${size === "xs" ? "w-3 h-3" : "w-4 h-4"}`}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   LANDING  —  image-reveal screen
═══════════════════════════════════════════════════════════ */
function LandingScreen({ onEnter }: { onEnter: () => void }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [squares, setSquares] = useState<RevealedSquare[]>([]);
  const [isDown, setIsDown] = useState(false);
  const [imgCenter, setImgCenter] = useState({ x: 0, y: 0 });
  const [imgIdx, setImgIdx] = useState(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const counter = useRef(0);
  const images = [img04, img03, img02, img01];

  useEffect(() => {
    const update = () => {
      setImgCenter({
        x: (window.innerWidth - IMAGE_W) / 2,
        y: (window.innerHeight - IMAGE_H) / 2,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const removeSquare = (id: string) =>
    setSquares((p) => p.filter((s) => s.id !== id));

  const revealAt = (x: number, y: number, center: { x: number; y: number }) => {
    const cx = x - SQUARE_SIZE / 2;
    const cy = y - SQUARE_SIZE / 2;
    const iL = center.x, iT = center.y;
    const iR = center.x + IMAGE_W, iB = center.y + IMAGE_H;
    if (cx + SQUARE_SIZE > iL && cx < iR && cy + SQUARE_SIZE > iT && cy < iB) {
      counter.current += 1;
      const id = `sq-${counter.current}`;
      const timeoutId = setTimeout(() => removeSquare(id), DISAPPEAR_MS);
      setSquares((p) => [...p, { x: cx, y: cy, id, timeoutId }]);
    }
  };

  const startInteraction = (x: number, y: number) => {
    setIsDown(true);
    setSquares((cur) => {
      if (cur.length === 0) setImgIdx((i) => (i + 1) % images.length);
      return cur;
    });
    setImgCenter((c) => { revealAt(x, y, c); return c; });
    lastPos.current = { x, y };
    intervalRef.current = setInterval(() => {
      setMousePos((mp) => {
        setImgCenter((c) => { revealAt(mp.x, mp.y, c); return c; });
        return mp;
      });
    }, 150);
  };

  const moveInteraction = (x: number, y: number) => {
    const pos = { x, y };
    setMousePos(pos);
    if (isDown) {
      const d = Math.hypot(pos.x - lastPos.current.x, pos.y - lastPos.current.y);
      if (d >= REVEAL_DISTANCE) {
        setImgCenter((c) => { revealAt(pos.x, pos.y, c); return c; });
        lastPos.current = pos;
      }
    }
  };

  const endInteraction = () => {
    setIsDown(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  useEffect(() => {
    // mouse
    const onMouseMove = (e: MouseEvent) => moveInteraction(e.clientX, e.clientY);
    const onMouseDown = (e: MouseEvent) => startInteraction(e.clientX, e.clientY);
    const onMouseUp = () => endInteraction();

    // touch
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      startInteraction(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      moveInteraction(t.clientX, t.clientY);
    };
    const onTouchEnd = () => endInteraction();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDown]);

  // scroll down to enter
  useEffect(() => {
    const onWheel = (e: WheelEvent) => { if (e.deltaY > 30) onEnter(); };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [onEnter]);

  const currentImage = images[imgIdx];

  return (
    <div className="relative w-full h-full cursor-none select-none bg-black overflow-hidden">
      {/* yellow bg behind image */}
      <div
        className="absolute bg-[#FAFD5D] flex flex-col"
        style={{
          left: imgCenter.x,
          top: imgCenter.y,
          width: IMAGE_W,
          height: IMAGE_H,
        }}
      >
        <HeaderText />
        <div className="flex-1" />
      </div>

      {/* revealed squares */}
      {squares.map((sq) => (
        <div
          key={sq.id}
          className="absolute bg-no-repeat pointer-events-none"
          style={{
            left: sq.x,
            top: sq.y,
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            backgroundImage: `url('${currentImage}')`,
            backgroundPosition: `${-(sq.x - imgCenter.x)}px ${-(sq.y - imgCenter.y)}px`,
            backgroundSize: `${IMAGE_W}px ${IMAGE_H}px`,
          }}
        />
      ))}

      {/* hamburger button — top-right */}
      <button
        onClick={onEnter}
        className="absolute top-5 right-5 z-50 flex flex-col gap-[5px] p-3 bg-black/40 backdrop-blur-sm border border-white/30 rounded"
        aria-label="메뉴 열기"
      >
        <span className="block w-6 h-[2px] bg-white" />
        <span className="block w-6 h-[2px] bg-white" />
        <span className="block w-6 h-[2px] bg-white" />
      </button>

      {/* hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 text-white/60 text-xs font-medium select-none pointer-events-none">
        <span>스크롤 또는 메뉴 클릭</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>

      {/* custom cursor */}
      <div
        className="absolute pointer-events-none z-50"
        style={{ left: mousePos.x - 30, top: mousePos.y - 30, width: 60, height: 60 }}
      >
        <Cursor />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INVITATION PAGE
═══════════════════════════════════════════════════════════ */
function InvitationPage({ onBack }: { onBack: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartBadge, setCartBadge] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpAttendance, setRsvpAttendance] = useState("");
  const [rsvpMemo, setRsvpMemo] = useState("");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);

  const [reviewName, setReviewName] = useState("");
  const [reviewPw, setReviewPw] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteInputs, setDeleteInputs] = useState<Record<string, string>>({});

  const navLinks = [
    { label: "홈", href: "#product-detail" },
    { label: "제품", href: "#related-products" },
    { label: "오시는 길", href: "#location" },
    { label: "방명록", href: "#reviews" },
  ];

  const relatedProducts = [
    { badge: { text: "품절", color: "bg-red-500" }, img: "https://placehold.co/450x300/e9ecef/868e96?text=Diploma", alt: "학위증", title: "빛나는 학위증", sub: "밤샘 과제의 결실", price: "Priceless", priceColor: "text-black", stars: false },
    { badge: { text: "Sale", color: "bg-[#005baa]" }, img: "https://placehold.co/450x300/e9ecef/868e96?text=Tears", alt: "눈물", title: "감동의 눈물", sub: "", price: "Free", priceColor: "text-[#00A651]", originalPrice: "₩100,000", stars: true },
    { badge: null, img: "https://placehold.co/450x300/e9ecef/868e96?text=Flowers", alt: "꽃다발", title: "풍성한 꽃다발", sub: "여러분이 제 꽃이고 향기입니다.", price: "지참 요망", priceColor: "text-black", stars: false },
    { badge: null, img: "https://placehold.co/450x300/e9ecef/868e96?text=Party", alt: "런치쇼", title: "런치쇼 입장권", sub: "졸업식의 꽃", price: "예약 필수", priceColor: "text-[#00A651]", stars: false },
  ];

  const loadReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(false);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=getReviews");
      setReviews(await res.json());
    } catch {
      setReviewsError(true);
    } finally {
      setReviewsLoading(false);
    }
  };
  useEffect(() => { loadReviews(); }, []);

  const handleRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpAttendance) { toast.error("참석 옵션을 선택해 주세요."); return; }
    setRsvpSubmitting(true);
    const fd = new FormData();
    fd.append("action", "rsvp"); fd.append("name", rsvpName);
    fd.append("attendance", rsvpAttendance); fd.append("memo", rsvpMemo);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: fd });
      setCartBadge(true);
      toast.success(`${rsvpName}님의 결제가 완료되었습니다!`);
      setRsvpName(""); setRsvpAttendance(""); setRsvpMemo("");
    } catch { toast.error("네트워크 오류가 발생했습니다."); }
    finally { setRsvpSubmitting(false); }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    const fd = new FormData();
    fd.append("action", "review"); fd.append("name", reviewName);
    fd.append("password", reviewPw); fd.append("text", reviewText);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: fd });
      toast.success("리뷰가 성공적으로 등록되었습니다.");
      setReviewName(""); setReviewPw(""); setReviewText("");
      loadReviews();
    } catch { toast.error("오류가 발생했습니다."); }
    finally { setReviewSubmitting(false); }
  };

  const handleDeleteReview = async (review: Review, pw: string) => {
    if (!pw) { toast.error("비밀번호를 입력해 주세요."); return; }
    const fd = new FormData();
    fd.append("action", "deleteReview");
    fd.append("id", review.id ?? "");
    fd.append("name", review.name);
    fd.append("password", pw);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (data.result === "error") { toast.error("비밀번호가 일치하지 않습니다."); return; }
      toast.success("삭제되었습니다.");
      setDeletingId(null);
      setDeleteInputs((p) => { const n = { ...p }; delete n[review.name + review.date]; return n; });
      loadReviews();
    } catch { toast.error("삭제 중 오류가 발생했습니다."); }
  };

  return (
    <div className="font-sans antialiased text-gray-900 bg-[#fcfcfd]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full bg-white border-b-2 border-black z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="font-black text-xl tracking-tighter text-black">
              Initiation Ceremony<span className="text-[#00A651]">.</span>
            </button>

            <div className="hidden md:flex space-x-8 items-center font-bold">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} className="text-sm text-gray-700 hover:text-[#005baa] transition">{l.label}</a>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              {/* back to landing */}
              <button
                onClick={onBack}
                title="처음 화면으로"
                className="neo-btn bg-white text-black px-3 py-1.5 flex items-center gap-1 text-sm font-bold"
              >
                <X className="w-4 h-4" />
              </button>
              <a href="#rsvp" className="neo-btn bg-white text-black px-4 py-1.5 flex items-center gap-1 text-sm">
                <ShoppingCart className="w-4 h-4 text-[#005baa]" />
                <span className="hidden sm:inline font-bold">Cart</span>
                {cartBadge && <span className="bg-[#00A651] text-white border border-black text-xs rounded-full px-2 py-0.5 ml-1 font-black">1</span>}
              </a>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden neo-btn bg-white text-black px-2 py-1">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t-2 border-black w-full">
            <div className="px-4 pt-2 pb-4 space-y-2 font-bold">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-black hover:text-[#005baa]">{l.label}</a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="product-detail" className="pt-24 pb-10 sm:pt-28 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center">
            <div className="w-full md:w-1/2">
              <div className="neo-card p-2 bg-white">
                <img src="https://placehold.co/600x700/e9ecef/868e96?text=Your+Photo" alt="졸업생 사진" className="w-full h-auto object-cover rounded border-2 border-gray-200" />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="text-sm text-gray-500 mb-1 font-bold tracking-wider">SKU: GRAD-2026-SS</div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#005baa] mb-3 leading-tight">
                [한정판] 졸업식<br />VIP 초대장
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <StarRow />
                <a href="#reviews" className="text-sm text-black hover:text-[#005baa] font-bold underline decoration-2 underline-offset-2">방명록 확인</a>
              </div>
              <div className="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-3">
                <span className="line-through text-gray-400 text-lg font-bold">Priceless</span>
                <span className="text-[#00A651]">₩ 0 <span className="text-base text-black">(참석 시 무료)</span></span>
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-8 font-medium">
                대학 생활 동안의 피땀눈물이 담긴 한정판 졸업식에 여러분을 VIP로 초대합니다. 바쁘시더라도 부디 오셔서 식사를 나누며 새로운 시작을 함께 축하해 주세요!
              </p>
              <div className="flex flex-row gap-3">
                <input type="number" value={1} readOnly className="neo-input w-20 text-center font-black text-lg text-black bg-gray-50" />
                <a href="#rsvp" className="flex-1 neo-btn bg-[#005baa] text-white py-3 sm:py-4 px-4 flex items-center justify-center gap-2 text-base sm:text-lg font-bold">
                  <ShoppingCart className="w-5 h-5" /> 장바구니 담기
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      <section id="related-products" className="py-16 bg-[#f1f3f5] border-y-2 border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-black mb-8 text-center sm:text-left">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p, i) => (
              <div key={i} className="neo-card flex flex-col relative group">
                {p.badge && (
                  <div className={`absolute top-3 right-3 ${p.badge.color} text-white text-xs font-black px-2 py-1 rounded border-2 border-black z-10`}>{p.badge.text}</div>
                )}
                <div className="overflow-hidden border-b-2 border-black">
                  <img src={p.img} alt={p.alt} className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4 flex flex-col flex-grow text-center bg-white">
                  <h5 className="font-black text-[#005baa] text-lg mb-1">{p.title}</h5>
                  {p.stars && <div className="flex justify-center mb-2"><StarRow size="xs" /></div>}
                  {p.sub && <p className="text-sm text-gray-500 mb-2 font-bold">{p.sub}</p>}
                  <div className={`mt-auto font-black ${p.priceColor}`}>
                    {"originalPrice" in p && p.originalPrice && <span className="line-through text-gray-400 text-xs font-bold mr-1">{p.originalPrice}</span>}
                    {p.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION ── */}
      <section id="location" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-center">
          <div className="md:w-1/3 w-full">
            <h2 className="text-3xl font-black text-[#005baa] mb-6">오시는 길</h2>
            <div className="neo-card p-6 bg-[#f8f9fa] space-y-6">
              <div>
                <h4 className="text-sm font-black text-gray-500 mb-1 flex items-center gap-2"><Calendar className="w-5 h-5 text-black" />DATE &amp; TIME</h4>
                <p className="text-lg font-bold text-black">2026년 2월 25일 (수)<br />오후 2시 00분</p>
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-500 mb-1 flex items-center gap-2"><MapPin className="w-5 h-5 text-black" />LOCATION</h4>
                <p className="text-lg font-bold text-black">부산대학교 인문대학<br /><span className="text-sm text-gray-600">부산광역시 금정구 부산대학로63번길 2 (장전동)</span></p>
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-500 mb-1 flex items-center gap-2"><Phone className="w-5 h-5 text-black" />CONTACT</h4>
                <p className="text-base font-bold text-black">010-1234-5678</p>
              </div>
              <div className="pt-2">
                <a href="https://map.naver.com/v5/search/부산광역시+금정구+부산대학로63번길+2" target="_blank" rel="noreferrer" className="neo-btn bg-[#03C75A] text-white w-full flex items-center justify-center py-3 text-base font-bold gap-2">
                  <Map className="w-5 h-5" /> 네이버 길찾기
                </a>
              </div>
            </div>
          </div>
          <div className="md:w-2/3 w-full h-[300px] sm:h-[450px] neo-card p-0 overflow-hidden">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.3!2d129.0849!3d35.2314!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3568ece41b00e8b3%3A0x7c8b9db3b0b5d3a1!2sPusan%20National%20University!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="map" />
          </div>
        </div>
      </section>

      {/* ── RSVP ── */}
      <section id="rsvp" className="py-16 bg-[#f1f3f5] border-y-2 border-black">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-black mb-2">CHECKOUT (RSVP)</h2>
            <p className="text-gray-600 font-bold text-sm sm:text-base">장바구니에 담긴 초대장을 결제하여 참석을 확정해 주세요.</p>
          </div>
          <form onSubmit={handleRsvp} className="neo-card p-6 sm:p-10 bg-white">
            <div className="mb-6">
              <label className="block text-sm font-black text-black mb-2">고객명 (성함) <span className="text-red-500">*</span></label>
              <input type="text" required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="이름을 입력해주세요" className="neo-input w-full px-4 py-3 bg-gray-50" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-black text-black mb-2">참석 옵션 선택 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ value: "yes", label: "당연히 참석! (구매)" }, { value: "no", label: "마음만 참석 (취소)" }].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setRsvpAttendance(opt.value)}
                    className={`neo-input p-4 flex items-center justify-center font-bold text-center transition-all ${rsvpAttendance === opt.value ? "bg-[#005baa] text-white border-black shadow-[3px_3px_0_0_#000] -translate-x-[3px] -translate-y-[3px]" : "text-gray-700 bg-gray-50"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <label className="block text-sm font-black text-black mb-2">배송 요청사항 (뒤풀이 등)</label>
              <textarea rows={3} value={rsvpMemo} onChange={(e) => setRsvpMemo(e.target.value)} placeholder="뒤풀이 참석 여부나 전하고 싶은 말을 남겨주세요." className="neo-input w-full px-4 py-3 bg-gray-50" />
            </div>
            <button type="submit" disabled={rsvpSubmitting} className="neo-btn w-full bg-[#00A651] text-white py-4 flex justify-center items-center text-lg font-bold gap-2 disabled:opacity-70">
              {rsvpSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              {rsvpSubmitting ? "진행 중..." : "결제하기 (제출)"}
            </button>
          </form>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b-2 border-black pb-4">
            <h2 className="text-3xl font-black text-[#005baa]">CUSTOMER REVIEWS</h2>
            <div className="flex items-center bg-gray-50 px-4 py-2 border-2 border-black rounded-full shadow-[2px_2px_0_0_#000]">
              <StarRow /><span className="ml-2 text-sm text-black font-black">5.0 / 5.0</span>
            </div>
          </div>
          <div className="neo-card bg-[#f8f9fa] p-6 mb-10">
            <h3 className="text-base font-black mb-4 text-black flex items-center gap-2"><Edit3 className="w-4 h-4" />리뷰 작성하기</h3>
            <form onSubmit={handleReview}>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input type="text" required value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="작성자" className="neo-input w-full sm:w-1/3 px-4 py-3 bg-white" />
                <input type="password" required value={reviewPw} onChange={(e) => setReviewPw(e.target.value)} placeholder="비밀번호" className="neo-input w-full sm:w-1/3 px-4 py-3 bg-white" />
              </div>
              <textarea required rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="상품(졸업)에 대한 따뜻한 리뷰를 남겨주세요!" className="neo-input w-full px-4 py-3 bg-white mb-4" />
              <div className="flex justify-end">
                <button type="submit" disabled={reviewSubmitting} className="neo-btn bg-[#005baa] text-white px-6 py-3 w-full sm:w-auto text-base font-bold flex items-center justify-center gap-2 disabled:opacity-70">
                  {reviewSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}리뷰 등록
                </button>
              </div>
            </form>
          </div>
          <div className="space-y-5">
            {reviewsLoading ? (
              <div className="text-center py-10 font-bold text-gray-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-7 h-7 animate-spin text-[#005baa]" />데이터를 불러오는 중입니다...
              </div>
            ) : reviewsError ? (
              <div className="text-center text-red-500 font-bold py-10">리뷰 데이터를 불러오는데 실패했습니다.</div>
            ) : reviews.length === 0 ? (
              <div className="neo-card bg-gray-50 p-8 text-center font-bold text-gray-500">아직 작성된 리뷰가 없습니다. 첫 리뷰를 남겨주세요!</div>
            ) : reviews.map((r, i) => {
              const key = r.name + r.date;
              const isDeleting = deletingId === key;
              return (
                <div key={i} className="neo-card bg-white p-5">
                  <div className="flex justify-between items-start mb-3 border-b-2 border-black pb-2">
                    <div className="flex items-center gap-2"><StarRow size="xs" /><span className="font-black text-sm text-black">{r.name}</span></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-bold">{r.date}</span>
                      <button
                        onClick={() => setDeletingId(isDeleting ? null : key)}
                        className="text-xs text-gray-400 hover:text-red-500 font-bold underline"
                      >삭제</button>
                    </div>
                  </div>
                  <p className="text-black font-bold text-sm leading-relaxed whitespace-pre-wrap">{r.text}</p>
                  {isDeleting && (
                    <div className="mt-3 flex gap-2 pt-3 border-t-2 border-dashed border-gray-200">
                      <input
                        type="password"
                        placeholder="비밀번호 입력"
                        value={deleteInputs[key] ?? ""}
                        onChange={(e) => setDeleteInputs((p) => ({ ...p, [key]: e.target.value }))}
                        className="neo-input flex-1 px-3 py-2 text-sm bg-gray-50"
                      />
                      <button
                        onClick={() => handleDeleteReview(r, deleteInputs[key] ?? "")}
                        className="neo-btn bg-red-500 text-white px-4 py-2 text-sm font-bold"
                      >확인</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#005baa] border-t-2 border-black py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <span className="font-black text-white text-2xl tracking-tighter block mb-4">Initiation Ceremony<span className="text-[#00A651]">.</span></span>
          <p className="text-gray-200 text-center mb-4 font-bold">김혜원 Хевон Ким | Contact : gpdnjs4728@gmail.com</p>
          <p className="text-gray-300 text-xs font-bold">Copyright &copy; 2026 Initiation Ceremony. All rights reserved.</p>
        </div>
      </footer>

      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 z-50 neo-btn bg-white text-black p-3" aria-label="맨 위로">
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState<"landing" | "invitation">("landing");
  const [animating, setAnimating] = useState(false);

  const enter = () => {
    if (animating || view === "invitation") return;
    setAnimating(true);
    setTimeout(() => {
      setView("invitation");
      setAnimating(false);
      window.scrollTo({ top: 0 });
    }, 420);
  };

  const back = () => {
    setView("landing");
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#000", color: "#fff",
            border: "2px solid #000", boxShadow: "4px 4px 0 0 #fff",
            fontWeight: 700, borderRadius: "9999px",
            fontFamily: "'Noto Sans KR', sans-serif",
          },
        }}
      />

      {/* landing layer */}
      <div
        className="fixed inset-0 z-10 transition-transform duration-[420ms] ease-in-out"
        style={{
          transform: view === "invitation" ? "translateY(-100%)" : "translateY(0)",
          pointerEvents: view === "invitation" ? "none" : "auto",
        }}
      >
        <LandingScreen onEnter={enter} />
      </div>

      {/* invitation layer — slides up from below */}
      <div
        className="relative z-0 transition-transform duration-[420ms] ease-in-out"
        style={{
          transform: view === "invitation" ? "translateY(0)" : "translateY(100vh)",
          minHeight: "100vh",
        }}
      >
        {view === "invitation" && <InvitationPage onBack={back} />}
      </div>

      <style>{`
        .neo-card {
          border: 2px solid #000;
          box-shadow: 4px 4px 0 0 #000;
          border-radius: 0.5rem;
          background-color: #fff;
          overflow: hidden;
        }
        .neo-btn {
          border: 2px solid #000;
          box-shadow: 3px 3px 0 0 #000;
          transform: translate(-3px, -3px);
          transition: all 0.15s ease-out;
          font-weight: 700;
          border-radius: 0.375rem;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .neo-btn:hover, .neo-btn:active {
          box-shadow: 0 0 0 0 #000;
          transform: translate(0, 0);
        }
        .neo-input {
          border: 2px solid #000;
          border-radius: 0.375rem;
          background-color: #fff;
          transition: all 0.15s ease-out;
          width: 100%;
          display: block;
        }
        .neo-input:focus {
          box-shadow: 3px 3px 0 0 #000;
          transform: translate(-3px, -3px);
          outline: none;
        }
      `}</style>
    </>
  );
}
