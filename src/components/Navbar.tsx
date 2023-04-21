import Link from "next/link";

export default function Navbar () {
  return (
    <>
      <nav className='flex bg-primary'>
        <Link className='nav-link' href='./'>Home</Link>
      </nav>
    </>
  );
}