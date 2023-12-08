'use client';

import { useFormStatus } from "react-dom";
import { FaSpinner } from 'react-icons/fa';

type Props = {
  text: string
  pendingText: string
  disabled?: boolean
}

export default function SubmitButton ({text, pendingText, disabled}:Props) {

  const formStatus = useFormStatus();

  return (
    <button className='std-button-lite flex items-center gap-2' disabled={formStatus.pending || disabled}>
      {!formStatus.pending && (
        <>{text}</>
      )}
      {formStatus.pending && (
        <>
          <FaSpinner className='animate-spin' />
          {pendingText}
        </>
      )}
    </button>
  )
}