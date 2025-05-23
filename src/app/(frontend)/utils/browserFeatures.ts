export const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export const isWebGPUSupported = async (): Promise<boolean> => {
  if (!navigator.gpu) {
    return false
  }
  try {
    const adapter = await navigator.gpu.requestAdapter()
    return !!adapter
  } catch {
    return false
  }
}
