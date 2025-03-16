
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const SMALL_SCREEN_BREAKPOINT = 640
const EXTRA_SMALL_BREAKPOINT = 480

type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

export function useDeviceSize() {
  const [deviceSize, setDeviceSize] = React.useState<{
    isMobile: boolean;
    isTablet: boolean;
    isSmallScreen: boolean;
    isExtraSmall: boolean;
    deviceType: DeviceType;
  }>({
    isMobile: false,
    isTablet: false,
    isSmallScreen: false,
    isExtraSmall: false,
    deviceType: 'desktop'
  })

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const isExtraSmall = width < EXTRA_SMALL_BREAKPOINT
      const isSmallScreen = width < SMALL_SCREEN_BREAKPOINT
      const isMobile = width < MOBILE_BREAKPOINT
      const isTablet = width < TABLET_BREAKPOINT && width >= MOBILE_BREAKPOINT
      
      let deviceType: DeviceType = 'desktop'
      
      if (isMobile) {
        deviceType = 'mobile'
      } else if (isTablet) {
        deviceType = 'tablet'
      }
      
      setDeviceSize({
        isMobile,
        isTablet,
        isSmallScreen,
        isExtraSmall,
        deviceType
      })
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceSize
}
