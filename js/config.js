/* פרטי קשר וקישורים – מקום אחד לעדכון.
   main.js מחיל אותם על כל הקישורים בעמוד (data-wa / data-tel / data-mail / data-link). */
window.KIC_CONFIG = {
  PHONE_DISPLAY: '052-314-5608',
  PHONE_TEL: 'tel:+972523145608',
  WHATSAPP: 'https://wa.me/972523145608',
  EMAIL: 'office@kic.co.il',
  EMAIL_SUBJECT: 'פנייה מעמוד הנחיתה – פארק KIC',
  KIC_SITE: 'https://www.kinneretinnovation.com/he/kic-park',
  VISITOR_CENTER_URL: 'https://www.kinneretinnovation.com/he', // TODO: להחליף בקישור המדויק לעמוד מרכז המבקרים

  /* הודעות וואטסאפ מוכנות */
  WA_PREFIX: 'היי, הגעתי מעמוד הנחיתה של פארק KIC ואשמח ',
  WA_MESSAGES: {
    tour: 'לתאם סיור היכרות',
    quote: 'לבדוק תאריכים ולקבל הצעה',
    contact: 'לשמוע פרטים',
    activity: 'לשמוע על ' // + שם הפעילות (מתוך data-wa-activity)
  }
};
