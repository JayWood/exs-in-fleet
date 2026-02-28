'use client'

import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon
} from '@heroicons/react/24/solid'
import clsx from 'clsx'

export type Props = {
  value: number
  median: number
  buffer: number
  maxBuffer?: number
  className?: string
  children?: React.ReactNode
  [k: string]: unknown
}

const Chevron = ({
  value,
  median,
  buffer,
  maxBuffer,
  className,
  children,
  ...rest
}: Props) => {
  // If below zero, always green
  if (value < 0) {
    return (
      <span
        className={clsx('inline-flex items-center gap-1 text-green-500', className)}
        {...rest}
      >
        <ChevronDownIcon className="w-4 h-4" />
        {children}
      </span>
    )
  }

  const isAboveMax = value > median + buffer
  const isBelowMin = value < median - buffer
  const isExtremeAbove = maxBuffer !== undefined && value > median + maxBuffer
  const isExtremeBelow = maxBuffer !== undefined && value < median - maxBuffer

  if (!isAboveMax && !isBelowMin) {
    return <span className={clsx('inline-flex items-center gap-1', className)} {...rest}>{children}</span>
  }

  // Determine color and icon
  let color = ''
  let icon = null

  if (isAboveMax) {
    if (isExtremeAbove) {
      color = 'text-red-500'
      icon = <ChevronDoubleUpIcon className="w-4 h-4" />
    } else {
      color = 'text-orange-500'
      icon = <ChevronUpIcon className="w-4 h-4" />
    }
  } else {
    if (isExtremeBelow) {
      color = 'text-red-500'
      icon = <ChevronDoubleDownIcon className="w-4 h-4" />
    } else {
      color = 'text-green-500'
      icon = <ChevronDownIcon className="w-4 h-4" />
    }
  }

  return (
    <span
      className={clsx('inline-flex items-center gap-1', color, className)}
      {...rest}
    >
      {icon}
      {children}
    </span>
  )
}

export default Chevron