import IntroScreen from "@/components/IntroScreen";
import AuthCard from "@/components/AuthCard";

export default function Home() {
  return (
    <>
      <IntroScreen />

      <div className="appBackdrop appBackdropDark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <main className="stage">
        <AuthCard />
      </main>
    </>
  );
}