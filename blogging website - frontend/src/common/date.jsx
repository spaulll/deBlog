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
    return `${date.getDate()} ${months[date.getMonth()]}`;
}
