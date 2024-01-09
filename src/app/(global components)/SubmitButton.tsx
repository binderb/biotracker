'use client';

import { useFormStatus } from "react-dom";
import { FaSpinner } from 'react-icons/fa';

type Props = {
  text: string
  type?: 'thick' | 'thin'
  pendingText: string
  disabled?: boolean
  className?: string
}

export default function SubmitButton ({text, type, pendingText, disabled, className}:Props) {

  const formStatus = useFormStatus();

  return (
    <button className={`${!type || type === 'thick' ? `std-button-lite` : `std-button-lite-thin`} flex items-center gap-2 ${className || ''}`} disabled={formStatus.pending || disabled}>
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