import React, { useEffect } from 'react'
import _ from 'lodash'
import clsx from 'clsx'
import { VLinear, HLinear } from '@biossun/nami'
import moment from 'moment'

import styles from './index.module.scss'
import useForceUpdate from 'utils/use-force-update'
import { useWindowSize } from 'react-use'

function useTicktock(delay = 20) {
    const forceUpdate = useForceUpdate()

    useEffect(() => {
        if (delay != null) {
            const timer = setInterval(forceUpdate, delay)
            return () => clearInterval(timer)
        }
    }, [delay])

    return moment()
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
        <VLinear className={styles.container} justify="center" align="center">
            <HLinear className={styles.time} style={timeStyle}>
                <span className={clsx(styles.num)}>{now.format('HH')}</span>
                <span className={styles.sep}>:</span>
                <span className={clsx(styles.num)}>{now.format('mm')}</span>
                <span className={styles.sep}>:</span>
                <span className={clsx(styles.num)}>{now.format('ss')}</span>
            </HLinear>
            <HLinear className={styles.date} style={dateStyle}>
                <span className={clsx(styles.num)}>{now.format('YYYY')}</span>
                <span className={styles.sep}>年</span>
                <span className={clsx(styles.num)}>{now.format('MM')}</span>
                <span className={styles.sep}>月</span>
                <span className={clsx(styles.num)}>{now.format('DD')}</span>
                <span className={styles.sep}>日</span>
                <span className={styles.sep}>　</span>
                <span className={clsx(styles.num)}>{now.format('dddd')}</span>
            </HLinear>
        </VLinear>
    )
}
