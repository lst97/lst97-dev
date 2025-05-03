'use client'
import { useRef, useEffect } from 'react'
import { CloseIconButton, Button } from './Buttons'

interface DialogBaseProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export const PlainDialog = (props: DialogBaseProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  // not working
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click occurred outside of the referenced element
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        props.onClose()
      }
    }

    // Add the event listener when the dialog is open
    if (props.open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the dialog closes or the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [props.open, props.onClose, props])

  return (
    <div
      ref={dialogRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-amber-100 bg-opacity-40 backdrop-blur-xs ${
        props.open ? '' : 'hidden'
      }`}
    >
      <div className="bg-[#fdf6e3] rounded-2xl border-double border-black border-4 max-w-(--breakpoint-sm) max-h-screen-sm">
        {/* title */}
        <div className="flex flex-row justify-between items-center border-b-2 border-black border-double relative bg-amber-200 rounded-tr-2xl rounded-tl-2xl">
          <h2 className="text-lg font-bold p-2 px-4">{props.title}</h2>
          <div className="h-12 w-12 relative border-l-2 border-double border-black">
            <CloseIconButton onClick={props.onClose} className="h-full w-full rounded-tr-xl" />
          </div>
        </div>

        {/* content */}
        <div className=" m-4">{props.children}</div>

        <div className="flex flex-row justify-center my-4">
          <Button onClick={props.onClose} className="w-32">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
