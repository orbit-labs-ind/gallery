import { useCallback, useEffect, useState } from 'react'

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.navigator.standalone === true
  )
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Captures Chromium's `beforeinstallprompt` so we can trigger a real PWA install
 * (avoids relying on "shortcut" menu items). iOS has no BIP — use `showIosAddToHomeHint`.
 */
export function usePwaInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [standalone, setStandalone] = useState(() => isStandaloneDisplay())

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const sync = () => setStandalone(isStandaloneDisplay())
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const onBip = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice.catch(() => {})
    setDeferred(null)
  }, [deferred])

  const canUseNativeInstallPrompt = Boolean(deferred)
  const showIosAddToHomeHint = isIosDevice() && !standalone

  return {
    canUseNativeInstallPrompt,
    promptInstall,
    showIosAddToHomeHint,
    isStandalone: standalone,
  }
}
