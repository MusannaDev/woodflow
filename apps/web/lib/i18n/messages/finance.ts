import { Msg } from '../types';

/** Xarajatlar va to'lovlar/qarzlar sahifalari. */
export const finance = {
  // Xarajat kategoriyalari
  'exp.cat.SALARY': ['Oylik', 'Payroll'],
  'exp.cat.GAS': ['Gaz', 'Gas'],
  'exp.cat.ELECTRICITY': ['Svet', 'Electricity'],
  'exp.cat.WATER': ['Suv', 'Water'],
  'exp.cat.TAX': ['Soliq', 'Tax'],
  'exp.cat.EQUIPMENT': ['Apparat', 'Equipment'],
  'exp.cat.FOOD': ['Ovqat', 'Food'],
  'exp.cat.TRANSPORT': ['Transport', 'Transport'],
  'exp.cat.OTHER': ['Boshqa', 'Other'],

  'exp.title': ['Xarajatlar', 'Expenses'],
  'exp.recent': ['So‘nggi xarajatlar', 'Recent expenses'],
  'exp.empty': ['Hozircha xarajat yo‘q.', 'No expenses yet.'],
  'exp.sharedTag': ['Umumiy', 'Shared'],
  'exp.new': ['+ Yangi xarajat', '+ New expense'],
  'exp.category': ['Kategoriya', 'Category'],
  'exp.amount': ['Summa (so‘m)', 'Amount (UZS)'],
  'exp.amountPh': ['320 000', '320,000'],
  'exp.descPh': ['Svet to‘lovi', 'Electricity bill'],
  'exp.sharedLabel': ['Umumiy xarajat', 'Shared expense'],
  'exp.sharedHint': [
    'Ikkala biznesga tegishli — hisobotda teng taqsimlanadi',
    'Belongs to both businesses — split evenly in reports',
  ],
  'exp.enterAmount': ['Summani kiriting.', 'Enter an amount.'],
  'exp.saved': [
    '{cat} — {amount} so‘m yozildi{shared}.',
    '{cat} — {amount} UZS recorded{shared}.',
  ],
  'exp.savedShared': [
    ' (umumiy, ikki biznesga taqsimlanadi)',
    ' (shared, split across both businesses)',
  ],
  'exp.submit': ['Xarajatni yozish', 'Record expense'],

  // To'lovlar / qarzlar
  'pay.title': ['To‘lovlar / Qarzlar', 'Payments / Receivables'],
  'pay.totalDebt': ['JAMI QARZ', 'TOTAL DEBT'],
  'pay.debtSales': ['QARZDOR SAVDOLAR', 'SALES WITH DEBT'],
  'pay.count': ['ta', 'items'],
  'pay.debtList': ['Qarzli savdolar', 'Sales with outstanding debt'],
  'pay.noDebt': [
    'Qarz yo‘q — hammasi to‘langan 🎉',
    'No debt — everything is paid 🎉',
  ],
  'pay.unnamed': ['Nomsiz mijoz', 'Unnamed customer'],
  'pay.rowMeta': [
    '{date} · jami {total} · to‘langan {paid}',
    '{date} · total {total} · paid {paid}',
  ],
  'pay.debtAmount': ['qarz {amount}', 'debt {amount}'],
  'pay.accept': ['To‘lov qabul qilish', 'Record payment'],
  'pay.amount': ['Summa', 'Amount'],
  'pay.currency': ['Valyuta', 'Currency'],
  'pay.rate': ['Kurs (1 USD = ? so‘m)', 'Rate (1 USD = ? UZS)'],
  'pay.submit': ['Qabul qilish', 'Accept'],
  'pay.needAmount': [
    'Summa (va USD uchun kurs) kiriting.',
    'Enter an amount (and a rate for USD).',
  ],
  'pay.tooMuch': [
    'To‘lov ({paid} so‘m) qarzdan ({debt} so‘m) oshib ketdi.',
    'The payment ({paid} UZS) exceeds the debt ({debt} UZS).',
  ],
  'pay.doneUsd': [
    '{amount} USD (kurs {rate}) = {uzs} so‘m qabul qilindi.',
    '{amount} USD (rate {rate}) = {uzs} UZS received.',
  ],
  'pay.doneUzs': ['{amount} so‘m qabul qilindi.', '{amount} UZS received.'],
  'pay.paidList': ['To‘langan savdolar', 'Settled sales'],
  'pay.paidEmpty': ['Hozircha yo‘q.', 'Nothing yet.'],
  'pay.paidMeta': ['{date} · {n} to‘lov', '{date} · {n} payments'],
  'pay.hasUsd': [' (USD bor)', ' (includes USD)'],
} as const satisfies Record<string, Msg>;

/** Oylik (payroll) sahifasi. */
export const payroll = {
  'sal.title': ['Oylik', 'Payroll'],
  'sal.sub': [
    'Oylik to‘lang — ishchi «qabul qildim» deb tasdiqlaydi.',
    'Pay a salary — the employee confirms with “received”.',
  ],
  'sal.employee': ['Ishchi', 'Employee'],
  'sal.pickEmployee': ['— tanlang —', '— select —'],
  'sal.amount': ['Summa (so‘m)', 'Amount (UZS)'],
  'sal.period': ['Davr', 'Period'],
  'sal.paying': ['To‘lanmoqda…', 'Paying…'],
  'sal.pay': ['To‘lash', 'Pay'],
  'sal.needEmployee': ['Ishchini tanlang.', 'Select an employee.'],
  'sal.needAmount': ['Summani kiriting.', 'Enter an amount.'],
  'sal.paid': [
    'Oylik to‘landi ({period}) — ishchi tasdiqlashini kuting.',
    'Salary paid ({period}) — waiting for the employee to confirm.',
  ],
  'sal.history': ['To‘lovlar tarixi ({n})', 'Payment history ({n})'],
  'sal.empty': ['Hali oylik to‘lanmagan.', 'No salaries paid yet.'],
  'sal.col.employee': ['ISHCHI', 'EMPLOYEE'],
  'sal.col.period': ['DAVR', 'PERIOD'],
  'sal.col.amount': ['SUMMA', 'AMOUNT'],
  'sal.col.date': ['SANA', 'DATE'],
  'sal.col.status': ['HOLAT', 'STATUS'],
  'salStatus.PENDING': ['⏳ Kutilmoqda', '⏳ Pending'],
  'salStatus.CONFIRMED': ['✓ Qabul qilindi', '✓ Confirmed'],

  'sal.myTitle': ['Mening oyliklarim', 'My salaries'],
  'sal.mySub': [
    'Oylik berilganda «Qabul qildim» deb tasdiqlang.',
    'Confirm with “Received” once a salary is paid.',
  ],
  'sal.pendingCount': [
    '{n} ta tasdiq kutmoqda.',
    '{n} awaiting your confirmation.',
  ],
  'sal.myEmpty': ['Hali oylik yo‘q.', 'No salaries yet.'],
  'sal.confirming': ['Tasdiqlanmoqda…', 'Confirming…'],
  'sal.confirm': ['✓ Qabul qildim', '✓ Received'],
  'sal.confirmed': ['Oylik qabul qilindi — rahmat!', 'Salary confirmed — thank you!'],
} as const satisfies Record<string, Msg>;

/** Ishchilar sahifasi. */
export const employees = {
  'emp.title': ['Ishchilar', 'Employees'],
  'emp.requests': ['🔔 Kirish so‘rovlari', '🔔 Access requests'],
  'emp.reqEmployee': [' · ishchi yozuvi: {name}', ' · employee record: {name}'],
  'emp.approve': ['✓ Tasdiqlash', '✓ Approve'],
  'emp.reject': ['✕ Rad etish', '✕ Reject'],
  'emp.approved': [
    '{name} tasdiqlandi — endi ishchi sifatida kira oladi.',
    '{name} approved — they can now sign in as an employee.',
  ],
  'emp.rejected': ['{name} so‘rovi rad etildi.', '{name}’s request was rejected.'],
  'emp.empty': ['Hozircha ishchi yo‘q.', 'No employees yet.'],
  'emp.col.employee': ['ISHCHI', 'EMPLOYEE'],
  'emp.col.position': ['LAVOZIM', 'POSITION'],
  'emp.col.salary': ['MAOSH', 'SALARY'],
  'emp.col.action': ['AMAL', 'ACTION'],
  'emp.sharedTag': ['Umumiy', 'Shared'],
  'emp.paySalary': ['Oylik to‘lash', 'Pay salary'],
  'emp.periodYm': ['Davr (YYYY-MM)', 'Period (YYYY-MM)'],
  'emp.paid': [
    '{name}ga {amount} so‘m oylik to‘landi ({period}) — avtomatik «Oylik» xarajatiga yozildi.',
    'Paid {amount} UZS to {name} ({period}) — automatically recorded as a “Payroll” expense.',
  ],
  'emp.new': ['+ Yangi ishchi', '+ New employee'],
  'emp.namePh': ['Akmal', 'Akmal'],
  'emp.position': ['Lavozim', 'Position'],
  'emp.positionPh': ['Omborchi', 'Warehouse keeper'],
  'emp.salary': ['Maosh (so‘m)', 'Salary (UZS)'],
  'emp.salaryPh': ['1 500 000', '1,500,000'],
  'emp.salaryType': ['Turi', 'Type'],
  'salType.MONTHLY': ['Oylik', 'Monthly'],
  'salType.DAILY': ['Kunlik', 'Daily'],
  'salType.PER_PIECE': ['Ishbay', 'Per piece'],
  'emp.sharedLabel': ['Ikkala biznesda ishlaydi', 'Works in both businesses'],
  'emp.sharedHint': [
    'Oyligi umumiy xarajat bo‘lib taqsimlanadi',
    'Their salary is split as a shared expense',
  ],
  'emp.added': ['Ishchi «{name}» qo‘shildi.', 'Employee “{name}” has been added.'],
  'emp.submit': ['Ishchi qo‘shish', 'Add employee'],
} as const satisfies Record<string, Msg>;
