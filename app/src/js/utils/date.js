// Provided a string like YY-MM-DD_HH:MM:SS, return a `Date` object
export default function getDate(dateStr){
    // Split the string into date and time parts
    const [datePart, timePart] = dateStr.split("_");

    // Extract individual components from date and time
    const [year, month, day] = datePart.split("-");
    const [hours, minutes, seconds] = timePart.split(":");

    return new Date(year, month - 1, day, hours, minutes, seconds);
}