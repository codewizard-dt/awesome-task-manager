const storedData = localStorage.getItem('eventData')
let eventData = storedData
  ? JSON.parse(storedData)
  : { 8: '', 9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '', 16: '', 17: '', 18: '' }
if (localStorage.getItem('eventData')) {
  eventData = JSON.parse(localStorage.getItem('eventData'))
}

/** Global reference to current hour */
let currentHour = moment().hour()

/**
 * Updates the display at the top of the page
 * Updates the rows as well when the hour changes
 */
function setTime() {
  $('#today').text(moment().format('LLL'))
  /** Gets the current hour */
  let hour = moment().hour()
  /** Display a message if the current time is outside of the 8am-7pm */
  if (hour > 18) $('#today').append(`<p class='text-danger'>Take a break! It's a little late...</p>`)
  else if (hour < 8) $('#today').append(`<p class='text-danger'>Early bird gets the worm! Good for you!</p>`)
  /** Updates the row classes when the hour changes */
  if (hour !== currentHour) {
    currentHour = hour
    $('.row').each((r, row) => {
      adjustRowClass($(row))
    })
  }
}
/** Sets the initial clock display */
setTime()
/** Updates the clock display every minute */
setInterval(setTime, 1000 * 60);

/**
 * Updates all the text in the row
 * @param {object} row jQuery row
 * @param {number} hour the hour (in 24 hr time)
 * @param {string} text the task data for the given hour
 */
function updateRowDisplay(row, hour, text) {
  adjustRowClass(row, hour)
  row.find('.display').text(text)
  row.find('textarea').val(text)
}
/**
 * 
 * @param {object} row jQuery row
 * @param {number} hour the hour (in 24 hr time)
 */
function adjustRowClass(row, hour) {
  if (!hour) hour = row.data('hour')
  row.removeClass('present future')
  if (currentHour == hour) row.addClass('present')
  else if (currentHour < hour) row.addClass('future')
}

/** Updates existing html row (8am) */
let firstRow = $('.row').data({ hour: 8 })
updateRowDisplay(firstRow, 8, eventData[8])
/** 
 * Creates additional rows using first row as template */
for (let hour = 9; hour < 19; hour++) {
  let last = $('.row').last()
  let next = last.clone().data({ hour }).insertAfter(last)
  next.find('.time-col').text(moment(hour, 'HH').format('ha'))
  updateRowDisplay(next, hour, eventData[hour])
}

/**
 * Saves row data and updates display buttons
 * @param {object} row jQuery row
 */
function saveRow(row) {
  updateLocalStorage(row.data())
  row.find('.save-col').find('button').addClass('disabled')
}

/**
 * Sets local storage
 * @param {object} data row data
 */
function updateLocalStorage({ hour, text }) {
  eventData[hour] = text
  localStorage.setItem('eventData', JSON.stringify(eventData))
}

/**
 * Event listeners for textarea
 * blur - hides input element, shows display element, updates data
 */
$('.event-data-col').find('textarea').on('blur', function () {
  const row = $(this).closest('.row'), text = $(this).val()
  row.data({ text })
  $(this).hide()
  $(this).prev('.display').show().text(text)
  saveRow(row)
}).on('keyup', function (ev) {
  $(this).closest('.row').find('.save-col').find('button').removeClass('disabled')
  /** 
   * `Enter + option` moves to next textarea
   * `Enter + option + shift` moves to previous textarea
   *  */
  let { key, altKey, shiftKey } = ev
  console.log(ev)
  if (key === 'Enter' && altKey) {
    ev.preventDefault()
    /** Triggers blur event which saves row data */
    $(this).blur()
    /** Determines which direction to move focus */
    const row = shiftKey
      ? $(this).closest('.row').prev('.row')
      : $(this).closest('.row').next('.row')
    row.length ? row.find('.display').click() : $('.row').first().find('.display').click()
  }
})
/**
 * Event listeners for event-data-col
 * click - show input element, hide display element
 */
$('.event-data-col').on('click', function () {
  $(this).find('.display').hide()
  $(this).find('textarea').show().focus()
})
/**
 * Event listeners for save button
 */
$('.save-col').find('button').on('click', function () {
  if ($(this).hasClass('disabled')) return
  saveRow($(this).closest('.row'))
})