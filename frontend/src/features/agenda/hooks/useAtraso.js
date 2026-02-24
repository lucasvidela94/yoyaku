import { useState, useEffect } from 'react'

export function useAtraso(atrasoMinutos) {
  const [displayAtraso, setDisplayAtraso] = useState(atrasoMinutos)
  const [color, setColor] = useState('green')

  useEffect(() => {
    setDisplayAtraso(atrasoMinutos)
    
    if (atrasoMinutos <= 0) {
      setColor('green')
    } else if (atrasoMinutos <= 15) {
      setColor('yellow')
    } else {
      setColor('red')
    }
  }, [atrasoMinutos])

  const formatAtraso = () => {
    if (displayAtraso <= 0) {
      return 'A tiempo'
    }
    const horas = Math.floor(displayAtraso / 60)
    const minutos = displayAtraso % 60
    if (horas > 0) {
      return `${horas}h ${minutos}m de atraso`
    }
    return `${minutos} min de atraso`
  }

  return {
    atraso: displayAtraso,
    color,
    label: formatAtraso(),
    isAtrasado: displayAtraso > 0,
  }
}
