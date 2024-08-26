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
