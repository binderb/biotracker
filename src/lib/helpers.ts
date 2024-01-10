export function getFormattedDate (datestring:Date) {
  const date = new Date(datestring);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLocaleLowerCase().replace(/ /,'')}`
}

export function getFormattedDateNoTime (dateString:string) {
  const date = new Date(parseInt(dateString));
  return `${date.toLocaleDateString()}`;
}