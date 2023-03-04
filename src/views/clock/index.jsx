import { useEffect, useState } from 'react'
import _ from 'lodash'
import clsx from 'clsx'
import { VStack, HStack } from '@nami-ui/stack'
import dayjs from 'dayjs'

import styles from './index.module.scss'
import useForceUpdate from 'utils/use-force-update.ts'
import { useWindowSize } from 'react-use'

function useTicktock(delay = 20) {
    const forceUpdate = useForceUpdate()

    useEffect(() => {
        if (delay != null) {
            const timer = setInterval(forceUpdate, delay)
            return () => clearInterval(timer)
        }
    }, [delay, forceUpdate])

    return dayjs()
}

export default function Clock({ ...otherProps }) {
    const now = useTicktock()
    const { width } = useWindowSize()

    const timeStyle = {
        fontSize: _.clamp(_.round(width * 0.13), 77, 157) + 'px',
        lineHeight: _.clamp(_.round(width * 0.27), 127, 277) + 'px',
    }

    const dateStyle = {
        fontSize: _.clamp(_.round(width * 0.027), 16, 27) + 'px',
        lineHeight: _.clamp(_.round(width * 0.07), 27, 57) + 'px',
    }

    return (
        <VStack className={styles.container} justify="center" align="center">
            <HStack className={styles.time} style={timeStyle}>
                <span className={clsx(styles.num)}>{now.format('HH')}</span>
                <span className={styles.sep}>:</span>
                <span className={clsx(styles.num)}>{now.format('mm')}</span>
                <span className={styles.sep}>:</span>
                <span className={clsx(styles.num)}>{now.format('ss')}</span>
            </HStack>
            <HStack className={styles.date} style={dateStyle}>
                <span className={clsx(styles.num)}>{now.format('YYYY')}</span>
                <span className={styles.sep}>年</span>
                <span className={clsx(styles.num)}>{now.format('MM')}</span>
                <span className={styles.sep}>月</span>
                <span className={clsx(styles.num)}>{now.format('DD')}</span>
                <span className={styles.sep}>日</span>
                <span className={styles.sep}>　</span>
                <Week className={clsx(styles.num)} time={now} />
            </HStack>
        </VStack>
    )
}

function Week({ time, ...otherProps }) {
    const [mode, setMode] = useState('theNameOfDayOfWeek')

    function switchMode() {
        if (mode === 'theNameOfDayOfWeek') {
            setMode('weekOfYear')
        } else {
            setMode('theNameOfDayOfWeek')
        }
    }

    return (
        <span {...otherProps} onDoubleClick={switchMode}>
            {mode === 'theNameOfDayOfWeek' ? time.format('dddd') : `今年第 ${time.week()} 周`}
        </span>
    )
}
