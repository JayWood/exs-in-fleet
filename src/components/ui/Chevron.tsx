'use client'

import { ChevronUpIcon, ChevronDownIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon } from '@heroicons/react/24/solid'
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
    const min = median - buffer
    const max = median + buffer

    const minDouble = maxBuffer !== undefined ? median - maxBuffer : null
    const maxDouble = maxBuffer !== undefined ? median + maxBuffer : null

    let icon = null
    let color = ''

    if (value > max) {
        color = 'text-red-500'

        if (maxDouble !== null && value > maxDouble) {
            icon = <ChevronDoubleUpIcon className="w-4 h-4" />
        } else {
            icon = <ChevronUpIcon className="w-4 h-4" />
        }
    } else if (value < min) {
        color = 'text-green-500'

        if (minDouble !== null && value < minDouble) {
            icon = <ChevronDoubleDownIcon className="w-4 h-4" />
        } else {
            icon = <ChevronDownIcon className="w-4 h-4" />
        }
    }

    return (
        <span className={clsx('inline-flex items-center gap-1', color, className)} {...rest}>
      {children}
            {icon}
    </span>
    )
}

export default Chevron;