import {Bars3Icon} from "@heroicons/react/24/outline";
import AdminNav from "@/components/ui/AdminNav";
import Avatar from "@/components/client/Avatar";
import {cookies} from 'next/headers';
import {eveImageUrl} from "@/lib/shared";

/*
TODO
Test this setting it as a const, versus using export default async function.
For somee reason when tested w/ setting it as a const, then exporting it, it was
acting as a client component, and not server component. Therefore the httponly
cookie could not be read.
 */
export default async function AdminLayout ({children}: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const character = cookieStore.get('character')?.value;

  const [name, playerId]: string[] = character?.split('|') || [];
  return (
    <div className="drawer">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle"/>
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-100 w-full shadow-sm">
          <div className="flex-none lg:hidden">
            <label htmlFor="admin-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
              <Bars3Icon/>
            </label>
          </div>
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Ex's In Fleet Ind.</a>
          </div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal">
              <AdminNav/>
            </ul>
          </div>
          <Avatar url={eveImageUrl({
            category: 'characters',
            id: playerId,
            variation: 'portrait'
          })}/>
        </div>
        {children}
      </div>
      <div className="drawer-side">
        <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          <AdminNav/>
        </ul>
      </div>
    </div>
  )
}
