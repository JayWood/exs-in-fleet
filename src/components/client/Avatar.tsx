'use client';

export type Props = {
  url?: string;
  alt?: string;
};


const Avatar = ({url, alt = ''}: Props) => {
  const defaultAvatar = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

  return (
    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
      <div className="w-10 rounded-full">
        <img
          alt={ alt }
          src={ url || defaultAvatar }/>
      </div>
    </div>
  );
}


export default Avatar;
