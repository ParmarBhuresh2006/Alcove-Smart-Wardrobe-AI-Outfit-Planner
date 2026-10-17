import React from 'react';
import TopNav from './TopNav';
import LeftRail from './LeftRail';
import BottomBar from './BottomBar';

export default function Layout({ children, showBottomBar = true }) {
  return (
    <div className="min-h-screen w-full relative text-white overflow-x-hidden" data-testid="app-layout">
      <div className="app-bg" />
      <div className="app-grain" />
      <TopNav />
      <LeftRail />
      <main
        className="relative px-4 md:pl-[120px] md:pr-8 pt-20 md:pt-[110px] pb-36 md:pb-32 max-w-[1600px] mx-auto w-full"
        data-testid="page-main"
      >
        {children}
      </main>
      {showBottomBar && <BottomBar />}
    </div>
  );
}
