import { Msg } from '../types';

/** CEO paneli: umumiy, so'rovlar, to'lovlar, ownerlar, foydalanuvchilar. */
export const ceo = {
  // Umumiy
  'ceo.overview': ['Umumiy', 'Overview'],
  'ceo.overviewSub': ['Platforma holati bir qarashda.', 'The platform at a glance.'],
  'ceo.card.owners': ['Ownerlar', 'Owners'],
  'ceo.card.ownersSub': ['faol biznes', 'active businesses'],
  'ceo.card.pending': ['Kutayotgan', 'Pending'],
  'ceo.card.pendingSub': ['so‘rov', 'requests'],
  'ceo.card.users': ['Foydalanuvchilar', 'Users'],
  'ceo.card.usersSub': ['jami hisob', 'accounts in total'],
  'ceo.card.workers': ['Ishchilar', 'Employees'],
  'ceo.card.workersSub': ['a’zo', 'members'],

  // Biznes holati / turi
  'bizStatus.ACTIVE': ['Faol', 'Active'],
  'bizStatus.PENDING': ['Kutmoqda', 'Pending'],
  'bizStatus.REJECTED': ['Rad etilgan', 'Rejected'],
  'kind.BOTH': ['🌲🪵 Yog‘och+Taxta', '🌲🪵 Timber+Lumber'],
  'kind.WOOD_ONLY': ['🌲 Yog‘och', '🌲 Timber'],
  'kind.LUMBER_ONLY': ['🪵 Taxta', '🪵 Lumber'],
  'kindOpt.BOTH': ['Yog‘och + Taxta', 'Timber + Lumber'],
  'kindOpt.WOOD_ONLY': ['Faqat Yog‘och', 'Timber only'],
  'kindOpt.LUMBER_ONLY': ['Faqat Taxta', 'Lumber only'],
  'kindHint.two': ['ikkala makon', 'both workspaces'],
  'kindHint.one': ['bitta makon', 'one workspace'],
  'ceoRole.CEO': ['CEO', 'CEO'],
  'ceoRole.Owner': ['Owner', 'Owner'],
  'ceoRole.Ishchi': ['Ishchi', 'Employee'],

  // Billing nishoni
  'billing.free': ['🎁 Tekin', '🎁 Free'],
  'billing.blocked': ['🔒 Bloklangan', '🔒 Locked'],
  'billing.paidUntil': ['✓ {date}', '✓ {date}'],

  // So'rovlar
  'ceo.req.title': ['🔔 So‘rovlar', '🔔 Requests'],
  'ceo.req.sub': [
    'Yangi biznes ochish so‘rovlari — siz tasdiqlaysiz.',
    'New business requests — you approve them.',
  ],
  'ceo.req.list': ['Kutilayotgan so‘rovlar ({n})', 'Pending requests ({n})'],
  'ceo.req.empty': ['Hozircha yangi so‘rov yo‘q 🎉', 'No new requests 🎉'],
  'ceo.req.approved': [
    '«{name}» tasdiqlandi — makon(lar) ochildi.',
    '“{name}” approved — the workspaces are now open.',
  ],
  'ceo.req.rejected': ['«{name}» rad etildi.', '“{name}” was rejected.'],

  // To'lovlar
  'ceo.pay.title': ['💳 To‘lovlar', '💳 Payments'],
  'ceo.pay.sub': [
    'Ownerlarning platforma to‘lovlari — tasdiqlasangiz obuna uzayadi.',
    'Owner subscription payments — approving one extends their subscription.',
  ],
  'ceo.pay.list': ['Kutilayotgan to‘lovlar ({n})', 'Pending payments ({n})'],
  'ceo.pay.empty': ['Kutilayotgan to‘lov yo‘q 🎉', 'No pending payments 🎉'],
  'ceo.pay.approved': [
    '«{name}» — {months} oylik to‘lov tasdiqlandi, obuna uzaytirildi.',
    '“{name}” — {months}-month payment approved, subscription extended.',
  ],
  'ceo.pay.rejected': ['«{name}» to‘lovi rad etildi.', '“{name}”’s payment was rejected.'],
  'ceo.months': ['· {n} oy', '· {n} months'],

  // Foydalanuvchilar
  'ceo.users.title': ['👥 Foydalanuvchilar', '👥 Users'],
  'ceo.users.sub': [
    'Platformadagi barcha hisoblar. Batafsil uchun ustiga bosing.',
    'Every account on the platform. Click one for details.',
  ],
  'ceo.users.count': ['Foydalanuvchilar ({n})', 'Users ({n})'],
  'ceo.users.searchPh': [
    '🔍 Ism, telefon yoki biznes…',
    '🔍 Name, phone or business…',
  ],
  'ceo.users.noMatch': ['Hech nima topilmadi.', 'Nothing found.'],
  'ceo.users.empty': ['Foydalanuvchi yo‘q.', 'No users.'],
  'ceo.users.back': ['← Foydalanuvchilar', '← Users'],
  'ceo.users.platformRole': ['Platforma roli', 'Platform role'],
  'ceo.users.business': ['Biznesi', 'Business'],
  'ceo.users.since': ['Ro‘yxatdan', 'Registered'],
  'ceo.users.memberships': [
    'Makon a’zoliklari ({n})',
    'Workspace memberships ({n})',
  ],
  'ceo.users.noMemberships': [
    'Hech qanday makonga a’zo emas.',
    'Not a member of any workspace.',
  ],

  // Ownerlar
  'ceo.own.title': ['👑 Ownerlar', '👑 Owners'],
  'ceo.own.sub': [
    'Biznes egalari — qo‘shish, tahrirlash, obuna va o‘chirish.',
    'Business owners — add, edit, manage subscriptions and delete.',
  ],
  'ceo.own.count': ['Ownerlar ({n})', 'Owners ({n})'],
  'ceo.own.add': ['+ Owner qo‘shish', '+ Add owner'],
  'ceo.own.empty': ['Hali owner yo‘q.', 'No owners yet.'],
  'ceo.own.f.name': ['Owner ismi', 'Owner name'],
  'ceo.own.f.namePh': ['Ism Familiya', 'First and last name'],
  'ceo.own.f.phone': ['Telefon (login)', 'Phone (login)'],
  'ceo.own.f.phonePh': ['+998 90 123 45 67', '+998 90 123 45 67'],
  'ceo.own.f.password': ['Boshlang‘ich parol', 'Initial password'],
  'ceo.own.f.passwordPh': ['kamida 4 belgi', 'at least 4 characters'],
  'ceo.own.f.bizName': ['Biznes nomi', 'Business name'],
  'ceo.own.f.bizNamePh': ['Masalan: Adam Yog‘och', 'For example: Adam Timber'],
  'ceo.own.f.kind': ['Biznes turi', 'Business type'],
  'ceo.own.f.newPassword': [
    'Yangi parol (bo‘sh = o‘zgarmaydi)',
    'New password (blank = unchanged)',
  ],
  'ceo.own.f.newPasswordPh': ['•••• (ixtiyoriy)', '•••• (optional)'],
  'ceo.own.fillAll': ['Barcha maydonlarni to‘ldiring.', 'Fill in every field.'],
  'ceo.own.creating': ['Yaratilmoqda…', 'Creating…'],
  'ceo.own.create': ['Owner yaratish', 'Create owner'],
  'ceo.own.created': [
    '«{name}» yaratildi — owner darhol kira oladi.',
    '“{name}” created — the owner can sign in right away.',
  ],
  'ceo.own.deleteWarn': ['Barcha ma’lumot yo‘qoladi!', 'All data will be lost!'],
  'ceo.own.deleteYes': ['Ha, o‘chir', 'Yes, delete'],
  'ceo.own.deleting': ['O‘chirilmoqda…', 'Deleting…'],
  'ceo.own.deleted': [
    '«{name}» va barcha ma’lumoti o‘chirildi.',
    '“{name}” and all of its data have been deleted.',
  ],
  'ceo.own.deleteError': ['O‘chirishda xato.', 'Delete failed.'],
  'ceo.own.grantOn': ['«{name}» — tekin ruxsat berildi.', '“{name}” — free access granted.'],
  'ceo.own.grantOff': [
    '«{name}» — tekin ruxsat olib tashlandi.',
    '“{name}” — free access removed.',
  ],
  'ceo.own.grantTitleOn': ['Tekin ruxsatni olib tashlash', 'Remove free access'],
  'ceo.own.grantTitleOff': ['Tekin ruxsat berish', 'Grant free access'],
  'ceo.own.editTitle': ['Tahrirlash', 'Edit'],
  'ceo.own.deleteTitle': ['O‘chirish', 'Delete'],
  'ceo.own.editRequired': [
    'Ism, telefon va biznes nomi bo‘sh bo‘lmasin.',
    'Name, phone and business name cannot be empty.',
  ],
  'ceo.own.updated': ['«{name}» yangilandi.', '“{name}” has been updated.'],
  'ceo.own.updateError': ['Yangilashda xato.', 'Update failed.'],

  // Owner tafsiloti
  'ceo.own.back': ['← Ownerlar', '← Owners'],
  'ceo.own.d.workspaces': ['Makonlar', 'Workspaces'],
  'ceo.own.d.employees': ['Ishchilar', 'Employees'],
  'ceo.own.d.payments': ['To‘lovlar', 'Payments'],
  'ceo.own.d.opened': ['Ochilgan', 'Opened'],
  'ceo.own.d.subscription': ['Obuna', 'Subscription'],
  'ceo.own.d.freeOn': ['🎁 Tekin ruxsat: YOQILGAN', '🎁 Free access: ON'],
  'ceo.own.d.freeOff': ['🎁 Tekin ruxsat berish', '🎁 Grant free access'],
  'ceo.own.d.freeText': [
    'Tekin ruxsat faol — to‘lovsiz ishlaydi.',
    'Free access is active — no payment required.',
  ],
  'ceo.own.d.blockedText': [
    'Obuna tugagan — platforma bloklangan.',
    'Subscription expired — the platform is locked.',
  ],
  'ceo.own.d.activeText': [
    'Obuna {date} gacha faol.',
    'Subscription active until {date}.',
  ],
  'ceo.own.d.noneText': ['Hali to‘lov qilinmagan.', 'No payment yet.'],
  'ceo.own.d.wsWood': ['Yog‘och sotuvi', 'Timber trading'],
  'ceo.own.d.wsLumber': ['Taxta sotuvi', 'Lumber production'],
  'ceo.own.d.payHistory': ['To‘lovlar tarixi ({n})', 'Payment history ({n})'],
  'ceo.own.d.payEmpty': ['Hali to‘lov yo‘q.', 'No payments yet.'],
} as const satisfies Record<string, Msg>;
