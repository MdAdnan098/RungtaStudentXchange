import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import bicycle from "@/assets/student-items/bicycle.png";
import blazer from "@/assets/student-items/blazer.png";
import book from "@/assets/student-items/book.png";
import calculator from "@/assets/student-items/calculator.png";
import cooler from "@/assets/student-items/cooler.png";
import earbud from "@/assets/student-items/earbud.png";
import earphone from "@/assets/student-items/earphone.png";
import gym from "@/assets/student-items/gym.png";
import fan from "@/assets/student-items/fan.png";
import headphone from "@/assets/student-items/headphone.png";
import induction from "@/assets/student-items/induction.png";
import iron from "@/assets/student-items/iron.png";
import kettle from "@/assets/student-items/kettle.png";
import keyboard from "@/assets/student-items/keyboard.png";
import lamp from "@/assets/student-items/lamp.png";
import laptop from "@/assets/student-items/laptop.png";

import minidrafter from "@/assets/student-items/minidrafter.png";
import mobile from "@/assets/student-items/mobile.png";
import mouse from "@/assets/student-items/mouse.png";
import powerbank from "@/assets/student-items/powerbank.png";
import stove from "@/assets/student-items/stove.png";
import shoe from "@/assets/student-items/shoe.png";
import studytable from "@/assets/student-items/studytable.png";
import watch from "@/assets/student-items/watch.png";

// Purely decorative — a horizontally scrollable showcase of the kinds
// of items students list, standing in for the old hero illustration.
// Not a filter: cards are non-interactive and don't link anywhere.
const ESSENTIALS = [
  { name: "Laptop", image: laptop },
  { name: "Calculator", image: calculator },
  { name: "Book", image: book },
  { name: "Keyboard", image: keyboard },
  { name: "Gym Gear", image: gym },
  { name: "Mobile", image: mobile },
  { name: "Headphones", image: headphone },
  { name: "Earbuds", image: earbud },
  { name: "Earphones", image: earphone },
  { name: "Power Bank", image: powerbank },
  { name: "Mouse", image: mouse },
  { name: "Bicycle", image: bicycle },
  { name: "Study Table", image: studytable    },
  { name: "Mini Drafter", image: minidrafter },
  { name: "Kettle", image: kettle },
  { name: "Shoe", image: shoe },
  { name: "Blazer", image: blazer },
  { name: "Watch", image: watch },
  { name: "Lamp", image: lamp },
  { name: "Fan", image: fan },
  { name: "Cooler", image: cooler },
  { name: "Induction", image: induction },
  { name: "Stove", image: stove },
  { name: "Iron", image: iron },
  
];

const EssentialCard = ({ name, image }) => (
  <li className="w-[108px] shrink-0 snap-start xs:w-[124px]">
    <div className="card card-hover group flex h-[124px] flex-col items-center justify-center gap-2.5 !rounded-2xl p-3 transition-all duration-slow ease-standard hover:-translate-y-0.5 active:translate-y-0 active:duration-fast xs:h-[140px]">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-background-subtle p-2 transition-transform duration-slow ease-standard group-hover:scale-[1.06] xs:h-[72px] xs:w-[72px]">
        <img src={image} alt={name} className="h-full w-full object-contain" loading="lazy" />
      </div>
      <span className="line-clamp-2 text-center text-[11px] font-medium leading-snug text-text-secondary xs:text-body-sm">
        {name}
      </span>
    </div>
  </li>
);

// One horizontally-scrollable row with fade edges + arrow buttons that
// hint there's more content to scroll to. Arrows scroll by ~2 cards'
// worth at a time and hide themselves at the start/end of the row.
const ScrollRow = ({ items, className = "" }) => {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = scrollRef.current;
    if (!el) return;
    const onResize = () => updateEdges();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {!atStart && (
        <>
          {/* Mobile: theme-aware chip, always visible, smaller */}
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount(-1)}
            className="absolute left-1 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface p-1 shadow-sm transition hover:scale-105 hover:bg-background-subtle active:scale-95 sm:hidden"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-text-secondary" />
          </button>
          {/* Desktop: fade + bordered disc */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-14 bg-gradient-to-r from-background to-transparent sm:block" />
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount(-1)}
            className="absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface p-1.5 shadow-sm transition hover:scale-105 hover:bg-background-subtle sm:flex"
          >
            <ChevronLeft className="h-4 w-4 text-text-secondary" />
          </button>
        </>
      )}

      {!atEnd && (
        <>
          {/* Mobile: theme-aware chip, always visible, smaller */}
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount(1)}
            className="absolute right-1 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface p-1 shadow-sm transition hover:scale-105 hover:bg-background-subtle active:scale-95 sm:hidden"
          >
            <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />
          </button>
          {/* Desktop: fade + bordered disc */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-14 bg-gradient-to-l from-background to-transparent sm:block" />
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount(1)}
            className="absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface p-1.5 shadow-sm transition hover:scale-105 hover:bg-background-subtle sm:flex"
          >
            <ChevronRight className="h-4 w-4 text-text-secondary" />
          </button>
        </>
      )}

      <ul
        ref={scrollRef}
        onScroll={updateEdges}
        className={`scrollbar-hide flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-px-1 pb-1 pl-1 pr-1 [-webkit-overflow-scrolling:touch] xs:gap-3.5 ${className}`}
      >
        {items.map((item) => (
          <EssentialCard key={item.name} {...item} />
        ))}
      </ul>
    </div>
  );
};

/**
 * Hero visual: two staggered rows of small product cards below the
 * buttons, each row scrolling horizontally, so the showcase reads as
 * a rich grid rather than a single thin strip — while still being one
 * continuous touch/wheel-scrollable surface per row. Same treatment
 * at every breakpoint, including desktop.
 */
const StudentEssentialsShowcase = () => {
  const midpoint = Math.ceil(ESSENTIALS.length / 2);
  const rowOne = ESSENTIALS.slice(0, midpoint);
  const rowTwo = ESSENTIALS.slice(midpoint);

  return (
    <div
      className="w-full"
      aria-label="Examples of items students list on the marketplace"
    >
      <ScrollRow items={rowOne} />
      <ScrollRow items={rowTwo} className="mt-3.5 xs:mt-4" />
    </div>
  );
};

export default StudentEssentialsShowcase;