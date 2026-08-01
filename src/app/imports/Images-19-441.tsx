import img04 from "figma:asset/8991c840d9df5274fe4b0498aeb10c2942249d71.png";
import img03 from "figma:asset/16a876601533299372f06aa1971137679be7881b.png";
import img02 from "figma:asset/0198af004e91cd62196ab979d8b238b0c95c6399.png";
import img01 from "figma:asset/db362161db1ce858e4f085edbc23e4ede334ce32.png";

export default function Images() {
  return (
    <div className="bg-[#ffffff] relative size-full" data-name="Images">
      <div
        className="absolute bg-center bg-cover bg-no-repeat h-[1200px] left-[369px] top-[287px] w-[900px]"
        data-name="04"
        style={{ backgroundImage: `url('${img04}')` }}
      />
      <div
        className="absolute bg-center bg-cover bg-no-repeat h-[1200px] left-[1309px] top-[287px] w-[900px]"
        data-name="03"
        style={{ backgroundImage: `url('${img03}')` }}
      />
      <div
        className="absolute bg-center bg-cover bg-no-repeat h-[1200px] left-[369px] top-[1527px] w-[900px]"
        data-name="02"
        style={{ backgroundImage: `url('${img02}')` }}
      />
      <div
        className="absolute bg-center bg-cover bg-no-repeat h-[1200px] left-[1309px] top-[1527px] w-[900px]"
        data-name="01"
        style={{ backgroundImage: `url('${img01}')` }}
      />
    </div>
  );
}