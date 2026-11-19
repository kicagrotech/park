/* פרטי קשר וקישורים – מקום אחד לעדכון.
   main.js מחיל אותם על כל הקישורים בעמוד (data-wa / data-tel / data-mail / data-link). */
window.KIC_CONFIG = {
  PHONE_DISPLAY: '052-314-5608',
  PHONE_TEL: 'tel:+972523145608',
  WHATSAPP: 'https://wa.me/972523145608',
  EMAIL: 'office@kic.co.il',
  EMAIL_SUBJECT: 'פנייה מעמוד הנחיתה – פארק KIC',
  KIC_SITE: 'https://www.kinneretinnovation.com/he/kic-park',
  ACCESSIBILITY_URL: '', // TODO: קישור להצהרת הנגישות באתר KIC (ריק = הקישור לא מוצג בתפריט הנגישות)
  VISITOR_CENTER_URL: 'https://www.kinneretinnovation.com/he', // TODO: להחליף בקישור המדויק לעמוד מרכז המבקרים

  /* טופס יצירת קשר – נשלח למייל דרך FormSubmit (בלי חשבון ובלי מפתח).
     בשליחה הראשונה FormSubmit שולח ל-office@kic.co.il מייל אישור – צריך ללחוץ עליו פעם אחת.
     אחרי האישור אפשר להחליף את הכתובת כאן במזהה המוצפן שהם שולחים, כדי שהמייל לא יופיע בקוד. */
  FORM_ENDPOINT: 'https://formsubmit.co/ajax/office@kic.co.il',

  /* אנליטיקס ופיקסל – נטענים רק אחרי הסכמה בבאנר העוגיות (js/consent.js).
     כל עוד שני השדות ריקים: אין סקריפטים של צד שלישי, אין עוגיות, והבאנר לא מוצג. */
  GA4_ID: '',          // TODO: מזהה Google Analytics 4, למשל 'G-XXXXXXXXXX'
  META_PIXEL_ID: '',   // TODO: מזהה Meta Pixel (מספר), למשל '123456789012345'

  /* הודעות וואטסאפ מוכנות */
  WA_PREFIX: 'היי, הגעתי מעמוד הנחיתה של פארק KIC ואשמח ',
  WA_MESSAGES: {
    tour: 'לתאם סיור היכרות',
    quote: 'לבדוק תאריכים ולקבל הצעה',
    contact: 'לשמוע פרטים',
    activity: 'לשמוע על ' // + שם הפעילות (מתוך data-wa-activity)
  }
};
