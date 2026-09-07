import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { MobileNav } from "../components/layout/MobileNav";
import { Player } from "../components/audio-player/Player";
import { QueueDrawer } from "../components/audio-player/QueueDrawer";
import { CreatePlaylistModal } from "../components/modals/CreatePlaylistModal";

export const AppLayout: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop) */}
        <Sidebar onOpenCreatePlaylist={() => setCreateModalOpen(true)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-spotify-black">
          <Header />
          <main className="flex-1 overflow-y-auto pb-28 md:pb-24 scrollbar-thin scrollbar-thumb-neutral-800">
            <Outlet />
          </main>
        </div>

        {/* Queue Drawer */}
        <QueueDrawer />
      </div>

      {/* Global Persistent Audio Player */}
      <Player />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {}}
      />
    </div>
  );
};
