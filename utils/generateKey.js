export const generateKey = (withTime = false) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  
  const hh = String(date.getHours()).padStart(2, "0")
  const mm = String(date.getMinutes()).padStart(2, "0")
  const ss = String(date.getSeconds()).padStart(2, "0")
  
   const uniqueTimeKey = !withTime ?  `${year}${month}${day}` : `${year}${month}${day}-${hh}${mm}${ss}`
   
  return {
    year,
    uniqueTimeKey,
  }
}