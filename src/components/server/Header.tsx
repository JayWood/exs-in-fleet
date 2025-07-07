import {Bars3Icon} from "@heroicons/react/24/outline";

const Header = () => (
  <div className="navbar bg-base-100 shadow-sm">
    <div className="flex-none">
      <button className="btn btn-square btn-ghost">
        <Bars3Icon />
        {/*<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>*/}
      </button>
    </div>
    <div className="flex-1">
      <a className="btn btn-ghost text-xl">Ex's In Fleet Ind.</a>
    </div>
    <div className="flex-none">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
    </div>
  </div>
)

export default Header;


