import { DependencyList, useEffect, useRef } from 'react'

interface NotificationOptions {
    title: string
    sound: string
}

function useNotificationSound() {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    function createAudio() {
        const audio = document.createElement('audio')
        document.body.appendChild(audio)
        audioRef.current = audio
    }

    function destoryAudio() {
        audioRef.current?.remove()
    }

    function play(src: string) {
        const audio = audioRef.current

        if (audio) {
            if (audio.src !== src) {
                audio.src = src
                audio.load()
            }

            audio.play()
        }
    }

    useEffect(() => {
        createAudio()
        return destoryAudio
    }, [])

    return { play }
}

export default function useNotification(
    callback: () => NotificationOptions | undefined | void,
    deps?: DependencyList,
) {
    const sound = useNotificationSound()

    useEffect(() => {
        const notification = callback()

        if (notification) {
            Notification.requestPermission(function (status) {
                new Notification(notification.title)
                sound.play(notification.sound)
            })
        }
    }, deps)
}
