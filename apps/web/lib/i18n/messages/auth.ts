import { Msg } from '../types';

/** Login, Signup, makon tanlash va kutish ekranlari. */
export const auth = {
  'auth.login.title': ['Xush kelibsiz 👋', 'Welcome back 👋'],
  'auth.login.sub': [
    'Hisobingizga kiring va ishni davom ettiring.',
    'Sign in to your account and pick up where you left off.',
  ],
  'auth.phone': ['Telefon raqam', 'Phone number'],
  'auth.password': ['Parol', 'Password'],
  'auth.show': ['Ko‘rsatish', 'Show'],
  'auth.hide': ['Yashirish', 'Hide'],
  'auth.login.error': [
    'Kirishda xato. Qayta urinib ko‘ring.',
    'Sign-in failed. Please try again.',
  ],
  'auth.login.submitting': ['Kirilmoqda…', 'Signing in…'],
  'auth.login.submit': ['Kirish', 'Log in'],
  'auth.noAccount': ['Hisobingiz yo‘qmi?', 'Don’t have an account?'],
  'auth.hasAccount': ['Hisobingiz bormi?', 'Already have an account?'],
  'auth.signupLink': ['Ro‘yxatdan o‘tish', 'Sign up'],
  'auth.loginLink': ['Kirish', 'Log in'],

  'auth.signup.title': ['Hisob yaratish', 'Create an account'],
  'auth.signup.sub': [
    'Avval kim sifatida kirishingizni tanlang.',
    'First, choose how you’re joining.',
  ],
  'auth.role.owner.title': ['Biznes egasi', 'Business owner'],
  'auth.role.owner.desc': [
    'O‘z biznesingizni ochasiz — CEO tasdig‘idan so‘ng makon(lar) tayyor bo‘ladi.',
    'Open your own business — workspaces are ready once the CEO approves.',
  ],
  'auth.role.worker.title': ['Ishchi', 'Employee'],
  'auth.role.worker.desc': [
    'Biznesga ishchi sifatida qo‘shilasiz — egangiz tasdiqlagach kirasiz.',
    'Join an existing business as an employee — you’re in once the owner approves.',
  ],

  'auth.kind.both.title': ['Yog‘och + Taxta', 'Timber + Lumber'],
  'auth.kind.both.desc': [
    'Ikkala makon, ichki transfer bilan',
    'Both workspaces, with internal transfers',
  ],
  'auth.kind.wood.title': ['Faqat Yog‘och sotuvi', 'Timber trading only'],
  'auth.kind.wood.desc': ['Bitta makon — yog‘och savdosi', 'One workspace — timber trading'],
  'auth.kind.lumber.title': ['Faqat Taxta sotuvi', 'Lumber production only'],
  'auth.kind.lumber.desc': [
    'Bitta makon — taxta ishlab chiqarish',
    'One workspace — lumber production',
  ],

  'auth.fullName': ['Ism familiya', 'Full name'],
  'auth.fullNamePh': ['Otabek Juraev', 'Otabek Juraev'],
  'auth.businessName': ['Biznes nomi', 'Business name'],
  'auth.businessNamePh': ['Masalan: Premium Wood', 'For example: Premium Wood'],
  'auth.businessKind': ['Biznes turi', 'Business type'],
  'auth.passwordPh': ['Kamida 6 belgi', 'At least 6 characters'],
  'auth.confirmPassword': ['Parolni tasdiqlang', 'Confirm password'],
  'auth.confirmPh': ['Qayta kiriting', 'Type it again'],
  'auth.mismatch': ['Parollar mos kelmadi.', 'Passwords don’t match.'],
  'auth.signup.error': [
    'Ro‘yxatdan o‘tishda xato. Qayta urinib ko‘ring.',
    'Sign-up failed. Please try again.',
  ],
  'auth.signup.creating': ['Yaratilmoqda…', 'Creating…'],
  'auth.signup.asOwner': ['Biznes ochish', 'Open a business'],
  'auth.signup.asWorker': ['Ishchi sifatida qo‘shilish', 'Join as an employee'],

  'auth.picker.title': ['Qaysi biznesga kirasiz?', 'Which business are you entering?'],
  'auth.picker.sub': [
    'Keyin istalgan payt bir bosishda almashtira olasiz.',
    'You can switch any time with a single click.',
  ],
  'auth.picker.wood': ['Import · ombor · fura foydasi', 'Imports · stock · truck P&L'],
  'auth.picker.lumber': [
    'Ishlab chiqarish · tayyor mahsulot',
    'Production · finished goods',
  ],

  // Kutish ekrani
  'wait.CEO_APPROVAL.title': ['CEO tasdig‘i kutilmoqda', 'Waiting for CEO approval'],
  'wait.CEO_APPROVAL.desc': [
    'Biznesingiz so‘rovi yuborildi. CEO tasdiqlagach, ikkala biznes makoningiz avtomatik ochiladi.',
    'Your business request has been submitted. Once the CEO approves, your workspaces open automatically.',
  ],
  'wait.OWNER_APPROVAL.title': [
    'Egangiz tasdig‘i kutilmoqda',
    'Waiting for your owner’s approval',
  ],
  'wait.OWNER_APPROVAL.desc': [
    'So‘rovingiz biznes egasiga yuborildi. Tasdiqlangach ishchi sifatida kirasiz.',
    'Your request went to the business owner. You’ll get in as an employee once it’s approved.',
  ],
  'wait.WAITING_EMPLOYEE.title': [
    'Egangiz sizni hali qo‘shmagan',
    'Your owner hasn’t added you yet',
  ],
  'wait.WAITING_EMPLOYEE.desc': [
    'Biznes egasiga ayting — u sizni «Ishchilar» bo‘limida telefon raqamingiz bilan qo‘shsin. Shundan so‘ng bu yerda so‘rov paydo bo‘ladi.',
    'Ask the business owner to add you by phone number under “Employees”. Your request will show up here right after.',
  ],
  'wait.REJECTED.title': ['So‘rov rad etildi', 'Request rejected'],
  'wait.REJECTED.desc': [
    'Afsuski, biznes ochish so‘rovingiz rad etildi. Savollar bo‘lsa administratsiya bilan bog‘laning.',
    'Unfortunately your business request was rejected. Contact the administrators if you have questions.',
  ],
  'wait.check': ['Holatni tekshirish', 'Check status'],
  'wait.checking': ['Tekshirilmoqda…', 'Checking…'],
} as const satisfies Record<string, Msg>;
