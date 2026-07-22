import { useState, useEffect } from "react"

export function usePlayerSettings() {
  const [playbackRate, setPlaybackRate] = useState(1)
  const [subSize, setSubSize] = useState(() =>
    parseInt(localStorage.getItem("amov_sub_size") || "24")
  )
  const [subBg, setSubBg] = useState(() => {
    const val = localStorage.getItem("amov_sub_bg")
    if (val === "rgba(0,0,0,0.75)") return "transparent"
    return val || "transparent"
  })
  const [subFont, setSubFont] = useState(() => {
    const val = localStorage.getItem("amov_sub_font")
    if (val === "var(--font-inter), sans-serif")
      return '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    return (
      val || '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    )
  })
  const [subLh, setSubLh] = useState(() =>
    parseFloat(localStorage.getItem("amov_sub_lh") || "1.2")
  )
  const [subOffset, setSubOffset] = useState(() =>
    parseFloat(localStorage.getItem("amov_sub_offset") || "0")
  )
  const [subMargin, setSubMargin] = useState(() =>
    parseInt(localStorage.getItem("amov_sub_margin") || "40")
  )

  // Persist settings
  useEffect(() => {
    localStorage.setItem("amov_sub_size", subSize.toString())
    localStorage.setItem("amov_sub_bg", subBg)
    localStorage.setItem("amov_sub_font", subFont)
    localStorage.setItem("amov_sub_lh", subLh.toString())
    localStorage.setItem("amov_sub_offset", subOffset.toString())
    localStorage.setItem("amov_sub_margin", subMargin.toString())
  }, [subSize, subBg, subFont, subLh, subOffset, subMargin])

  return {
    playbackRate,
    setPlaybackRate,
    subSize,
    setSubSize,
    subBg,
    setSubBg,
    subFont,
    setSubFont,
    subLh,
    setSubLh,
    subOffset,
    setSubOffset,
    subMargin,
    setSubMargin,
  }
}
