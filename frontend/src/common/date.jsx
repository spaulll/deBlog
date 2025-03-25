let months = [
  "Jan",
  "Feb",
  "Mar",
  "Apri",
  "May",
  "June",
  "Jully",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const getDay= (timeStamp)=>{
    let date = new Date(timeStamp);
    return `${date.getDate()} ${months[date.getMonth()]} , ${String(date.getHours() % 12 || 12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
}

export const getFullDay=( timeStamp)=>{
let date = new Date(timeStamp);
return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

}