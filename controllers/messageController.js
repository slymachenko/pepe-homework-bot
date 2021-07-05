exports.responseMessage = (filter, options) => {
  switch (filter) {
    case "dayIndexErr":
      return `Error: wrong dayIndex. Please provide valid dayIndex - num that represents the day of the week.
for example:
    <i>/show 1</i> - shows homework on Monday
    <i>/show 1 Физ-ра</i> - shows homework for 'Физ-ра' subject
    <i>/note 1 Физ-ра взять гачи костюм</i> - notes homework for Monday for 'Физ-ра' subject`;
    case "subjErr":
      return `Error: wrong subject name. Please provide valid subject name - the one that exists on the selected day.
for example:
    <i>/show 1 Физ-ра</i> - shows homework for 'Физ-ра' subject
    <i>/note 1 Физ-ра взять гачи костюм</i> - notes homework for Monday for 'Физ-ра' subject
          
To see subjects on specific day type /show *day*
for example:
    <i>/show 1</i> - shows homework on Monday`;
    case "hwTextErr":
      return `Error: there's no homework text. Please provide a homework text.
for example:
    <i>/note 1 Физ-ра взять гачи костюм</i> - notes homework for Monday for 'Физ-ра' subject`;
    case "help":
      return `<strong>/note *day* *subject* *homework*</strong> - notes homework for specific subject
for example:
    <i>/note 1 Физ-ра взять гачи костюм</i>
<strong>/show *day* *subject*(optional)</strong> - shows homework for the day or for the specific subject
for example: 
    <i>/show 1</i> 
    <i>/show 1 Физ-ра</i>
          
Day Numbers:
1 - Mon
2 - Tue
3 - Wed
4 - Thu
5 - Fri`;
    case "start":
      return `<strong>Hi, ${options.username}!</strong>
<i>My name is PEPE the frog and I will help you deal with this stupid homework!
        
/help for more info</i>`;
  }
};
