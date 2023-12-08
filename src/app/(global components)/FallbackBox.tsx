import { FaSpinner } from 'react-icons/fa';

type Props = {
  heading?: string;
  loadingText?: string;
};

export default async function FallbackBox({ heading, loadingText }: Props) {
  return (
    <section className='flex flex-col gap-4 col-span-8 bg-secondary/20 border border-secondary/80 p-4 rounded-xl flex-grow'>
      {heading && (
        <h5>{heading}</h5>
      )}
      <div className='flex items-center gap-4'>
        <FaSpinner className='animate-spin' />
        {loadingText}
      </div>
    </section>
  );
}
