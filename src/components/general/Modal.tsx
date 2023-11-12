import React from "react";

type Props = React.PropsWithChildren & {
  showModal: boolean
}

export default function Modal ({children, showModal}:Props) {
  return (
    <section className={`fixed ${showModal ? 'flex' : 'hidden'} justify-center top-0 left-0 bg-black/50 w-screen h-screen`}>
      <section className='flex bg-white rounded-lg mt-[5vh] max-h-[90vh] p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6 self-start'>
        <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2 max-h-[90vh] overflow-hidden'>
          <section className='flex flex-col gap-2 overflow-y-auto p-1'>
            {children}
          </section>
        </section>
      </section>
    </section>
  );
}