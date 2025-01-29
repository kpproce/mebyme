export function dateToTxt (date) {
    let jaar =  date.getFullYear()
    let maand = date.getMonth() + 1
    let dag =   date.getDate() 
    if (maand<10) maand = "0" + maand
    if (dag<10) dag  = "0" + dag
    // console.log('82: deltaDays: ' + deltaDays + ' changedData: ' + (jaar + '-' + maand + '-' + dag))

    return (jaar + '-' + maand + '-' + dag) 
  }

export function get_changedDate_asTxt(dateNow_txt, deltaDays) {     
  const newDate = new Date (dateNow_txt)
  newDate.setDate(newDate.getDate() + deltaDays)
  return dateToTxt(newDate)
}

export const getLastDateOfDutchWeek = (weekString) => {
  const [year, week] = weekString.split('_').map(Number);

  // Eerste dag van het jaar
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Vind de eerste maandag van het jaar
  const firstMonday = new Date(firstDayOfYear);
  firstMonday.setDate(firstDayOfYear.getDate() + ((1 - firstDayOfYear.getDay() + 7) % 7));

  // Bereken de laatste dag van de opgegeven week
  const lastDayOfWeek = new Date(firstMonday);
  lastDayOfWeek.setDate(firstMonday.getDate() + (week * 7));

  return lastDayOfWeek.toISOString().split('T')[0]; // Format YYYY-MM-DD

};

