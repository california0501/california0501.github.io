import imgImage511 from "figma:asset/c4b07c01f57efdd15d6a1e98cfd5d6a9fa794289.png";
import { imgImage512 } from "./svg-y9roi";

function Cursor() {
  return (
    <div
      className="absolute contents left-[38.383px] top-[164px]"
      data-name="Cursor"
    >
      <div
        className="absolute bg-center bg-cover bg-no-repeat h-[800px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[32.3828px_160.25px] mask-size-[521.234px_510px] translate-x-[-50%] translate-y-[-50%] w-[602px]"
        data-name="image 511"
        style={{
          top: "calc(50% + 3.75px)",
          left: "calc(50% + 7px)",
          backgroundImage: `url('${imgImage511}')`,
          maskImage: `url('${imgImage512}')`,
        }}
      />
    </div>
  );
}

export default function CursorMask() {
  return (
    <div className="bg-[#000000] relative size-full" data-name="Cursor Mask">
      <Cursor />
    </div>
  );
}