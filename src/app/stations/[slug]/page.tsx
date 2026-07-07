import React from "react";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import StationDetailClient from "@/components/sections/StationDetailClient";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 0;

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const slugify = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const stations = await db.getPoliceStations();
  const station = stations.find(s => slugify(s.station_name || s.name_en || "") === slug);

  if (!station) {
    return {
      title: "Station Not Found | Greater Chennai Police",
    };
  }

  return {
    title: `${station.station_name || station.name_en} | Greater Chennai Police Directory`,
    description: `Contact and location information for ${station.station_name || station.name_en} located in zone ${station.zone_en || station.zone}, division ${station.division_en || station.division}.`,
  };
}

export default async function StationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const stations = await db.getPoliceStations();
  const station = stations.find(s => slugify(s.station_name || s.name_en || "") === slug);

  if (!station) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-20 px-6 text-center space-y-4 animate-fadeIn">
          <h1 className="font-display font-black text-3xl text-brand-maroon dark:text-brand-gold">Station Not Found</h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-md text-sm font-semibold">
            We couldn't find the police station you were looking for. Please check the URL or use the directory search.
          </p>
          <a href="/stations" className="px-5 py-2.5 rounded-xl bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300">
            Return to Directory
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  // Fetch layout elements
  const menuItems = await db.getMenuItems();
  const rawTicker = await db.getTicker();
  const tickerItems = rawTicker
    .filter((i) => i.active === 1)
    .map((i) => ({
      id: i.id,
      text_en: i.text_en,
      text_ta: i.text_ta,
    }));
  const profile = await db.getCommissionerProfile();
  const helplines = await db.getEmergencyContacts();

  // Find 3 closest nearby stations
  const baseLat = station.latitude || station.lat || 13.0827;
  const baseLng = station.longitude || station.lng || 80.2707;
  
  const sortedNearby = stations
    .filter(s => s.id !== station.id && (s.is_active === 1 || s.is_active === undefined))
    .map(s => {
      const lat = s.latitude || s.lat || 13.0827;
      const lng = s.longitude || s.lng || 80.2707;
      return {
        ...s,
        distance: getDistance(baseLat, baseLng, lat, lng)
      };
    })
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 animate-fadeIn">
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={tickerItems} />
      
      <main className="flex-grow">
        <StationDetailClient 
          station={station} 
          nearbyStations={sortedNearby} 
          helplines={helplines} 
        />
      </main>

      <Footer customProfile={profile} />
    </div>
  );
}
