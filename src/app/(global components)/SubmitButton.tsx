'use client';

import { useFormStatus } from "react-dom";
import { FaSpinner } from 'react-icons/fa';

type Props = {
  text: string
  type?: 'thick' | 'thin'
  icon?: React.ReactNode
  pendingText: string
  disabled?: boolean
  className?: string
}

export default function SubmitButton ({text, type, icon, pendingText, disabled, className}:Props) {

  const formStatus = useFormStatus();

  return (
    <button className={`${!type || type === 'thick' ? `std-button-lite` : `std-button-lite-thin`} flex items-center gap-2 ${className || ''}`} disabled={formStatus.pending || disabled}>
      {!formStatus.pending && (
        <>
          {icon && (
            <>
              {icon}
            </>
          )}
          {text}
        </>
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