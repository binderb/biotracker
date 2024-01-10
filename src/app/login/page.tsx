import Image from 'next/image';
import config from '@@/config';
import logo from '@@/public/logo.png';
import LoginBox from './components/LoginBox';

export default async function Login() {
  return (
    <>
      <main className='flex flex-col items-center pt-12 font-source'>
        <Image alt='logo' src={logo} width='100' height='100' className='px-2' priority />
        <h1 className='font-light text-[32px] py-6'>Login | {config.webTitle}</h1>
        <LoginBox />
      </main>
    </>
  );
}
