'use client";'
import Flipbook from "@/components/Flipbook";
// import pdfPath from "../public/pdf/manifesto.pdf";
export default function Home() {
  return (
    <div className="">
      <h1>Uwp Web</h1>

      <Flipbook pdfPath={"/pdf/manifesto.pdf"} />
    </div>
  );
}
