'use client';

type Props = {
  setShowModal: Function
  buttonContents: React.ReactNode
}

export default function ModalButton ({setShowModal, buttonContents}:Props) {
  return (
    <>
    <button className='std-button-lite' onClick={(e) => {e.preventDefault();setShowModal(true);}}>
      {buttonContents}
    </button>
    </>
  )

}