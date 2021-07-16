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
    case "hwText&photoErr":
      return `Error: there's no homework text & no photo. Please provide a homework text or/and photo.
for example:
    <i>/note 1 Физ-ра взять гачи костюм</i> - notes homework for Monday for 'Физ-ра' subject
    *in photo caption* <i>/note 1 Физ-ра</i> - attaches a photo for Monday for 'Физ-ра' subject
    *in photo caption* <i>/note 1 Физ-ра взять гачи костюм</i> - attaches a photo and text for Monday for 'Физ-ра' subject`;
    case "photoErr":
      return `Error: there's no dayIndex and subjectName. Please provide valid dayIndex and SubjectName in photo caption
for example:
    *in photo caption* <i>/note 1 Физ-ра</i> - attaches a photo for Monday for 'Физ-ра' subject
    *in photo caption* <i>/note 1 Физ-ра взять гачи костюм</i> - attaches a photo and text for Monday for 'Физ-ра' subject`;
    case "help":
      return `<strong>/note *day* *subject* *homework*</strong> - notes homework or/and photo for specific subject
for example:
    <i>/note 1 Физ-ра взять гачи костюм</i> - notes homework for Monday for 'Физ-ра' subject
    *in photo caption* <i>/note 1 Физ-ра</i> - attaches a photo for Monday for 'Физ-ра' subject
    *in photo caption* <i>/note 1 Физ-ра взять гачи костюм</i> - attaches a photo and text for Monday for 'Физ-ра' subject
<strong>/show *day*(optional) *subject*(optional)</strong> - shows homework or/and photo for the day subjects or for the specific subject or all subjects that have homework
for example: 
    <i>/show</i> - shows all subjects for which there's homework
    <i>/show 1</i> - shows homework for Monday
    <i>/show 1 Физ-ра</i> - shows homework for 'Физ-ра' subject with photo
          
<strong>/clear *day* *subject*(optional)</strong> - clears homework for the day or for the soecific subject
for example: 
    <i>/clear 1</i>
    <i>/clear 1 Физ-ра</i>

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
