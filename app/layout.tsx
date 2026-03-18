import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/lib/PlayerContext";
import MusicPlayer from "@/components/MusicPlayer";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wavify — Music for Everyone",
  description: "Stream trending music, search songs, build playlists.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0f] text-white`}>
        <PlayerProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>

          {/* Sticky player */}
          <MusicPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
