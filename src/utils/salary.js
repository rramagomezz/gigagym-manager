// Calcula el pago por horas trabajadas
export function calcWorkPay(logs, employee) {
  let normal = 0
  let holiday = 0

  for (const log of logs) {
    if (log.is_holiday) {
      holiday += log.hours * employee.holiday_rate
    } else {
      normal += log.hours * employee.hourly_rate
    }
  }

  return { normal, holiday, total: normal + holiday }
}

// Calcula el bono por clase
export function calcClassBonus(log, classType) {
  const extra = log.students_count > classType.bonus_threshold
    ? classType.bonus_extra
    : 0
  return log.hours * (classType.base_bonus + extra)
}

// Calcula el total de clases de un empleado
export function calcClassPay(classLogs, classTypes) {
  let total = 0
  for (const log of classLogs) {
    const classType = classTypes.find(ct => ct.id === log.class_type_id)
    if (classType) total += calcClassBonus(log, classType)
  }
  return total
}

// Resumen completo del sueldo
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

// Formatea números como moneda argentina
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount)
}
