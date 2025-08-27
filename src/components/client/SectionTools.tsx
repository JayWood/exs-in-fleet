'use client';

import {EllipsisVerticalIcon} from "@heroicons/react/24/outline";
import UndercutCalc from "@/components/client/UndercutCalc";

export default function SectionTools() {
  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3>Tools</h3>
        <div className="dropdown dropdown-end">
          <button className="btn btn-xs btn-link p-0">
            <EllipsisVerticalIcon className="h-4 w-4 text-gray-500 hover:text-gray-800"/>
          </button>
          <ul className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-44 text-sm">
            <li>
              <a href="#"
                 className="w-full"
                 onClick={()=>null }>Menu Item</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
        <UndercutCalc />
      </div>
    </div>
  );
}
