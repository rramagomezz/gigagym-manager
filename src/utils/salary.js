function getLogHours(log) {
  if (log.duration_minutes != null) return log.duration_minutes / 60
  return Number(log.hours) || 0
}

export function calcWorkPay(logs, employee) {
  let normal = 0
  let holiday = 0
  for (const log of logs) {
    const hours = getLogHours(log)
    if (log.is_holiday) holiday += hours * employee.holiday_rate
    else normal += hours * employee.hourly_rate
  }
  return { normal, holiday, total: normal + holiday }
}

export function calcClassBonus(log, classType) {
  const extra = log.students_count > classType.bonus_threshold ? classType.bonus_extra : 0
  return log.hours * (classType.base_bonus + extra)
}

export function calcClassPay(classLogs, classTypes) {
  let total = 0
  for (const log of classLogs) {
    const classType = classTypes.find(ct => ct.id === log.class_type_id)
    if (classType) total += calcClassBonus(log, classType)
  }
  return total
}

export function calcSalary(employee, workLogs, classLogs, classTypes) {
  const work = calcWorkPay(workLogs, employee)
  const classPay = calcClassPay(classLogs, classTypes)
  return {
    normalPay: work.normal,
    holidayPay: work.holiday,
    classPay,
    total: work.normal + work.holiday + classPay
  }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}h ${m}m`
}
