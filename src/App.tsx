/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { TrailerProvider } from './lib/TrailerContext';
import ScrollRestorer from './components/ScrollRestorer';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import MovieDetails from './pages/MovieDetails';
import Trending from './pages/Trending';
import KidsZone from './pages/KidsZone';
import HorrorZone from './pages/HorrorZone';
import AnimePage from './pages/AnimePage';
import Shuffle from './pages/Shuffle';
import Profile from './pages/Profile';
import Search from './pages/Search';
import YearPage from './pages/YearPage';
import Privacy from './pages/Privacy';
import PersonPage from './pages/PersonPage';
import Terms from './pages/Terms';
import HelpCenter from './pages/HelpCenter';
import Login from './pages/Login';
import Community from './pages/Community';
import PublicProfile from './pages/PublicProfile';
import Premium from './pages/Premium';
import Games from './pages/Games';
import AdminDashboard from './pages/AdminDashboard';
import QuotaExceededModal from './components/QuotaExceededModal';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#38bdf8]/30 flex flex-col overflow-x-hidden">
      <ScrollRestorer />
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      <QuotaExceededModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TrailerProvider>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/person/:id" element={<PersonPage />} />
            <Route path="/search" element={<Search />} />
            <Route path="/films/year/:year" element={<YearPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/kids" element={<KidsZone />} />
            <Route path="/horror" element={<HorrorZone />} />
            <Route path="/anime" element={<AnimePage />} />
            <Route path="/shuffle" element={<Shuffle />} />
            <Route path="/community" element={<Community />} />
            <Route path="/games" element={<Games />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user/:userId" element={<PublicProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/help" element={<HelpCenter />} />
          </Routes>
        </Layout>
        </TrailerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
