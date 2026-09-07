import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { AppLayout } from "./layouts/AppLayout";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { LibraryPage } from "./pages/LibraryPage";
import { LikedSongsPage } from "./pages/LikedSongsPage";
import { PlaylistDetailPage } from "./pages/PlaylistDetailPage";
import { ArtistDetailPage } from "./pages/ArtistDetailPage";
import { AlbumDetailPage } from "./pages/AlbumDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";

// Admin route guard
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (!isAuthenticated || !user?.roles?.includes("ROLE_ADMIN")) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes without AppLayout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main Application with AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/liked-songs" element={<LikedSongsPage />} />
          <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
          <Route path="/artist/:id" element={<ArtistDetailPage />} />
          <Route path="/album/:id" element={<AlbumDetailPage />} />

          {/* Admin Protected Console */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
