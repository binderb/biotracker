export function getFormattedDate (dateString:string) {
  const date = new Date(parseInt(dateString));
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLocaleLowerCase().replace(/ /,'')}`
}