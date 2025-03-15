import { useState } from "react"
import TaxiWithSunroof from "./components/taxi-with-sunroof"

export default function Home() {
  const [sunroofState, setSunroofState] = useState<"closed" | "opening" | "closing" | "opened">("closed")

  const handleOpenSunroof = () => {
    if (sunroofState === "closed" || sunroofState === "closing") {
      setSunroofState("opening")
    }
  }

  const handleCloseSunroof = () => {
    if (sunroofState === "opened" || sunroofState === "opening") {
      setSunroofState("closing")
    }
  }

  const handleAnimationEnd = () => {
    if (sunroofState === "opening") {
      setSunroofState("opened")
    } else if (sunroofState === "closing") {
      setSunroofState("closed")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#ededed] p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-4">Sunroof Control</h1>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleOpenSunroof}
            disabled={sunroofState === "opening" || sunroofState === "opened"}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300 hover:bg-blue-600 transition-colors"
          >
            Abrir
          </button>
          <button
            onClick={handleCloseSunroof}
            disabled={sunroofState === "closing" || sunroofState === "closed"}
            className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-green-300 hover:bg-green-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <TaxiWithSunroof sunroofState={sunroofState} onAnimationEnd={handleAnimationEnd} />
    </main>
  )
}
