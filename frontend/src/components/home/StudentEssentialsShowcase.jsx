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
  { name: "Gym Equipment", image: gym },
  { name: "Mobile", image: mobile },
  { name: "Book", image: book },
  { name: "Calculator", image: calculator },
  { name: "Headphones", image: headphone },
  { name: "Earbuds", image: earbud },
  { name: "Earphones", image: earphone },
  { name: "Power Bank", image: powerbank },
  { name: "Keyboard", image: keyboard },
  { name: "Mouse", image: mouse },
  { name: "Bicycle", image: bicycle },
  { name: "Shoe", image: shoe },
  { name: "Blazer", image: blazer },
  { name: "Watch", image: watch },
  { name: "Study Table", image: studytable },
  { name: "Lamp", image: lamp },
  { name: "Fan", image: fan },
  { name: "Cooler", image: cooler },
  { name: "Induction", image: induction },
  { name: "Stove", image: stove },
  { name: "Kettle", image: kettle },
  { name: "Iron", image: iron },
  { name: "Mini Drafter", image: minidrafter },
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
      <ul className="scrollbar-hide flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-px-1 pb-1 pl-1 pr-1 [-webkit-overflow-scrolling:touch] xs:gap-3.5">
        {rowOne.map((item) => (
          <EssentialCard key={item.name} {...item} />
        ))}
      </ul>
      <ul className="scrollbar-hide mt-3.5 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-px-1 pb-1 pl-1 pr-1 [-webkit-overflow-scrolling:touch] xs:mt-4 xs:gap-3.5">
        {rowTwo.map((item) => (
          <EssentialCard key={item.name} {...item} />
        ))}
      </ul>
    </div>
  );
};

export default StudentEssentialsShowcase;
