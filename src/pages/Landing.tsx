import { Header } from "../sections/Header";
import { Hero } from "../sections/Hero";
import { Recording } from "../sections/Recording";
import { Carousel } from "../sections/Carousel";
import { Features } from "../sections/Features";
import { Benefits } from "../sections/Benefits";
import { Downloads } from "../sections/Downloads";
import { Faq } from "../sections/Faq";
import { Footer } from "../sections/Footer";
import { LottieStage } from "../player/LottieStage";
import { art } from "../sections/art";
import "../sections/landing.css";

const DESKTOP = art("icon-desktop");

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg-0 text-text-0">
      <a href="#main" className="sr-only z-50 rounded bg-lume px-4 py-2 text-bg-0 focus:not-sr-only focus:fixed focus:left-4 focus:top-3">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Recording />
        <Carousel />
        <Features />
        <Benefits />
        <div className="border-t border-bg-3/60">
          <Downloads
            art={
              <div className="relative h-12 w-12 shrink-0">
                <LottieStage decorative src={DESKTOP.src} poster={DESKTOP.poster} stateMachine="Icon" alt="" className="h-full w-full" />
              </div>
            }
          />
        </div>
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
